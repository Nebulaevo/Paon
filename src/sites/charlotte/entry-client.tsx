import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'

import App from './App'

{ // we execute client rendering code in a block to prevent setting up globals
    
    const renderMode = document.querySelector<HTMLMetaElement>('meta[name="rendering-mode"]')?.content ?? 'CSR'

    const app = <StrictMode>
        <App/>
    </StrictMode>
    
    if (renderMode==='SSR') {
        hydrateRoot(
            document.getElementById('root') as HTMLElement,
            app,
        )
    } else {
        const root = createRoot( document.getElementById('root') as HTMLElement )
        root.render(app)
    }
}

