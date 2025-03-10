import { StrictMode } from 'react'
import { Router } from 'wouter'

import { appProps_T } from '&interop-types/app-props'
import renderToStringAsync from '@core:utils/async-render-to-string/v1/util'

import App from './App'

export async function render( RequestData: appProps_T ) {
    const html = await renderToStringAsync(
        <StrictMode>
            <Router ssrPath={ RequestData.url } >
                <App { ...RequestData.context }/>
            </Router>
        </StrictMode>
    )
    return { html }
}