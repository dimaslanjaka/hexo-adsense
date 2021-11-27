'use strict';
var order = require('./order');
var defaultConfig = require('./default-config');
var mergeWith = require('lodash').mergeWith;
// const { join } = require('path');
// const { readFileSync } = require('fs');
var Injector = /** @class */ (function () {
    function Injector(ctx) {
        this._store = {};
        this._run = {};
        this._ctx = ctx;
        this.order = order;
        this.config = mergeWith(defaultConfig, ctx.config.injector, function (objValue, srcValue) {
            if (Array.isArray(objValue)) {
                return srcValue;
            }
        });
    }
    Injector.prototype.clean = function () {
        this._run = {};
    };
    Injector.prototype.get = function (entry, options) {
        entry = this.formatKey(entry);
        options = Object.assign({ context: this._ctx }, options);
        var ctx = options.context;
        var _storeEntries = Array.from(this._store[entry] || []);
        var _runEntries = Array.from(this._run[entry] || []);
        var list = function () { return _storeEntries.concat(_runEntries)
            .filter(function (item) { return item.predicate(ctx, options); })
            .sort(function (a, b) { return a.priority - b.priority; }); };
        var rendered = function () { return list()
            .map(function (item) {
            var renderItem = Object.assign({}, item);
            if (typeof item.value === 'function') {
                renderItem.value = item.value(ctx, options);
            }
            return renderItem;
        }); };
        var text = function (sep) {
            if (sep === void 0) { sep = ''; }
            return rendered()
                .map(function (item) { return item.value; })
                .join(sep);
        };
        var toPromise = function () { return rendered()
            .map(function (item) { return Promise.resolve(item.value); }); };
        return { list: list, rendered: rendered, text: text, toPromise: toPromise };
    };
    Injector.prototype.getSize = function (entry) {
        entry = this.formatKey(entry);
        var storeLen = this._store[entry] ? this._store[entry].length : 0;
        var runLen = this._run[entry] ? this._run[entry].length : 0;
        return storeLen + runLen;
    };
    Injector.prototype.register = function (entry, value, predicate, priority, isRun) {
        if (predicate === void 0) { predicate = function () { return true; }; }
        if (priority === void 0) { priority = 10; }
        if (!entry)
            throw new TypeError('entry is required');
        entry = this.formatKey(entry);
        if (typeof value !== 'object') {
            value = { value: value };
        }
        var options = Object.assign({ predicate: predicate, priority: priority, isRun: isRun }, value);
        var store = options.isRun ? this._run : this._store;
        store[entry] = store[entry] || [];
        if (typeof options.predicate === 'string') {
            options.predicate = this.is(options.predicate);
        }
        this._ctx.execFilterSync('injector2:register', options, { args: [entry] });
        this._ctx.execFilterSync("injector2:register-" + entry, options);
        store[entry].push(options);
        return this;
    };
    Injector.prototype.is = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        return function (locals) {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var type = types_1[_i];
                if (type === 'home' && locals.page.__index)
                    return true;
                if (type === 'post' && locals.page.__post)
                    return true;
                if (type === 'page' && locals.page.__page)
                    return true;
                if (type === 'archive' && locals.page.archive)
                    return true;
                if (type === 'category' && locals.page.category)
                    return true;
                if (type === 'tag' && locals.page.tag)
                    return true;
                if (locals.page[type])
                    return true;
            }
            return false;
        };
    };
    Injector.prototype.formatKey = function (entry) {
        return entry.replace(/[-| |_]/g, '').toLowerCase();
    };
    Injector.prototype.registerDefaultPoint = function () {
        var filter = this._ctx.extend.filter;
        filter.register('_after_html_render', require('./filter')(this));
    };
    Injector.prototype.registerHelper = function () {
        var self = this;
        var helper = this._ctx.extend.helper;
        helper.register('injector', function (point) {
            return require('./helper/injector')(self, this)(point);
        });
    };
    Injector.prototype.registerNexTHelper = function () {
        // 为了能覆盖主题中的注册，请在after_init中调用
        var self = this;
        var helper = this._ctx.extend.helper;
        helper.register('next_inject', function (point) {
            return require('./helper/next-inject')(self, this)(point);
        });
    };
    return Injector;
}());
module.exports = Injector;
