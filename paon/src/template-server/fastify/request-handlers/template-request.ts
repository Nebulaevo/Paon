
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify'
import type { ViteDevServer } from 'vite'
import type { Dict_T } from 'sniffly'

import { buildSsrReqData } from '#paon/template-server/data-models/ssr-request-data'
import { collectRessources, collectSiteRessources } from "#paon/template-server/helpers/collect-ressources"
import type { siteRessources_T, serverExectutionMode_T } from '#paon/template-server/helpers/types'


type routesDeclarationKwargs_T = {
    siteNames: string[],
    serverExecutionMode: serverExectutionMode_T,
    vite?: ViteDevServer | undefined
}

type reqHandlerKwargs_T = {
    siteName: string,
    siteRessources?: Dict_T<siteRessources_T>,
    serverExecutionMode: serverExectutionMode_T,
    vite?: ViteDevServer
}

/** returns a handler function for SSR template requests */
function _buildSsrRequestHandler({
        siteName,
        siteRessources,
        serverExecutionMode,
        vite
}: reqHandlerKwargs_T ) {
    
    return async ( request:FastifyRequest, response:FastifyReply ) => {
        
        const requestData = buildSsrReqData(request.body)
        if ( !requestData ) {
            response.statusCode = 400
            return response.send('POST data received were invalid')
        }

        try {
            const { templateFragments, ssrManifestFile, entryServerPath } = siteRessources 
                ? siteRessources[siteName]
                : await collectSiteRessources({ siteName, serverExecutionMode, vite, pageUrl: requestData.url })
            
            const render = vite 
                ? (await vite.ssrLoadModule(entryServerPath)).render
                : (await import(entryServerPath)).render
            
            const rendered = await render(requestData.appPropsObject(), ssrManifestFile)
            
            const head = templateFragments.head 
                + `<meta name="rendering-mode" content="SSR">`
                + requestData.getInitialPagePropsAsJsonTag()
                + (rendered.head ?? '')
            
            const body = templateFragments.body
                .replace(`<!--app-html-->`, rendered.html ?? '')
            
            response.type( 'application/json' )
            return response.send({ head, body })
            
        } catch (e) {
            if (e instanceof Error) {
                vite?.ssrFixStacktrace(e)
                console.log( e.stack )
            }
            response.statusCode = 500
            return response.send('Request handling failed')
        }
        
    }
}

/** returns a handler function for CSR template requests */
function _buildCsrRequestHandler({
    siteName,
    siteRessources,
    serverExecutionMode,
    vite
}: reqHandlerKwargs_T ) {
    return async (request: FastifyRequest, response: FastifyReply) => {
        
        try {
            const { templateFragments } = siteRessources 
                ? siteRessources[siteName]
                // REMARK: that function calls "vite.transformIndexHtml" with given pageUrl not sure what url is doing
                // but it is only triggered in DEV server anyways so we are using "/"
                : await collectSiteRessources({ siteName, serverExecutionMode, vite, pageUrl: '/' }) 
            
            // REMARKS
            // for CSR, we shouldn't set 'app-props' so that the app shell
            // can be cached and used for any page.
            // app-props should be added only for SSR.
            const head = templateFragments.head 
                + `<meta name="rendering-mode" content="CSR">`
            
            const body = templateFragments.body
                .replace(`<!--app-html-->`, '')
            
            response.type( 'application/json' )
            return response.send({ head, body })
            
        } catch (e) {
            if (e instanceof Error) {
                vite?.ssrFixStacktrace(e)
                console.log( e.stack )
            }
            response.statusCode = 500
            return response.send('Request handling failed')
        }
    }
}

/** Returns a function declaring 2 routes for each registered webiste
 * - one to generate an app shell for the given website (CSR)
 * - one to render a page server side with given context (SSR)
 */
async function getRoutesDeclaration({
    siteNames,
    serverExecutionMode,
    vite
}: routesDeclarationKwargs_T ) {

    // in PREVIEW and PROD modes we want to collect and cache all website ressources
    // in DEV mode we want to always get the latest ressources
    const siteRessources = serverExecutionMode === 'DEV' ? 
        undefined 
        : await collectRessources({ siteNames, serverExecutionMode })

    return async function routes( fastify: FastifyInstance, options: FastifyPluginOptions ) {
        for ( const siteName of siteNames ) {
            const requestHandlerArgs = {siteName, siteRessources, serverExecutionMode, vite}
            
            // requests for CSR app shells
            fastify.route({
                method: 'GET',
                url: `/${siteName}/`,
                handler: _buildCsrRequestHandler(requestHandlerArgs)
            })
            
            // requests for SSR rendered pages
            fastify.route({
                method: 'POST',
                url: `/${siteName}/`,
                handler: _buildSsrRequestHandler(requestHandlerArgs)
            })
        }
    }
}

export default getRoutesDeclaration