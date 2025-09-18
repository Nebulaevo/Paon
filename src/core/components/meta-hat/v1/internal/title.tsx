import { useEffect, useMemo } from 'react'
import { isString } from 'sniffly'

import { getUniqueIdGenerator } from '@core:utils/id/v1/utils'

import { PAGE_HEAD_TAG_CLS, removeTags } from './helpers'


type titleSpecs_T = {
    tagType: 'TITLE',
    content: string
}

/** class given to a title who's component has been unmounted 
 * 
 * (only meant to stay in the document until another <Title> is rendered)
*/
const HANGING_TITLE_CLASS = 'hanging-title-tag'

/** utils to generate unique ids */
const UNIQUE_ID = getUniqueIdGenerator()

function _isLastTitle() {
    const titleTags = document.getElementsByTagName('title')
    return titleTags.length <= 1
}

/** Creates a title tag with the given content, 
 * adding it classes indicating that it's handled by MetaHat 
 * as well as a class linking it to its title component 
*/
function _createTitleTag(content: string, id: string) {
    const titleTag = document.createElement('title')
    titleTag.textContent = content
    titleTag.classList.add(PAGE_HEAD_TAG_CLS, id)

    // we use "prepend" so that the last title set is the active one
    // (first encountered title is used by the browser)
    document.head.prepend(titleTag)
}

/** Removes the title tag linked to that component id */
function _removeTitleTag(id: string) {
    const selectedTitle = document.querySelector(
        `head title.${PAGE_HEAD_TAG_CLS}.${id}`
    )
    selectedTitle 
        ? removeTags([selectedTitle])
        : undefined // do nothing
}

/** Marks the title tag linked to that component id as "hanging"
 * (only meant to stay in the document until another <Title> is rendered)
 */
function _markTagAsHanging(id: string) {
    const selectedTitle = document.querySelector(
        `head title.${PAGE_HEAD_TAG_CLS}.${id}`
    )
    selectedTitle?.classList.add(HANGING_TITLE_CLASS)
}

/** Clears all eventual title tags marked as "hanging" */
function _removeHangingTiles() {
    const hangingTitles = document.querySelectorAll(
        `head title.${PAGE_HEAD_TAG_CLS}.${HANGING_TITLE_CLASS}`
    )
    removeTags(hangingTitles)
}

/** Custom Hook taking care of creating and deleting the title tags in the document's head */
function _useHangingTitle(content: string) {

    const [validatedContent, id] = useMemo(() => {
        const validatedContent = isString(content) ? content : ''
        const id = 'title-' + UNIQUE_ID.get()
        return [validatedContent, id]
    }, [content])

    useEffect(() => {
        // On mount or on new content value :
        // we remove hanging titles 
        _removeHangingTiles()

        // and create a title tag linked to this component
        _createTitleTag(validatedContent, id)

        return () => {
            // On unmount or on content changed :
            if (_isLastTitle()) {
                // if there is only one title left
                // we mark the title tag currently 
                // linked to the component as "hanging"
                _markTagAsHanging(id)

            } else {
                // if there are multiple titles left
                // we simply remove the tag currently 
                // linked to the component
                _removeTitleTag(id)
            }
            
            // we unregister the id from the existing ids
            UNIQUE_ID.unregister(id)
        }
    }, [content])
}

/** Components for handling title tag manually
 * 
 * (to prevent pages from having no titles during page transitions on client)
*/
const Title = {
    /** For the server side rendering: returns a title tag 
     *
     * (on the server we do not need to have "hanging" titles 
     * so we go for the simplest option)
     * 
     * @param props.tagType "TITLE"
     * 
     * @param props.content (string) page's title    
    */
    Rendered: (props: titleSpecs_T) => {
        const content = isString(props.content) ? props.content : ''
        return <title className={PAGE_HEAD_TAG_CLS}>
            { content }
        </title>
    },

    /** For the client side: uses a custom side effect to manually hoist the title in the head
     * 
     * This allows to persist title tags until a new one is rendered, 
     * avoiding the "*no title*" state that just displays the current url as title.
     * (for example before, during a page load, while in between pages, 
     * the displayed title was the current url)
     * 
     * @param props.tagType "TITLE"
     * 
     * @param props.content (string) page's title    
    */
    Hoisted: (props: titleSpecs_T) => {
        _useHangingTitle(props.content)
        return null
    }
}

export default Title
export type { titleSpecs_T }