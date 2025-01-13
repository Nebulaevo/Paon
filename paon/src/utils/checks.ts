/* Utility function performing checks on values */

import type { Dict_T, NonEmptyArray } from "#paon/utils/types"


// NON EMPTY CONTAINERS
function iterIsNotEmpty( iter:Array<unknown> | string ): boolean {
    return iter.length > 0
}

function dictIsNotEmpty( obj:Dict_T<unknown> ): boolean {
    return iterIsNotEmpty( Object.keys(obj) )
}


// OBJECT
function isObject( val: unknown ): val is Dict_T<unknown> {
    return typeof val === 'object' && !Array.isArray(val) && val !== null
}

function isNonEmptyObject( val: unknown ): val is Dict_T<unknown> {
    return isObject(val) && dictIsNotEmpty(val)
}

function isObjectWithKeys( val: unknown, keys: string[] ): val is Dict_T<unknown> {
    if ( isObject(val) ) {
        const valueKeys = Object.keys(val)
        return keys.every( key => valueKeys.includes(key) )
    }
    return false
}

// ARRAY
function isArray( val: unknown ): val is Array<unknown> {
    return Array.isArray(val)
}

function isNonEmptyArray( val: unknown ): val is NonEmptyArray<unknown> {
    return isArray(val) && iterIsNotEmpty(val)
}

// STRING
function isString( val: unknown ): val is string {
    return typeof val === 'string'
}

function isNonEmptyString( val: unknown ): val is string {
    return isString(val) && iterIsNotEmpty(val)
}

// NUMBER
function isNumber( val: unknown ): val is number {
    return typeof val === 'number' && !isNaN(val)
}

function isPositiveNumber( val:unknown ): val is number {
    return isNumber(val) && val > 0
}

// BOOLEAN
function isBool( val: unknown ): val is boolean {
    return typeof val === 'boolean'
}


export {
    iterIsNotEmpty,
    dictIsNotEmpty,
    
    isObject,
    isNonEmptyObject,
    isObjectWithKeys,
    
    isArray,
    isNonEmptyArray,
    
    isString,
    isNonEmptyString,
    
    isNumber,
    isPositiveNumber,
    
    isBool,
}