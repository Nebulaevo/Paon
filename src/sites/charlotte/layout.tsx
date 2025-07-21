import NavBar from './components/navbar/component'

type layoutProps_T = {
    children: React.ReactNode,
}



function Layout(props: layoutProps_T) {
    console.log( 'rendering <Layout>' )

    return <>
        <NavBar/>
        { props.children }
    </>
}

export default Layout