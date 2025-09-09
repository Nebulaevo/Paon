import { useParams } from 'wouter'
import type { Dict_T } from 'sniffly'

import MetaHat, {type MetaHatProps_T} from '@core:components/meta-hat/v1/component'

import './style.scss'


function PaonHelloPage(_props: Dict_T<any>) {

    const name = useParams().name ?? 'World'

    const headTags = _derivePageMetas(name)
    
    return <div className='paon-hello-page'>
        <MetaHat headTags={headTags}/>

        <div className='content'>
            <div className='title-container'>
                <h1 className='title-2' >Hello</h1>
                <h2 className='title-1' >{ name }</h2>
            </div>
        </div>
    </div>
}

function _derivePageMetas( name: string ): MetaHatProps_T['headTags'] {
    return [
        { tagType: 'TITLE', content: `Hi ${name}`},
        { tagType: 'META', name: 'description', content: `Simple page wishing a nice day to ${name}`},
    ]
}


export default PaonHelloPage