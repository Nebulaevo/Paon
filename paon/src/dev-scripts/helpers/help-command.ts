

/** Constant representing the argument for which we display the command documentation */
const HELP_COMMAND = 'help'


/** Function returning true if any given arg is the provided HELP_COMMAND */
function isAskingForHelp(): boolean {
    const args = process.argv.slice(2)
    return args.includes( HELP_COMMAND )
}

/** Function returning a formatted text indicating how to display the command documentation */
function getForMoreInfoText( scriptName:string ) {
    return `
For more information run:
>>> npm run ${scriptName} ${HELP_COMMAND}
    `
}

export {
    HELP_COMMAND,
    isAskingForHelp,
    getForMoreInfoText
}