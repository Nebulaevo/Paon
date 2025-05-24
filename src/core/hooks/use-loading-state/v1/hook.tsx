import { createContext, use, useCallback, useMemo, useState } from "react"
import type React from "react"


type loadingStateContext_T = {
    isLoading: boolean,
    Loader: React.ComponentType<{}>
}

type loadingSettersContext_T = {
    activateLoading: () => void,
    deactivateLoading: () => void,
}

type LoadingStateProviderProps_T = {
    children: React.ReactNode,
    Loader: React.ComponentType
}

type SynchronizedLoaderProps_T = {
    Loader?: React.ComponentType
}

type HideOnLoadingProps_T = {
    children: React.ReactNode
}

const LoadingStateContext = createContext<loadingStateContext_T>({
    isLoading: false,
    Loader: () => 'Loading...'
})

const LoadingSettersContext = createContext<loadingSettersContext_T>({
    activateLoading: () => {},
    deactivateLoading: () => {},
})


/** hook exposing the loading state and a default loader component */
function useLoadingState() {
    return use(LoadingStateContext)
}

/** hook only exposing the static loading state setters
 * so that components consuming that hook will not be re-rendered if isLoading changes
 */
function useLoadingSetters() {
    return use(LoadingSettersContext)
}

/** Component linked to the nearest "LoadingStateProvider"
 * it displays a loader (provided in props or from useLoadingState context)
 * when isLoading is true
*/
function SynchronizedLoader(props: SynchronizedLoaderProps_T) {
    const {isLoading, Loader: DefaultLoader} = useLoadingState()
    const Loader = props.Loader ?? DefaultLoader
    return <>{isLoading && <Loader/>}</>
}

/** Component linked to the nearest "LoadingStateProvider"
 * it unmounts all its children if isLoading is true
*/
function HideOnLoading(props: HideOnLoadingProps_T) {
    const {isLoading} = useLoadingState()
    return <>{!isLoading && props.children}</>
}

/** Provider for LoadingStateContext and LoadingSettersContext */
function LoadingStateProvider(props: LoadingStateProviderProps_T) {
    const {children, Loader} = props

    const [loading, setLoading] = useState<boolean>(false)

    const activateLoading = useCallback(() => {
        setLoading(true)
    }, [])

    const deactivateLoading = useCallback(() => {
        setLoading(false)
    }, [])

    const loadineStateValue = useMemo(() => {
        return { isLoading: loading, Loader }
    }, [loading])

    const loadingSettersValue = useMemo(() => {
        return { activateLoading, deactivateLoading }
    }, [])

    return <LoadingSettersContext value={loadingSettersValue}>
        <LoadingStateContext value={loadineStateValue} >
            { children }
        </LoadingStateContext>
    </LoadingSettersContext>
}

export {
    useLoadingState,
    useLoadingSetters,
    SynchronizedLoader,
    HideOnLoading,
    LoadingStateProvider
}

export type {
    loadingStateContext_T
}