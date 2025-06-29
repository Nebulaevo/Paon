import { createContext, use, useCallback, useMemo, useRef } from "react"
import { parse as secureJsonParse } from 'secure-json-parse'
import { isDict, type Dict_T } from "sniffly"

import { RelativeURL } from "@core:utils/url/v1/utils"
import { isExecutedOnServer } from "@core:utils/execution-context/v1/util"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"
import { getExpiryDate, hasExpired } from '@core:utils/date/v1/expiry-dates'

import { PagePropsFetcher } from "../utils/page-props-fetcher"

/** Props given to a page component */
type pageProps_T = Dict_T<unknown>

/** [ *Result-Status*, *Result-Value* ]\
 * tuple provided once the fetching promise is resolved 
*/
type propsFetchingResultTuple_T = [
    'SUCCESS', pageProps_T
] | [
    'ERROR', ErrorStatus
]

/** [ *Operation-State*, *Operation-Result* ]\
 * tuple that is returned by `getPageProps` function 
 * (exported by `usePageProps` context hook) 
*/
type propsFetchingOperationTuple_T = [
    'FETCHING', Promise<propsFetchingResultTuple_T>
] | [ 
    'READY', propsFetchingResultTuple_T 
]

/** Stucture of the data encapsulated in a `ref`, stored in the `PagePropsContext` 
 * used to:
 * - persiste data between different calls to the hook (like for pre-fetching)
 * - prevent re-renders (as it is in a `ref`)
 * - determine when data can be re-used or awaited (ownerUrlId, expiryDate...)
*/
type PagePropsEntry_T = {
    ownerUrlId?: string, // undefined => owned by no-one
    expiryDate?: Date, // undefined => no expiration date
    fetchingPromise?: Promise<propsFetchingResultTuple_T>,
    result: propsFetchingResultTuple_T
}

type PagePropsContext_T = {
    getPageProps: (relativeUrl:string | RelativeURL, fetcher:PagePropsFetcher) => propsFetchingOperationTuple_T,
    silentlyResetPageProps: () => void
}

type PagePropsProviderProps_T = {
    children: React.ReactNode,
    ssrProps?: pageProps_T | undefined
}

/** Provides the initial value for PageProps depending on the execution context
 * 
 * On the server:
 * - If provided, returns ssrProps (context given to root App component) 
 * - If not, returns an empty dictionary
 * 
 * On the client:
 * - If provided, parses the optional "initial-page-props" json script tag
 * - If parsing said json tag raises a security error, we return an error state: ['ERROR', ErrorStatus('UNSAFE')]
 * so that it can be thrown by a component wrapped by `asPropsFetchingPage`
 * - If nothing has been provided returns an empty entry, 
 * so that the component is free to initiate a page props fetch if it needs to.
*/
function _getInitialPropsData(ssrProps?: pageProps_T): PagePropsEntry_T {

    if (isExecutedOnServer()) return {
        ownerUrlId: undefined,
        expiryDate: undefined,
        fetchingPromise: undefined,
        result: ['SUCCESS', ssrProps ?? {}]
    } 
    
    try {
        const jsonString = document.getElementById('initial-page-props')?.textContent

        // if the json is evil "secureJsonParse" will throw an error
        const parsedJson = jsonString
            ? secureJsonParse(jsonString, {protoAction:'error', constructorAction: 'error'})
            : undefined

        // 🔧 BUG FIX:
        // if 'initial-page-props' tag doesn't exist or is invalid
        // we return a blank entry with no owner, this way if
        // a fetcher is provided it will run to get necessary props
        // for the page on render.
        if (!isDict(parsedJson)) return {
            ownerUrlId: undefined,
            expiryDate: undefined,
            fetchingPromise: undefined,
            result: ['SUCCESS', {}]
        }

        // if initial props are provided we use it for the initial page component
        return {
            ownerUrlId: new RelativeURL(window.location.href).asId(), // No error handling: if it fails it should all crash
            expiryDate: getExpiryDate(5*60*1000), // 5min
            fetchingPromise: undefined,
            result: [ 'SUCCESS', parsedJson ]
        }

    } catch (err) {
        return {
            ownerUrlId: new RelativeURL(window.location.href).asId(), // No error handling: if it fails it should all crash
            expiryDate: getExpiryDate(2*1000), // 2sec
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

/** Checks entry's expiry date, 
 * 
 * (if expiry date is undefined the entry is always fresh) 
 */
function _currentEntryIsFresh(currentEntry:PagePropsEntry_T): boolean {
    const {expiryDate} = currentEntry
    return expiryDate
        ? !hasExpired(expiryDate)
        : true // if no exp date => always fresh
}

/** Compares the entry's 'owner' url id (the url to whom belong this entry)
 * to the given current url id
 * 
 * compared url ids have been modified to ordere search query keys to help matching
 */
function _currentEntryHasSameOwner(currentUrl:RelativeURL, currentEntry:PagePropsEntry_T): boolean {
    const {ownerUrlId} = currentEntry
    return ownerUrlId===currentUrl.asId()
}

/** Creates a deep copy of the result to be used by components, so that they don't modify it by mistake 
 * 
 * (if status is ERROR we can't copy the ErrorStatus instance so we return the original)
*/
function _getResultTuple(currentEntry:PagePropsEntry_T) {
    // if the result is an error we can't copy the ErrorStatus instance 
    // this way so we return the original
    const [resultState] = currentEntry.result
    if (resultState==='ERROR') return currentEntry.result

    // if success state we return a copy of the tuple
    return JSON.parse(JSON.stringify(currentEntry.result))
}

/** React context providing a unified way of getting props for the current page component
 * 
 * (data entries are hold in a private `ref` because that hook is not meant to trigger re-renders)
*/
const PagePropsContext = createContext<PagePropsContext_T>({
    getPageProps: (_relativeUrl:string | RelativeURL, _fetcher:PagePropsFetcher) => ['READY', ['SUCCESS', {}]],
    silentlyResetPageProps: () => {}
})

/** Hook exposing the `PagePropsContext`
 * 
 * ⚙️ Everything operates around a `ref` encapsulating an 
 * "entry" holding that page props, it allows to 
 * persiste data between different calls to the hook (like for pre-fetching),
 * prevent re-renders (as it is in a `ref`) and determine when data can be re-used 
 * (ownerUrlId, expiryDate...)
 * 
 * - `getPageProps()`:\
 * Callback in charge of providing page props.
 * It takes care of fetching, modifying, and providing page props for a url,
 * without causing re-renders (data is encapsulated in a `ref`).
 * It returns an `-operation-tuple-` that can have 2 states:
 *      - [ 'READY', `-result-tuple-` ]
 *      - [ 'FETCHING', Promise<`-result-tuple-`> ]\
 *      where `-result-tuple-` that can have 2 states:
 *          - [ 'SUCCESS', `{page-props...}` ]
 *          - [ 'ERROR', `ErrorStatus` ]
 * 
 * - `silentlyResetPageProps()`:\
 * Callback reseting the content of the current page props (in the `ref`)
 * 
 * @returns [`getPageProps`, `silentlyResetPageProps`]
 */
function usePageProps() {
    return use(PagePropsContext)
}

/** Provider for the `PagePropsContext` */
function PagePropsProvider(props: PagePropsProviderProps_T) {
    const {children, ssrProps} = props
    
    const pagePropsRef = useRef<PagePropsEntry_T>(
        _getInitialPropsData(ssrProps)
    )

    const getPageProps = useCallback((relativeUrl:string | RelativeURL, fetcher:PagePropsFetcher): propsFetchingOperationTuple_T => { 
        const { current } = pagePropsRef
        
        // sanitizing and encoding url
        if (!(relativeUrl instanceof RelativeURL)) {
            try {
                relativeUrl = new RelativeURL(relativeUrl, {onPurifyFail:'ERROR'})
            } catch (err) {
                // if relativeUrl parsing fails we return an error response
                console.error(err)
                
                // we manually return expected tuple because 'current' object 
                // needs a 'owner' ID built from RelativeURL instance
                return ['READY', ['ERROR', new ErrorStatus(ErrorStatus.OPERATION_FAILED)]]
            }
        }

        if (isExecutedOnServer()) {
            // server side shouldn't trigger fetching or any caching behaviour here
            return ['READY', _getResultTuple(current)]
        }

        // checking if the result is the one currently
        // available, or if we are still waiting for fetch to resolve
        if (
            _currentEntryIsFresh(current) 
            && _currentEntryHasSameOwner(relativeUrl, current)
        ) {
            // awaiting for fetching to resolve
            if (current.fetchingPromise) return ['FETCHING', current.fetchingPromise]
            // result is available
            else return ['READY', _getResultTuple(current)]
        }
        
        // checking if a cache entry is available
        // for that url
        // (object returned by "getFromCache" is already a 
        // deep copy of the object stored in cache)
        const cachedProps = fetcher.getFromCache(relativeUrl)
        if (cachedProps) {
            return ['READY', ['SUCCESS', cachedProps]]
        }

        // fetching
        // we set the owner and exp date
        // so that fetch promise can be re-used in case
        // the function is called again before promise is resolved
        current.ownerUrlId = relativeUrl.asId()
        current.expiryDate = getExpiryDate(60*1000) // 1min
        current.fetchingPromise = fetcher.fetch(relativeUrl)
            .then( (data:unknown) => {
                if (!isDict(data)) throw new ErrorStatus( ErrorStatus.TYPE_ERROR )
                
                // 🔧 BUG FIX: 
                // Prevent side effect of another page from modifying current page props
                // (for example chained navigation fetch requests that could resolve later than the intended one)
                if (_currentEntryHasSameOwner(relativeUrl, current)){
                    current.expiryDate = getExpiryDate(5*60*1000) // 5min
                    current.fetchingPromise = undefined
                    current.result = ['SUCCESS', data]
                }

                return _getResultTuple(current)
            })
            .catch( err => {
                // 🔧 BUG FIX: 
                // Prevent side effect of another page from modifying current page props
                // (for example canceled request would throw and execute this catch callback)
                if (_currentEntryHasSameOwner(relativeUrl, current)){
                    console.error(err)
                    current.expiryDate = getExpiryDate(2*1000) // 2sec
                    current.fetchingPromise = undefined
                    current.result = [
                        'ERROR',
                        err instanceof ErrorStatus
                            ? err
                            : new ErrorStatus( ErrorStatus.OPERATION_FAILED )
                    ]
                }

                return _getResultTuple(current)
            })
        
        return ['FETCHING', current.fetchingPromise]
    }, [])

    const silentlyResetPageProps = useCallback(
        () => {
            const { current } = pagePropsRef

            current.ownerUrlId = undefined
            current.expiryDate = undefined
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
