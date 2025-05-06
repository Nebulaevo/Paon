import { useCallback } from "react"
import { matchRoute, useRouter, type BaseLocationHook, type Parser } from "wouter"; 
import { useBrowserLocation } from "wouter/use-browser-location"

import { getPathname } from "@core:utils/url-parsing/v1/utils"

import { useRouterSettings } from "./use-router-settings";
import type { RouterSettings_T, pageData_T } from "./use-router-settings"
import {usePageProps} from "./use-page-props"
import { PagePropsFetcher } from "../utils/page-props-fetcher";
import { useLoadingSetters } from "@core:hooks/use-loading-state/v1/hook";

type useBrowserLocationOptions_T = Parameters<typeof useBrowserLocation>[0]

type navigateFunc_T = ReturnType<typeof useBrowserLocation>[1]
type navigateFuncArgs_T = Parameters<navigateFunc_T>

type findingPageDataMatchKwargs_T = {
    url: string,
    pages: RouterSettings_T['pages'],
    parser: Parser,
}

type pagePreLoadingKwargs = {
    url: string,
    pageData?: pageData_T,
    getPagePropsHook: ReturnType<typeof usePageProps>['getPageProps']
}

// 🔧 BUG FIX:
// prevent multiple navigation promises
// to be queued up by remembering the last one
// and allowing only it
const _navigationTarget = {
    current: ""
}

function _findMatchingPageData(kwargs:findingPageDataMatchKwargs_T): pageData_T | undefined {
    const { pages, parser } = kwargs

    // 🔧 Bug fix: matchRoute expects pathname not a full relative URL
    // if search or hash is present, the route matching will give incorrect results
    const pathname = getPathname(kwargs.url)
    
    for ( const pageData of pages ) {
        const [ match ] = matchRoute(parser, pageData.path, pathname, false) // false -> not 'loose' 
        if (match) return pageData
    }

    return undefined
}

async function _preloadPage(kwargs: pagePreLoadingKwargs) {
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

const useDelayedRouteTransition: BaseLocationHook = ( opts: useBrowserLocationOptions_T) => {
    
    const [ location, navigate ] = useBrowserLocation(opts)
    const { parser } = useRouter()
    const { pages, loaderOptions } = useRouterSettings()
    const { getPageProps, silentlyResetPageProps } = usePageProps()
    
    const {activateLoading, deactivateLoading} = useLoadingSetters()

    const delayedNavigate = useCallback((...args:navigateFuncArgs_T) => {
        
        const [ to ] = args // url we are navigating to
        const targetUrl = to instanceof URL ? to.toString() : to
        const currentUrl = window.location.href

        // we only trigger delayed navigation for new
        // relative URL pathname 
        // (search changes have to be handled by page)
        if (getPathname(currentUrl)!==getPathname(targetUrl)){
            const timer = setTimeout(() => {
                activateLoading()
            }, loaderOptions.pagePreFetchLoaderOpts.timeoutMs)

            _navigationTarget.current = targetUrl

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
                if (_navigationTarget.current===targetUrl) {
                    navigate(...args)
                    clearTimeout(timer)
                    deactivateLoading()
                } 
            })
        } else {
            navigate(...args)
        }

    }, [])

    return [location, delayedNavigate]
}

export default useDelayedRouteTransition