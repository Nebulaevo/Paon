
// import { createBrowserRouter } from "react-router-dom"

import { Route, Switch } from "wouter"

// import LazyComponent from "@components/lazy-component/v1/component"
import { lazy } from "react"
// import loadable from "@loadable/component"

import LazyPageWrapper from "@core:components/lazy-page-wrapper/v1/wrapper"

// import Home from './pages/home/page.tsx'
// import Other from './pages/other/page.tsx'

const Home = LazyPageWrapper({
    Component: lazy( () => import('./pages/home/page.tsx') )
})

const Other = LazyPageWrapper({
    Component: lazy( () => import('./pages/other/page.tsx') )
})

function Routes() {
    return <>
        <Switch>
            <Route path='/' component={ Home }/>
            <Route path='/other/' component={ Other } />

            <Route>404: Page Introuvable</Route>
        </Switch>
    </>
}

export default Routes

// import Home from './pages/home/page.tsx'
// import Other from './pages/other/page.tsx'

// const router = createBrowserRouter([
//     {
//         path: '/',
//         Component: Home
//     },
//     {
//         path: '/other/',
//         Component: Other
//     }
// ])

// export default router