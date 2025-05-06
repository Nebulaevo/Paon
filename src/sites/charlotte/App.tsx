import Router, {type RouterProps_T} from '@core:routing/v1/router'
import Routes from '@core:routing/v1/routes'

import Layout from './layout.tsx'
import { pages, loaderOptions, errorBoundaryOptions } from './Router.tsx'

import './assets/css/index.css'
import './assets/css/fonts.css'
import './App.scss'

type baseAppProps = {
    ssrPath?: RouterProps_T['ssrPath'], 
    ssrProps?: RouterProps_T['ssrProps']
}

function App(props: baseAppProps) {
    return <Router
        pages={pages}
        loaderOptions={loaderOptions}
        errorBoundaryOptions={errorBoundaryOptions}
        {... props} // optional "ssrPath" & "ssrProps"
    >
        <Layout>
            <Routes/>
        </Layout>
    </Router>
}

export default App