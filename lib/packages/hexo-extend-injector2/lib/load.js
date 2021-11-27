'use strict';
var Injector = require('./injector');
var join = require('path').join;
var readFileSync = require('fs').readFileSync;
var loadInjector = function (ctx) {
    var filter = ctx.extend.filter;
    // Init injector
    var injector = new Injector(ctx);
    ctx.extend.injector2 = injector;
    ctx.on('generateBefore', function () {
        injector.clean();
    });
    injector.registerHelper();
    var order = injector.order, config = injector.config;
    if (!config.disable_default_point) {
        injector.registerDefaultPoint();
    }
    // Load next plugin
    var themeD = JSON.parse(readFileSync(join(ctx.theme_dir, 'package.json'), 'utf-8'));
    if (themeD.name === 'hexo-theme-next') {
        if (config.load_next_compatible) {
            filter.register('after_init', function () {
                injector.registerNexTHelper();
            }, order.REGISTER_NEXT_HELPER);
        }
    }
    else {
        if (config.load_next_plugin) {
            require('./next')(ctx, injector);
        }
    }
    // Build js and css bundler
    require('./bundle/js-bundle')(ctx, injector);
    require('./bundle/css-bundle')(ctx, injector);
    return injector;
};
module.exports = loadInjector;
