function getBuildClientCommand( siteName: string ) {
    return `vite build ./src/sites/${siteName} --config ./vite.config.ts --ssrManifest .vite/${siteName}/ssr-manifest.json --outDir ../../../dist/client`
}

function getBuildServerCommand( siteName: string ) {
    return `vite build --ssr ./src/sites/${siteName}/entry-server.tsx --outDir dist/server/${siteName}`
}

export {
    getBuildClientCommand,
    getBuildServerCommand
}