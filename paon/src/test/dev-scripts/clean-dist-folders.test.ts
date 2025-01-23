import { vol, fs as virtualFs } from "memfs"
import { vi, describe, expect, beforeEach, it } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import coreCleanOutdir from '#paon/dev-scripts/core-clean-outdir/script'
import siteCleanOutdir from '#paon/dev-scripts/site-clean-outdir/script'


vi.hoisted(() => vi.resetModules() )

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
        await coreCleanOutdir() // cleaning core dist folder

        const distAbsPath = getAbsolutePath('/paon/dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const files = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(files).toEqual([])
    })

    it('site-clean-outdir should delete the content of /dist directory', async () => {
        await siteCleanOutdir() // cleaning site dist folder

        const distAbsPath = getAbsolutePath('/dist')

        // check if dist dir still exists
        const exists = await virtualFs.promises.access( distAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if it had been emptied 
        const files = await virtualFs.promises.readdir(distAbsPath) // Check the directory
        expect(files).toEqual([])
    })
})