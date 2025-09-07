🏗️ README IN CONSTRUCTION PLEASE DON'T JUDGE 🔧

# 🦚 Paon Template Server
**Easily integrate a React frontend in a classic MVC architecture**

- 🌌 Built to handle multiple sites
- ⚛️ Pre-configured for React + Typescript
- ⚡ Assets are bunlded and optimised with Vite
- 🏗️ SSR or CSR rendering, per request, out of the box
- 🔧 Dev tools to kick start a project
- 🧩 Developed as a plug and play, framework agnostic, template engine.

Paon template server aims at seperating the frontend and the backend logic.
It's a service handling the frontend part of multiple web applications, exposing an API serving website pages, effectively replacing the tempate engine in a classic MVC architecture.

It can be used in addition to any backend, and allows to have a local JavaScript environnement to use modern frontend tools, without having to handle the whole request cycle using a JavaScript framework.

The Paon Template Server is based on the [bluwy/create-vite-extra : template-ssr-react-ts ](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react-ts)

## Table of contents

### Getting started

- [1. Installation & setup](/documentation/getting-started/1-setup.md)
-  [2. Project structure](/documentation/getting-started/2-structure.md) 
-  [3. API : page requests](/documentation/getting-started/3-api.md) 
- [4. ]()
- [5. ]()

### Ressources

- [Handling loading state with `<LoadingStateProvider/>`](/documentation/ressources/loading-context.md)
- [Handling page head tags with `<MetaHat/>`](/documentation/ressources/meta-hat.md)
- [Router](/documentation/ressources/router.md)

### References

- [Command line interface](/documentation/references/cli.md)
- [Site files reference](/documentation/references/site-files.md)
- [Data structures & configs](/documentation/references/data-structures.md)
- [In production](/documentation/references/production.md)



## What is Paon ?

Paon is a Node.js based solution to build and self host web application UIs.

## Why use it ?

Paon is built primaraly to decouple the frontend UI generation from the request handling cycle. 

If you would rather use a non-JavaScript backend to handle the request, database connections, caching...\
But still want to use a React frontend, with modern frontend tools, assets bundling and server side rendering, Paon is made for you.
