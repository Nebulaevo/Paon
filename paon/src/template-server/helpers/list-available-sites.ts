import fs from 'node:fs/promises'

import { getAbsolutePath } from '#paon/utils/file-system'
import { getSiteNamePattern } from '#paon/utils/string-patterns'
import { consoleErrorMessage, consoleMessage } from '#paon/utils/message-logging'


/** Function listing the site folders in 'folderPath' */
async function listAvailableSites( folderPath:string ): Promise<string[]> {
    const folderAbsPath = getAbsolutePath( folderPath )

    const dirents = await fs.readdir( 
        folderAbsPath,
        { withFileTypes: true }
    )

    const siteNames = dirents
        .filter( dirent => dirent.isDirectory() )
        .map( dirent => dirent.name )


    // double check that the sites have expected site name pattern
    const validateSiteNamePattern = new RegExp( getSiteNamePattern() )
    for (const siteName of siteNames ) {
        if ( !siteName.match( validateSiteNamePattern ) ) {
            consoleErrorMessage( `found website named '${siteName}' in dist/server, this name doesn't match the expected site name pattern` )
            consoleMessage( "site name should be, lowercase, alpha-numerical, kebab-case, shoudn't start or end with a hyphen '-' ")
            process.exit(1)
        }
    }

    return siteNames
}

export default listAvailableSites