import type { ExtendedUrl_T } from 'url-toolbox'

import { ErrorStatus } from '@core:utils/error-status/v1/utils'

import caching from './caching'
import { processReponse } from './process-response'
import type { 
    accessAttemptResult_T, 
    fetchJsonOpts_T
} from './types'


type shortcutKwargs_T<DataType_T> = {
    url: ExtendedUrl_T,
    requestInit: RequestInit, 
    fetchJsonOpts: fetchJsonOpts_T<DataType_T>
}

/** Async task refreshing the cached value for 'STALE_WHILE_REVALIDATE' caching strategy,
 * and if it succeeds, it calls the optionnal `cacheRefreshCallback` function giving it the fresh data once available.
 * 
 * @throws
 * - any errors that can be thrown by `networkCallWithCacheUpdate`
 * - eventual `fetchError` that might be returned by `networkCallWithCacheUpdate`
*/
async function _refreshCacheEntryTask<DataType_T>(
    kwargs: shortcutKwargs_T<DataType_T>
) {

    const {
        url,
        requestInit,
        fetchJsonOpts
    } = kwargs

    if (fetchJsonOpts.cache.strategy!=='STALE_WHILE_REVALIDATE') {
        throw new Error('fetch json data: shortcuts functions used inproperly')
    }

    const {cacheRefreshCallback} = fetchJsonOpts.cache

    const abortController = new AbortController()

    // We call the already defined helper with forced values
    // to update the cache in the background 
    const {data, fetchError} = await networkCallWithCacheUpdate<DataType_T>({
        url,

        // we re-define:
        // - abort controller: to make its cancellation independent from the parent task abortion
        // - cache: in case caching is used we want to be sure to re-set it
        // - timeoutS & retries: to be sure to allow time for the background cache update task to run even on slower networks
        requestInit: {
            ...requestInit,
            signal: abortController.signal,
            cache: 'reload'
        },
        fetchJsonOpts: {
            ...fetchJsonOpts,
            abortController: abortController,
            timeoutS: 20,
            retries: 3
        }
    })

    if (fetchError) throw fetchError

    if (data && cacheRefreshCallback) {
        cacheRefreshCallback(data)
    }
}

/** Helper callback for cache `get` error handling 
 * 
 * (we catch the error, log it to console, and return an empty result)
*/
function _cacheGetErrorCallback(err:unknown): Awaited<ReturnType<typeof caching.get>> {
    console.error('fetchJsonData cache lookup raised an error')
    console.error(err)
    return {
        state: 'NONE',
        response: undefined
    }
}

/** Shortcut performing a simple cache lookup for the given url.
 * 
 * @throws
 * - will raise an error if json parsing finds attempts at proto or constructor poisoning
 * - will raise an error if one of the optionnally provided validators returns `false`
 * (if stored data is considered invalid or unsafe the cache entry is removed)
 * 
 * @returns an object with 2 keys: {`data`, `fetchError`}\
 * = {
 * > `data`: containing the data if it was successfully retreived, converted and validated
 * 
 * > `fetchError`: some errors raised by `fetch` will be kept here 
 * in order to be re-thrown at the end if all attempts at getting the data fails
 * 
 * }
 */
async function simpleCacheLookup<DataType_T>(
    kwargs: Omit<shortcutKwargs_T<DataType_T>, 'requestInit'>
): Promise<accessAttemptResult_T<DataType_T>> {

    const {
        url,
        fetchJsonOpts
    } = kwargs

    if (fetchJsonOpts.cache.strategy==='INVALIDATE_AND_FETCH') {
        throw new Error('fetch json data: shortcuts functions used inproperly')
    }

    const cachingOpts = fetchJsonOpts.cache

    const {response} = await caching.get<DataType_T>(url, {maxAgeS: cachingOpts.maxAgeS})
        .catch( _cacheGetErrorCallback )
    
    const data = response
        ? await processReponse<DataType_T>(response, fetchJsonOpts.dataValidators)
            .catch( async err => {
                // if data is invalid, 
                // we 'fire and forget' a task 
                // removing that entry from the cache
                caching.remove(url)
                // before re-throwing the error
                throw err
            })
        : undefined

    return {data, fetchError: undefined}
}

/** Shortcut performing a 'stale while revalidate' cache lookup for the given url.
 * 
 * - if entry is below `maxAgeS` : just returns the cached version
 * - if entry is stale, but below the `staleEntryMaxAgeS` limit, 
 * we return it and refresh the cache entry in the background, 
 * and if it succeeds, it calls the optionnal `cacheRefreshCallback` function giving it the fresh data once available.
 * - if entry is stale and over the limit, it is not returned and removed from the cache
 * 
 * @throws
 * - will raise an error if json parsing finds attempts at proto or constructor poisoning
 * - will raise an error if one of the optionnally provided validators returns `false`
 * (if stored data is considered invalid or unsafe the cache entry is removed)
 * 
 * @returns an object with 2 keys: {`data`, `fetchError`}\
 * = {
 * > `data`: containing the data if it was successfully retreived, converted and validated
 * 
 * > `fetchError`: some errors raised by `fetch` will be kept here 
 * in order to be re-thrown at the end if all attempts at getting the data fails
 * 
 * }
 */
async function staleWhileRevalidateCacheLookup<DataType_T>(
    kwargs: shortcutKwargs_T<DataType_T>
): Promise<accessAttemptResult_T<DataType_T>> {

    const {
        url,
        fetchJsonOpts
    } = kwargs

    if (fetchJsonOpts.cache.strategy!=='STALE_WHILE_REVALIDATE'){
        throw new Error('fetch json data: shortcuts functions used inproperly')
    }

    const {maxAgeS, staleEntryMaxAgeS} = fetchJsonOpts.cache

    const {state, response} = await caching.get<DataType_T>(url, {maxAgeS, staleEntryMaxAgeS})
        .catch( _cacheGetErrorCallback )

    if (state==='STALE') {
        // remark:
        // if state is 'NONE' we do a network call as a secondary attempt
        // which is gonna refresh the cache as well

        // we "fire and forget" the async task
        // refreshing the cache entry
        _refreshCacheEntryTask(kwargs)
            .catch( err => {
                console.error('Async task: "refresh stale cache entry" failed with error')
                console.error( err )
            })
    }

    const data = response
        ? await processReponse<DataType_T>(response, fetchJsonOpts.dataValidators)
            .catch( async err => {
                // if data is invalid, 
                // we 'fire and forget' a task 
                // removing that entry from the cache
                caching.remove(url)
                // before re-throwing the error
                throw err
            })
        : undefined

    return {data, fetchError: undefined}
}

/** Shortcut performing a network call and caching the result.
 * 
 * @throws
 * - can raise `fetch` related errors `ErrorStatus` and `AbortError` (all other fetching related errors 
 * are caught and stored to be re-thrown if both data access attempts fail)
 * - will raise an error if json parsing finds attempts at proto or constructor poisoning
 * - will raise an error if one of the optionnally provided validators returns `false`
 * (if stored data is considered invalid or unsafe the cache entry is removed)
 * 
 * @returns an object with 2 keys: {`data`, `fetchError`}\
 * = {
 * > `data`: containing the data if it was successfully retreived, converted and validated
 * 
 * > `fetchError`: some errors raised by `fetch` will be kept here 
 * in order to be re-thrown at the end if all attempts at getting the data fails.
 * 
 * }
 */
async function networkCallWithCacheUpdate<DataType_T>(
    kwargs: shortcutKwargs_T<DataType_T>
): Promise<accessAttemptResult_T<DataType_T>> {

    const {
        url,
        requestInit,
        fetchJsonOpts
    } = kwargs

    const {retries, timeoutS, abortController} = fetchJsonOpts
    
    // we set an abort timer if a timeoutS was provided
    const timer = setTimeout(
        () => abortController.abort(),
        timeoutS * 1000 // convert to ms
    )
    
    // we set a retry loop for the query
    let i = 0
    let response: Response | undefined = undefined
    let fetchError: Error | undefined = undefined
    do {
        i++

        const resultTuple = await fetch(url.toString(), requestInit)
            .then(response => {
                // we raise a ErrorStatus instance in case of error response
                if (!response.ok) throw new ErrorStatus(response.status.toString())
                
                return {response, fetchError: undefined}
            })
            .catch(err => {
                // abort errors and error status codes
                // stops the execution immediatly
                // (checking if aborted is the safest way to know if the error is an AbortError)
                if (abortController.signal.aborted) throw err
                else if (err instanceof ErrorStatus) throw err

                const fetchError = err instanceof Error
                    ? err
                    : new Error(`${typeof err}: ${err}`)

                return {fetchError, response: undefined}
            })
        
        response = resultTuple.response
        fetchError = resultTuple.fetchError

    } while (!response && i<retries)
    
    clearTimeout(timer)
    
    const data = response
        ? await processReponse<DataType_T>(response, fetchJsonOpts.dataValidators)
        : undefined

    if (response) { 
        // we "fire and forget" the async task
        // updating the cache entry
        caching.set({url, response})
            .catch(err => {
                console.error('Async task: "update cache entry" failed with error')
                console.error( err )
            })
    }
    
    return {data, fetchError}
}

export default {
    simpleCacheLookup,
    staleWhileRevalidateCacheLookup,
    networkCallWithCacheUpdate
}