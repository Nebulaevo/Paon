[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources :

# Helpers

List of miscellaneous helpers (functions and components)

## `asClientOnly`

Function wrapping a component with another component to prevent it from being rendered server side.

⚙️ To prevent hydration errors, the rendering of the component is triggered by a useEffect. So the initial render is always empty, even on client side.

```js
import asClientOnly from '@core:components/as-client-only/v1/wrapper'

function MyComponent(){
    ...
}

// Can be used as a normal component:
// <ClientMyComponent {...props} ></ClientMyComponent>
const ClientMyComponent = asClientOnly(MyComponent)
```


## `ThrowError`

Utility component throwing an error on render.

It can take three props :
- `error` : Error\
    The error that will be thrown on render
- `clientOnly` : boolean (optional, default `false`)\
    if true the error will be only thrown when rendering the component client side.
- `serverOnly` : boolean (optional, default `false`)\
    if true the error will be only thrown when rendering the component server side.

```js
import ThrowError from '@core:components/throw-error/v1/component'
import { ErrorStatus } from "@core:utils/error-status/v1/utils"

function SomeComponent() {
    ...

    // This will throw a ErrorStatus '400' 
    // if rendered on the client side
    return <>
        <ThrowError 
            error={ new ErrorStatus('400') }
            clientOnly={ true }
        />

        ...        
    </>
}
```

## id generation

⚠️ Generated IDs are not meant for security purposes.

### `getSimpleRandomId`

Function generating a random ID.

```js
import { getSimpleRandomId } from "@core:utils/id/v1/utils"

getSimpleRandomId() // -> ID-d6todxpsx1l

getSimpleRandomId(2) // (2 sections) ID-fu7uu0imguz-3vwaqy4ubio
```

### `getUniqueSeqId`

Function returning a unique ID.

⚙️ Uses an incremented global counter to guarantee unique ids.

```js
import { getUniqueSeqId } from "@core:utils/id/v1/utils"
getUniqueSeqId() // -> SEQ-UID--1
getUniqueSeqId() // -> SEQ-UID--2
...
getUniqueSeqId() // -> SEQ-UID--5osk
```

## execution context (client / server)

Utility functions allowing to detect if the script is currently being executed on the client or on the server

```js
import { isExecutedOnServer, isExecutedOnClient } from "@core:utils/execution-context/v1/util"

if (isExecutedOnServer()) {
    // server side logic
} else if (isExecutedOnClient()) {
    // client side logic
}
```