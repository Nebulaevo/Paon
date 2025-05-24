/* Utility functions returning regexes */


type patternOptions_T = {
    beginAnchor: boolean,
    endAnchor: boolean
}

/** Returns a regex string representing a valid site name 
 * 
 * @param options.beginAnchor (boolean) add '^' at start of regex
 * 
 * @param options.endAnchor (boolean) add '$' at end of regex
*/
function getSiteNamePattern(
    options?: patternOptions_T
): string {

    /* valid site name pattern 
    - only lowercas, numbers and '-' are allowed
    - '-' symbolises a space, they must come one by one
    - site name cannot start or end with '-'
    */
    const pattern = '[a-z0-9]+(?:-[a-z0-9]+)*'
    return _formatPattern(
        pattern,
        options
    )
}

/** Returns a regex extracting a site name from a url segment /<SITE-NAME>/ 
 * 
 * @param options.beginAnchor (boolean) add '^' at start of regex
 * 
 * @param options.endAnchor (boolean) add '$' at end of regex
*/
function getUrlSiteNameExtractionPattern(
    options?: patternOptions_T
): string {
    const siteNamePattern = getSiteNamePattern({
        beginAnchor: false, 
        endAnchor: false
    })
    const pattern = `\/?(${ siteNamePattern })\/?`
    return _formatPattern(
        pattern,
        options
    )
}

/* ------------------------- Private Helpers ------------------------------- */

/** Util optionally adding '^' and '$' to regex depending on provided options */
function _formatPattern( 
    pattern: string,
    options: patternOptions_T | undefined, 
): string {
    
    // anchors are included by default
    const beginAnchor = options ? options.beginAnchor : true
    const endAnchor = options ? options.endAnchor : true

    if ( beginAnchor || endAnchor ) {
        const begin = beginAnchor ? '^' : ''
        const end = endAnchor ? '$' : ''
        pattern = begin + pattern + end
    }

    return pattern
}


export {
    getSiteNamePattern,
    getUrlSiteNameExtractionPattern,
}