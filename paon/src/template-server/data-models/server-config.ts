/** Declares the ServerConfig class (extracting configuration for template server) */

import { isBool, isNumber } from "sniffly"

import { extractConfigValue, getJsonObjectConfig } from '#paon/utils/json-config'


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
        allowExternalAccess: false
    } as const

    port: number
    allowExternalAccess: boolean

    constructor() {
        this.port = ServerConfig.DEFAULT.port
        this.allowExternalAccess = ServerConfig.DEFAULT.allowExternalAccess
    }

    /** (async) attempts to extracts config settings from config file */
    async initFromConfigFile(): Promise<void> {

        const customConfig = await getJsonObjectConfig(
            ServerConfig.CONFIG_PATH
        )

        if (customConfig) {

            /* port
            determines the port of the server */
            this.port = extractConfigValue<number>(
                customConfig, {
                    key: 'port',
                    default: ServerConfig.DEFAULT.port,
                    configFilePath: ServerConfig.CONFIG_PATH,
                    validator: (port): port is number => {
                        return isNumber(port, {positive:true})
                    },
                }
            )

            /* allowExternalAccess
            determines if the server listens to external traffic */
            this.allowExternalAccess = extractConfigValue<boolean>(
                customConfig, {
                    key: 'allowExternalAccess',
                    default: ServerConfig.DEFAULT.allowExternalAccess,
                    configFilePath: ServerConfig.CONFIG_PATH,
                    validator: isBool,
                }
            )
        }
    }
}

export default ServerConfig