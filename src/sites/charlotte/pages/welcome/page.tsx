import { useState } from 'react'
import type { Dict_T } from 'sniffly'

import PropsTable from '../../components/props-table/component'

import PeacockSVG from '../../assets/icons/peacock.svg?react'

import './style.scss'


function PaonWelcomePage(props: Dict_T<any>) {

    const [count, setCount] = useState(0)

    return <div className='paon-welcome-page'>
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

export default PaonWelcomePage