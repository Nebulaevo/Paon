import fs from 'node:fs/promises'
import path from 'node:path'

import { consoleBlueMessage, consoleErrorMessage, consoleMessage, consoleSucessMessage } from '#paon/utils/message-logging'
import { getAbsolutePath } from '#paon/utils/file-system'

import promptUser from '#paon/dev-scripts/helpers/prompt-user'
import { interuptScript } from '#paon/dev-scripts/helpers/script-interuption'

/** Deletes a "dist" folder
 * 
 * @param relPath relative path to the dist folder (from project root)
 */
async function deleteDistFolderContent( relPath:string ) {

    // safeguard to avoid deleting something unexpected
    // we check the path points to a 'dist' folder
    const splittedPath = relPath.split( path.sep )
    const isDistFolder = splittedPath.length > 0 && splittedPath[ splittedPath.length-1 ] === 'dist'
    if (!isDistFolder) {
        interuptScript({
            message: `path '${relPath}' doesn't point to a dist folder, operation cancelled`, 
            isError: true
        })
    }

    // we display an "are you sure" prompt to user
    const userResponse = await promptUser( 
        `This action is gonna delete the content inside of ${relPath}, are you sure ? (y/n)` 
    )

    // if answer is not 'y' we cancel the action
    if ( userResponse !== 'y' ) {
        consoleMessage( 'Action cancelled' )
        interuptScript({isError: false})
    }

    // reseting the 'dist' folder
    consoleBlueMessage( 'Deleting the content of the folder', {iconName:'folder'} )

    const folderAbsPath = getAbsolutePath( relPath )
    await fs.rm( folderAbsPath, {recursive: true, force: true, maxRetries:10} )
    await fs.mkdir( folderAbsPath )
    consoleSucessMessage( `${relPath} folder has been reset` )
}

export default deleteDistFolderContent