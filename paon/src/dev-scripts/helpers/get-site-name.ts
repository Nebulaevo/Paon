import { getSiteNamePattern } from '#paon/utils/string-patterns'
import { findInFolder } from '#paon/utils/file-system'

import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'
import promptUser from "#paon/dev-scripts/helpers/prompt-user"
import { interuptScript } from '#paon/dev-scripts/helpers/errors'



type expectedSiteState_T = 'EXISTANT' | 'NON_EXISTANT'

type extractionKwargs_T = {
    expectedSiteState: expectedSiteState_T,
    ifMultipleScriptArgs?: 'ERROR' | 'TAKE_FIRST' // behavior if more than one arg given
}

type siteNameValidationKwargs_T = {
    siteName: string,
    expectedSiteState: expectedSiteState_T
}

/** Function in charge of getting the targetted site name
 * 
 * (function assumes the script can be only called with zero or one argument)
 * 
 * if no site name was given, or the site name 
 */
async function getSiteName(kwargs: extractionKwargs_T): Promise<string> {

    const { expectedSiteState, ifMultipleScriptArgs='ERROR' } = kwargs

    const processArgs = process.argv.slice(2)
    let siteName: string
    switch (processArgs.length) {
            
        case 0:
            // if siteName wasn't provided as argument
            // we prompt the user
            siteName = await promptUser( 'Site name:' )
            break
        
        case 1:
            // if siteName was provided as argument
            siteName = processArgs[0]
            break
        
        default: // more than 1
            if (ifMultipleScriptArgs == 'TAKE_FIRST') {
                siteName = processArgs[0]
            } else { // ifMultipleScriptArgs == 'ERROR'
                // by default we consider that script only takes one arg, 
                // and that if more were provided it is probably a mistake
                interuptScript( `Script was called with ${processArgs.length} arguments (0 or 1 expected)` )
            }
    }

    siteName = siteName.toLowerCase()

    _validateSiteName({siteName, expectedSiteState})

    return siteName
}


/** Function that will calls 'interuptScript' if the site name is invalid
 */
async function _validateSiteName(kwargs: siteNameValidationKwargs_T): Promise<void> {
    
    const {siteName, expectedSiteState} = kwargs
    
    const validateSiteName = new RegExp( getSiteNamePattern() )
    if ( !siteName.match( validateSiteName ) ) {
        interuptScript( `Given site name "${siteName}" doesn't fit expected name pattern (kebab-case with only alphanumerical characters)` )

    } else if ( siteName === HELP_COMMAND ) {
        interuptScript( `Site Name cannot have same value as help command` )
    }

    const folder = await findInFolder( 'src/sites', { folderPattern: siteName } )
    const siteExists = folder !== undefined

    if (expectedSiteState == 'EXISTANT' && !siteExists) {
        interuptScript( `No site folder with that name was found` )

    } else if (expectedSiteState == 'NON_EXISTANT' && siteExists) {
        interuptScript( `Site with that name already exists` )
    }
}

export default getSiteName