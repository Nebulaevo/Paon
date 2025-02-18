/** mock helpers for process */

type processWithMockedArgv_T = typeof process & {
    _originalArgv?: string[]
}

type asyncFunc_T = () => Promise<void>


/** Executes async function with custom value for 'process.argv' */
function withMockedProcessArgv(kwargs: {asyncFunc: asyncFunc_T, argv:string[] }): asyncFunc_T {
    return async () => {
        try {
            _mockProcessArgv( kwargs.argv )
            await kwargs.asyncFunc()
        } catch (e) {
            _unmockProcessArgv()
            throw e
        }
        _unmockProcessArgv()
    }
}

/** Mocks value of `process.argv`
 * (replaces by given value)
 * 
 * Have to be "unmocked" by calling unmockProcessArgv()
 * 
 * @param argv (string[]) - value we want to give to process.argv
 * 
 * @example
 * mockProcessArgv( ['_', '_', 'arg1', 'arg2'] )
 * // ... Do tests ...
 * unmockProcessArgv()
 * // process is back to normal
 */
function _mockProcessArgv( argv: string[] ) {
    const p = process as processWithMockedArgv_T
    p._originalArgv = process.argv
    p.argv = argv
}

/** Unmocks `process.argv` value 
 * modified by mockProcessArgv
 * 
 * @example
 * mockProcessArgv( ['_', '_', 'arg1', 'arg2'] )
 * // ... Do tests ...
 * unmockProcessArgv()
 * // process is back to normal
 */
function _unmockProcessArgv() {
    const p = process as processWithMockedArgv_T
    if ( p && p._originalArgv ) {
        process.argv = p._originalArgv
        p._originalArgv = undefined
    }
}

export {
    withMockedProcessArgv
}