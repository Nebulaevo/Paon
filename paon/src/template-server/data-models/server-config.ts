/** Declares the ServerConfig class (extracting configuration for template server) */

import fs from 'node:fs/promises'

import { consoleWarnMessage } from '#paon/utils/message-logging'

import type { Dict_T } from "sniffly"
import { isBool, isNumber } from "sniffly"


type invalidKeyWarningMessageOptions_T = {
    keyName: string, 
    keyTypeName: string, 
    currentValue: unknown
}

type readingConfigFailedOptions_T = {
    configFilePath: string,
    error: unknown
}

/** Object representing the configuration of the Paon template server 
 * 
 * Attributes:
 * ----------
 * - **port** (int): 
 * Paon template server listening port
 * 
 * - **accessibleFromExterior** (boolean): 
 * if true server can be accessed from outside of localhost
 * 
 * Public Methods:
 * ---------------
 * - **initFromConfigFile** (async):
 * extract server config from json config file ('paon/server.config.json') 
 * 
 * @example
 * // creating a server config object
 * const serverConfig = new ServerConfig()
 * // extracting config from json file
 * await serverConfig.initFromConfigFile()
*/
class ServerConfig {
    
    port: number
    accessibleFromExterior: boolean

    /** init the object with default values */
    constructor() {
        this.port = 3000
        this.accessibleFromExterior = false
    }

    /** (async) extracts config settings from config file */
    async initFromConfigFile(): Promise<void> {

        const CONFIG_FILE_PATH = 'paon/server.config.json'

        try {
            const file = await fs.readFile( CONFIG_FILE_PATH, { flag:'r', encoding: 'utf8' } )
            const config: Dict_T<unknown> = JSON.parse( file )

            /* port
            determines the port of the server */
            if ( config.port && isNumber(config.port, {positive:true}) ) {
                this.port = config.port
            } else {
                this.#invalidKeyWarningMessage({
                    keyName: 'port', 
                    keyTypeName: 'positive number', 
                    currentValue: this.port
                })
            }

            /* accessibleFromExterior
            if false, the server is accessible only from localhost */
            if ( isBool(config.accessibleFromExterior) ) {
                this.accessibleFromExterior = config.accessibleFromExterior
            } else {
                this.#invalidKeyWarningMessage({
                    keyName: 'accessibleFromExterior', 
                    keyTypeName: 'boolean', 
                    currentValue: this.accessibleFromExterior
                })
            }

        } catch (e) {
            this.#readingConfigFailed({
                configFilePath: CONFIG_FILE_PATH,
                error: e
            })
        }
    }

    /** (private) log warning message to the console if json contained invalid data */
    #invalidKeyWarningMessage({
            keyName, 
            keyTypeName, 
            currentValue
    }: invalidKeyWarningMessageOptions_T ) {
        consoleWarnMessage( 
            `'${keyName}' (${keyTypeName}) key missing or invalid in server.config.json, appying default value ${currentValue}`,
            { iconName: 'warning' }
        )
    }

    /** (private) log warning message to the console if extracting json config failed */
    #readingConfigFailed({
        configFilePath,
        error
    }: readingConfigFailedOptions_T) {
        let message = `Extraction of server config from file at ${configFilePath} failed with error ${error}, `
        message += `default values are applied: [port] ${this.port}, [accessibleFromExterior] ${this.accessibleFromExterior}`
        
        consoleWarnMessage( 
            message,
            { iconName: 'warning' }
        )
    }
}

export default ServerConfig