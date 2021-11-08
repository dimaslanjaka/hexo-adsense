/* global hexo */
const injector2 = require("hexo-extend-injector2");
const fs = require("hexo-fs");
const path = require("path");

if (typeof hexo != "undefined") {
  const injector = injector2(hexo); // will make it as plugin
  const config = hexo.config.adsense;

  if (typeof config.adblock == "boolean") {
    if (config.adblock) {
      const adblock_css = fs.readFileSync(path.join(__dirname, "source/adblock.css")).toString();
      const adblock_js = fs.readFileSync(path.join(__dirname, "source/adblock.js")).toString();
      injector.register("body-end", function () {
        return `<style>${adblock_css}</style><script>${adblock_js}</script>`;
      });
    }
  }

  // add redirect https
  if (typeof config.https == "boolean") {
    if (config.https) {
      injector.register("body-end", function () {
        const https_js = fs.readFileSync(path.join(__dirname, "source/https.js")).toString();
        return `<script>${https_js}</script>`;
      });
    }
  }

  injector.register("head-end", {
    value: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1165447249910969" crossorigin="anonymous"></script>`,
  });
}
