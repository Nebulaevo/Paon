import React, { useMemo, AnchorHTMLAttributes } from "react"
import { useLocation, Link as WouterLink } from "wouter"

import { 
    isAbsoluveUrl,
    RelativeURL, 
    AbsoluteURL, 
    type EnhancedURL_T 
} from "@core:utils/url/v1/utils"

type linkTypes_T = 'RELATIVE' | 'ABSOLUTE' | 'AUTO'

type LinkProps_T = AnchorHTMLAttributes<HTMLAnchorElement> & {
    linkType?: linkTypes_T,
    children: React.ReactNode,
}

const LINK_CLASSES = {
    NONE: '',
    BROKEN: 'link-broken',
    MATCH: 'link-active',
    PARTIAL_MATCH: 'link-partial-match'
} as const

/** Builds a custom enhanced URL object from the given URL */
function _toEnhancedUrl(url:string | undefined, linkType: 'ABSOLUTE'): AbsoluteURL | undefined
function _toEnhancedUrl(url:string | undefined, linkType: 'RELATIVE'): RelativeURL | undefined
function _toEnhancedUrl(url:string | undefined, linkType: 'AUTO' | linkTypes_T): EnhancedURL_T | undefined
function _toEnhancedUrl(url:string | undefined, linkType: linkTypes_T): EnhancedURL_T | undefined {
    if (!url || url.length===0) return undefined
    
    if (linkType==="AUTO") {
        linkType = isAbsoluveUrl(url) ? 'ABSOLUTE' : 'RELATIVE'
    }
    const EnhancedUrlClass = linkType == 'ABSOLUTE' ? AbsoluteURL : RelativeURL

    return EnhancedUrlClass.parse(
        url, undefined, {onPurifyFail:'ERROR'}
    ) ?? undefined
}

function _getRelativeLinkStatusClass(linkUrlObj?:RelativeURL, currentUrlObj?:RelativeURL): string {
    const {NONE, MATCH, PARTIAL_MATCH, BROKEN} = LINK_CLASSES

    if (!linkUrlObj) return BROKEN
    
    if (currentUrlObj) {
        const linkPathname = linkUrlObj.pathname
        const currentPathname = currentUrlObj.pathname

        if (currentPathname===linkPathname) return MATCH
        else if (currentPathname.startsWith(linkPathname)) return PARTIAL_MATCH
    }

    return NONE
}

/** Wrapper around Wouter's Link component:
 * - adding url purification (returns a `<span>` with class **link-broken** if url couldn't be parsed)
 * */
function Link(props: LinkProps_T) {
    
    const { 
        linkType='AUTO', 
        children,
        href, 
        className='',
        ...htmlAnchorAttributes 
    } = props

    const url = useMemo(
        () => _toEnhancedUrl(href, linkType),
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
 * - adding url purification (returns a `<span>` with class **link-broken** if url couldn't be parsed)
 * - forcing relative url
 * - adding classes **link-active** or **link-partial-match** if the link url matches the current location.
 */
function RelativeLink(props: Omit<LinkProps_T, 'linkType'>) {
    const { 
        href, 
        className='', 
        children,
        ...htmlAnchorAttributes 
    } = props

    const [ location ] = useLocation()
    const currentUrl = _toEnhancedUrl(location, 'RELATIVE')
    const url = useMemo(
        () => _toEnhancedUrl(href, 'RELATIVE'),
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