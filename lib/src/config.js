/* eslint-disable no-unused-vars */
/* global hexo */
var Hexo = require("hexo");
var assign = require("object-assign");
var defaultConfig = {
    /**
     * Enable adsense
     */
    enable: true,
    article_ads: [""].filter(function (v) {
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
    development: false
};
/**
 * hexo-adsense config
 * @param {Hexo} hexo
 * @returns {typeof defaultConfig}
 */
module.exports = function (hexo) {
    if (hexo && typeof hexo.config.adsense != "undefined") {
        /**
         * @type {typeof defaultConfig}
         */
        var c = assign(defaultConfig, hexo.config.adsense);
        c.development = defaultConfig.development = require("../packages/hexo-cli-extras/lib/env").isDev(hexo);
        ///////////console.log(c);
        return c;
    }
    return defaultConfig;
};
