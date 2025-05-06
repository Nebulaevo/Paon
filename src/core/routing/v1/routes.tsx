import { Route as WouterRoute, Switch } from "wouter"

import ThrowError from "@core:components/throw-error/v1/component"
import { SynchronizedLoader } from "@core:hooks/use-loading-state/v1/hook"

import asPage, { type asPageKwargs_T } from './wrappers/as-page'
import { useRouterSettings, type pageData_T } from "./hooks/use-router-settings"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

function _getRoute(kwargs: asPageKwargs_T) {
    
    const {path} = kwargs.pageData
    const Page = asPage(kwargs)

    return <WouterRoute 
        key={path}
        path={path}
        component={Page}
    />
}

/** Generates a fallback route for the Switch component
 * - displays any "initial-error" if provided
 * - if not, defaults to displaying a "404" error
*/
function _getFallbackRoute( kwargs: Omit<asPageKwargs_T, 'pageData'>) {
    const fallbackPageData: pageData_T = {
        path: '__FALLBACK_ROUTE__', // dummy value
        propsFetcher: undefined,
        Component: () => <ThrowError error={new ErrorStatus('404')} clientOnly={true} />
    }

    const FallbackPage = asPage({
        pageData: fallbackPageData, 
        ...kwargs
    })

    return <WouterRoute>
        <FallbackPage/>
    </WouterRoute>
}

/** Component displaying the routes as they were set up in the global router
 * (uses router settings context to find routes and apply loader and error settings)
 */
function Routes() {

    const {
        pages, 
        loaderOptions, 
        errorBoundaryOptions 
    } = useRouterSettings()
    
    return <>
        <SynchronizedLoader/>
        <Switch>
            {pages.map(pageData => {
                return _getRoute({
                    pageData, 
                    loaderOptions, 
                    errorBoundaryOptions
                })
            })}

            {/* generic 'catch-all' route raising a 404 */}
            { _getFallbackRoute({loaderOptions, errorBoundaryOptions}) }
        </Switch>
    </>
}

export default Routes