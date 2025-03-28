import asClientOnly from "@core:components/as-client-only/v1/wrapper"

function Other( props: any ) {
    console.log('rendering <Other> with props:')
    console.log(JSON.stringify(props))
    return <>
        <h1>Other</h1>
        <p>You are NOT at home.</p>
    </>
}

export default asClientOnly(Other)