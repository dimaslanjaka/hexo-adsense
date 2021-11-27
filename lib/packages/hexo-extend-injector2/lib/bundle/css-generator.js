'use strict';
var CleanCSS = require('clean-css');
module.exports = function (injector, env, options) { return function () {
    return Promise.all(injector.get('css', { env: env }).toPromise())
        .then(function (values) { return values.join('\n'); })
        .then(function (source) {
        var output = new CleanCSS(options).minify(source);
        if (output.error)
            throw output.error;
        return output.styles;
    });
}; };
