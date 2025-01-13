/** 🔗 Internal interface type 🔒
 * 
 * Type of the object returned by RequestData.appProps() and used as props for the root App component */
type appProps_T = {
    url: string, 
    pageContext: { [key:string]: unknown }
}

export type {
    appProps_T
}