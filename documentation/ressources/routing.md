[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources :

# Routing

## Router

The provided Router is an extended version of the [Wouter Router](https://github.com/molefrog/wouter), that have been modified to :
- Preform delayed route transition (pre-loading the route and fething data before triggering the navigation)
- Prevent duplicated history entries

### Router Props

#### `pages`

Array of key-value pair objects defining the routes of the application.

Expected structure for a "page" object :

| Key | Description |
| :-- | :-- |
| `path`<br>string | The path for which we want to render the component.<br>• `/segment/` normal segment<br>• `/:segment/` dynamic segment<br>• `/segment?/` optional segment<br>• `/app-*` wildcard to match anything<br><br>You can find more details about the expected path structure in [the Wouter Router doc](https://github.com/molefrog/wouter).<br>⚠️ Nested routes and regex paths are currently not supported |
| `propsFetcher`<br>(optional) function | Async function in charge of fetching a JSON object that will be given as props to the page component.<br>It should accept 2 arguments :<br>• `currentUrl` : a `RelativeUrl` instance representing current url ([see url-toolbox package doc](https://github.com/Nebulaevo/url-toolbox))<br>• `abortController` : an `AbortController` instance that have to be provided to the fetch call<br><br>✱ it's recomanded to use [fetchJsonData](/documentation/ressources/fetch-json-data.md) |
| `Component`<br>React Component<br><br>**OR**<br><br> `importComponent`<br>async import function| For the page component, we have two options.<br><br>• `Component` key :<br>To directly provide a react component (it will be included in the bundle for any page).<br><br>• `importComponent` key :<br>To provide an async import function in charge of importing the component when it's needed<br>ex: `() => import('./pages/hello/page.tsx')`<br><br>✱ If multiple paths use the same asynchronously imported component, they should all be using the same function instance (the instance is used to keep track of loaded components). |


Here's a basic example defining two routes, a lazy import function and a page props fetcher :
```jsx
import { fetchJsonData } from "@core:utils/fetch-json-data/v1/utils"

/** lazy imported components 
 * 
 * ⚠️ there should be only one function instance 
 * in charge of loading each lazy component.
 * If two paths display the same component 
 * they should both use the same function instance.
*/
const lazyLoaders = {
    HelloPage: () => import('./pages/hello/page.tsx')
}

/** props fetcher */
async function fetchPageProps(url, abortController) {
    // deriving API endpoint from current url
    url.searchParams.set('_data_', 'json')

    return fetchJsonData( url, {
            fetchJsonOpts: {
                abortController: abortController,
                cache: {
                    strategy: 'CACHE_FIRST',
                    maxAgeS: 60, // 1 min
                }
            }
        }
    )

}

/** routes declaration */
const pages = [
    {
        path: '/',   
        Component: HomePage,
        // props fetching function
        propsFetcher: fetchPageProps, 
    }, {
        // path with dynamic "name" segment
        path: 'hello/:name/',
        // asyc component import function
        importComponent: lazyLoaders.HelloPage,
        // no props fetcher 
        // -> so component doesn't expect any props
    }
]
```

#### `loaderOptions`

Defines routes loading behaviours.

ℹ️ Loaders are defined in two places around the page components :
1. At the routes level :\
    it is displayed by the router if a navigation exceeds a given duration.

2. As fallback in suspense boundaries:\
    It's a secondary loader, displayed if the page isn't ready at render time. 
    For example on initial load of a CSR fetching page (not preloaded).


| Key | Description |
| :-- | :-- |
| `Loader`<br>(optional) React Component | Loader component that will be  used (both for the suspense boundaries and on navigation) |
| `suspenseFallbackOpts`<br>(optional) options object | Options regarding the suspense fallback loader used for pages that are lazy loaded or fetches props<br><br>**Keys :**<br>• `deactivate` optional boolean.<br>If true, the loader component will not be given as fallback to the suspense boundaries. |
| `pagePreFetchOpts`<br>(optional) options object | Options regarding the loader displayed during client side navigation, during page pre-loading.<br><br>**Keys :**<br>• `displayLoader` optional boolean.<br>If false, the loader is not displayed when the loading state is activated by the timer.<br>• `hidePageOnLoad` optional boolean.<br>If false, the page component is not hidden when the loading state is activated by the timer.<br>• `timeoutMs` optional number (default 500ms).<br>Minimum page transition duration after which we trigger the loading state on client side navigation. |

see also : [loading state handling documentation](/documentation/ressources/loading-context.md)

#### `errorBoundaryOptions`

Props given to the error boundaries surrounding page components.

-- WAS "FALLBACK" REQUIRED ? --

## Link

## RelativeLink

