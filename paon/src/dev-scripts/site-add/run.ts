/* file auto-running corresponding script (site:add) */
import { informUserOfHelpCommand } from "#paon/dev-scripts/helpers/help-command"
import { isScriptClosureRequest } from '#paon/dev-scripts/helpers/script-interuption'

import { SCRIPT_NAME } from './constants.js'
import script from "./script.js"


async function run() {
    script()
        .catch(err => {
            if ( !isScriptClosureRequest(err) ) {
                informUserOfHelpCommand( SCRIPT_NAME )
                throw err
            }
        })
}
    

await run()