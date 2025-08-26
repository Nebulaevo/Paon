import {isAbsoluveUrl, AbsoluteURL, RelativeURL } from '@core:utils/url/v1/utils'

import { PAGE_HEAD_TAG_CLS, checkStringAttrs } from './helpers'


type linkAllowedAttrs_T = Record<typeof ALLOWED_ATTRS[number], string>

type linkSpecs_T = {
    tagType: 'LINK',
// accepting all keys of 'ALLOWED_ATTRS' with string value
} & Partial<linkAllowedAttrs_T>

const ALLOWED_ATTRS = [
    'rel', 'href', 'sizes', 'media', 'type', 'as', 'title'
] as const


/** Component rendering a `link` tag 
 * 
 * (`link` tags are automatically hoisted by React, 
 * and removed from head as soon as this component is unmounted)
 * 
 * @param props.tagType "LINK"
 * 
 * @param props can include any of theese allowed attrs (str): 
 * - `rel`
 * - `href`
 * - `sizes`
 * - `media`
 * - `type`
 * - `as`
 * - `title`
*/
function HeadLink(props: linkSpecs_T) {
    const {
        tagType: _,
        ...attrs
    } = props

    // if any non allowed attributes is set 
    // we do not render the tag
    const attrsAreValid = checkStringAttrs( attrs, ALLOWED_ATTRS as any as string[] )
    if (!attrsAreValid) return null

    // if a URL has been given we escape it
    if (attrs.href) {
        try {
            const url = isAbsoluveUrl(attrs.href)
                ? new AbsoluteURL(attrs.href, undefined, {onPurifyFail:'ERROR'})
                : new RelativeURL(attrs.href, {onPurifyFail:'ERROR'})

            attrs.href = url.toString()

        } catch (err) {
            console.error('could not render link element with invalid href URL')
            console.error(err)
            // if parsing the href throws an error we do not render the link element
            return null
        }
    }

    // we set the meta hat class
    return <link className={PAGE_HEAD_TAG_CLS} {...attrs} />
}

export default HeadLink
export type { linkSpecs_T }