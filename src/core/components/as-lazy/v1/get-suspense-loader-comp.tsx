import { useEffect, useState } from "react"

type loaderOptions_T = {
    FallbackComp: () => JSX.Element,
    timeoutMs: number
}


function _DefaultLoadingComp() {
    return <p>Loading...</p>
}

function _getLoadingOptions( options?:Partial<loaderOptions_T> ): loaderOptions_T {
    return {
        FallbackComp: options?.FallbackComp ?? _DefaultLoadingComp,
        timeoutMs: options?.timeoutMs ?? 1000
    }
}

function getSuspenseLoaderComp( options?: Partial<loaderOptions_T> ) {
    const {FallbackComp, timeoutMs} = _getLoadingOptions( options )
    
    return function Loading () {

        // only display loading component after timeout delay
        const [ display, setDisplay ] = useState( false )
        useEffect( () => {
            const timer = timeoutMs > 0 
                ? setTimeout(
                    () => setDisplay( true ),
                    timeoutMs
                )
                : null
            
            return () => { 
                console.log(`Clear Timeout ${timer}`)
                clearTimeout( timer ?? undefined ) 
            }
        }, [])
        
        return display 
            ? <FallbackComp/>
            : <></>
    }
}

export default getSuspenseLoaderComp
export type { loaderOptions_T }