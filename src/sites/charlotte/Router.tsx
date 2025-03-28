import {lazy} from "react"

import RoutesFactory, {
    type pageData_T,
    type loaderOptions_T,
    type errorHandlingOptions_T 
} from "@core:components/routes/v1/factory"

import fetchPageProps from "./endpoints/fetch-page-props.ts"
import Loader from './loader.tsx'
import Error from "./error.tsx"



// Pages Options

const Home = lazy(() => import('./pages/home/page.tsx'))
const Other = lazy(() => import('./pages/other/page.tsx'))

const pages: pageData_T[] = [
    {
        path: '/', 
        Component: Home,
        propsFetcher: fetchPageProps,
    }, {
        path: '/other/', 
        Component: Other,
        propsFetcher: fetchPageProps,
    }, {
        path: '/other/:id/', 
        Component: Other,
        propsFetcher: fetchPageProps,
    },
]

const errorHandlingOptions: errorHandlingOptions_T = { 
    Fallback: Error 
}

const loaderOptions: loaderOptions_T = {
    Loader: Loader,
    timeoutMs: 0
}

// Routes


const Routes = RoutesFactory({
    pages,
    loaderOptions, 
    errorHandlingOptions
})

export default Routes