[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# Data Structures & Configs

## `requestData`

To request a server side rendered page, the Paon server expects to receive a `POST` request to an existing site endpoint.
`requestData` is the expected format for the `json` data provided by this POST request.

It is the argument provided to the [server-entry](/documentation/references/site-files.md#entry-servertsx) : `render` function to perform the server side rendering.

It's a key/value pair object with 2 keys:
- `url` : the url of the page we want to render
- `context` : a key/value pair object that will be provided to the page component as props.
    - `meta` :\
    Optional key, accepting a list of [head tags](/documentation/ressources/meta-hat.md#tags-specifications) to be included in the document `<head>` for that page (using [`<MetaHat/>`](/documentation/ressources/meta-hat.md)).


## Document fragments



- `head`

- ``

## `site.config.json`

