
function Home( props: any ) {
    console.log('rendering <Home> with props:')
    console.log(JSON.stringify(props))

    console.log('pushing')
    if (props.tasks) props.tasks.push(1)

    return <>
        <h1>Home</h1>
        <p>You are at home.</p>
        <pre>
            { JSON.stringify(props ?? {}) }
        </pre>
    </>
}

export default Home