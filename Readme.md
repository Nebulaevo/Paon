🏗️ README IN CONSTRUCTION PLEASE DON'T JUDGE 🔧

# 🦚 Paon Template Server
**Easily integrate a moderne JavaScript frontend in an classical MVC architecture**

- 🌌 Built to handle multiple sites
- ⚛️ Pre-configured for React + Typescript
- ⚡ Assets are bunlded and optimised with Vite
- 🏗️ SSR or CSR rendering, per request, out of the box
- 🔧 Dev tools to kick start a project
- 🧩 Developped as a plug and play, framework agnostic, template engine.

Paon template server aims at seperating the frontend and the backend logic.
It's a service handling the frontend part of multiple web applications, exposing an API serving website pages, effectively replacing the tempate engine in a classical MVC architecture.

It can be used in addition to any backend, and allows to have a local JavaScript environnement to use moderne frontend tools, without having to handle the whole request cycle using a JavaScript framework.

## Table of contents

### Getting started

- [1. Installation & setup](/documentation/getting-started/1-setup.md)
-  [2. Project structure](/documentation/getting-started/2-structure.md) 
-  [3. API: Page Requests](/documentation/getting-started/3-api.md) 

### References

- [Command line interface](/documentation/references/dev-scripts.md)
- [Routing](/documentation/references/routing.md)
- [Handling loading state with **\<LoadingStateProvider\/\>**](/documentation/references/loading-context.md)
- [Handling page head tags with **\<MetaHat\/\>**](/documentation/references/meta-hat.md)


## What is Paon ?

Paon is a Node.js based solution to build and self host web application UIs.

## Why use it ?

Paon is built primaraly to uncouple the frontend generation from the request handling cycle. 

If you would rather use a non-JavaScript backend to handle the request, database connections, caching...\
But still want to build a React frontend, with modern frontend tools, assets bundling and server side rendering, Paon is made for you.
