import { useEffect } from "react"
import { Route, Switch } from "wouter"

import DefaultError from "@core:components/error-component-default/v1/component"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

import asPage, { type asPageWrapperKwargs_T } from "./as-page/wrapper"
import { disallowUsageOfInitialProps } from '@core:hooks/use-intial-props/v1/context'



type pageData_T = Pick<asPageWrapperKwargs_T, 'pageData'>['pageData']
type loaderOptions_T = Pick<asPageWrapperKwargs_T, 'loaderOptions'>['loaderOptions']
type errorHandlingOptions_T = Pick<asPageWrapperKwargs_T, 'errorHandlingOptions'>['errorHandlingOptions']

type pages_T = { pages: pageData_T[] }
type asPageOptions_T = Omit<asPageWrapperKwargs_T, "pageData">


type routesFactoryKwargs_T  = pages_T & asPageOptions_T

function _getRoute(kwargs: asPageWrapperKwargs_T ) {

    const Page = asPage(kwargs)
    
    return <Route key = { kwargs.pageData.path }
        path = { kwargs.pageData.path }
        component = { Page }
    />
}


function RoutesFactory({pages, loaderOptions, errorHandlingOptions}: routesFactoryKwargs_T){
    
    errorHandlingOptions = errorHandlingOptions ?? { Fallback: DefaultError }
    const { Fallback: ErrorFallback} =  errorHandlingOptions
    return function Routes() {
        
        // Necessary safety net insuring 
        // initial page props are used only for first render
        // - Why here? 
        // have to be outside of routes so that initial-page-props
        // are cleaned even if an exception is thrown by a Route
        useEffect(() => {
            // Dirty trick to allow disallowUsageOfInitialProps
            // to run after the suspended page consumes the initial props
            // (otherwise this useEffect runs before page comp consumes inital props)
            const timeout = setTimeout(() => { 
                disallowUsageOfInitialProps() 
            }, 100 )

            return () => clearTimeout(timeout)
        }, [])
        
        return <Switch>
            {pages.map((pageData) => {
                return _getRoute({pageData, loaderOptions, errorHandlingOptions})
            })}
            <Route><ErrorFallback error={new ErrorStatus('404')}/></Route>
        </Switch>
    }
}

export default RoutesFactory

export type {
    pageData_T,
    loaderOptions_T,
    errorHandlingOptions_T
}