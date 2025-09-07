🏗️ README IN CONSTRUCTION PLEASE DON'T JUDGE 🔧

# 🦚 Paon Template Server
**A template engine using a dedicated JS envionnement to develop, optimise, host and provide an endpoint to render your website's UI on demand**

- ⚛️ Pre-configured for React + Typescript
- 🏗️ SSR or CSR rendering, per request, out of the box
- 🧩 Developed as a plug and play, framework agnostic solution to handle your frontend
- 🌌 Handle multiple sites from the same service
- ⚡ Asset optimisation & bundling with Vite
- 🔧 Command Line Interface to manage sites and start server

*The Paon Template Server is based on the [bluwy/create-vite-extra : template-ssr-react-ts ](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react-ts)*


## What is Paon ?

At its core, Paon is a server that we can query to get the HTML code for a page.\
It has been developed to play the role of a template engine in a classic MVC architecture.

To achieve that it provides :
- a dedicated Node.js environnement to develop frontends with React and TypeScript
- assets optimisation & bundling
- a server exposing an API endpoint allowing to request the app shell of a website for client site rendering, or to render a page server side with the provided context

## Why use it ?

Paon is built primarily to decouple the frontend UI generation from the request handling cycle.

If you would rather use a non-JavaScript backend to handle the requests, database connections, caching...\
But still want to use a React frontend, with other modern frontend tools, assets bundling and server side rendering...\
Paon is made for you.



## Table of contents

### Getting started

- [1. Installation & setup](/documentation/getting-started/1-setup.md)
- [2. Project structure](/documentation/getting-started/2-structure.md) 
- [3. API : page requests](/documentation/getting-started/3-api.md) 
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
- [Special meta tags](/documentation/references/special-meta-tags.md)
- [In production](/documentation/references/production.md)
