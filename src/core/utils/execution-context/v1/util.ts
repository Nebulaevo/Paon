
/** Returns True if it is called on the server side */
function isExecutedOnServer(): boolean {
    return !!import.meta.env.SSR
}

/** Returns True if it is called on the client side */
function isExecutedOnClient() {
    return !isExecutedOnServer()
}

export {
    isExecutedOnServer,
    isExecutedOnClient
}