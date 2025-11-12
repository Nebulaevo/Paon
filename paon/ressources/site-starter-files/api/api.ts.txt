import {isDict, type Dict_T} from "sniffly"
import { RelativeUrl } from "url-toolbox"

import { fetchJsonData } from "@core:utils/fetch-json-data/v1/utils"


async function fetchApi( _currentUrl: RelativeUrl, abortController:AbortController ) {

    const fetchUrl = new RelativeUrl('/api/')
    
    return fetchJsonData<Dict_T<unknown>>(
        fetchUrl, 
        {
            fetchJsonOpts: {
                abortController: abortController,
                dataValidators: [ (data: unknown) => isDict(data) ],
                cache: {
                    strategy: 'CACHE_FIRST',
                    maxAgeS: 10, // 10s
                }
            }
        }
    )
}

export { fetchApi }