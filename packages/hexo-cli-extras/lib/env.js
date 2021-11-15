"use strict";
const Hexo = require("hexo");
const { memoize } = require("underscore");
const argv = require("minimist")(process.argv.slice(2));

/**
 * Check is production or development
 * @param {Hexo} inHexo
 * @returns
 */
const getEnv = memoize(function (inHexo) {
  var DEV = "development";
  var PRD = "production";
  // --development
  const arg = typeof argv["development"] == "boolean" && argv["development"];

  // set NODE_ENV = "development"
  const env = process.env.NODE_ENV && process.env.NODE_ENV.toString().toLowerCase() === "development";

  // define is development
  const isDev = arg || env;

  if (inHexo) {
    if (isDev) return DEV;
    if (typeof inHexo.env.args.development == "boolean" && inHexo.env.args.development) return DEV;
    if (inHexo.env.args._ && inHexo.env.args._.length > 0) {
      for (var i = 0; i < inHexo.env.args._.length; i++) {
        if (inHexo.env.args._[i] == "s" || inHexo.env.args._[i] == "server") return DEV;
        if (inHexo.env.args._[i] == "d" || inHexo.env.args._[i] == "deploy") return PRD;
        if (inHexo.env.args._[i] == "g" || inHexo.env.args._[i] == "generate") return PRD;
      }
    }
  }

  return null;
});

const isDev = memoize(function (hexo) {
  return getEnv(hexo) == "development";
});

const isProd = memoize(function (hexo) {
  return getEnv(hexo) == "production";
});

module.exports = {
  env: function (inHexo) {
    return getEnv(inHexo);
  },
  isProd,
  isDev,
};
