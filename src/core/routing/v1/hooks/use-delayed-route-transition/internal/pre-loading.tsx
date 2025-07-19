import { RelativeURL } from "@core:utils/url/v1/utils"
import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import type { pageData_T } from "@core:routing/v1/hooks/use-router-settings/hook"
import type { usePageProps } from "@core:routing/v1/hooks/use-page-props/hook"


import lazyComponentPreloading from './lazy-page-preloading'
import { 
    findMatchingPageData, 
    type findingPageDataMatchKwargs_T 
} from './route-matching'


type pagePreLoadingKwargs_T = {
    url: RelativeURL,
    pageData?: pageData_T,
    getPagePropsHook: ReturnType<typeof usePageProps>['getPageProps']
}


let INITIAL_COMPONENT_MARKED_AS_LOADED = false

function markInitialComponentAsLoaded(kwargs: Omit<findingPageDataMatchKwargs_T, 'url'>) {
    if (isExecutedOnClient() && !INITIAL_COMPONENT_MARKED_AS_LOADED) {
        INITIAL_COMPONENT_MARKED_AS_LOADED = true

        const url = new RelativeURL(window.location.href)
        
        const pageData = findMatchingPageData({...kwargs, url})
        if (pageData?.importComponent) {
            lazyComponentPreloading.markAsLoaded(pageData.Component)
        }
    }
}

/** Asynchronous function preloading ressources for a page
 * 
 * It will pre-import the component if the page component is lazy,
 * and pre-fetch the page props if a propsFetcher is provided for that route.
 * 
 * @param kwargs.url the url we are pre-fetching for (propsFetcher call has to be given the url)
 * 
 * @param kwargs.pageData the pageData dictionary for the route we want to pre-load
 * 
 * @param kwargs.getPagePropsHook the getPageProps function from usePageProps context hook (used as an interface for fetching props)
 */
async function preloadPage(kwargs: pagePreLoadingKwargs_T) {
    const {url, pageData, getPagePropsHook} = kwargs
    const promises: Promise<any>[] = []

    if (!pageData) return

    const { Component, importComponent, propsFetcher } = pageData

    // We make sure the component is preloaded only once
    if (
        importComponent // means the component is lazy
        && !lazyComponentPreloading.hasBeenLoaded(Component)
    ) {
        promises.push( importComponent() 
            .then(() => lazyComponentPreloading.load(Component))
        )
    }

    // remark:
    // it is possible that data preloading cache becomes stale by the time
    // the page component is rendered (if it was near finish)
    // so it's important that page itself doesn't rely on the data being ready
    if (propsFetcher) {
        const [ state, resultTuple ] = getPagePropsHook(
            url, propsFetcher
        )
        if (state==="FETCHING") {
            promises.push(resultTuple)
        }
    }
    

    if (promises) {
        console.log('pre loading promises')
        console.log(promises)
        await Promise.all(promises)
    }
}

export { markInitialComponentAsLoaded, preloadPage }