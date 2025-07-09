import { ErrorStatus } from "@core:utils/error-status/v1/utils"
import type { EnhancedURL_T } from "@core:utils/url/v1/utils"

import caching from './internal/caching'
import shortcuts from "./internal/shortcuts"
import { extractFetchJsonOpts, extractRequestInit } from './internal/options-extraction'
import type { 
    fetchJsonOpts_T, 
    partialFetchJsonOpts_T, 
    accessAttemptResult_T 
} from './internal/types'


type fetchJsonDataOpts_T<DataType_T> = {
    requestInit?: Omit<RequestInit, 'signal' >,
    fetchJsonOpts?: partialFetchJsonOpts_T<DataType_T>,
}

type accessAttemptKwargs_T<DataType_T> = {
    url: EnhancedURL_T, 
    requestInit: RequestInit, 
    fetchJsonOpts: fetchJsonOpts_T<DataType_T>
}

/** Manually raise an `AbortError` if the state of the abortController is aborted 
 * 
 * (Useful because `AbortError` is raised only if fetch is called,
 * operations involving cache lookups will not raise an AbortError
 * so we need to manually check if the signal was aborted) 
*/
function _throwIfAborted(abortController: AbortController) {
    if (abortController.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
    }
}

/** First attempt at retreiving the data, depending on the cache strategy.
 * 
 * @throws
 * - **fetch errors** : except for `ErrorStatus` and `AbortError`, all fetching related errors 
 * are caught and stored to be re-thrown if both data access attempts fail
 * - **json parsing errors** : parsing an unsafe object will throw an error
 * - **validation errors** : if a provided validation function returns false an error will be thrown
 * 
 * @returns 
 * = {
 * > `data` : extracted and processed data, or undefined
 * 
 * > `fetchError` : stores an eventual error raised by `fetch` call to be re-thrown if both data access attempts fail
 * 
 * }
 */
async function _primaryAccessAttempt<DataType_T>(
    kwargs: accessAttemptKwargs_T<DataType_T>
): Promise<accessAttemptResult_T<DataType_T>> {

    const { 
        url, 
        requestInit, 
        fetchJsonOpts
    } = kwargs
    
    const {strategy} = fetchJsonOpts.cache

    if (strategy==='CACHE_FIRST') {
        return shortcuts.simpleCacheLookup<DataType_T>({
            url, fetchJsonOpts
        })
        
    } else if (strategy==='STALE_WHILE_REVALIDATE') {
        return shortcuts.staleWhileRevalidateCacheLookup<DataType_T>({
            url, requestInit, fetchJsonOpts
        })

    } else { // 'NETWORK_FIRST' or 'INVALIDATE_AND_FETCH'
        if (strategy==='INVALIDATE_AND_FETCH') {
            await caching.remove(url)
        }

        return shortcuts.networkCallWithCacheUpdate<DataType_T>({
            url, requestInit, fetchJsonOpts
        })
    }
}

/** Second attempt at retreiving the data, depending on the cache strategy.
 * 
 * @throws
 * - **fetch errors** : except for `ErrorStatus` and `AbortError`, all fetching related errors 
 * are caught and stored to be re-thrown if both data access attempts fail
 * - **json parsing errors** : parsing an unsafe object will throw an error
 * - **validation errors** : if a provided validation function returns false an error will be thrown
 * 
 * @returns 
 * = {
 * > `data` : extracted and processed data, or undefined
 * 
 * > `fetchError` : stores an eventual error raised by `fetch` call to be re-thrown if both data access attempts fail
 * 
 * }
 */
async function _secondaryAccessAttempt<DataType_T>(
    kwargs: accessAttemptKwargs_T<DataType_T>
): Promise<accessAttemptResult_T<DataType_T>> {

    const { 
        url, 
        requestInit, 
        fetchJsonOpts
    } = kwargs
    
    const {strategy} = fetchJsonOpts.cache

    if (strategy==='INVALIDATE_AND_FETCH'){
        // invalidate and fetch does not have a second attempt
        return {data: undefined, fetchError: undefined}

    } else if (strategy==='NETWORK_FIRST') {
        return shortcuts.simpleCacheLookup<DataType_T>({
            url, fetchJsonOpts
        })

    } else { // 'CACHE_FIRST' or 'STALE_WHILE_REVALIDATE'
        return shortcuts.networkCallWithCacheUpdate<DataType_T>({
            url, requestInit, fetchJsonOpts
        })
    }
}


/** Wrapper around `fetch` focused on receiving json data, including multiple features:
 * - ⚙️ Secure parsing of received json data (throws an error if data is unsafe)
 * - ⚙️ Custom data validation for every access (throws an error if data does not satisfy provided validators)
 * - ⚙️ Granular control over caching strategy per request, using the browser's Cache API.
 * - ⚙️ Custom number of retries and timeout duration per request
 * 
 * 
 * @param url (Enhanced URL) target of the fetch request
 * 
 * @param opts object with 2 keys `requestInit` and `fetchJsonOpts`
 * 
 * @param opts.requestInit 
 * 'RequestInit' options object provided to built-in fetch function but 
 * excluding `signal` key because it is automatically populated from 
 * `fetchJsonOpts.abortController` set in `fetchJsonOpts`
 * 
 * @param opts.fetchJsonOpts
 * = {
 * 
 * > `dataValidators` (optionnal) : List of functions taking the parsed data as input and returning true if it is valid (every data retreival runs the validators)
 * 
 * > `abortController` (optionnal) : AbortController instance to link with fetch call
 * 
 * > `timeoutS` (default: 15s) : 'NONE' or number of seconds until the fetch attempt is cancelled
 * 
 * > `retries` (default: 2x) : Number of retries within the set timeout
 * 
 * > `cache` (optionnal): Options object defining the caching strategy
 * 
 * }
 * 
 * @param opts.fetchJsonOpts.cache 
 * = {
 * > `strategy` (default: 'CACHE_FIRST') can be:
 * >    - 'CACHE_FIRST'
 * >    - 'NETWORK_FIRST'
 * >    - 'STALE_WHILE_REVALIDATE' : can return stale data (if they are under the given age threshold) and refreshes the cache in the background (custom callback can be called once data is refreshed)
 * >    - 'INVALIDATE_AND_FETCH' : invalidates the data in cache and fetches
 * 
 * > `maxAgeS` (default 4h) : for all strategies except 'INVALIDATE_AND_FETCH', it defines the maximum age acceptable before a cache entry is stale
 * 
 * > `staleEntryMaxAgeS` (default 4h) : only for 'STALE_WHILE_REVALIDATE', it defines the maximum age acceptable for stale entries
 * 
 * > `cacheRefreshCallback` (optionnal) : only for 'STALE_WHILE_REVALIDATE', callback called with the new data once the stale cache entry is refreshed
 *
 * }
 */
async function fetchJsonData<DataType_T>(
    url: EnhancedURL_T, 
    opts: fetchJsonDataOpts_T<DataType_T>,
): Promise<DataType_T | ErrorStatus> {

    const fetchJsonOpts = extractFetchJsonOpts<DataType_T>(opts.fetchJsonOpts)
    const requestInit = extractRequestInit(opts.requestInit, fetchJsonOpts.abortController)

    // first attempt at retreiving the data
    // (depending on cache strategy)
    const primaryAccessResult = await _primaryAccessAttempt<DataType_T>({url, requestInit, fetchJsonOpts})
    if (primaryAccessResult.data) {
        // we need to manually check if an abortSignal was sent
        // because cache lookups will not pick it up
        _throwIfAborted(fetchJsonOpts.abortController)
        return primaryAccessResult.data
    }

    // second attempt at retreiving the data
    // (depending on cache strategy)
    const secondaryAccessResult = await _secondaryAccessAttempt<DataType_T>({url, requestInit, fetchJsonOpts})
    if (secondaryAccessResult.data){
        // we need to manually check if an abortSignal was sent
        // because cache lookups will not pick it up
        _throwIfAborted(fetchJsonOpts.abortController)
        return secondaryAccessResult.data
    } 

    // if no results were found we throw the error returned 
    // by the network request
    const fetchError = 
        primaryAccessResult.fetchError 
        || secondaryAccessResult.fetchError 
        || new Error('fetchJsonData failed for an unknown reason')
    throw fetchError
}

export {
    fetchJsonData,
}