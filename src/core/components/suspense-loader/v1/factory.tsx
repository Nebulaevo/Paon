import { useEffect, useState } from "react"

type loaderOptions_T = {
    Loader: () => JSX.Element,
    timeoutMs: number
}


function _DefaultLoadingComp() {
    return <></>
}

function _getLoadingOptions( options?:Partial<loaderOptions_T> ): loaderOptions_T {
    return {
        Loader: options?.Loader ?? _DefaultLoadingComp,
        timeoutMs: options?.timeoutMs ?? 1000
    }
}

function suspenseLoaderFactory( options?: Partial<loaderOptions_T> ) {
    const {Loader, timeoutMs} = _getLoadingOptions( options )
    const activateTimeout = timeoutMs > 0 
    return function Loading () {

        // only display loading component after timeout delay
        const [ display, setDisplay ] = useState( !activateTimeout )
        useEffect( () => {
            const timer = activateTimeout
                ? setTimeout(
                    () => setDisplay( true ),
                    timeoutMs
                )
                : null
            
            return () => { 
                clearTimeout( timer ?? undefined ) 
            }
        }, [])
        
        return display 
            ? <Loader/>
            : <></>
    }
}

export default suspenseLoaderFactory
export type { loaderOptions_T }