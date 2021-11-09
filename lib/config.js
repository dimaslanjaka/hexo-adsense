/* eslint-disable no-unused-vars */
/* global hexo */
const Hexo = require("hexo");
const assign = require("object-assign");
const checkLocalHost = require("./checkLocalHost");
const argv = require("yargs");
const isProduction = argv["production"] !== undefined;
const isDevelopment = argv["development"] !== undefined;
const defaultConfig = {
  /**
   * Enable adsense
   */
  enable: true,
  article_ads: [""].filter((v) => {
    return typeof v == "string" && v.length > 0;
  }),
  /**
   * Adsense ca-pub
   */
  pub: "",
  adblock: false,
  https: false,
  field: "site",
  exclude: [".gitignore"],
  /**
   * is development mode?
   */
  development: isDevelopment,
};

//hexoAdsenseConfig

/**
 * hexo-adsense config
 * @param {Hexo} hexo
 * @returns {typeof defaultConfig}
 */
module.exports = function (hexo) {
  if (typeof hexo.config.adsense != "undefined") {
    return assign(defaultConfig, hexo.config.adsense);
  }
  return defaultConfig;
};
