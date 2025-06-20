
import type { serverExectutionMode_T } from '#paon/template-server/helpers/types'

/** extracts execution mode from process env */
function getServerExecutionMod(): serverExectutionMode_T {
    const executionMods = [ 'DEV', 'PREVIEW', 'PROD' ]
    const defaultExecutionMod = 'PROD'
    const nodeEnv = process.env.NODE_ENV
    
    return nodeEnv && executionMods.includes( nodeEnv )
        ? nodeEnv as serverExectutionMode_T 
        : defaultExecutionMod
}

export { getServerExecutionMod }