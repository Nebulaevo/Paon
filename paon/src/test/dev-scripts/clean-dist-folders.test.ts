/** Testing dev scripts "core-clean-outdir" and "site-clean-outdir" */

import { vol, fs as virtualFs } from "memfs"
import { vi, describe, expect, beforeEach, it, MockedFunction } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import coreCleanOutdir from '#paon/dev-scripts/core-clean-outdir/script'
import siteCleanOutdir from '#paon/dev-scripts/site-clean-outdir/script'


vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")

// the "readline" mock is made to fit this script
// (returns "y" to question and closes)
// so we do not make that mock global
vi.mock("node:readline/promises", () => {
    const mockModule = {
        createInterface: () => {
            return {
                question: vi.fn().mockResolvedValue('y'),
                close: () => {}
            }
        }
    }
    return {
        default: mockModule,
        ...mockModule
    }
})

// prevent process.exit from killing process while testing 
vi.spyOn(process, "exit").mockImplementation( (code) => {throw 'process.exit'} )



beforeEach(async () => {
    vol.reset()
    vol.fromJSON({
        // for core-clean-outdir tests
        './paon/dist/file1.js': 'PAON compiled js file 1',
        './paon/dist/folder/file2.js': 'PAON compiled js file 2',

        // for site-clean-outdir tests
        './dist/file1.js': 'SITE compiled js file 1',
        './dist/folder/file2.js': 'SITE compiled js file 2',
    }, getRootPath() ) // Simulate existing files in /paon/dist/
})

describe('#clean-outdir dev scripts', () => {
    
    it('core-clean-outdir should delete the content of /paon/dist directory', async () => {
        
        try {
            await coreCleanOutdir() // cleaning core dist folder

        } catch(e) { 
            // handling mocked 'process.exit'
            // if any other exception is thrown, we throw it back
            if (e !== 'process.exit') throw e

            console.log("CAUGHT")
        }
        
        const distAbsPath = getAbsolutePath('/paon/dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const files = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(files).toEqual([])

        // if process have been called, we check that it exited with code '0'
        const processExit = process.exit as MockedFunction<typeof process.exit>
        if ( processExit.mock.calls.length > 0 ) {
            expect( process.exit ).toHaveBeenCalledWith(0)
        }
    })

    it('site-clean-outdir should delete the content of /dist directory', async () => {

        try {
            await siteCleanOutdir() // cleaning site dist folder

        } catch(e) { 
            // handling mocked 'process.exit'
            // if any other exception is thrown, we throw it back
            if (e !== 'process.exit') throw e

            console.log("CAUGHT")
        }

        const distAbsPath = getAbsolutePath('/dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const files = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(files).toEqual([])

        // if process have been called, we check that it exited with code '0'
        const processExit = process.exit as MockedFunction<typeof process.exit>
        if ( processExit.mock.calls.length > 0 ) {
            expect( process.exit ).toHaveBeenCalledWith(0)
        }
    })
})