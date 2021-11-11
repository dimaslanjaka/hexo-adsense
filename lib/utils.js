/* global hexo */
"use strict";

const minimatch = require("minimatch");
const Promise = require("bluebird");
const md5File = require("md5-file");
const underscore = require("underscore");
const Hexo = require("hexo");
const md5Cache = {};
const fileCache = {};
const log = require("./log");
const path = require("path");

if (typeof hexo == "undefined") {
  /**
   * @type {Hexo}
   */
  let hexo;
}

function setHexo(inHexo) {
  hexo = inHexo;
}

/**
 *
 * @param {string} path0
 * @param {string[]|string} exclude
 * @param {Hexo} hexo
 * @returns
 */
const isIgnore = underscore.memoize((path0, exclude, hexo) => {
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path0 && exclude && exclude.length) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      let excludePattern = exclude[i];
      if (hexo) {
        let fromBase = path.join(hexo.base_dir, excludePattern);
        let fromSource = path.join(hexo.source_dir, excludePattern);
        //log.log([path0, fromBase, fromSource, excludePattern]);
        if (minimatch(path0, fromSource)) return true;
        if (minimatch(path0, fromBase)) return true;
      }
      if (minimatch(path0, excludePattern)) return true;
    }
  }
  return false;
});

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk.toString());
    });
    stream.on("end", () => {
      resolve(chunks.join(""));
    });
  });
}

function isFileChanged(filePath) {
  return md5File(filePath)
    .then((hash1) => {
      let hash = md5Cache[filePath];
      md5Cache[filePath] = hash1;
      if (!hash) {
        return true;
      }
      if (hash === hash1) {
        return false;
      }
      return true;
    })
    .catch((err) => {
      return true;
    });
}

function getFileCache(filePath, defaultData) {
  let cache = fileCache[filePath] || defaultData;
  return cache;
}

function setFileCache(filePath, newData) {
  fileCache[filePath] = newData;
}

function randomInt(min, max) {
  if (!min) min = 0;
  if (!max) throw "max range number required";
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Memorize cache
 *
 * @param {any} fn
 * @see {@link https://www.freecodecamp.org/news/understanding-memoize-in-javascript-51d07d19430e/}
 * @returns {typeof import('underscore').memoize}
 */
const memoize = (fn, debug) => {
  let cache = {};
  return (...args) => {
    let n = args[0];
    if (n in cache) {
      if (debug) console.log("Fetching from cache", n);
      //console.log(cache);
      return cache[n];
    } else {
      if (debug) console.log("Calculating result", n);
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};

module.exports = {
  memoize,
  isIgnore,
  randInt: randomInt,
  streamToString: streamToString,
  isFileChanged: isFileChanged,
  getFileCache: getFileCache,
  setFileCache: setFileCache,
  setHexo: setHexo,
};
