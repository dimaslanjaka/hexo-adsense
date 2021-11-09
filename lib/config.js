/* eslint-disable no-unused-vars */
/* global hexo */
const Hexo = require("hexo");
const assign = require("object-assign");

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
};

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
