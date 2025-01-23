import { vol, fs as virtualFs } from "memfs"
import { vi, describe, expect, beforeEach, it } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import script from '#paon/dev-scripts/core-clean-outdir/script'


const resetModules = vi.hoisted(() => vi.resetModules() )

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
        './paon/dist/file1.js': 'compiled js file 1',
        './paon/dist/file2.js': 'compiled js file 2',
    }, getRootPath() ) // Simulate existing files in /paon/dist/
})

describe('#core:clean-outdir', () => {
    
    it('Should delete the content of /paon/dist directory', async () => {
        await script() // Run the function

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
})