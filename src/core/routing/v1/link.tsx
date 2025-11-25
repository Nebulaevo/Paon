import React, { useMemo, AnchorHTMLAttributes } from "react"
import { useLocation, Link as WouterLink } from "wouter"
import { RelativeUrl, type ExtendedUrl_T } from "url-toolbox"


type HtmlAnchorAttributes_T = AnchorHTMLAttributes<HTMLAnchorElement>

const LINK_CLASSES = {
    NONE: '',
    BROKEN: 'link-broken',
    MATCH: 'link-active',
    PARTIAL_MATCH: 'link-partial-match'
} as const


function _getRelativeLinkStatusClass(linkUrl?:RelativeUrl, currentUrl?:RelativeUrl): string {
    const {NONE, MATCH, PARTIAL_MATCH, BROKEN} = LINK_CLASSES

    if (!linkUrl) return BROKEN
    
    if (currentUrl) {
        const linkPathname = linkUrl.as.normalisedPathname
        const currentPathname = currentUrl.as.normalisedPathname

        if (currentPathname===linkPathname) return MATCH
        else if (currentPathname.startsWith(linkPathname)) return PARTIAL_MATCH
    }

    return NONE
}

/** Wrapper around Wouter's Link component for internal links:
 * - forcing relative url
 * - adding classes **link-active** or **link-partial-match** if the link url matches the current location.
 * - if url is invalid, returns a span with class **link-broken**
 * 
 * 🛠️ internally, provided href is converted to a `RelativeUrl` instance
 */
function RelativeLink(
    props: Omit<HtmlAnchorAttributes_T, 'href'> & {
        href?: string | URL | ExtendedUrl_T,
        children: React.ReactNode,
    }
) {
    const {
        href, 
        className='', 
        children,
        ...htmlAnchorAttributes 
    } = props

    const [ location ] = useLocation()
    const currentUrl = RelativeUrl.parse(location) ?? undefined
    const url = useMemo<RelativeUrl | undefined>(
        () => RelativeUrl.parse(href) ?? undefined, 
        [ href ] 
    )
    
    const linkStatusClass = _getRelativeLinkStatusClass(url, currentUrl)
    const derivedClassName = `${linkStatusClass} ${className}`.trim()

    if (!url) return <span 
        className={derivedClassName} 
        id={htmlAnchorAttributes.id}
    >{ children }</span>

    return <WouterLink 
        // defaults
        draggable={false}

        // received props
        href={url.href}
        className={derivedClassName}
        {...htmlAnchorAttributes}
    >{children}</WouterLink>
}

export { RelativeLink }