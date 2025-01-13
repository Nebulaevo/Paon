import { useState, useEffect, useMemo } from "react"



type fetchHookOptions_T = {
    // DO NOT CACHE IF AUTHENTICATED REQUEST !!!!!!
    type: 'authenticated',
    dataType: 'text' | 'json',
    cacheTimeMs: 0,
    swap: false
} | {
    type: 'cached',
    dataType: 'text' | 'json',
    cacheTimeMs: number,
    swap: boolean
}


// https://blog.openreplay.com/building-a-custom-fetch-hook-in-react/
function useFetch( url: string, hookOptions?:Partial<fetchHookOptions_T> ) {
    
    const options = _extractFetchHookOptions( hookOptions )

    const [isPending, setIsPending] = useState<boolean>(true)
    const [error, setError] = useState<any>(null)
    const [data, setData] = useState<null | any>(null)

    const resetState = () => {
        setIsPending(true)
        setError(null)
        setData(null)
    }

    useEffect(() => {
        
        const controller = new AbortController()

        const fetchData = async () => {
            resetState()
            
            try {
                const response = await fetch(
                    url,
                    { signal: controller.signal }
                )

                if (!response.ok) throw new Error(response.statusText)
                
                const data = options.dataType === 'json' ? await response.json() : response.text
                setData(data)
                
            } catch ( error ) {
                setError(error)
            }
            setIsPending(false)
        }
        fetchData()

        return () => {
            // cancel the request in the cleanup code
            // also - return a "cancelFetch" function 
            if ( isPending ) controller.abort()

        }
    }, [url])

    return { data, isPending, error }
}


function _extractFetchHookOptions( options?:Partial<fetchHookOptions_T> ): fetchHookOptions_T {
    // DO NOT CACHE IF AUTHENTICATED REQUEST !!!!!!
    return {
        dataType: options?.dataType ?? 'json',
        cacheTimeMs: options?.cacheTimeMs ?? 60000, // default 1min
        swap: typeof options?.swap == 'boolean' ? options.swap : false 
    }

}

// class RequestCache {
    
//     url:string

//     constructor( url: string ) {
//         this.url = url
//     }

//     get() {

//     }

//     set( data ) {
        
//     }
// }


export default useFetch

export type {
    fetchHookOptions_T
}