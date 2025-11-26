[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources : 

# Fetch Json Data

Wrapper around `fetch` specialised in Json data fetching :
- Secure parsing of received JSON data (safely removes proto / constructor poisoning attempts)
- Custom data validation for every access (throws an error if data does not satisfy provided validators)
- Granular control over caching strategy per request, using the browser's Cache API.
- Custom number of retries and timeout duration per request

```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData('https://some-site.com/api/?user=12')
```

## Options



### `requestInit`

`RequestInit` options object provided to built-in `fetch`.

- The `signal` key is ignored, beacause it's automatically populated.\
(but we can provide a custom `AbortController` in the `fetchJsonOpts`)

- The `Accept` header is set to `'application/json'`

- By default, the value of `cache` is set to `'no-store'` (recommended, to prevent use of browser 'cache' as the caching is handled manually)

- By default, `redirect` is set to `'error'` (prevent fetch call from following redirects)



Example :
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

// sending a JSON request that follows redirects
const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        requestInit: {
            redirect: "follow"
        }
    }
)

```

### `fetchJsonOpts`

By default :
- A request has a timeout of 15s
- It allows two retries within the timeout duration.
- The caching strategy used is `'CACHE_FIRST'` with a 1h cache lifetime.

