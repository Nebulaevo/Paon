/* file auto-running corresponding script (site:build) */
import { informUserOfHelpCommand } from "#paon/dev-scripts/helpers/help-command"

import { SCRIPT_NAME } from './constants.js'
import script from "./script.js"


async function run() {
    try {
        script()
    } catch (e) {
        informUserOfHelpCommand( SCRIPT_NAME )
        throw e
    }
}
    

await run()