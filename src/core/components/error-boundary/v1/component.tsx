import React from "react"

import {resetInitialErrorStatus} from "@core:utils/error-status/v1/utils"

import InitialErrorCatcher from './initial-error-catcher/component'

type errorFallbackComp_T = () => JSX.Element
type errorHandlingFunc_T = (error:unknown, errorInfo:React.ErrorInfo) => any

type ErrorBoundaryProps_T = {
    Fallback: errorFallbackComp_T,
    // function that will be called if an error is triggered and given the error details
    errorHandlingFunc?: errorHandlingFunc_T,
    children: React.ReactNode,
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps_T, {hasError: boolean}> {
    
    constructor(props: ErrorBoundaryProps_T) {
        super(props)
        this.state = {hasError: false}
    }
  
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.log('error')
        console.log(error)
        console.log('typeof error')
        console.log(typeof error)
        console.log('errorInfo')
        console.log(errorInfo)
        if (this.props.errorHandlingFunc) {
            this.props.errorHandlingFunc(error, errorInfo)
        }

        resetInitialErrorStatus()
    }
    
    render() {
        if (this.state.hasError) {
            const { Fallback } = this.props
            return <Fallback />
        }
        return <InitialErrorCatcher>
            { this.props.children }
        </InitialErrorCatcher>
    }
}

export default ErrorBoundary

export type { ErrorBoundaryProps_T }