import { isNumber } from 'sniffly'

import type { 
    cachingOpts_T, 
    fetchJsonOpts_T, 
    partialCachingOpts_T, 
    partialFetchJsonOpts_T 
} from './types'


/** Function taking in a partial cachingOpts object, 
 * and returning a complete cachingOpts object with all the defaults values 
 * (depending on the caching strategy)
 */
function _extractCachingOptions<DataType_T>(cachingOpts?: partialCachingOpts_T<DataType_T>): cachingOpts_T<DataType_T> {
    cachingOpts = cachingOpts ?? {}
    
    if (cachingOpts.strategy === 'INVALIDATE_AND_FETCH') {
        const { strategy } = cachingOpts
        return {strategy}
    }

    // we make sure maxAgeS is not negative
    let {
        maxAgeS = 1*60*60 // default: 1 hours
    } = cachingOpts
    maxAgeS = isNumber(maxAgeS, {min:0}) ? maxAgeS : 0

    if (cachingOpts.strategy === 'STALE_WHILE_REVALIDATE') {
        const {
            strategy,
            cacheRefreshCallback
        } = cachingOpts

        // we make sure staleEntryMaxAgeS is not negative
        let {
            staleEntryMaxAgeS = 1*24*60*60, // default: 1 days
        } = cachingOpts
        staleEntryMaxAgeS = isNumber(staleEntryMaxAgeS, {min:0}) 
            ? staleEntryMaxAgeS 
            : 0

        return {
            strategy,
            maxAgeS,
            staleEntryMaxAgeS,
            cacheRefreshCallback
        }
    } 

    const {
        strategy = 'CACHE_FIRST',
    } = cachingOpts

    return {
        strategy,
        maxAgeS
    }
}

/** Helper returning a valid value for timeoutS */
function _extractTimeoutS(value: number | undefined) {
    if (isNumber(value, {min:2, max:5*60})) return value // min - 2s max 5min
    return 15 // 15s by default
}

/** Function taking in a partial fetchJsonOpts object, 
 * and returning a complete fetchJsonOpts object with all the defaults values  
 */
function extractFetchJsonOpts<DataType_T>(opts?: partialFetchJsonOpts_T<DataType_T>) : fetchJsonOpts_T<DataType_T> {
    
    return {
        cache: _extractCachingOptions(opts?.cache),
        dataValidators: opts?.dataValidators ?? [],
        timeoutS: _extractTimeoutS(opts?.timeoutS ), // 15s by default
        abortController: opts?.abortController ?? new AbortController(),
        retries: isNumber(opts?.retries, {min:1}) ? opts.retries : 2
    }
}

/** Function setting up defaults and forcing values before returning the requestInit object */
function extractRequestInit(requestInit: RequestInit | undefined, abortController: AbortController) {
    if (!requestInit) requestInit = {}

    // we include the abort controller signal
    requestInit.signal = abortController.signal

    // if no browser cache strategy is explicitly provided
    // we prevent use of browser cache (as caching is manually handled)
    if (!requestInit.cache) requestInit.cache = 'no-store'

    // if no redirection directive was given 
    // we refuse to follow redirects by default
    if (!requestInit.redirect) requestInit.redirect = 'error'

    // we set 'Accept' header to be 'application/json'
    const headers = new Headers( requestInit.headers ?? [] )
    headers.set('Accept', 'application/json')
    requestInit.headers = headers

    return requestInit
}

export {
    extractFetchJsonOpts,
    extractRequestInit
}