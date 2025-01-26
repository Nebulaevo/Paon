
function getSiteBuildCommand( siteName: string ) {
    const buildClientCommand = _getBuildClientCommand(siteName)
    const buildServerCommand = _getBuildServerCommand(siteName)
    return `${buildClientCommand} && ${buildServerCommand}`
}

function _getBuildClientCommand( siteName: string ) {
    return `vite build ./src/sites/${siteName} --config ./vite.config.ts --ssrManifest .vite/${siteName}/ssr-manifest.json --outDir ../../../dist/client`
}

function _getBuildServerCommand( siteName: string ) {
    return `vite build --ssr ./src/sites/${siteName}/entry-server.tsx --outDir dist/server/${siteName}`
}

export {
    getSiteBuildCommand
}