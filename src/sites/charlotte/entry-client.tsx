import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'

import { InitialPropsContextProvider } from '@core:hooks/use-intial-props/v1/context'

import App from './App'

const renderMode = document.querySelector<HTMLMetaElement>('meta[name="rendering-mode"]')?.content ?? 'CSR'

const getInitialPageProps = () => {
    const jsonString = document.getElementById('initial-page-props')?.textContent
    return jsonString
        ? JSON.parse(jsonString)
        : undefined
}

if ( renderMode === 'SSR' ) {
    hydrateRoot(
        document.getElementById('root') as HTMLElement,
        <StrictMode>
            <InitialPropsContextProvider initialPageProps={getInitialPageProps()}>
                <App/>
            </InitialPropsContextProvider>
        </StrictMode>,
    )
} else {
    const root = createRoot( document.getElementById('root') as HTMLElement )
    root.render(
        <StrictMode>
            <InitialPropsContextProvider initialPageProps={getInitialPageProps()}>
                <App/>
            </InitialPropsContextProvider>
        </StrictMode>
    )
}