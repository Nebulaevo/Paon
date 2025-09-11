[**🕮 Table of contents**](/Readme.md)

### 🦚 References : 

# Command Line Interface

## `help` Argument : Display Manual

```bash
npm run site:add help

# will print a short manual for the site:add command
```

All following commands, except for `server` commands, will accepts a `help` argument and display a short manual directly in the console.



## `site:` Managing Websites

### Add a Site

```bash
npm run site:add my-cool-site
```

Register a new site called **"my-cool-site"**, and scaffolds the default site structure and a demo website in a dedicated folder : `src/sites/my-cool-site/`.

ℹ️ To remove a site just delete the corresponding folder in `src/sites/`

#### Website Name Rules :

- If a website with the same name have already been created, the operation will fail
- Site names are expected to be kebab-case and only alphanumerical, non allowed formats will be refused

| Site Name     |                                                       |
| :------------ | :---------------------------------------------------- |
| my-site-name  | ✅ Ok                                                 |
| site2         | ✅ Ok                                                 |
| -my-site-name | 🚫 Cannot start or end with '-'                       |
| my@-site-name | 🚫 Can only include alphanumerical characters and "-" |
| my--site-name | 🚫 Cannot have multiple consecutive "-"               |


### Build & Bundle Ressources

This operation compiles `ts` code and optimises assets for production.

#### For a Specific Site

```bash
npm run site:build my-cool-site
```

Builds and bundles the ressources only for the site named `my-cool-site`

#### For All Registered Sites

```bash
npm run site:build-all
```

Builds and bundles the ressources for all registered sites

### Clean All Built Ressources

```bash
npm run site:clean-outdir
```

Deletes the content of the sites outdir (root `dist/` dir)

## `server:` Starting a Server

### Dev Server

```bash
npm run server:dev
```

Will serve the lastest versions of your pages and assets directly from the unbuilt `src` folder.\
And includes hot module reload in the pages.

### Preview Server

```bash
npm run server:preview
```

Will serve built pages and bundled assets from the `dist` folder.

ℹ️ It behaves exactly like the production server, the only difference is that it will accept to serve static assets.

ℹ️ For the preview server to work, the lastest ressources of the targetted site must have been built (using the `site:build` or `site:build-all` command)

### Production Server

```bash
npm run server
```

Will serve built pages from the `dist` folder, but does not handle static file requests: see [serving static assets in production](/documentation/references/production.md#serving-static-assets)


ℹ️ For the production server to work, the lastest ressources of the targetted site must have been built (using the `site:build` or `site:build-all` command)

## `core:`  Paon Core

### Building Core Scripts

```bash
npm run core:build
```

This operation compiles the core scripts of Paon (server, cli scripts etc..) into JavaScript.

### Cleaning Paon Outdir

```bash
npm run core:clean-outdir
```

This operation will delete all the core compiled scripts of Paon (server, cli scripts etc..).
You need to run `npm run core:build` to compile them again.

### Running Paon Tests

```bash
npm run core:test
```

Runs tests