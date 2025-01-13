import server from '#paon/template-server/fastify/server'
import getServerExecutionMod from '#paon/template-server/helpers/server-execution-mod'

async function run() {
    const executionMode = getServerExecutionMod()
    await server( executionMode )
}

await run()