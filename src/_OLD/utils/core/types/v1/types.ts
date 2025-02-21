/* non empty array 
<T> - type of items*/
type NonEmptyArray<T> = [T, ...T[]]
/* ex: const nums: NonEmptyArray<number> */

/* dict with string keys 
<T> - type of values */
type Dict_T<T> = { [key:string]: T }
/* ex: const colors: Dict_T<string> */

export type {
    NonEmptyArray,
    Dict_T
}