# 🦚 Paon Template Server

Node server in charge of rendering a template.\
Providing an API POST endpoint, where it can receive template rendering queries.

- ⚛️ Preconfigured for React JS and Typescript
- 🏗️ SSR or CSR rendering, per request, out of the box
- 🗂️ One server can handle multiple sites
- 🔧 Includes easy dev tools to kick start a project
- 🛡️ configurable URL sanitization helper
- ⚡ Frontend bundled with Vite for fast developpement
- 🐨 Template requests handled by Koa server

## Building a site frontend

// TODO

## Query the Template server from your backend

### API endpoint specifications

When receiving a template rendering request from a backend, the API expects:
- a given URL structure
- a POST request, containing data with a given structure to be used as template context. 

#### Expected URL structure

In the API request, the URL is used to tell Paon which website we want to render a page for.\
( because it can contain frontends for different websites )\
So for a request to `localhost:3000/my-site/`, Paon will return the template corresponding to the `my-site` folder (in `src/sites/`)


#### POST Data structure

// todo


##### ⚙️ Where are the POST Data specs defined ?
The expected structure of the POST data received from the server are defined in multiple places:\
( src and paon folders because they shouldn't communicate )

- `/paon/src/_internal-interface/app-props.ts`\
- `/src/_internal-interface/app-props.ts`\

They both define the same `appProps_T` type,\
it describs the structure of the data returned by the `RequestData` object and that is ultimately given to the root App component.

