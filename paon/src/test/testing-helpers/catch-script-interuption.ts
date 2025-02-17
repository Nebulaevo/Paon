import { 
    isScriptClosureRequest, isScriptExecError, 
    type ScriptClosureRequest, type ScriptExecError 
} from '#paon/dev-scripts/helpers/script-interuption'


/** Wrapper for async script, catching and returning any interuption errors that could have been
 * raised by the script (ScriptClosureRequest or ScriptExecError) and returning it.
 * 
 * It is meant to allow tests to know what kind of closure was triggered by the script:
 * - **undefined**: Script has not been interupted
 * - **ScriptExecError** instance: Early closure because of an error
 * - **ScriptClosureRequest** instance: Early closure, no errors 
 */
async function interceptInteruptionErrors( 
    func: () => Promise<any>
): Promise<ScriptClosureRequest | ScriptExecError | undefined> {
    try {
        await func()
    } catch(e) { 
        if ( isScriptClosureRequest(e) || isScriptExecError(e) ) {
            // if script interuption exception was raised
            // we return it
            return e
        } else {
            // if other unexpected exception 
            // we throw it back
            throw e
        }
    }
    
    return undefined
}

export {
    interceptInteruptionErrors
}