import React from "react"

type errorHandlingFunc_T = ( error:Error, errorInfo:React.ErrorInfo ) => any

type ErrorBoundaryProps_T = {
    fallback: JSX.Element,
    children: React.ReactNode,
    // function that will be called if an error is triggered and given the error details
    errorHandlingFunc?: errorHandlingFunc_T,
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps_T, {hasError: boolean}> {
    
    constructor( props: ErrorBoundaryProps_T ) {
        super(props)
        this.state = { hasError: false }
    }
  
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        if ( this.props.errorHandlingFunc ) {
            this.props.errorHandlingFunc(error, errorInfo)
        }
    }
  
    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
    
        return this.props.children
    }
}

export default ErrorBoundary

export type {
    errorHandlingFunc_T
}