import type React from "react"
import type { Dict_T } from "sniffly"

import type { RelativeURL } from "@core:utils/url/v1/utils"
import type { ErrorBoundaryProps_T } from "@core:components/error-boundary/v1/component"


/** Async function returning a call to "import(...)" */
type pageAsyncLoadFunc_T = () => Promise<{
    default: React.ComponentType<Dict_T<any>>;
}>

type pagePropsGetterFunc_T = (currentUrl: RelativeURL, abortController: AbortController) => Promise<Dict_T<unknown>>

type lazyPageComponent_T = React.LazyExoticComponent<
    React.ComponentType<Dict_T<any>>
>


type rawRegularPageData_T = {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
    Component: React.ComponentType<Dict_T<any>>,
    importComponent?: undefined,
}

type rawLazyPageData_T = {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
    Component?: undefined,
    importComponent: pageAsyncLoadFunc_T
}

/** Raw page data given to initialize the routes */
type rawPageData_T = rawRegularPageData_T | rawLazyPageData_T



type regularPageData_T = {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
    Component: React.ComponentType<Dict_T<any>>,
    importComponent?: undefined,
}

type lazyPageData_T = {
    path: string,
    propsFetcher?: pagePropsGetterFunc_T,
    Component: lazyPageComponent_T,
    importComponent?: pageAsyncLoadFunc_T,
}

/** Refined page data stored in the router settings */
type pageData_T = regularPageData_T | lazyPageData_T


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
    pages: rawPageData_T[],
    loaderOptions?: partialLoaderOptions_T,
    errorBoundaryOptions?: errorBoundaryOptions_T
}

export type { 
    rawRegularPageData_T, rawLazyPageData_T, rawPageData_T,
    regularPageData_T, lazyPageData_T, pageData_T,
    
    lazyPageComponent_T,
    pagePropsGetterFunc_T,
    loaderOptions_T,
    errorBoundaryOptions_T,
    RouterSettings_T, 
    RouterSettingsProviderProps_T
}
