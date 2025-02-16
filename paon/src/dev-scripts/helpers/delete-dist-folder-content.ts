import fs from 'node:fs/promises'
import path from 'node:path'

import promptUser from '#paon/dev-scripts/helpers/prompt-user'
import { consoleBlueMessage, consoleErrorMessage, consoleMessage, consoleSucessMessage } from '#paon/utils/message-logging'
import { getAbsolutePath } from '#paon/utils/file-system'

async function deleteDistFolderContent( relPath:string ) {

    // safeguard to avoid deleting something unexpected
    // we check the path points to a 'dist' folder
    const splittedPath = relPath.split( path.sep )
    const isDistFolder = splittedPath.length > 0 && splittedPath[ splittedPath.length-1 ] === 'dist'
    if (!isDistFolder) {
        consoleErrorMessage( `path '${relPath}' doesn't point to a dist folder, operation cancelled` )
        process.exit(1)
    }

    // we display an "are you sure" prompt to user
    const userResponse = await promptUser( 
        `This action is gonna delete the content inside of ${relPath}, are you sure ? (y/n)` 
    )

    // if answer is not 'y' we cancel the action
    if ( userResponse !== 'y' ) {
        consoleMessage( 'Action cancelled' )
        process.exit(0)
    }

    // reseting the 'dist' folder
    consoleBlueMessage( 'Deleting the content of the folder', {iconName:'folder'} )

    const folderAbsPath = getAbsolutePath( relPath )
    await fs.rm( folderAbsPath, {recursive: true, force: true, maxRetries:10} )
    await fs.mkdir( folderAbsPath )
    consoleSucessMessage( `${relPath} folder has been reset` )
}

export default deleteDistFolderContent