import { isDict } from "sniffly"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

const asyncSleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPageProps( url:string, abortController:AbortController ) {
    const { signal } = abortController

    console.log('[fetching] -- start')
    console.log(url)
    await asyncSleep(2000)
    const data = { name:"martin", age:`${Math.random()}`, url }

    if ( !isDict(data) ) {
        throw new ErrorStatus( '400' )
    }
    console.log('[fetching] -- end')

    if (signal.aborted) throw new Error('ABORTED')
    return data
}

export default fetchPageProps