import { lazy } from "react"

import RoutesFactory from "@core:components/routes/v1/factory"

import Error from "./error.tsx"
import Loader from './loader.tsx'


// Pages Options

const pages = [
    {path: '/', component: lazy(() => import('./pages/home/page.tsx'))},
    {path: '/other/', component: lazy(() => import('./pages/other/page.tsx'))},
    {path: '/other/:id/', component: lazy(() => import('./pages/other/page.tsx'))},
]

const errorHandlingOptions = { 
    Fallback: Error 
}

const loaderOptions = {
    Loader: Loader,
    timeoutMs: 1000
}

// Routes

const Routes = RoutesFactory({
    pages, loaderOptions, errorHandlingOptions
})

export default Routes