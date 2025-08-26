import { PAGE_HEAD_TAG_CLS, checkStringAttrs } from './helpers'

type metaAllowedAttrs_T = Record<typeof ALLOWED_ATTRS[number], string>

type metaSpecs_T = {
    tagType: 'META',
// accepting all keys of 'ALLOWED_ATTRS' with string value
} & Partial<metaAllowedAttrs_T>

const ALLOWED_ATTRS = [
    'name', 'property', 'charset', 'itemprop', 'content'
] as const

/** Component rendering a `meta` tag 
 * 
 * (`meta` tags are automatically hoisted by React, 
 * and removed from head as soon as this component is unmounted)
 * 
 * @param props.tagType "META"
 * 
 * @param props can include any of theese allowed attrs (str): 
 * - `name`
 * - `property`
 * - `charset`
 * - `itemprop`
 * - `content`
*/
function Meta(props: metaSpecs_T) {
    const {
        tagType: _, 
        ...attrs
    } = props

    // if any non allowed attributes is set 
    // we do not render the tag
    const attrsAreValid = checkStringAttrs( attrs, ALLOWED_ATTRS as any as string[] )
    if (!attrsAreValid) return null
    
    // we set the meta hat class
    return <meta className={PAGE_HEAD_TAG_CLS} {...attrs} />
}

export default Meta
export type { metaSpecs_T }