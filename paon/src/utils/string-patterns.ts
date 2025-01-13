/* Utility functions returning regexes */


type patternOptions_T = {
    beginAnchor: boolean,
    endAnchor: boolean
}

function getSiteNamePattern(
    options?: patternOptions_T
): string {
    /* returns a regex string representing a valid site name */

    /* valid site name pattern 
    - only lowercas, numbers and '-' are allowed
    - '-' symbolises a space, they must come one by one
    - site name cannot start or end with '-'
    */
    const pattern = '[a-z0-9]+(?:-[a-z0-9]+)*'
    return _getRegexString(
        pattern,
        options
    )
}

function getUrlSiteNameExtractionPattern(
    options?: patternOptions_T
): string {
    /* extracts a site name from a url segment /<SITE-NAME>/ */
    const siteNamePattern = getSiteNamePattern({
        beginAnchor: false, 
        endAnchor: false
    })
    const pattern = `\/?(${ siteNamePattern })\/?`
    return _getRegexString(
        pattern,
        options
    )
}

function getDotPathSegmentPattern(
    options?: patternOptions_T
): string {
    /* matches "comming back" path segments '.' '..'*/
    const pattern = '\\.+'
    return _getRegexString(
        pattern,
        options
    )
}

/* ------------------------- Private Helpers ------------------------------- */

function _getRegexString( 
    pattern: string,
    options: patternOptions_T | undefined, 
): string {
    
    // anchors are included by default
    const beginAnchor = options ? options.beginAnchor : true
    const endAnchor = options ? options.endAnchor : true

    if ( beginAnchor || endAnchor ) {
        pattern = _formatPattern(
            pattern,
            { beginAnchor, endAnchor }
        )
    }

    return pattern
}

function _formatPattern( 
    pattern: string,
    { beginAnchor, endAnchor }: patternOptions_T
): string {
    /* Conditionnally adds '^' and '$' anchor signs to the regex string */
    
    const begin = beginAnchor ? '^' : ''
    const end = endAnchor ? '$' : ''
    
    return begin + pattern + end
}



export {
    getSiteNamePattern,
    getUrlSiteNameExtractionPattern,
    getDotPathSegmentPattern,
}