[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources :

# Routing

## Router

The provided Router is an extended version of the [Wouter Router](https://github.com/molefrog/wouter), that have been modified to :
- Preform delayed route transition (pre-loading the route and fething data before triggering the navigation)
- Prevent duplicated history entries

### Router Props


#### `pages` prop

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

#### `loaderOptions` prop (optional)

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
| `suspenseFallbackOpts`<br>(optional) options object | Options regarding the suspense fallback loader used for pages that are lazy loaded or fetches props<br><br>**Keys :**<br>• `deactivate` optional boolean.<br>If true, suspense boundaries surrounding pages will not receive any fallback components. |
| `pagePreFetchOpts`<br>(optional) options object | Options regarding the loader displayed during page pre-loading on client side navigation.<br><br>**Keys :**<br>• `displayLoader` optional boolean.<br>If false, the loader is not displayed when the loading state is activated by the timer.<br>• `hidePageOnLoad` optional boolean.<br>If false, the page component is not hidden when the loading state is activated by the timer.<br>• `timeoutMs` optional number (default 500ms).<br>Minimum page transition duration after which we trigger the loading state on client side navigation. |

Loader options example :
```js
const loaderOptions = {
    // Loader component
    Loader: () => <div><p>Loading ...</p></div>,

    // We do not add the loader as fallback component 
    // in the page suspense boundaries
    suspenseFallbackOpts: {
        deactivate: true
    }

    // If navigation is longer than 800ms
    // we display the loader without hidding the previous page component
    pagePreFetchOpts: {
        displayLoader: true,
        hidePageOnLoad: false,
        timeoutMs: 800
    }
}
```
see also : [loading state handling documentation](/documentation/ressources/loading-context.md)

#### `errorBoundaryOptions` prop (optional)

Error Boundary component props, read [error boundary documentation](/documentation/ressources/error-handling.md#errorboundary-component) for more informations.

#### `ssrProps` and `ssrPath` props (optional)

- `ssrPath` : relative URL string of the page we want to render.

- `ssrProps` : key-value pair object that is provided as props to the page rendered for that path.

ℹ️ They are automatically provided to the root `App` component by the server when performing SSR, and the default provided `App` component forwards it to the `Router` component.


## Routes

Component rendering the matching page component for a given route.

It doesn't take any props, but must be rendered under a `Router` component (it consumes a context provided by `Router` to get available routes).

Included in the root `App` component by default.

Example :

```jsx
import Router, {type RouterProps_T} from '@core:routing/v1/router'
import Routes from '@core:routing/v1/routes'

...

function App(props) {
    return <Router
        pages={pages}
        loaderOptions={loaderOptions}
        errorBoundaryOptions={errorBoundaryOptions}
        {... props} // optional "ssrPath" & "ssrProps"
    >
        <Layout>
            <Routes/>
        </Layout>
    </Router>
}
```

## RelativeLink

Wrapper around [Wouter](https://github.com/molefrog/wouter)'s Link component for internal links.

- it forces any given URL to a relative URL
- adds different classes depending on the link state (active, broken ...)

It accept as props any HTML anchor tag attribute.\
And `href` is extended to accept values of type `string`, `URL`, [`Extended_URL`](https://github.com/Nebulaevo/url-toolbox) or `undefined` (will result in a default `'/'` url).

🛠️ internally, provided href is converted to a `RelativeUrl` instance.

ℹ️ if the parsing of the given href to a URL fails, the component returns the content of the link in a `<span>` instead of a `<a>` and a specific class is applied.

Example : 
```jsx
import { RelativeUrl } from "url-toolbox"
import { RelativeLink } from "@core:routing/v1/link"

function NavBar(props) {

    ...
    const articleUrl = new RelativeUrl(
        '/articles/1-my-title/'
    )

    return <>
        <RelativeLink
            href='/'
            className='home-page-link'
        >Home Page</RelativeLink>

        <RelativeLink
            href={articleUrl}
        >New Article</RelativeLink>
        
        ...
    </>
}
```

### State classes

Classes are added to the html anchor tag (or span if url is invalid) to reflect the status of the link:

| Class name | Description |
| :-- | :-- |
| `"link-active"` | Class applied if current page's URL pathname matches link's URL pathname<br><br>ℹ️ Ignores search & hash |
|`"link-partial-match"` | Class applied if current page's URL pathname start with link's URL pathname<br><br>ℹ️ Ignores search & hash |
|`"link-broken"` | Class applied if the provided url is invalid<br><br>ℹ️ For invalid URLs the tag produces is a `<span>` |
