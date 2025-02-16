import { consoleMessage } from "#paon/utils/message-logging"

/** Constant representing the argument for which we display the command documentation */
const HELP_COMMAND = 'help'


/** Function returning true if any given arg is the provided HELP_COMMAND */
function isAskingForHelp(): boolean {
    const args = process.argv.slice(2)
    return args.includes( HELP_COMMAND )
}

/** Function displaying a message in the console to inform user how to display the doc */
function informUserOfHelpCommand(scriptName: string) {
    consoleMessage(`
For more information run:
>>> npm run ${scriptName} ${HELP_COMMAND}
    `)
}

export {
    HELP_COMMAND,
    isAskingForHelp,
    informUserOfHelpCommand
}