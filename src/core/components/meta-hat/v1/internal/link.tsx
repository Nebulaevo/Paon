import {isAbsoluveUrl, AbsoluteURL, RelativeURL } from '@core:utils/url/v1/utils'

import { PAGE_HEAD_TAG_CLS, withMetaHatClass, checkStringAttrs } from './helpers'


type linkAllowedAttrs_T = Record<typeof ALLOWED_ATTRS[number], string>

type linkSpecs_T = {
    tagType: 'LINK',
// accepting all keys of 'ALLOWED_ATTRS' with string value
} & Partial<linkAllowedAttrs_T>

const ALLOWED_ATTRS = [
    'className', 'rel', 'href', 'sizes', 'media', 'type', 'as'
] as const



function HeadLink(props: linkSpecs_T) {
    const {
        tagType: _,
        ...attrs
    } = props

    // if any non allowed attributes is set 
    // we do not render the tag
    const attrsAreValid = checkStringAttrs( attrs, ALLOWED_ATTRS as any as string[] )
    if (!attrsAreValid) return null
    
    // we include the meta hat class
    attrs.className = withMetaHatClass(attrs.className)

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

    return <link className={PAGE_HEAD_TAG_CLS} {...attrs} />
}

export default HeadLink
export type { linkSpecs_T }