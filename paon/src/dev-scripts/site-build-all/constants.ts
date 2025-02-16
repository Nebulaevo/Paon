import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'

/** name triggering that script in package.json 'scripts' */
const SCRIPT_NAME = 'site:build-all'

/** documentation of the command */
const COMMAND_DOCUMENTATION = `
📄 npm run ${SCRIPT_NAME} (help)
-------------------------

>>> npm run ${SCRIPT_NAME}
Triggers the site:build command for every site in the src/sites/ folder

>>> npm run ${SCRIPT_NAME} ${HELP_COMMAND}
displays command documentation
`



export {
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION
}