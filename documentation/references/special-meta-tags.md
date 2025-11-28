[🕮 Table of contents](/Readme.md#documentation)

### 🦚 References : 

# Special Meta Tags

It's possible to insert specific tags in the initial HTML document to trigger specific effects.

## Initial Error Status

We can display an error on initial page load by inserting an `initial-error-status` meta in the document's `<head>`.

```html
<meta name="initial-error-status" content="404" />
```

⚙️ The [Router](/documentation/ressources/routing.md#router) will find this meta during initialisation, and render a component throwing an [ErrorStatus](/documentation/ressources/error-handling.md#errorstatus-class), triggering the error boundary that will display the error fallback.

ℹ️ The content of the meta will be provided as status for the [ErrorStatus](/documentation/ressources/error-handling.md#errorstatus-class) instance.


ℹ️ This can be used to easily return error pages from the backend application, by returnin a CSR shell with an `initial-error-stats` meta.

## Initial Page Props

It's possible to provide the initial page component directly with its props, to prevent an initial fetch.

During the first page component rendering, a utility class will check for a JSON script tag with a `initial-page-props` id.

If it exists the page will use that JSON object as props, otherwise it will use the provided fetcher.

⚙️ For SSR, the props used are always included in a `initial-page-props` script tag.

Example:
```html
<script type='application/json' id='initial-page-props'>
    {
        "name": "John",
        "age": 35
    }
</script>
```

⚠️ **Be careful when injecting data directly into the HTML, the given json object should be properly escaped.**


## Rendering Mode

A `rendering-mode` meta is inserted in the document's `<head>` automatically on page render.\
It's value is either `SSR` or `CSR` and allows the entry-client script to know if the application should be rendered or hydrated.

Example :
```html
<meta name='rendering-mode' content='SSR' />
```