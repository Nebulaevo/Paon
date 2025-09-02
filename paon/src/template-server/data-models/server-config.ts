/** Declares the ServerConfig class (extracting configuration for template server) */

import fs from 'node:fs/promises'

import { consoleWarnMessage } from '#paon/utils/message-logging'

import type { Dict_T } from "sniffly"
import { isBool, isDict, isNumber } from "sniffly"


type invalidKeyWarningMessageOptions_T = {
    keyName: string, 
    keyTypeName: string, 
    currentValue: unknown
}


/** Object representing the configuration of the Paon template server 
 * 
 * @example
 * // creating a server config object
 * const serverConfig = new ServerConfig()
 * // extracting config from json file
 * await serverConfig.initFromConfigFile()
*/
class ServerConfig {
    
    static CONFIG_PATH = 'paon/server.config.json' as const
    static DEFAULT = {
        port: 3000,
    }

    port: number

    constructor() {
        this.port = ServerConfig.DEFAULT.port
    }

    /** (async) extracts config settings from config file */
    async initFromConfigFile(): Promise<void> {


        const customConfig = await this.#getCustomConfig()
        if (customConfig) {
            /* port
            determines the port of the server */
            if ( customConfig.port && isNumber(customConfig.port, {positive:true}) ) {
                this.port = customConfig.port
            } else {
                this.#invalidKeyWarningMessage({
                    keyName: 'port', 
                    keyTypeName: 'positive number', 
                    currentValue: this.port
                })
            }
        }
    }

    /** returns the custom config hashmap if it exists and is valid */
    async #getCustomConfig(): Promise<Dict_T<unknown> | undefined> {

        const file = await this.#getCustomConfigFile()
        if (!file) return undefined

        try {
            const config = JSON.parse( file )
            return isDict(config) ? config : undefined

        } catch (err) {
            this.#invalidCustomConfigWarningMessage(err)
            return undefined
        }
    }

    /** returns the config file if it exists */
    async #getCustomConfigFile(): Promise<string | undefined> {
        try {
            const file = await fs.readFile( ServerConfig.CONFIG_PATH, { flag:'r', encoding: 'utf8' } )
            return file
        } catch (_err) {
            return undefined
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
    #invalidCustomConfigWarningMessage(error: Error | unknown) {
        let message = `Extraction of server config from file at ${ServerConfig.CONFIG_PATH} failed with error ${error}, `
        message += `default values are applied: [port] ${this.port}`
        
        consoleWarnMessage( 
            message,
            { iconName: 'warning' }
        )
    }
}

export default ServerConfig