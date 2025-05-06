import React from "react"
import { Link as WouterLink } from "wouter"

import { getRelativeUrl } from "@core:utils/url-parsing/v1/utils"


type LinkProps_T = React.ComponentProps<typeof WouterLink>

type extendedLinkProps_T = LinkProps_T & {
    draggable?: 'true' | 'false' | 'auto'
}

function Link(props: extendedLinkProps_T) {
    const {href, to, onClick} = props
    const targetHref = getRelativeUrl( href ?? to )

    // click handler
    // preventing history double entries
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        const currentLocation = getRelativeUrl(window.location.href)
        if (currentLocation === targetHref) {
            event.preventDefault() // Prevent unnecessary history entry
            return
        }
        onClick?.(event) // Call the original onClick if provided
    }

    return <WouterLink 
        // defaults
        draggable='false' 
        // received props
        {...props} 
        // overriden onclick
        onClick={handleClick} 
    />
}

export default Link