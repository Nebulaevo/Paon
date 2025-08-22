import { useState } from 'react'
import type { Dict_T } from 'sniffly'

import MetaHat, {type MetaHatProps_T} from '@core:components/meta-hat/v1/component'

import PropsTable from '../../components/props-table/component'

import PeacockSVG from '../../assets/icons/peacock.svg?react'
import './style.scss'


function PaonWelcomePage(props: Dict_T<any>) {

    const [count, setCount] = useState(0)

    return <div className='paon-welcome-page'>
        <MetaHat headTags={staticMetas} />

        <div className='content'>
            <header>
                <div className='icon-container'>
                    <PeacockSVG/>
                </div>
                
                <div className='title-container'>
                    <h1 className='title-1' >Paon</h1>
                    <h2 className='title-2' >Template Server</h2>
                </div>
                
                <button className='counter-btn paon-primary-btn' onClick={() => setCount((count) => count + 1)}>
                    Count is {count}
                </button>
            </header>
            
            <div className='table-container'>
                <PropsTable {...props}/>
            </div>
        </div>
    </div>
}

const staticMetas: MetaHatProps_T['headTags'] = [
    { tagType: 'TITLE', content: 'Home | Paon Template Server'},
    { tagType: 'META', name: 'description', content: 'This is a demo page for Paon template server' },
    { tagType: 'LINK', rel: 'canonical', href: 'https://my-site.com/' },
    { tagType: 'JSON_LD', data: {
        "@context": "http://schema.org",
        "@type": "WebSite",
        "name": "My site",
        "url": "https://my-site.com/"
    }}
]

export default PaonWelcomePage
export { PaonWelcomePage, staticMetas }