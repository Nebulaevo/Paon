import { RelativeLink } from "@core:routing/v1/link"
import { useCallback, useState } from "react"

import FeatherSVG from '../../assets/icons/peacock-feather.svg?react'
import './style.scss'


function NavBar() {

    const [value, setValue] = useState('')

    const handleChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => setValue(ev.target.value), 
        []
    )

    const name = value 
        ? encodeURIComponent(value)
        : 'World'

    return <nav className='top-nav'>
        <RelativeLink href='/' className='home-link title-2'>
            <div className='icon-container'>
                <FeatherSVG/>
            </div>
            Paon
        </RelativeLink>
        
        <div className='hello-link-container'>
            <label htmlFor='name-input'>Let's say hello to ...</label>
            <div className="input-container">
                <input value={value} onChange={handleChange} placeholder="Name" id='name-input'/>
                <RelativeLink href={`/hello/${name}/`} className="paon-primary-btn">🡒</RelativeLink>
            </div>
        </div>
    </nav>
}

export default NavBar