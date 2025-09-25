[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# In Production

## ⚠️ Do not Expose the Server to External Traffic

Currently nothing restricts the access to a running Paon template server, 
so it should be only reachable locally by the application in charge of handling user requests and not be exposed to the external network.

The [server setting](/documentation/references/config-files.md#server-config) `"accessibleFromExterior"` is only meant to be used 
if the service is running in a container or to expose it in a private network.

## Serving static assets

⚠️ The Paon server does not handle static assets in production.

### Serving Assets from the Same Machine 

The easiest way to handle assets is to use the web server or reverse proxy that sits in front of the backend application and make it serve the content of `dist/client/assets/` under the `/assets/` path for any website.


### Serving Assets from a Different Source

If we want to serve assets from a different origin, under a different url or through a CDN, we need to modify the `assetsBaseUrl` in the [site config file](/documentation/references/config-files.md#site-config) and set the base url you want to serve our assets from.

```JSON5
"assetsBaseUrl" : "https://my-assets.com/my-site/"
```

Then, run a build command on the site's ressources, to generates bundled ressources that use the new asset paths.

```bash
npm run site:build my-site
```

ℹ️ Even with a modified asset base url, all asssets paths will start with `"/assets/"`\
ex : `https://my-assets.com/my-site/assets/js/index.js`
