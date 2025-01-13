import type { Dict_T } from '#paon/utils/types'
import { isNonEmptyString } from '#paon/utils/checks'
import { consoleErrorMessage, consoleMessage } from '#paon/utils/message-logging'

type extractScriptArgsOptions_T = {
    argNames: string[],
    kwArgNames: string[],
    requiredArgs: string[]
}

type scritpInfo_T = {
    scriptName: string,
    forMoreInfoText: string,
}

/** Utility function extracting arguments given to a node script
 * 
 * This function will fail and exit the process if unexpected arguments are found
 * to prevent command mistakes.\
 * This function doesn't validate the received values.\
 * ( except checking the value is not undefined for required arguments )
 * 
 * @param {object} scriptInfo
 * meta data on the running script for message logging
 * 
 * @param {string} scriptInfo.scriptName
 * the name used to call the current script:\
 * npm run -scriptName-
 * 
 * @param {string} scriptInfo.forMoreInfoText
 * the arg value for which the script displays the manual
 * 
 * @param {object} options
 * details on the expected arguments
 * 
 * @param {string[]} options.argNames
 * names (in order) to give to nameless arguments
 * ex 'someargument': npm run myscript.js someargument
 * 
 * @param {string[]} options.kwArgNames
 * names of allowed keyword arguments
 * ex 'category': npm run myscript.js category=book
 * 
 * @param {string[]} options.requiredArgs
 * list of arguments that have to be provided for the script to run
 * (arguments and keyword arguments)
 * 
 * @returns {object} 
 * returns a dictionnary of keys mapped to their given string value or undefined
 */
function extractProcessArgs( 
    { scriptName, forMoreInfoText }: scritpInfo_T,
    { argNames, kwArgNames, requiredArgs }: extractScriptArgsOptions_T 
): Dict_T<string | undefined> {
    const argsDict: Dict_T<string | undefined> = {}
    const args = process.argv.slice(2)
    
    // because the pattern is obscure and doesn't really need to be used elsewhere
    // it isn't in "#paon/utils/string-patterns"
    // ^([a-zA-Z0-9\-]+) - name
    // (?:([^ ='"]+)|"([^"]+)"|'([^']+)') - 3 different options to match value
    const kwArgPattern = new RegExp( 
        `^([a-zA-Z0-9\-]+)=(.+)$`
    )
    
    for (const arg of args) {

        const match = arg.match( kwArgPattern )

        if ( match ) { /* handling keyword arguments */
            
            // extracting capture groups
            const name = match[1] || ''
            const value = match[2] || ''
            
            // checking if that keyword argument is expected and not already set
            if ( !kwArgNames.includes(name) ) {
                consoleErrorMessage(`${scriptName} script received unexpected '${arg}' keyword argument`)
                consoleMessage( forMoreInfoText )
                process.exit(1)
            
            } else if ( argsDict[name] ) {
                consoleErrorMessage(`${scriptName} script received 2 values for '${name}' keyword argument`)
                consoleMessage( forMoreInfoText )
                process.exit(1)
            }

            argsDict[name] = isNonEmptyString(value) ? value : undefined

        } else { /* handling non-keyword arguments */
            
            const name = argNames.shift()
            
            if (!name) {
                consoleErrorMessage(`${scriptName} script received more non-keyword arguments than expected`)
                consoleMessage( forMoreInfoText )
                process.exit(1)
            }

            argsDict[ name ] = arg
        }
    }

    // ensure that arguments marked as required are provided
    for ( const requiredArg of requiredArgs ) {
        const defined = isNonEmptyString( argsDict[requiredArg] )
        if ( !defined ) {
            consoleErrorMessage(`'${requiredArg}' arg is required to run ${scriptName}`)
            consoleMessage( forMoreInfoText )
            process.exit(1)
        }
    }

    return argsDict
}

export default extractProcessArgs