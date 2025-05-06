
function Home( props: any ) {
    console.log('rendering <Home> with props:')
    console.log(JSON.stringify(props))
    return <>
        <h1>Home</h1>
        <p>You are at home.</p>
        <pre>
            { JSON.stringify(props ?? {}) }
        </pre>
    </>
}

export default Home