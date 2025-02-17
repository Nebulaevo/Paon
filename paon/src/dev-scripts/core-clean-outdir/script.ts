/* Dev command deleting the content of the ./paon/dist folder */

import { consoleMessage, consoleWarnMessage } from '#paon/utils/message-logging'

import deleteDistFolderContent from '#paon/dev-scripts/helpers/delete-dist-folder-content'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { interuptScript } from '#paon/dev-scripts/helpers/script-interuption'

import { 
    COMMAND_DOCUMENTATION,
    FOLDER_REL_PATH
} from './constants.js'


async function script() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        interuptScript({isError: false})
    }

    consoleWarnMessage( 
        "This operation will whipe the core code of Paon, including the template server and the dev commands, "
        + "you will need to run 'npm run core:build' to rebuild the core before being able to use any of it.",
        { iconName:'warning' }
    )
    
    await deleteDistFolderContent( FOLDER_REL_PATH )
}

export default script