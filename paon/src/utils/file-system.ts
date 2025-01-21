/* Utility functions related to fs or path */
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import type { Dirent } from 'node:fs'

import { iterHasItems } from 'sniffly'

import { consoleErrorMessage } from '#paon/utils/message-logging'
import { getDotPathSegmentPattern } from '#paon/utils/string-patterns'

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
let ROOT_PATH:string = ''

function getRootPath(): string {
    /* returns path to package root */
    if (ROOT_PATH) {
        return ROOT_PATH
    } else {
        return _findRootPath()
    }
}

function getAbsolutePath( pathFromRoot:string ): string {
    /* transforms a relative path (from package root) to an absolute path */

    // we remove any eventual '/./' '/../' 
    // to prevent the absolute path to point to the outside
    pathFromRoot = _filterPathDottedSegments( pathFromRoot )
    
    return path.resolve( getRootPath(), pathFromRoot )
}

async function findInFolder( folderRelativePath:string, options:folderContainsOption_T ): Promise<string | undefined> {
    /* looks for a matching file or folder in a given directory (relative to package root)
    - if found: return the file/folder name 
    - if not found: returns undefined
    */

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

function getSiteIndexHtmlPath(
        { siteName, folder }: filePathGetterOptions_T 
): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = folder === 'dist' 
        ? path.join('dist', 'client', `index-${siteName}.html` )
        : path.join('src', 'sites',  siteName, 'index.html')
    return getAbsolutePath( pathFromRoot )
}

function getSiteEntryServerPath( 
        { siteName, folder }: filePathGetterOptions_T  
): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = folder === 'dist' 
        ? path.join('dist', 'server', siteName, 'entry-server.js')
        : path.join('src', 'sites', siteName, 'entry-server.tsx')
    return getAbsolutePath( pathFromRoot )
}

function getSiteSsrManifestPath( siteName: string ): string {
    siteName = siteName.toLowerCase()
    const pathFromRoot = path.join('dist', 'client', '.vite', siteName, 'ssr-manifest.json')
    return getAbsolutePath( pathFromRoot )
}



/* ------------------------- Private Helpers ------------------------------- */

function _findRootPath(): string {
    /* Function assuming this file is in 'paon' folder and the 'paon' folder is in the root folder */

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
        process.exit(1)
    }

    const rootPath = path.dirname(currentPath)
    ROOT_PATH = rootPath
    return rootPath
}

function _filterPathDottedSegments( relativePath:string ) {
    /* removes any "/./" "/../" path segments */
    const dotPathSegmentPattern = new RegExp( getDotPathSegmentPattern() )
    const pathSegments = relativePath.split( path.sep )

    return path.join( 
        ...pathSegments.filter( 
            segment => iterHasItems(segment) && !segment.match( dotPathSegmentPattern ) 
        ) 
    )
}

export {
    getRootPath,
    getAbsolutePath,
    findInFolder,
    getSiteIndexHtmlPath,
    getSiteSsrManifestPath,
    getSiteEntryServerPath
}
