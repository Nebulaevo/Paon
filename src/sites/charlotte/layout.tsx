import Link from "@core:routing/v1/link"


type layoutProps_T = {
    children: React.ReactNode,
}

function Layout( props:layoutProps_T ) {
    console.log( 'rendering <Layout>' )

    return <>
        <Link href="/">Fetching: Home</Link><br/>
        <Link href="/?a=petit&q=gros">Fetching: Home a=petit&q=gros</Link><br/>
        <Link href="/?q=gros&a=petit">Fetching: Home q=gros&a=petit</Link><br/>
        <Link href="/other/">Fetching: Other</Link><br/>
        <Link href="/other/?a=petit&q=gros">Fetching: Other a=petit&q=gros</Link><br/>
        <Link href="/other/?q=gros&a=petit">Fetching: Other q=gros&a=petit</Link><br/>
        <Link href="/other/?q=gros#cul">Fetching: Other q=gros#cul</Link><br/>
        
        <Link href="/other/12/">Other With ID</Link><br/>
        <Link href="/other/12/?q=gros">Other With ID q=gros</Link><br/>
        <Link href="/failure/">Failure</Link><br/><br/>
        {/* <Link href="/paon/">Paon</Link> */}
        { props.children }
    </>
}

export default Layout