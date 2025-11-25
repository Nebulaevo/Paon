[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources : 

# Handling Errors

## `ErrorBoundary` Component

Classic React error boundary component with :
- Custom Fallback UI component
- Optionnal on error callback function


```jsx
import ErrorBoundary from '@core:components/error-boundary/v1/component'

// Fallback UI component
function ErrorUI({ error }) {
    return "Oops... Something went wrong !"
}

// Callback executed if an error is thrown in the sub tree
function handleError(error, errorInfo) {
    /* Do something ... */
}

function ParentComponent( props ) {

    ...

    return <>
        <ErrorBoundary
            Fallback={ ErrorUI }
            errorHandlingFunc={ handleError }
        >
            <ComponentA />
            <ComponentB />
        </ErrorBoundary>
    </>
}
```

### Prop: `Fallback`

Component to be displayed when the error boundary is triggered.

It can accept an `"error"` prop that will receive the thrown error.

```jsx
function ErrorUI({ error }) {
    console.error(error)
    return <div>"Oops... Something went wrong !"</div>
}
```

### Prop: `errorHandlingFunc` (Optionnal)

Function called when an error is thrown.

Will be given two arguments : 
- `error` : the error
- `errorInfo` : React.ErrorInfo

```jsx
function handleError(error, errorInfo) {
    // do something
}
```

## `ErrorStatus` Class

Custom Error class meant to represent an error states of the frontend application.

It has to be initialised with a short "status" string that could be either a http codes like `"404"`, `"500"`, or a custom codes such as `"OPERATION_FAILED"`, `"UNSAFE"` or `"403_CSRF"`
```js
import { ErrorStatus } from '@core:utils/error-status/v1/utils'

const err = new ErrorStatus("404")
err.status // "404"
throw err
```

This error status can then be handled in the the `ErrorBoundary` Fallback component to display a different UI depending on the nature of the error.

For example let's build a custom Error UI that displays a different text for "404" errors
```jsx
import { ErrorStatus } from '@core:utils/error-status/v1/utils'

function ErrorUI({ error }) {
    let title = 'Oops'
    let text = 'Unknown Error'

    if (error instanceof ErrorStatus) {
        switch (error.status) {
            case '404':
                title = '404'
                message = 'Not Found'
                break
        }
    }

    return <>
        <h1>{ title }</h1>
        <p>{ message }</p>
    </>

}
```