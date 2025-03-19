import { Route, Switch } from "wouter"

import DefaultError from "@core:components/error-component-default/v1/component"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

import asPage, { type asPageWrapperKwargs_T } from "./as-page/wrapper"



type routeCompProps_T = {
    path: string,
    component: asPageWrapperKwargs_T["component"]
}

type pages_T = { pages: routeCompProps_T[] }
type asPageOptions_T = Omit<asPageWrapperKwargs_T, "component">


type getRouteKwargs_T = { pageData: routeCompProps_T } & asPageOptions_T
type routesFactoryKwargs_T  = pages_T & asPageOptions_T

function _getRoute({pageData, loaderOptions, errorHandlingOptions}: getRouteKwargs_T){
    const Page = asPage({
        component: pageData.component,
        loaderOptions, errorHandlingOptions
    })
    return <Route key = { pageData.path }
        path = { pageData.path }
        component = { Page }
    /> 
}


function RoutesFactory({pages, loaderOptions, errorHandlingOptions}: routesFactoryKwargs_T){
    
    errorHandlingOptions = errorHandlingOptions ?? { Fallback: DefaultError }
    const {Fallback} =  errorHandlingOptions
    return function Routes() {
        return <Switch>
            {pages.map((pageData) => {
                return _getRoute({pageData, loaderOptions, errorHandlingOptions})
            })}
            <Route><Fallback error={new ErrorStatus('404')}/></Route>
        </Switch>
    }
}

export default RoutesFactory