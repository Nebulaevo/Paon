import { useCallback } from "react"
import { useRouter, type BaseLocationHook } from "wouter"
import { useBrowserLocation } from "wouter/use-browser-location"

import { RelativeURL } from "@core:utils/url/v1/utils"
import { useLoadingSetters } from "@core:hooks/use-loading-state/v1/hook"

import { useRouterSettings } from "../use-router-settings"
import { usePageProps } from "../use-page-props"

import navigationTarget from './internal/navigation-target'
import { preloadPage, findMatchingPageData } from "./internal/helpers"

/** Options expected by wouter `useBrowserLocation` hook */
type useBrowserLocationOptions_T = Parameters<typeof useBrowserLocation>[0]

/** Arguments expected by navigation function returned by wouter `useBrowserLocation` hook */
type navigateFuncArgs_T = Parameters<ReturnType<typeof useBrowserLocation>[1]>


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
    const { 
        getPageProps, 
        silentlyResetPageProps, 
        abortPendingPagePropsRequest 
    } = usePageProps()
    
    const {activateLoading, deactivateLoading} = useLoadingSetters()

    const delayedNavigate = useCallback((...args: navigateFuncArgs_T) => {
        
        const [ to ] = args // url we are navigating to

        // No error handling: if it fails it should all crash
        const currentUrl = new RelativeURL(window.location.href)

        // ℹ️ Remark:
        // As opposed to currentUrl, 
        // we do not trust targetUrl to be valid
        const targetUrl = RelativeURL.parse(
            to instanceof URL ? to.toString() : to, 
            undefined,
            {onPurifyFail:'ERROR'}
        )
        
        // if parsing of target url failed we cancel the navigation attempt
        if (!targetUrl) return

        const targetUrlId = targetUrl.asId({includeHash:true})
        const currentUrlId = currentUrl.asId({includeHash:true})
        
        // Preventing double history entries
        // - if that taget url is already being scheduled for navigation: we ignore
        if (navigationTarget.is(targetUrl)) return

        // - if navigation request targets current page
        if (targetUrlId===currentUrlId) {

            // if another navigation was scheduled, we cancel it
            if (navigationTarget.exists()) {
                // we do not want to reset page props
                abortPendingPagePropsRequest()
                navigationTarget.reset()
                deactivateLoading()
            }

            // we prevent execution of the navigation logic
            return 
        }

        // we only trigger delayed navigation for new
        // relative URL pathname 
        // (search changes have to be handled by page)
        if (currentUrl.normalizedPath!==targetUrl.normalizedPath){
            const timer = setTimeout(() => {
                if (navigationTarget.is(targetUrl)) {
                    activateLoading()
                }
            }, loaderOptions.pagePreFetchLoaderOpts.timeoutMs)

            navigationTarget.set(targetUrl)

            // reseting eventual page props 
            // and cancelling eventual hanging fetch
            abortPendingPagePropsRequest()
            silentlyResetPageProps()
            
            const pageData = findMatchingPageData({
                url: targetUrl, pages, parser
            })
            
            preloadPage({
                url: targetUrl,
                pageData,
                getPagePropsHook: getPageProps
            })
            .then(() => { 
                if (navigationTarget.is(targetUrl)) {
                    navigationTarget.reset()
                    navigate(...args)
                    clearTimeout(timer)
                    deactivateLoading()
                } 
            })
        } else {
            navigationTarget.reset()
            navigate(...args)
            deactivateLoading()
        }

    }, [])

    return [location, delayedNavigate]
}

export { useDelayedRouteTransition }