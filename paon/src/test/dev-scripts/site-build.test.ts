/** Testing dev script "site-build" */

import { vol } from "memfs"
import { vi, describe, expect, beforeEach, it } from "vitest"
import childProcess from "node:child_process"

import { getRootPath } from "#paon/utils/file-system"
import siteBuild from '#paon/dev-scripts/site-build/script'
import siteBuildAll from '#paon/dev-scripts/site-build-all/script'
import { runBuildSiteCommand } from "#paon/dev-scripts/site-build-all/sub-process"
import { getSiteBuildCommand } from '#paon/dev-scripts/site-build/template-command'

import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'
import { ScriptClosureRequest, ScriptExecError } from "#paon/dev-scripts/helpers/script-interuption"

import { withMockedProcessArgv } from '../testing-helpers/process-mocks'
import { interceptInteruptionErrors } from '../testing-helpers/catch-script-interuption'


// ---------------------------- MOCKS ---------------------------- 

vi.mock("node:child_process")
vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")
vi.mock( "#paon/dev-scripts/site-build-all/sub-process" )

// ---------------------------- DYNAMIC MOCKS ---------------------------- 

// we create a hoisted value containing a vi.fn object
// that we will be modifying the return value 
// depending on the test case
const dynamicMocks = vi.hoisted(() => {
    return {
        promptUser: vi.fn()
    }
})

// we attach that object to the mocked module
// this way every time we modify "dynamicMocks.promptUser"
// the behavior of that module changes
vi.mock("#paon/dev-scripts/helpers/prompt-user", () => {
    return {
        default: dynamicMocks.promptUser,
        promptUser: dynamicMocks.promptUser
    }
})

// ---------------------------- CONSTANTS ---------------------------- 
const ASSETS_BASE_URL = 'https://site.com/'
const NON_EXISTING_SITE = 'the-missing-site'
const EXISTING_VALID_SITE_1 = 'existing-site-1'
const EXISTING_VALID_SITE_2 = 'other-site'
const EXISTING_INVALID_SITE = '-invalid-site-name-'

const SITES_FOLDER_JSON = {
    [EXISTING_VALID_SITE_1]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
        'site.config.json': `{ "assetsBaseUrl": "${ASSETS_BASE_URL}" }`
    },
    [EXISTING_VALID_SITE_2]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
        'site.config.json': `{ "assetsBaseUrl": ${ASSETS_BASE_URL} }`
    },
    [EXISTING_INVALID_SITE]: {
        'app.ts': 'app code...',
        'component.ts': 'component code...',
        'site.config.json': `{ "assetsBaseUrl": ${ASSETS_BASE_URL} }`
    }
}

const SITE_FOLDER_NAMES = Object.keys(SITES_FOLDER_JSON)


// ---------------------------- RESETTING ---------------------------- 

beforeEach(async () => {
    
    // reset mocks
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


    // SPAWN A PROCESS TO BUILD THE CORRESPONDING SITE

    it("spawns a process to build the corresponding site (with process arg siteName)", async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_', EXISTING_VALID_SITE_1 ] 
            })
        )

        // checks that script tried to spawn a child process
        // with building command for given site
        const buildSiteCommand = getSiteBuildCommand({ 
            siteName: EXISTING_VALID_SITE_1, 
            assetsBaseUrl: ASSETS_BASE_URL
        })

        expect( childProcess.spawn ).toHaveBeenCalledWith( 
            buildSiteCommand, [], { shell:true }
        )

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })

    it("spawns a process to build the corresponding site (with user prompt siteName)", async () => {
        
        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( EXISTING_VALID_SITE_1 )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_' ] 
            })
        )

        // checks that script tried to spawn a child process
        // with building command for given site
        
        const buildSiteCommand = getSiteBuildCommand({ 
            siteName: EXISTING_VALID_SITE_1, 
            assetsBaseUrl: ASSETS_BASE_URL
        })

        expect( childProcess.spawn ).toHaveBeenCalledWith( 
            buildSiteCommand, [], { shell:true }
        )

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })


    // FAILS IF FOLDER WITH THAT NAME DOESN'T EXIST

    it("fails if folder with that name doesn't exist (with process arg siteName)", async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_', NON_EXISTING_SITE ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })

    it("fails if folder with that name doesn't exist (with user prompt siteName)", async () => {
        
        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( NON_EXISTING_SITE )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_' ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })


    // FAILS IF SITENAME IS INVALID, EVEN IF FOLDER EXISTS

    it('fails if sitename is invalid, even if folder exists (with process arg siteName)', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_', EXISTING_INVALID_SITE ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })

    it('fails if sitename is invalid, even if folder exists (with user prompt siteName)', async () => {
        
        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( EXISTING_INVALID_SITE )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_' ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })
    

    // HELP COMMAND

    it('does not run script if is called with help command in proces args', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_', HELP_COMMAND ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should be stoped before the end
        // by throwing a ScriptClosureRequest
        expect(raisedInterutionError).toBeInstanceOf(ScriptClosureRequest)
    })

    it('fails if trying to use help command as site name (through user prompt)', async () => {

        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( HELP_COMMAND )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuild, 
                argv: [ '_', '_' ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( childProcess.spawn ).not.toHaveBeenCalled()

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })

    // CHECKS THAT BUILD COMMAND INCLUDES THE CUSTOM ASSET BASE URL

    it("includes custom asset base url", async () => {

        // (needs to be global for matchAll)
        // pattern of the command setting up a custom asset base url
        const pattern = new RegExp(`--base ${ASSETS_BASE_URL}`, 'g') 

        // checks that script tried to spawn a child process
        // with building command for given site
        const buildSiteCommandA = getSiteBuildCommand({ 
            siteName: EXISTING_VALID_SITE_1, 
            assetsBaseUrl: ASSETS_BASE_URL
        })

        const buildSiteCommandB = getSiteBuildCommand({ 
            siteName: EXISTING_VALID_SITE_1, 
            assetsBaseUrl: '/'
        })

        const matches = buildSiteCommandA.matchAll(pattern)

        const numberOfMatches = matches
            ? Array.from(matches).length
            : 0
        
        // we make sure changing the "assetsBaseUrl"
        // changes the output
        expect(buildSiteCommandA != buildSiteCommandB).toBe(true)

        // we make sure the custom assetsBaseUrl is included twice
        // (one for client & one for server build command)
        expect(numberOfMatches).toEqual(2)
    })
})


// ---------------------------- TESTS: SITE-BUILD-ALL ---------------------------- 

describe('#site:build:all (dev-script)', () => {

    it('calls site:build script for every folder in src/sites', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors( siteBuildAll )

        // fonction generating sub-process should have been called for
        // every site names in the src/sites folder (valid or not)
        for ( const siteName of SITE_FOLDER_NAMES ) {
            expect( runBuildSiteCommand ).toHaveBeenCalledWith( siteName )
        }

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })

    it('should not run script if called with help command', async () => {
        
        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteBuildAll, 
                argv: [ '_', '_', HELP_COMMAND ] 
            })
        )

        // checks that the script didn't try to spawn a child process
        // with building command for invalid site
        expect( runBuildSiteCommand ).not.toHaveBeenCalled()

        // script should be stoped before the end
        // by throwing a ScriptClosureRequest
        expect(raisedInterutionError).toBeInstanceOf(ScriptClosureRequest)
    })
})