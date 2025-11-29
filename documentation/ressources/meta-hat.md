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

`<MetaHat />` takes a `"headTags"` prop expecting a list of key-value objects representing the desired head tags for the page.\
ℹ️ informations about the supported head tags and expected specifications are detailed in the [tags specifications section](#tags-specifications) below.

On the client side, it is recommanded to render a `MetaHat` component at the root of the `Page` component, so that it is mounted/unmonted at the same time as the page it depends on.

We recommand rendering only one instance of the `MetaHat` component at a time and handle head tags in a centralised way.\
If you need : it's totally possible to have multiple rendered instances of the components at once, but in this case all their tags will be added to head.\
If both instances render a title your document will have two titles (the last one rendered will be usually used).

### Using `meta` Prop for SSR Support

Even though it's possible to set the tags from a static or locally derived value, this solution will not include meta tags in the server side rendered head fragment, as the base `<MetaHat>` component is only rendered client side.

If we want to automatically include the metas when performing SSR follow that quick guide : [Provide Page Metas Through Props](/documentation/references/conventions-and-expected-structure.md#provide-page-metas-through-props).


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
- `data` (key-value object) - structured data

