// import { PagePropsFetcher } from "@core:routing/v1/utils/page-props-fetcher"
import type { RouterProps_T } from "@core:routing/v1/router"

// import Other from './pages/other/page'

import {fetchApi} from "./api/api.ts"
// import {fetchComment} from './api/users.ts'
import Loader from './loader'
import Error from "./error"


// Pages Options

const loadHome = () => import('./pages/home/page.tsx')
const loadOther = () => import('./pages/other/page.tsx')

const pages: RouterProps_T['pages'] = [
    {
        path: '/', 
        importComponent: loadHome,
        propsFetcher: fetchApi
    }, {
        path: '/other/', 
        importComponent: loadOther,
        propsFetcher: fetchApi
    }, {
        path: '/othér/:id/', 
        importComponent: loadOther,
        // propsFetcher: fetchComment
    }
]

const errorBoundaryOptions: RouterProps_T['errorBoundaryOptions'] = { 
    Fallback: Error 
}

const loaderOptions: RouterProps_T['loaderOptions'] = {
    Loader: Loader,
    pagePreFetchLoaderOpts: {
        timeoutMs: 1000
    }
}

export { pages, loaderOptions, errorBoundaryOptions }