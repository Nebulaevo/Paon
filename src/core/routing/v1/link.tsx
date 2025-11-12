import React, { useMemo, AnchorHTMLAttributes } from "react"
import { useLocation, Link as WouterLink } from "wouter"
import { XUrl, RelativeUrl, type ExtendedUrl_T } from "url-toolbox"
import { isString } from "sniffly"


type linkTypes_T = 'RELATIVE' | 'ABSOLUTE' | 'AUTO'

type HtmlAnchorAttributes_T = AnchorHTMLAttributes<HTMLAnchorElement>

const LINK_CLASSES = {
    NONE: '',
    BROKEN: 'link-broken',
    MATCH: 'link-active',
    PARTIAL_MATCH: 'link-partial-match'
} as const

/** Builds a custom extended URL object from the given URL */
function _toExtendedUrl(url: string | URL , linkType: 'ABSOLUTE'): XUrl | undefined
function _toExtendedUrl(url: string | URL, linkType: 'RELATIVE'): RelativeUrl | undefined
function _toExtendedUrl(url: string | URL, linkType: 'AUTO' | linkTypes_T): ExtendedUrl_T | undefined
function _toExtendedUrl(url: string | URL, linkType: linkTypes_T): ExtendedUrl_T | undefined {
    
    if (isString(url) && url.trim()==='') return undefined
    
    if (linkType==="AUTO") {
        linkType = URL.canParse(url) ? 'ABSOLUTE' : 'RELATIVE'
    }

    if (linkType==="ABSOLUTE") {
        if (url instanceof XUrl) return url
        return XUrl.parse(url) ?? undefined

    } else { // "RELATIVE"
        if (url instanceof RelativeUrl) return url
        return RelativeUrl.parse(url) ?? undefined
    }
}

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

/** Wrapper around Wouter's Link component 
 * 
 * 🛠️ internally, provided href is converted to a `XUrl` or a `RelativeUrl` instance.
*/
function Link(
    props: Omit<HtmlAnchorAttributes_T, 'href'> & {
        href: string | URL | ExtendedUrl_T,
        linkType?: linkTypes_T,
        children: React.ReactNode,
    }
) {
    
    const { 
        linkType='AUTO', 
        children,
        href, 
        className='',
        ...htmlAnchorAttributes 
    } = props
    
    const url = useMemo(
        () => _toExtendedUrl(href, linkType),
        [href, linkType]
    )
    
    if (!url) {
        const derivedClassName = `${LINK_CLASSES.BROKEN} ${className}`.trim()
        return <span 
            className={derivedClassName}
            id={htmlAnchorAttributes.id}
        >{ children }</span>
    }

    return <WouterLink 
        // defaults
        draggable={false}

        // received props
        href={url.href}
        className={className}
        {...htmlAnchorAttributes}
    >{children}</WouterLink>
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
        href: string | URL | ExtendedUrl_T,
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
    const url = useMemo(
        () => _toExtendedUrl(href, 'RELATIVE'),
        [href]
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

export {
    Link,
    RelativeLink
}