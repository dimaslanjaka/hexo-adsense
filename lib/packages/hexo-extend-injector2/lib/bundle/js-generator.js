'use strict';
var minify = require('terser').minify;
module.exports = function (injector, options) { return function () {
    return Promise.all(injector.get('js').toPromise())
        .then(function (values) { return values.join('\n'); })
        .then(function (source) { return minify(source, options); })
        .then(function (result) { return result.code; });
}; };
