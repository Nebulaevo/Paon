import { parse as secureJsonParse } from 'secure-json-parse'
import { isDict } from "sniffly"

import { ErrorStatus } from '@core:utils/error-status/v1/utils'
import { isExecutedOnServer } from '@core:utils/execution-context/v1/util'
import { RelativeURL } from '@core:utils/url/v1/utils'
import { getExpiryDate, hasExpired } from '@core:utils/date/v1/expiry-dates'
import type { pagePropsGetterFunc_T } from '@core:routing/v1/hooks/use-router-settings/hook'

import type {
    pageProps_T,
    propsFetchingResultTuple_T
} from './types'



type requestSendingKwargs = {
    relativeUrl: RelativeURL,
    fetcher: pagePropsGetterFunc_T
}

/** Object encapsulating the logic of handling page components props
 * for the usePageProps hook
 */
class PropsHolder {
    
    /** Internal AbortController instance */
    #abortController?: AbortController

    #ownerUrlId?: string // undefined => owned by no-one
    #expiryDate?: Date // undefined => no expiration date
    #pendingPromise?: Promise<propsFetchingResultTuple_T> // undefined => no pending requests
    #result: propsFetchingResultTuple_T

    /** Provides the initial value for PropsHolder depending on the execution context
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
    constructor(ssrProps?: pageProps_T) {

        if (isExecutedOnServer()) {
            this.#ownerUrlId = undefined // ownerUrlId is ignored server side
            this.#expiryDate = undefined
            this.#pendingPromise = undefined
            this.#result = ['SUCCESS', ssrProps ?? {}]
            
            return
        }

        let parsedJson: pageProps_T | undefined
        try {
            const jsonString = document.getElementById('initial-page-props')?.textContent

            // we have set up fastify to remove dangerous keys in json data
            // instead of throwing an error.
            // to ensure coherence between frontend and backend data handling 
            // we do the same here
            parsedJson = jsonString
                ? secureJsonParse(jsonString, {protoAction:'remove', constructorAction: 'remove'})
                : undefined
            
        } catch (_err) {
            this.#ownerUrlId = new RelativeURL(window.location.href).asId() // No error handling: if it fails it should all crash
            this.#expiryDate = getExpiryDate(3*1000) // 3sec
            this.#pendingPromise = undefined
            this.#result = [
                'ERROR',
                new ErrorStatus(
                    ErrorStatus.UNSAFE
                )
            ]
        }

        if (isDict(parsedJson)) {
            // if initial props are provided we use it for the initial page component
            this.#ownerUrlId = new RelativeURL(window.location.href).asId() // No error handling: if it fails it should all crash
            this.#expiryDate = getExpiryDate(5*60*1000) // 5min
            this.#pendingPromise = undefined
            this.#result = ['SUCCESS', parsedJson]
        } else {
            // 🔧 BUG FIX:
            // if 'initial-page-props' tag doesn't exist or is invalid
            // we return a blank entry with no owner, this way if
            // a fetcher is provided it will run to get necessary props
            // for the page on render.
            this.#ownerUrlId = undefined
            this.#expiryDate = undefined
            this.#pendingPromise = undefined
            this.#result = ['SUCCESS', {}]
        }
    }

    /** Returns true if given relative url is the page owning the current page props entry */
    propsOwnerIs(relativeUrl: RelativeURL): boolean {
        return this.#ownerUrlId === relativeUrl.asId()
    }

    /** Returns true if expiry date for the current page props entry have not been reached yet */
    get entryIsFresh(): boolean {
        return this.#expiryDate
            ? !hasExpired(this.#expiryDate)
            : true // if no exp date => always fresh
    }

    /** Returns the page props request promise if it is still pending, otherwise returns undefined */
    get pendingPromise() {
        return this.#pendingPromise
    }

    /** Returns a deep copy of the stored result 
     * 
     * (except if value is an error, than the original error instance is returned)
    */
    get result(): propsFetchingResultTuple_T {
        const [resultStatus, resultvalue] = this.#result
        // if result is an error state we return the original object
        // (no need to deep copy an error instance)
        if (resultStatus === 'ERROR') return ['ERROR', resultvalue]

        // if result has data we return a deep copy of it
        return [
            'SUCCESS',
            JSON.parse(JSON.stringify(resultvalue))
        ]
    }

    /** Resets the page props entry */
    reset() {
        this.#ownerUrlId = undefined
        this.#expiryDate = undefined
        this.#pendingPromise = undefined
        this.#result = ['SUCCESS', {}]
    }

    /** Sends an abort signal from the internal `AbortController` if it exists */
    abortPendingPagePropsRequest() {
        if (this.#abortController) {
            this.#abortController.abort()
            this.#abortController = undefined
        }
    }

    /** Returns a fresh internal instance of `AbortController` */
    #getAbortController() {
        this.#abortController = new AbortController()
        return this.#abortController
    }

    /** Deletes the internal instance of `AbortController` */
    #resetAbortController() {
        this.#abortController = undefined
    }

    /** Sends a request through the provided fetcher to get page props 
     * and stores the data in `this.result`
    */
    sendPagePropsRequest(kwargs: requestSendingKwargs) {

        if (isExecutedOnServer()) {
            throw new Error('PropsHolder.sendPagePropsRequest should not be called on the server')
        }

        const {
            relativeUrl,
            fetcher
        } = kwargs

        const abortController = this.#getAbortController()

        this.#ownerUrlId = relativeUrl.asId()
        this.#expiryDate = undefined // the fetch promise expiry time should only be handled by the request timeout

        // we create a dedicated copy of the current URL obj 
        // that can be freely mutated by the fetcher function
        const fetchingUrl = new RelativeURL(
            relativeUrl.toString(),
            { 'onPurifyFail': 'IGNORE' } // we do not re-sanatize
        )

        this.#pendingPromise = fetcher(fetchingUrl, abortController)
            .then(data => {
                // 🔧 BUG FIX: 
                // Prevent side effect of another page from modifying current page props
                // (for example chained navigation fetch requests that could resolve later than the intended one)
                if (this.propsOwnerIs(relativeUrl)){
                    this.#expiryDate = getExpiryDate(5*60*1000) // 5min
                    this.#pendingPromise = undefined
                    this.#result = ['SUCCESS', data]
                }
            })
            .catch(err => {
                // 🔧 BUG FIX: 
                // Prevent side effect of another page from modifying current page props
                // (for example canceled request would throw and execute this catch callback)
                if (this.propsOwnerIs(relativeUrl)){
                    console.error(err)
                    this.#expiryDate = getExpiryDate(3*1000) // 3sec
                    this.#pendingPromise = undefined
                    this.#result = [
                        'ERROR',
                        err instanceof ErrorStatus
                            ? err
                            : new ErrorStatus( ErrorStatus.OPERATION_FAILED )
                    ]
                }
            })
            .then(() => {
                this.#resetAbortController()
                return this.result
            })
        
        return this.#pendingPromise
    }
}

export {PropsHolder}