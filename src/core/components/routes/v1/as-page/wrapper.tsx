import { Suspense, type ComponentType } from "react"

import ErrorBoundary, { type ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"
import suspenseLoaderFactory, { type loaderOptions_T } from "@core:components/suspense-loader/v1/factory"


type errorBoundaryOptions_T = Omit<ErrorBoundaryProps_T, 'children'>


type asPageWrapperKwargs_T = {
    component: React.LazyExoticComponent<ComponentType>,
    loaderOptions?: Partial<loaderOptions_T>
    errorHandlingOptions?: errorBoundaryOptions_T,
}

function asPage({
        component, 
        loaderOptions, 
        errorHandlingOptions
    }: asPageWrapperKwargs_T 
){
    const Loading = suspenseLoaderFactory( loaderOptions )
    const Component = component
    
    if ( errorHandlingOptions ) {
        return function Page() {
            return <ErrorBoundary {...errorHandlingOptions}>
                <Suspense fallback={<Loading/>}><Component /></Suspense>
            </ErrorBoundary>
        }
    } else {
        return function Page() {
            return <Suspense fallback={<Loading/>}><Component /></Suspense>
        }
    }
}

export default asPage
export type { asPageWrapperKwargs_T }