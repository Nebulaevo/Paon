import { createContext, use, useRef } from "react"
import type React from "react"
import type { Dict_T } from "sniffly"

import type { RelativeURL } from "@core:utils/url/v1/utils"
import { DefaultErrorFallback, type ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"
import { LoadingStateProvider } from "@core:hooks/use-loading-state/v1/hook"

import { usePageProps } from "./use-page-props"
import { buildErrorHandler } from "../utils/error-handling-func"


/** Async function returning a call to "import(...)" */
type pageAsyncLoadFunc_T = () => Promise<{
    default: React.ComponentType<Dict_T<any>>;
}>

type pagePropsGetterFunc_T = (currentUrl: RelativeURL, abortController: AbortController) => Promise<Dict_T<unknown>>

/** Dictionary used to set up a route */
type pageData_T = {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
    Component: React.ComponentType<Dict_T<any>>,
    importComponent?: undefined,
} | {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
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

/** Loading behavior settings for the router */
type loaderOptions_T = {
    Loader: React.ComponentType<{}>,
    suspenseFallbackLoaderOpts: suspenseFallbackLoaderOpts_T,
    pagePreFetchLoaderOpts: pagePreFetchLoaderOpts_T
}

// REMARK:
// we create a manual partial version cuz Partial<loaderOptions_T>
// would not make sub-dictionary partial.
type partialLoaderOptions_T = {
    Loader?: loaderOptions_T['Loader'],
    suspenseFallbackLoaderOpts?: Partial<loaderOptions_T['suspenseFallbackLoaderOpts']>,
    pagePreFetchLoaderOpts?: Partial<loaderOptions_T['pagePreFetchLoaderOpts']>
}

/** Error boundary behaviour settings for the routes */
type errorBoundaryOptions_T = Omit<ErrorBoundaryProps_T, 'children'>

/** Data provided by the router settings context */
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


/** Returns default loading options (to be combined with the partial settings provided) */
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

/** Combines partial loading options provided with default one to garantee all expected keys are present */
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

/** Returns default error boundary options (to be combined with the partial settings provided) */
function _getDefaultErrorBoundaryOptions(): errorBoundaryOptions_T {
    return { Fallback: DefaultErrorFallback }
}

/** Combines partial error boundary options provided with default one to garantee all expected keys are present */
function _formatErrorBoundaryOptions(partialOptions:RouterSettingsProviderProps_T['errorBoundaryOptions']): errorBoundaryOptions_T {
    const defaultOptions = _getDefaultErrorBoundaryOptions()
    return {... defaultOptions, ...partialOptions}
}

/** React context holding the settings of the application's Router
 * 
 * (settings are encapsulated in a private `ref` because they are not supposed to change
 * or trigger re-renders)
 */
const RouterSettingsContext = createContext<React.RefObject<RouterSettings_T>>({ current: {
    pages: [],
    loaderOptions: _getDefaultLoaderOptions(),
    errorBoundaryOptions: _getDefaultErrorBoundaryOptions()
}})

/** Hook exposing the `RouterSettingsContext` 
 * 
 * (those objects are not supposed, or expected to be mutated or modified)
 * 
 * - `pages`\
 * An array of dictionaries describing each routes of the app
 * 
 * - `loaderOptions`\
 * A dictionay setting behaviour of loading in the router
 * 
 * - `errorBoundaryOptions`\
 * A dictionay setting behaviour of the error boundaries wrapping each page
 * 
 * @returns [`pages`, `loaderOptions`, `errorBoundaryOptions`]
*/
function useRouterSettings() {
    const { pages, loaderOptions, errorBoundaryOptions } = use(RouterSettingsContext).current
    return { pages, loaderOptions, errorBoundaryOptions }
}

/** Provider for the `RouterSettingsContext`
 * 
 * @param props.pages array of dictionaries used to set up routes
 * 
 * @param props.loaderOptions (optional) Loading behavior settings for the router
 * 
 * @param props.errorBoundaryOptions (optional) Error boundary behaviour settings for the routes
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
    RouterSettingsProviderProps_T,
    pagePropsGetterFunc_T
}
