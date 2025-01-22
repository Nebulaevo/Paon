import { HELP_COMMAND, getForMoreInfoText } from '#paon/dev-scripts/helpers/help-command'

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

/** text explaining how to display the command documentation (used after some errors) */
const FOR_MORE_INFORMATION_TEXT = getForMoreInfoText(SCRIPT_NAME)


export {
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION,
    FOR_MORE_INFORMATION_TEXT
}