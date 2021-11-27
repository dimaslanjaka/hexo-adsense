'use strict';
/**
 * 兼容以前的版本 v0.2
 * injector.register('css', {text: '.book{font-size:2rem}'});
 * injector.register('css', {path: 'xxxx.css'});
 */
var resolve = require('path').resolve;
module.exports = function (ctx, data, suffixes) {
    if (suffixes === void 0) { suffixes = []; }
    if (data.path) {
        data.value = function () { return ctx.render.render({ path: resolve(ctx.base_dir, data.path) }); };
        return;
    }
    if (data.text) {
        data.value = data.text;
        return;
    }
    if (typeof data.value === 'string') {
        var str_1 = data.value;
        for (var _i = 0, suffixes_1 = suffixes; _i < suffixes_1.length; _i++) {
            var suffix = suffixes_1[_i];
            if (str_1.endsWith(suffix)) {
                data.value = function () { return ctx.render.render({ path: resolve(ctx.base_dir, str_1) }); };
                return;
            }
        }
    }
};
