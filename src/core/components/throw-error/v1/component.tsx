import { isExecutedOnClient, isExecutedOnServer } from "@core:utils/execution-context/v1/util"

type ThrowErrorProps_T = {
    error: unknown,
    clientOnly?: boolean,
    serverOnly?: boolean
}

/** Component in charge of throwing an exception on render 
 * (error can be thrown only on client, server, or both)
*/
function ThrowError( props: ThrowErrorProps_T ): any {

    const { error, clientOnly, serverOnly } = props

    if (
        (clientOnly && isExecutedOnServer())
        || (serverOnly && isExecutedOnClient()) 
    ) {
        return <></>
    }
    
    throw error
}

export default ThrowError