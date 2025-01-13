import { StrictMode } from 'react'
import { Router } from 'wouter'

import type { appProps_T } from '&internal-interface/app-props'
import renderToStringAsync from '@utils/core/asyncRenderToString/v1/asyncRenderToString'

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