import type { appProps_T } from '&interop-types/app-props'

import { useState } from 'react'

import paonIcon from '@core:assets/icons/paon.svg'
import { RelativeURL } from '@core:utils/url/v1/utils'
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
    { url, context }: appProps_T 
) {
    const purifiedUrl = new RelativeURL(url)
    // const purifiedUrl = purifyUrl( url, { forceRelativeUrl: true })
    const urlData = {
        rawUrl: url,
        purifiedUrl: purifiedUrl.toString(),
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
                <DataTable title='Page Context Received' data={context} />
            </div>
        </div>
    </div>
}

export default PaonDefaultPage