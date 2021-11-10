"use strict";
const Hexo = require("hexo");

/**
 * Check is production or development
 * @param {Hexo} inHexo
 * @returns
 */
function getEnv(inHexo) {
  var DEV = "development";
  var PRD = "production";

  if (inHexo) {
    if (inHexo.env.args._ && inHexo.env.args._.length > 0) {
      for (var i = 0; i < inHexo.env.args._.length; i++) {
        if (inHexo.env.args._[i] == "s" || inHexo.env.args._[i] == "server") return DEV;
        if (inHexo.env.args._[i] == "d" || inHexo.env.args._[i] == "deploy") return PRD;
        if (inHexo.env.args._[i] == "g" || inHexo.env.args._[i] == "generate") return PRD;
      }
    }
  }
  return null;
}

function isDev(hexo) {
  return getEnv(hexo) == "development";
}

function isProd(hexo) {
  return getEnv(hexo) == "production";
}

module.exports = {
  env: function (inHexo) {
    return getEnv(inHexo);
  },
  isProd,
  isDev,
};
