import React, {JSX} from "react"

import DefaultErrorFallback from './internal/default-error-fallback'

type ErrorFallbackComp_T = (props?:{ error:unknown }) => JSX.Element
type errorHandlingFunc_T = (error:unknown, errorInfo:React.ErrorInfo) => any

type ErrorBoundaryProps_T = {
    Fallback: ErrorFallbackComp_T,
    // function that will be called if an error is triggered and given the error details
    errorHandlingFunc?: errorHandlingFunc_T,
    children: React.ReactNode,
}

/** Classic error boundary class with:
 * - optional error handling handler (props.errorHandlingFunc) 
 * - custom error fallback page (props.Fallback)
 * */
class ErrorBoundary extends React.Component<ErrorBoundaryProps_T, {hasError: boolean, error: unknown}> {
    
    constructor(props: ErrorBoundaryProps_T) {
        super(props)
        this.state = {hasError: false, error: undefined}
    }
  
    static getDerivedStateFromError() {
        console.log('getDerivedStateFromError')
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: undefined }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.log('componentDidCatch')
        if (this.props.errorHandlingFunc) {
            this.props.errorHandlingFunc(error, errorInfo)
        }

        this.setState({error})
    }
    
    render() {
        if (this.state.hasError) {
            const { Fallback } = this.props
            return <Fallback error={this.state.error}/>
        }
        return this.props.children
        // <InitialErrorCatcher>
        //     { this.props.children }
        // </InitialErrorCatcher>
    }
}

export default ErrorBoundary

export {
    ErrorBoundary,
    DefaultErrorFallback
}

export type { 
    ErrorBoundaryProps_T, 

    ErrorFallbackComp_T
}