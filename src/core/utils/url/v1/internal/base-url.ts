
type urlIdSegments_T = {
    host: string,
    pathname: string,
    orderedSearch: string,
    hash: string
}

type urlFilteringOptions_T = {
    ignoreSearch?: boolean,
    ignoreHash?: boolean
}

type asIdOpts_T = {
    includeHash: boolean
}

const BLANK_URL_STRING = 'about:blank' as const

/** Makes sure the pathname ends with '/' */
function _normalizePathname(pathname: string): string {
    return pathname.endsWith('/') ? pathname : pathname + '/'
}

/** Returns a URL search string where search dict keys are alphabetically ordered */
function _normalizeSearchParams(searchParams: URLSearchParams): string {
    
    const entries = Array.from(searchParams.entries()).sort(
        ([a, _a], [b, _b]) => a.localeCompare(b)
    )
    if (!entries.length) return ''

    // we use URLSearchParams to safely encode the ordered list of entries
    const sortedParams = new URLSearchParams(entries)
    return '?' + sortedParams.toString()
}

/** Returns a dictionnary containing standardised URL parts to allow for easier comparaison between URLS */
function _computeUrlIdSegments(urlObj: URL): urlIdSegments_T {

    const {host, hash} = urlObj

    /** normalising pathname: force end with '/' */
    const pathname = _normalizePathname( urlObj.pathname )

    /** normalising search: order keys */
    const orderedSearch = _normalizeSearchParams( urlObj.searchParams )

    return { host, pathname, orderedSearch, hash }
}

/** Private base URL class for AbsoluteURL and RelativeURL */
class _BaseURL extends URL {
    #idSegments: urlIdSegments_T | undefined
    
    constructor(url:string, base?:string) {
        super(url, base)
    }

    #getIdSegments(): urlIdSegments_T {
        if (!this.#idSegments) this.#idSegments = _computeUrlIdSegments(this)
        return this.#idSegments
    }

    /** Attempts to make URLs easier to compare by 
     * sorting URL search query keys 
     * and forcing a slash at the end of the pathname
     * (lazyly computes idSegments if asked for it)
     * 
     * (does not include hash by default)
    */
    asId(options?:asIdOpts_T): string {
        const includeHash = options?.includeHash ?? false
        const {host, pathname, orderedSearch, hash} = this.#getIdSegments()
        return `${host}${pathname}${orderedSearch}${includeHash ? hash : ''}`
    }

    /** pathname used in "asId" (to be compared with another URL pathname) */
    get normalizedPath() {
        const {pathname} = this.#getIdSegments()
        return pathname
    }

    /** Returns a url */
    filteredUrl(options: urlFilteringOptions_T): string {
        const {ignoreSearch=false, ignoreHash=false} = options
        return `${this.origin}${this.pathname}${ignoreSearch ? '' : this.search}${ignoreHash ? '' : this.hash}`
    }
}

export { _BaseURL, BLANK_URL_STRING }