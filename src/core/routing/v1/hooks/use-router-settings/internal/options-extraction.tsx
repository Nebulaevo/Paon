import { DefaultErrorFallback } from "@core:components/error-boundary/v1/component"

import type {
    loaderOptions_T,
    errorBoundaryOptions_T,
    RouterSettingsProviderProps_T
} from './types'


/** Returns default loading options (to be combined with the partial settings provided) */
function getDefaultLoaderOptions(): loaderOptions_T {
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

/** Returns default error boundary options (to be combined with the partial settings provided) */
function getDefaultErrorBoundaryOptions(): errorBoundaryOptions_T {
    return { Fallback: DefaultErrorFallback }
}

/** Combines partial loading options provided with default one to garantee all expected keys are present */
function formatLoaderOptions( partialOptions:RouterSettingsProviderProps_T['loaderOptions'] ): loaderOptions_T {
    const defaultOptions = getDefaultLoaderOptions()
    
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

/** Combines partial error boundary options provided with default one to garantee all expected keys are present */
function formatErrorBoundaryOptions(partialOptions:RouterSettingsProviderProps_T['errorBoundaryOptions']): errorBoundaryOptions_T {
    const defaultOptions = getDefaultErrorBoundaryOptions()
    return {... defaultOptions, ...partialOptions}
}

export {
    getDefaultLoaderOptions,
    getDefaultErrorBoundaryOptions,
    formatLoaderOptions,
    formatErrorBoundaryOptions
}