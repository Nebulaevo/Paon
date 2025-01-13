import type { appProps_T } from '&internal-interface/app-props'

import { useState } from 'react'

import paonIcon from '@assets/icons/paon.svg'
import { purifyUrl } from '@utils/core/purify-url/v1/purify-url'
import './style.scss'


type DataTableProps_T = {
    title: string,
    data: {[key: string]: unknown}
}

function DataTable( { title, data }: DataTableProps_T ) {
    const keys = Object.keys(data)

    return (
        <table className='data-table'>
            <thead className='title-2'><tr><th colSpan={2}>{ title }</th></tr></thead>
            <tbody>
                { keys.map( key => {
                    const value = data[key]
                    let valueRepr: string

                    if ( typeof value === 'string' ) {
                        valueRepr = value
                    } else if ( value?.toString ) {
                        valueRepr = value.toString()
                    } else {
                        valueRepr = JSON.stringify( value )
                    }

                    return <tr key={key} >
                        <th>{ key }</th>
                        <td>{ valueRepr } </td>
                    </tr>
                })}
            </tbody>
        </table>
    )
}


function PaonDefaultPage(
    { url, pageContext }: appProps_T 
) {
    const purifiedUrl = purifyUrl( url, { forceRelativeUrl: true })
    const urlData = {
        rawUrl: url,
        purifiedUrl: purifiedUrl,
    }
    const [count, setCount] = useState(0)

    return <div className='paon-default-page-root'>
        <div className='content'>
            <header>
                <div className='icon-container'>
                    <svg>
                        <use xlinkHref={`${paonIcon}#icon`} href={`${paonIcon}#icon`} ></use>
                    </svg>
                </div>
                
                <div className='title-container'>
                    <h1 className='title-1' >Paon</h1>
                    <h2 className='title-2' >Template Server</h2>
                </div>
                
                <button className='counter-btn' onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </header>

            <div>
                <DataTable title='Requested URL' data={urlData} />
                <DataTable title='Page Context Received' data={pageContext} />
            </div>
        </div>
    </div>
}

export default PaonDefaultPage