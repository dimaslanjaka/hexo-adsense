'use strict';
var handleDataPre = require('./handle-data-pre');
var cssGenerator = require('./css-generator');
var loadCss = function (ctx, injector, config) {
    var generator = ctx.extend.generator;
    var options = config.options, file = config.file, env = config.env;
    var REGISTER_CSS = injector.order.REGISTER_CSS;
    var url_for = require('hexo-util').url_for.bind(ctx);
    if (file.link === 'preload') {
        injector.register('head-end', {
            value: "<link rel=\"preload\" as=\"style\" href=\"" + url_for(file.path) + "\" />",
            priority: REGISTER_CSS
        });
    }
    if (file.link === 'load') {
        injector.register('head-end', {
            value: "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + url_for(file.path) + "\" />",
            priority: REGISTER_CSS
        });
    }
    generator.register("css-bundler-" + env, function () {
        return {
            path: file.path,
            data: cssGenerator(injector, env, options)
        };
    });
};
module.exports = function (ctx, injector) {
    var config = injector.config.css;
    if (!config.enable)
        return;
    var filter = ctx.extend.filter;
    var _a = injector.order, REGISTER_VARIABLE = _a.REGISTER_VARIABLE, REGISTER_STYLE = _a.REGISTER_STYLE;
    filter.register('injector2:register-variable', function (data) {
        data.priority = REGISTER_VARIABLE;
        injector.register('css', data);
    });
    filter.register('injector2:register-style', function (data) {
        data.priority = REGISTER_STYLE;
        injector.register('css', data);
    });
    if (typeof config.path === 'string') {
        var path = config.path;
        config.path = {
            "default": {
                path: path,
                link: 'load'
            }
        };
    }
    var isLoadCss = {};
    filter.register('injector2:register-css', function (data) {
        var env = data.env || 'default';
        data.env = env;
        var file = config.path[env];
        var options = config.options;
        if (file && !isLoadCss[env]) {
            loadCss(ctx, injector, { options: options, env: env, file: file });
            isLoadCss[env] = true;
        }
        handleDataPre(ctx, data, ['.css', '.sass', '.styl']);
        data.predicate = function (ctx, options) { return options.env === env; };
    });
};
