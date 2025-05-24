/** Helper related to interupting script execution with Error */

/**  */
type scriptInteruptionKwargs_T = {
    message?: string,
    isError?: boolean 
}

/** Custom error raised in case of invalid execution */
class ScriptExecError extends Error {
    constructor( message: string ) {
        super( message )
        this.name = "ScriptExecError"
    }
}

/** Custom error raised to close the script (does not mean there was an error) */
class ScriptClosureRequest extends Error {
    constructor() {
        super( '' )
        this.name = "ScriptClosureRequest"
    }
}

/** Returns true if object is an instance of `ScriptExecError` 
 * (means exception was raised beacause of script excecution error)
 * */
function isScriptExecError( err:unknown ): err is ScriptExecError {
    return err instanceof ScriptExecError
}

/** Returns true if object is an instance of `ScriptClosureRequest` 
 * (means exception was just raised to close the script)
 * */
function isScriptClosureRequest( err:unknown ): err is ScriptClosureRequest {
    return err instanceof ScriptClosureRequest
}

/** Raises a `ScriptClosureRequest` or `ScriptExecError` instance to interupt the script execution
 * 
 * @param kwargs.message (optional) the message we provide to the Error instance
 * 
 * @param kwargs.isError (optional, default=false) dictates if the Error is meant to crash or just interupt the script
 */
function interuptScript( kwargs: scriptInteruptionKwargs_T): never {
    const { message, isError=false } = kwargs

    if ( isError ){
        throw new ScriptExecError( message ? message : 'Forced script interuption' )
    } else {
        throw new ScriptClosureRequest()
    }
}


export {
    ScriptExecError,
    ScriptClosureRequest,
    isScriptExecError,
    isScriptClosureRequest,
    interuptScript
}