[🕮 Table of contents](/Readme.md)

### 🦚 Getting Started: 


# Build a Basic Backend for the Demo Site

We are going to see how to interact with the Paon server from a backend application.

For demonstration purposes, we are gonna build a simple backend that serves the demo site scaffolded when we created the `martin-music` site in the [installation & setup guide](/documentation/getting-started/1-setup.md).

Before we start, you will need to create a backend app using the technology or framework of your choice.

### Sending a Requests to the Paon Server

First of all, we need to start the Paon server (in dev mode) :
```bash
npm run server:dev
```

By default, the paon server listens on localhost at port 3000.\
As it can host the frontend logic of mulitple sites, we need to include the site name in the request:
```
127.0.0.1:3000/martin-music/
```

### Create Matching Routes

Routes defined in the frontend router should always match the routes defined on the backend application, for the demo site we have 2 routes:
- home: `/`
- hello: `/hello/:name/`\
    **:name** being a dynamic url segment



#### CSR rendering

let's choose to render the "hello" route using client side rendering.



#### SSR rendering

### Create an API endpoint


### Setup asset requests redirects for development

During production, the Paon server does not handle static assets, but for convenience it does serve them in "DEV" and "PREVIEW" mods.

We will need to set our backend up to forward the requests, and return the responses:

We will need to create rules on our backend application to redirect those requests directly to the Paon server for development:

| Path | Type | 
| :--- | :--- |
| `/assets/*` |  |
| `/src/*` | |
| `/node_modules/*` | |
| `/@vite/*` | |
| `/@react-refresh` | exact match |



<br/>

| [⬅️ Project Structure](/documentation/getting-started/2-structure.md) | [Next (todo) ➡️](/Readme.md) |
| :--- | ----: |