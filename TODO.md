
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

## Mulitple `MetaHat` problem (or if tag list gets changed)

At first render time (and everytime the tags changes), the MetaHat component clears existing tags controlled by an instance of MetaHat.

**Problem is :**\
if an instance of metahat have already been rendered, and we render a second one.
It is gonna erase the tags of the first one, and probably cause errors because we would have deleted nodes react extects to extist.

- find a way & fix
    - singleton approche : after the first instance of MetaHat is rendered, all new instances just modify the list of tags of the singleton instance (context?) ?
        - will still need to remove that `_clearMetaTags()`
        - might be annoying, hooks can't be conditionnal
- fix documentation