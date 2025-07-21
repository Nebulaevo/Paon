import { useParams } from 'wouter'
import type { Dict_T } from 'sniffly'

import './style.scss'


function PaonHelloPage(_props: Dict_T<any>) {

    const name = useParams().name

    return <div className='paon-hello-page'>
        <div className='content'>
            <div className='title-container'>
                <h1 className='title-2' >Hello</h1>
                <h2 className='title-1' >{ name }</h2>
            </div>
        </div>
    </div>
}

export default PaonHelloPage