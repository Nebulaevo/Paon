import { matchRoute, type Parser } from "wouter"

import { RelativeURL } from "@core:utils/url/v1/utils"

import type { RouterSettings_T, pageData_T } from "../../use-router-settings"
import { usePageProps } from "../../use-page-props"



type findingPageDataMatchKwargs_T = {
    url: RelativeURL,
    pages: RouterSettings_T['pages'],
    parser: Parser,
}

type pagePreLoadingKwargs_T = {
    url: RelativeURL,
    pageData?: pageData_T,
    getPagePropsHook: ReturnType<typeof usePageProps>['getPageProps']
}

/** Finds the pageData entry (route) matching the given url
 * (mainly using Wouter's `matchRoute` function)
 * 
 * @param kwargs.url a ReltiveURL instance that have to be matched
 * 
 * @param kwargs.pages the list of pageData entries
 * 
 * @param kwargs.parser the parser instance used by the wouter router for matching (`matchRoute` function needs it)
 * 
 * @returns a "pageData" dictionary, or undefined if not found
 */
function findMatchingPageData(kwargs:findingPageDataMatchKwargs_T): pageData_T | undefined {
    const { pages, parser } = kwargs

    // 🔧 Bug fix: matchRoute expects pathname not a full relative URL
    // if search or hash is present, the route matching will give incorrect results
    // 
    // 🔧 Bug fix 2: We need to decode the pathname before trying 
    // to match it with the routes patterns, as it may contain encoded characters.
    // Remark: 
    // This method is a naive simple fix allowing to have special characters in URLs.
    // It will fail if pageData pattern is an encoded URL like "/oth%C3%A9r/:id/",
    // but there is very little reason to have that kind of pattern, 
    // and the router patterns are static so we just do not handle that case.
    const decodedTargetPathname = decodeURI(kwargs.url.pathname)

    for ( const pageData of pages ) {
        // Remark: 
        // the last argument (loose: boolean) allows for partial match (used for nested routes matching)
        // and in our case should stay false because we want a full match
        const [ match ] = matchRoute(
            parser, 
            pageData.path,
            decodedTargetPathname, 
            false // false -> not 'loose' 
        )
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
 * @param kwargs.pageData the pageData dictionary for the route we want to pre-load
 * 
 * @param kwargs.getPagePropsHook the getPageProps function from usePageProps context hook (used as an interface for fetching props)
 */
async function preloadPage(kwargs: pagePreLoadingKwargs_T) {
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
                url, propsFetcher
            )
            if (state==="FETCHING") {
                promises.push(resultTuple)
            }
        }
    }

    if (promises) {
        const [a, b] = await Promise.all(promises)
        console.log('Preload promise A')
        console.log(a)
        console.log('Preload promise B')
        console.log(b)
    }
}

export {
    findMatchingPageData,
    preloadPage
}