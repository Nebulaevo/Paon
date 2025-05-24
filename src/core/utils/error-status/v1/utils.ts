
import {isExecutedOnClient} from "@core:utils/execution-context/v1/util"
import { isString } from "sniffly"

const INITIAL_ERROR_STATUS_META = "initial-error-status"

/** Custom Error class - meant to represent generic error "codes" 
 * (including http status errors) which we can react to in the error fallback component
*/
class ErrorStatus extends Error {

    // custom statuses
    static DEFAULT = 'DEFAULT' as const
    static UNSAFE = 'UNSAFE' as const
    static TYPE_ERROR = 'TYPE_ERROR' as const
    static OPERATION_FAILED = 'OPERATION_FAILED' as const

    status: string

    constructor( status?:string ) {
        status = isString(status, {nonEmpty: true})
            ? status
            : ErrorStatus.DEFAULT
        
        super(`Error Status: ${status}`)
        this.status = status
    }
}

/** Returns html meta tag containing initial error status if it exists */
function _getInitialErrorMetaTag() {
    return isExecutedOnClient()
        ? document.querySelector<HTMLMetaElement>(`meta[name="${INITIAL_ERROR_STATUS_META}"]`)
        : undefined
}

/** Returns the initial error status if it was included in the document */
function getInitialErrorStatus() {
    const metaTag = _getInitialErrorMetaTag()
    return metaTag?.content ?? undefined
}

/** Removes the initial error status tag if it finds it in the document */
function resetInitialErrorStatus() {
    const metaTag = _getInitialErrorMetaTag()
    metaTag?.remove()
}

export {
    ErrorStatus,
    getInitialErrorStatus,
    resetInitialErrorStatus
}