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

const data = await fetchJsonData(
    'https://some-site.com/api/?user=12'
)
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

Options regarding additional features:

#### 🟆 `timeoutS`

Maximum duration for a `fetchJsonData` call, before the operation is aborted.

- Type: number (between 2s and 5 min)
- Default: 15s
- Remark:
    - It's only applied to the `fetch` call, not to eventual cache lookups

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

// The internal fetch call will be aborted if it lasts more than 30s
const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            timeoutS: 30 // 30s
        }
    }
)
```

#### 🟆 `retries`

Maximum number of retries of the fetch operation, within the time limit.

- Type: Number (minimum 1)
- Default: 2
- Remarks: 
    - It's only applied to the `fetch` call, not to eventual cache lookups
    - Error status response like 400 or 500 will not trigger a retry

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

// Within a maximum duration of 30s, 
// we will attempt to fetch the data up to 3 times
const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            timeoutS: 30, // 30s
            retries: 3
        }
    }
)
```

#### 🟆 `abortController`

abortController instance allowing to cancel the operation from the exterior.

- Type: AbortController
- Remarks: 
    - If none is provided, an instance is created internally and attached to `fetch` calls (to enforce the max timeout).
    - The abort signal will always trigger and error and interrupt the operation, even if `fetchJsonData` was performing a cache lookup.

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const abortController = new AbortController()

// fetchJsonData will use the provided abortController
// instead of creating a dedicated one
const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            abortController: abortController
        }
    }
)
```

#### 🟆 `dataValidators`

Array of validator functions allowing to validate the data on every access.

- Type: Array of validator functions, which take the JSON data as argument, and return a boolean.
- Remarks: 
    - Validators are run both when the data is fetched from the network or retreived from the cache.
    - If one of the validator functions return `false` an error is thrown.

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

// fetchJsonData will throw an error if :
// the received data is an array with 5 elements
const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            dataValidators: [
                // Checks that the received data is an array with 5 elements
                (data) => Array.isArray(data) && data.length === 5,
            ]
        }
    }
)
```


#### 🟆 `cache`

Options object allowing to define a caching strategy.\
(available keys in the options object depends on the choosen strategy).

ℹ️ By default, if nothing is provided the strategy is `'CACHE_FIRST'` with a 1h cache entry lifetime.


**1. Cache First**

Checks the cache, then the network.

Keys:
- `strategy`: literal string - `"CACHE_FIRST"`
- `maxAgeS`: positive number (optional, default 1h)\
    Age limit before the entry is considered "stale"

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            cache: {
                strategy: "CACHE_FIRST",
                maxAgeS: 12*60*60 // 12h
            }
        }
    }
)
```

**2. Network First**

Checks the network, then the cache.

Keys:
- `strategy`: literal string - `"NETWORK_FIRST"`
- `maxAgeS`: positive number (optional, default 1h)\
    Age limit before the entry is considered "stale"

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            cache: {
                strategy: "NETWORK_FIRST",
                maxAgeS: 12*60*60 // 12h
            }
        }
    }
)
```

**3. Network Only**

Only checks the network, without updating the cache.

Keys:
- `strategy`: literal string - `"NETWORK_ONLY"`

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            cache: {
                strategy: "NETWORK_ONLY"
            }
        }
    }
)
```

**4. Stale While Revalidate**

Checks the cache, then the network.\
But when checking the cache, if the entry is "stale", and have been "stale" for less than `staleEntryMaxAgeS` we return it anyway, while updating the cache entry in the background.\
if a `cacheRefreshCallback` is provided it's called when the updated data is available.

Keys:
- `strategy`: literal string - `"NETWORK_FIRST"`
- `maxAgeS`: positive number (optional, default 1h)\
    Age limit before the entry is considered "stale"
- `staleEntryMaxAgeS`: positive number (optional, default 1 day)\
    Additionnal duration after a cache entry becomes "stale", for which we still return it (while updating the stored cache entry in the backgroud).
- `cacheRefreshCallback`: function (optional)\
    Callback function called once the data have been updated, if the returned data was "stale".

Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            cache: {
                strategy: "STALE_WHILE_REVALIDATE",
                maxAgeS: 12*60*60, // 12h,
                staleEntryMaxAgeS: 7*24*60*60, // 1 week
                cacheRefreshCallback: ( data ) => {
                    console.log('cache entry has been updated')
                }
            }
        }
    }
)
```

**5. Invalidate and Fetch**

Removes corresponding cache entry, fetches data from the network and updates the cache.

Keys:
- `strategy`: literal string - `"INVALIDATE_AND_FETCH"`


Example:
```js
import { fetchJsonData } from '@core:utils/fetch-json-data/v1/utils'

const data = await fetchJsonData(
    "https://some-site.com/api/?user=12",
    {
        fetchJsonOpts: {
            cache: {
                strategy: "INVALIDATE_AND_FETCH"
            }
        }
    }
)
```