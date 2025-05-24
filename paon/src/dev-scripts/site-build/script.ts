/** Dev command running commands building a site frontend */

import childProcess from 'node:child_process'
import fs from 'node:fs/promises'

import { consoleErrorMessage, consoleBlueMessage, consoleSucessMessage, consoleMessage } from '#paon/utils/message-logging'
import { getAbsolutePath, getSiteIndexHtmlPath } from '#paon/utils/file-system'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { interuptScript } from '#paon/dev-scripts/helpers/script-interuption'
import getSiteName from '#paon/dev-scripts/helpers/get-site-name'
import { getSiteBuildCommand } from '#paon/dev-scripts/site-build/template-command'

import {
    COMMAND_DOCUMENTATION
} from './constants.js'


async function script() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        interuptScript({isError: false})
    }

    // extract site name and check validity
    const siteName = await getSiteName({expectedSiteState: 'EXISTANT'})

    // running site building commands in a child process
    consoleBlueMessage( `${siteName} website`, {iconName:'globe'} )
    consoleBlueMessage( `Vite building...`, {iconName:'lightning'} )

    const buildSiteCommand = getSiteBuildCommand( siteName )

    const buildingProcess = childProcess.spawn(
        buildSiteCommand,
        [], { shell: true }
    )
    buildingProcess.stderr.pipe( process.stderr )
    buildingProcess.stdout.pipe( process.stdout )

    buildingProcess.on( 'close', async (code) => {

        if ( code !== null && code > 0 ) {
            interuptScript({
                message: `"${buildSiteCommand}"\nBuild commands failed`,
                isError: true
            })
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


export default script