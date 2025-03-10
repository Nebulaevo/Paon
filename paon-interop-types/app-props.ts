import { type Dict_T } from "sniffly"

/** Data structure expected by the root App component when rendering a page */
type appProps_T = {
    url: string,
    context: Dict_T<unknown>
}

export type {
    appProps_T
}