import childProcess from 'node:child_process'

import { consoleErrorMessage } from '#paon/utils/message-logging'
import { SCRIPT_NAME as BUILD_SITE_COMMAND } from '#paon/dev-scripts/site-build/constants'

/** Creates a subprocess calling the build command for the provided site name
 * 
 * ⚠️ BUILD COMMANDS FOR EACH SITE NAME HAVE TO BE CALLED SEQUENTIALLY\
 * (each build task produces an "index.html" that has to be renamed to "index-SITENAME.html")
 */
function runBuildSiteCommand( siteName: string ) {
    return new Promise<void>( (resolve, reject) => {
        const command = `npm run ${BUILD_SITE_COMMAND} ${siteName}`
        const buildingProcess = childProcess.spawn(
            command,
            [], {shell: true}
        )

        buildingProcess.stdout.pipe( process.stdout )
        buildingProcess.stderr.pipe( process.stderr )

        buildingProcess.on( 'close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                consoleErrorMessage( `command "${command}" failed` )
                reject()
            }
        })
    })
}

export {
    runBuildSiteCommand
}