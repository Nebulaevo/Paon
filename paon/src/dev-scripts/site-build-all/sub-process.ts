import childProcess from 'node:child_process'

import { consoleErrorMessage } from '#paon/utils/message-logging'
import { SCRIPT_NAME as BUILD_SITE_COMMAND } from '#paon/dev-scripts/site-build/constants'


function runBuildSiteCommand( siteName: string ) {
    return new Promise<void>( (resolve, reject) => {
        const command = `npm run ${BUILD_SITE_COMMAND} ${siteName}`
        const buildingProcess = childProcess.spawn(
            command,
            [], {shell: true}
        )

        buildingProcess.stdout.pipe( process.stdout )
        buildingProcess.stderr.pipe( process.stderr )

        buildingProcess.on( 'close', async (code) => {
            if (code === 0) {
                resolve()
            } else {
                consoleErrorMessage( `${command} command failed` )
                reject()
            }
        }) 
    })
}

export {
    runBuildSiteCommand
}