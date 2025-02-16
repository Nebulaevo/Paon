/* file auto-running corresponding script (site:build-all) */
import { informUserOfHelpCommand } from "#paon/dev-scripts/helpers/help-command"
import { isScriptClosureRequest } from '#paon/dev-scripts/helpers/script-interuption'

import { SCRIPT_NAME } from './constants.js'
import script from "./script.js"


async function run() {
    try {
        script()
    } catch (e) {
        if ( !isScriptClosureRequest(e) ) {
            informUserOfHelpCommand( SCRIPT_NAME )
            throw e
        }
    }
}
    

await run()