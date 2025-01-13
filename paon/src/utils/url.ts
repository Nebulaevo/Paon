/* Utility functions manipulating URLs */

import { getUrlSiteNameExtractionPattern } from '#paon/utils/string-patterns'


function extractSiteNameFromURL( url:URL ): string | undefined {
    
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