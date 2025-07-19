import { matchRoute, type Parser } from "wouter"

import { RelativeURL } from "@core:utils/url/v1/utils"
import type { RouterSettings_T, pageData_T } from "@core:routing/v1/hooks/use-router-settings/hook"


type findingPageDataMatchKwargs_T = {
    url: RelativeURL,
    pages: RouterSettings_T['pages'],
    parser: Parser,
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

export { findMatchingPageData }

export type { findingPageDataMatchKwargs_T }