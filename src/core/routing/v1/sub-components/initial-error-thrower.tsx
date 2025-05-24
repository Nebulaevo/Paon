import { ErrorStatus, getInitialErrorStatus } from "@core:utils/error-status/v1/utils"

/** Sub-component responsible of detecting 
 * if an initial error was provided (as meta tag named "initial-error-status")
 * and if it exists throws it.
 * */
function InitialErrorThrower(props: {children: React.ReactNode}) {
    const initialErrorStatus = getInitialErrorStatus()
    if (initialErrorStatus) throw new ErrorStatus(initialErrorStatus)

    return props.children
}

export default InitialErrorThrower