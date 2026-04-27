[![Release](https://github.com/leereliu/iProxy/actions/workflows/release.yml/badge.svg)](https://github.com/leereliu/iProxy/actions/workflows/release.yml)

<p align="center">
   <a href="https://www.yuque.com/iproxy">
    <img src="./vendor/files/icon.png" height="150px"/>
  </a>
</p>

<p align="center">
<b><a href="https://github.com/leereliu/iProxy/releases">Download</a></b>
|
<b><a href="https://www.yuque.com/iproxy">Document</a></b>

</p>
<p align="center">
</p>

<p align="center">
  <a href="https://www.yuque.com/iproxy">
    <img src="https://img.alicdn.com/tfs/TB157bJF.T1gK0jSZFrXXcNCXXa-1393-921.png"></img>
    <img src="https://img.alicdn.com/tfs/TB1vd0uGYj1gK0jSZFOXXc7GpXa-1549-1018.png"></img>
  </a>
</p>


--- 
:package: Out-of-box, fully automation with **certificate install & system proxy setting**

:battery: Battery include, powerful `hosts/proxy/capture` based on `whistle`, what u need is just input `/`

:electric_plug: Hackable, you could write even Node.js for your proxy rule

--- 

## Preview GIF
<p align="center">
  <img src="https://i.loli.net/2020/05/05/uRZMpi8rPDyQF6I.gif"></img>
</p>

## Download

[macOS dmg releases](https://github.com/leereliu/iProxy/releases)

Every push to the `main` branch builds a macOS dmg package and publishes it to GitHub Releases.

## About Linux Version

iProxy supports Linux now! It is contributed by the Deepin Beijing Develop Team.

Supported desktop environment: Gnome and DDE.

Supported linux distribution: Debian, Ubuntu, deepin, etc.

Unsupported desktop environment: KDE.

Fedora and Arch Linux: please replace libnss3-tools with the package name of your distribution.

## Quick Start

Take a quick start at: https://yuque.com/iproxy

## How to contribute

### env

- Node.js 16
- Yarn 1.x
- `npm install -g electron-builder` if you need bundle application

### dev

```shell
git clone https://github.com/leereliu/iProxy
cd iProxy
yarn run install-deps
yarn run dev
```

### build macOS dmg locally

```shell
NODE_TLS_REJECT_UNAUTHORIZED=0 npm_config_strict_ssl=false YARN_STRICT_SSL=false yarn --ignore-engines
NODE_TLS_REJECT_UNAUTHORIZED=0 npm_config_strict_ssl=false YARN_STRICT_SSL=false npm run update:node_modules
NODE_TLS_REJECT_UNAUTHORIZED=0 npm_config_strict_ssl=false YARN_STRICT_SSL=false NODE_OPTIONS=--openssl-legacy-provider npm run dist:mac
```

The SSL variables above are only needed on local networks that intercept TLS traffic, such as Zscaler. GitHub Actions builds keep normal certificate verification enabled.

For new contributors you can try to fix a [🏅send-a-PR](https://github.com/leereliu/iproxy/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%8F%85send+a+PR%22)

## Contributors ✨
<p align="center">
  <a href="https://github.com/leereliu"><img src="https://avatars.githubusercontent.com/u/25074202?s=80&v=4" width="60" height="60" alt="leereliu" /></a>
  <a href="https://github.com/xcodebuild"><img src="https://avatars.githubusercontent.com/u/5436704?s=80&v=4" width="60" height="60" alt="xcodebuild" /></a>
  <a href="https://github.com/shejinxin"><img src="https://avatars.githubusercontent.com/u/139830914?s=80&v=4" width="60" height="60" alt="shejinxin" /></a>
  <a href="https://github.com/ahonn"><img src="https://avatars.githubusercontent.com/u/9718515?s=80&v=4" width="60" height="60" alt="ahonn" /></a>
  <a href="https://github.com/njzydark"><img src="https://avatars.githubusercontent.com/u/19601720?s=80&v=4" width="60" height="60" alt="njzydark" /></a>
  <a href="https://github.com/richardo2016"><img src="https://avatars.githubusercontent.com/u/6339390?s=80&v=4" width="60" height="60" alt="richardo2016" /></a>
  <a href="https://github.com/Runly"><img src="https://avatars.githubusercontent.com/u/18432577?s=80&v=4" width="60" height="60" alt="Runly" /></a>
  <a href="https://github.com/shouhuanxiaoji"><img src="https://avatars.githubusercontent.com/u/4121607?s=80&v=4" width="60" height="60" alt="shouhuanxiaoji" /></a>
</p>
