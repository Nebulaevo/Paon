import type { RouterProps_T } from "@core:routing/v1/router"

import PaonWelcomePage from "./pages/welcome/page.tsx"
import { fetchApi } from "./api/api.ts"
import Loader from './loader.tsx'
import Error from "./error.tsx"


/** We declare some lazy component import functions 
 * 
 * Remark:
 * there should be only one instance of import function
 * per path, and they should all be declarred here.
*/
const lazyLoaders = {
    Hello: () => import('./pages/hello/page.tsx')
}

/** Declaring routes of the app */
const pages: RouterProps_T['pages'] = [
    {
        // path for which that route will be rendered
        path: '/', 
        
        // page component
        Component: PaonWelcomePage,
        
        // for components expecting data we can add a props fetcher
        // that will be run in the background before the page is rendered
        propsFetcher: fetchApi,
    }, {
        // we can use dynamic paths for routes
        path: 'hello/:name/',

        // we can declare a lazy import function
        // instead of the component, it will 
        // will set up a lazy component for the route
        importComponent: lazyLoaders.Hello,
    }
]

/** Settings applied to the error boundaries surrounding page components */
const errorBoundaryOptions: RouterProps_T['errorBoundaryOptions'] = { 
    Fallback: Error 
}

/** Settings defining route transition loading behaviour */
const loaderOptions: RouterProps_T['loaderOptions'] = {
    Loader: Loader,
    pagePreFetchLoaderOpts: {
        timeoutMs: 500
    }
}

export { pages, loaderOptions, errorBoundaryOptions }