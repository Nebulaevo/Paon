import fs from 'node:fs/promises'

import type { ViteDevServer } from 'vite'

import { getSiteIndexHtmlPath, getSiteSsrManifestPath, getSiteEntryServerPath } from '#paon/utils/file-system'
import { consoleErrorMessage, consoleMessage } from '#paon/utils/message-logging'
import type { siteRessources_T, serverExectutionMode_T } from '#paon/template-server/helpers/types'

import type { Dict_T } from 'sniffly'
import { isString } from 'sniffly'

type collectRessourcesKwargs_T = {
    siteNames: string[],
    serverExecutionMode: serverExectutionMode_T
}

type collectSiteRessourcesKwargs_T = {
    siteName: string,
    serverExecutionMode: serverExectutionMode_T,
    vite?: ViteDevServer,
    pageUrl?: string,
}

type fragmentExtractionArgs = {
    template: string,
    siteName: string,
    tag: 'head' | 'body'
}

/** Collects ressources for all sites and orders them in a dict */
async function collectRessources(
        { siteNames, serverExecutionMode }: collectRessourcesKwargs_T 
): Promise< Dict_T<siteRessources_T> > {

    const ressources: Dict_T<siteRessources_T> = {}

    // async task collecting necessary documents 
    // and paths needed for a site
    const task = async ( siteName: string ) => {
        ressources[ siteName ] = await collectSiteRessources({siteName, serverExecutionMode})
    }

    await Promise.all( siteNames.map( siteName => task(siteName) ))

    return ressources
}


/** Collects ressources for one site */
async function collectSiteRessources(
    { siteName, serverExecutionMode, vite, pageUrl }: collectSiteRessourcesKwargs_T
): Promise<siteRessources_T> {
    const isDev = serverExecutionMode === 'DEV'
    try {
        const getTemplateTask = fs.readFile( 
            getSiteIndexHtmlPath({ 
                siteName: siteName, 
                folder: isDev ? 'src' : 'dist' 
            }), 
            {encoding: 'utf-8'} 
        )

        const getSsrManifestTask = isDev 
            ? (async () => undefined)()
            : fs.readFile( getSiteSsrManifestPath(siteName), {encoding: 'utf-8'} )
        
        let [ templateFile, ssrManifestFile ] = await Promise.all([ getTemplateTask, getSsrManifestTask ])

        if ( vite && isString(pageUrl, {nonEmpty:true}) ) {
            // vite is only set if the server is in 'DEV' execution mode

            // - Hack to make dev server work -
            // because if we write the urls this way, building fails,
            // so we only use it in the dev server.
            // replacing paths relative to the file by paths relative to the root 
            templateFile = _makePathsRelativeToRoot( templateFile, siteName )
            templateFile = await vite.transformIndexHtml(pageUrl, templateFile)
        }

        // extracting content of 'head' and 'body' from the template
        const head = _extractTemplateFragement({
            template: templateFile,
            siteName: siteName,
            tag: 'head'
        })

        const body = _extractTemplateFragement({
            template: templateFile,
            siteName: siteName,
            tag: 'body'
        })

        return {
            templateFragments: {head, body}, 
            ssrManifestFile: ssrManifestFile,
            entryServerPath: getSiteEntryServerPath({ 
                siteName: siteName, 
                folder: isDev ? 'src' : 'dist' 
            })
        }
    } catch (e) {
        consoleErrorMessage( `collecting site ressources for '${siteName}' website failed with an exception:` )
        throw e
    }
}


/* ------------------------- Private Helpers ------------------------------- */

/** Hack, for dev server only, 
 * transforms paths relative to index.html to make them relative to root
 * otherwise dev server can't find the files */
function _makePathsRelativeToRoot( template:string, siteName:string ): string {
    return template
        .replaceAll( /src\s*=\s*"\.?\/?/g, `src="/src/sites/${siteName}/` )
        .replaceAll( /src\s*=\s*'\.?\/?/g, `src='/src/sites/${siteName}/` )
        .replaceAll( /href\s*=\s*"\.?\/?/g, `href="/src/sites/${siteName}/` )
        .replaceAll( /href\s*=\s*'\.?\/?/g, `href='/src/sites/${siteName}/` )
}

/** Very simple utility using regex to extract content of a tag in an html document */
function _extractTemplateFragement({template, siteName, tag}: fragmentExtractionArgs): string {
    
    const fragmentExtractionPattern = new RegExp(
        `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        'i'
    )

    const match = template.match( fragmentExtractionPattern )

    if ( !match ) {
        throw new Error(
            `Paon template server failed to extract <${tag}> content for index.html of site ${siteName}`
        )
    }

    return match[1]
}


export {
    collectRessources,
    collectSiteRessources
}