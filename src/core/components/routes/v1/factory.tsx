import { useEffect, useState } from "react"
import { Route, Switch } from "wouter"

// import useErrorStateProps from '@core:hooks/use-error-state-props/v1/hook'
import DefaultError from "@core:components/error-component-default/v1/component"
import getInitialErrorStateProps from "@core:utils/get-initial-error-state-props/v1/util"

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

    return function Routes() {

        // const [isError, setIsError] = useState(true)

        // useEffect(() => {
        //     if ( isExecutedOnClient() ) {
        //         console.log('ADDING EV LISTENER')
        //         document.addEventListener( 'popstate',  ()=>{
        //             console.log('popstate')
        //             setIsError(false)
        //         })

        //         document.addEventListener( 'pushState',  ()=>{
        //             console.log('pushState')
        //             setIsError(false)
        //         })
        //     }
        // })

        // if (isError) return <div>ERROR HA</div>
        
        // if json data with id 'error-state-props' found on the page
        // it is an error page.
        // const errorStateProps = useErrorStateProps()
        // if ( errorStateProps ) { // <-------------------- THIS WILL TRIGGER HYDRATION ERRORS !!
        //     console.log("---ERROR STATE---")
        //     const Fallback = errorHandlingOptions.Fallback
        //     return <Fallback {...errorStateProps} />
        // }
        // console.log("---NO ERROR STATE---")

        // const initialErrorProps = getInitialErrorStateProps()
        // if ( initialErrorProps ) {
        //     throw new Error('INITIAL ERROR')
        // }

        return <Switch>
            {pages.map((pageData) => {
                return _getRoute({pageData, loaderOptions, errorHandlingOptions})
            })}
            <Route>TODO: 404 Not Found in switch case</Route>
        </Switch>
    }
}

export default RoutesFactory