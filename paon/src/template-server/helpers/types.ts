import type { TemplateFragments } from '#paon/template-server/data-models/template-fragments'


type siteRessources_T = {
    templateFragments: TemplateFragments, 
    ssrManifestFile: string | undefined,
    entryServerPath: string
}

type serverExectutionMode_T = 'DEV' | 'PREVIEW' | 'PROD'

export type {
    siteRessources_T,
    serverExectutionMode_T
}