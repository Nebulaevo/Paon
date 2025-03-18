
import {isExecutedOnClient} from "@core:utils/execution-context/v1/util"

const INITIAL_ERROR_STATUS_META = "initial-error-status" as const


class ErrorStatus extends Error {
    status: string

    constructor( status:string ) {
        super(status)
        this.status = status
    }
}

function _getInitialErrorMetaTag() {
    return isExecutedOnClient()
        ? document.querySelector<HTMLMetaElement>(`meta[name="${INITIAL_ERROR_STATUS_META}"]`)
        : undefined
}

function getInitialErrorStatus() {
    const metaTag = _getInitialErrorMetaTag()
    return metaTag?.content ?? undefined
}

function resetInitialErrorStatus() {
    const metaTag = _getInitialErrorMetaTag()
    metaTag?.remove()
}

export {
    ErrorStatus,
    getInitialErrorStatus,
    resetInitialErrorStatus
}