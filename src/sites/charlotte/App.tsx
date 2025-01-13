
import Routes from './Router.tsx'
import { Link } from 'wouter'

import './assets/css/index.css'
import './assets/css/fonts.css'
import './App.scss'

// import PaonDefaultPage from '@components/paon-default-page/v1/component'

function App( ssrPageContext?: { [key:string]: any } ) {
    // return <PaonDefaultPage url={url} pageContext={pageContext} />
    console.log( ssrPageContext )
    return <>
        <Link href="/">Home</Link>
        <Link href="/other/">Other</Link>
        <Routes/>
    </>
}

export default App