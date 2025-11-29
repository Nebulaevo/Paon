[🕮 Table of contents](/Readme.md#documentation)

### 🦚 References : 

# Site Files Reference

## `entry-client.tsx`

Script performing the rendering, or hydration of the app on the client side.

⚙️ The rendering mode is injected in a `"rendering-mode"` meta tag when generating the HTML document and is either `"CSR"` or `"SSR"`.

## `entry-server.tsx`

It exports a `render( requestData )` function performing the server side rendering of the application.

This function will be given as argument (`requestData`) the [POST data received with the SSR page request](/documentation/references/api-endpoint.md#ssr-post-data--format).

## `index.html`

HTML document used as the entry point to render the application (client & server side).

ℹ️ Any modifications to the content of the `head` or `body` sections will affect all generated pages for that website

ℹ️ Do not remove or modify the "root" tag in `body` (including the placeholder comment), or Paon won't be able to insert the app :
```html
<div id="root"><!--app-html--></div>
```

ℹ️ Make sure to always execute the "entry-client.tsx" script at the end of body to performe client side setup of the app :
```html
<script type="module" src="./entry-client.tsx"></script>
```

## `app.tsx`

Defines the root `<App>` component of the React app.\
setting up the [Router](/documentation/ressources/routing.md), the default site structure and importing global CSS

## `app.scss`

Stylesheet imported by the root `<App>` component : by default, this is where the base style for the application is defined.

## `site.config.json`

Configurations for this site, see [site config file](/documentation/references/config-files.md#site-config) for more informations.

## `layout.tsx`

Component rendering the application frame, surrounding the Routes component.

ℹ️ The Layout component must accept a children prop and render it (as it's responsible for rendering the Routes component).

## `error.tsx`

Fallback component displayed if a Page component triggered an error.

ℹ️ See [error handling ressources](/documentation/ressources/error-handling.md) for more info


## `loader.tsx`

Component to be displayed on navigation loading

## `router.tsx`

File defining all the Router settings.\
(imported in `app.tsx` file to setup the router component.)

ℹ️ See [Router documentation](/documentation/ressources/routing.md) for more details.

### pages

Defines the paths available for the application

### loaderOptions

Defines the loading behaviour on navigation

### errorBoundaryOptions

Defines the props used to set up the error boundaries around the Page components.