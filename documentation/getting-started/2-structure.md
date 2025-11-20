[🕮 Table of contents](/Readme.md#documentation)

### 🦚 Getting Started: 

# 2. Paon Project Structure

Quick overview of the important folder and files in a Paon project, and the default structure of a site folder.

## Global structure

ℹ️ For simpicity, we are only gonna talk about the files and folders that are relevant.

- **`src/`**\
    *Folder containing all the frontend logic* 

    - **`core/`**\
        *Contains scripts & assets necessary for the default Paon site structure (rendering function, structural components, routing...)* 

    - **`shared/`**\
        *Shared folder, where we can store common ressources for multiple registered sites* 
    
    - **`sites/`**\
        *Each registered website gets a folder here that contains all its frontend logic* 

    - ...

- **`dist/`**\
    *Folder containing the compiled scripts and bundled assets for all registered websites in the project* 

    - **`client/assets/`**\
        *This folder contains all the client assets for all built websites*

        *In [production](/documentation/references/production.md), the content of this folder should be served for any request under the `/assets/...` path, for any of the registered websites (Paon prod server does not serve static assets).*
    
    - ...

- **`paon/`**

    - **`server.config.json`**\
        *By default, the server listens on port 3000 and only allows loopback traffic (only listens to requests from localhost).*
    
    - ...

- ...

## Site Folder Structure and Conventions

The site folder is scaffolded in `src/sites/` when we run the `add:site` command.

ℹ️ In this guide, we are gonna use the default site structure provided when creating a new site, though it's completely optionnal. If you wish to create your own structure you can modify `entry-server.tsx`, `entry-client.tsx` or `app.tsx` to render you own component tree.

### 📁 Folder Convensions

| Folders | Description |
| :- | :- |
| `api/` | API Fetching functions |
| `assets/` | Static assets |
| `components/` | React Components |
| `hooks/` | React Hooks |
| `pages/` | Page components |


### 📄 Structural Files

Those are core files in the default site structure, they have to be handled with care otherwise they might break the site.

| Files | Description |
| :- | :- |
| [`entry-client.tsx`](/documentation/references/site-files.md#entry-clienttsx) | Script  executed client side to set up the app |
| [`entry-server.tsx`](/documentation/references/site-files.md#entry-servertsx) | Exports the `render` function in charge of performing the server side rendering of the app |
| [`index.html`](/documentation/references/site-files.md#indexhtml) | Entry point when rendering any page (CSR or SSR) |
| [`app.tsx`](/documentation/references/site-files.md#apptsx) | Defines the root `App` component of the application |
| [`site.config.json`](/documentation/references/site-files.md#siteconfigjson) | Site specific configuration |

### 📄 Routing Files

| Files | Description |
| :- | :- | 
| [`layout.tsx`](/documentation/references/site-files.md#layouttsx) | Layout component |
| [`error.tsx`](/documentation/references/site-files.md#errortsx) | Error component |
| [`loader.tsx`](/documentation/references/site-files.md#loadertsx) | Loading component |
| [`router.tsx`](/documentation/references/site-files.md#routertsx) | Defines routes, and routing settings settings |

<br/>

| [⬅️ Installation & setup](/documentation/getting-started/1-setup.md) | [Build a basic backend for the demo site ➡️](/documentation/getting-started/3-demo-site-backend.md) |
| :--- | ----: |