import { StrictMode } from 'react'

import { appProps_T } from '&interop-types/app-props'

import renderToStringAsync from '@core:utils/async-render-to-string/v1/util'
import { renderMetasToString } from '@core:components/meta-hat/v1/server-utils'

import App from './app'

async function render( requestData: appProps_T ) {
    const html = await renderToStringAsync(
        <StrictMode>
            <App 
                ssrPath={requestData.url} 
                ssrProps={requestData.context}
            />
        </StrictMode>
    )

    const head = renderMetasToString( requestData.context.meta as any )
    
    return { head, html }
}

export {
    render
}