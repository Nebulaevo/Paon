/** Testing dev script "site-add" */

import { vol, fs as virtualFs, type NestedDirectoryJSON } from "memfs"
import { vi, describe, expect, beforeEach, it, type MockedFunction } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import siteAdd from '#paon/dev-scripts/site-add/script'

import { 
    processExitMockImplementation, 
    asyncProcessExitCatcher,
    mockProcessArgv,
    unmockProcessArgv
} from '../testing-helpers/process-mocks'

import { virtualizeFolder } from '../testing-helpers/virtualize-folder-content'

// cached json copy of /paon/ressources folder
let PAON_RESSOURCES_FOLDER_JSON: NestedDirectoryJSON | undefined = undefined

// site name samples
const NEW_SITE_NAME = 'new-site-0' // valid kebab-case, lowercase, alphanumerical
const EXISTING_SITE_NAME = 'existing-site'
const INVALID_SITE_NAMES = [ // (only kebab-case, lowercase, alphanumerical accepted ) 
    '-site', // starts with '-'
    'site-', // ends with '-'
    'si--te', // more than one consecutive '-' 
    'Site', // uppercase
    '$ite' // non alphanumerical character
]


vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")

// prevent process.exit from killing process while testing 
vi.spyOn(process, "exit").mockImplementation( processExitMockImplementation )


beforeEach(async () => {
    
    // compute and cache copy of /paon/ressources folder
    if ( !PAON_RESSOURCES_FOLDER_JSON ) {
        PAON_RESSOURCES_FOLDER_JSON = await virtualizeFolder({absPath:getAbsolutePath('paon/ressources')})
    }

    // reset process.exit spy
    vi.clearAllMocks()

    // reset virtual file system
    vol.reset()
    vol.fromNestedJSON({
        './paon': {
            'ressources': PAON_RESSOURCES_FOLDER_JSON,
        },
        './src': {
            'sites': {
                [ EXISTING_SITE_NAME ]: {
                    'app.html': '<html>...'
                }
            }
        },
        './dist': {}
    }, getRootPath())
})

describe('#site:add (dev-script)', () => {

    it("scaffolds a new site folder", async () => {

        // mock process argv
        mockProcessArgv([ '_', '_', NEW_SITE_NAME  ])

        // wrap tested function to catches eventual "process.exit" error
        await asyncProcessExitCatcher( siteAdd )

        // unmock process argv
        unmockProcessArgv()

        const siteFolderAbsPath = getAbsolutePath(`/src/sites/${NEW_SITE_NAME}`)

        // check if new site folder exists
        const exists = await virtualFs.promises.access( siteFolderAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if folder/files have been created inside
        // (we don't check further as starter files might change)
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent.length).toBeGreaterThan(0)

        // if process have been called, we check that it exited with code '0'
        const processExit = process.exit as MockedFunction<typeof process.exit>
        if ( processExit.mock.calls.length > 0 ) {
            expect( process.exit ).toHaveBeenCalledWith(0)
        }
    })

    it("fails if sitename already exists", async () => {

        // mock process argv
        mockProcessArgv([ '_', '_', 'existing-site'  ])

        // wrap tested function to catches eventual "process.exit" error
        await asyncProcessExitCatcher( siteAdd )

        // unmock process argv
        unmockProcessArgv()

        // check if site folder still exists
        const siteFolderAbsPath = getAbsolutePath('/src/sites/existing-site')
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent).toEqual(['app.html'])

        // operation should be prevented
        expect( process.exit ).toHaveBeenCalledWith(1)
    })

    it("fails if sitename is invalid (only kebab-case, lowercase, alphanumerical accepted)", async () => {

        for ( const invalidSiteName of INVALID_SITE_NAMES ) {
            
            // mock process argv
            mockProcessArgv([ '_', '_', invalidSiteName  ])

            // wrap tested function to catches eventual "process.exit" error
            await asyncProcessExitCatcher( siteAdd )

            // unmock process argv
            unmockProcessArgv()
            
            // check if new site folder exists
            const siteFolderAbsPath = getAbsolutePath(`/src/sites/${invalidSiteName}`)
            const exists = await virtualFs.promises.access( siteFolderAbsPath )
                .then( () => true )
                .catch( () => false )
            expect( exists ).toBe(false)

            // operation should be prevented
            expect( process.exit ).toHaveBeenCalledWith(1)
        }

    })
})