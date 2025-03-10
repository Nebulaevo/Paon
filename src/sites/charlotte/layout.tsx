import { Link } from 'wouter'

type layoutProps_T = {
    children: React.ReactNode,
}

function Layout( props:layoutProps_T ) {
    console.log( 'rendering <Layout>' )
    return <>
        <Link href="/">Home</Link>
        <Link href="/other/">Other</Link>
        <Link href="/other/1/">Other 1</Link>
        <Link href="/failure/">Failure</Link>
        {/* <Link href="/paon/">Paon</Link> */}
        { props.children }
    </>
}

export default Layout