import { use } from "react"
import type React from "react"
import type { Dict_T } from "sniffly"

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import { RelativeURL } from "@core:utils/url/v1/utils"

import { usePageProps } from "../hooks/use-page-props"
import type { pagePropsGetterFunc_T } from "../hooks/use-router-settings"



type Component_T = React.ComponentType<Dict_T<any>>
type LazyComponent_T = React.LazyExoticComponent<Component_T>

type propsFetchingPageKwargs_T = {
    Component: Component_T | LazyComponent_T,
    fetcher: pagePropsGetterFunc_T
}

/** Returns the component wrapped in a fetching layer in charge of providing it with its props */
function asPropsFetchingPage({Component, fetcher}: propsFetchingPageKwargs_T) {
    
    const FetchingPage = () => {
        const { getPageProps } = usePageProps()

        const url = isExecutedOnClient()
            // ℹ️ Remark:
            // in thoery construction of a RelativeURL instance can throw an error
            // but if it fails to parse current URL something went horribly wrong and the app
            // should probably crash 
            ? new RelativeURL(window.location.href, {onPurifyFail:'ERROR'})

            // ℹ️ Remark:
            // getPageProps will not be executed server side
            : ''

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