
function isExecutedOnServer(): boolean {
    return !!import.meta.env.SSR
}

function isExecutedOnClient() {
    return !isExecutedOnServer()
}

export {
    isExecutedOnServer,
    isExecutedOnClient
}