import { HELP_COMMAND } from '#paon/dev-scripts/helpers/help-command'
import { V } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js'

/** name triggering that script in package.json 'scripts' */
const SCRIPT_NAME = 'site:add'

/** documentation of the command */
const COMMAND_DOCUMENTATION = `
📄 ${SCRIPT_NAME} (doc)
-------------------------

>>> npm run ${SCRIPT_NAME}
 OR
>>> npm run ${SCRIPT_NAME} <SITE-NAME>
scaffolds a site folder in the ./src/sites directory.
- site name cannot point to a folder already existing in the ./src/sites folder
- site name can only be made of letters and numbers, separated by "-"
  ex: "my-project-7"
- site name cannot start or end with "-"
  ex: "-mysite" and "mysite-" are invalid
- only one "-" at the time is allowed
  ex: "my--site" is invalid

>>> npm run ${SCRIPT_NAME} ${HELP_COMMAND}
displays command documentation
`

/** folders to create when scaffoling a new site 
 * 
 * **rootFolders** - folders at the site's folder root at ./src/sites/<SITE-NAME>
 * 
 * **secondaryFolders** - other folders (created in a second time)
*/
const FOLDER_STRUCTURE = {
    rootFolders: [
        'api',
        'assets',
        'components',
        'hooks',
        'pages',
    ],
    secondaryFolders: [
        'assets/css',
        'assets/icons',
        'components/navbar',
        'components/props-table',
        'pages/hello',
        'pages/welcome'
    ]
}

/** infos on the files to copy when scaffolding a new site 
 * 
 * **path** (original path) - is relative to project root
 * 
 * **outputPath** (new path) - if relatvie to site root at ./src/sites/<SITE-NAME>
*/
const STARTER_FILES: { path: string, outputPath:string }[] = [
    // api sub folder
    {
        path: './paon/ressources/site-starter-files/api/api.ts.txt',
        outputPath: './api/api.ts',
    },

    // assets sub folder
    {
        path: './paon/ressources/site-starter-files/assets/css/fonts.css.txt',
        outputPath: './assets/css/fonts.css',
    },
    {
        path: './paon/ressources/site-starter-files/assets/icons/favicon.ico',
        outputPath: './assets/icons/favicon.ico',
    },
    {
        path: './paon/ressources/site-starter-files/assets/icons/favicon.png',
        outputPath: './assets/icons/favicon.png',
    },
    {
        path: './paon/ressources/site-starter-files/assets/icons/favicon.svg',
        outputPath: './assets/icons/favicon.svg',
    },
    {
        path: './paon/ressources/site-starter-files/assets/icons/peacock-feather.svg',
        outputPath: './assets/icons/peacock-feather.svg',
    },
    {
        path: './paon/ressources/site-starter-files/assets/icons/peacock.svg',
        outputPath: './assets/icons/peacock.svg',
    },
    
    // components sub folder
    {
        path: './paon/ressources/site-starter-files/components/navbar/component.tsx.txt',
        outputPath: './components/navbar/component.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/components/navbar/style.scss.txt',
        outputPath: './components/navbar/style.scss',
    },
    {
        path: './paon/ressources/site-starter-files/components/props-table/component.tsx.txt',
        outputPath: './components/props-table/component.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/components/props-table/style.scss.txt',
        outputPath: './components/props-table/style.scss',
    },

    // pages sub folder
    {
        path: './paon/ressources/site-starter-files/pages/hello/page.tsx.txt',
        outputPath: './pages/hello/page.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/pages/hello/style.scss.txt',
        outputPath: './pages/hello/style.scss',
    },
    {
        path: './paon/ressources/site-starter-files/pages/welcome/page.tsx.txt',
        outputPath: './pages/welcome/page.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/pages/welcome/style.scss.txt',
        outputPath: './pages/welcome/style.scss',
    },

    // folder root
    {
        path: './paon/ressources/site-starter-files/app.scss.txt',
        outputPath: './app.scss',
    },
    {
        path: './paon/ressources/site-starter-files/app.tsx.txt',
        outputPath: './app.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/entry-client.tsx.txt',
        outputPath: './entry-client.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/entry-server.tsx.txt',
        outputPath: './entry-server.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/error.tsx.txt',
        outputPath: './error.tsx',
    },{
        path: './paon/ressources/site-starter-files/index.html.txt',
        outputPath: './index.html',
    },
    {
        path: './paon/ressources/site-starter-files/layout.tsx.txt',
        outputPath: './layout.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/loader.tsx.txt',
        outputPath: './loader.tsx',
    },
    {
        path: './paon/ressources/site-starter-files/router.tsx.txt',
        outputPath: './router.tsx',
    },
]

export {
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION,
    FOLDER_STRUCTURE,
    STARTER_FILES,
}