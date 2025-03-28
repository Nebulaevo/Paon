import { createContext, useMemo } from "react"

import { Dict_T, isDict } from "sniffly"

type initialPageProps_T = Dict_T<unknown> | undefined

type initialPropsContextProps_T = {
    children: React.ReactNode,
    initialPageProps: initialPageProps_T
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
    InitialPropsContext,
    InitialPropsContextProvider
}
