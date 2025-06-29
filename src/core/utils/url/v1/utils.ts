import { BLANK_URL_STRING } from './internal/base-url'
import { AbsoluteURL } from "./internal/absolute-url"
import { RelativeURL } from "./internal/relative-url"

type EnhancedURL_T = AbsoluteURL | RelativeURL

/** Returns true if given string can be parsed as a URL */
function isAbsoluveUrl(url:string): boolean {
    return URL.canParse(url)
}

/** Returns true if given string can only be parsed as URL with a base */
function isRelativeUrl(url:string): boolean {
    if (isAbsoluveUrl(url)) return false
    return URL.canParse(url, RelativeURL.DUMMY_BASE_FALLBACK)
}

export {
    AbsoluteURL,
    RelativeURL,

    BLANK_URL_STRING,
    
    isAbsoluveUrl,
    isRelativeUrl
}

export type {
    EnhancedURL_T
}