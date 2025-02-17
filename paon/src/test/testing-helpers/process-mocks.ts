/** mock helpers for process */

type processWithMockedArgv = typeof process & {
    _originalArgv?: string[]
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
function mockProcessArgv( argv: string[] ) {
    const p = process as processWithMockedArgv
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
function unmockProcessArgv() {
    const p = process as processWithMockedArgv
    if ( p && p._originalArgv ) {
        process.argv = p._originalArgv
        p._originalArgv = undefined
    }
}


export {
    mockProcessArgv,
    unmockProcessArgv
}