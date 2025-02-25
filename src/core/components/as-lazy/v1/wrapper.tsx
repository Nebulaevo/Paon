import { Suspense } from "react"

import ErrorBoundary, { type ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"
import getSuspenseLoaderComp, { type loaderOptions_T } from "./get-suspense-loader-comp"


type errorBoundaryOptions_T = Omit<ErrorBoundaryProps_T, 'children'>


type asLazyWrapperKwargs_T = {
    Component: React.LazyExoticComponent<(props: any) => JSX.Element>,
    loaderOptions?: Partial<loaderOptions_T>
    withErrorBoundary?: boolean,
    errorHandlingOptions?: Partial<errorBoundaryOptions_T>,
}

function asLazy({
        Component, 
        loaderOptions, 
        errorHandlingOptions, 
        withErrorBoundary = true
    }: asLazyWrapperKwargs_T 
){

    const Loading = getSuspenseLoaderComp( loaderOptions )
    
    if (withErrorBoundary) {
        return function LazyCompWithErrorBoundary() {
            return <ErrorBoundary {...errorHandlingOptions}>
                <Suspense fallback={<Loading/>}><Component /></Suspense>
            </ErrorBoundary>
        }
    } else {
        return function LazyComp() {
            return <Suspense fallback={<Loading/>}><Component /></Suspense>
        }
    }
}

export default asLazy