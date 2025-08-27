# Core component: `<MetaHat />`

Utility component allowing to insert page specific `<head>` tags: 
- `<title>`
- `<meta>`
- `<link>`
- `<script type='application/ld+json'>`.

All tags set by the component are reset if the list of tags changes, if the component is unmounted or if any other `MetaHat` component is rendered.

ℹ️ `MetaHat` is built around the new React feature automatically hoisting `title`, `meta` and `link` tags. (only `json+ld` tags are hoisted manually)


## How To Use

`MetaHat` expects a list of hashmaps representing the desired head tags for the page\
(informations about the supported head tags and expected specifications are detailed below).

On the client side, it is recommanded to render a `MetaHat` component at the root of the `Page` component, so that it is mounted/unmonted at the same time as the page it depends on.

### A - Local Head Tags

Meta tags can be determined locally, either statically or derived from received page props.

```jsx
import MetaHat from '@core:components/meta-hat/v1/component'

// list of tags to be included for that page
const staticHeadTag = [
    { // title
        tagType: 'TITLE',
        content: 'My Page Title'
    },
    { // page description
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

### B - Head Tags From Page Props

Meta tags can be received as page props (from the backend server), in this case they should be in the "meta" key of the page context. 
This way they will automatically be added to the rendered head fragment when performing SSR (see server side rendering section).

```jsx
import MetaHat from '@core:components/meta-hat/v1/component'

function MyPage(props) {
    ...

    // trying to get head tags from page context
    const headTags = Array.isArray(props.meta) 
        ? props.meta
        : []

    return <>
        <MetaHat headTags={headTags} />
        
        ...
    
    </>
}
```

## Server Side Rendering

In the default `server-entry.tsx` provided:\
when server side rendering a page, if the given context for the page includes a "meta" key with a list of valid tag specifications, those tags will be added to the rendered head fragment. 

## Tags specifications

`MetaHat` expects a list of tag specifications.

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

