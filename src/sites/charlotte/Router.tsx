import { PagePropsFetcher } from "@core:routing/v1/utils/page-props-fetcher"
import type { RouterProps_T } from "@core:routing/v1/router"

import Other from './pages/other/page'

import fetchPageProps from "./api/page-props"
import shortFetchPageProps from './api/short-page-props'
import Loader from './loader.tsx'
import Error from "./error.tsx"


// common page props fetcher
const pagePropsFetcher = new PagePropsFetcher({
    fetcher: fetchPageProps,
    cacheTimeS: 0 // 1 min
})

const shortPagePropsFetcher = new PagePropsFetcher({
    fetcher: shortFetchPageProps,
    cacheTimeS: 0 // 1 min
})

// Pages Options

const loadHome = () => import('./pages/home/page.tsx')
const loadOther = () => import('./pages/other/page.tsx', {})

const pages: RouterProps_T['pages'] = [
    {
        path: '/', 
        importComponent: loadHome,
        propsFetcher: shortPagePropsFetcher
    }, {
        path: '/other/', 
        Component: Other,
        propsFetcher: pagePropsFetcher
    }, {
        path: '/other/:id/', 
        Component: Other,
        // propsFetcher: pagePropsFetcher
    },
]

const errorBoundaryOptions: RouterProps_T['errorBoundaryOptions'] = { 
    Fallback: Error 
}

const loaderOptions: RouterProps_T['loaderOptions'] = {
    Loader: Loader,
    pagePreFetchLoaderOpts: {
        timeoutMs: 500
    }
}

export { pages, loaderOptions, errorBoundaryOptions }