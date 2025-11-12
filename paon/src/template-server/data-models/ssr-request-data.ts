/** Declares the RequestData class (handling POST data received from backend server) */

// escaping
import serialize from 'serialize-javascript'

import { RelativeUrl } from "url-toolbox"
import { isString, isDict } from "sniffly"

import type { appProps_T } from "&interop-types/app-props"


type RequestPostData_T = {
    url: appProps_T['url'],
    context: appProps_T['context']
}

/** Class encapsulating POST data sent from backend server for SSR template rendering request.
 * garanteeing they have the expected format */
class SsrRequestData {

    #url: appProps_T['url']
    #context: appProps_T['context']

    /** Static method attempting to create an instance of SsrRequestData,
     * returns null if the constructor fails
     */
    static from(rawRequestData: unknown): SsrRequestData | null {
        try {
            return new SsrRequestData(rawRequestData)
        } catch(err) {
            return null
        }
    }

    /**
     * @param rawRequestData parsed JSON POST data received from backend server
     * 
     * @throws if raw request data doesn't have expected format or if url parsing fails
    */
    constructor(rawRequestData: unknown) {

        if (!this.#isValidSsrRequestData(rawRequestData)) {
            this.#throwForInvalidRequestData(
                "missing key or invalid value type"
            )
        }

        // Remark: url parsing may throw an error
        // (for example if receives absolute url with non http/https protocol)
        this.#url = this.#parseRelativeUrl(rawRequestData.url)
        this.#context = rawRequestData.context
    }

    get url() {
        return this.#url
    }

    get context() {
        return this.#context
    }

    /** Checks if the structure of the received data is valid 
     * (do not check the content of the 'context' object)
    */
    #isValidSsrRequestData( rawRequestData: unknown ): rawRequestData is RequestPostData_T{
        if ( isDict(rawRequestData, {keys:['url', 'context']}) ) {
            const {url, context} = rawRequestData

            const urlIsValid = isString(url, {nonEmpty:true})
            const contextIsValid = isDict(context)
            
            return urlIsValid && contextIsValid
        }
        return false
    }

    /** Parses the given string and returns a relative URL string
     * (only including pathname, search and hash)
     * 
     * @throws if URL parsing fails
     * 
     * @returns relative URL string including pathname, search, and hash
     */
    #parseRelativeUrl(url: RequestPostData_T['url']): string {
        try {
            const relativeUrl = new RelativeUrl(url)
            return relativeUrl.toString()
        } catch (err) {
            this.#throwForInvalidRequestData(
                `attempt to parse "${ url }" as a relative http(s) URL, failed with : ${ err }`
            )
        }
    }

    #throwForInvalidRequestData(reason: string): never {
        throw new Error(
            "Invalid SSR request data, "
            + reason
        )
    }

    /** Escapes the JS object to be safely injected in HTML markup */
    #serializeInitialPageProps(): string {
        return serialize(this.context, {isJSON:true})
    }

    /** Returns app props as a js object */
    appPropsObject(): appProps_T {
        return {
            url: this.url,
            context: this.context
        }
    }

    /** Returns app props as an escaped HTML json tag */
    getInitialPagePropsAsJsonTag(): string {
        return `<script id="initial-page-props" type="application/json">${ this.#serializeInitialPageProps() }</script>`
    }
}

export default SsrRequestData
export type { SsrRequestData }