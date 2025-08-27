import { createContext, use, useRef } from "react"
import type React from "react"

import { LoadingStateProvider } from "@core:hooks/use-loading-state/v1/hook"
import { usePageProps } from "@core:routing/v1/hooks/use-page-props/hook"

import { buildErrorHandler } from './internal/error-handling'
import { generateLazyPageComponents } from "./internal/generate-lazy-page-components"
import {
    getDefaultLoaderOptions,
    getDefaultErrorBoundaryOptions,
    formatErrorBoundaryOptions, 
    formatLoaderOptions
} from './internal/options-extraction'
import type {
    pagePropsGetterFunc_T,
    pageData_T,
    loaderOptions_T,
    errorBoundaryOptions_T,
    RouterSettings_T, 
    RouterSettingsProviderProps_T
} from './internal/types'


/** React context holding the settings of the application's Router
 * 
 * (settings are encapsulated in a private `ref` because they are not supposed to change
 * or trigger re-renders)
 */
const RouterSettingsContext = createContext<React.RefObject<RouterSettings_T>>({ current: {
    pages: [],
    loaderOptions: getDefaultLoaderOptions(),
    errorBoundaryOptions: getDefaultErrorBoundaryOptions()
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
    
    const loaderOptions = formatLoaderOptions( props.loaderOptions )
    const errorBoundaryOptions = formatErrorBoundaryOptions( props.errorBoundaryOptions )

    // const lazyLoadedModulesRef = useRef({})

    const { silentlyResetPageProps } = usePageProps()
        
    // inserting common error handling behaviour 
    // before custom error handling function
    errorBoundaryOptions.errorHandlingFunc = buildErrorHandler({
        errorHandlingFunc: errorBoundaryOptions.errorHandlingFunc, 
        pagePropsHookResetHandler: silentlyResetPageProps
    })

    const ref = useRef<RouterSettings_T>({
        pages: generateLazyPageComponents(pages), 
        loaderOptions, errorBoundaryOptions
    })

    return <RouterSettingsContext value={ref} >
        <LoadingStateProvider DefaultLoader={loaderOptions.Loader}>
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
