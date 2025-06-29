import { RelativeLink } from "@core:routing/v1/link"


type layoutProps_T = {
    children: React.ReactNode,
}

function Layout( props:layoutProps_T ) {
    console.log( 'rendering <Layout>' )

    return <>
        <RelativeLink href="/">Fetching: Home</RelativeLink><br/>
        <RelativeLink href="/?a=petit&q=gros">Fetching: Home a=petit&q=gros</RelativeLink><br/>
        <RelativeLink href="/?q=gros&a=petit">Fetching: Home q=gros&a=petit</RelativeLink><br/>
        
        <RelativeLink href="/other/">Fetching: Other</RelativeLink><br/>
        <RelativeLink href="/other/?a=petit&q=gros">Fetching: Other a=petit&q=gros</RelativeLink><br/>
        <RelativeLink href="/other/?q=gros&a=petit">Fetching: Other q=gros&a=petit</RelativeLink><br/>
        <RelativeLink href="/other/?q=gros#cul">Fetching: Other q=gros#cul</RelativeLink><br/>
        
        <RelativeLink href="/othér/12/">Othér With ID</RelativeLink><br/>
        <RelativeLink href="/othér/13/?q=gros">Othér With ID q=gros</RelativeLink><br/>
        <RelativeLink href="/failure/">Failure</RelativeLink><br/><br/>
        {/* <Link href="/paon/">Paon</Link> */}
        { props.children }
    </>
}

export default Layout