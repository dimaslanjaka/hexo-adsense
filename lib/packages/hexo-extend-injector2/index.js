'use strict';
var resolve = require('path').resolve;
module.exports = function (ctx) {
    // If initialized, return the result
    if (ctx.extend.injector2) {
        return ctx.extend.injector2;
    }
    // If not in the main plugin directory, relocate to the main plugin directory
    var load = require(resolve(ctx.plugin_dir, 'hexo-extend-injector2/lib/load'));
    return load(ctx);
};
