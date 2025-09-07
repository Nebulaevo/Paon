import fastify from "fastify"
import type { ViteDevServer } from "vite"

import ServerConfig from '#paon/template-server/data-models/server-config'

import { consoleMessage } from "#paon/utils/message-logging"
import { getAbsolutePath } from "#paon/utils/file-system"

import { listAvailableSites } from "#paon/template-server/helpers/list-available-sites"
import getRoutesDeclaration, {type routesDeclarationKwargs_T} from '#paon/template-server/fastify/request-handlers/template-request'
import type { serverExectutionMode_T } from '#paon/template-server/helpers/types'

/** Creates a fastify server configured to serve site templates */
async function server( executionMode: serverExectutionMode_T ) {

    const config = new ServerConfig()
    await config.initFromConfigFile()

    const port = config.port
    const host = config.allowExternalAccess 
        ? '0.0.0.0' // tells the OS to bind all available interfaces (localhost, or any remote device)
        : '127.0.0.1' // bind the server to lookback interface (remote devices can't connect)

    const isDev = executionMode === 'DEV'
    const isPreview = executionMode === 'PREVIEW'

    const siteNames = await listAvailableSites(
        // for PROD and PREVIEW mods we use built version from 'dist/server'
        isDev ? 'src/sites' : 'dist/server' 
    )

    const app = fastify({
        // Filtering out poisoning attempt keys rather that returning error:
        // by default fastify returns a 400 error if it finds any prototype/constructor poisoning attempts
        // but with our setup it could lead to unreachable pages,
        // as if some polluting attempts end up in the DB, (and json contains dynamic keys that could be manipulated)
        // all queries to render the page will return a 400, 
        // (even if that scenario does imply other problems)
        onProtoPoisoning: 'remove',
        onConstructorPoisoning: 'remove'
    })

    // when in 'DEV' or 'PREVIEW' mode
    // we allow the server to serve static assets
    let vite: ViteDevServer | undefined
    let routeDeclarationKwargs: routesDeclarationKwargs_T

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

        routeDeclarationKwargs = {
            serverExecutionMode: executionMode,
            siteNames: siteNames,
            vite: vite
        }

    } else { // 'PREVIEW' or 'PROD'
        if ( isPreview ) {
            // if server is running in 'PREVIEW' mode
            // we serve bundled/built assets from /dist/ with
            // fastify/static
            const { fastifyStatic } = await import("@fastify/static")

            app.register(fastifyStatic, {
                root: getAbsolutePath( 'dist/client/assets' ),
                prefix: '/assets/',
            })
        }

        routeDeclarationKwargs = {
            serverExecutionMode: executionMode,
            siteNames: siteNames,
            vite: undefined
        }
    } 

    // for the "DEV" server:
    // adds 'vite.ssrLoadModule' and 'vite.transformIndexHtml'
    // to route handling
    const templateRequestRoutes = await getRoutesDeclaration(
        routeDeclarationKwargs
    )
    app.register( templateRequestRoutes )
    
    await app.listen({ port:port, host:host })
    consoleMessage(`Fastify server running listening on ${host} at :${port}`)
}


export default server