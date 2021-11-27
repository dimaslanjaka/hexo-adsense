'use strict';
var injectorHelper = require('./injector');
module.exports = function (injector, ctx) { return function (point) {
    var nextInject = ctx.theme.injects[point]
        .map(function (item) { return ctx.partial(item.layout, item.locals, item.options); })
        .join('');
    var injector2 = injectorHelper(injector, ctx)(point).text();
    if (point === 'head') {
        injector2 += injectorHelper(injector, ctx)('head-end').text();
    }
    return nextInject + injector2;
}; };
