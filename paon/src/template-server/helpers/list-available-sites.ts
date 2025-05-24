import fs from 'node:fs/promises'

import { getAbsolutePath } from '#paon/utils/file-system'
import { getSiteNamePattern } from '#paon/utils/string-patterns'


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
            throw new Error( `Given site name "${siteName}" doesn't fit expected name pattern (kebab-case with only alphanumerical characters)` )
        }
    }

    return siteNames
}

export { listAvailableSites }