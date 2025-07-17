import React from 'react'
import { Dict_T } from 'sniffly'

import type { rawPageData_T, pageData_T } from './types'


/** Completes the pages data by creating the component instances 
 * for routes delclaring an `importCompoent` function
 * 
 * (makes sure only one lazy component instance is created per `importCompoent` function,
 * this way we limit the number of time a new lazy component is initialised and triggers the suspense boundary)
*/
function generateLazyPageComponents(rawPagesData:rawPageData_T[] ): pageData_T[] {

    /** Maps one import function to one lazy Component using it */
    const lazyCompMap = new Map<
        Required<pageData_T>['importComponent'],
        React.ComponentType<Dict_T<any>>
    >()
    
    /** Makes sure only one lazy component is created per import function */
    function getLazyComponent( importFunc: Required<pageData_T>['importComponent'] ): React.ComponentType<Dict_T<any>> {
        if (!lazyCompMap.has(importFunc)) {
            lazyCompMap.set(
                importFunc, 
                React.lazy(importFunc)
            )
        }

        return lazyCompMap.get(importFunc) as React.ComponentType<Dict_T<any>>
    }

    return rawPagesData.map(pageData => {

        const {path, propsFetcher} = pageData
        // if a component is given we make sure 
        // not to include the "importComponent" key
        // to be able to differenciate normal components from lazy ones
        if (pageData.Component) return {
            path, propsFetcher, 
            Component: pageData.Component,
        }

        const { importComponent } = pageData        
        const Component = getLazyComponent(importComponent)
        return {path, propsFetcher, Component, importComponent}
    })
}

export { generateLazyPageComponents }