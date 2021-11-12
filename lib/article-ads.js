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
const log = require("./log");
const { memoize } = require("underscore");
const md5 = require("./md5");
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
  //hexo.log.log(isDevelopment, "dev");

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

function after_generate() {
  /**
   * @type {Hexo}
   */
  const hexo = this,
    route = hexo.route,
    options = require("./config")(hexo);
  //console.log(arguments.length);

  // Filter routes to select all html files.
  let routes = route.list().filter(function (path0) {
    let choose = minimatch(path0, "**/*.{htm,html}", { nocase: true });
    console.log(choose, path0);
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

let cx = require("./config")(null);

/**
 * filter and parse html ads files {adsense.article_ads}
 * @param {typeof cx} options
 * @param {Hexo} hexo
 * @returns {string[]} html string arrays
 */
function filter_adshtml(hexo) {
  const options = require("./config")(hexo);
  // parse article ads
  /**
   * @type {string[]}
   */
  let adshtml = [];
  if (Array.isArray(options.article_ads)) {
    adshtml = options.article_ads;
  } else if (typeof options.article_ads == "string") {
    adshtml = [options.article_ads];
  }

  if (adshtml.length > 0) {
    adshtml = adshtml.filter((ads) => {
      return typeof ads == "string" && ads.trim().length > 0;
    });
    if (adshtml.length > 0) {
      // adshtml turned to array html string
      adshtml = articleAds(adshtml, hexo);
    }
  }

  return adshtml;
}

/**
 * filter excluded patterns
 * @param {string} content data.content or content based on event type
 * @param {string} source_path full source path of the source file
 * @param {Hexo} hexo hexo instances
 * @returns content html string
 */
const filter_patterns = memoize(function (content, source_path, hexo) {
  const options = require("./config")(hexo);
  let excluded = false;
  // if `source_path` undefined, that is archive or tags
  if (source_path && !minimatch(source_path, "**/*.{htm,html}", { nocase: true })) {
    log.log(source_path, "isnt html, skipping...");
    return {
      content: content,
      excluded: true,
    };
  } else {
    excluded = utils.isIgnore(source_path, options.exclude, hexo);
  }
  //log.log("is excluded", excluded, source_path);
  // if the post or page is match excluded pattern, return original contents
  if (excluded) {
    //remove pagead on head caused by ../index.js
    content = content.replace(
      /<script?.*src?.*adsbygoogle?\b[^>]*>([\s\S]*?)<\/script>/gm,
      "<!--hexo-adsense disabled on this page-->"
    );
  }

  return {
    content: content,
    excluded: excluded,
  };
});

/**
 * inject ads after_post_render event
 * @example
 * hexo.extend.filter.register("after_generate", injectAdsAfterGenerate);
 */
function after_post_render(data) {
  /**
   * @type {Hexo}
   */
  const hexo = this;
  const options = require("./config")(hexo);
  //utils.dump("after_post_render/" + md5(data.title) + ".txt", data);

  const filterPattern = filter_patterns(data.content, getPageSource(data), hexo);
  data.content = filterPattern.content;
  if (filterPattern.excluded) {
    // if this post excluded, return original data
    return data;
  }

  //log.log(data.title, "not excluded");

  // parse article ads
  /**
   * @type {string[]}
   */
  let adshtml = filter_adshtml(hexo);
  if (adshtml.length < 1) {
    return data;
  }

  if (typeof data.adsense == "boolean") {
    if (data.adsense) {
      //log.log(data.title, "adsense is enabled locally");
      // if post adsense is enabled
      data.content = processAdsHtml(data.content, adshtml, hexo);
    }
  } else if (options.enable) {
    //log.log(data.title, "adsense is enabled globally");
    // if adsense is enabled globally and post adsense not set
    // enable adsense on post
    data.content = processAdsHtml(data.content, adshtml, hexo);
  }

  return data;
}

/**
 * process injector adshtml strings
 * @param {string[]} adshtml
 * @param {Hexo} hexo hexo instances
 * @param {string} content content html of page
 */
function processAdsHtml(content, adshtml, hexo) {
  const options = require("./config")(hexo);
  const replacement = memoize(function (adshtml) {
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
  const caller = new Error().stack.split("at ")[2].replace(/^Hexo./g, "");
  const isFieldPost = caller.startsWith("after_post_render");

  //const isFieldSite = caller.startsWith("after_render_html");

  if (isFieldPost) {
    content += replacement(adshtml);
  } else {
    // add pagead if global _config.yml adsense disabled {adsense.enable: false}
    // prevent duplicate onpage adsense in </head>
    if (!options.enable) {
      content = content.replace(
        /<\/head\>/gm,
        `<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.pub}" crossorigin="anonymous"></script>`
      );
    }
    content = content.replace(/<\/body\>/gm, `${replacement(adshtml)}</body>`);
  }
  return content;
}

/**
 * Get page source path
 * @param {object} page
 * @returns {string}
 */
function getPageSource(page) {
  if (typeof page.full_source != "undefined") {
    return page.full_source;
  }
  if (typeof page.source != "undefined") {
    return page.source;
  }
  // if archive page, source and full_source are not specified
  if (typeof page.path != "undefined") {
    return page.path;
  }
  if (typeof page.canonical_path != "undefined") {
    return page.canonical_path;
  }
  //log.log(page.canonical_path);
  //utils.dump("pageSource.txt", page.canonical_path, page);
  return undefined;
}

/**
 * Inject ads after_render:html event (on all page)
 * @param {object} data
 * @param {string} content
 */
function after_render_html(content, data) {
  /**
   * @type {Hexo}
   */
  const hexo = this;
  const options = require("./config")(hexo);

  let page;
  if (data.hasOwnProperty("post")) {
    data.type = "post";
    page = data.post;
  } else if (data.hasOwnProperty("page")) {
    data.type = "page";
    page = data.page;
  }

  /*delete page._content;
  delete page.raw;
  delete page.content;
  delete page.excerpt;
  log.log(page);*/

  const filterPattern = filter_patterns(content, getPageSource(page), hexo);
  if (filterPattern.excluded) {
    // if this post is excluded, return original content
    return filterPattern.content;
  }

  // parse article ads
  /**
   * @type {string[]}
   */
  let adshtml = filter_adshtml(hexo);
  if (adshtml.length < 1) {
    return content;
  }

  if (typeof page.adsense == "boolean") {
    // apply adsense on each rendering post {adsense: true}
    if (page.adsense) {
      //console.log("adsense enabled at post", page.title);
      content = processAdsHtml(content, adshtml, hexo);
    }
  } else if (options.enable) {
    // if adsense is enabled globally and post adsense not set
    // enable adsense on post
    content = processAdsHtml(content, adshtml, hexo);
  }

  // return modified html
  return content;
}

module.exports = {
  endbodycode: articleAds,
  after_render_html,
  after_post_render,
};
