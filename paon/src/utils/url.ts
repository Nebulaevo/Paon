/* Utility functions manipulating URLs */

import { getUrlSiteNameExtractionPattern } from '#paon/utils/string-patterns'

/** Given a URL object, with a pathname expected to be "/SITE-NAME/",
 * extracts the site name form the pathname
 */
function extractSiteNameFromURL( url:URL ): string | undefined {
    // no reason for a site name to be more than 98 characters (+slashes)
    if (url.pathname.length>100) return undefined

    const siteNameExtractionPattern = new RegExp( 
        getUrlSiteNameExtractionPattern()
    )

    const match = url.pathname.match( siteNameExtractionPattern )
    
    if ( match ) {
        return match[1]
    }
    return undefined
}

export {
    extractSiteNameFromURL
}