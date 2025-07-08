import { isNumber } from "sniffly";

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util";
import type { EnhancedURL_T } from "@core:utils/url/v1/utils";

import type { staleWhileRevalidateOpts_T } from './types'

 
type setCacheEntryKwargs_T = {
    url: EnhancedURL_T,
    response: Response
}

type getCacheEntryOpts_T<DataType_T> = 
    Partial< Pick<
        staleWhileRevalidateOpts_T<DataType_T>,
        'maxAgeS' | 'staleEntryMaxAgeS'
    >>

type cacheSearchResult_T = {
    state: 'FRESH',
    response: Response
} | {
    state: 'STALE',
    response: Response
} | {
    state: 'NONE',
    response: undefined
}

const _CACHE_NAME = 'JSON-DATA-CACHE'
const _TIMESTAMP_HEADER_NAME = 'X-Cache-Entry-Creation-Timestamp'

/** Attempts to extract the creation timestamp header from the stored Response instance */
function _getTimestampFromCachedResponse(response: Response): number | undefined {
    try {
        const timestamp = parseInt(
            response.headers.get(_TIMESTAMP_HEADER_NAME) ?? 'NaN'
        )

        if (!isNumber(timestamp, {positive:true})) { // filters NaN out
            throw new Error("couldn't find creation timestamp in cached response")
        }

        return timestamp
    } catch (_e) {
        return undefined
    }
}

/** Creates a new Response object with an additionnal header 
 * storing a timestamp of the cache entry creation time.
 * */
async function _formatCachedResponse(response: Response): Promise<Response> {
    
    const body = await response.text()
    const headers = new Headers(response.headers)
    headers.set(
        _TIMESTAMP_HEADER_NAME, 
        Date.now().toString()
    )

    const cachedResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    })

    return cachedResponse
}

/** Returns true if execution context is client and caches API is available */
function _canUseCache() {
    return isExecutedOnClient() && 'caches' in window
}

/** Creates or updates a cache entry for given url */
async function set(kwargs: setCacheEntryKwargs_T) {
    const {
        url,
        response
    } = kwargs

    if (!_canUseCache() || !response.ok) return

    const [formattedResponse, cache] = await Promise.all([
        _formatCachedResponse(response),
        caches.open(_CACHE_NAME)
    ])

    await cache.put(url.asId(), formattedResponse)
}

/** Retrieves the corresponding cache entry if it exists 
 * 
 * (if an entry is found but it exceeds the maxAgeS and the staleEntryMaxAgeS we delete that cache entry)
*/
async function get<DataType_T>(
    url: EnhancedURL_T, 
    options?: getCacheEntryOpts_T<DataType_T>
): Promise<cacheSearchResult_T> {

    const {
        maxAgeS = 0,
        staleEntryMaxAgeS = 0
    } = options ?? {}
    
    if (_canUseCache()) return {state: 'NONE', response: undefined}

    const urlID = url.asId()
    const cache = await caches.open(_CACHE_NAME)

    const cachedReponse = await cache.match(urlID)
    if (!cachedReponse) return {state: 'NONE', response: undefined}

    const entryTimestamp = _getTimestampFromCachedResponse(cachedReponse)
    if (!entryTimestamp) {
        // if timestamp is invalid on cache entry, the entry is invalid
        await cache.delete(urlID)
        return {state: 'NONE', response: undefined}
    }

    // we calculate the age and convert to seconds
    const entryAgeS = Math.round( (Date.now() - entryTimestamp)/1000 )

    // we return the result and the state
    if (entryAgeS <= maxAgeS) {
        return {state: 'FRESH', response: cachedReponse}

    } else if (entryAgeS <= (maxAgeS+staleEntryMaxAgeS)) {
        return {state: 'STALE', response: cachedReponse}
    
    } else {
        await cache.delete(urlID)
        return {state: 'NONE', response: undefined}
    }
}

/** Deletes the corresponding cache entry if it exists */
async function remove(url: EnhancedURL_T) {
    if (!_canUseCache()) return

    const cache = await caches.open(_CACHE_NAME)
    await cache.delete(url.asId())
}

export default {
    set,
    get,
    remove
}