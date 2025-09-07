[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# Command Line Interface

## Managing websites

### Add a site

Register a new site called `martin-site`, and scaffolds a started website structure in a dedicated folder in `src/sites/`.

```bash
npm run site:add martin-site
```

ℹ️ To remove a site just delete the corresponding folder in `src/sites/`

### Build & bundle ressources

This operation compiles `ts` code and optimises assets for production.

#### For a specific site

```bash
npm run site:build martin-site
```
Build and bundle ressources only for the site named `martin-site`

#### For all registered sites

```bash
npm run site:build-all
```
Build and bundle ressources for all registered sites

#### Clean all built ressources

```bash
npm run site:clean-outdir
```
Removes the content of the root `dist/` dir

## Starting a server

### Dev server

Serves pages and assets directly from the `src` folder, and sets up hot module reload to allow for instant feedback on the modifications applied during the developpement phase.

```bash
npm run server:dev
```

### Preview server

Serves pages and assets from the `dist` folder (built & bundled).

```bash
npm run server:preview
```

ℹ️ For the preview server to work, the ressources of the targetted site must have been built (using the `site:build site-name` or `site:build-all` command)

### Production server

Serves only pages from the `dist` folder (built & bundled).

The production server does not serve static assets and ressources, 
requests (from any site) to `/assets/...` should point to the `dist/client/assets/` folder.

```bash
npm run server
```

ℹ️ For the production server to work, the ressources of the targetted site must have been built (using the `site:build` or `site:build-all` command)

## Paon Core

### Building Paon

aa

### Cleaning Paon outdir

aa

### Running Paon tests

aa
