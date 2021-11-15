# hexo-adsense
Hexo adsense support

> first development finished on 12 November 2021

[![Website shields.io](https://img.shields.io/website-up-down-green-red/https/webmanajemen.com.svg)](https://webmanajemen.com/)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-adsense)](https://npmjs.com/package/hexo-adsense)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-adsense)](https://npmjs.com/package/hexo-adsense)
[![Npm package dependents](https://badgen.net/npm/dependents/hexo-adsense)](https://npmjs.com/package/hexo-adsense)

# Features
- can display adsense to all pages except specific posts or pages (multiple supported)
- can only display adsense to specific posts or pages
- adsense javascript enchantments (lazy adsense included)

# Installation
Using Git Repository (Development)
```shell
npm i git+https://github.com/dimaslanjaka/hexo-adsense.git
```
Using NPM Repository (Production)
```shell
npm i hexo-adsense
```

### _config.yml
```yaml
adsense:
  # enable(true) or disable(false)
  enable: true
  # ca-pub-xxxx
  pub: ca-pub-1165447249910969
  # in-article ads source
  article_ads:
    - "source/ads/in_article.html"
    - "source/ads/in_article2.html"
  # ads field
  field: "site" # post=only post, site=all pages and posts
  # auto redirect to https
  https: true
  # block user with adblock enabled
  adblock: true
  # exclude pattern to disable adsense
  exclude:
    - "*.min.html"
    - "exclude/**/*"
```

### Article Ads
> include to config article_ads
```yaml
adsense:
  article_ads:
    - "source/ads/in_article.html"
```
> `source/ads/in_article.html` contents
```html
<!--REMOVE ADSENSE SCRIPT, THIS PLUGIN ALREADY OPTIMIZED THE ADSENSE JAVASCRIPT-->
<!--<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxx" crossorigin="anonymous"></script>-->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-xxxxx"
     data-ad-slot="xxxxx"></ins>
<!--script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script-->
```

# disable options
> to disable adsense on pattern `_config.yml` or set each post `adsense: false`.

<hr>

### Enable all except specific post
> enable adsense on all pages except spescific posts or pages.
> set `_config.yml`
```yaml
adsense:
  enable: true
  field: "site"
  #... pub, article_ads, etc
```
> set post header
```yaml
title: "Post title"
adsense: false
tags:
  - tags1
  - tags2
```

<hr>

### Disable all except post
> disable adsense on all pages and posts, except specific posts
> set `_config.yml`
```yaml
adsense:
  enable: false # adsense disabled globally
  #... pub, article_ads, etc
```
> set post header
```yaml
title: "Post title"
adsense: true # adsense will shown only for post with header `adsense: true` / enabled
tags:
  - tags1
  - tags2
```

## Project with this package
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com/dimaslanjaka/dimaslanjaka.github.io/tree/compiler) [<img src="https://img.shields.io/badge/webmanajemen.com-up-green"/>](https://dimaslanjaka.github.io) [![Website dimaslanjaka.github.io](https://img.shields.io/website-up-down-green-red/http/dimaslanjaka.github.io.svg)](https://dimaslanjaka.github.io)
