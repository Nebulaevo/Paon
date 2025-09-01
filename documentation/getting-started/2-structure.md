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

        *In production, the content of this folder should be served for any request to `/assets/...` for any of the registered websites (Paon prod server does not serve static assets).*
    
    - ...

- **`paon/`**

    - **`server.config.json`**\
        *By default, the server listens on port 3000 and only allows loopback traffic (only listens to requests from localhost).*
    
    - ...

- ...

## Site Folder Structure

The site folder is scaffolded in `src/sites/` when we run the `add:site` command.

ℹ️ In this guide, we are gonna use the site structure provided by Paon, though it's completely optionnal. If you wish to create your own structure you can modify `entry-server.tsx`, `entry-client.tsx` and `app.tsx` to render you own component tree.

### Root Files

| File | Description |
| :- | :- | 
| `entry-client.tsx` | Scripts in charge of rendering the app on the client. <br/> *ℹ️ Should not be modified* |
| `entry-server.tsx` | Scripts in charge of exporting a function to render the component on the server. <br/> *ℹ️ Should not be modified* |
| `app.tsx` | Export the root **`<App />`** component, and import global css stylesheets. <br/> *ℹ️ The App component should not be modified* | 
| `app.scss` | Global stylesheet imported in `app.tsx` |
| `index.html` | aaa <br/> bbb |
| `layout.tsx` | aaa <br/> bbb |
| `error.tsx` | aaa <br/> bbb |
| `loader.tsx` | aaa <br/> bbb |
| `router.tsx` | aaa <br/> bbb |

<br/>

| [⬅️ Installation & Setup](/documentation/getting-started/1-setup.md) | [API: Page Requests ➡️](/documentation/getting-started/3-api.md) |
| :--- | ----: |