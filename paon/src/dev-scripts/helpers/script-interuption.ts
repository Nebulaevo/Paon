/** Helper related to interupting script execution with Error */


class ScriptExecError extends Error {
    constructor( message: string ) {
        super( message )
        this.name = "ScriptExecError"
    }
}

class ScriptClosureRequest extends Error {
    constructor() {
        super( '' )
        this.name = "ScriptClosureRequest"
    }
}

function isScriptExecError( err:unknown ): err is ScriptExecError {
    return err instanceof ScriptExecError
}

function isScriptClosureRequest( err:unknown ): err is ScriptClosureRequest {
    return err instanceof ScriptClosureRequest
}

function interuptScript( kwargs: { message?:string, isError?:boolean }): never {
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