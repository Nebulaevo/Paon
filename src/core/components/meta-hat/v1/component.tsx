import { useMemo } from 'react'

import asClientOnly from '@core:components/as-client-only/v1/wrapper'
import { isExecutedOnClient } from '@core:utils/execution-context/v1/util'

import { queryMetaHatTags, removeTags } from './internal/helpers'
import Title, { type titleSpecs_T } from './internal/title'
import Meta, { type metaSpecs_T } from './internal/meta'
import HeadLink, { type linkSpecs_T } from './internal/link'
import JsonLd, { useResetJsonLdOnUnmount, type jsonLdSpecs_T } from './internal/json_ld'


type headTagSpecs_T = 
    titleSpecs_T
    | metaSpecs_T
    | linkSpecs_T
    | jsonLdSpecs_T

type MetaHatProps_T = {
    headTags: headTagSpecs_T[]
}

type tagRenderingMode_T = 'RENDER' | 'HOIST'

/** Clears all tags in the document head handled by `MetaHat`  */
function _clearMetaTags() {
    if (isExecutedOnClient()) {
        removeTags( queryMetaHatTags() )
    }
}

/** Takes a list of dictionnaries and renders according meta tags */
function asMetaTags(headTags: headTagSpecs_T[], renderingMode: tagRenderingMode_T) {
    let i = 0
    return headTags.map( tagProps => {
        i++
        switch (tagProps.tagType) {
            case 'TITLE':
                return <Title {...tagProps} key={i}/>
            case 'META':
                return <Meta {...tagProps} key={i}/>
            case 'LINK':
                return <HeadLink {...tagProps} key={i}/>
            case 'JSON_LD':
                return renderingMode === 'RENDER'
                    ? <JsonLd.Rendered {...tagProps} key={i}/>
                    : <JsonLd.Hoisted {...tagProps} key={i}/>
            default:
                return null
        }
    })
}

/** Component rendering page meta tags on the client side */
function _MetaHatClientComponent({ headTags }: MetaHatProps_T ) {

    // Hook in charge of manually removing the MetaHat json-ld tag
    // on component unmount or dependency change
    // as it is not handled by the new react meta hoisting feature
    useResetJsonLdOnUnmount([headTags])

    // we memoize the tags list so that '_clearMetaTags' 
    // does not run for every renders
    const tags = useMemo(() => {
        // before render we clear any eventual MetaHat tags
        // ( if some were rendered server side )
        _clearMetaTags()

        return asMetaTags(headTags, 'HOIST')
    }, [headTags])

    return <>{tags}</>
}

const MetaHat = asClientOnly(_MetaHatClientComponent)

export default MetaHat
export { MetaHat, asMetaTags }
export type { MetaHatProps_T }