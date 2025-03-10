import ErrorBoundary from '@core:components/error-boundary/v1/component'

import Layout from './layout.tsx'
import Routes from './Router.tsx'


import './assets/css/index.css'
import './assets/css/fonts.css'
import './App.scss'

// import PaonDefaultPage from '@components/paon-default-page/v1/component'

function App( ssrPageContext?: { [key:string]: any } ) {
    // return <PaonDefaultPage url={url} pageContext={pageContext} />
    console.log( 'rendering <App>' )
    return <>
        <Layout>
            <ErrorBoundary Fallback={() => <h1>Initial Error Page (have to disapear on navigation now)</h1>}>
                <Routes/>
            </ErrorBoundary>
            
        </Layout>
    </>
}

export default App