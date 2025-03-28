import Layout from './layout.tsx'
import Routes from './Router.tsx'


import './assets/css/index.css'
import './assets/css/fonts.css'
import './App.scss'

// import PaonDefaultPage from '@components/paon-default-page/v1/component'

function App() {
    // return <PaonDefaultPage url={url} pageContext={pageContext} />
    console.log( 'rendering <App>' )
    return <>
        <Layout>
            <Routes/>
        </Layout>
    </>
}

export default App