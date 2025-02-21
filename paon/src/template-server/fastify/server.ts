import fastify from "fastify"

import ServerConfig from '#paon/template-server/data-models/server-config'
import { consoleMessage } from "#paon/utils/message-logging"
import { getAbsolutePath } from "#paon/utils/file-system"

import listAvailableSites from "#paon/template-server/helpers/list-available-sites"

import getTemplateRequestHandlers from '#paon/template-server/fastify/request-handlers/template-request'
import type { serverExectutionMode_T } from '#paon/template-server/helpers/types'

import type { ViteDevServer } from "vite"

async function server( executionMode: serverExectutionMode_T ) {

    const config = new ServerConfig()
    await config.initFromConfigFile()

    const port = config.port
    const host = config.accessibleFromExterior 
        ? '0.0.0.0' 
        : '127.0.0.1'

    const isProduction = executionMode === 'PROD'
    const isDev = executionMode === 'DEV'
    const isPreview = executionMode === 'PREVIEW'

    const siteNames = await listAvailableSites(
        // for PROD and PREVIEW mods we use built version from 'dist/server'
        isDev ? 'src/sites' : 'dist/server' 
    )

    const app = fastify()

    // when in 'DEV' or 'PREVIEW' mode
    // we allow the server to serve static assets
    let vite: ViteDevServer | undefined
    if ( isDev ) {
        // if server is running in 'DEV' mode
        // we serve static assets from /src/ with 
        // the vite dev server.
        const { createServer } = await import('vite')
        const { fastifyExpress } = await import('@fastify/express')

        vite = await createServer({
            server: { middlewareMode: true },
            appType: 'custom',
        })

        await app.register(fastifyExpress)
        
        app.use(vite.middlewares)

    } else if ( isPreview ) {
        // if server is running in 'PREVIEW' mode
        // we serve bundled/built assets from /dist/ with
        // fastify/static
        const { fastifyStatic } = await import("@fastify/static")

        app.register(fastifyStatic, {
            root: getAbsolutePath( 'dist/client/assets' ),
            prefix: '/assets/'
        })
    }

    // add 'vite.ssrLoadModule' and 'vite.transformIndexHtml'
    // to route handling
    app.register( await getTemplateRequestHandlers({
        siteNames: siteNames, 
        serverExecutionMode: executionMode,
        vite: vite
    }))
    
    await app.listen({ port:port, host:host })
    consoleMessage(`Fastify server running listening on ${host} at :${port}`)
}


export default server