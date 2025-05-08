import React from "react"
import { Router as WouterRouter } from "wouter"

import { PagePropsProvider, type PagePropsProviderProps_T } from "./hooks/use-page-props"
import { RouterSettingsProvider, type RouterSettingsProviderProps_T } from './hooks/use-router-settings'
import { useDelayedRouteTransition } from "./hooks/use-delayed-route-transition"


type RouterProps_T = {
    ssrPath?: Parameters<typeof WouterRouter>[0]['ssrPath'],
    ssrProps?: PagePropsProviderProps_T['ssrProps'],
    pages: RouterSettingsProviderProps_T['pages'],
    loaderOptions: RouterSettingsProviderProps_T['loaderOptions'],
    errorBoundaryOptions: RouterSettingsProviderProps_T['errorBoundaryOptions'],
    children: React.ReactNode,
}

/** Wrapper over Wouter's Router providing custom contexts, hooks and logic */
function Router(props: RouterProps_T) {
    
    const { 
        ssrPath,
        ssrProps,
        pages, 
        loaderOptions, 
        errorBoundaryOptions,
        children,
    } = props

    return <PagePropsProvider ssrProps={ssrProps}>
        <RouterSettingsProvider
            pages={pages}
            loaderOptions={loaderOptions}
            errorBoundaryOptions={errorBoundaryOptions}
        >
            <WouterRouter
                ssrPath={ssrPath}
                hook={useDelayedRouteTransition}
            >{ children }</WouterRouter>
        </RouterSettingsProvider>
    </PagePropsProvider>
}

export default Router
export type {
    RouterProps_T
}