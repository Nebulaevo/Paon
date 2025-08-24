import { isString } from 'sniffly'
import { withMetaHatClass } from './helpers'

type titleSpecs_T = {
    tagType: 'TITLE',
    content: string,
    className?: string,
}

/** Component rendering a `title` tag 
 * 
 * (`title` tags are automatically hoisted by React, 
 * and removed from head as soon as this component is unmounted)
 * 
 * @param props.tagType "JSON_LD"
 * 
 * @param props.content (string) page's title
 * 
 * @param props.className (optional string) html classes
*/
function Title(props: titleSpecs_T) {
    
    const content = isString(props.content) ? props.content : ''

    // we include the meta hat class
    const className = withMetaHatClass(props.className)

    return <title className={className}>
        { content }
    </title>
}

export default Title
export type { titleSpecs_T }