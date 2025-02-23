import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


const rootPath = dirname( fileURLToPath( import.meta.url ) )

// https://vite.dev/config/
export default defineConfig({
    publicDir: false,
    plugins: [
        react()
    ],
    resolve: {
        alias: {
            "&internal-interface": resolve(rootPath, "./src/_internal-interface/"),

            "@core:components": resolve(rootPath, "./src/core/components/"),
            "@core:hooks": resolve(rootPath, "./src/core/hooks/"),
            "@core:utils": resolve(rootPath, "./src/core/utils/"),
            "@core:assets": resolve(rootPath, "./src/core/assets/"),

            "@components": resolve(rootPath, "./src/shared/components/"),
            "@hooks": resolve(rootPath, "./src/shared/hooks/"),
            "@utils": resolve(rootPath, "./src/shared/utils/"),
            "@assets": resolve(rootPath, "./src/shared/assets/"),

            "@sites": resolve(rootPath, "./src/shared/sites/"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler' // default used by vite is deprecated
            }
        } 
    },
    build: {
        /* Why assetsInlineLimit have to be 0 ?
        to prevent vite from tranforming svg urls to data uri
        data uri doesn't work with:
        <svg>
            <use href="path/to/svg#icon"></use>
        </svg>
        */
        
        emptyOutDir: false, // manually handling output dir beacause it conains multiple sites
        assetsInlineLimit: 0, // otherwise it breaks svg 
        outDir: './dist/client',
        target: 'ES2015',
        copyPublicDir: false, // we don't use the public dir so we disable it

        rollupOptions: {
            output: {
                assetFileNames: 'assets/[ext]/[name]-[hash:12][extname]',
                chunkFileNames: 'assets/js/chunks/[name]-[hash:12].js',
                entryFileNames: ( chunkInfo ) => {
                    /* this is called for both 'entry-server' and 'entry-client' 
                    and we want the client index to be in assets/js/...
                    and the server entry to be at root without hash (to find it easier)
                    */
                    if ( chunkInfo.name.match( /entry-server/ ) ) {
                        return '[name].js'
                    }
                    
                    return 'assets/js/[name]-[hash:12].js'
                }
            }
        }
    }
})
