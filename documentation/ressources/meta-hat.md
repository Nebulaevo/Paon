[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Ressources :

# Component : `<MetaHat />`

Utility component allowing to insert page specific `<head>` tags : 
- `<title>`
- `<meta>`
- `<link>`
- `<script type='application/ld+json'>`.

All tags set by the component are reset if the list of tags changes or if if the component is unmounted.

ℹ️ `meta` and `link` tags uses the new React feature hoisting head tags automatically, whereas `title` and `json+ld` tags are hoisted manually.\
(`title` is supported by the new React feature but we sometimes need the tag to persiste after the component unmounts)

## How To Use

`<MetaHat />` takes a `"headTags"` prop expecting a list of key/value objects representing the desired head tags for the page.\
ℹ️ informations about the supported head tags and expected specifications are detailed in the [tas specification section](#tags-specifications) below.

On the client side, it is recommanded to render a `MetaHat` component at the root of the `Page` component, so that it is mounted/unmonted at the same time as the page it depends on.

We recommand rendering only one instance of the `MetaHat` component at a time and handle head tags in a centralised way.\
If you need : it's totally possible to have multiple rendered instances of the components at once, but in this case all their tags will be added to head.\
If both instances render a title your document will have two titles (the last one rendered will be usually used).


### Define Head Tags Locally : Static or Derived 

Meta tags can be determined locally, either statically or derived from received page props.

ℹ️ **Not compatible with SSR** : head tags defined locally or derived will be rendered only client side.

```jsx
import MetaHat from '@core:components/meta-hat/v1/component'


const staticHeadTag = [
    { // Title tag spec
        tagType: 'TITLE',
        content: 'My Page Title'
    },
    { // Page description tag spec
        tagType: 'META',
        name: 'description',
        content: 'Description for my awesome page ...',
    },

    ...

]

function MyPage(props) {
    ...

    return <>
        <MetaHat headTags={staticHeadTag} />

        ...
    
    </>
}
```

### Get Head Tags from Page Props : `props.meta`

If the page receives props, we should always use the `"meta"` key to pass on the page specific head tags.

ℹ️ **Compatible with SSR** : using a `"meta"` prop to pass on the head tags for the `MetaHat` component allows the server rendering function to automatically include those tags in the head fragment when performing SSR (see [SSR POST data](/documentation/references/api-endpoint.md#ssr-post-data-format)).

```jsx
import MetaHat from '@core:components/meta-hat/v1/component'

function MyPage(props) {
    ...

    return <>
        <MetaHat headTags={props.meta} />
        
        ...
    
    </>
}
```

## Tags specifications

`MetaHat` expects a list of tag specifications,
each being a key/value pair object.

Example:
```js
[
    { // Title tag spec
        tagType: 'TITLE',
        content: 'My Page Title'
    },
    { // Page description tag spec
        tagType: 'META',
        name: 'description',
        content: 'Description for my awesome page ...',
    },
    { // Canonical URL
        tagType: 'LINK',
        rel: 'canonical',
        href: 'https://my-site.com/page/',
    },
    ...

]
```

### Tag: `title` 

- `tagType` "TITLE"
- `content` (string) - the page title

### Tag: `meta`

- `tagType` "META"
- `name` (string) - html attribute
- `property` (string) - html attribute
- `charset` (string) - html attribute
- `itemprop` (string) - html attribute
- `content` (string) - html attribute

### Tag: `link`

- `tagType` "LINK"
- `rel` (string) - html attribute
- `href` (string) - html attribute (url will be escaped)
- `sizes` (string) - html attribute
- `media` (string) - html attribute
- `type` (string) - html attribute
- `as` (string) - html attribute
- `title` (string) - html attribute

### Tag: `script json+ld` (structured data)

- `tagType` "JSON_LD"
- `data` (hashmap) - structured data

