/* global hexo */
"use strict";
var injector2 = require("./packages/hexo-extend-injector2/index");
var fs = require("fs");
var path = require("path");
var getConfig = require("./src/config");
var isDevelopment = require("./src/config")(hexo).development;
var assign = require("object-assign");
var log = require("hexo-log")({
    debug: false,
    silent: false
});
if (typeof hexo == "undefined" || typeof hexo.config.adsense == "undefined") {
    //console.log("[hexo-adsense] Not hexo process, skipping..");
    return;
}
var injector = injector2(hexo); // will make it as plugin
var config = getConfig(hexo);
if (config.pub.length < 1) {
    log.error("adsense ca-pub (adsense.pub) not configured in _config.yml");
    return;
}
// only apply these function on production
if (!isDevelopment) {
    //log.debug("is remote");
    // add redirect https
    if (typeof config.https == "boolean") {
        if (config.https) {
            injector.register("body-end", function () {
                var https_js = fs
                    .readFileSync(path.join(__dirname, "source/https.js"))
                    .toString();
                return "<script>".concat(https_js, "</script>");
            });
        }
    }
    // add adblock blocker
    if (typeof config.adblock == "boolean") {
        if (config.adblock) {
            var adblock_css_1 = fs
                .readFileSync(path.join(__dirname, "source/adblock.css"))
                .toString();
            var adblock_js_1 = fs
                .readFileSync(path.join(__dirname, "source/adblock.js"))
                .toString();
            injector.register("body-end", function () {
                return "<style>".concat(adblock_css_1, "</style><script>").concat(adblock_js_1, "</script>");
            });
        }
    }
}
if (config.enable) {
    injector.register("head_end", function () {
        var adsenseConfigObject;
        if (isDevelopment) {
            adsenseConfigObject = JSON.stringify(assign(config, hexo.env), null, 2);
        }
        else {
            adsenseConfigObject = JSON.stringify(assign(config, hexo.env));
        }
        return "<script id=\"hexo-adsense-config\" type=\"application/json\">".concat(adsenseConfigObject, "</script>");
    });
    // adsense enabled to all pages
    injector.register("head-end", {
        value: "<script async src=\"//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=".concat(config.pub, "\" crossorigin=\"anonymous\"></script>")
    });
}
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
    //log.log("hexo-adsense article ads process starting...");
    if (config.field === "post") {
        // only on post
        //log.log("after_post_render");
        hexo.extend.filter.register("after_post_render", require("./src/article-ads").after_post_render);
    }
    else {
        //log.log("after_render:html");
        // entire html
        hexo.extend.filter.register("after_render:html", require("./src/article-ads").after_render_html);
    }
}
