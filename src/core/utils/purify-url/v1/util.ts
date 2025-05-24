import { sanitizeUrl as baseSanitizeUrl } from "@braintree/sanitize-url"


type protocolString_T = 'http:' | 'https:' | 'ws:' | 'wss:' |'mailto:' | 'blob:'
type urlPatterns = string | RegExp

type _absoluteUrlPurifierOptions_T = {
    allowedProtocols: protocolString_T[],
    allowedDomains: string[],
    allowedUrlPatterns: urlPatterns[],
}

type urlPurifierOptions_T = {
    forceRelativeUrl?: boolean,
    allowedProtocols?: protocolString_T[],
    allowedDomains?: string[],
    allowedUrlPatterns?: urlPatterns[],
}

type blankUrlString_T = 'about:blank'


const BLANK_URL_STRING: blankUrlString_T = 'about:blank'


function _toUrlObject( 
    sanatizedUrlString: string 
): { isRelativeURL: boolean, urlObject: URL|blankUrlString_T } {

    let urlObject: URL
    const DUMMY_BASE_URL = 'https://google.com'

    // first we try to parse it as an absolute url
    try {
        urlObject = new URL( sanatizedUrlString )
        return { isRelativeURL: false, urlObject: urlObject }
    } catch(e) {}

    // if it failed, we try as a relative url
    // using a dummy url base
    try {
        urlObject = new URL( sanatizedUrlString, DUMMY_BASE_URL )
        return { isRelativeURL: true, urlObject: urlObject }
    } catch(e) {}

    // safeguard 
    // (shouldn't happen because url was already verified by 'sanitizeUrl')
    return { isRelativeURL: false, urlObject: BLANK_URL_STRING }
}

function _toRelativeUrlString( urlObject: URL ): string {
    return urlObject.pathname + urlObject.search + urlObject.hash
}

function _valueIsAllowed( value:string, allowedValues: string[] ): boolean {
    return allowedValues.includes( value )
}

function _pathMatchesAllowedPattern( urlObject: URL, allowedUrlPatterns: urlPatterns[] ) {
    const url = urlObject.toString()
    for ( const pattern of allowedUrlPatterns ) {
        if ( url.match( pattern ) ) {
            return true
        }
    }
    return false
}

function _purifyAbsoluteUrl( 
    urlObject: URL, 
    options: _absoluteUrlPurifierOptions_T 
): string {

    // checking that url protocol is allowed
    // ( http and https by default )
    const allowedProtocols: protocolString_T[] =  options.allowedProtocols.length > 0 ? 
        options.allowedProtocols : [ 'http:', 'https:' ]
    if ( !_valueIsAllowed(urlObject.protocol, allowedProtocols) ) {
        return BLANK_URL_STRING
    }

    // if a list of allowed domains were provided (including subdomains)
    // we check if the domain is allowed
    if ( 
        options.allowedDomains.length > 0
        && !_valueIsAllowed(urlObject.hostname, options.allowedDomains)
    ) {
        return BLANK_URL_STRING
    }

    // if a list of allowed url patterns
    if (
        options.allowedUrlPatterns.length > 0
        && !_pathMatchesAllowedPattern(urlObject, options.allowedUrlPatterns)
    ) {
        return BLANK_URL_STRING
    }

    return urlObject.toString()
}

/** Utility function purifying a url and applying custom restrictions
 * 
 * ⚠️ All urls comming from untrusted sources should be purified
 * 
 * @param {string} url 
 * the url that needs to be purified
 * 
 * @param {object} options 
 * additionnal restrictions applied to the url
 * 
 * @param {boolean} options.forceRelativeUrl
 * if true, the resulting url is guaranteed to be relative or "about:blank"
 * 
 * @param {Array<string>} options.allowedProtocols
 * ( default if empty is ['http:', 'https:'] )
 * if true, function will return "about:blank" for any link using another protocol
 * 
 * @param {Array<string>} options.allowedDomains
 * ( expects "subdomain.domain.tld" )
 * if provided, the function will return "about:blank" for any link to a 
 * domain / subdomain missing from the list
 * 
 * @param {Array<string|RegExp>} options.allowedUrlPatterns
 * if provided, the function will return "about:blank" for any link that doesn't 
 * match any provided patterns
 * 
 * @returns {string} 
 * Returns a purified url, or "about:blank" if the link doesn't 
 * satisfy the requirements or is dangerous
 * (BLANK_URL_STRING value exported and can be used for comparaison)
 * 
 * @example
 * import { purifyUrl, BLANK_URL_STRING } from '@core:utils/purify-url/v1/util'
 * 
 * const unsafeURL = "http://some.unsafe/url/"
 * 
 * const purifiedURL = purifyUrl( unsafeURL )
 * if ( purifiedURL === BLANK_URL_STRING ) {
 *      // URL was invalid
 * } else {
 *      // URL was purified successfully
 * }
 */
function purifyUrl( 
    url?: string, 
    options?: urlPurifierOptions_T 
): string {

    // Sanitize URL using @braintree/sanitize-url
    const sanitizedUrl = baseSanitizeUrl(url)
    if ( sanitizedUrl === BLANK_URL_STRING ) {
        return BLANK_URL_STRING
    }

    const { isRelativeURL, urlObject } = _toUrlObject( sanitizedUrl )
    if ( urlObject === BLANK_URL_STRING ) {
        return BLANK_URL_STRING
    }

    if ( isRelativeURL || ( options?.forceRelativeUrl )) {
        return _toRelativeUrlString( urlObject )
    }

    const absoluteUrlPurifierOptions = {
        allowedProtocols: options?.allowedProtocols ? options.allowedProtocols : [],
        allowedDomains: options?.allowedDomains ? options.allowedDomains : [],
        allowedUrlPatterns: options?.allowedUrlPatterns ? options.allowedUrlPatterns : [],
    }

    return _purifyAbsoluteUrl(
        urlObject,
        absoluteUrlPurifierOptions
    )
}

export {
    purifyUrl,
    BLANK_URL_STRING
}