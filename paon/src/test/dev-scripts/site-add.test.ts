/** Testing dev script "site-add" */

import { vol, fs as virtualFs, type NestedDirectoryJSON } from "memfs"
import { vi, describe, expect, beforeEach, it, beforeAll } from "vitest"

import { getRootPath, getAbsolutePath } from "#paon/utils/file-system"
import siteAdd from '#paon/dev-scripts/site-add/script'

import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'
import { ScriptClosureRequest, ScriptExecError } from "#paon/dev-scripts/helpers/script-interuption"

import { withMockedProcessArgv } from '../testing-helpers/process-mocks'
import { interceptInteruptionErrors } from '../testing-helpers/catch-script-interuption'
import { virtualizeFolder } from '../testing-helpers/virtualize-folder-content'


// ---------------------------- MOCKS ---------------------------- 

vi.mock("node:fs/promises")
vi.mock("#paon/utils/message-logging")

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

// cached json copy of /paon/ressources folder
let PAON_RESSOURCES_FOLDER_JSON: NestedDirectoryJSON

// site name samples
const NEW_SITE_NAME = 'new-site-0' // valid kebab-case, lowercase, alphanumerical
const EXISTING_SITE_NAME = 'existing-site'
const INVALID_SITE_NAMES = [ // (only kebab-case, lowercase, alphanumerical accepted ) 
    '-site', // starts with '-'
    'site-', // ends with '-'
    'si--te', // more than one consecutive '-' 
    '$ite' // non alphanumerical character
]


// ---------------------------- SET UP ---------------------------- 

beforeAll(async () => {
    PAON_RESSOURCES_FOLDER_JSON = await virtualizeFolder({absPath:getAbsolutePath('paon/ressources')})
})


// ---------------------------- RESETTING ---------------------------- 

beforeEach(async () => {

    // reset mocks
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


// ---------------------------- TESTS: SITE-ADD ---------------------------- 

describe('#site:add (dev-script)', () => {


    // SCHAFFOLDS A NEW SITE FOLDER

    it("scaffolds a new site folder (with process arg siteName)", async () => {

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteAdd, 
                argv: [ '_', '_', NEW_SITE_NAME ] 
            })
        )

        const siteFolderAbsPath = getAbsolutePath(`src/sites/${NEW_SITE_NAME}`)

        // check if new site folder exists
        const exists = await virtualFs.promises.access( siteFolderAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if folder/files have been created inside
        // (we don't check further as starter files might change)
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent.length).toBeGreaterThan(0)

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })

    it("scaffolds a new site folder (with user prompt siteName)", async () => {
        
        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( NEW_SITE_NAME )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteAdd, 
                argv: [ '_', '_' ] 
            })
        )

        const siteFolderAbsPath = getAbsolutePath(`src/sites/${NEW_SITE_NAME}`)

        // check if new site folder exists
        const exists = await virtualFs.promises.access( siteFolderAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(true)

        // check if folder/files have been created inside
        // (we don't check further as starter files might change)
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent.length).toBeGreaterThan(0)

        // script shouldn run to the end
        expect(raisedInterutionError).toEqual(undefined)
    })


    // FAILS IF FOLDER WITH THAT NAME ALREADY EXISTS

    it("fails if folder with that name already exists (with process arg siteName)", async () => {

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteAdd, 
                argv: [ '_', '_', EXISTING_SITE_NAME ] 
            })
        )

        // check if site folder still exists
        const siteFolderAbsPath = getAbsolutePath(`src/sites/${EXISTING_SITE_NAME}`)
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent).toEqual(['app.html'])

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })

    it("fails if folder with that name already exists (with user prompt siteName)", async () => {

        // modifying the return value of "promptUser" for this test case
        dynamicMocks.promptUser.mockResolvedValue( EXISTING_SITE_NAME )

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteAdd, 
                argv: [ '_', '_' ] 
            })
        )

        // check if site folder still exists
        const siteFolderAbsPath = getAbsolutePath(`src/sites/${EXISTING_SITE_NAME}`)
        const dirContent = await virtualFs.promises.readdir(siteFolderAbsPath)
        expect(dirContent).toEqual(['app.html'])

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })


    // FAILS IF SITENAME DOES NOT FIT EXPECTED PATTERN

    it("fails if sitename does not fit expected pattern (with process arg siteName)", async () => {

        for ( const invalidSiteName of INVALID_SITE_NAMES ) {
            
            // Wraps tested function to catch and return any eventual script interuption errors
            // to know how the script was closed
            const raisedInterutionError = await interceptInteruptionErrors(
                // Mocking given process argv
                withMockedProcessArgv({
                    asyncFunc: siteAdd, 
                    argv: [ '_', '_', invalidSiteName ] 
                })
            )
            
            // check if new site folder exists
            const siteFolderAbsPath = getAbsolutePath(`src/sites/${invalidSiteName}`)
            const exists = await virtualFs.promises.access( siteFolderAbsPath )
                .then( () => true )
                .catch( () => false )
            expect( exists ).toBe(false)

            // script should fail with a ScriptExecError
            expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
        }
    })

    it("fails if sitename does not fit expected pattern (with user prompt siteName)", async () => {

        for ( const invalidSiteName of INVALID_SITE_NAMES ) {
            
            // modifying the return value of "promptUser" for this test case
            dynamicMocks.promptUser.mockResolvedValue( invalidSiteName )

            // Wraps tested function to catch and return any eventual script interuption errors
            // to know how the script was closed
            const raisedInterutionError = await interceptInteruptionErrors(
                // Mocking given process argv
                withMockedProcessArgv({
                    asyncFunc: siteAdd, 
                    argv: [ '_', '_' ] 
                })
            )
            
            // check if new site folder exists
            const siteFolderAbsPath = getAbsolutePath(`src/sites/${invalidSiteName}`)
            const exists = await virtualFs.promises.access( siteFolderAbsPath )
                .then( () => true )
                .catch( () => false )
            expect( exists ).toBe(false)

            // script should fail with a ScriptExecError
            expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
        }
    })
    

    // HELP COMMAND
    
    it('does not run script if is called with help command in proces args', async () => {

        // Wraps tested function to catch and return any eventual script interuption errors
        // to know how the script was closed
        const raisedInterutionError = await interceptInteruptionErrors(
            // Mocking given process argv
            withMockedProcessArgv({
                asyncFunc: siteAdd, 
                argv: [ '_', '_', HELP_COMMAND ] 
            })
        )

        const sitesFolderAbsPath = getAbsolutePath(`src/sites`)

        // check that no new folders were created
        const dirContent = await virtualFs.promises.readdir(sitesFolderAbsPath) // Check the directory
        expect(dirContent.length).toBe(1) // the one test "existing-site" folder

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
                asyncFunc: siteAdd, 
                argv: [ '_', '_' ] 
            })
        )

        // check if new site folder exists
        const siteFolderAbsPath = getAbsolutePath(`src/sites/${HELP_COMMAND}`)
        const exists = await virtualFs.promises.access( siteFolderAbsPath )
            .then( () => true )
            .catch( () => false )
        expect( exists ).toBe(false)

        // script should fail with a ScriptExecError
        expect(raisedInterutionError).toBeInstanceOf(ScriptExecError)
    })
})