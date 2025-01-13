

type templateFragments_T = {
    head: string,
    body: string
}

type siteRessources_T = {
    templateFragments: templateFragments_T, 
    ssrManifestFile: string | undefined,
    entryServerPath: string
}

type serverExectutionMode_T = 'DEV' | 'PREVIEW' | 'PROD'

export type {
    siteRessources_T,
    serverExectutionMode_T
}