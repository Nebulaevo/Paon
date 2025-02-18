import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'

/** name triggering that script in package.json 'scripts' */
const SCRIPT_NAME = 'site:build'

/** documentation of the command */
const COMMAND_DOCUMENTATION = `
📄 ${SCRIPT_NAME} (doc)
-------------------------

>>> npm run ${SCRIPT_NAME}
 OR
>>> npm run ${SCRIPT_NAME} <SITE-NAME>
triggers the build process for a site
- site name have to be an existing site folder in ./src/sites/
- site name can only be made of letters and numbers, separated by "-"
  ex: "my-project-7"
- site name cannot start or end with "-"
  ex: "-mysite" and "mysite-" are invalid
- only one "-" at the time is allowed
  ex: "my--site" is invalid

>>> npm run ${SCRIPT_NAME} ${HELP_COMMAND}
displays command documentation
`

export { 
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION
}