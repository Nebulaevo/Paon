/** Dev command running commands building all registered sites frontends */

import fs from 'node:fs/promises'

import { getAbsolutePath } from '#paon/utils/file-system'
import { consoleMessage } from '#paon/utils/message-logging'

import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { interuptScript } from '#paon/dev-scripts/helpers/script-interuption'
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
        interuptScript({isError: false})
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

    // build commands have to be run sequentially
    // because each build task will produce an "index.html" file 
    // that have to be renamed to "build-SITENAME.html"
    for (const siteName of siteNames) {
        try {
            await runBuildSiteCommand( siteName )
        } catch(e) {
            interuptScript({
                message: `Build command for "${siteName}" website failed with ${e}`,
                isError: true
            })
        }
    }
}

export default script