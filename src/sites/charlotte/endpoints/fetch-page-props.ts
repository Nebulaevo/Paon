import { isDict, type Dict_T } from "sniffly"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

const asyncSleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));


async function fetchPageProps( url:string, abortController:AbortController ) { // ajouter 'url' as arg

    console.log('fetching -- start')
    console.log(url)
    console.log(abortController)
    await asyncSleep(2000)
    const data = { name:"martin", age:"32" }

    if ( !isDict(data) ) {
        throw new ErrorStatus( '400' )
    }
    console.log('fetching -- end')
    return data
}

export default fetchPageProps