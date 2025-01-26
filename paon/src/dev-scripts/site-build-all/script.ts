import fs from 'node:fs/promises'

import { getAbsolutePath } from '#paon/utils/file-system'
import { consoleMessage } from '#paon/utils/message-logging'

import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { 
    COMMAND_DOCUMENTATION,
} from './constants.js'

import {
    runBuildSiteCommand
} from './sub-process.js'

async function script() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        process.exit(0)
    }

    // listing site folders in src/sites 
    const sitesFolderAbsPath = getAbsolutePath( 'src/sites' ) 
    const dirents = await fs.readdir( 
        sitesFolderAbsPath,
        { withFileTypes: true }
    )
    const siteNames = dirents
        .filter( dirent => dirent.isDirectory() )
        .map( dir => dir.name )


    for ( const siteName of siteNames ) {
        try {
            await runBuildSiteCommand( siteName )
        } catch(e) {
            process.exit(1)
        }
    }
}

export default script