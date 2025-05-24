import {type ErrorFallbackComp_T} from '@core:components/error-boundary/v1/component'
import { ErrorStatus } from '@core:utils/error-status/v1/utils'


/** Default Error Fallback component */
const DefaultErrorFallback: ErrorFallbackComp_T = (props) => {
    const { error } = props ?? {}
    let title: string = 'Oops'
    let message: string = 'Something went wrong..'

    if (error instanceof ErrorStatus) {
        switch (error.status) {
            case '500':
                title = '500'
                message = 'Server Error'
                break

            case '404':
                title = '404'
                message = 'Not Found'
                break
            
            case '403':
                title = '403'
                message = 'Forbidden'
                break

            case '401':
                title = '401'
                message = 'Unauthorized'
                break
            
            case '400':
                title = '400'
                message = 'Bad Request'
                break
        }
    }

    return <>
        <h1>{ title }</h1>
        <p>{ message }</p>
    </>
}

export default DefaultErrorFallback