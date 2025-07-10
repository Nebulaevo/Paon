import {isDict, type Dict_T} from "sniffly"

import { AbsoluteURL, type RelativeURL } from "@core:utils/url/v1/utils"
import { fetchJsonData } from "@core:utils/fetch-json-data/v1/utils"


async function fetchPost( _currentUrl: RelativeURL, abortController:AbortController ) {
    
    // let id = Math.floor(Math.random()*100) +1

    return fetchJsonData<Dict_T<unknown>>(
        new AbsoluteURL(`https://jsonplaceholder.typicode.com/posts/48`), 
        {
            fetchJsonOpts: {
                abortController: abortController,
                dataValidators: [ (data: unknown) => isDict(data) ],
            }
        }
    )
}

export { fetchPost }