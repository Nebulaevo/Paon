import { renderToString } from 'react-dom/server'
import { isArray } from 'sniffly'

import { isExecutedOnServer } from '@core:utils/execution-context/v1/util'

import { asMetaTags, type MetaHatProps_T } from './component'

function MetaHatServer({ headTags }: MetaHatProps_T ) {
    return <>{asMetaTags(headTags, 'RENDER')}</>
}

function renderMetasToString(metaTags: MetaHatProps_T['headTags']) {

    // checking if is an array of dictionnaries
    if (!isArray(metaTags, {nonEmpty:true, itemType: 'dict'})) return ''
    // checking if exectuted on server
    if (!isExecutedOnServer()) return ''
    
    return renderToString(
        <MetaHatServer 
            headTags={metaTags} 
        />
    )
}


export { renderMetasToString }
export type { MetaHatProps_T }