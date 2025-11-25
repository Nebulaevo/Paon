[🕮 Table of contents](/Readme.md#documentation)

### 🦚 References : 

# Conventions and Expected Structure

## All Means of Providing Page Props Should Be Cohenrent

When a page component accepts props, it can get it from  different sources:

- [SSR context](/documentation//references/api-endpoint.md#server-side-rendering-endpoint) : provided by the backend when requesting a server side rendered page.

- [initial props tag](/documentation/references/special-meta-tags.md#initial-props) : automatically added when performing SSR, can be included manually to avoid initial request at first page load.

- [propsFetcher](/documentation/ressources/routing.md) : By sending a request to an API (if a fetcher is provided for the loaded route.)

For a given page, all of those methods should return the same data at a given moment, otherwise it can lead to inconsistent pages.

Example:\
A page initially rendered with SSR (getting props from SSR context) would be different from same page at the same URL, after client side navigation (rendered client side, and fetching its props).

## propsFetcher Function

Any page component accepting props should define a `propsFetcher` function that will be in charge of fetching the component props from an API endpoint.

## Provide Page Metas Through Props

⚠️ This is the only way to include metas in both the SSR and CSR versions of your page.

To provide page metas (title, meta, link, json-ld) through props, you should :

1. Use the [reserved `meta` prop](/documentation/references/api-endpoint.md#ssr-post-data--special-contextmeta-key) to provide the tags.\
*\* Allows for metas to automatically be added to the head fragment when performing SSR (renders a `<MetaHat>` component)*

2. The tags should be provided as an array of [head tag specifications](/documentation/ressources/meta-hat.md#tags-specifications).\
*\* Allows for metas to automatically be added to the head fragment when performing SSR (renders a `<MetaHat>` component)*

3. The page component should render a [`<MetaHat>`](/documentation/ressources/meta-hat.md) component at its root.\
*\* It ensure coherence by rendering the same metas client side*

Here is an example page component
```jsx
import MetaHat from '@core:components/meta-hat/v1/component'

function MyPage( props ) {
    ...

    // gets headTags prop from props.meta
    // and renders a MetaHat tag at the root level of the component
    return <>
        <MetaHat headTags={props.meta} />
        
        ...
    
    </>
}
```

## Errors

To raise an error with a "meaning" we use [`ErrorStatus`](/documentation/ressources/error-handling.md#errorstatus-class).

Example:
```js
throw new ErrorStatus('404')
throw new ErrorStatus('OPERATION_FAILED')
...
```

This simplifies error handling in the error boundary fallback component by having a set amount of error "categories" :
- `"400"`
- `"401"`
- `"403"`
- `"404"`
- `"500"`
- `"OPERATION_FAILED"`
- ...

which can be handled in the error fallback as :

```js
import { ErrorStatus } from '@core:utils/error-status/v1/utils'

function ErrorFallback({error}) {
    let title = 'Oops'
    let message = 'Something went wrong..'

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
            
            case 'OPERATION_FAILED':
                title = 'Oops'
                message = 'Operation Failed'
                break
        }
    }

    return <div>
        <h1>{ title }</h1>
        <p>{ message }</p>
    </div>
}
```

⚠️ Error thrown outside of page components will not be captured by the error boundary (in the root layout for example)