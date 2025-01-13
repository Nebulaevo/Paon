import { consoleMessage } from '#paon/utils/message-logging'

import deleteDistFolderContent from '#paon/dev-scripts/helpers/delete-dist-folder-content'
import { isAskingForHelp } from '#paon/dev-scripts/helpers/help-command'


import { 
    FOLDER_REL_PATH,
    COMMAND_DOCUMENTATION
} from '#paon/dev-scripts/site-clean-outdir/constants'


async function run() {

    // display help ?
    if ( isAskingForHelp() ) {
        consoleMessage(COMMAND_DOCUMENTATION)
        process.exit(0)
    }

    await deleteDistFolderContent( FOLDER_REL_PATH )
}

await run()