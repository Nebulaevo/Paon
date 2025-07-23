/** Testing dev scripts "core-clean-outdir" and "site-clean-outdir" */

import { vol, fs as virtualFs } from "memfs"
import { vi, describe, expect, beforeEach, it } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import coreCleanOutdir from '#paon/dev-scripts/core-clean-outdir/script'
import siteCleanOutdir from '#paon/dev-scripts/site-clean-outdir/script'

import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'
import { ScriptClosureRequest } from "#paon/dev-scripts/helpers/script-interuption"

import { withMockedProcessArgv } from '../testing-helpers/process-mocks'
import { interceptInteruptionErrors } from '../testing-helpers/catch-script-interuption'



// ---------------------------- MOCKS ---------------------------- 

vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")

vi.mock("#paon/dev-scripts/helpers/prompt-user", () => {
    const mockedPromptUser = vi.fn().mockResolvedValue('y')
    return {
        default: mockedPromptUser,
        promptUser: mockedPromptUser
    }
})

// ---------------------------- CONSTANTS ---------------------------- 

const DIST_FOLDER_TEST_CONTENT = {
    'file-1.js': 'compiled js file 1',
    'folder': {
        'file-2.js': 'compiled js file 2',
    },
    'other-folder': {
        'deep-folder': {
            'file-3.js': 'compiled js file 3',
        }
    }
}

const ELEM_COUNT_IN_DIST_ROOT = Object.keys( DIST_FOLDER_TEST_CONTENT ).length


// ---------------------------- RESETTING ---------------------------- 

beforeEach(async () => {

    // reset mocks
    vi.clearAllMocks()

    // reset virtual file system
    vol.reset()
    vol.fromNestedJSON({
        // for core-clean-outdir tests
        './paon': {
            'dist': DIST_FOLDER_TEST_CONTENT
        },
        // for site-clean-outdir tests
        './dist': DIST_FOLDER_TEST_CONTENT
    }, getRootPath() ) // Simulate existing files in /paon/dist/
})


// ---------------------------- TESTS: CORE-CLEAN-OUTDIR ---------------------------- 

describe('#core:clean-outdir (dev-script)', () => {
    
    it('should delete the content of /paon/dist directory', async () => {

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors( coreCleanOutdir )
        
        const distAbsPath = getAbsolutePath('paon/dist')
        
        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const dirContent = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(dirContent).toEqual([])

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })

    it('should not run script if called with help command', async () => {

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors( 
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: coreCleanOutdir, 
                argv: [ '_', '_', HELP_COMMAND ] 
            })
        )

        const distAbsPath = getAbsolutePath('paon/dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check that it wasn't emptied
        const dirContent = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(dirContent.length).toEqual(ELEM_COUNT_IN_DIST_ROOT)

        // script should be stoped before the end
        // by throwing a ScriptClosureRequest
        expect(raisedInterutionError).toBeInstanceOf(ScriptClosureRequest)
    })
})


// ---------------------------- TESTS: SITE-CLEAN-OUTDIR ---------------------------- 

describe('#site:clean-outdir (dev-script)', () => {
    
    it('should delete the content of /dist directory', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors( siteCleanOutdir )
        
        const distAbsPath = getAbsolutePath('dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const dirContent = await virtualFs.promises.readdir(distAbsPath)
        expect(dirContent).toEqual([])

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })

    it('should not run script if called with help command', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors( 
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteCleanOutdir, 
                argv: [ '_', '_', HELP_COMMAND ] 
            })
        )

        const distAbsPath = getAbsolutePath('dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check that it wasn't emptied
        const dirContent = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(dirContent.length).toEqual(ELEM_COUNT_IN_DIST_ROOT)

        // script should be stoped before the end
        // by throwing a ScriptClosureRequest
        expect(raisedInterutionError).toBeInstanceOf(ScriptClosureRequest)
    })
})