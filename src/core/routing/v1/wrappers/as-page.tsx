import { Suspense, Fragment } from "react"
import type { Dict_T } from "sniffly"

import ErrorBoundary from "@core:components/error-boundary/v1/component"
import { HideOnLoading } from "@core:hooks/use-loading-state/v1/hook"
import InitialErrorThrower from "@core:routing/v1/sub-components/initial-error-thrower"
import type { useRouterSettings, pageData_T } from "@core:routing/v1/hooks/use-router-settings/hook"

import { asPropsFetchingPage } from "./as-props-fetching-page"
import { asStaticPage } from "./as-static-page"



type asPageKwargs_T = {
    pageData: pageData_T,
    loaderOptions: ReturnType<typeof useRouterSettings>['loaderOptions'],
    errorBoundaryOptions: ReturnType<typeof useRouterSettings>['errorBoundaryOptions'],
}

type asSuspendedPageKwargs_T = {
    Component: React.ComponentType<Dict_T<any>>,
} & Pick<asPageKwargs_T, 'loaderOptions'>


/** Returns the component wrapped in a suspense boundary 
 * 
 * (fallback used for suspense depends on router's loaderOptions)
*/
function _asSuspendedComponent(kwargs:asSuspendedPageKwargs_T) {
    const { Component, loaderOptions } = kwargs

    const FallbackLoader = loaderOptions.suspenseFallbackOpts.deactivate
        ? Fragment
        : loaderOptions.Loader
    
    const SuspendedPage = () => {
        return <Suspense fallback={<FallbackLoader/>}>
            <Component/>
        </Suspense>
    }
    return SuspendedPage
}

/** Returns the component wrapped differently depending on:
 * - if it is a static page (no props fetcher)
 * - if it is a fetching page (props fetcher provided)
 * - if it needs to be suspended (fetching or lazy component)
*/
function _getWrappedComponent(kwargs: Omit<asPageKwargs_T, 'errorBoundaryOptions'>) {
    const {
        pageData,
        loaderOptions
    } = kwargs
    
    // wrapping component with eventual
    // props fetching logic
    const Component = pageData.propsFetcher
        ? asPropsFetchingPage({
            Component: pageData.Component, 
            fetcher: pageData.propsFetcher
        })
        : asStaticPage(pageData.Component)
    
    // if something in the component needs to be suspended we add suspense boundary
    if (pageData.propsFetcher || pageData.importComponent) {
        return _asSuspendedComponent({Component, loaderOptions})
    }

    return Component
}

/** Returns the component provided with all it needs to be used as a route's component */
function asPage( kwargs:asPageKwargs_T ) {
    const {
        pageData,
        loaderOptions,
        errorBoundaryOptions
    } = kwargs

    // wrapping component with eventual
    // props fetching logic and suspense boundary
    const Component = _getWrappedComponent({
        pageData,
        loaderOptions,
    })
    
    const OptionalHideOnLoad = 
        loaderOptions.pagePreFetchOpts.hidePageOnLoad
            ? HideOnLoading
            : Fragment

    const Page = () => {
        return <OptionalHideOnLoad>
            <ErrorBoundary {...errorBoundaryOptions}>
                <InitialErrorThrower>
                    <Component/>
                </InitialErrorThrower>
            </ErrorBoundary>
        </OptionalHideOnLoad>
    }

    return Page
}

export { asPage }

export type {
    asPageKwargs_T
}