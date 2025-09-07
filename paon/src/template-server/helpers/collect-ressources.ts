import fs from 'node:fs/promises'
import type { Dict_T } from 'sniffly'
import type { ViteDevServer } from 'vite'

import HtmlDocument from '#paon/utils/html-parsing'
import TemplateFragments from '#paon/template-server/data-models/template-fragments'
import { getSiteIndexHtmlPath, getSiteSsrManifestPath, getSiteEntryServerPath } from '#paon/utils/file-system'
import { consoleErrorMessage } from '#paon/utils/message-logging'
import type { siteRessources_T } from '#paon/template-server/helpers/types'


type siteRessourceCollectingKwargs_T = {
    isDev: false,
    siteName: string,
    pageUrl?: undefined,
    vite?: undefined,
} | {
    isDev: true,
    siteName: string,
    pageUrl?: string,
    vite: ViteDevServer,
}

type devServerRelativePathPatchingKwargs_T = {
    htmlDocument: string,
    siteName: string
}

/** Collects ressources for all sites and orders them in a dict 
 * (production / preview mode) 
*/
async function collectRessourcesProd(siteNames: string[]): Promise< Dict_T<siteRessources_T> > {

    const ressources: Dict_T<siteRessources_T> = {}

    // async task collecting necessary documents 
    // and paths needed for a site
    const task = async ( siteName: string ) => {
        ressources[ siteName ] = await collectSiteRessources({isDev: false, siteName})
    }

    await Promise.all( siteNames.map( siteName => task(siteName) ))

    return ressources
}


/** Collects ressources for one site 
 * (called directly for dev server requests to always serve up to date version) 
*/
async function collectSiteRessources( 
    kwargs: siteRessourceCollectingKwargs_T
): Promise<siteRessources_T> {

    const {
        isDev,
        siteName
    } = kwargs

    try {
        const getTemplateTask: Promise<TemplateFragments> = _getTemplateFragments(kwargs)

        const getSsrManifestTask: Promise<undefined | string> = isDev 
            ? (async () => undefined)()
            : fs.readFile( getSiteSsrManifestPath(siteName), {encoding: 'utf-8'} )
        
        const [templateFragments, ssrManifestFile] = await Promise.all([ getTemplateTask, getSsrManifestTask ])

        return {
            templateFragments, ssrManifestFile,
            entryServerPath: getSiteEntryServerPath({ 
                siteName: siteName, 
                folder: isDev ? 'src' : 'dist' 
            })
        }
    } catch (e) {
        let message = `Collecting site ressources for '${siteName}' website `
        message += `failed with an exception :`
        consoleErrorMessage(message)
        throw e
    }
}


/* ------------------------- Private Helpers ------------------------------- */

/** Private util extracting and processing the index html of a site
 * 
 * - extracts the content of the index html file
 * - (if dev server) patches relative paths : makes them relative to root instead of the index file (vite assumes index html is at root)
 * - (if dev server) processes the file dynamically, injecting HMR scripts and plugin transforms with `viteDevServer.transformIndexHtml` 
 * - returns a TemplateFragments instance that have extracted the `<head>` and `<body>` fragments of the document
*/
async function _getTemplateFragments(
    kwargs: siteRessourceCollectingKwargs_T
): Promise<TemplateFragments> {

    const {
        isDev,
        siteName,
        pageUrl,
        vite,
    } = kwargs

    // Extracts the content of the index html file
    const indexFilePath = getSiteIndexHtmlPath({ 
        siteName, 
        folder: isDev ? 'src' : 'dist' 
    })
    let indexHtmlFile = await fs.readFile( 
        indexFilePath, {encoding: 'utf-8'} 
    )

    if (isDev) {
        // Patches relative paths for dev server
        // (makes them relative to root instead of the index file)
        indexHtmlFile = _patchRelativePathsForDevServer({
            htmlDocument: indexHtmlFile,
            siteName: siteName
        })

        // Processes the file dynamically, injecting HMR scripts and plugin transforms with `viteDevServer.transformIndexHtml` 
        indexHtmlFile = await vite.transformIndexHtml(
            pageUrl ?? "/",
            indexHtmlFile
        )
    }

    return new TemplateFragments(indexHtmlFile, indexFilePath)
}

/** Patches relative paths in index html file for dev server
 * (makes them relative to root instead of the index file)
*/
function _patchRelativePathsForDevServer( kwargs: devServerRelativePathPatchingKwargs_T ) {
        
    const {
        htmlDocument,
        siteName
    } = kwargs

    /** (Internal function)
     * Returns true if the path can be parsed as URL without a base 
    */
    function _isAbsoluteUrl( path: string ) {
        try {
            new URL(path)
            return true
        } catch (_err) {
            return false
        }
    }

    /** (Internal function)
     * Double checks that the url's `pathname` value starts with a `"/"` 
    */
    function _ensurePathnameStartsWithSlash(url: URL) {
        if (!url.pathname.startsWith('/')) {
            url.pathname = '/' + url.pathname
        }
    }

    /** (Internal function)
     * Returns a patched path, 
     * 
     * Either it was an absolute path, and waas returned as is.
     * Or it was relative, and have been modified to be relative
     * from the root of the Paon app, instead of being relative to the
     * index.html file.
    */
    function _patchRelativePath(path: string) {
        if (_isAbsoluteUrl(path)) return path

        try {
            const url = new URL(path, 'http://base.com/')
            _ensurePathnameStartsWithSlash(url)
            url.pathname = `/src/sites/${siteName}` + url.pathname

            return `${url.pathname}${url.search}${url.hash}`

        } catch (_err) {
            return 'about:blank'
        }
    }

    /** (Internal function)
     * Patches the path values in every occurence of an attribute in the document 
    */
    function _patchPathsInAttr(document: HtmlDocument, attrName: 'src' | 'href') {
    
        // we select all element nodes with the desired attribute
        const nodes = document.selectAllElements({
            query: {hasAttr: attrName},
            exploreTemplateTags: true
        })

        // for each node, if the value of the attribute is a relative URL
        // we 
        for (const node of nodes){
            const attr = node.attrs.find( attr => attr.name === attrName)
            if (attr) {
                attr.value = _patchRelativePath(attr.value)
            }   
        }
    }

    // Parsing the document
    const document = new HtmlDocument(htmlDocument)

    // Patching the rel paths in 'src' and 'href' attributes
    _patchPathsInAttr(document, 'src')
    _patchPathsInAttr(document, 'href')

    // Returning patched document rendered to string
    return document.render()
}

export {
    collectRessourcesProd,
    collectSiteRessources
}