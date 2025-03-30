import { isDict } from "sniffly"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

const asyncSleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));


type cachedData_T = {
    expirationDate?: Date,
    data?: Promise<unknown> | unknown
}

const CACHE: {[url:string]: cachedData_T} = {}

async function _fetchPageProps( url:string, abortController:AbortController ) {
    const { signal } = abortController
    
    console.log('fetching -- start')
    console.log(url)
    await asyncSleep(2000)
    const data = { name:"martin", age:"32" }

    if ( !isDict(data) ) {
        throw new ErrorStatus( '400' )
    }
    console.log('fetching -- end')

    return data
}


function cachedPagePropsFetcher(url:string, abortController:AbortController): Promise<any> | any {
    
    const CACHE_TIME_S = 30

    const noCacheForUrl = !CACHE[url]
    const cacheExpired = CACHE[url] && (
        !CACHE[url]['expirationDate']
        || CACHE[url]['expirationDate'] <= new Date()
    )

    if (noCacheForUrl || cacheExpired){

        // need to remove cache data if fetch is aborted
        // otherwise will have invalid data stored in cache for the CACHE_TIME_S periode
        // (also how to clean event listeners...)

        CACHE[url] = {
            expirationDate: new Date(Date.now() + CACHE_TIME_S * 1000),
            data: _fetchPageProps(url, abortController)
                .catch(err =>{
                    // in case of error we want to prevent caching
                    // (includes fetch aborting signal use)
                    CACHE[url]['expirationDate'] = undefined

                    // and we re-throw the error 
                    // so it can be handled by the error boundary
                    throw err
                })
        }
    }

    return CACHE[url]['data']
}


export default cachedPagePropsFetcher