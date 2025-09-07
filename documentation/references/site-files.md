[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# Site Files Reference

## `entry-client.tsx`

Script executed on the client triggering the client side rendering or the hydration of the app.

⚙️ The rendering mode is included in the html document in a `<meta>` called `"rendering-mode"`, its content is either `"CSR"` or `"SSR"`.

## `entry-server.tsx`

It exports a `render( requestData )` function used to render the component tree on the server.

This function is called with [`requestData`](/documentation/references/data-structures.md#requestdata) as argument.

## `index.html`

This HTML document is used as a base for the document fragments.


### head



### body



### For Server Side Rendering

We replace the `<!--app-html-->` placeholder with the rendered React app :
```html
<div id="root"><!--app-html--></div>
<script type="module" src="./entry-client.tsx"></script>
```

### For Client Side Rendering

We 

## `app.tsx`



## `app.scss`



## `site.config.json`



## `layout.tsx`



## `error.tsx`



## `loader.tsx`



## `router.tsx`

