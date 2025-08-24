import { useEffect } from "react"
import { isDict, type Dict_T } from "sniffly"
import htmlEscapedStringify from 'htmlescape'

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"

import { PAGE_HEAD_TAG_CLS, removeTags, withMetaHatClass } from './helpers'


type jsonLdSpecs_T = {
    tagType: 'JSON_LD',
    data: Dict_T<unknown>,
    className?: string,
}

/** Converts the data dict to an html escaped json string */
function _toEscapedJsonString(data: unknown) {
    // we have to check if the data is a dict
    let escapedJsonString = ''
    if (isDict(data)) {
        try {
            escapedJsonString = htmlEscapedStringify(data)
        } catch (_err) {
            escapedJsonString = ''
        }
    }
    return escapedJsonString
}

/** Returns all script tags in the document head handled by `MetaHat` */
function _queryJsonLdTags() {
    return document.querySelectorAll(`head script.${PAGE_HEAD_TAG_CLS}`)
}

/** Components for handling json ld tag 
 * 
 * (`script` component are not automaticatlly hoisted by react, 
 * it has to be done manually in a side effect)
*/
const JsonLd = {
    /** For the server side rendering: returns a json ld script tag 
     * 
     * @param props.tagType "JSON_LD"
     * 
     * @param props.data (dict) structured data dictionnary
     * 
     * @param props.className (optional string) html classes
    */
    Rendered: (props: jsonLdSpecs_T) => {
        const escapedJsonString = _toEscapedJsonString(props.data)
        
        // we include the meta hat class
        const className = withMetaHatClass(props.className)

        return <script 
            type="application/ld+json" 
            className={className}
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(escapedJsonString),
            }}
        />
    },

    /** For the client side: triggers a side effect adding the tag in the document's head 
     * 
     * @param props.tagType "JSON_LD"
     * 
     * @param props.data (dict) structured data dictionnary
     * 
     * @param props.className (optional string) html classes
    */
    Hoisted: (props: jsonLdSpecs_T) => {
        const escapedJsonString = _toEscapedJsonString(props.data)

        // we include the meta hat class
        const className = withMetaHatClass(props.className)

        // Side effect:
        // manually hoisting json ld script tag
        useEffect(() => {
            if ( isExecutedOnClient() ) {
                // we manually create and add
                // the tag as it is not hoisted by react like <title>, <meta> and <link>
                const scriptTag = document.createElement('script')
                scriptTag.setAttribute('class', className)
                scriptTag.setAttribute('type', 'application/ld+json')
                scriptTag.textContent = escapedJsonString

                document.head.appendChild(scriptTag)
            }
        }, [props.data])

        return null
    }
} as const

/** Adds a side effect manually removing any MetaHat script tags
 * on unmount and for any change of the given dependency array
 * 
 * @param deps dependency array given to the underlying useEffect, 
 */
function useResetJsonLdOnUnmount(deps?: React.DependencyList) {
    // Side effect:
    // manually removing json ld script tag
    useEffect(() => {
        return () => {
            if (isExecutedOnClient()) {
                removeTags( _queryJsonLdTags() )
            }
        }
    }, deps)
}

export default JsonLd
export {JsonLd, useResetJsonLdOnUnmount}
export type { jsonLdSpecs_T }