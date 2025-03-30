import { Suspense, use, useEffect } from "react"

import { InitialPropsContext, canUseInitialPageProps } from "@core:hooks/use-intial-props/v1/context"
import ErrorBoundary, { type ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"
import suspenseLoaderFactory, { type loaderOptions_T } from "@core:components/suspense-loader/v1/factory"
import { Dict_T } from "sniffly"
import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import { getFilteredRelativeUrl } from '@core:utils/url-parsing/v1/utils'


// type react.lazy expects as load function
// type reactLazyLoadFunc = Parameters<typeof lazy>[0]

type errorBoundaryOptions_T = Omit<ErrorBoundaryProps_T, 'children'>

type propsFetcher_T = (url:string, abortController:AbortController) => Promise<unknown> | unknown

type pageData_T = {
    path: string,
    Component: React.LazyExoticComponent<React.ComponentType<any>>,
    propsFetcher?: propsFetcher_T
}

type asPageWrapperKwargs_T = {
    pageData: pageData_T
    loaderOptions?: Partial<loaderOptions_T>
    errorHandlingOptions?: errorBoundaryOptions_T,
}

type pageDataWithFetcher_T = Required<pageData_T>


function _pageDataDeclaresFetcher(pageData: pageData_T): pageData is pageDataWithFetcher_T {
    return !!pageData.propsFetcher
}

function _buildLazyAndFetchingPage( pageData: pageDataWithFetcher_T ) {
    
    // Lazy Component
    const Component = pageData.Component
    
    const abortController = new AbortController()

    // Lazy Fetcher
    let DATA_CACHE: any = undefined
    const fetchProps = ( initialProps:Dict_T<unknown> | undefined ) => {
        
        // attempt at using initial props if availble
        // (only first ever fetch of the whole application on client side)
        // - Remark
        // initial props should be consumed immidiatly because the tag
        // is deleted as soon as first rendering cycle ends (useEffect in <Routes>)
        if (canUseInitialPageProps()) {

            DATA_CACHE = initialProps
                ? Promise.resolve(initialProps)
                : undefined
        }

        // regular data fetching 
        if ( isExecutedOnClient() && DATA_CACHE === undefined ) {
            console.log('- fetching props -')
            DATA_CACHE = pageData.propsFetcher(
                getFilteredRelativeUrl(window.location.href, {ignoreHash:true}),
                abortController
            )
        }

        return DATA_CACHE
    }

    const WrappedComponent: React.FC = ( props: any ) => {

        useEffect(() => {
            return () => {
                // reseting data cache
                // (if there is caching logic it should be handled in the props fetcher)
                abortController.abort()
                DATA_CACHE = undefined
            }
        }, [])
        
        const initialProps = use(InitialPropsContext)
        
        // triggering suspense boundary for fetching data
        const data = use(fetchProps(initialProps))
        
        return <Component {... props} data={data} />
    }

    return WrappedComponent
}

function asPage({
        pageData,
        loaderOptions, 
        errorHandlingOptions
    }: asPageWrapperKwargs_T 
){
    const Loading = suspenseLoaderFactory( loaderOptions )
    const Component = _pageDataDeclaresFetcher(pageData)
        ? _buildLazyAndFetchingPage(pageData)
        : pageData.Component

    
    if ( errorHandlingOptions ) {
        return function Page() {
            // const [search] = useSearch()
            return <ErrorBoundary {...errorHandlingOptions}>
                <Suspense fallback={<Loading/>}><Component /></Suspense>
            </ErrorBoundary>
        }
    } else {
        return function Page() {
            // const [search] = useSearch()
            return <Suspense fallback={<Loading/>}><Component /></Suspense>
        }
    }
}

export default asPage
export type { asPageWrapperKwargs_T }