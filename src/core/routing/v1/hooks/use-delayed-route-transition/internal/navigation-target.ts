import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import type { RelativeURL } from "@core:utils/url/v1/utils"

/** 🔧 BUG FIX: 
 * Taking into account active navigation target into navigation handling.
 * Storing the 'nagivation target' url allows us to:
 * - prevent multiple navigation promises to be queued up (only last one is active)
 * - prevent overriden navigation requests to perform certain actions
 * - prevent multiple navigation requests with the same target to be initiated
 */
let NAVIGATION_TARGET: {target?: string}= {target:undefined}

/** Saves the url of the current navigation target */
function set(targetUrl:RelativeURL) {
    if (isExecutedOnClient()) {
        NAVIGATION_TARGET.target = targetUrl.asId({includeHash:true})
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
function is(targetUrl:RelativeURL) {
    if (!exists()) return false
    return NAVIGATION_TARGET.target === targetUrl.asId({includeHash:true})
}

/** Module allowing to keep track of the active navigation target */
export default { set, reset, exists, is }