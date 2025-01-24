

// process.exit mock helpers

/** string thrown as error to emulate behavior of 'process.exit' */
const PROCESS_EXIT_ERROR = 'process.exit'

/** Mock implementation of process.exit function
 * 
 * Replicates the behavior of exit 
 * by throwing an error to stop program execution.
 * 
 * use "asyncProcessExitCatcher" to wrap a function exectution in a try catch block
 * handling that error
 */
function processExitMockImplementation( 
        code: string | number | null | undefined 
): never {
    throw PROCESS_EXIT_ERROR
}


/** Wrapper for an async function to catch any potential "process.exit" error
 * 
 * @param func async function to be exectuted
 * 
 * @returns (promise) the result of the function, or undefined if "process.exit" is raised
 */
async function asyncProcessExitCatcher<F extends () => Promise<any>>( 
    func: F
): Promise<ReturnType<F> | undefined> {
    try {
        return await func() // cleaning core dist folder

    } catch(e) { 
        // handling mocked 'process.exit'
        // if any other exception is thrown, we throw it back
        if (e !== PROCESS_EXIT_ERROR) throw e
    }
}



export {
    processExitMockImplementation,
    asyncProcessExitCatcher
}