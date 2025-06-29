import { sanitizeUrl } from "@braintree/sanitize-url"

import { _BaseURL, BLANK_URL_STRING } from "./base-url"

type RelativeURLOptions_T = {
    onPurifyFail?: 'ERROR' | 'IGNORE' // "about:blank" is considered an absolute URL so we cannot allow it as fallback value
}

/** Sub class of URL with sanitisation by default representing a relative URL */
class RelativeURL extends _BaseURL {
    static DUMMY_BASE_FALLBACK = 'https://relative-url.com'

    /** overriden URL static parse method to return an instance from the current sub-class */
    static parse(url:string, _base?:undefined, options?:RelativeURLOptions_T) {
        try {
            return new this(url, options)
        } catch (err) {
            return null
        }
    }

    constructor(url: string, options?:RelativeURLOptions_T) {
        
        let sanitizedUrl = url

        const {onPurifyFail='ERROR'} = options ?? {}
        if (onPurifyFail!=='IGNORE' && url.length>0) {
            // REMARQUE:
            // about:blank is considered an absolute URL
            // so we don't have another option than to fail 
            sanitizedUrl = sanitizeUrl(sanitizedUrl)
            if (sanitizedUrl === BLANK_URL_STRING ) throw new TypeError(`RelativeURL constructor: url purification failed for ${url}`)
        }
        
        super(sanitizedUrl, RelativeURL.DUMMY_BASE_FALLBACK)
        
        // we block access to all informations about the url base
        this.#redefineNonRelativeProperties()
    }

    /** Hides all non relative properties of the URL object */
    #redefineNonRelativeProperties() {
        const ignoredValueDescriptor = {
            enumerable: false,
            configurable: false,
            writable: false,
            value: ''
        }
        
        Object.defineProperty(this, 'protocol', ignoredValueDescriptor)
        Object.defineProperty(this, 'port', ignoredValueDescriptor)
        Object.defineProperty(this, 'username', ignoredValueDescriptor)
        Object.defineProperty(this, 'password', ignoredValueDescriptor)
        Object.defineProperty(this, 'host', ignoredValueDescriptor)
        Object.defineProperty(this, 'hostname', ignoredValueDescriptor)
        Object.defineProperty(this, 'origin', ignoredValueDescriptor)

        /** href, toJson ans toString are redefined seperately as getter methods to be dynamic */
    }

    /** Overriden: returning relative url */
    get href(): string {
        return `${this.pathname}${this.search}${this.hash}`
    }

    /** Overriden: returning relative url */
    toJSON(): string {
        return this.href
    }

    /** Overriden: returning relative url */
    toString(): string {
        return this.href
    }
}

export { RelativeURL }