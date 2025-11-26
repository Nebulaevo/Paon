import { parse as secureJsonParse } from 'secure-json-parse'

import type { validatorFunc_T } from './types'

/** Helper running each validation function with the current data 
 * and thowing a TypeError if one of them returns `false`
*/
function _runValidators(data:unknown, dataValidators: validatorFunc_T[]) {
    for (const validatorFunc of dataValidators) {
        const isValid = validatorFunc(data)
        if (!isValid) {
            throw new TypeError(`validation of fetched data failed: ${data}`)
        }
    }
}

/** Converting the response body into json with `secure-json-parse.parse` 
 * 
 * (it will remove any proto or constructor poisoning attempts from the resulting object)
 * 
 * (makes sure not to consume the original response's body stream)
*/
async function _secureParseJsonResponse(response: Response) {
    
    // we need to clone the response object 
    // to avoid consuming the original's body stream
    // (body stream can be used only once)
    return await response.clone().text()
        .then( jsonString => {
            const data = secureJsonParse(jsonString, {
                // we have set up fastify to remove dangerous keys in json data
                // instead of throwing an error.
                // to ensure coherence between frontend and backend data handling 
                // we do the same here
                protoAction: 'remove', 
                constructorAction: 'remove'
            })

            return data
        })
}

/** Helper converting Response body into json in a safe way, before running optionnal validators on the data 
 * 
 * @throws
 * - will raise an error if json parsing fails (invalid json string)
 * - will raise an error if one of the optionnally provided validators returns `false`
*/
async function processReponse<DataType_T>(
    response: Response, 
    dataValidators: validatorFunc_T[]
): Promise<DataType_T> {

    const data: unknown = await _secureParseJsonResponse(response)
    _runValidators(data, dataValidators)
    
    return data as DataType_T
}

export {
    processReponse
}