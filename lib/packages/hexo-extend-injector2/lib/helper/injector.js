'use strict';
module.exports = function (injector, ctx) { return function (point) {
    injector.config["injector_point_".concat(injector.formatKey(point))] = true;
    return injector.get(point, { context: ctx });
}; };
