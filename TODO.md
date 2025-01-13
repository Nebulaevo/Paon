# Migration du code
- Migrer le code serveur et essayer de répliquer le fonctionnement du serveur express sur le nouveau koa
- Migrer les config pertinente (je pense a config.server.ts mais il y en a surement d'autres)
- Revérifier les trucs que j'ai modifié dans l'autre projet (configs etc..) pour les re modifier ici (en éspérant que ça casse rien)


## création des scripts
écrire un script js qui automatise les build / dev / preview par projet

(marche à suivre pour build - voir pour les serveur ça risque d'être plus chiant)

let nom_site: str = "MON-SITE"

//run (créer des dossier séparré par projets)
vite build --ssrManifest --outDir dist/${MON-SITE}/client
vite build --ssr src/sites/${MON-SITE}/entry-server.tsx --outDir dist/${MON-SITE}/server

(ajouter des arguments qui seront capturé par le script, pour ne build qu'un projet)


## Escaped strings
- "JSON" Escaping of URLs might break the urls -> verify it's "URL" escaped
- Handle "JSON" encoding for normal strings (html escape them rather ?)


## Read disscution with chatGPT again and implement safeguards for received data
https://chatgpt.com/c/671031bb-1b80-800b-994e-9aad059dd307

lire la doc de 
https://www.npmjs.com/package/serialize-javascript


# Remove temp code

## (template-requests.ts) await vite.transformIndexHtml(url, template)

`await vite.transformIndexHtml(url, templateFile)` have 'url' value fixed to '/' but is intended to receive the url from the query (the page that is being requested), have to be changed

## server on dev mode doesn't work -FAIT

fails to serve files from a relative source (`./entry-client.tsx`)

managed to make it work in dev mode by changing urls from
`./...` to `/src/sites/<SITE-NAME>/...`
but then the build operation fails...

maybe, modify the file when it is loaded in the dev server.
replacing ="./..." by ="src/sites/<SITE-NAME>/..." after opening the file...

# Correction

## initial props is now a script json tag

-> at shich level should it be imported ? 
need url at router level (but only for ssr) and pageContext is only needed at page level

(importing it too high might trigger unnecessary re-renders)

(maybe we split the data, send url only when server side rendering (giving it to entry-server function)
and include only pageContext as json in the page, then use the PageWrapper component to extract the data ?)

comment gérer la transmission des données sans imposer trop de structure pour l'outil ?

/!\ pour le rendu SSR je dois pouvoir faire descendre les data dans les composants...
-> faire un store ?

## modification of base files

Base files have been modified, we have to settle on definitive base files and save them to /paon/ressources/site-starter-files/...

# Support up to 2017 (ES6)

## ✅ Wouter problem

uses ES2020+ ?...
https://github.com/molefrog/wouter?tab=readme-ov-file
apparently need to transpile node modules.. so I'm gonna have to figure out how to do that. chatGPT might know ^^"

CHECKED - code is transpiled to ES6 successfully (same as the rest of the code)
