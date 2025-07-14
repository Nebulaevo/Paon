import { createContext, use, useCallback, useMemo, useRef } from "react"

import { RelativeURL } from "@core:utils/url/v1/utils"
import { isExecutedOnServer } from "@core:utils/execution-context/v1/util"
import { ErrorStatus } from "@core:utils/error-status/v1/utils"
import type { pagePropsGetterFunc_T } from '@core:routing/v1/hooks/use-router-settings/hook'

import { PropsHolder } from './internal/props-holder'
import type {
    propsFetchingOperationTuple_T,
    PagePropsContext_T,
    PagePropsProviderProps_T
} from './internal/types'

/** React context providing a unified way of getting props for the current page component
 * 
 * (data entries are hold in a private `ref` because that hook is not meant to trigger re-renders)
*/
const PagePropsContext = createContext<PagePropsContext_T>({
    getPageProps: (_relativeUrl:string | RelativeURL, _fetcher:pagePropsGetterFunc_T) => ['READY', ['SUCCESS', {}]],
    silentlyResetPageProps: () => {},
    abortPendingPagePropsRequest: () => {}
})

/** Hook exposing the `PagePropsContext`
 * 
 * ⚙️ This hook is mostly a wrapper around a "PropsHolder" object held in a `ref`
 * that implements the logic for fetching and handling the page props,
 * it allows to persiste data between different calls to the hook (like for pre-fetching),
 * prevent re-renders (as it is in a `ref`) and determines when data can be re-used 
 * (ownerUrlId, expiryDate...)
 * 
 * - `getPageProps()`:\
 * Callback in charge of providing page props.
 * It takes care of fetching, modifying, and providing page props for a url,
 * without causing re-renders (data is encapsulated in a `ref`).
 * It returns an `-operation-tuple-` that can have 2 states:
 *      - [ 'READY', `-result-tuple-` ]
 *      - [ 'FETCHING', Promise<`-result-tuple-`> ]\
 *      where `-result-tuple-` that can have 2 states:
 *          - [ 'SUCCESS', `{page-props...}` ]
 *          - [ 'ERROR', `ErrorStatus` ]
 * 
 * - `silentlyResetPageProps()`:\
 * Callback reseting the content of the current page props (in the `ref`)
 * 
 *  - `abortPendingPagePropsRequest()`:\
 * Callback triggering the abort signal linked to any page props fetching request
 * 
 * @returns [`getPageProps`, `silentlyResetPageProps`]
 */
function usePageProps() {
    return use(PagePropsContext)
}

/** Provider for the `PagePropsContext` */
function PagePropsProvider(props: PagePropsProviderProps_T) {
    const {children, ssrProps} = props

    const pagePropsRef = useRef<PropsHolder>(
        new PropsHolder(ssrProps)
    )

    const getPageProps = useCallback((relativeUrl:string | RelativeURL, fetcher:pagePropsGetterFunc_T): propsFetchingOperationTuple_T => { 
        const { current: propsHolder } = pagePropsRef
        
        // sanitizing and encoding url
        if (!(relativeUrl instanceof RelativeURL)) {
            try {
                relativeUrl = new RelativeURL(relativeUrl, {onPurifyFail:'ERROR'})
            } catch (err) {
                // if relativeUrl parsing fails we return an error response
                console.error(err)
                
                // we manually return expected tuple because 'current' object 
                // needs a 'owner' ID built from RelativeURL instance
                return ['READY', ['ERROR', new ErrorStatus(ErrorStatus.OPERATION_FAILED)]]
            }
        }

        if (isExecutedOnServer()) {
            // server side shouldn't trigger fetching or any caching behaviour here
            return ['READY', propsHolder.result]
        }

        // checking if the result is the one currently
        // available, or if we are still waiting for fetch to resolve
        if ( propsHolder.entryIsFresh && propsHolder.propsOwnerIs(relativeUrl) ) {

            // awaiting for fetching to resolve
            if (propsHolder.pendingPromise) return ['FETCHING', propsHolder.pendingPromise]
            // result is available
            else return ['READY', propsHolder.result]
        }

        // ---------- Fetching ----------
        // first we abort any eventual pending page props request
        abortPendingPagePropsRequest()
        const pendingPromise = propsHolder.sendPagePropsRequest({
            relativeUrl, fetcher
        })

        return ['FETCHING', pendingPromise]
        
    }, [])

    const silentlyResetPageProps = useCallback(
        () => pagePropsRef.current.reset(), []
    )

    const abortPendingPagePropsRequest = useCallback(
        () => pagePropsRef.current.abortPendingPagePropsRequest(), []
    )

    // we memoise the context's value
    const value = useMemo(() => {
        return {
            getPageProps,
            silentlyResetPageProps,
            abortPendingPagePropsRequest
        }
    }, [])

    return <PagePropsContext value={value}>
        { children }
    </PagePropsContext>
}

export {
    usePageProps,
    PagePropsProvider
}

export type { 
    PagePropsContext_T,
    PagePropsProviderProps_T,
}
