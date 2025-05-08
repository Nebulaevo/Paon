import React from "react"
import { Link as WouterLink } from "wouter"

type LinkProps_T = React.ComponentProps<typeof WouterLink>

type extendedLinkProps_T = LinkProps_T & {
    draggable?: 'true' | 'false' | 'auto'
}

/** Wrapper over Wouter's Link component */
function Link(props: extendedLinkProps_T) {

    return <WouterLink 
        // defaults
        draggable='false' 
        // received props
        {...props} 
    />
}

export default Link