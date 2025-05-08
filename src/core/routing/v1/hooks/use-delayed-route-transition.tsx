import { useCallback } from "react"
import { matchRoute, useRouter, type BaseLocationHook, type Parser } from "wouter"
import { useBrowserLocation } from "wouter/use-browser-location"

import { getIdFromRelativeUrl, getPathname } from "@core:utils/url-parsing/v1/utils"
import { useLoadingSetters } from "@core:hooks/use-loading-state/v1/hook"

import { PagePropsFetcher } from "../utils/page-props-fetcher"
import { useRouterSettings } from "./use-router-settings"
import type { RouterSettings_T, pageData_T } from "./use-router-settings"
import { usePageProps } from "./use-page-props"

/** Options expected by wouter `useBrowserLocation` hook */
type useBrowserLocationOptions_T = Parameters<typeof useBrowserLocation>[0]

/** Arguments expected by navigation function returned by wouter `useBrowserLocation` hook */
type navigateFuncArgs_T = Parameters<ReturnType<typeof useBrowserLocation>[1]>

type findingPageDataMatchKwargs_T = {
    url: string,
    pages: RouterSettings_T['pages'],
    parser: Parser,
}

type pagePreLoadingKwargs_T = {
    url: string,
    pageData?: pageData_T,
    getPagePropsHook: ReturnType<typeof usePageProps>['getPageProps']
}

// ----------------------------------
// ---- ACTIVE NAVIGATION TARGET ----
// ----------------------------------
// 🔧 BUG FIX: 
// Taking into account active navigation target into navigation handling.
// Storing a global 'nagivation target' url allows us to:
// - prevent multiple navigation promises to be queued up (only last one is active)
// - prevent overriden navigation requests to perform certain actions
// - prevent multiple navigation requests with the same target to be initiated
const _activeNavigationTarget: {current?:string} = {
    current: undefined
}

/** sets value of _activeNavigationTarget.current 
 * 
 * (sets it straight to a url Id for easier future comparison)
*/
function _setActiveNavigationTarget( targetUrl:string ) {
    _activeNavigationTarget.current = getIdFromRelativeUrl(
        targetUrl, {includeHash:true}
    )
}

/** resets value of _activeNavigationTarget.current to undefined */
function _resetActiveNavigationTarget() {
    _activeNavigationTarget.current = undefined
}

/** returns true if an active navigation target is set */
function _existsActiveNavigationTarget(): boolean {
    return !!_activeNavigationTarget.current
}

/** compares the given target url (by converting it to a url id) with the value of _activeNavigationTarget.current */
function _isActiveNavigationTarget( targetUrl:string ): boolean {
    if (!_activeNavigationTarget.current) return false
    const targetUrlId = getIdFromRelativeUrl(
        targetUrl, 
        {includeHash:true}
    )
    return _activeNavigationTarget.current===targetUrlId
}


/** Finds the pageData entry (route) matching the given url
 * (mainly using Wouter's `matchRoute` function)
 * 
 * @param kwargs.url the url that have to be matched
 * 
 * @param kwargs.pages the list of pageData entries
 * 
 * @param kwargs.parser the parser instance used by the wouter router for matching (`matchRoute` function needs it)
 * 
 * @returns a "pageData" dictionnary, or undefined if not found
 */
function _findMatchingPageData(kwargs:findingPageDataMatchKwargs_T): pageData_T | undefined {
    const { pages, parser } = kwargs

    // 🔧 Bug fix: matchRoute expects pathname not a full relative URL
    // if search or hash is present, the route matching will give incorrect results
    const pathname = getPathname(kwargs.url)
    
    for ( const pageData of pages ) {
        // Remark: 
        // the last argument (loose: boolean) allows for partial match (used for nested routes matching)
        // and in our case should stay false because we want a full match
        const [ match ] = matchRoute(parser, pageData.path, pathname, false) // false -> not 'loose' 
        if (match) return pageData
    }

    return undefined
}

/** Asynchronous function preloading ressources for a page
 * 
 * It will pre-import the component if the page component is lazy,
 * and pre-fetch the page props if a propsFetcher is provided for that route.
 * 
 * @param kwargs.url the url we are pre-fetching for (propsFetcher call has to be given the url)
 * 
 * @param kwargs.pageData the pageData dictionnary for the route to pre-load
 * 
 * @param kwargs.getPagePropsHook the getPageProps function from usePageProps context hook (used as an interface for fetching props)
 */
async function _preloadPage(kwargs: pagePreLoadingKwargs_T) {
    const {url, pageData, getPagePropsHook} = kwargs
    const promises: Promise<any>[] = []

    if (pageData) {
        const { importComponent, propsFetcher } = pageData
        if (importComponent) {
            promises.push( importComponent() )
        }

        // remark:
        // it is possible that data preloading cache becomes stale by the time
        // the page component is rendered (if it was near finish)
        // so it's important that page itself doesn't rely on the data being ready
        if (propsFetcher) {
            const [ state, resultTuple ] = getPagePropsHook(
                url,
                propsFetcher
            )
            if (state==="FETCHING") {
                promises.push(resultTuple)
            }
        }
    }

    if (promises) await Promise.all(promises)
}

/** Custom hook for Wouter Router allowing delayed route transition 
 * 
 * On navigation, it will try to preload the component and props 
 * needed for the page before triggering the navigation
 * 
 * @param opts options for the built-in Wouter `useBrowserLocation` hook
 * 
 * @returns [location, delayedNavigate]
 */
const useDelayedRouteTransition: BaseLocationHook = (opts: useBrowserLocationOptions_T) => {
    
    const [ location, navigate ] = useBrowserLocation(opts)
    const { parser } = useRouter()
    const { pages, loaderOptions } = useRouterSettings()
    const { getPageProps, silentlyResetPageProps } = usePageProps()
    
    const {activateLoading, deactivateLoading} = useLoadingSetters()

    const delayedNavigate = useCallback((...args:navigateFuncArgs_T) => {
        
        const [ to ] = args // url we are navigating to
        
        const targetUrl = to instanceof URL ? to.toString() : to
        const currentUrl = window.location.href

        const targetUrlId = getIdFromRelativeUrl(targetUrl, {includeHash:true})
        const currentUrlId = getIdFromRelativeUrl(currentUrl, {includeHash:true})
        
        // Preventing double history entries
        // - if that taget url is already being scheduled for navigation: we ignore
        if (_isActiveNavigationTarget(targetUrl)) return

        // - if navigation request targets current page
        if (targetUrlId===currentUrlId) {

            // if another navigation was scheduled, we cancel it
            if (_existsActiveNavigationTarget()) {
                // we do not want to reset page props
                PagePropsFetcher.abortCurrentRequest()
                _resetActiveNavigationTarget()
                deactivateLoading()
            }

            // we prevent execution of the navigation logic
            return 
        }

        // we only trigger delayed navigation for new
        // relative URL pathname 
        // (search changes have to be handled by page)
        if (getPathname(currentUrl)!==getPathname(targetUrl)){
            const timer = setTimeout(() => {
                if (_isActiveNavigationTarget(targetUrl)) {
                    activateLoading()
                }
            }, loaderOptions.pagePreFetchLoaderOpts.timeoutMs)

            _setActiveNavigationTarget(targetUrl)

            // reseting eventual page props 
            // and cancelling eventual hanging fetch
            PagePropsFetcher.abortCurrentRequest()
            silentlyResetPageProps()
            
            const pageData = _findMatchingPageData({
                url: targetUrl, pages, parser
            })

            _preloadPage({
                url: targetUrl,
                pageData,
                getPagePropsHook: getPageProps
            })
            .then(() => { 
                if (_isActiveNavigationTarget(targetUrl)) {
                    _resetActiveNavigationTarget()
                    navigate(...args)
                    clearTimeout(timer)
                    deactivateLoading()
                } 
            })
        } else {
            _resetActiveNavigationTarget()
            navigate(...args)
            deactivateLoading()
        }

    }, [])

    return [location, delayedNavigate]
}

export { useDelayedRouteTransition }