/* eslint-disable no-global-assign */
/* global hexo */
"use strict";
var minimatch = require("minimatch");
var Promise = require("bluebird");
var md5File = require("md5-file");
var underscore = require("underscore");
var Hexo = require("hexo");
var md5Cache = {};
var fileCache = {};
var log = require("./log");
var path = require("path");
var util = require("util");
var fs = require("fs");
var rimraf = require("rimraf");
if (typeof hexo == "undefined") {
    /**
     * @type {Hexo}
     */
    var hexo_1;
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
var isIgnore = function (path0, exclude, hexo) {
    if (exclude && !Array.isArray(exclude))
        exclude = [exclude];
    if (path0 && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            var excludePattern = exclude[i];
            if (hexo) {
                var fromBase = path.join(hexo.base_dir, excludePattern);
                var fromSource = path.join(hexo.source_dir, excludePattern);
                //log.log([path0, fromBase, fromSource, excludePattern]);
                if (minimatch(path0, fromSource))
                    return true;
                if (minimatch(path0, fromBase))
                    return true;
            }
            if (minimatch(path0, excludePattern))
                return true;
        }
    }
    return false;
};
function streamToString(stream) {
    return new Promise(function (resolve, reject) {
        var chunks = [];
        stream.on("data", function (chunk) {
            chunks.push(chunk.toString());
        });
        stream.on("end", function () {
            resolve(chunks.join(""));
        });
    });
}
function isFileChanged(filePath) {
    return md5File(filePath)
        .then(function (hash1) {
        var hash = md5Cache[filePath];
        md5Cache[filePath] = hash1;
        if (!hash) {
            return true;
        }
        if (hash === hash1) {
            return false;
        }
        return true;
    })["catch"](function (err) {
        return true;
    });
}
function getFileCache(filePath, defaultData) {
    var cache = fileCache[filePath] || defaultData;
    return cache;
}
function setFileCache(filePath, newData) {
    fileCache[filePath] = newData;
}
function randomInt(min, max) {
    if (!min)
        min = 0;
    if (!max)
        throw "max range number required";
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
var memoize = function (fn, debug) {
    var cache = {};
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var n = args[0];
        if (n in cache) {
            if (debug)
                console.log("Fetching from cache", n);
            //console.log(cache);
            return cache[n];
        }
        else {
            if (debug)
                console.log("Calculating result", n);
            var result = fn(n);
            cache[n] = result;
            return result;
        }
    };
};
var isFirst = true;
/**
 * Dump large objects
 * @param {string} filename
 * @param {any} obj
 */
function dump(filename) {
    var obj = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        obj[_i - 1] = arguments[_i];
    }
    var loc = path.join(__dirname, "../tmp", filename);
    if (!fs.existsSync(path.dirname(loc))) {
        fs.mkdirSync(path.dirname(loc));
    }
    else if (isFirst) {
        isFirst = false;
        rimraf(loc, function (err) {
            console.log(loc, "deleted", err ? "fail" : "success");
        });
        return dump(filename, obj);
    }
    fs.writeFileSync(loc, util.inspect(obj));
    console.log("dump results saved to ".concat(loc));
}
module.exports = {
    memoize: memoize,
    dump: dump,
    isIgnore: isIgnore,
    randInt: randomInt,
    streamToString: streamToString,
    isFileChanged: isFileChanged,
    getFileCache: getFileCache,
    setFileCache: setFileCache,
    setHexo: setHexo
};
