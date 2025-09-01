<style>table {width: 100%;}</style>

[**🕮 Table of contents**](/Readme.md)

### 🦚 References: 

# Context: Loading State

Multiple hooks and components allowing to handle a local loading state.

## Context provider: `LoadingStateProvider`

Provides a loading state to a sub section of the components tree.

It expects a default loader component, that will be returned by default by the related hooks and components in its sub-tree.

ℹ️ loading state getters and setters are stored in seperate contexts to prevent components using only setters to be re-rendered on loading state changes


```jsx
import { LoadingStateProvider } from "@core:hooks/use-loading-state/v1/hook"

function DefaultLoader() {
    return "Loading something ..."
}

function MyComponent(props) {

    ...

    return <>
        <LoadingStateProvider DefaultLoader={DefaultLoader}>
            ...
        </LoadingStateProvider>
        
        ...
        
    </>
}

```


## Hooks

### `useLoadingState`

ℹ️ Will cause component re-render on loading state change

```jsx
import { useLoadingState } from "@core:hooks/use-loading-state/v1/hook"

function MyComponent(props) {

    const { 
        isLoading, // boolean
        DefaultLoader // default component to be rendered on loading
    } = useLoadingState()

    ...
}
```

### `useLoadingSetters`

ℹ️ Will **NOT** cause component re-render on loading state change

```jsx
import { useLoadingSetters } from "@core:hooks/use-loading-state/v1/hook"

function MyComponent(props) {

    const { 
        activateLoading, // function activating loading state
        deactivateLoading // function deactivating loading state
    } = useLoadingSetters()
    
    const handleClick = () => {
        activateLoading()
    }

    ...
}
```

## Utility components

### `SynchronizedLoader`

Component that displays a loader if the loading state is active.

Accepts a custom loader, if not provided, will use the default one from the context.

ℹ️ Will **NOT** cause component re-render on loading state change

```jsx
import { SynchronizedLoader } from "@core:hooks/use-loading-state/v1/hook"

function CustomLoader () {
    return 'Loading books ...'
}

function MyComponent(props) {

    ...

    return <>
        <SynchronizedLoader Loader={CustomLoader} />

        ...
    </>
}
```

### `HideOnLoading`

Component that doesn't render its children if the loading state is active.

ℹ️ Will **NOT** cause component re-render on loading state change

```jsx
import { HideOnLoading } from "@core:hooks/use-loading-state/v1/hook"

function CustomLoader () {
    return 'I am loading ...'
}

function MyComponent(props) {

    ...

    return <>
        <HideOnLoading>
            {/* children nodes will be rendered only when isLoading is false */}
            
            ...

        </HideOnLoading>

        ...
    </>
}
```