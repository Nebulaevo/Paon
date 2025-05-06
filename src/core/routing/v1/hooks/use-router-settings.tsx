import { createContext, use, useRef } from "react"
import type React from "react"
import type { Dict_T } from "sniffly"

import DefaultError from "@core:components/error-component-default/v1/component"
import type { ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"
import { LoadingStateProvider } from "@core:hooks/use-loading-state/v1/hook"

import type { PagePropsFetcher } from "../utils/page-props-fetcher"
import { usePageProps } from "./use-page-props"
import { buildErrorHandler } from "../utils/error-handling-func"



// page data
type pageAsyncLoadFunc_T = () => Promise<{
    default: React.ComponentType<Dict_T<any>>;
}>

type NonLazyReactComponent_T<T> = Exclude<
    React.ComponentType<T>, 
    React.LazyExoticComponent<React.ComponentType<T>>
>

type pageData_T = {
    path: string,
    propsFetcher?: PagePropsFetcher,
    Component: NonLazyReactComponent_T<Dict_T<any>>,
    importComponent?: undefined,
} | {
    path: string,
    propsFetcher?: PagePropsFetcher,
    Component?: undefined,
    importComponent: pageAsyncLoadFunc_T
}


type suspenseFallbackLoaderOpts_T = {
    deactivate: boolean,
}

type pagePreFetchLoaderOpts_T = {
    deactivate: boolean,
    timeoutMs: number,
}

// loader options
type loaderOptions_T = {
    Loader: React.ComponentType<{}>,
    suspenseFallbackLoaderOpts: suspenseFallbackLoaderOpts_T,
    pagePreFetchLoaderOpts: pagePreFetchLoaderOpts_T
}

type partialLoaderOptions_T = {
    Loader?: loaderOptions_T['Loader'],
    suspenseFallbackLoaderOpts?: Partial<loaderOptions_T['suspenseFallbackLoaderOpts']>,
    pagePreFetchLoaderOpts?: Partial<loaderOptions_T['pagePreFetchLoaderOpts']>
}

// error boundary options
type errorBoundaryOptions_T = Omit<ErrorBoundaryProps_T, 'children'>


type RouterSettings_T = {
    pages: pageData_T[],
    loaderOptions: loaderOptions_T,
    errorBoundaryOptions: errorBoundaryOptions_T
}

type RouterSettingsProviderProps_T = {
    children: React.ReactNode,
    pages: pageData_T[],
    loaderOptions?: partialLoaderOptions_T,
    errorBoundaryOptions?: errorBoundaryOptions_T
}


// 
function _getDefaultLoaderOptions(): loaderOptions_T {
    return {
        Loader: () => 'Loading', 
        suspenseFallbackLoaderOpts: {
            deactivate: false
        },
        pagePreFetchLoaderOpts: {
            deactivate: false,
            timeoutMs: 500, // 500 ms
        }
    }
}

function _formatLoaderOptions( partialOptions:RouterSettingsProviderProps_T['loaderOptions'] ): loaderOptions_T {
    const defaultOptions = _getDefaultLoaderOptions()
    
    const Loader = partialOptions?.Loader ?? defaultOptions.Loader
    const suspenseFallbackLoaderOpts = {
        ...defaultOptions.suspenseFallbackLoaderOpts, 
        ...partialOptions?.suspenseFallbackLoaderOpts
    }
    const pagePreFetchLoaderOpts = {
        ...defaultOptions.pagePreFetchLoaderOpts, 
        ...partialOptions?.pagePreFetchLoaderOpts
    }
    
    return {
        Loader, 
        suspenseFallbackLoaderOpts, 
        pagePreFetchLoaderOpts
    }
}


function _getDefaultErrorBoundaryOptions(): errorBoundaryOptions_T {
    return { Fallback: DefaultError }
}

function _formatErrorBoundaryOptions(partialOptions:RouterSettingsProviderProps_T['errorBoundaryOptions']): errorBoundaryOptions_T {
    const defaultOptions = _getDefaultErrorBoundaryOptions()
    return {... defaultOptions, ...partialOptions}
}


/** React context holding the settings of the application's Router
 * 
 * (settings are encapsulated in a ref because they are not supposed to change
 * or trigger re-renders)
 */
const RouterSettingsContext = createContext<React.RefObject<RouterSettings_T>>({ current: {
    pages: [],
    loaderOptions: _getDefaultLoaderOptions(),
    errorBoundaryOptions: _getDefaultErrorBoundaryOptions()
}})

function useRouterSettings() {
    const { pages, loaderOptions, errorBoundaryOptions } = use(RouterSettingsContext).current
    return { pages, loaderOptions, errorBoundaryOptions }
}

/** Provides router settings (pages declared, loader settings, error boundary settings)
 * 
 * @param props.pages
 * 
 * @param props.loaderOptions (optional)
 * 
 * @param props.errorBoundaryOptions (optional)
 * 
 * @param props.children react nodes children
 */
function RouterSettingsProvider(props: RouterSettingsProviderProps_T) {
    
    const {children, pages} = props
    const loaderOptions = _formatLoaderOptions( props.loaderOptions )
    const errorBoundaryOptions = _formatErrorBoundaryOptions( props.errorBoundaryOptions )

    const { silentlyResetPageProps } = usePageProps()
        
    // inserting common error handling behaviour 
    // before custom error handling function
    errorBoundaryOptions.errorHandlingFunc = buildErrorHandler({
        errorHandlingFunc: errorBoundaryOptions.errorHandlingFunc, 
        pagePropsHookResetHandler: silentlyResetPageProps
    })

    const ref = useRef<RouterSettings_T>(
        {pages, loaderOptions, errorBoundaryOptions}
    )

    return <RouterSettingsContext value={ref} >
        <LoadingStateProvider Loader={loaderOptions.Loader}>
            { children }
        </LoadingStateProvider>
    </RouterSettingsContext>
}

export {
    useRouterSettings,
    RouterSettingsProvider
}

export type { 
    pageData_T,
    loaderOptions_T,
    errorBoundaryOptions_T,
    RouterSettings_T, 
    RouterSettingsProviderProps_T 
}
