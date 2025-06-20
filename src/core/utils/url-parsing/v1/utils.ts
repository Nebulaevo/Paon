import { isBool } from "sniffly"

type urlFilteringOptions = {
    ignoreSearch?: boolean,
    ignoreHash?: boolean
}

type urlIdOptions = {
    includeHash: boolean
}

function _asUrlObj( url:string ): URL {
    return new URL(url, 'http://dummy.com')
}

/** Returns object containing different parts of parsed relative URL */
function splitRelativeUrl( 
    url:string 
): {pathname: string, search: string, searchParams: URLSearchParams, hash: string} {
    const urlObj = _asUrlObj(url)
    return {
        pathname: urlObj.pathname,
        search: urlObj.search,
        searchParams: urlObj.searchParams,
        hash: urlObj.hash
    }
}

/** Removes selected section from a relative URL (hash or search) */
function getFilteredRelativeUrl( url: string, options?:urlFilteringOptions ) {
    const urlObj = _asUrlObj( url )

    const {ignoreSearch, ignoreHash} = options ?? {}

    const urlSearch = ignoreSearch
        ? ''
        : urlObj.search

    const urlHash = ignoreHash
        ? ''
        : urlObj.hash

    return urlObj.pathname + urlSearch + urlHash
}

/** Returns only pathname */
function getPathname( url: string ) {
    return getFilteredRelativeUrl(url, {ignoreSearch: true, ignoreHash: true})
}

/** Returns the url as a relative URL */
function getRelativeUrl( url:string ) {
    return getFilteredRelativeUrl(url)
}

/** Attempts to make URLs easier to compare by sorting URL search query keys */
function getIdFromRelativeUrl( url:string, options?:urlIdOptions ) {
    
    const includeHash = isBool(options?.includeHash)
        ? options.includeHash
        : false
     
    const {pathname, searchParams, hash} = splitRelativeUrl(url)
    const searchKeys = Array.from(searchParams.keys()).sort()

    let sortedSearchString = ''
    for (const key of searchKeys) {
        if (sortedSearchString.length) sortedSearchString += '&'
        else sortedSearchString += '?'
        sortedSearchString += `${key}=${searchParams.get(key)}`
    }

    let urlId = pathname+sortedSearchString
    if (includeHash) {
        urlId += hash
    }

    return urlId
}

export {
    splitRelativeUrl,
    getFilteredRelativeUrl,
    getPathname,
    getRelativeUrl,
    getIdFromRelativeUrl
}