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

The `propsFetcher` function provided for a route is in charge of fetching the page props from an API for the current Page Component.

