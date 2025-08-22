import { isDict, isString, type Dict_T } from "sniffly"


/** Class indicating that a meta tag is handled by `MetaHat` */
const PAGE_HEAD_TAG_CLS = 'page-metadata-tag'

function queryMetaHatTags() {
    return document.querySelectorAll(`head .${PAGE_HEAD_TAG_CLS}`)
}

function removeTags(tags: Iterable<Element>) {
    for (const tag of tags) tag.remove()
}

function withMetaHatClass(className?: string) {
    return isString(className, {nonEmpty:true})
        ? className + ' ' + PAGE_HEAD_TAG_CLS
        : PAGE_HEAD_TAG_CLS
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
    withMetaHatClass,
    checkStringAttrs
}