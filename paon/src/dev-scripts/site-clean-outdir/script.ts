import { consoleMessage } from '#paon/utils/message-logging'

import deleteDistFolderContent from '#paon/dev-scripts/helpers/delete-dist-folder-content'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'
import { interuptScript } from '#paon/dev-scripts/helpers/script-interuption'

import { 
    FOLDER_REL_PATH,
    COMMAND_DOCUMENTATION
} from './constants.js'


async function script() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        interuptScript({isError: false})
    }

    await deleteDistFolderContent( FOLDER_REL_PATH )
}

export default script