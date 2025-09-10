import { createPortal } from "react-dom"
import { isDict, type Dict_T } from "sniffly"
import htmlEscapedStringify from 'htmlescape'

import { isExecutedOnServer } from "@core:utils/execution-context/v1/util"

import { PAGE_HEAD_TAG_CLS } from './helpers'


type jsonLdSpecs_T = {
    tagType: 'JSON_LD',
    data: Dict_T<unknown>
}

/** Converts the data dict to an html escaped json string */
function _toEscapedJsonString(data: unknown) {
    // we have to check if the data is a dict
    let escapedJsonString: string | undefined = undefined
    if (isDict(data)) {
        try {
            escapedJsonString = htmlEscapedStringify(data)
        } catch (_err) {
            escapedJsonString = undefined
        }
    }
    return escapedJsonString
}

function _getHeadTag() {
    if (isExecutedOnServer()) return undefined
    return document.head
}

function _buildJsonLdTag(data:unknown) {
    const escapedJsonString = _toEscapedJsonString(data)
    if (!escapedJsonString) return null

    return <script 
        // we set the meta hat class
        className={PAGE_HEAD_TAG_CLS}
        type="application/ld+json" 
        dangerouslySetInnerHTML={{
            __html: escapedJsonString
        }}
    />
}

/** Components for handling json ld tag 
 * 
 * (`script` component are not automaticatlly hoisted by react, 
 * it has to be done manually)
*/
const JsonLd = {
    /** For the server side rendering: returns a json ld script tag 
     * 
     * @param props.tagType "JSON_LD"
     * 
     * @param props.data (dict) structured data dictionnary
    */
    Rendered: (props: jsonLdSpecs_T) => {
        return _buildJsonLdTag(props.data)
    },

    /** For the client side: uses a react portal to render the tag in the document's head 
     * 
     * @param props.tagType "JSON_LD"
     * 
     * @param props.data (dict) structured data dictionnary
    */
    Hoisted: (props: jsonLdSpecs_T) => {
        const head = _getHeadTag()
        if (head) return createPortal(
            _buildJsonLdTag(props.data), 
            head
        )

        return null
    }
} as const

export default JsonLd
export type { jsonLdSpecs_T }