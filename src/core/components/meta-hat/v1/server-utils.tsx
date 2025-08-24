import { renderToString } from 'react-dom/server'
import { isArray } from 'sniffly'

import { isExecutedOnServer } from '@core:utils/execution-context/v1/util'

import { asMetaTags, type MetaHatProps_T } from './component'

/** Component rendering page meta tags on the server side */
function MetaHatServer({ headTags }: MetaHatProps_T ) {
    return <>{asMetaTags(headTags, 'RENDER')}</>
}

/** Server side function for rendering page meta tags
 * 
 * @param metaTags list of dictionnaries describing the desired meta tags
 */
function renderMetasToString(metaTags: MetaHatProps_T['headTags'] ) {
    
    // checking if exectuted on server
    if (!isExecutedOnServer()) return ''

    // Remark:
    // Given value of metaTags have to be checked, 
    // in entry-server.tsx, it is an unknown value extracted from the context      
    // (checking if is an array of dictionnaries)
    if (!isArray(metaTags, {nonEmpty:true, itemType: 'dict'})) return ''
    
    return renderToString(
        <MetaHatServer 
            headTags={metaTags} 
        />
    )
}


export { renderMetasToString }
export type { MetaHatProps_T }