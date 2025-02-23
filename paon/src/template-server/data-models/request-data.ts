/** Declares the RequestData class (handling POST data received from backend server) */
import type { appProps_T } from "&interop-types/app-props"

// escaping javascript
import serialize from 'serialize-javascript'

import { isBool, isString, isDict } from "sniffly"
import type { Dict_T } from "sniffly"



type renderingOptions_T = {
    ssr: boolean,
}

type RequestPostData_T = {
    url: string,
    pageContext: Dict_T<unknown>,
    renderingOptions?: Partial<renderingOptions_T>
}


/** Class handling POST data received from backend server
 * to ensure they have the expected format.
 * It is required to check 'isValid' before using the data
 * 
 * @param rawRequestData parsed JSON POST data received from backend server
 * 
 * 
 * Attributes:
 * -----------
 * - **isValid** (boolean): 
 * true if received data were valid
 * 
 * - **url** (string): 
 * relative URL string for the generated page including search and hash
 * 
 * - **pageContext** (object): 
 * key/value object containing context data sent from backend server
 * 
 * - **ssr** (boolean):
 * if yes or not we should server side render the page
 * 
 * 
 * 
 * @example
 * const requestData = new RequestData( rawRequestData )
 * if ( requestData.isValid ) { 
 *      ...
 * } else {
 *      // -> return 400 bad request
 * }
 */
class RequestData {

    isValid: boolean
    url: string
    pageContext: Dict_T<unknown>
    ssr: boolean

    constructor( rawRequestData:unknown ) {
        
        let pageContext: Dict_T<unknown> | undefined = undefined
        let urlObj: URL | undefined = undefined
        let renderingOptions: renderingOptions_T | undefined = undefined

        if ( this.#checkValidity(rawRequestData) ) {
            // extracting page context
            pageContext = rawRequestData.pageContext

            // trying to build a URL object
            // (if return undefined -> building url failed )
            urlObj = this.#tryBuildingURL( rawRequestData.url )

            renderingOptions = this.#extractRenderingOptions( rawRequestData.renderingOptions )
        }

        // init required attributes
        if (pageContext && urlObj) {
            this.isValid = true
            this.url = urlObj.pathname + urlObj.search + urlObj.hash
            this.pageContext = pageContext
        } else {
            this.isValid = false
            this.url = ''
            this.pageContext = {}
        }

        // init rendering options
        if (!renderingOptions) {
            // getting all defaults
            renderingOptions = this.#extractRenderingOptions( undefined )
        }
        this.ssr = renderingOptions.ssr
    }

    appPropsObject(): appProps_T {
        return {
            url: this.url,
            pageContext: this.pageContext
        }
    }

    serializedAppProps(): string {
        return serialize( 
            this.appPropsObject(),
            // isJSON: true speeds serialization up
            // indicates that the object doesn't contain any function or regexp
            { isJSON: true } 
        )
    }

    asJsonScriptTag(): string {
        return this.ssr 
            ? `<script id="initial-props" type="application/json">${ this.serializedAppProps() }</script>`
            : ''
    }

    /** (private) checks if the structure of the received data is valid 
     * 
     * (do not check the content of the 'pageContext' object)
     * 
     * Remark: 'renderingOptions' is an optionnal key
    */
    #checkValidity( rawRequestData: unknown ): rawRequestData is RequestPostData_T{
        // verifies that the data received have the required format

        if ( isDict(rawRequestData, {keys:['url', 'pageContext']}) ) {
            const { url, pageContext } = rawRequestData
            return isString(url, {nonEmpty:true}) && isDict(pageContext)
        }
        return false
    }

    /** (private) tries to build a URL object using the received relative url */
    #tryBuildingURL( url:string ): URL | undefined {
        const DUMMY_BASE_URL = 'http://dummy.com'
        let urlObj: URL | undefined
        
        try {
            urlObj = new URL( 
                this.#sanitizeRelativeURL(url), 
                DUMMY_BASE_URL // dummy base to build the URL
            )
        } catch (e) {
            // if building URL failed the data were invalid
            return undefined
        }


        return urlObj
    }

    #sanitizeRelativeURL( url:string ): string {
        // double checks that URL starts with a '/' to force it to be considered as relative
        let sanitizedURL = url[0] !== '/' ? '/' + url : url
        return sanitizedURL
    }

    #extractRenderingOptions( renderingOptions?:Partial<renderingOptions_T> ): renderingOptions_T {
        
        const DEFAULT_RENDRING_OPTIONS: renderingOptions_T = {
            ssr: false, 
        }

        const ssr: boolean = isBool(renderingOptions?.ssr) 
            ? renderingOptions.ssr 
            : DEFAULT_RENDRING_OPTIONS.ssr
        
        return { ssr }
    }
}

export {
    RequestData
}