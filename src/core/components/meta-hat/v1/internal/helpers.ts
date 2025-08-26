import { isDict, type Dict_T } from "sniffly"


/** Class indicating that a meta tag is handled by `MetaHat` */
const PAGE_HEAD_TAG_CLS = 'page-metadata-tag'

/** Returns all the tags found in the document head handled by `MetaHat` */
function queryMetaHatTags() {
    return document.querySelectorAll(`head .${PAGE_HEAD_TAG_CLS}`)
}

/** Removes all given tags from the document */
function removeTags(tags: Iterable<Element>) {
    for (const tag of tags) tag.remove()
}

/** Returns true if the object contains only allowed keys and all values are strings */
function checkStringAttrs( attrs:Dict_T<unknown>, allowedKeys: string[] ) {

    // checks that all values are strings
    if (!isDict(attrs, {itemType: 'string'})) return false

    // checks that only allowed attributes are defined
    const keys = Object.keys(attrs)
    for (const key of keys) {
        if (!allowedKeys.includes(key)) return false
    }

    return true
}

export {
    PAGE_HEAD_TAG_CLS,
    queryMetaHatTags,
    removeTags,
    checkStringAttrs
}