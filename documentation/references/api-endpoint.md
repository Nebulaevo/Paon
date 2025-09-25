[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# API endpoints

The Paon server defines 2 endopoints for each registered site :
- one for Client Side Rendering
- one for Server Side Rendering

ℹ️ We will assume that the Paon server runs on the same server, on localhost, and listens on port 3000.

## API Response Format

For a 200 response, both endpoints return a JSON object with 2 keys:
- `"head"` - (string) HTML Fragment to include in the `<head>` of the document
- `"body"` - (string) HTML Fragment to include in the `<body>` of the document

```JSON5
{
    "head": "<meta charset='UTF-8'><link rel='icon'...",
    "body": "<div id='root'>...."
}
```

ℹ️ By returning fragments instead of the whole document we give more flexibility and control to the backend application over the final document returned to the client.

## Client Side Rendering Endpoint

```
GET http://localhost:3000/my-site-name/
```

By sending a **GET** request to `/my-site-name/` we get the document fragments for an empty application shell that will render any page of **my-site-name** on the client side.

ℹ️ The application shell can than be used to render any page, it's usefull to have it in cache, as it can be used to display error pages (see [Error status tag](/documentation/references/special-meta-tags.md#error-status)), or as backup.

## Server Side Rendering Endpoint

```
POST http://localhost:3000/my-site-name/
```

By sending a **POST** request to `/my-site-name/` we get the HTML fragments of a page, rendered with the context provided in the POST data.


### SSR POST Data Format

It's a key/value pair object with 2 keys:
- `url` : the url of the page we want to render
- `context` : a key/value pair object that will be provided to the page component as props.

```JSON5
{ // POST Data for SSR page request
    "url": "/my-page/?q=banana",
    "context": {
        "user": {
            "name": "Dracula",
            "age": 578
        }
    }
}
```

#### `context.meta` : Rendering Page Specific Head Tags

It is possible to include page specific head tags in the rendered head fragment, thanks to the special `"meta"` key in the context object.

The `"meta"` key is expected to contain an array of [head tag specifications](/documentation/ressources/meta-hat.md#tags-specifications).\
⚙️ Under the hood we will use it as a prop and render a [`<MetaHat/>`](/documentation/ressources/meta-hat.md) component.

**For coherence reasons :** Make also sure that the Page component uses the same `"meta"` prop to render a `<MetaHat/>` component at the page component root : see [MetaHat : get head tags from page props](/documentation/ressources/meta-hat.md#get-head-tags-from-page-props--propsmeta)


SSR POST Data Example :
```JSON5
{
    "url": "...",
    "context": {
        "...": "...",

        // this will generate meta tags in the 
        // rendered head fragment
        "meta": [
            { // Title tag spec
                "tagType": "TITLE",
                "content": "My Page Title"
            },
            { // Page description tag spec
                "tagType": "META",
                "name": "description",
                "content": "Description for my awesome page ...",
            },
        ]
    }
}
```

