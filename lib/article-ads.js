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
const adsContent = `<div hexo-adsense="ads-content" style='display: inline-block;float: right;margin:40px 0 0 10px;background: #fff url(http://i.imgur.com/mBbv90p.png) no-repeat top right;padding-top: 9px'>ADS_CODE_HERE</div>`;

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
      result.push(adsContent.replace("ADS_CODE_HERE", html));
    }
  });

  return result;
}

/**
 * inject ads after_generate event
 * @example
 * hexo.extend.filter.register("after_generate", injectAdsAfterGenerate);
 */
function injectAdsAfterGenerate() {
  let hexo = this,
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
    log = hexo.log || console,
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

  if (typeof toDebug.adsense == "boolean") {
    console.log("adsense enabled", toDebug.title);
    let dom = htmlp.parse(content);
    let linebreaks = dom.window.document.querySelectorAll("br,hr");
    console.log("linebreaks found", linebreaks.length);
  }

  // return modified html
  return content;
}

module.exports = {
  endbodycode: articleAds,
  injectAdsContent,
};
