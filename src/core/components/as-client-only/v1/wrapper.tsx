import { useEffect, useState, type ComponentType, type FunctionComponent } from 'react'

import { isExecutedOnClient } from '@core:utils/execution-context/v1/util'

/** Wrapper returning a component that will ignore rendering if server-side */
function asClientOnly<P extends object>( Component:ComponentType<P> ): FunctionComponent<P> {
    return function ClientComponent( props:P ) {

        // dirty but we do not trigger a lot of re-renders
        // and it allows to avoid hydration errors
        // (otherwise rendered app is different between server and client)
        const [mounted, setMounted] = useState<Boolean>(false)
        useEffect(()=> {
            if (isExecutedOnClient()) setMounted(true)
        }, [])

        return mounted ? <Component {... props} /> : null
    }
}

export default asClientOnly