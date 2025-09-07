[🕮 Table of contents](/Readme.md)

### 🦚 Getting Started: 

# 2. Paon Project Structure

Quick overview of the important folder and files in a Paon project, and the default structure of a site folder.

## Global structure

ℹ️ For simpicity, we are only gonna talk about the files and folders that are relevant.

- **`src/`**\
    *Folder containing all the frontend logic* 

    - **`core/`**\
        *Contains scripts & assets necessary for the default Paon site structure (rendering function, routing logic...)* 

    - **`shared/`**\
        *Shared folder, where we can store common ressources for multiple registered sites* 
    
    - **`sites/`**\
        *Each registered website gets a folder here that contains all its frontend logic* 

    - ...

- **`dist/`**\
    *Folder containing the compiled scripts and bundled assets for all registered websites in the project* 

    - **`client/assets/`**\
        *This folder contains all the client assets for all built websites*

        *In production, the content of this folder should be served for any request under the `/assets/...` path, for any of the registered websites (Paon prod server does not serve static assets).*
    
    - ...

- **`paon/`**

    - **`server.config.json`**\
        *By default, the server listens on port 3000 and only allows loopback traffic (only listens to requests from localhost).*
    
    - ...

- ...

## Site Folder Structure and Conventions

The site folder is scaffolded in `src/sites/` when we run the `add:site` command.

ℹ️ In this guide, we are gonna use the site structure provided by Paon, though it's completely optionnal. If you wish to create your own structure you can modify `entry-server.tsx`, `entry-client.tsx` and `app.tsx` to render you own component tree.

### 📁 Folder Convensions

| Folders | Description |
| :- | :- |
| `api/` | For fetching functions |
| `assets/` | For static assets |
| `components/` | For components |
| `hooks/` | For hooks |
| `hooks/` | For page Components |


### 📄 Structural Files

Those are core files in the default site structure, they have to be handled with care or they might break the site.

| Files | Description | Can be modified ? |
| :- | :- | - |
| [`entry-client.tsx`](/documentation/references/site-files.md#entry-clienttsx) | Renders the app on the client | No |
| [`entry-server.tsx`](/documentation/references/site-files.md#entry-servertsx) | Exports a function rendering the app on the server | No |
| [`index.html`](/documentation/references/site-files.md#indexhtml) | Document in which we inject the app | Do not modify the tags included by default in `<body>`  |
| [`app.tsx`](/documentation/references/site-files.md#apptsx) | Export the root `<App/>` component, and import global css stylesheets. | We can ajust global css imports, but the `App` component should not be modified |
| [`site.config.json`](/documentation/references/site-files.md#siteconfigjson) | Site specific configuration | Yes |

### 📄 Routing Files

| Files | Description |
| :- | :- | 
| [`layout.tsx`](/documentation/references/site-files.md#layouttsx) | Layout component |
| [`error.tsx`](/documentation/references/site-files.md#errortsx) | Error component |
| [`loader.tsx`](/documentation/references/site-files.md#loadertsx) | Loading component |
| [`router.tsx`](/documentation/references/site-files.md#routertsx) | Defines router settings |

<br/>

| [⬅️ Installation & Setup](/documentation/getting-started/1-setup.md) | [API: Page Requests ➡️](/documentation/getting-started/3-api.md) |
| :--- | ----: |