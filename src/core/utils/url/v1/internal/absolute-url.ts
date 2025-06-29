import { sanitizeUrl } from "@braintree/sanitize-url"
import { isArray } from "sniffly"

import { _BaseURL, BLANK_URL_STRING } from "./base-url"


type AbsoluteURLOptions_T = {
    onPurifyFail?: 'BLANK_URL' | 'ERROR' | 'IGNORE',
    restrictions?: urlRestrictions_T
}

// Remark: using "loose autocomplete" typescript trick
// (by adding | (string & {}) we allow any string to be a valid 'protocolString_T' without loosing autocomplete)
type protocolString_T = 'http:' | 'https:' | 'ws:' | 'wss:' |'mailto:' | 'blob:' | (string & {})

type urlRestrictions_T = {
    allowedProtocols?: protocolString_T[],
    allowedHosts?: string[]
}

/** Returns true if the value is contain in the allowed values (or if no allowed value were given) */
function _isAllowed(value:string, allowedValues: string[] | undefined) {
    const restrictionIsDefined = isArray(allowedValues, {nonEmpty:true})
    if (!restrictionIsDefined) return true
    
    return allowedValues.includes(value)
}

/** Sub class of URL with sanitisation by default and optional restrictions */
class AbsoluteURL extends _BaseURL {
    
    /** overriden URL static parse method to return an instance from the current sub-class */
    static parse(url:string, base?:string, options?:AbsoluteURLOptions_T) {
        try {
            return new this(url, base, options)
        } catch (err) {
            return null
        }
    }

    constructor(url:string, base?:string, options?:AbsoluteURLOptions_T) {
        
        const {onPurifyFail='BLANK_URL'} = options ?? {}

        // if a base is given, we want to include it to the url
        // straight away, so it is sanitised with the rest
        // (we assign the value to both variables)
        // ℹ️ Remark: 
        // creation of an URL instance might fail if given url is invalid
        // but as we are inside of the initialisation of an URL instance, the errors that
        // can be thrown are all expected and SHOULD NOT BE CAUGHT.
        url = base ? new URL(url, base).toString() : url
        let sanitizedUrl = url

        if (onPurifyFail!=='IGNORE') {
            
            // base url sanitisation with @braintree/sanitize-url
            sanitizedUrl = sanitizeUrl(url)
            if ( 
                sanitizedUrl===BLANK_URL_STRING
                && onPurifyFail==='ERROR'
            ) {
                throw new TypeError(`AbsoluteURL constructor: url sanitization failed for url: ${url} with base: ${base}`)
            }

            // check restrictions
            if (sanitizedUrl!==BLANK_URL_STRING) {
                // ℹ️ Remark: 
                // creation of an URL instance might fail if given url is invalid
                // but as we are inside of the initialisation of an URL instance, the errors that
                // can be thrown are all expected and SHOULD NOT BE CAUGHT.
                const urlObj = new URL(sanitizedUrl)

                // check the protocol restrictions on the url object
                // (by default only http: and https: protocols are allowed)
                const allowedProtocols = options?.restrictions?.allowedProtocols ?? ['http:', 'https:']
                const protocolIsAllowed = _isAllowed(urlObj.protocol, allowedProtocols)

                // if allowed hosts were provided, we make sure url's domain is in the list
                const allowedHosts = options?.restrictions?.allowedHosts
                const hostIsAllowed = _isAllowed(urlObj.hostname, allowedHosts)

                if (!protocolIsAllowed) {
                    if (onPurifyFail==='ERROR') {
                        throw new TypeError(`AbsoluteURL constructor: non allowed protocol ${urlObj.protocol}`)
                    } else {
                        sanitizedUrl = BLANK_URL_STRING
                    }
                } else if (!hostIsAllowed) {
                    if (onPurifyFail==='ERROR') {
                        throw new TypeError(`AbsoluteURL constructor: non allowed host ${urlObj.hostname}`)
                    } else {
                        sanitizedUrl = BLANK_URL_STRING
                    }
                }
            }
        }

        super(sanitizedUrl)
    }
}

export { AbsoluteURL }