import { isExecutedOnClient, isExecutedOnServer } from "@core:utils/execution-context/v1/util"
import { createContext, useMemo } from "react"

import { Dict_T } from "sniffly"

type initialPageProps_T = Dict_T<unknown> | undefined

type initialPropsContextProps_T = {
    children: React.ReactNode,
    initialPageProps: initialPageProps_T
}

let _initialPagePropsUsageToken = true

function disallowUsageOfInitialProps(): void {
    if (isExecutedOnClient()) _initialPagePropsUsageToken = false
}

/** function that will return true only once */
function canUseInitialPageProps(): boolean {
    
    // if executed on server we bypass the token entirely
    // - why ?
    // globals aren't rest between calls
    // if we consume the token on server side, SSR stops working
    // for all following requests
    if (isExecutedOnServer()) return true

    if ( _initialPagePropsUsageToken ) {
        _initialPagePropsUsageToken = false
        return true
    }
    return false
}

const InitialPropsContext = createContext<initialPageProps_T>( undefined )

function InitialPropsContextProvider(props: initialPropsContextProps_T) {
    const {children, initialPageProps} = props
    
    const initialProps = useMemo<initialPageProps_T>(() => initialPageProps, [])

    return <InitialPropsContext value={initialProps} >
        { children }
    </InitialPropsContext>
}

export {
    canUseInitialPageProps,
    disallowUsageOfInitialProps,
    InitialPropsContext,
    InitialPropsContextProvider
}
