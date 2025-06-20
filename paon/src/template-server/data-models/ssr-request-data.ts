
// escaping
import { sanitizeUrl } from "@braintree/sanitize-url"
import serialize from 'serialize-javascript'

import { isString, isDict } from "sniffly"

/** Declares the RequestData class (handling POST data received from backend server) */
import type { appProps_T } from "&interop-types/app-props"


type RequestPostData_T = {
    url: appProps_T['url'],
    context: appProps_T['context']
}

/** Class encapsulating POST data sent from backend server for SSR template rendering request.
 * garanteeing they have the expected format
 * 
 * @param rawRequestData parsed JSON POST data received from backend server
 * 
 * @raises "invalid request" or "invalid url" strings if data doesn't have expected format or url build fails
 */
class SsrRequestData {

    url: appProps_T['url']
    context: appProps_T['context']

    constructor(rawRequestData: unknown) {
        
        if (!this.#checkValidity(rawRequestData)) throw "invalid request"

        // Remark: generating url can throw error too if url is invalid or malicious
        this.url = this.#sanitizeRelativeUrl(rawRequestData.url)
        this.context = rawRequestData.context
    }

    /** Checks if the structure of the received data is valid 
     * (do not check the content of the 'context' object)
    */
    #checkValidity( rawRequestData: unknown ): rawRequestData is RequestPostData_T{
        // verifies that the data received have the required format

        if ( isDict(rawRequestData, {keys:['url', 'context']}) ) {
            const {url, context} = rawRequestData

            const urlIsValid = isString(url, {nonEmpty:true})
            const contextIsValid = isDict(context)
            
            return urlIsValid && contextIsValid
        }
        return false
    }

    /** Makes sure url is relative and sanitised
     * 
     * @param url url string we want sanitised
     * @returns sanitised relative URL string including pathname, search, and hash
     */
    #sanitizeRelativeUrl(url: RequestPostData_T['url']): string {
        const ABOUT_BLANK_URL = 'about:blank'
        const DUMMY_URL_ORIGIN = 'http://dummy.com'

        // returns "about:blank" if sanitisation fails
        url = sanitizeUrl(url)
        if (url===ABOUT_BLANK_URL) throw "invalid given url"

        const urlObj = new URL(url, DUMMY_URL_ORIGIN)

        return urlObj.pathname + urlObj.search + urlObj.hash
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

/** Formatting reveived post request data for ssr rendering into standard "SsrRequestData" object.
 * is data is invalid, returns undefined
 * 
 * @param rawRequestData parsed post request data received from backend server
 * @returns instance of SsrRequestData if received data is valid, otherwise returns undefined
 */
function buildSsrReqData( rawRequestData:unknown ): SsrRequestData | undefined {
    try {
        return new SsrRequestData(rawRequestData)
    } catch (e) {
        return undefined
    }
}

export {
    buildSsrReqData,
    type SsrRequestData
}