import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'

/** name triggering that script in package.json 'scripts' */
const SCRIPT_NAME = 'site:clean-outdir'

/** path to the folder the command deletes the content of */
const FOLDER_REL_PATH = './dist'

/** documentation of the command */
const COMMAND_DOCUMENTATION = `
📄 ${SCRIPT_NAME} (doc)
-------------------------

>>> npm run ${SCRIPT_NAME}
deletes the content of the ${FOLDER_REL_PATH} folder 

>>> npm run ${SCRIPT_NAME} ${HELP_COMMAND}
displays command documentation
`


export {
    SCRIPT_NAME, 
    FOLDER_REL_PATH,
    COMMAND_DOCUMENTATION
}