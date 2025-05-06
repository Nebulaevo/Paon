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

function asPropsFetchingPage({Component, fetcher}: propsFetchingPageKwargs_T) {
    
    const FetchingPage = () => {
        console.log('rendering <FetchingPage>')
        let pageProps: Dict_T<unknown> = {}

        const { getPageProps } = usePageProps()
        
        const url = isExecutedOnClient()
            ? window.location.href
            : '' // getPageProps will not be executed server side

        const [state, content] = getPageProps(
            url, fetcher
        )

        const [status, value] = state==='FETCHING'
            ? use(content)
            : content

        if (status==='ERROR') throw value
        else pageProps = value

        return <Component {...pageProps}/>
    }
    return FetchingPage
}

export default asPropsFetchingPage