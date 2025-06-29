
const asyncSleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPageProps( url:string, abortController:AbortController ) {
    const { signal } = abortController

    console.log('[fetching] -- start')
    console.log(url)
    await asyncSleep(2000)
    const jsonString = JSON.stringify({ name:"martin", age:`${Math.random()}`, url })
    const response = new Response(jsonString)

    console.log('[fetching] -- end')

    if (signal.aborted) throw new Error('ABORTED')
    return response
}

export default fetchPageProps