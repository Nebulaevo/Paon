/** Declares the SiteConfig class (handling configuration for a registered site) */

import { isString } from "sniffly"

import { extractConfigValue, getJsonObjectConfig } from '#paon/utils/json-config'
import { getSiteConfigRelativePath } from '#paon/utils/file-system'

/** Object representing the configuration of a registered site
 * 
 * @example
 * // creating a site config object
 * const siteConfig = new SiteConfig( 'my-site-name' )
 * // extracting config from json file
 * await siteConfig.initFromConfigFile()
*/
class SiteConfig {

    static DEFAULT = {
        assetsBaseUrl: '/',
        
    } as const

    configFilePath: string
    assetsBaseUrl: string

    constructor( siteName: string ) {
        this.configFilePath = getSiteConfigRelativePath( siteName )

        this.assetsBaseUrl = SiteConfig.DEFAULT.assetsBaseUrl
    }

    /** (async) attempts to extracts config settings from config file */
    async initFromConfigFile(): Promise<void> {

        const customConfig = await getJsonObjectConfig(
            this.configFilePath
        )

        if (customConfig) {

            /* assetsBaseUrl
            if we want to serve the assets from another server  
            we can defined a URL base to be inserted before every
            asset path as: ${BASE}/assets/... */
            this.assetsBaseUrl = extractConfigValue<string>(
                customConfig, {
                    key: 'assetsBaseUrl',
                    default: SiteConfig.DEFAULT.assetsBaseUrl,
                    configFilePath: this.configFilePath,
                    validator: (baseUrl): baseUrl is string => {
                        return isString(baseUrl, {nonEmpty:true})
                    },
                }
            )
        }
    }
}

export default SiteConfig
export type { SiteConfig }