import {isDict, type Dict_T} from "sniffly"

import { RelativeURL } from "@core:utils/url/v1/utils"
import { fetchJsonData } from "@core:utils/fetch-json-data/v1/utils"


async function fetchApi( _currentUrl: RelativeURL, abortController:AbortController ) {

    const fetchUrl = new RelativeURL('/api/')
    
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