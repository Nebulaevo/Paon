🏗️ v0.10 - Current version is a proof of concept that still needs to be refined.

# 🦚 Paon Template Server
**A React.js Template Processor**

- ⚛️ Build frontends with React + Typescript
- 🏗️ API endpoints for SSR or CSR rendering, per request
- 🧩 Developed as a plug and play, framework agnostic solution to handle your frontend
- 🌌 Monorepo structure handling multiple sites from the same service
- ⚡ Asset optimisation & bundling with Vite
- 🔧 Command Line Interface to manage sites and server


## What is Paon ?

Paon is a solution for handling multiple sites frontend logic, to achieve that it:
- Provides tools for developement (dev server, hot module reload...)
- Bundles and optimises your code for production.
- Provides a server exposing an API endpoint allowing to request the app shell of a website for client side rendering, or to render a page server side with a provided context

It has been developed to play the role of a template engine in a classic MVC architecture.

*Example production structure graph*
![diagram](/documentation/img/Paon%20Infrastructure.png)

## Why use it ?
Paon is built primarily to decouple the frontend UI generation from the request handling cycle.

If you would rather use a non-JavaScript backend to handle the requests, database connections, caching...\
But still want to use a React frontend, with other modern frontend tools, assets bundling and server side rendering...\
Paon is made for you.



## Documentation

### Getting started

1. [Installation & setup](/documentation/getting-started/1-setup.md)
2. [Project structure](/documentation/getting-started/2-structure.md) 
3. [Build a basic backend for the demo site](/documentation/getting-started/3-demo-site-backend.md) 

### References

- [Command line interface](/documentation/references/cli.md)
- [Site files reference](/documentation/references/site-files.md)
- [JSON config files](/documentation/references/config-files.md)
- [API endpoints specifications](/documentation/references/api-endpoint.md)
- [Special meta tags](/documentation/references/special-meta-tags.md)
- [Conventions and expected structure](/documentation/references/conventions-and-expected-structure.md)
- [In production](/documentation/references/production.md)

### Ressources

- [Routing](/documentation/ressources/routing.md)
- [Extended URLs](/documentation/ressources/extended-urls.md)
- [Json data fetching](/documentation/ressources/fetch-json-data.md)
- [Handling loading state with `<LoadingStateProvider>`](/documentation/ressources/loading-context.md)
- [Hanlding errors with `<ErrorBoundary>` and `ErrorStatus`](/documentation/ressources/error-handling.md)
- [Handling page head tags with `<MetaHat>`](/documentation/ressources/meta-hat.md)

