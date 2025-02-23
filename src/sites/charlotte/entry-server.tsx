import { StrictMode } from 'react'
import { Router } from 'wouter'

import { appProps_T } from '&interop-types/app-props'
import renderToStringAsync from '@core:utils/asyncRenderToString/v1/asyncRenderToString'

import App from './App'

export async function render( RequestData: appProps_T ) {
    const html = await renderToStringAsync(
        <StrictMode>
            <Router ssrPath={ RequestData.url } >
                <App { ...RequestData.pageContext }/>
            </Router>
        </StrictMode>
    )
    return { html }
}