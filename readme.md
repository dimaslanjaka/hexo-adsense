# hexo-adsense
Hexo adsense support

# Features
- can display adsense to all pages except specific posts or pages (multiple supported)
- can only display adsense to specific posts or pages
- adsense javascript enchantments (lazy adsense included)
- support display adsense on localhost
- random display banner ads
- automated display in random positions of pseudo html elements (such as headers (`</h[n]>`), new line `<br/>`, after pretext `<pre/>`) useful for increasing **RPM** and **CTR** Adsense Prices.

# Demos
- [My Blog www.webmanajemen.com](https://www.webmanajemen.com/NodeJS/eslint-prettier-typescript-vscode.html)

try reload page

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
# https://github.com/dimaslanjaka/hexo-adsense
adsense:
  # enable(true) or disable(false)
  enable: true
  # ca-pub-xxxx
  pub: ca-pub-01234567989xx
  # enable in-article
  # boolean = by scanning source_dir/_data/hexo-adsense/*.html
  # array of files = only read spesific html files
  article_ads: true
  # ads field
  # post = only post
  # site = all pages and posts
  field: "site"
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

## Prioritize ads fill on spesific element

You can adjust where the ads should be visible by using `<div hexo-adsense-fill=""></div>` everywhere. [[Reference](https://github.com/dimaslanjaka/hexo-adsense/blob/27634e629ce3360eac9b31a7724e7d193aaab1f3/source/article-ads.js#L83)]

You also can adjust with independent ads (_dont use same adsense ads id_).

```html
<div hexo-adsense-fill="" style="display:block" data-ad-client="ca-pub-1048456668116270" data-ad-slot="5659161378" data-ad-format="auto" data-full-width-responsive="true"></div>
<!-- or you can remove ad-client and style attribute -->
<div hexo-adsense-fill="" data-ad-slot="5659161378" data-ad-format="auto" data-full-width-responsive="true"></div>
```

Above codes will converted into adsense ads automatically.

## Footnote
first development finished on 12 November 2021

# Website using Hexo NodeJS Blogging System

[![Test And Deploy](https://github.com/dimaslanjaka/static-blog-generator-hexo/actions/workflows/test.yml/badge.svg)](https://github.com/dimaslanjaka/static-blog-generator-hexo/actions/workflows/test.yml)
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label&style=flat-square)](https://github.com/dimaslanjaka/dimaslanjaka.github.io/tree/compiler)
[![webmanajemen.com](https://img.shields.io/website.svg?down_color=red&down_message=down&style=flat-square&up_color=green&up_message=up&label=webmanajemen.com&url=https://webmanajemen.com)](https://webmanajemen.com)

## hexo-adsense
[![npm version](https://badge.fury.io/js/hexo-adsense.svg?style=flat-square)](https://badge.fury.io/js/hexo-adsense)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-adsense?style=flat-square)](https://npmjs.com/package/hexo-adsense)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-adsense?style=flat-square)](https://npmjs.com/package/hexo-adsense)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-adsense?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-adsense?color=blue&label=Last%20Commit&style=flat-square)

## hexo-seo
[![npm version](https://badge.fury.io/js/hexo-seo.svg?style=flat-square)](https://badge.fury.io/js/hexo-seo)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-seo?style=flat-square)](https://npmjs.com/package/hexo-seo)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-seo?style=flat-square)](https://npmjs.com/package/hexo-seo)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-seo?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-seo?color=blue&label=Last%20Commit&style=flat-square)

## hexo-blogger-xml
[![npm version](https://badge.fury.io/js/hexo-blogger-xml.svg?style=flat-square)](https://badge.fury.io/js/hexo-blogger-xml)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-blogger-xml?style=flat-square)](https://npmjs.com/package/hexo-blogger-xml)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-blogger-xml?style=flat-square)](https://npmjs.com/package/hexo-blogger-xml)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-blogger-xml?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-blogger-xml?color=blue&label=Last%20Commit&style=flat-square)
