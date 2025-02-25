import type { ComponentType, FunctionComponent } from 'react'

import { isExecutedOnClient } from '@core:utils/execution-context/execution-context'


function asClientOnly<P extends object>( Component:ComponentType<P> ): FunctionComponent<P> {
    return function ClientComponent( props:P ) {
        return isExecutedOnClient() ? <Component {... props} /> : <></>
    }
}

export default asClientOnly