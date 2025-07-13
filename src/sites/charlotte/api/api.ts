import {isDict, type Dict_T} from "sniffly"

import { RelativeURL } from "@core:utils/url/v1/utils"
import { fetchJsonData } from "@core:utils/fetch-json-data/v1/utils"


async function fetchApi( _currentUrl: RelativeURL, abortController:AbortController ) {
    
    // let id = Math.floor(Math.random()*100) +1

    return fetchJsonData<Dict_T<unknown>>(
        new RelativeURL('/api/'), 
        {
            fetchJsonOpts: {
                abortController: abortController,
                dataValidators: [ (data: unknown) => isDict(data) ],
                cache: {
                    strategy: 'CACHE_FIRST',
                    maxAgeS: 20,
                    // staleEntryMaxAgeS: 10,
                    // cacheRefreshCallback: (data:any) => { console.log('data refreshed'); console.log(data); } 
                }
            }
        }
    )
}

export { fetchApi }