
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify'

import { collectRessources, collectSiteRessources } from "#paon/template-server/helpers/collect-ressources"
import { RequestData } from '#paon/template-server/data-models/request-data'
import type { Dict_T } from '#paon/utils/types'
import type { siteRessources_T, serverExectutionMode_T } from '#paon/template-server/helpers/types'
import type { ViteDevServer } from 'vite'

type templateHandlerArgs_T = {
    siteNames: string[],
    serverExecutionMode: serverExectutionMode_T,
    vite?: ViteDevServer | undefined
}

async function getTemplateRequestHandlers({
    siteNames,
    serverExecutionMode,
    vite
}: templateHandlerArgs_T) {

    // in PREVIEW and PROD modes we want to collect and cache all website ressources
    // in DEV mode we want to always get the latest ressources
    const siteRessources = serverExecutionMode === 'DEV' ? 
        undefined 
        : await collectRessources({ siteNames, serverExecutionMode })

    return async function routes( fastify: FastifyInstance, options: FastifyPluginOptions ) {
        for ( const siteName of siteNames ) {
            fastify.route({
                method: 'POST',
                url: `/${siteName}/`,
                handler: async ( request:FastifyRequest, response:FastifyReply ) => {
                    
                    const requestData = new RequestData(request.body)
                    if ( !requestData.isValid ) {
                        response.statusCode = 400
                        return response.send('POST data received were invalid')
                    }

                    try {
                        let render: any | undefined

                        const { templateFragments, ssrManifestFile, entryServerPath } = siteRessources 
                            ? siteRessources[siteName]
                            : await collectSiteRessources({ siteName, serverExecutionMode, vite, pageUrl: requestData.url })
                        
                        if ( requestData.ssr ) {
                            render = vite 
                                ? (await vite.ssrLoadModule(entryServerPath)).render
                                : (await import(entryServerPath)).render
                        }
                        
                        const rendered = render
                            ? await render( requestData.appPropsObject(), ssrManifestFile )
                            : { head: '', html: '' }
                        
                        // REMARKS
                        // for CSR, we shouldn't set 'app-props' cuz the page will be cached
                        // and Django will have to set different app-props for each request
                        // app-props should be added only for SSR. (started implementing but still have to be changed in 'entry-client', 'requestData' and django side)
                        const head = templateFragments.head 
                            + requestData.asJsonScriptTag()
                            + (rendered.head ?? '')
                            + `<script id="rendering-mode" type="application/json">${ requestData.ssr ? 'SSR' : 'CSR' }</script>`
                            // + `<meta id="meta-rendering" name="rendering-method" content="${ requestData.ssr ? 'SSR' : 'CSR' }">`
                        
                        const body = templateFragments.body
                            .replace(`<!--app-html-->`, rendered.html ?? '')

                        // const html = templateFile
                        //     .replace(`<!--lang-->`, requestData.lang)
                        //     .replace(`<!--app-head-->`, rendered.head ?? '')
                        //     .replace(`<!--app-props-->`, `<script>window.__INITIAL_PROPS__=${ requestData.serializedAppProps() };</script>` )
                        //     // .replace(
                        //     //     `<!--app-props-->`, 
                        //     //     requestData.ssr 
                        //     //         ? `<script id="initial-props" type="application/json">${ requestData.serializedAppProps() }</script>` 
                        //     //         : `<!--app-props-->`
                        //     // )
                        //     .replace(`<!--app-html-->`, rendered.html ?? '')
                        
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
            })
        }
    }
}

export default getTemplateRequestHandlers