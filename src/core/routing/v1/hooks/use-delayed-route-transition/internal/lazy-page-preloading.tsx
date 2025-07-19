import { createRoot, type Root as ReactDomRoot } from "react-dom/client"
import { 
    Suspense,
    useEffect, useLayoutEffect, 
    type LazyExoticComponent
} from "react"

import { isExecutedOnClient } from "@core:utils/execution-context/v1/util"
import ErrorBoundary from "@core:components/error-boundary/v1/component"


/** WeakSet listing loaded components to avoid preloading the same component twice
 * (also loading function assumes to a certain degree that component has never been loaded)
*/
const LOADED_COMPONENTS = new WeakSet()


/** Returns true if this component has been marked as loaded */
function hasBeenLoaded(LazyComponent: LazyExoticComponent<any>) {
    return LOADED_COMPONENTS.has(LazyComponent)
}
 
/** Marks the given component as loaded */
function markAsLoaded(LazyComponent: LazyExoticComponent<any>) {
    if (isExecutedOnClient()) {
        LOADED_COMPONENTS.add(LazyComponent)
    }
}

/** C */
function load(LazyComponent: LazyExoticComponent<any>): Promise<void> | undefined {
    
    /** if the given component was already marked as loaded we ignore */
    if (hasBeenLoaded(LazyComponent)) return
    
    // closure used to prevent multiple cleanup calls
    let isUnmounted = false

    return new Promise<void>((resolve, reject) => {
        
        // we mark the component as loaded
        markAsLoaded(LazyComponent)

        // we set up a react root to render our component
        const [container, root] = _createHiddenReactRoot()

        /** Function cleaning up created elements and resolving the promise 
         * on the next tick to allow react to finish current rendering */
        function cleanupAndResolveNextTick() {
            return setTimeout(() => {
                if (!isUnmounted) { // to prevent multiple unmounts
                    isUnmounted = true
                    root.unmount()
                    container.remove()
                    
                    console.log('RESOLVING...')
                    resolve()
                }
            }, 0)
        }

        // we wrap the component so that it will resolve
        // the promise after preloading the lazy component
        // but before rendering it
        const ComponentWrappedForRender = _wrapLazyComponentForRender(
            LazyComponent, 
            cleanupAndResolveNextTick
        )

        try {
            root.render(<ComponentWrappedForRender/>)
        } catch (err) {
            console.log(err)
            reject()
        }
    })
}

/** Creates a second react root in a hidden div at the end of the body */
function _createHiddenReactRoot(): [HTMLDivElement, ReactDomRoot] {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    const root = createRoot(container);

    return [container, root]
}

/** Returns a component in charge of pre loading the given lazy component 
 * and resolving the promise once it's done, 
 * if possible without triggering the lazy component render
*/
function _wrapLazyComponentForRender(
    LazyComponent: LazyExoticComponent<any>, 
    cleanupAndResolveNextTick: () => NodeJS.Timeout
) {

    /** closure variable counting the number of renders 
     * to prevent actually rendering the lazy component
    */
    let RENDER_COUNT = 0

    const ResolveOnMount = () => {
        useEffect(() => {
            cleanupAndResolveNextTick()
            // there is no need to clean the timer,
            // the function should not be prevented from running,
            // and it has buit-in checks to not be executed more than once
        })
        return <></>
    }

    const WrappedLazyComponent = () => {
        
        // we increment the render count on each render
        RENDER_COUNT ++
        
        // hook that triggers cleanup and promise resolution
        // as soon as children are rendered
        useLayoutEffect(() => {
            console.log('useLayoutEffect cleanup')
            console.log('RENDER_COUNT : ' + RENDER_COUNT)
            cleanupAndResolveNextTick()
            // there is no need to clean the timer,
            // the function should not be prevented from running,
            // and it has buit-in checks to not be executed more than once
        })
        
        // we return null after the first render
        // to prevent actually rendering the lazy component
        // because it could be expensive to render, 
        // and we don't know which props it expects 
        if (RENDER_COUNT > 1) return null

        return <LazyComponent/>
    }


    return () => <>
        {/* Just to be safer, we wrap everyting in Error Boundaries 
        to catch eventual rendering errors, 
        the fallback component will resolve the promise on render */}
        <ErrorBoundary Fallback={ResolveOnMount}>
            <Suspense fallback={null}>
                <WrappedLazyComponent/>
            </Suspense>
        </ErrorBoundary>
    </>
}

export default {
    hasBeenLoaded,
    markAsLoaded,
    load
}
