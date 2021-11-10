/* eslint-disable no-unused-vars */
/// <reference path="./article-ads.d.ts"/>
/**
 * Server side processor
 */
///
const Hexo = require("hexo");
const fs = require("hexo-fs");
const path = require("path");
const minimatch = require("minimatch");
const utils = require("./utils");
const safestringify = require("./safestringify");
const htmlp = require("./html-parser");
const checkLocalHost = require("./checkLocalHost");
const adsContent = `<div hexo-adsense="ads-content">ADS_CODE_HERE</div>`;

String.prototype.joinpath = function (str) {
  return path.join(this.toString(), str);
};

/**
 * Article ads reader
 * @param {string[]} files
 * @param {Hexo} hexo
 */
function articleAds(files, hexo) {
  const base_dir = hexo.base_dir;
  const source_dir = hexo.source_dir;
  const isDevelopment = require("./config")(hexo).development;

  /**
   * @type {string[]}
   */
  const result = [];
  files.forEach(function (file) {
    /**
     * @type {string}
     */
    let html;
    let tes = base_dir.joinpath(file);
    if (fs.existsSync(tes)) {
      html = fs.readFileSync(tes).toString();
    } else {
      tes = source_dir.joinpath(file);
      if (fs.existsSync(tes)) {
        html = fs.readFileSync(tes).toString();
      }
    }
    if (html.length > 0) {
      if (isDevelopment) {
        // ad-test on localhost
        // https://stackoverflow.com/a/34389120
        html = html.replace(/><\/ins>/gm, ` data-adtest="on"></ins>`);
      }
      // replace script adsbygoogle.push
      html = html.replace(/\(adsbygoogle?\s*=?\s*window\.adsbygoogle?\s*\|\|?\s*\[\]\)\.push\({}\);/gm, "");
      // replace scripts
      //html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
      // replace script src=adsbygoogle.js
      html = html.replace(/<script?.*src?.*adsbygoogle\b[^>]*>([\s\S]*?)<\/script>/gm, "");
      result.push(adsContent.replace("ADS_CODE_HERE", html));
    }
  });

  return result;
}

/**
 * inject ads after_generate event, idea from hexo-filter-cleanup
 * @example
 * hexo.extend.filter.register("after_generate", injectAdsAfterGenerate);
 */
function injectAdsAfterGenerate() {
  const hexo = this,
    route = hexo.route,
    log = hexo.log || console,
    options = hexo.config.hfc_html;

  // Filter routes to select all html files.
  let routes = route.list().filter(function (path0) {
    let choose = minimatch(path0, "**/*.{htm,html}", { nocase: true });
    if (typeof options.exclude != "undefined") {
      choose = choose && !utils.isIgnore(path0, options.exclude);
    }
    if (typeof hexo.config.skip_render != "undefined") {
      // _config.yml skip_render https://hexo.io/docs/configuration.html#Directory
      choose = choose && !utils.isIgnore(path0, hexo.config.skip_render);
    }
    return choose;
  });
}

/**
 * Inject ads after_post_render event
 * @param {object} data
 */
function injectAdsContent(content, data) {
  /**
   * @type {Hexo}
   */
  const hexo = this,
    options = require("./config")(hexo);
  let toDebug;
  if (data.hasOwnProperty("post")) {
    data.type = "post";
    toDebug = data.post;
  } else if (data.hasOwnProperty("page")) {
    data.type = "page";
    toDebug = data.page;
  }

  // parse article ads
  /**
   * @type {string[]}
   */
  let adshtml;
  if (Array.isArray(options.article_ads)) {
    adshtml = options.article_ads;
  } else if (typeof options.article_ads == "string") {
    adshtml = [options.article_ads];
  }
  if (Array.isArray(adshtml)) {
    adshtml = adshtml.filter((ads) => {
      return typeof ads == "string" && ads.trim().length > 0;
    });
    if (adshtml.length > 0) {
      // adshtml turned to array html string
      adshtml = articleAds(adshtml, hexo);
    }
  }

  //fs.writeFileSync(__dirname.joinpath("../tmp/" + arguments.callee.name + ".json"), safestringify(toDebug, null, 2));

  if (adshtml.length > 0) {
    if (typeof toDebug.adsense == "boolean") {
      if (toDebug.adsense) {
        //console.log("adsense enabled at post", toDebug.title);

        const replacement = utils.memoize(function (adshtml) {
          const adsContentCss = __dirname.joinpath("../source/article-ads.css");
          const adsContentJs = __dirname.joinpath("../source/article-ads.js");
          let replacement = `<div id="hexo-adsense-hidden" style="display:none">${adshtml.join("")}</div>`;
          if (fs.existsSync(adsContentCss)) {
            replacement += `<style>${fs.readFileSync(adsContentCss).toString()}</style>`;
          }
          if (fs.existsSync(adsContentJs)) {
            replacement += `<script>${fs.readFileSync(adsContentJs).toString()}</script>`;
          }
          return replacement;
        });

        // add pagead
        content = content.replace(
          /<\/head\>/gm,
          `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.pub}" crossorigin="anonymous"></script>`
        );
        content = content.replace(/<\/body\>/gm, `${replacement(adshtml)}</body>`);
      }
    }
  }

  // return modified html
  return content;
}

module.exports = {
  endbodycode: articleAds,
  injectAdsContent,
};
