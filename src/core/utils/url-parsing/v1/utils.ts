function _asUrlObj( url:string ): URL {
    return new URL(url, 'http://dummy.com')
}

function getPathname( url: string ) {
    const urlObj = _asUrlObj( url )
    return urlObj.pathname
}

function getRelativeUrl( url:string ) {
    const urlObj = _asUrlObj( url )
    return urlObj.pathname + urlObj.search + urlObj.hash
}

export {
    getPathname,
    getRelativeUrl
}