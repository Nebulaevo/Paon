import { useCallback, useState } from "react"
import { RelativeUrl } from "url-toolbox"

import { RelativeLink } from "@core:routing/v1/link"

import FeatherSVG from '../../assets/icons/peacock-feather.svg?react'
import './style.scss'


function NavBar() {

    const [value, setValue] = useState('')

    const handleChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            // ignores '/' & '\' for compatibility with WSGI/ASGI server
            // (WSGI/ASGI server uses a decoded URL)
            const escapedValue = ev.target.value
                .trim()
                .replace(/[\\\/]/g, '')

            setValue(escapedValue)
        }, []
    )

    const helloUrl = new RelativeUrl()
    helloUrl.pathname = [ 
        'hello',  
        value !== '' ? value : 'World'
    ]

    return <nav className='top-nav'>
        <RelativeLink href='/' className='home-link'>
            <div className='icon-container'>
                <FeatherSVG/>
            </div>
            <span  className='title-2'>Paon</span>
        </RelativeLink>
        
        <div className='hello-link-container'>
            <label htmlFor='name-input'>Let's say hello to ...</label>
            <div className="input-container">
                <input value={value} onChange={handleChange} placeholder="Name" id='name-input' autoComplete="off"/>
                <RelativeLink 
                    href={ helloUrl }
                    className="paon-primary-btn"
                >🡒</RelativeLink>
            </div>
        </div>
    </nav>
}

export default NavBar