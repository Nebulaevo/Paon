import type { Dict_T } from "sniffly"
import type { RelativeUrl } from "url-toolbox"

import type { ErrorStatus } from "@core:utils/error-status/v1/utils"
import type { pagePropsGetterFunc_T } from '@core:routing/v1/hooks/use-router-settings/hook'

/** Props given to a page component */
type pageProps_T = Dict_T<unknown>

/** [ *Result-Status*, *Result-Value* ]\
 * tuple provided once the fetching promise is resolved 
*/
type propsFetchingResultTuple_T = [
    'SUCCESS', pageProps_T
] | [
    'ERROR', ErrorStatus
]

/** [ *Operation-State*, *Operation-Result* ]\
 * tuple that is returned by `getPageProps` function 
 * (exported by `usePageProps` context hook) 
*/
type propsFetchingOperationTuple_T = [
    'FETCHING', Promise<propsFetchingResultTuple_T>
] | [ 
    'READY', propsFetchingResultTuple_T 
]

type PagePropsContext_T = {
    getPageProps: (relativeUrl:string | RelativeUrl, fetcher:pagePropsGetterFunc_T) => propsFetchingOperationTuple_T,
    silentlyResetPageProps: () => void,
    abortPendingPagePropsRequest: () => void
}

type PagePropsProviderProps_T = {
    children: React.ReactNode,
    ssrProps?: pageProps_T | undefined
}

export type {
    pageProps_T,
    propsFetchingResultTuple_T,
    propsFetchingOperationTuple_T,
    PagePropsContext_T,
    PagePropsProviderProps_T
}