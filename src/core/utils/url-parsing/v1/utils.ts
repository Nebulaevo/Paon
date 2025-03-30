type urlFilteringOptions = {
    ignoreSearch?: boolean,
    ignoreHash?: boolean
}

function _asUrlObj( url:string ): URL {
    return new URL(url, 'http://dummy.com')
}

function splitRelativeUrl( 
    url:string 
): {pathname: string, search: string, hash: string} {
    const urlObj = _asUrlObj(url)
    return {
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash
    }
}

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

function getPathname( url: string ) {
    return getFilteredRelativeUrl(url, {ignoreSearch: true, ignoreHash: true})
}


function getRelativeUrl( url:string ) {
    return getFilteredRelativeUrl(url)
}

export {
    splitRelativeUrl,
    getFilteredRelativeUrl,
    getPathname,
    getRelativeUrl
}