import { isNumber, type Dict_T } from "sniffly"

// import { InitialPropsContext, canUseInitialPageProps } from "@core:hooks/use-intial-props/v1/context"
import { getIdFromRelativeUrl } from '@core:utils/url-parsing/v1/utils'
import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import { getExpiryDate, hasExpired } from '@core:utils/date/v1/expiry-dates'

type pageProps_T = Dict_T<unknown>

type propsFetcher_T = (url:string, abortController:AbortController) => Promise<pageProps_T>

type PagePropsFetcherKwargs_T = {
    fetcher: propsFetcher_T,
    cacheTimeS: number
}

type cacheEntry_T = {
    expiryDate: Date,
    data: pageProps_T
}

class PagePropsFetcher {

    //-----------------------------------------------------------
    //                          CLASS
    //-----------------------------------------------------------
    // ---------- Common abort controller ----------
    static #abortController: AbortController | undefined = undefined

    static abortCurrentRequest() {
        this.#abortController?.abort()
        this.#abortController = undefined
    }

    static getAbortController(): Readonly<AbortController> {
        if (
            !this.#abortController
            || this.#abortController.signal.aborted
        ){
            this.#abortController = new AbortController()
        }

        return this.#abortController
    }

    // ---------- Caching logic ----------
    // ⚠️ it's important to disable the caching on server
    // to avoid memory leak
    static #cache: {[url:string]: cacheEntry_T} = {}
    static #maxCacheSize: number = isExecutedOnClient() ? 100 : 0
    static #deleteChunkSize: number = 15
    
    static #isFreshCacheEntry(cacheEntry: cacheEntry_T): boolean {
        return !hasExpired(cacheEntry.expiryDate)
    }
    static #cleanOutdatedCacheEntries() {
        const outdatedKeys = Object.keys(this.#cache).filter(
            (key) => !this.#isFreshCacheEntry(this.#cache[key])
        )
        for (const key of outdatedKeys) {
            this.#cache[key]
        }
    }

    /** Deletes cache entries until cache is at max length 
     * starting with entries that have the less time remaining */
    static #limitCacheSize() {
        const cacheKeys = Object.keys(this.#cache)
        if (cacheKeys.length>this.#maxCacheSize) {
            // we order keys from old to fresh
            // (the less time left first)
            cacheKeys.sort((keyA, keyB) => {
                const expiryDateA = this.#cache[keyA].expiryDate.getTime()
                const expiryDateB = this.#cache[keyB].expiryDate.getTime()
                return expiryDateA-expiryDateB
            })

            const excessKeys = cacheKeys.slice(0, this.#deleteChunkSize)
            for (const key of excessKeys) delete this.#cache[key]
        }
    }

    /** PUBLIC: Sets the max length of the shared cache dictionnary 
     * 
     * (Minimum is 10, if smaller it will be set to 10)
     * (will adjust deleteChunkSize to be no more than half)
    */
    static setMaxCacheSize(maxSize:number) {
        if (isExecutedOnClient() && isNumber(maxSize)) {
            // ⚠️ IMPORTANT
            // As the max deleteChunkSize is half the maxCacheSize, 
            // the logical absolute minimum for maxCacheSize is 2
            if (maxSize<10) this.#maxCacheSize = 10
            else this.#maxCacheSize = maxSize
        }
        // we make sure the deleteChunkSize is not bigger than half
        // the maxCacheSize
        const max = Math.round(this.#maxCacheSize/2)
        if ( this.#deleteChunkSize > max ) {
            this.#deleteChunkSize = max
        }
    }

    /** PUBLIC: Sets the number of entries to delete everytime the cache is at max capacity 
     * 
     * (The chunk size is forced between 1 and half the max cache size)
    */
    static setDeleteChunkSize(chunkSize:number) {
        const max = Math.round(this.#maxCacheSize/2)
        if (isExecutedOnClient() && isNumber(chunkSize)) {
            if ( chunkSize<1 ) this.#deleteChunkSize = 1 
            else if ( chunkSize>max ) this.#deleteChunkSize = max
            else this.#deleteChunkSize = chunkSize
        }
    }

    /** PUBLIC: get corresponding cache entry */
    static getCacheEntry(url:string) {
        const key = getIdFromRelativeUrl(url)
        if (isExecutedOnClient() && this.#cache[key]) {
            const isFresh = this.#isFreshCacheEntry(this.#cache[key])
            if (isFresh) return this.#cache[key]
            else delete this.#cache[key]
        }

        return undefined
    }

    /** PUBLIC: save a cache entry */
    static setCacheEntry(url:string, cacheEntry:cacheEntry_T) {
        const key = getIdFromRelativeUrl(url)
        if (isExecutedOnClient()) {
            this.#cleanOutdatedCacheEntries()
            const cacheKeys = Object.keys(this.#cache)
            if (cacheKeys.length>this.#maxCacheSize) {
                this.#limitCacheSize()
            }
            this.#cache[key] = cacheEntry
        }
    }

    //-----------------------------------------------------------
    //                         INSTANCE
    //-----------------------------------------------------------
    #fetcher: propsFetcher_T
    #cacheTimeMS: number

    constructor(kwargs: PagePropsFetcherKwargs_T) {
        const {fetcher, cacheTimeS} = kwargs
        
        this.#fetcher = fetcher
        this.#cacheTimeMS = isNumber(cacheTimeS, {min:0})
            ? cacheTimeS*1000
            : 0
    }

    #cachingAllowed() {
        return this.#cacheTimeMS>0 && isExecutedOnClient()
    }

    #saveToCache(key:string, value: pageProps_T) {
        if (this.#cachingAllowed()) {
            PagePropsFetcher.setCacheEntry(key, {
                expiryDate: getExpiryDate(this.#cacheTimeMS),
                data: value
            })
        }
    }

    async fetch(url:string): Promise<pageProps_T> {
        // start fetching by sending 
        // an abort signal to all instances of PagePropsFetcher
        PagePropsFetcher.abortCurrentRequest()

        // WE DO NOT CATCH ERRORS AT THIS LEVEL
        // -> Errors are catched at the 'usePageProps' level (above),
        // this way we can directly get errors thrown by
        // the custom "this.#fetcher" there
        const abortController = PagePropsFetcher.getAbortController()
        return this.#fetcher(url, abortController)
            .then(result => {
                this.#saveToCache(url, result)
                return result
            })
    }

    getFromCache(url:string): pageProps_T | undefined {
        if (!this.#cachingAllowed()) return undefined
        return PagePropsFetcher.getCacheEntry(url)?.data
    }
}

export { PagePropsFetcher }
