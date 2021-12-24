'use strict';
var handleDataPre = require('./handle-data-pre');
var jsGenerator = require('./js-generator');
var loadJsScript = function (ctx, injector, config) {
    var generator = ctx.extend.generator;
    var REGISTER_JS = injector.order.REGISTER_JS;
    var url_for = require('hexo-util').url_for.bind(ctx);
    injector.register('body-end', {
        value: "<script src=\"" + url_for(config.path) + "\"></script>",
        priority: REGISTER_JS
    });
    generator.register('js-bundler', function () {
        return {
            path: config.path,
            data: jsGenerator(injector, config.options)
        };
    });
};
module.exports = function (ctx, injector) {
    var config = injector.config.js;
    if (!config.enable)
        return;
    var filter = ctx.extend.filter;
    var isLoadJsScript = false;
    filter.register('injector2:register-js', function (data) {
        if (!isLoadJsScript) {
            loadJsScript(ctx, injector, config);
            isLoadJsScript = true;
        }
        handleDataPre(ctx, data, ['.js']);
    });
};
