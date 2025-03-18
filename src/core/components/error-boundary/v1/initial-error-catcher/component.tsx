import {
    ErrorStatus, 
    getInitialErrorStatus
} from "@core:utils/error-status/v1/utils"


function InitialErrorCatcher({children}: {children: React.ReactNode}) {

    const initialErrorStatus = getInitialErrorStatus()
    if (initialErrorStatus) {
        throw new ErrorStatus(initialErrorStatus)
    }

    return <>{children}</>
}

export default InitialErrorCatcher