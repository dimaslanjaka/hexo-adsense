# hexo-adsense
Hexo adsense support (under development)

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
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-xxxxx"
     data-ad-slot="xxxxx"></ins>
<!--script> UNUSED BECAUSE THIS PLUGIN ALREADY OPTIMIZED THE ADSENSE JAVASCRIPT
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
