[🕮 Table of contents](/Readme.md)

### 🦚 Getting Started: 


# Build a Basic Backend for the Demo Site

We are going to see how to interact with the Paon server from a backend application.

For demonstration purposes, we are gonna build a simple backend that serves the demo site UI scaffolded when we created the `martin-music` site in the [installation & setup guide](/documentation/getting-started/1-setup.md).

## Sending a Requests to the Paon Server

Before getting started, let's see our options for rendering pages with the Paon server :

We can start a Paon server in dev mode by running :
```bash
npm run server:dev
```

By default, it will start a Paon server listening on `localhost:3000` (can be modified in [server config](/documentation/references/config-files.md#server-config)) 

### Site Endpoints

To request a page of the `martin-music` webiste from Paon, we need to send a request to the site's dedicated rendering endpoint (`/SITE_NAME/`) :

```
http://localhost:3000/martin-music/
```

ℹ️ The endpoint will return a `404`, if the given site name is not one of the registered sites.

The response for any page request is a JSON object with two keys:
- `head` (string) : HTML document fragment that should be inserted in the document's head
- `body` (string) : HTML document fragment that should be inserted in the document's body
 


#### Request the app's shell (CSR)

```
GET http://localhost:3000/martin-music/
```

By sending a `GET` request to the endpoint, we can get the app shell of the website.\
That app shell can be returned for any page, and will automaticallly render the according page client side.

The app shell can also be used to render error pages by including an `error-status` meta (see [error status meta tag](/documentation/references/special-meta-tags.md#error-status))

#### Render a Page for Given Context and URL (SSR)

```
POST http://localhost:3000/martin-music/
```

```json
// Post data example
{ 
    // url that should be rendered
    "url": "/", 
    // props that will be given to the page component
    "context": {
        "user": "john",
        "age": 34
    }
}
```
To request a server side rendered page, we need to send a `POST` request and provide as POST data a json object with two keys :
- `url` (string) : the url we want to render
- `context` (JSON object) : the props that will be provided to the page component.


⚠️ Page components that expects props can get them from 2 different sources. Either they are passed as SSR context, or provided by a `propsFetcher` request to an API endpoint.\
It's important that both methods return the same props, otherwise it can lead to inconsistent pages :\
A page initially rendered with SSR (getting props from SSR context) would be different from same page at the same URL, after client side navigation (rendered client side, and fetching its props).

## Serve the Demo Site Through a Backend App 

Ok, let's create a web backend application, using the technologies of your choice.\
(It should be on the same machine as the Paon server)

In that application, we are gonna need to define some routes/request handlers:

### Matching Page Routes

First of all, let's define the routes returning a page.

They should always match the routes defined in the `router.tsx` file of the site.

For our demo site, those routes are: 
- `/`
- `/hello/:name/` ( where **:name** is a dynamic url segment )

#### Home Page Route : `/`

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

Then insert the given head and body fragments in the corresponding sections in a HTML document and return the page.

#### Hello Page Route : `/hello/:name/`

The hello page, is going to be rendered client side.\
We can get the app shell by sending this request :
```
GET http://localhost:3000/martin-music/
```

Then insert the given head and body fragments in the corresponding sections in a HTML document and return the page.

### API Endpoint (Props Fetching for Home Component)

As our home page component expects props, it registers a `propsFetcher` function in `router.tsx`.

This function is attempting to fetch the props from an API endpoint at:
- `/api/`

So we need to add an `/api/` endpoint in our backend, that returns the props for our home page component (the value returned should be the same value as the one given to the home page component as context when doing SSR) :

```json
{
    "url" : "/",
    "context" : {
        "user": "John",
        "age": 34
    }
}
```

### Proxy Asset & Dev Server Requests

In `production` mode, the Paon server doesn't serve static assets.

But for convenience reasons, it does serve them in `dev` or `preview` modes.

For that reason, in dev mode, the backend server should accept requests :
- starting with `/assets/`
- starting with `/src/`
- starting with `/node_modules/`
- `/@react-refresh` (exact match)

and simply forward them to the Paon server and return its response.

Example :\
If we receive a request for `/src/assets/js/script.ts`
we should forward the request to `http://localhost:3000/src/js/script.ts` and return the response.


## Test the Result

If everything is set up correctly, the basic demo site should work.

There are some tests you can do to insure everything is working as expected :

1. Check that home page (`/`) is rendered server side on initial load, and that the props received by the page are the ones provided when sending the SSR request (you can display received props by clicking the "show props" button on the home page).

2. Check if client side navigation to home page (`/`) page works, and uses the props provided by the API (`/api/`)

3. Check that hello page (`/hello/you/`) is rendered client side on initial load, and that the dynamic part of the path works.

4. Check that filling the input and clicking on the arrow triggeres a client side navigation to the hello page for the given name.


<br/>

| [⬅️ Project Structure](/documentation/getting-started/2-structure.md) |  |
| :--- | ----: |