
# Todo

## Restrict the access to the server with simple tokens

Currently there are no systems in place to filter traffic, making it risky to expose the server.
There should be at least a API token kind of auth mechanism preventing anyone from triggering a page render.


## Links & EnhancedUrls

BUG: putting `"<h1>test</h1>"` in the demo site input and clicking the link returns a 404.

EXPLICATION:\
The `/` caracter is not getting escaped, and if we escape the dynamic segment with `encodeURIComponent` it, it is un-escaped by the `URL` object generation for some reason.


## Dev server Site ressources

In the requests handlers in "DEV" mode, see if we can store the site ressources like for the "PROD" & "PREVIEW" mods,
and use `fs.watch` to update them when they change ? (cuz only reason we re-compute them per request is to have an up to date version)


## `viteServer.ssrLoadModule` is being deprecated in a next major (not too urgent)

Currently used in request handler for "DEV" server

## NPM package

Turn Paon into an NPM package with a setup script

## null deps in hooks:

Check that I did not set dependency lists that could be undefined as:
```tsx
function useDefaultTitleSetter(deps?:React.DependencyList) {
    useEffect(() => {

        return () => {
            // cleanup
            if (!_hasTitleTag()) _createDefaultTitleTag()
        }
    }, deps ) // <= HERE deps can be undefined and it shouldn't
}
```


## Clean Types Mess

- Gather common types like props into namespaces

```tsx
function Input(props: Input.Props) {
  return <input {...props} />
}

namespace Input {
  export type Props = React.InputHTMLAttributes<HTMLInputElement>
}

export default Input
```

(remark : if Input comp is a const with an arrow function it will not work)