/** Testing dev script "site-build" */

import { vol } from "memfs"
import { vi, describe, expect, beforeEach, it, type MockedFunction } from "vitest"
import childProcess from "node:child_process"

import { getRootPath } from "#paon/utils/file-system"
import siteBuild from '#paon/dev-scripts/site-build/script'
import { SCRIPT_NAME as BUILD_SITE_COMMAND } from '#paon/dev-scripts/site-build/constants'
import siteBuildAll from '#paon/dev-scripts/site-build-all/script'
import { runBuildSiteCommand } from "#paon/dev-scripts/site-build-all/sub-process"
import { getSiteBuildCommand } from '#paon/dev-scripts/site-build/sub-process'

import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'

import { 
    processExitMockImplementation, 
    asyncProcessExitCatcher,
    mockProcessArgv,
    unmockProcessArgv
} from '../testing-helpers/process-mocks'


// ---------------------------- MOCKS ---------------------------- 

vi.mock("node:child_process")
vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")
vi.mock( "#paon/dev-scripts/site-build-all/sub-process" )

// prevent process.exit from killing process while testing 
vi.spyOn(process, "exit").mockImplementation( processExitMockImplementation )



// ---------------------------- CONSTANTS ---------------------------- 

const NON_EXISTING_SITE = 'the-missing-site'
const EXISTING_VALID_SITE_1 = 'existing-site-1'
const EXISTING_VALID_SITE_2 = 'other-site'
const EXISTING_INVALID_SITE = '-INVALID-SITE-NAME-'

const SITES_FOLDER_JSON = {
    [EXISTING_VALID_SITE_1]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
    },
    [EXISTING_VALID_SITE_2]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
    },
    [EXISTING_INVALID_SITE]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
    }
}

const SITE_FOLDER_NAMES = Object.keys(SITES_FOLDER_JSON)


// ---------------------------- RESETTING ---------------------------- 

beforeEach(async () => {
    
    // reset process.exit spy
    vi.clearAllMocks()

    // reset virtual file system
    vol.reset()
    vol.fromNestedJSON({
        './src': {
            'sites': SITES_FOLDER_JSON
        },
        './dist': {}
    }, getRootPath())
})


// ---------------------------- TESTS: SITE-BUILD ---------------------------- 

describe('#site:build (dev-script)', () => {

    it("spawns a process to build the corresponding site", async () => {
        // mock process argv
        mockProcessArgv([ '_', '_', EXISTING_VALID_SITE_1 ])

        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuild )

        // unmock process argv
        unmockProcessArgv()


        // checks that script tried to spawn a child process
        // with building command for given site
        const buildSiteCommand = getSiteBuildCommand( EXISTING_VALID_SITE_1 )
        expect( childProcess.spawn ).toHaveBeenCalledWith( 
            buildSiteCommand, [], { shell:true }
        )

        // if process.exit have been called, we check that it exited with code '0'
        const processExit = process.exit as MockedFunction<typeof process.exit>
        if ( processExit.mock.calls.length > 0 ) {
            expect( process.exit ).toHaveBeenCalledWith(0)
        }
    })

    it("fails if folder with that name doesn't exist", async () => {
        // mock process argv
        mockProcessArgv([ '_', '_', NON_EXISTING_SITE  ])

        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuild )

        // unmock process argv
        unmockProcessArgv()

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // checks that process was closed with error
        expect( process.exit ).toHaveBeenCalledWith(1)
    })

    it('fails if sitename is invalid (even if folder exists)', async () => {
        // mock process argv
        mockProcessArgv([ '_', '_', EXISTING_INVALID_SITE  ])

        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuild )

        // unmock process argv
        unmockProcessArgv()

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // checks that process was closed with error
        expect( process.exit ).toHaveBeenCalledWith(1)
    })
    
    it('should not run script if called with help command', async () => {
        // mock process argv
        mockProcessArgv([ '_', '_', HELP_COMMAND  ])

        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuild )

        // unmock process argv
        unmockProcessArgv()

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // checks that process was closed without error
        expect( process.exit ).toHaveBeenCalledWith(0)
    })
})


// ---------------------------- TESTS: SITE-BUILD-ALL ---------------------------- 

describe('#site:build:all (dev-script)', () => {

    it('calls site:build script for every folder in src/sites', async () => {
        
        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuildAll )

        // fonction generating sub-process should have been called for
        // every site names in the src/sites folder (valid or not)
        for ( const siteName of SITE_FOLDER_NAMES ) {
            expect( runBuildSiteCommand ).toHaveBeenCalledWith( siteName )
        }

        // if process.exit have been called, we check that it exited with code '0'
        const processExit = process.exit as MockedFunction<typeof process.exit>
        if ( processExit.mock.calls.length > 0 ) {
            expect( process.exit ).toHaveBeenCalledWith(0)
        }
    })

    it('should not run script if called with help command', async () => {
        // mock process argv
        mockProcessArgv([ '_', '_', HELP_COMMAND  ])

        // wrap tested function to catch eventual "process.exit" error
        await asyncProcessExitCatcher( siteBuildAll )

        // unmock process argv
        unmockProcessArgv()

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( runBuildSiteCommand ).not.toHaveBeenCalled()

        // checks that process was closed without error
        expect( process.exit ).toHaveBeenCalledWith(0)
    })
})