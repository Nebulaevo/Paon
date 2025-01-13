import { HELP_COMMAND, getForMoreInfoText } from '#paon/dev-scripts/helpers/help-command'

/** name triggering that script in package.json 'scripts' */
const SCRIPT_NAME = 'site:add'

/** documentation of the command */
const COMMAND_DOCUMENTATION = `
📄 npm run ${SCRIPT_NAME} (help)
-------------------------

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

/** text explaining how to display the command documentation (used after some errors) */
const FOR_MORE_INFORMATION_TEXT = getForMoreInfoText(SCRIPT_NAME)

/** folders to create when scaffoling a new site 
 * 
 * **rootFolders** - folders at the site's folder root at ./src/sites/<SITE-NAME>
 * 
 * **secondaryFolders** - other folders (created in a second time)
*/
const FOLDER_STRUCTURE = {
    rootFolders: [
        'assets',
        'components',
        'hooks',
        'pages',
        'stores',
        'utils',
    ],
    secondaryFolders: [
        'assets/css',
        'assets/icons'
    ]
}

/** infos on the files to copy when scaffolding a new site 
 * 
 * **path** (original path) - is relative to project root
 * 
 * **outputPath** (new path) - if relatvie to site root at ./src/sites/<SITE-NAME>
*/
const STARTER_FILES: { path: string, outputPath:string }[] = [
    {
        path: './paon/ressources/site-starter-files/entry-server-tsx.txt',
        outputPath: './entry-server.tsx'
    }, {
        path: './paon/ressources/site-starter-files/entry-client-tsx.txt',
        outputPath: './entry-client.tsx'
    }, {
        path: './paon/ressources/site-starter-files/App-tsx.txt',
        outputPath: './App.tsx'
    }, {
        path: './paon/ressources/site-starter-files/App-scss.txt',
        outputPath: './App.scss'
    }, {
        path: './paon/ressources/site-starter-files/index-html.txt',
        outputPath: './index.html'
    }, {
        path: './paon/ressources/site-starter-files/index-css.txt',
        outputPath: './assets/css/index.css'
    }, {
        path: './paon/ressources/site-starter-files/fonts-css.txt',
        outputPath: './assets/css/fonts.css'
    }, {
        path: './paon/ressources/site-starter-files/favicon.svg',
        outputPath: './assets/icons/favicon.svg'
    }, {
        path: './paon/ressources/site-starter-files/favicon.png',
        outputPath: './assets/icons/favicon.png'
    }, {
        path: './paon/ressources/site-starter-files/favicon.ico',
        outputPath: './assets/icons/favicon.ico'
    },
]

export {
    SCRIPT_NAME,
    COMMAND_DOCUMENTATION,
    FOR_MORE_INFORMATION_TEXT,
    FOLDER_STRUCTURE,
    STARTER_FILES,
}