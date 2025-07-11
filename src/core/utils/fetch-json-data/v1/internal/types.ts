type validatorFunc_T = (data: unknown) => boolean 

// CACHING OPTIONS

type cacheFirstOpts_T = {
    strategy: 'CACHE_FIRST',
    maxAgeS: number,
}

type networkFirstOpts_T = {
    strategy: 'NETWORK_FIRST',
    maxAgeS: number,
}

type staleWhileRevalidateOpts_T<DataType_T> = {
    strategy: 'STALE_WHILE_REVALIDATE',
    maxAgeS: number,
    staleEntryMaxAgeS: number,
    cacheRefreshCallback?: (data: DataType_T) => any
}

type invalidateAndFetchOpts_T = {
    strategy: 'INVALIDATE_AND_FETCH',
}

type cachingOpts_T<DataType_T> =
    cacheFirstOpts_T 
    | networkFirstOpts_T 
    | staleWhileRevalidateOpts_T<DataType_T> 
    | invalidateAndFetchOpts_T


// PARTIAL CACHING OPTIONS
// we make sure 'strategy' key is required
// (except for cacheFirstOpts_T which will be assumed by default)

type partialCacheFirstOpts_T = Partial<cacheFirstOpts_T>

type partialNetworkFirstOpts_T = 
    Partial<Omit<networkFirstOpts_T, 'strategy'>>
    & {strategy: 'NETWORK_FIRST'}

type partialStaleWhileRevalidateOpts_T<DataType_T> = 
    Partial<Omit<staleWhileRevalidateOpts_T<DataType_T>, 'strategy'>>
    & {strategy: 'STALE_WHILE_REVALIDATE'}

type partialInvalidateAndFetchOpts = 
    Partial<Omit<invalidateAndFetchOpts_T, 'strategy'>>
    & {strategy: 'INVALIDATE_AND_FETCH'}

type partialCachingOpts_T<DataType_T> = 
    partialCacheFirstOpts_T
    | partialNetworkFirstOpts_T
    | partialStaleWhileRevalidateOpts_T<DataType_T>
    | partialInvalidateAndFetchOpts

// FETCH X OPTS

type fetchJsonOpts_T<DataType_T> = {
    cache: cachingOpts_T<DataType_T>
    dataValidators: validatorFunc_T[],
    abortController: AbortController,
    timeoutS: number,
    retries: number,
}

type partialFetchJsonOpts_T<DataType_T> = 
    Partial<Omit<fetchJsonOpts_T<DataType_T>, 'cache'>>
    & { cache?: partialCachingOpts_T<DataType_T>}

// FETCH ACTIONS
type accessAttemptResult_T<DataType_T> = {
    data?: DataType_T,
    fetchError?: Error
}

export type {
    validatorFunc_T,

    cacheFirstOpts_T, 
    networkFirstOpts_T, 
    staleWhileRevalidateOpts_T, 
    invalidateAndFetchOpts_T,
    cachingOpts_T,

    partialCacheFirstOpts_T,
    partialNetworkFirstOpts_T,
    partialStaleWhileRevalidateOpts_T,
    partialInvalidateAndFetchOpts,
    partialCachingOpts_T,

    fetchJsonOpts_T,
    partialFetchJsonOpts_T,

    accessAttemptResult_T
}