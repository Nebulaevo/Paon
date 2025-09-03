/* Utility functions related to fs or path */
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import type { Dirent } from 'node:fs'

import { consoleErrorMessage } from '#paon/utils/message-logging'


type direntIdentifier_T = RegExp | string

type folderContainsOption_T = {
    filePattern: direntIdentifier_T,
    folderPattern?: undefined
} | {
    folderPattern: direntIdentifier_T,
    filePattern?: undefined
}

type filePathGetterOptions_T = {
    siteName: string,
    folder: 'dist' | 'src'
}

// keep a cached version of the root path
let _ROOT_PATH:string = ''



/** Returns absolute path to the root of the app */
function getRootPath(): string {
    if (!_ROOT_PATH) _findRootPath()
    
    return _ROOT_PATH
}

/** Returns an absolute path, given a path relative to package root
 * 
 * Returned path can't point outside of package root, if it does we return absoulte path to package root instead
*/
function getAbsolutePath( pathFromRoot:string ): string {

    // 🔧 BUG FIX :
    // if the received path starts with '/' it is considered absolute
    // and ignored during the path.resolve call so we make sure it's not absolute
    pathFromRoot = _ensureNoLeadingSlash(pathFromRoot)
    
    const absRoot = getRootPath()
    // we resolve the given path relative to root 
    // to loose any '.' or '..' segments
    const resolvedAbsPath = path.resolve(absRoot, pathFromRoot)

    // if absolute path doesn't point inside root folder we return package root path
    if (!resolvedAbsPath.startsWith(absRoot)) return absRoot
    
    return resolvedAbsPath
}

/** Given as option a folderPattern or a filePattern, 
 * looks for a matching element at the provided relative path.
 * If found, returns the element name, otherwise returns undefined
*/
async function findInFolder( folderRelativePath:string, options:folderContainsOption_T ): Promise<string | undefined> {

    let pattern: direntIdentifier_T
    let foundDirent: Dirent | undefined
    const folderAbsPath = getAbsolutePath( folderRelativePath )

    const dirents = await fs.readdir( 
        folderAbsPath,
        { withFileTypes: true }
    )

    if ( options.filePattern ) {
        pattern = options.filePattern
        foundDirent = pattern instanceof RegExp 
            ? dirents.find( entity => entity.isFile() && entity.name.match(pattern) ) // pattern is regex
            : dirents.find( entity => entity.isFile() && entity.name === pattern ) // pattern is string
    
    } else if ( options.folderPattern ) {
        pattern = options.folderPattern
        foundDirent = pattern instanceof RegExp 
            ? dirents.find( entity => entity.isDirectory() && entity.name.match(pattern) ) // pattern is regex
            : dirents.find( entity => entity.isDirectory() && entity.name === pattern ) // pattern is string
    }
    
    return foundDirent?.name
}

/** Returns expected absolute path to HTML index file for a given site name 
 * 
 * @param kwargs.siteName the site name
 * 
 * @param kwargs.folder ('src' or 'dist') which version do we want, the dev one (src) or the prod one (dist)
*/
function getSiteIndexHtmlPath(
        { siteName, folder }: filePathGetterOptions_T 
): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = folder === 'dist' 
        ? path.join('dist', 'client', `index-${siteName}.html` )
        : path.join('src', 'sites',  siteName, 'index.html')
    return getAbsolutePath( pathFromRoot )
}

/** Returns expected absolute path to entry-server file for a given site name 
 * 
 * @param kwargs.siteName the site name
 * 
 * @param kwargs.folder ('src' or 'dist') which version do we want, the dev one (src) or the prod one (dist)
*/
function getSiteEntryServerPath( 
        { siteName, folder }: filePathGetterOptions_T  
): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = folder === 'dist' 
        ? path.join('dist', 'server', siteName, 'entry-server.js')
        : path.join('src', 'sites', siteName, 'entry-server.tsx')
    return getAbsolutePath( pathFromRoot )
}

/** Returns expected absolute path to ssr-manifest file for a given site name */
function getSiteSsrManifestPath( siteName: string ): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = path.join('dist', 'client', '.vite', siteName, 'ssr-manifest.json')
    return getAbsolutePath( pathFromRoot )
}

function getSiteConfigRelativePath( siteName: string ): string {
    siteName = siteName.toLowerCase()
    return path.join(
        'src', 'sites', siteName, 'site.config.json'
    )
}


/** Returns the content of the given file or undefined */
async function getFileContent( filePathFromRoot: string ): Promise<string | undefined> {

    const absFilePath = getAbsolutePath( filePathFromRoot )

    try {
        const file = await fs.readFile(absFilePath, { flag:'r', encoding: 'utf8' })
        return file

    } catch (_err) {
        // file not found
        return undefined
    }
}

/* ------------------------- Private Helpers ------------------------------- */

/** Function figuring out the absolute path to package root 
 * 
 * (assumes the file containing this function is in a 'paon' folder, that is directly in the root folder)
*/
function _findRootPath() {

    const PAON_FOLDER_NAME = 'paon'
    
    let currentPath = url.fileURLToPath( import.meta.url )

    let folderName:string
    
    // setting up iterCountdown to limit the max number of iterations
    // in case the folder is never found 
    // (-1 cuz can never be root of system)
    let iterCountdown = (currentPath.split( path.sep ).length) - 1

    do {
        currentPath = path.dirname(currentPath)
        folderName = path.basename(currentPath)
        iterCountdown --
    } while ( folderName!==PAON_FOLDER_NAME && iterCountdown>0 )
    
    if ( folderName !== PAON_FOLDER_NAME ) {
        consoleErrorMessage( 
            `Utility script at ${url.fileURLToPath( import.meta.url )} failed to find '${PAON_FOLDER_NAME}' folder in its path.`,
            {iconName: 'error'} 
        )
        /* if the root can't be found the program needs to crash */
        throw new Error('Failed to locate project root')
    }

    const rootPath = path.dirname(currentPath)
    _ROOT_PATH = rootPath
}

/** Small patch utility making sure the path isn't considered absolute on linux */
function _ensureNoLeadingSlash(path: string) {
    while (path.length>0 && path[0]=='/') {
        path = path.substring(1)
    }
    return path
}


export {
    getRootPath,
    getAbsolutePath,
    findInFolder,
    getSiteIndexHtmlPath,
    getSiteSsrManifestPath,
    getSiteEntryServerPath,
    getSiteConfigRelativePath,
    getFileContent
}
