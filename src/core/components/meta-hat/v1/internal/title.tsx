import { isString } from 'sniffly'
import { PAGE_HEAD_TAG_CLS } from './helpers'

type titleSpecs_T = {
    tagType: 'TITLE',
    content: string
}

/** Component rendering a `title` tag 
 * 
 * (`title` tags are automatically hoisted by React, 
 * and removed from head as soon as this component is unmounted)
 * 
 * @param props.tagType "JSON_LD"
 * 
 * @param props.content (string) page's title
*/
function Title(props: titleSpecs_T) {
    
    const content = isString(props.content) ? props.content : ''

    // we set the meta hat class
    return <title className={PAGE_HEAD_TAG_CLS}>
        { content }
    </title>
}

export default Title
export type { titleSpecs_T }