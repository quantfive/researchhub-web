<div align="center">
  <h3>⚠️ NO LONGER ACTIVELY MAINTAINED ⚠️</h3>
  <p><strong>This repository is archived and no longer actively maintained.</strong></p>
  <p>Please visit the new application repository at https://github.com/ResearchHub/web.</p>
</div>

<p align="left">    
    <h1 align="left">The <a aria-label="RH logo" href="https://researchhub.com">ResearchHub</a> Next.js Web App </h1>
</p>

<p align="left">
  <a aria-label="Join the community" href="https://discord.gg/ZcCYgcnUp5">
    <img alt="Discord Badge" src="https://badgen.net/badge/Join%20the%20community/Discord/yellow?icon=discord">
  </a>
</p>
<p align="center">&nbsp;</p>

## Our Mission

```
Our mission is to accelerate the pace of scientific research 🚀
```

We believe that by empowering scientists to independently fund, create, and publish academic content we can revolutionize the speed at which new knowledge is created and transformed into life-changing products.

## Important Links 👀

💡 Got an idea or request? [Open issue on Github](https://github.com/ResearchHub/issues/issues/new/choose).  
🐛 Found a bug? [Report it here](https://github.com/ResearchHub/issues/issues/new/choose).  
➕ Want to contribute to this project? [Introduce yourself in our Discord community](https://discord.gg/ZcCYgcnUp5)  
📰 Read the [ResearchCoin White Paper](https://www.researchhub.com/paper/819400/the-researchcoin-whitepaper)  
👷 [See what we are working on](https://github.com/orgs/ResearchHub/projects/3/views/3)

## Setup

1. Run `cp .env.development.example .env.development`
1. `nvm install 20.11.1` (installing [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
1. `nvm use 20.11.1`
1. `yarn install` (installing [yarn](https://classic.yarnpkg.com/lang/en/docs/install/))
1. `yarn run dev`
1. You will also need to [install the backend app](https://github.com/ResearchHub/researchhub-backend) for the project to run

### macOS

Executing `yarn install` on macOS may display some `gyp` errors associated with the `canvas` native dependency.
To fix these errors, install the following packages using Homebrew:

```shell
brew install pango pkg-config
```

## Contributing to the codebase

1. Fork this repo and then clone it to your local env
2. Create a new branch

```
git checkout -b MY_BRANCH_NAME
```

3. Submit a pull request against `master` branch of this repository
