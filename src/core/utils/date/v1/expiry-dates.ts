import { isNumber } from "sniffly";

/** Returns a Date object set a provided amount of ms in the future (minimum 1ms)
 * to be used as an expiry date for something
 */
function getExpiryDate(validityTimeMs:number): Date {
    validityTimeMs = isNumber(validityTimeMs, {positive:true})
        ? validityTimeMs
        : 1
    return new Date(Date.now()+validityTimeMs)
}

/** Returns true when provided expiry date has passed */
function hasExpired(expiryDate:Date): boolean {
    return new Date()>=expiryDate
}

export {
    getExpiryDate,
    hasExpired
}