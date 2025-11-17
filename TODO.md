
# Todo

## Restrict the access to the server with simple tokens

Currently there are no systems in place to filter traffic, making it risky to expose the server.
There should be at least a API token kind of auth mechanism preventing anyone from triggering a page render.

## Fetch Json Util - No Cache

Allow the cache (get / set) to be bypassed if the function has maxAge of 0.


## Dev server Site ressources

In the requests handlers in "DEV" mode, see if we can store the site ressources like for the "PROD" & "PREVIEW" mods,
and use `fs.watch` to update them when they change ? (cuz only reason we re-compute them per request is to have an up to date version)


## `viteServer.ssrLoadModule` is being deprecated in a next major (not too urgent)

Currently used in request handler for "DEV" server

## Cleanup & Refactoring

### Extract "Paon Core" to a seperate NPM package

including:
- Server
- CLI
- Core UI components ? (or include those as into structure ? -> clear devide front / back)

As well as a "setup" script allowing to schaffold the Paon structure (monorepo)


### Turning the Paon structure into a Monorepo ?

Turn Paon structure into a monorepo, where each site is a sub package : `workspaces: ['sites/*']` ?\
(means vite will need to be handled at the site level for each site, instead of globally like now)

```bash
dist/ # shared folder for build assets
    ∟server/ # server ressources
        ...
    ∟client/ # shared public assets
        ∟assets/ # shared public assets
            ...

src/ # dev assets
    ∟libs/ # ressources shared for all sites (include core ressources here ?)
        ...
    ∟sites/ # sub packages (workspaces)
        ∟siteA/
            package.json
            vite.config.ts # vite would need to be handled locally
            ...
        ∟siteB/
            package.json
            vite.config.ts # vite would need to be handled locally
            ...
    
```

[Grafikart : video on Workspaces](https://www.youtube.com/watch?v=DlNPdE2ZK30)

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

## Router Refactoring

### From context to zustand store ?

Using a zustand store, with setters defined outside of the store would probably simplify the current Router context Chaos.
[Grafikart : video on Zustand](https://www.youtube.com/watch?v=a1k_TgmKQ5M)

### Hoist Wouter Url params

Wouter's `useParams` hook, gets url params for dynamic routes from a context defined under the `Route` component.\
This means that dynamic url params are not accessible outside of the `Route` component (for example in the layout).

-> Use a root level context (or a store) to store the dynamic params, and use one of the page wrappers to call a setter.

-> make a custom `useParams` hook using that global store or context (because context used by Wouter's version isn't exported)


## Safe Json parsing

Align behaviour of safe json parsing everywhere.

currently server is set to 'remove' and fetchJsonData is set to 'error'. We might want to choose a side and stick to it ('remove' ?)