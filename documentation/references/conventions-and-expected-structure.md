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