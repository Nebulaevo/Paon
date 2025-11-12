import type { RelativeUrl } from "url-toolbox"

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"


/** 🔧 BUG FIX: 
 * Taking into account active navigation target into navigation handling.
 * Storing the 'nagivation target' url allows us to:
 * - prevent multiple navigation promises to be queued up (only last one is active)
 * - prevent overriden navigation requests to perform certain actions
 * - prevent multiple navigation requests with the same target to be initiated
 */
const NAVIGATION_TARGET: {target?: string}= {target:undefined}

/** Returns a normalised representation of the url */
function _toTargetId(targetUrl: RelativeUrl) {
    return targetUrl.as.normalised()
}

/** Saves the url of the current navigation target */
function set(targetUrl: RelativeUrl) {
    if (isExecutedOnClient()) {
        const targetId =  _toTargetId(targetUrl)
        NAVIGATION_TARGET.target = targetId
    }
}

/** Erases the current navigation target */
function reset() {
    NAVIGATION_TARGET.target = undefined
}

/** Returns true if a navigation target exists */
function exists() {
    return NAVIGATION_TARGET.target !== undefined
}

/** Returns true if the given url is the same as current target */
function is(targetUrl: RelativeUrl) {
    if (!exists()) return false
    return NAVIGATION_TARGET.target === _toTargetId(targetUrl)
}

/** Module allowing to keep track of the active navigation target */
export default { set, reset, exists, is }