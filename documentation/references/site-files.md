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

HTML document used both as an entry point for bundling, 
and a base structure from which to extract content of body and head fragments.

Can be used to set static elements, in `<head>` or `<body>` (do not remove the default content of `<body>`).

ℹ️ For SSR, we replace the `<!--app-html-->` placeholder in `<body>` by the rendered React app :
```html
<div id="root"><!--app-html--></div>
<script type="module" src="./entry-client.tsx"></script>
```

## `app.tsx`

Defines the root `<App>` component of the React app.\
It imports global ressources and sets up the [Router](/documentation/ressources/router.md).

## `app.scss`

Stylesheet imported by the root `<App>` component : by default, this is where the base style for the application is defined.

## `site.config.json`

Configurations for this site, see [site config file](/documentation/references/config-files.md#site-config) for more informations.

## `layout.tsx`

Component rendering the application frame, surrounding the Routes component.

ℹ️ The Layout component must accept and render its children, as it is responsible for rendering the Routes component.

## `error.tsx`

Fallback component displayed if a Page component triggered an error.

ℹ️ See [error handling ressources](/documentation/ressources/error-handling.md) for more info


## `loader.tsx`

Component to be displayed on navigation loading

## `router.tsx`

File defining all the Router settings that are imported by the root `app.tsx` file to build the client side router.

### pages

Defines the paths available for the application



### loader options

Defines the behaviour of the loader component



### error boundary options

Defines the props used to set up the error boundaries around the Page components.\
(see [error handling ressources](/documentation/ressources/error-handling.md) for more information.)