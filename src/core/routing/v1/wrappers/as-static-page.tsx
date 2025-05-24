import { useEffect } from "react"
import type React from "react"
import type { Dict_T } from "sniffly"

import { usePageProps } from "../hooks/use-page-props"

type Component_T = React.ComponentType<Dict_T<any>>
type LazyComponent_T = React.LazyExoticComponent<Component_T>

/** Returns the component wrapped in a layer making sure any previous page props have been reset */
function asStaticPage(Component: Component_T | LazyComponent_T) {
    
    const StaticPage = () => {
        
        // 🔧 Bug fix:
        // Adding resetting page props to non-fetching pages
        // (otherwise history navigation in and out of a non-fetching pages
        // can cause props to not be reset,
        // and adding a eventListener on popstate breaks the pre-loading logic)
        const { silentlyResetPageProps } = usePageProps()
        useEffect(() => {
            // Running reset as side effect of component building
            // because it doesn't need to run for every render
            silentlyResetPageProps()
        }, [])

        return <Component/>
    }
    return StaticPage
}

export { asStaticPage }