import { StrictMode } from 'react'
import { Router } from 'wouter'

import { appProps_T } from '&interop-types/app-props'
import renderToStringAsync from '@core:utils/async-render-to-string/v1/util'
import { InitialPropsContextProvider } from '@core:hooks/use-intial-props/v1/context'

import App from './App'

async function render( RequestData: appProps_T ) {
    const html = await renderToStringAsync(
        <StrictMode>
            <InitialPropsContextProvider initialPageProps={ RequestData.context }>
                <Router ssrPath={ RequestData.url } >
                    <App/>
                </Router>
            </InitialPropsContextProvider>
        </StrictMode>
    )
    return { html }
}

export {
    render
}