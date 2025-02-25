import React from "react"

type errorFallbackComp_T = () => JSX.Element
type errorHandlingFunc_T = ( error:Error, errorInfo:React.ErrorInfo ) => any

type ErrorBoundaryProps_T = {
    FallbackComp?: errorFallbackComp_T,
    // function that will be called if an error is triggered and given the error details
    errorHandlingFunc?: errorHandlingFunc_T,
    children: React.ReactNode,
}

function _defaultFallbackComp () {
    return <p>Oops.. Something went wrong</p>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps_T, {hasError: boolean}> {
    
    constructor(props: ErrorBoundaryProps_T) {
        super(props)
        this.state = {hasError: false}
    }

    _getFallbackComp(): errorFallbackComp_T {
        return this.props.FallbackComp ?? _defaultFallbackComp
    }
  
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        if (this.props.errorHandlingFunc) {
            this.props.errorHandlingFunc(error, errorInfo)
        }
    }
    
    render() {
        if (this.state.hasError) {
            const Fallback = this._getFallbackComp()
            return <Fallback />
        }
    
        return this.props.children
    }
}

export default ErrorBoundary

export type { ErrorBoundaryProps_T }