import { useCallback, useState } from "react";
import type { Dict_T } from "sniffly";

import './style.scss'


function _getFormattedData(props: Dict_T<unknown>) {
    const raws = Object.keys(props).map((key:string) => {
        const data = props[key] instanceof String 
            ? props[key]
            : JSON.stringify(props[key], null, 3)

        return <div key={key}>
            <h3>{key}</h3>
            <p>{ data }</p>
        </div>
    })
    
    return raws.length
        ? raws
        : <p>No props Received</p>
}

function PropsTable(props: Dict_T<unknown>) {

    const [show, setShow] = useState<boolean>(false)

    const formattedData = show 
        ? _getFormattedData(props)
        : null
    
    const buttonText = show
        ? 'Hide Props'
        : 'Show Props'

    const handleClick = useCallback(
        () => setShow(val => !val), 
        []
    )
    
    return <div className='props-table-component'>
        <button className='paon-secondary-btn' onClick={handleClick}>
            { buttonText }
        </button>
        {formattedData}
    </div>
}

export default PropsTable