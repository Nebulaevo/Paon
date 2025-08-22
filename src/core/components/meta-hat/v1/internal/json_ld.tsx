import { useEffect } from "react"
import { isDict, type Dict_T } from "sniffly"
import escapeJson from 'htmlescape'

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"

import { PAGE_HEAD_TAG_CLS, removeTags, withMetaHatClass } from './helpers'


type jsonLdSpecs_T = {
    tagType: 'JSON_LD',
    data: Dict_T<unknown>,
    className?: string,
}

function _toEscapedJsonString(data: unknown) {
    // we have to check if the data is a dict
    let escapedJsonString = ''
    if (isDict(data)) {
        try {
            escapedJsonString = escapeJson(data)
        } catch (_err) {
            escapedJsonString = ''
        }
    }
    return escapedJsonString
}

function _queryJsonLdTags() {
    return document.querySelectorAll(`head script.${PAGE_HEAD_TAG_CLS}`)
}

const JsonLd = {
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