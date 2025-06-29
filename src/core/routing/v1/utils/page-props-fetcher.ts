import { isDict, isNumber, type Dict_T } from "sniffly"
import { parse as secureJsonParse } from 'secure-json-parse'

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import { getExpiryDate, hasExpired } from '@core:utils/date/v1/expiry-dates'
import type { EnhancedURL_T } from "@core:utils/url/v1/utils"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

type pageProps_T = Dict_T<unknown>

type propsFetcher_T = (url:string, abortController:AbortController) => Promise<Response>

type PagePropsFetcherKwargs_T = {
    fetcher: propsFetcher_T,
    cacheTimeS: number
}

type cacheEntry_T = {
    expiryDate: Date,
    data: pageProps_T
}

/** Class generating fetcher instances handling fetching and caching page props for a given url
 * 
 * ⚙️ This is used under the hood as a wrapper for the "props-fetching" function provided for a route,
 * providing an interface that can be easily used in the "usePageProps" hook.
*/
class PagePropsFetcher {

    //-----------------------------------------------------------
    //                          CLASS
    //-----------------------------------------------------------
    
    /** current abortController instance */
    static #abortController: AbortController | undefined = undefined
    
    /** Sends an abort signal on the current abortController if it exists */
    static abortCurrentRequest() {
        this.#abortController?.abort()
        this.#abortController = undefined
    }
    
    /** Returns a non-aborted instance of abortController */
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
    
    /** returns false if cache entry has expired */
    static #isFreshCacheEntry(cacheEntry: cacheEntry_T): boolean {
        return !hasExpired(cacheEntry.expiryDate)
    }

    /** deletes multiple cache entries */
    static #deleteEntries(keys:string[]) {
        for (const key of keys) delete this.#cache[key]
    }

    /** deletes all expired cache entries from cache */
    static #cleanOutdatedCacheEntries() {
        const cacheKeys = Object.keys(this.#cache)
        const outdatedKeys = cacheKeys.filter(key => {
            const entry = this.#cache[key]
            return !this.#isFreshCacheEntry(entry)
        })
        this.#deleteEntries(outdatedKeys)
    }

    /** If cache size is over designated limit, deletes a chunk of entries 
     * (starting with entries that have the less time remaining) 
    */
    static #limitCacheSize() {
        const cacheKeys = Object.keys(this.#cache)
        if (cacheKeys.length>=this.#maxCacheSize) {
            // we order keys from old to fresh
            // (the less time left first)
            cacheKeys.sort((keyA, keyB) => {
                const expiryDateA = this.#cache[keyA].expiryDate.getTime()
                const expiryDateB = this.#cache[keyB].expiryDate.getTime()
                return expiryDateA-expiryDateB
            })

            const excessKeys = cacheKeys.slice(0, this.#deleteChunkSize)
            this.#deleteEntries(excessKeys)
        }
    }

    /** PUBLIC: Sets the max length of the shared cache dictionary 
     * 
     * (Minimum is 10, if smaller it will be set to 10)
     * (will adjust deleteChunkSize to be no more than half the max cache size)
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
        if (this.#deleteChunkSize>max) {
            this.#deleteChunkSize = max
        }
    }

    /** PUBLIC: Sets the number of entries to delete everytime the cache is at max capacity 
     * 
     * (The chunk size is forced between 1 and half the max cache size)
    */
    static setDeleteChunkSize(chunkSize:number) {
        const min = 1
        const max = Math.round(this.#maxCacheSize/2)
        if (isExecutedOnClient() && isNumber(chunkSize)) {
            if ( chunkSize<min ) this.#deleteChunkSize = min 
            else if ( chunkSize>max ) this.#deleteChunkSize = max
            else this.#deleteChunkSize = chunkSize
        }
    }

    /** PUBLIC: get corresponding cache entry */
    static getCacheEntry(urlID:string) {
        if (isExecutedOnClient() && this.#cache[urlID]) {
            const isFresh = this.#isFreshCacheEntry(this.#cache[urlID])
            if (isFresh) {
                const cacheEntryDeepCopy = JSON.parse(JSON.stringify(this.#cache[urlID]))
                return cacheEntryDeepCopy
            }
            else delete this.#cache[urlID]
        }

        return undefined
    }

    /** PUBLIC: save a cache entry */
    static setCacheEntry(urlID:string, cacheEntry:cacheEntry_T) {
        if (isExecutedOnClient()) {
            this.#cleanOutdatedCacheEntries()
            this.#limitCacheSize()
            this.#cache[urlID] = cacheEntry
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

    /** returns true if a non-zero cache time has been set for that instance 
     * and the function is called on clien side
    */
    #cachingAllowed() {
        return this.#cacheTimeMS>0 && isExecutedOnClient()
    }

    /** creates a cache entry */
    #saveToCache(urlID:string, value: pageProps_T) {
        if (this.#cachingAllowed()) {
            PagePropsFetcher.setCacheEntry(urlID, {
                expiryDate: getExpiryDate(this.#cacheTimeMS),
                data: value
            })
        }
    }

    /** runs the provided fetching function */
    async fetch(url:EnhancedURL_T): Promise<pageProps_T> {
        // start fetching by sending 
        // an abort signal to all instances of PagePropsFetcher
        PagePropsFetcher.abortCurrentRequest()

        // WE DO NOT CATCH ERRORS AT THIS LEVEL
        // -> Errors are catched at the 'usePageProps' level (above),
        // this way we can directly get errors thrown by
        // the custom "this.#fetcher" there
        const abortController = PagePropsFetcher.getAbortController()
        return this.#fetcher(url.toString(), abortController)
            .then(response => response.text())
            .then(jsonString => {
                const result = secureJsonParse(jsonString, {protoAction:'error', constructorAction: 'error'})
                if (!isDict(result)) throw new ErrorStatus(ErrorStatus.TYPE_ERROR)
                this.#saveToCache(url.asId(), result)
                return result
            })
    }

    /** returns the cached data for provided url, or undefined */
    getFromCache(url:EnhancedURL_T): pageProps_T | undefined {
        if (!this.#cachingAllowed()) return undefined
        return PagePropsFetcher.getCacheEntry(url.asId())?.data
    }
}

export { PagePropsFetcher }
