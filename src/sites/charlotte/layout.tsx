import Link from "@core:components/link/v1/component"


type layoutProps_T = {
    children: React.ReactNode,
}

function Layout( props:layoutProps_T ) {
    console.log( 'rendering <Layout>' )
    return <>
        <Link href="/">Home</Link>
        <Link href="/other/">Other</Link>
        <Link href="/other/?q=gros">Other 1</Link>
        <Link href="/other/?q=gros#cul">Other 2</Link>
        <Link href="/failure/">Failure</Link>
        {/* <Link href="/paon/">Paon</Link> */}
        { props.children }
    </>
}

export default Layout