import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './App'

const renderType = document.getElementById('rendering-mode')?.textContent ?? 'CSR'

if ( renderType === 'SSR' ) {
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