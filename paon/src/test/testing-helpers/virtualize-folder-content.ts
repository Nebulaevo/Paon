import path from 'node:path'
import { vi } from "vitest"
import type { NestedDirectoryJSON } from 'memfs'


/** Recursively explores a given folder in the real file system
 * to create a memfs compatible representation of it
 * 
 * @param absPath (string) absolute path of the file
 * @param folderName (string) name of the folder (ignore for root)
 * @param realFs (node:fs/promises module) unmocked node fs module
 * 
 */
async function virtualizeFolder(
    { absPath, folderName=undefined, realFs=undefined } 
    :{ absPath: string, folderName?:string, realFs?:typeof import('node:fs/promises') } 
): Promise<NestedDirectoryJSON> {

    const nestedDirJson: NestedDirectoryJSON = {}

    const fs = realFs 
        ? realFs
        : await vi.importActual<typeof import('node:fs/promises')>( 'node:fs/promises' )
    
    const currentFolderContent = await fs.readdir( absPath, {withFileTypes: true} )

    const tasks: Promise<NestedDirectoryJSON>[] = []

    for ( const dirent of currentFolderContent ) {
        const direntAbsPath = path.resolve( absPath, dirent.name )
        if ( dirent.isFile() ) {
            tasks.push(_getFileContent({
                fileName: dirent.name,
                absPath: direntAbsPath,
                realFs: fs
            }))

        } else if( dirent.isDirectory() ){
            tasks.push(virtualizeFolder({
                absPath: direntAbsPath,
                folderName: dirent.name,
                realFs: fs
            }))
        }
    }

    const jsonDirents = await Promise.all( tasks )

    for ( const jsonDirent of jsonDirents ) {
        Object.assign(nestedDirJson, jsonDirent)
    }

    // (folderName is not defined for root folder)
    return folderName ? { [folderName]: nestedDirJson } : nestedDirJson
}

/** Extracts file content to NestedDirectoryJSON
 * 
 * @param absPath (string) absolute path of the file
 * @param fileName (string) name of the file
 * @param realFs (node:fs/promises module) unmocked node fs module
 * 
 * @returns NestedDirectoryJSON object with content of the file
 */
async function _getFileContent( 
    { absPath, fileName, realFs } 
    :{ absPath: string, fileName: string, realFs: typeof import('node:fs/promises') }
    // name:string, 
    // absPath:string,
    // realFs: typeof import('node:fs/promises')
): Promise<NestedDirectoryJSON> {
    return { [fileName]: await realFs.readFile( absPath, {encoding:'utf-8', flag:'r'} ) }
}

export {
    virtualizeFolder
}