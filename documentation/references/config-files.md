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



## Site Config

📁 JSON file located in each [site folder](/documentation/references/site-files.md#siteconfigjson) at :\
`src/sites/my-site-name/site.config.json`

By default :

```JSON5
{
    "assetsBaseUrl": "/"
}
```