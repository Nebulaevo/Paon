import { useEffect } from 'react'
import { isString } from 'sniffly'

import { getUniqueSeqId } from '@core:utils/id/v1/utils'

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

function _isLastTitle() {
    const titleTags = document.getElementsByTagName('title')
    return titleTags.length <= 1
}

/** Creates a title tag with the given content, 
 * adding it classes indicating that it's handled by MetaHat 
 * as well as an id linking it to its title component 
*/
function _createTitleTag(content: string, id: string) {
    const titleTag = document.createElement('title')
    titleTag.classList.add(PAGE_HEAD_TAG_CLS)
    titleTag.setAttribute('id', id)
    titleTag.textContent = content

    // we use "prepend" so that the last title set is the active one
    // (first encountered title is used by the browser)
    document.head.prepend(titleTag)
}

/** Removes the title tag linked to that component id */
function _removeTitleTag(id: string) {
    const selectedTitle = document.getElementById(id)
    selectedTitle?.remove()
}

/** Marks the title tag linked to that component id as "hanging"
 * (only meant to stay in the document until another <Title> is rendered)
 */
function _markTagAsHanging(id: string) {
    const selectedTitle = document.getElementById(id)
    if (selectedTitle) {
        selectedTitle.classList.add(HANGING_TITLE_CLASS)

        // we remove the id linking it to 
        // a MetaHat component instance
        // (as that id will be unregistered)
        selectedTitle.removeAttribute('id')
    }
}

/** Clears all eventual title tags marked as "hanging" */
function _removeHangingTitles() {
    const hangingTitles = document.querySelectorAll(
        `head title.${PAGE_HEAD_TAG_CLS}.${HANGING_TITLE_CLASS}`
    )
    removeTags(hangingTitles)
}

/** Custom Hook taking care of creating and deleting the title tags in the document's head 
 * 
 * ℹ️ Makes sure not to delete the last title tag before another one is rendered.
 * (last title is marked as "hanging" until another one is rendered)
*/
function _useHangingTitle(content: string) {

    useEffect(() => {
        // On mount or on new content value :
        // we remove hanging titles 
        _removeHangingTitles()

        // Then we create a new title tag with a 
        // unique id linking it to this hook callback
        const id = getUniqueSeqId()
        const validatedContent = isString(content) ? content : ''
        _createTitleTag(validatedContent, id)

        return () => {
            // On unmount or on content changed :
            if (_isLastTitle()) {
                // if there is only one title left
                // we mark the title tag currently 
                // linked to the current hook callback 
                // as "hanging"
                _markTagAsHanging(id)

            } else {
                // if there are multiple titles left
                // we simply remove the tag currently 
                // linked to the current hook callback 
                _removeTitleTag(id)
            }
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