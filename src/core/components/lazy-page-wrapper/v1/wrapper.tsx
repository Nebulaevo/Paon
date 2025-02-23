import { Suspense, useEffect, useState } from "react"

type loadingOptions_T = {
    LoadingComp: () => JSX.Element,
    timeoutMs: number
}

type LazyPageWrapperArgs_T = {
    Component: React.LazyExoticComponent<(props: any) => JSX.Element>,
    loadingOptions?: Partial<loadingOptions_T>
}

function LazyPageWrapper( args:LazyPageWrapperArgs_T ){
    
    const PageComponent = args.Component
    
    // Loading component
    const {LoadingComp, timeoutMs} = _getLoadingOptions( args.loadingOptions )
    
    function Loading (){

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
            ? <LoadingComp/>
            : <></>
    }

    return function LazyPage() {
        return <>
            <Suspense fallback={<Loading/>}>
                <PageComponent />
            </Suspense>
        </>
    }
}


function _DefaultLoadingComp() {
    return <p>Loading...</p>
}

function _getLoadingOptions( options?:Partial<loadingOptions_T> ): loadingOptions_T {
    return {
        LoadingComp: options?.LoadingComp ?? _DefaultLoadingComp,
        timeoutMs: options?.timeoutMs ?? 1000
    }
}

export default LazyPageWrapper