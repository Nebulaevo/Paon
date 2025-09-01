[🕮 Table of contents](/Readme.md)

### 🦚 Getting Started: 


## API: Page Requests

The demo starter site includes 2 pages:
- `/`
- `hello/:name/` (**name** being a url parameter)

Now, using the backend of your choice, create 2 routes matching the ones from the demonstration structure.\
(we will be requesting the pages UI from those request handlers)

ℹ️ The routes on the backend should always match the routes on the frontend

ℹ️ By default, the Paon server starts on port **3000** and is only accessible locally (localhost), if you need to change those settings, for example if you need the server to be exposed to outside traffic, modify the file: `paon/server.config.json`

### Requesting a Page

As Paon can handle multiple sites, to request a page we need to specify the site name.\
To render a page for **my-site-name** we will send a request to:\
`127.0.0.1:3000/my-site-name/`


#### Client Side Rendering

To request the app shell and let the client side render it, we need to send a `GET` request to the Paon server.

```
GET 127.0.0.1:3000/my-site-name/
```

ℹ️ The app shell can than be used to render any page, it's usefull to have it in cache, as it can be used to display error pages, or as backup.

#### Server Side Rendering

To request a rendered page, we will need to send a `POST` request providing the `url` that we want to render, and the `context` that should be given as prop for the page component.

```
POST 127.0.0.1:3000/my-site-name/
```

Request body (json) :
```json
{
    "url": "/",
    
    "context": {
        "user": {
            "name": "Dracula",
            "age": 875
        }
    } 
}
```

#### Rendered Page Response

The page response is a json object with 2 keys:
- `head`
- `body`

Receiving document fragment instead of a whole document gives us more control over the final document returned to the client (changing title or meta tags etc..), and including the UI is as simple as including the `head` fragment in the document's head, and the `body` fragment in the document's body.


<br/>

| [⬅️ Project Structure](/documentation/getting-started/2-structure.md) | [Next (todo) ➡️](/Readme.md) |
| :--- | ----: |