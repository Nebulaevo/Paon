import { createContext, use, useCallback, useMemo, useRef } from "react"
import { parse as secureJsonParse } from 'secure-json-parse'
import { isDict, isNumber, type Dict_T } from "sniffly"

import { getIdFromRelativeUrl } from '@core:utils/url-parsing/v1/utils'
import { isExecutedOnServer } from "@core:utils/execution-context/v1/util"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

import { PagePropsFetcher } from "../utils/page-props-fetcher"


type pageProps_T = Dict_T<unknown>

type propsFetchingResult_T = [
    'SUCCESS', pageProps_T
] | [
    'ERROR', ErrorStatus
]

type PagePropsEntry_T = {
    ownerUrlId?: string, // undefined => (server) owned by anyone (client) owned by no-one
    expirationDate?: Date, // undefined => (ssr only) no expiration date
    fetchingPromise?: Promise<propsFetchingResult_T>,
    result: propsFetchingResult_T
}

type propsGetterReturnVal_T = [
    'FETCHING', Promise<propsFetchingResult_T>
] | [ 
    'READY', propsFetchingResult_T 
]

type PagePropsContext_T = {
    // pagePropsRef: PagePropsEntry_T,
    getPageProps: (url:string, fetcher:PagePropsFetcher) => propsGetterReturnVal_T,
    silentlyResetPageProps: () => void
}

type PagePropsProviderProps_T = {
    children: React.ReactNode,
    ssrProps?: pageProps_T | undefined
}

// Returns a Date in the future at which point
// we consider the page props to be too old to use
function _getExpirationDate( validityTimeMs?:number ): Date {
    validityTimeMs = isNumber(validityTimeMs, {positive:true})
        ? validityTimeMs
        : 5*60*1000 // 5 min by default

    return new Date(Date.now()+validityTimeMs)
}

function _getInitialPropsData(ssrProps?: pageProps_T): PagePropsEntry_T {

    if (isExecutedOnServer()) return {
        ownerUrlId: undefined,
        expirationDate: undefined,
        fetchingPromise: undefined,
        result: ['SUCCESS', ssrProps ?? {}]
    } 
    
    try {
        const jsonString = document.getElementById('initial-page-props')?.textContent

        // if the json is evil it will throw error
        const parsedJson = jsonString
            ? secureJsonParse(jsonString, {protoAction:'error', constructorAction: 'error'})
            : undefined

        return {
            ownerUrlId: getIdFromRelativeUrl(window.location.href),
            expirationDate: _getExpirationDate(), // 5min
            fetchingPromise: undefined,
            result: [
                'SUCCESS',
                isDict(parsedJson) ? parsedJson : {}
            ]
        }

    } catch (err) {
        return {
            ownerUrlId: getIdFromRelativeUrl(window.location.href),
            expirationDate: _getExpirationDate(2*1000), // 2sec
            fetchingPromise: undefined,
            result: [
                'ERROR',
                new ErrorStatus(
                    ErrorStatus.UNSAFE
                )
            ]
        }
    }
}

function _currentEntryIsFresh(currentEntry:PagePropsEntry_T): boolean {
    const {expirationDate} = currentEntry
    return expirationDate
        ? expirationDate>new Date()
        : true // if no exp date => always fresh
}

function _currentEntryHasSameOwner(currentUrlId:string, currentEntry:PagePropsEntry_T): boolean {
    const {ownerUrlId} = currentEntry
    return currentUrlId===ownerUrlId
}

const PagePropsContext = createContext<PagePropsContext_T>({
    getPageProps: (_url:string, _fetcher:PagePropsFetcher) => ['READY', ['SUCCESS', {}]],
    silentlyResetPageProps: () => {}
})

/** Hook exposing the "PagePropsContext"
 * 
 * - getPageProps: returns page props or a promise that will resolve to the page props
 * - silentlyResetPageProps: resets the value of page props without triggering a re-render
 */
function usePageProps() {
    return use(PagePropsContext)
}


function PagePropsProvider(props: PagePropsProviderProps_T) {
    const {children, ssrProps} = props
    
    const pagePropsRef = useRef<PagePropsEntry_T>(
        _getInitialPropsData(ssrProps)
    )

    const getPageProps = useCallback((url:string, fetcher:PagePropsFetcher): propsGetterReturnVal_T => { 
        const { current } = pagePropsRef
        const currenUrlId = getIdFromRelativeUrl(url)

        if (isExecutedOnServer()) {
            // server side shouldn't trigger fetching or any caching behaviour here
            console.log('getPageProps - isExecutedOnServer')
            return ['READY', current.result]
        }

        // checking if the result is the one currently
        // available, or if we are still waiting for fetch to resolve
        if (
            _currentEntryIsFresh(current) 
            && _currentEntryHasSameOwner(currenUrlId, current)
        ) {
            console.log('getPageProps - isFresh')
            // awaiting for fetching to resolve
            if (current.fetchingPromise) return ['FETCHING', current.fetchingPromise]
            // result is available
            else return ['READY', current.result]
        }
        
        // checking if a cache entry is available
        // for that url
        const cachedProps = fetcher.getFromCache(url)
        if (cachedProps) {
            console.log('getPageProps - from cache')
            return ['READY', ['SUCCESS', cachedProps]]
        }

        // fetching
        // we set the owner and exp date
        // so that fetch promise can be re-used in case
        // the function is called again before promise is resolved
        current.ownerUrlId = currenUrlId
        current.expirationDate = _getExpirationDate(60*1000) // 1min
        current.fetchingPromise = fetcher.fetch(url)
            .then( (data:unknown) => {
                if (!isDict(data)) throw new ErrorStatus( ErrorStatus.TYPE_ERROR )
                
                // 🔧 BUG FIX: (in case we forgot to add abortController to fetch call)
                // We prevent fetch promise callback to modify
                // the current entry if the owner url has changed
                // (because it means a new request has been initiated and that one should have been canceled)
                if (_currentEntryHasSameOwner(currenUrlId, current)){
                    current.expirationDate = _getExpirationDate() // 5min
                    current.fetchingPromise = undefined
                    current.result = ['SUCCESS', data]
                }

                return current.result
            })
            .catch( err => {
                
                // 🔧 BUG FIX: (in case we forgot to add abortController to fetch call)
                // We prevent fetch promise callback to modify
                // the current entry if the owner url has changed
                // (because it means a new request has been initiated and that one should have been canceled)
                if (_currentEntryHasSameOwner(currenUrlId, current)){
                    current.expirationDate = _getExpirationDate(2*1000) // 2sec
                    current.fetchingPromise = undefined
                    current.result = [
                        'ERROR', 
                        err instanceof ErrorStatus
                            ? err
                            : new ErrorStatus( ErrorStatus.OPERATION_FAILED )
                    ]
                }

                return current.result
            })
        
        console.log('getPageProps - fetching')
        return ['FETCHING', current.fetchingPromise]
    }, [])

    const silentlyResetPageProps = useCallback(
        () => {
            const { current } = pagePropsRef

            current.ownerUrlId = undefined
            current.expirationDate = undefined
            current.fetchingPromise = undefined
            current.result = ['SUCCESS', {}]
        }, []
    )

    // we memoise the context's value
    const value = useMemo(() => {
        return {
            getPageProps,
            silentlyResetPageProps
        }
    }, [])

    return <PagePropsContext value={value}>
        { children }
    </PagePropsContext>
}

export {
    usePageProps,
    PagePropsProvider
}

export type { 
    PagePropsContext_T,
    PagePropsProviderProps_T,
}
