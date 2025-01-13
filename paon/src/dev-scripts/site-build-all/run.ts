import fs from 'node:fs/promises'
import childProcess from 'node:child_process'

import { getAbsolutePath } from '#paon/utils/file-system'
import { consoleErrorMessage, consoleMessage } from '#paon/utils/message-logging'

import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { SCRIPT_NAME as BUILD_SCRIPT_COMMAND } from '#paon/dev-scripts/site-build/constants'
import { 
    COMMAND_DOCUMENTATION,
} from '#paon/dev-scripts/site-build-all/constants'


async function run() {

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

    // recursively calling 'npm run build:site' for each site
    // IMPORTANT one by one
    // (so that 'index.html' has time to be renamed for each site)
    let index = 0
    const maxIndex = siteNames.length -1

    /* Recursive callback function triggering the operation for every site folder from src/sites/ */
    function next() {
        if ( index <= maxIndex ) {
            
            const siteName = siteNames[index]
            const command = `npm run ${BUILD_SCRIPT_COMMAND} ${siteName}`
            const buildingProcess = childProcess.spawn(
                command,
                [], {shell: true}
            )

            buildingProcess.stdout.pipe( process.stdout )
            buildingProcess.stderr.pipe( process.stderr )

            buildingProcess.on( 'close', async (code) => {
                if ( code !== null && code > 1 ) {
                    consoleErrorMessage( `${command} command failed` )
                    process.exit(1)
                }

                next()
            }) 

            index ++
        }
    }
    next()
}

await run()