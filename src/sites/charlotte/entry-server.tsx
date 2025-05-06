import { StrictMode } from 'react'

import { appProps_T } from '&interop-types/app-props'
import renderToStringAsync from '@core:utils/async-render-to-string/v1/util'

import App from './App'

async function render( RequestData: appProps_T ) {
    const html = await renderToStringAsync(
        <StrictMode>
            <App 
                ssrPath={RequestData.url} 
                ssrProps={RequestData.context}
            />
        </StrictMode>
    )
    return { html }
}

export {
    render
}