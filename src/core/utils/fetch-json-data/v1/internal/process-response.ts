import { parse as secureJsonParse } from 'secure-json-parse'

import type { validatorFunc_T } from './types'

/** Helper runing each validation function with the current data 
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

/** Helper converting the response body into json with `secure-json-parse.parse` 
 * 
 * (it will throw an error if json data is judged un-safe (proto or constructor poisoning) )
*/
async function _secureParseJsonResponse(response: Response) {
    return await response.text()
        .then( jsonString => {
            const data = secureJsonParse(jsonString, {
                protoAction: 'error', 
                constructorAction: 'error'
            })

            return data
        })
}

/** Helper converting Response body into json in a safe way, before running optionnal validators on the data 
 * 
 * @throws
 * - will raise an error if json parsing finds attempts at proto or constructor poisoning
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