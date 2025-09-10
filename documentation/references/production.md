[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# In Production

## Do not Expose the Server to External Traffic

Currently nothing restricts the access to a running Paon template server, 
so it should be only reachable locally by the backend framework and not exposed to the network.

The server setting "accessibleFromExterior" is only meant to be used 
if the service is running in a container or is gonna only be exposed in a private network.

## Serving static assets

### Production Server does not Serve Static Assets

A proper server should handle requests to `/assets/` and serve the content of `dist/client/assets/`.

### Serving Assets from another server

If we want to serve the assets under another url, for example through a CDN or cloud storage, 