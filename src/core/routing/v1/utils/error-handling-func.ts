import type React from 'react'

import type { ErrorBoundaryProps_T} from "@core:components/error-boundary/v1/component"
import { resetInitialErrorStatus } from "@core:utils/error-status/v1/utils"

type errorHanderBuilderKwargs_T = {
    errorHandlingFunc: ErrorBoundaryProps_T['errorHandlingFunc'],
    pagePropsHookResetHandler: () => void
}

/** Function generating an error handling callback 
 * to give to an ErrorBoundary surrounding a Page component
 * 
 * it includes default error handling behaviour before calling
 * the optionnal "errorHandlingFunc" provided
 * 
 * **WARNING**: if memoised, function should be re-computed if related hooks change
 * (pagePropsHookResetHandler)
 */
function buildErrorHandler(kwargs: errorHanderBuilderKwargs_T) {
    const { 
        errorHandlingFunc, 
        pagePropsHookResetHandler
    } = kwargs
    
    const errorHandler = (error:unknown, errorInfo:React.ErrorInfo) => {
        
        // remove 'initial error' tag if exists
        resetInitialErrorStatus()

        // remove current page props 
        pagePropsHookResetHandler()
        
        // execute whatever custom error handling code provided
        if (errorHandlingFunc) errorHandlingFunc(error, errorInfo)
    }

    return errorHandler
}

export { buildErrorHandler }