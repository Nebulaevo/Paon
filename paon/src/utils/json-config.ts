import { isDict, type Dict_T } from "sniffly"

import { getFileContent } from '#paon/utils/file-system'
import { consoleWarnMessage } from  '#paon/utils/message-logging'

type configKeySpec<T> = {
    key: string,
    default: T,
    configFilePath: string,
    validator: (value: unknown) => value is T,
}

/** Utility function for extracting configuration values 
 * 
 * @param configObj (object) - The config object extracted from the json file
 * 
 * @param specs.key (string) - object key
 * 
 * @param specs.default (T) - the default value
 * 
 * @param specs.configFilePath - (string) path to the config file for logging
 * 
 * @param specs.validator - (function) validation function (also performing type narrowing)
*/
function extractConfigValue<T>(configObj: Dict_T<unknown>, specs:configKeySpec<T> ): T {

    const value = configObj[specs.key]
    if (value === undefined) return specs.default

    if (specs.validator(value)) return value
    else {
        // a value has been given but it's invalid
        let message = `"${specs.key}" key is invalid in config file at ${specs.configFilePath} `
        message += `the default value will be used : ${specs.default}`
        
        consoleWarnMessage(
            message,
            { iconName: 'warning' }
        )

        return specs.default
    }
}

/** Returns a config object from a json file */
async function getJsonObjectConfig(filePathFromRoot: string): Promise<Dict_T<unknown> | undefined> {
    
    const file = await getFileContent( filePathFromRoot )
    if (!file) return undefined

    try {
        const config = JSON.parse(file)
        
        if (!isDict(config)) throw new TypeError(
            `Json config should be a key/value object but received: ${typeof config}`
        )

        return config

    } catch (err) {
        let message = 'Attempt to extract config object from json file at: '
        message += `${filePathFromRoot} `
        message += `failed with error: ${err}`
        consoleWarnMessage(
            message,
            { iconName: 'warning' }
        )

        return undefined
    }
}

export {
    extractConfigValue,
    getJsonObjectConfig
}
