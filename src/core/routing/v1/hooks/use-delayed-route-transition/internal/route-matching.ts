import { matchRoute, type Parser } from "wouter"
import type { RelativeUrl } from "url-toolbox"

import type { RouterSettings_T, pageData_T } from "@core:routing/v1/hooks/use-router-settings/hook"


type findingPageDataMatchKwargs_T = {
    url: RelativeUrl,
    pages: RouterSettings_T['pages'],
    parser: Parser,
}

/** Finds the pageData entry (route) matching the given url
 * (using Wouter's `matchRoute` function)
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
    const { pages, url, parser } = kwargs

    // Remark 1: 
    // matchRoute expects pathname not a full relative URL
    // if search or hash is present, the route matching will give incorrect results
    // 
    // Remark 2: 
    // with current implementation, urls containing special characters like : "/othér/:id/" will work,
    // but urls contains encoded characters like : "/oth%C3%A9r/:id/" will fail.
    // but there is very little reason to support that kind of pattern, 
    // and as the router patterns are static, we just don't need to handle that case.
    
    for ( const pageData of pages ) {
        const [ match ] = matchRoute(
            parser, 
            pageData.path,
            url.pathname,
            // Remark: 
            // the last argument (loose: boolean) allows for partial match (used for nested routes matching)
            // and in our case should stay false because we want a full match
            false // false -> not 'loose' 
        )
        if (match) return pageData
    }

    return undefined
}

export { findMatchingPageData }

export type { findingPageDataMatchKwargs_T }