import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import secureJson from 'secure-json-parse'
import {isDict, type Dict_T } from "sniffly"


import { isExecutedOnClient } from "@core:utils/execution-context/util"

const JSON_ERROR_PROPS_ID = "error-state-props" as const


function getInitialErrorStateProps(): Dict_T<unknown> | undefined {
    let errorProps: unknown

    // check if we are currently on the client
    if (!isExecutedOnClient()) {
        return undefined
    }

    // look for json error props data
    const tag = document.getElementById(JSON_ERROR_PROPS_ID)
    if (tag) {
        errorProps = tag.textContent 
            ? secureJson.parse( tag.textContent, {protoAction:'remove', constructorAction:'remove'} )
            : {}

        // we delete the element
        // (it's supposed to be one time use and not be triggered for next page load)
        tag.remove()
    }

    return isDict(errorProps) ? errorProps : undefined
}

export default getInitialErrorStateProps

/** Checks if there is a json tag with id "error-state-props" in the document
 * (that would indicate that the current page is an error page)
 */
// function useInitialErrorStateProps(): Dict_T<unknown> | undefined {
//     let errorProps: unknown

//     const [errorStateProps, setErrorStateProps ] = useState<Dict_T<unknown> | undefined>({})
//     const [location, _] = useLocation()
//     const prevLocation = useRef(location)

//     useEffect(() => {
//         if (isExecutedOnClient() && errorStateProps && location !== prevLocation.current) {
//             setErrorStateProps(undefined)
//         }
//     }, [location])

//     return errorStateProps

//     // // check if we are currently on the client
//     // if (!isExecutedOnClient()) {
//     //     return undefined
//     // }

    

//     // // look for json error props data
//     // const tag = document.getElementById(JSON_ERROR_PROPS_ID)
//     // if (tag) {
//     //     errorProps = tag.textContent 
//     //         ? secureJson.parse( tag.textContent, {protoAction:'remove', constructorAction:'remove'} )
//     //         : {}
        
//     //     // we delete the element
//     //     // (it's supposed to be one time use and not be triggered for next page load)
//     //     tag.remove()
//     // }

//     // // return result or undefined
//     // return isDict(errorProps) ? errorProps : undefined
// }

// export default useInitialErrorStateProps