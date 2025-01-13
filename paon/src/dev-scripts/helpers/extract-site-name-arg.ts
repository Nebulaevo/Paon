import { consoleMessage, consoleErrorMessage } from '#paon/utils/message-logging'
import { getSiteNamePattern } from '#paon/utils/string-patterns'
import { findInFolder } from '#paon/utils/file-system'

import extractProcessArgs from '#paon/dev-scripts/helpers/extract-process-args'
import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'


type expectedSiteState_T = 'EXISTANT' | 'NON_EXISTANT'

type extractSiteNameArgOptions_T = {
    scriptName: string,
    forMoreInfoText: string,
    expectedSiteStatus: expectedSiteState_T
}

type validateSiteNameOptions_T = {
    expectedStatus: expectedSiteState_T
}

async function extractSiteNameArg( 
    { scriptName, forMoreInfoText, expectedSiteStatus }: extractSiteNameArgOptions_T 
): Promise<string> {

    // extracting siteName arg
    const scriptInfos = {
        scriptName: scriptName,
        forMoreInfoText: forMoreInfoText,
    }
    const commandOptions = {
        argNames: [ 'siteName' ],
        kwArgNames: [],
        requiredArgs: [ 'siteName' ]
    }
    let { siteName } = extractProcessArgs( scriptInfos, commandOptions) as { siteName: string }
    
    siteName = siteName.toLowerCase()

    // checking site name validity
    const isValid = await _validateSiteName( siteName, { expectedStatus: expectedSiteStatus } )
    if ( !isValid ) {
        consoleErrorMessage( `Provided site name "${siteName}" is invalid` )
        consoleErrorMessage( expectedSiteStatus === 'EXISTANT' ? 
            '- it might not have been found in ./src/sites' // 'EXISTANT'
            : '- a folder with that name might already exist in ./src/sites' // 'NON_EXISTANT'
        )
        consoleErrorMessage( '- it might not match the site name pattern' )
        consoleMessage( forMoreInfoText )
        process.exit(1)
    }

    return siteName
}

/** Function returning a boolean indicating if site name is valid
 * 
 * **expectedStatus**: 'EXISTANT'\
 * means the site folder is supposed to exist in 'src/sites'
 * 
 * **expectedStatus**: 'NON_EXISTANT'\
 * means the site folder is supposed to be absent from 'src/sites'
 */
async function _validateSiteName( siteName:string, { expectedStatus }: validateSiteNameOptions_T ): Promise<boolean> {

    const validateSiteName = new RegExp( getSiteNamePattern() )
    if ( !siteName.match( validateSiteName ) ) {
        return false
    } else if ( siteName === HELP_COMMAND ) {
        return false
    }

    const folder = await findInFolder( 'src/sites', { folderPattern: siteName } )
    const exists = folder !== undefined

    return expectedStatus == 'EXISTANT' ? exists : !exists
}

export default extractSiteNameArg