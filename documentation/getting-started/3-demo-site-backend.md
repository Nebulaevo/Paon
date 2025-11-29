[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Getting Started: 


# Build a Basic Backend for the Demo Site

We are going to see how to interact with the Paon server from a backend application.

For demonstration purposes, we are going to build a simple backend that serves the demo site UI which was scaffolded when we created the `martin-music` site in the [installation & setup guide](/documentation/getting-started/1-setup.md).

## Sending a Requests to the Paon Server

Before getting started, let's see our options for rendering pages with the Paon server :

We can start a Paon server in dev mode by running :
```bash
npm run server:dev
```

By default, it will start a Paon server listening on `localhost:3000` (can be modified in [server config](/documentation/references/config-files.md#server-config)) 

### API Endpoints

📄 Read [API endpoints documentation](/documentation/references/api-endpoint.md)

As the name given to our current site was `martin-music`, the endpoints will be at :
```
http://localhost:3000/martin-music/
```

## Serve the Demo Site Through a Backend App 

Ok, let's create a web backend application, using the technologies of your choice\
(It should be on the same machine as the Paon server).

In that application, we are going to need to define some routes/request handlers:

### Matching Page Routes

First of all, let's define the routes returning a page.

They should always match the routes defined in the `router.tsx` file of the site.

For our demo site, those routes are: 
- `/`
- `/hello/:name/` ( where **:name** is a dynamic url segment )

#### 🟆 Home Page Route : `/`

For this demo app, we will choose to render the home page server side.\
We can request a rendered page by sending this request :
```
POST http://localhost:3000/martin-music/
```

And providing the following post data :

```json
{
    "url" : "/",
    "context" : {
        "user": "John",
        "age": 34
    }
}
```

Then insert the head and body fragments received in the corresponding sections in a HTML document and return the page.

#### 🟆 Hello Page Route : `/hello/:name/`

The hello page is going to be rendered client side.\
We can get the app shell by sending this request :
```
GET http://localhost:3000/martin-music/
```

Then insert the given head and body fragments in the corresponding sections in a HTML document and return the page.

### API Endpoint (Props Fetching for Home Component)

As our home page component expects props, it registers a `propsFetcher` function in `router.tsx`.

This function is attempting to fetch the props from an API endpoint at:
- `/api/`

So we need to add an `/api/` endpoint in our backend, that returns the props for our home page component.
```json
{
    "url" : "/",
    "context" : {
        "user": "John",
        "age": 34
    }
}
```

The value returned should be the same value as the one given to the home page component as context when doing SSR (see [page props coherence](/documentation/references/conventions-and-expected-structure.md#all-means-of-providing-page-props-should-be-cohenrent))


### Proxy Asset & Dev Server Requests

In `production` mode, the Paon server doesn't serve static assets (see [serving static assets in production](/documentation/references/production.md#serving-static-assets)).

But for convenience, it does serve them in `dev` or `preview` modes.

For that reason, in dev mode, the backend server should accept all requests :
- Starting with `/assets/`\
*\* used by PREVIEW server to fetch assets*

- Starting with `/src/`\
*\* used by DEV server to fetch assets*

- Starting with `/node_modules/`\
*\* used by DEV server to fetch dependencies*

- `/@react-refresh` (exact match)\
*\* used by DEV server for hot module reload*

And simply forward them to the Paon server and return its response.

Example :\
If our backend app receive a request for `/src/assets/js/script.ts`
we should forward the request to `http://localhost:3000/src/js/script.ts` and return the response.


## Test the Result

If everything is set up correctly, the basic demo site should work.

There are some tests you can do to ensure everything is working as expected :

1. Check that home page (`/`) is rendered server side on initial load, and that the props received by the page are the ones provided when sending the SSR request (you can display received props by clicking the "show props" button on the home page).

2. Check that filling the input and clicking on the arrow triggers a client side navigation to the hello page for the given name.

3. Check if client side navigation back to home page (`/`) works, and uses the props provided by the API endpoint at `/api/`.

4. Check that the hello page (`/hello/you/`) is rendered client side on initial load, and that the dynamic part of the path works.

5. Check the hot module reload by modify the component at:\
`/src/sites/martin-music/pages/hello/component.tsx`.

<br/>

| [⬅️ Project Structure](/documentation/getting-started/2-structure.md) | [Table of contents ➡️](/Readme.md#documentation) |
| :--- | ----: |