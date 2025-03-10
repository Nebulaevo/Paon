import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './App'

const renderMode = document.querySelector<HTMLMetaElement>('meta[name="rendering-mode"]')?.content ?? 'CSR'

if ( renderMode === 'SSR' ) {
    hydrateRoot(
        document.getElementById('root') as HTMLElement,
        <StrictMode>
            <App/>
        </StrictMode>,
    )
} else {
    const root = createRoot( document.getElementById('root') as HTMLElement )
    root.render(
        <StrictMode>
            <App/>
        </StrictMode>
    )
}