import { isString } from 'sniffly'
import { withMetaHatClass } from './helpers'

type titleSpecs_T = {
    tagType: 'TITLE',
    content: string,
    className?: string,
}

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