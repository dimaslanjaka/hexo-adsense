/* global hexo */
"use strict";

const injector2 = require("./packages/hexo-extend-injector2/index");
const fs = require("hexo-fs");
const path = require("path");
const checkLocalHost = require("./lib/checkLocalHost");

if (typeof hexo == "undefined") {
  console.log("[hexo-adsense] Not hexo process, skipping..");
  return;
}

if (typeof hexo != "undefined") {
  const injector = injector2(hexo); // will make it as plugin
  const config = require("./lib/config")(hexo);

  if (config.pub.length < 1) {
    console.log(`adsense ca-pub (adsense.pub) not configured in _config.yml`);
    return;
  }

  // only apply these function on remote
  checkLocalHost.default("127.0.0.1").then(function (isLocalHost) {
    if (!isLocalHost) {
      //hexo.log.debug("is remote");
      // add redirect https
      if (typeof config.https == "boolean") {
        if (config.https) {
          injector.register("body-end", function () {
            const https_js = fs.readFileSync(path.join(__dirname, "source/https.js")).toString();
            return `<script>${https_js}</script>`;
          });
        }
      }

      // add adblock blocker
      if (typeof config.adblock == "boolean") {
        if (config.adblock) {
          const adblock_css = fs.readFileSync(path.join(__dirname, "source/adblock.css")).toString();
          const adblock_js = fs.readFileSync(path.join(__dirname, "source/adblock.js")).toString();
          injector.register("body-end", function () {
            return `<style>${adblock_css}</style><script>${adblock_js}</script>`;
          });
        }
      }
    } else {
      //console.log("is localhost");
    }
  });

  /*injector.register("head-end", {
    value: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1165447249910969" crossorigin="anonymous"></script>`,
  });*/

  if (typeof config.article_ads != "undefined") {
    /*
    injector.register("body-end", function () {
      let adshtml = [];
      if (Array.isArray(config.article_ads)) {
        adshtml = config.article_ads;
      }
      if (adshtml.length) {
        return require("./lib/article-ads").endbodycode(adshtml, hexo);
      }
    });
    */

    if (config.field === "post") {
      hexo.extend.filter.register("after_post_render", require("./lib/article-ads").injectAdsContent);
    } else {
      hexo.extend.filter.register("after_render:html", require("./lib/article-ads").injectAdsContent);
    }
  }
}
