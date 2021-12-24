'use strict';
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Compatible with next theme injector
 */
var points = require('./next-point');
var fs = require('fs');
var path = require('path');
var defaultExtname = '.swig';
// Defining stylus types
var StylusInject = /** @class */ (function () {
    function StylusInject(base_dir) {
        this.base_dir = base_dir;
        this.files = [];
    }
    StylusInject.prototype.push = function (file) {
        // Get absolute path base on hexo dir
        this.files.push(path.resolve(this.base_dir, file));
    };
    return StylusInject;
}());
// Defining view types
var ViewInject = /** @class */ (function () {
    function ViewInject(base_dir) {
        this.base_dir = base_dir;
        this.raws = [];
    }
    ViewInject.prototype.raw = function (name, raw) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        // Set default extname
        if (path.extname(name) === '') {
            name += defaultExtname;
        }
        this.raws.push({ name: name, raw: raw, args: args });
    };
    ViewInject.prototype.file = function (name, file) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        // Set default extname from file's extname
        if (path.extname(name) === '') {
            name += path.extname(file);
        }
        // Get absolute path base on hexo dir
        this.raw.apply(this, __spreadArray([name, fs.readFileSync(path.resolve(this.base_dir, file), 'utf8')], args, false));
    };
    return ViewInject;
}());
// Init injects
function initInject(base_dir) {
    var injects = {};
    points.styles.forEach(function (item) {
        injects[item] = new StylusInject(base_dir);
    });
    points.views.forEach(function (item) {
        injects[item] = new ViewInject(base_dir);
    });
    return injects;
}
module.exports = function (ctx, injector) {
    ctx.on('generateBefore', function () {
        var injects = initInject(ctx.base_dir);
        ctx.execFilterSync('theme_inject', injects);
        // stylus
        points.styles.forEach(function (type) {
            injects[type].files.forEach(function (file) { return injector.register(type, file, function () { return true; }, 10, true); });
        });
        // view
        points.views.forEach(function (type) {
            injects[type].raws
                .map(function (injectObj, index) {
                var name = injectObj.name;
                var layout = "inject/".concat(type, "/").concat(name);
                if (!ctx.theme.getView(layout)) {
                    ctx.theme.setView(layout, injectObj.raw);
                }
                var locals = injectObj.args[0];
                var options = injectObj.args[1];
                var order = injectObj.args[2] || index;
                var value = function (ctx) { return ctx.partial(layout, locals, options); };
                return { value: value, priority: order, name: name, layout: layout, locals: locals, options: options, isRun: true };
            })
                .sort(function (a, b) { return b.priority - a.priority; })
                .forEach(function (data) { return injector.register(type, data); });
        });
    });
};
