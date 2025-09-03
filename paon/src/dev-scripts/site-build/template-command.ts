
type buildCommandBuildingKwargs_T = {
    siteName: string,
    assetsBaseUrl: string,
}

/** uses provided site name to fill the build commands templates */
function getSiteBuildCommand(kwargs: buildCommandBuildingKwargs_T) {
    const buildClientCommand = _getBuildClientCommand(kwargs)
    const buildServerCommand = _getBuildServerCommand(kwargs)
    return `${buildClientCommand} && ${buildServerCommand}`
}

function _getBuildClientCommand({siteName, assetsBaseUrl}: buildCommandBuildingKwargs_T) {

    const configOpts = "--config ./vite.config.ts"
    const ssrManifestOpts = `--ssrManifest .vite/${siteName}/ssr-manifest.json`
    const outDirOpts = "--outDir ../../../dist/client"
    const assetsBaseUrlOpts = `--base ${assetsBaseUrl}`
    
    const command = `vite build ./src/sites/${siteName} ${configOpts} ${ssrManifestOpts} ${outDirOpts} ${assetsBaseUrlOpts}`
    return command

    // return `vite build ./src/sites/${siteName} --config ./vite.config.ts --ssrManifest .vite/${siteName}/ssr-manifest.json --outDir ../../../dist/client`
}

function _getBuildServerCommand({siteName, assetsBaseUrl}: buildCommandBuildingKwargs_T) {
    
    const outDirOpts = `--outDir dist/server/${siteName}`
    const assetsBaseUrlOpts = `--base ${assetsBaseUrl}`

    const command = `vite build --ssr ./src/sites/${siteName}/entry-server.tsx ${outDirOpts} ${assetsBaseUrlOpts}`
    return command

    // return `vite build --ssr ./src/sites/${siteName}/entry-server.tsx --outDir dist/server/${siteName}`
}

export {
    getSiteBuildCommand
}