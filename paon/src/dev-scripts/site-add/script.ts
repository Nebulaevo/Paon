//** Dev command scaffolding a new site folder */

import fs from 'node:fs/promises'
import path from 'node:path'

import { consoleErrorMessage, consoleBlueMessage, consoleSucessMessage, consoleMessage } from '#paon/utils/message-logging'
import { getAbsolutePath } from '#paon/utils/file-system'

import extractSiteNameArg from '#paon/dev-scripts/helpers/extract-site-name-arg'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { 
    SCRIPT_NAME, 
    COMMAND_DOCUMENTATION, 
    FOR_MORE_INFORMATION_TEXT, 
    FOLDER_STRUCTURE, 
    STARTER_FILES 
} from './constants.js'


async function script() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        process.exit(0)
    }

    // extract site name and check validity
    const siteName = await extractSiteNameArg({
        scriptName: SCRIPT_NAME, 
        forMoreInfoText: FOR_MORE_INFORMATION_TEXT,
        expectedSiteStatus: 'NON_EXISTANT'
    })

    consoleBlueMessage( `Scaffolding ${siteName} site folder`, {iconName:'building'} )

    // creating directory structure
    const siteFolderPath = getAbsolutePath( `./src/sites/${siteName}` )
    try {
        // root site folder
        await fs.mkdir( siteFolderPath, { recursive: true } )
        
        // folders in the root site folder
        const folderCreationTasks = FOLDER_STRUCTURE.rootFolders.map( folderPath => {
            return fs.mkdir( path.resolve( siteFolderPath, folderPath ) )
        })
        await Promise.all(folderCreationTasks)

        // deeper folders
        const secondaryFolderCreationTasks = FOLDER_STRUCTURE.secondaryFolders.map( folderPath => {
            return fs.mkdir( path.resolve( siteFolderPath, folderPath ) )
        })
        await Promise.all( secondaryFolderCreationTasks )

    } catch(e) {
        consoleErrorMessage(
            `setup of ${siteName} site default directory structure failed with error:`
        )
        throw e
    }
    consoleSucessMessage( 'Created base folder structure', {iconName:'folder'} )
    
    // create starter files
    try {
        const fileCreationTasks = STARTER_FILES.map( async fileInfo => {
            
            let file = await fs.readFile(
                getAbsolutePath( fileInfo.path ),
                { encoding: 'utf-8' }
            )

            await fs.writeFile(
                path.resolve( siteFolderPath, fileInfo.outputPath ),
                file,
                {
                    encoding: 'utf-8',
                    flag: 'wx' // fail if the path already exists
                }
            )
        })

        await Promise.all( fileCreationTasks )

    } catch(e) {
        consoleErrorMessage(
            `default files creation in ./src/sites/${siteName} failed with error:`
        )
        throw e
    }

    consoleSucessMessage( 'Created starter files', {iconName:'document'} )
    consoleSucessMessage( 'Operation finished', {iconName:'checked'} )
}

export default script