[**🕮 Table of contents**](/Readme.md)

### 🦚 Getting Started: 

# 1. Installation & setup

Setup a Paon project and add a first website

## System Requirements

- Linux
- Requires Node.js v22 or later

## Installation

1. Clone the repo
```bash
git clone https://github.com/Nebulaevo/Paon.git
```

2. Move to the root & install dependencies
```bash
cd Paon/
npm install
```

3. Build the core scripts
```bash
npm run core:build
```

## Add a Website

Let's create a first website, let's call it **martin-music** :

```bash
npm run site:add martin-music
```

This will create a basic demo site to test our setup. 

### Website Name Rules

- If a website with the same name have already been created, the operation will fail
- Site names are expected to be kebab-case and only alphanumerical, non allowed format will be refused

| Site Name     |                                                       |
| :------------ | :---------------------------------------------------- |
| my-site-name  | ✅ Ok                                                 |
| site2         | ✅ Ok                                                 |
| -my-site-name | 🚫 Cannot start or end with '-'                       |
| my@-site-name | 🚫 Can only include alphanumerical characters and "-" |
| my--site-name | 🚫 Cannot have multiple consecutive "-"               |



<br/><br/>


| [🕮 Table of contents](/Readme.md) | [Project Structure ➡️](/documentation/getting-started/2-structure.md) |
| :--- | ----: |