
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify'
import type { ViteDevServer } from 'vite'
import type { Dict_T } from 'sniffly'

import { consoleMessage, consoleWarnMessage } from '#paon/utils/message-logging'
import SsrRequestData from '#paon/template-server/data-models/ssr-request-data'
import { collectRessourcesProd, collectSiteRessources } from "#paon/template-server/helpers/collect-ressources"
import type { siteRessources_T } from '#paon/template-server/helpers/types'


type devRouteDeclarationBase_T = {
    serverExecutionMode: 'DEV',
    siteRessources?: undefined,
    vite: ViteDevServer,
}

type prodRouteDeclarationBase_T = {
    serverExecutionMode: "PREVIEW" | "PROD",
    siteRessources: Dict_T<siteRessources_T>,
    vite?: undefined,
}

type devRoutesDeclarationsSettings_T = devRouteDeclarationBase_T 
    & { siteNames: string[] }

type prodRoutesDeclarationsSettings_T = prodRouteDeclarationBase_T 
    & { siteNames: string[] }

// 🤸 Type gymnastics: 
// we force ts to seperate both possible states
type routesDeclarationsSettings_T = 
    devRoutesDeclarationsSettings_T
    | prodRoutesDeclarationsSettings_T


// 🤸 Type gymnastics: 
// we force ts to seperate both possible states
type routesDeclarationKwargs_T = 
    Omit<devRoutesDeclarationsSettings_T, 'siteRessources'>
    | Omit<prodRoutesDeclarationsSettings_T, 'siteRessources'>

// 🤸 Type gymnastics: 
// we force ts to seperate both possible states
type reqHandlerKwargs_T = 
    devRouteDeclarationBase_T & {siteName: string} 
    | prodRouteDeclarationBase_T & {siteName: string} 




type requestLoggingInfos_T = {
    mode:  'CSR' | 'SSR'
    status?: number,
    site: string,
    page?: string,
}

/** helper logging requests 
 * 
 * @param kwargs.mode 'CSR' or 'SSR'
 * 
 * @param kwargs.status (number) status of the response
 * 
 * @param kwargs.site (string) name of the requested site
 * 
 * @param kwargs.page (string) only for SSR, url of the rendered page
 * 
*/
function _logRequest(kwargs: requestLoggingInfos_T) {
    const {
        mode,
        status = 200,
        site,
        page
    } = kwargs

    const isSSR = mode === 'SSR'
    const method = isSSR ? 'POST' : 'GET'
    const pageInfo = isSSR ? ` ${page ?? '-None-'}` : '' 
    const loggingFunc = status < 300
        ? consoleMessage
        : consoleWarnMessage
    
    const timestamp = new Date().toUTCString()

    loggingFunc(
        `[${timestamp}] ${status} ${method} (${mode}) -> site:${site}${pageInfo}`
    )
}

/** returns a handler function for SSR template requests */
function _buildSsrRequestHandler({
        serverExecutionMode,
        siteName,
        siteRessources,
        vite
}: reqHandlerKwargs_T ) {
    
    return async ( request:FastifyRequest, response:FastifyReply ) => {
        
        // Extracting and validating POST data
        const requestData = SsrRequestData.from(request.body)
        if ( !requestData ) {
            _logRequest({mode:'SSR', status:400, site:siteName})
            
            response.statusCode = 400
            return response.send('POST data received were invalid')
        }
        
        try {
            // Getting site base ressources
            const { 
                templateFragments, 
                ssrManifestFile, 
                entryServerPath 
            } = siteRessources 
                ? siteRessources[ siteName ]
                : await collectSiteRessources(
                    // 🤸 Type gymnastics: 
                    // we have to force typescript to split the two possible types 
                    // otherwise it blends them together
                    serverExecutionMode === 'DEV' 
                        ? { isDev: true, pageUrl: requestData.url, siteName, vite }
                        : { isDev: false, siteName }
                )
            
            // Rendering the App
            const render = vite 
                ? (await vite.ssrLoadModule(entryServerPath)).render
                : (await import(entryServerPath)).render
            const rendered = await render(requestData.appPropsObject(), ssrManifestFile)
            
            // Getting the document fragments
            const head = templateFragments.assembleHeadFragment({
                renderingMode: 'SSR',
                requestData: requestData,
                renderedMetas: rendered.head ?? ''
            })
            const body = templateFragments.assembleBodyFragment({
                placeholder: '<!--app-html-->',
                renderedApp: rendered.html ?? ''
            })

            _logRequest({mode:'SSR', site:siteName, page:requestData.url })

            // Returning JSON response
            response.type( 'application/json' )
            return response.send({head, body})
            
        } catch (err) {
            _logRequest({mode:'SSR', status:500, site:siteName, page:requestData.url })

            if (err instanceof Error) {
                vite?.ssrFixStacktrace(err)
                consoleMessage( `${err.stack}` )
            }
            response.statusCode = 500
            return response.send('Request handling failed')
        }
    }
}

/** returns a handler function for CSR template requests */
function _buildCsrRequestHandler({
        serverExecutionMode,
        siteName,
        siteRessources,
        vite
}: reqHandlerKwargs_T ) {
    return async (_request: FastifyRequest, response: FastifyReply) => {
        
        try {
            // Getting site base ressources
            const { templateFragments } = siteRessources 
                ? siteRessources[ siteName ]
                : await collectSiteRessources(
                    // 🤸 Type gymnastics: 
                    // we have to force typescript to split the two possible types 
                    // otherwise it blends them together
                    serverExecutionMode === 'DEV' 
                        ? { isDev: true, siteName, vite }
                        : { isDev: false, siteName } // SHOULD NOT HAPPEN - but makes ts happy
                )
            
            // Getting the document fragments
            // ℹ️ for CSR we want to return a neutral app shell so that 
            // it can be used to generate any page 
            const head = templateFragments.assembleHeadFragment({
                renderingMode: 'CSR'
            })
            const body = templateFragments.assembleBodyFragment({
                placeholder: '<!--app-html-->',
                renderedApp: ''
            })

            _logRequest({mode:'CSR', site:siteName })

            // Returning JSON response
            response.type( 'application/json' )
            return response.send({head, body})
            
        } catch (err) {
            _logRequest({mode:'CSR', status: 500, site:siteName })

            if (err instanceof Error) {
                vite?.ssrFixStacktrace(err)
                consoleMessage( `${err.stack}` )
            }
            response.statusCode = 500
            return response.send('Request handling failed')
        }
    }
}


/** Returns a function declaring 2 routes for each registered webiste
 * - a GET route to generate an app shell for the given website (CSR)
 * - a POST route to render a page server side with given context (SSR)
 */
async function getRoutesDeclaration(kwargs: routesDeclarationKwargs_T) {
    
    // 🤸 Type gymnastics: 
    // we have to force typescript to split the two possible types 
    // otherwise it blends them together
    const routeDeclarationSettings : routesDeclarationsSettings_T = 
        kwargs.serverExecutionMode !== 'DEV'
        // in PREVIEW and PROD modes we want to collect and cache all website ressources
        ? { ...kwargs, siteRessources: await collectRessourcesProd(kwargs.siteNames)} 
        // in DEV mode we want to always get the latest ressources
        : { ...kwargs, siteRessources: undefined }

    return async function routes( fastify: FastifyInstance, options: FastifyPluginOptions ) {
        const {
            siteNames,
            ...routeSettings
        } = routeDeclarationSettings

        for ( const siteName of siteNames ) {

            // 🤸 Type gymnastics: 
            // we have to force typescript to split the two possible types 
            // otherwise it blends them together
            const requestHandlerKwargs: reqHandlerKwargs_T = 
                routeSettings.serverExecutionMode !== 'DEV'
                ? { ...routeSettings, siteName }
                : { ...routeSettings, siteName }
            
            // requests for CSR app shells
            fastify.route({
                method: 'GET',
                url: `/${siteName}/`,
                handler: _buildCsrRequestHandler(requestHandlerKwargs)
            })
            
            // requests for SSR rendered pages
            fastify.route({
                method: 'POST',
                url: `/${siteName}/`,
                handler: _buildSsrRequestHandler(requestHandlerKwargs)
            })
        }
    }
}

export default getRoutesDeclaration
export type { routesDeclarationKwargs_T }