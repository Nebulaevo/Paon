/** Helper related to interupting script execution with Error */


class ScriptExecError extends Error {
    constructor( message: string ) {
        super( message )
        this.name = "ScriptExecError"
    }
}

function isCustomExecError( err:unknown ): boolean {
    return err instanceof ScriptExecError
}

function interuptScript( message?:string ): never {
    message = message ? message : 'Forced script interuption'
    throw new ScriptExecError( message )
}


export {
    ScriptExecError,
    isCustomExecError,
    interuptScript
}