import { lazy } from "react"
import { Route, Switch } from "wouter"

import asLazy from "@core:components/as-lazy/v1/wrapper"

import Error from "./error.tsx"
import Loader from './loader.tsx'


// Pages Options

const errorHandlingOptions = { FallbackComp: Error }
const loaderOptions = {
    FallbackComp: Loader,
    timeoutMs: 1000
}


// Pages Components

const Home = asLazy({
    Component: lazy( () => import('./pages/home/page.tsx') ),
    loaderOptions, errorHandlingOptions
})

const Other = asLazy({
    Component: lazy( () => import('./pages/other/page.tsx') ),
    loaderOptions, errorHandlingOptions
})

const PaonPage = asLazy({
    Component: lazy( () => import('@core:components/paon-default-page/v1/component.tsx') ),
    loaderOptions, errorHandlingOptions
})


// Routes

function Routes() {
    return <>
        <Switch>
            <Route path='/' component={ Home }/>
            <Route path='/other/' component={ Other } />
            <Route path='/paon/' component={PaonPage} />

            <Route>404: Page Introuvable</Route>
        </Switch>
    </>
}

export default Routes