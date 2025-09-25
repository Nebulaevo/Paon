[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# JSON Config Files


## Server Config

📁 JSON file located at :\
`paon/server.config.json`

By default the Paon server listens on localhost:3000.

```JSON5
{
    "port": 3000,
    "allowExternalAccess": false
}
```

**`"port"`** : choose the port for the server

**`"allowExternalAccess"`** : listen only for internal traffic (127.0.0.1) or listen also for external traffic (0.0.0.0)

ℹ️ Check the [production guide](/documentation/references/production.md) for important security and deployment notes.

## Site Config

📁 JSON file located in each [site folder](/documentation/references/site-files.md#siteconfigjson) at :\
`src/sites/my-site-name/site.config.json`

By default :

```JSON5
{
    "assetsBaseUrl": "/"
}
```

**`"assetsBaseUrl"`** : url to be used as base for production asset urls for this website, it can be used to deploy assets to a CDN or another server (asset urls are constructed as : BASE_URL + "/assets/...")