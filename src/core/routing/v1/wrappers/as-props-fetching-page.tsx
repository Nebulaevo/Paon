import { use } from "react"
import type React from "react"
import type { Dict_T } from "sniffly"

import { usePageProps } from "../hooks/use-page-props"
import type { PagePropsFetcher } from "../utils/page-props-fetcher"
import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"

type Component_T = React.ComponentType<Dict_T<any>>
type LazyComponent_T = React.LazyExoticComponent<Component_T>

type propsFetchingPageKwargs_T = {
    Component: Component_T | LazyComponent_T,
    fetcher: PagePropsFetcher
}

/** Returns the component wrapped in a fetching layer in charge of providing it with its props */
function asPropsFetchingPage({Component, fetcher}: propsFetchingPageKwargs_T) {
    
    const FetchingPage = () => {
        const { getPageProps } = usePageProps()
        
        const url = isExecutedOnClient()
            ? window.location.href
            : '' // getPageProps will not be executed server side

        const [operationState, operationResult] = getPageProps(
            url, fetcher
        )

        const [resultStatus, resultValue] = operationState==='FETCHING'
            ? use(operationResult)
            : operationResult

        if (resultStatus==='ERROR') throw resultValue

        const pageProps: Dict_T<unknown> = resultValue
        return <Component {...pageProps}/>
    }
    return FetchingPage
}

export { asPropsFetchingPage }