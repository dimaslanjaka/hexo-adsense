'use strict';
var injectFilter = function (injector) { return function (data, locals) {
    function inject(data, pattern, flag, isBegin) {
        if (isBegin === void 0) { isBegin = true; }
        if (injector.config["injector_point_".concat(injector.formatKey(flag))])
            return data;
        var code = injector.get(flag, { context: locals }).text();
        if (!code.length)
            return data;
        return data.replace(pattern, function (str) { return isBegin ? str + code : code + str; });
    }
    // Inject head_begin
    data = inject(data, /<head.*?>/, 'head_begin', true);
    // Inject head_end
    data = inject(data, '</head>', 'head_end', false);
    // Inject body_begin
    data = inject(data, /<body.*?>/, 'body_begin', true);
    // Inject body_end
    data = inject(data, '</body>', 'body_end', false);
    return data;
}; };
module.exports = injectFilter;
