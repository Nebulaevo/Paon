//** Dev command running commands building a site frontend */

import childProcess from 'node:child_process'
import fs from 'node:fs/promises'

import { consoleErrorMessage, consoleBlueMessage, consoleSucessMessage, consoleMessage } from '#paon/utils/message-logging'
import { getAbsolutePath, getSiteIndexHtmlPath } from '#paon/utils/file-system'

import extractSiteNameArg from '#paon/dev-scripts/helpers/extract-site-name-arg'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { getBuildClientCommand, getBuildServerCommand } from '#paon/dev-scripts/site-build/command-templates'
import { 
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION,
    FOR_MORE_INFORMATION_TEXT
} from '#paon/dev-scripts/site-build/constants'


async function run() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        process.exit(0)
    }

    // extract site name and check validity
    const siteName = await extractSiteNameArg({
        scriptName: SCRIPT_NAME, 
        forMoreInfoText: FOR_MORE_INFORMATION_TEXT,
        expectedSiteStatus: 'EXISTANT'
    })

    // running site building commands in a child process
    consoleBlueMessage( `${siteName} website`, {iconName:'globe'} )
    consoleBlueMessage( `Vite building...`, {iconName:'lightning'} )

    const buildClientCommand = getBuildClientCommand( siteName )
    const buildServerCommand = getBuildServerCommand( siteName )

    const buildingProcess = childProcess.spawn(
        `${buildClientCommand} && ${buildServerCommand}`,
        [], { shell: true }
    )
    buildingProcess.stderr.pipe( process.stderr )
    buildingProcess.stdout.pipe( process.stdout )

    buildingProcess.on( 'close', async (code) => {

        if ( code !== null && code > 0 ) {
            consoleErrorMessage( buildClientCommand )
            consoleErrorMessage( buildServerCommand )
            consoleErrorMessage( 'build commands failed' )
            process.exit(1)
        }
        consoleSucessMessage( `built successfully`, {iconName:'parcel'} )

        /* Renaming the generated 'index.html' file to 'index-<SITE-NAME>.html' 
        to prevent it from being ovewritten by another site's index.html */
        consoleBlueMessage( `Renaming index.html to index-${siteName}.html...`, {iconName:'document'} )

        const oldIndexPath = getAbsolutePath( 'dist/client/index.html' )
        const newIndexPath = getSiteIndexHtmlPath({ 
            siteName: siteName,
            folder: 'dist'
        })

        try {
            await fs.rename( oldIndexPath, newIndexPath )
        } catch (e) {
            consoleErrorMessage(
                `renaming 'index.html' file to 'index-${siteName}.html' failed with error:`
            )
            throw e
        }
        
        consoleSucessMessage( `Website ready to go!`, {iconName:'checked'} )
    })
}


await run()