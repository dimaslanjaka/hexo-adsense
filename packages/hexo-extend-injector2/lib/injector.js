'use strict';

const order = require('./order');
const defaultConfig = require('./default-config');
const { mergeWith } = require('lodash');
// const { join } = require('path');
// const { readFileSync } = require('fs');
class Injector {
  constructor(ctx) {
    this._store = {};
    this._run = {};
    this._ctx = ctx;
    this.order = order;
    this.config = mergeWith(defaultConfig, ctx.config.injector, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return srcValue;
      }
    });
  }

  clean() {
    this._run = {};
  }

  get(entry, options) {
    entry = this.formatKey(entry);
    options = Object.assign({context: this._ctx}, options);
    const ctx = options.context;

    const _storeEntries = Array.from(this._store[entry] || []);
    const _runEntries = Array.from(this._run[entry] || []);

    const list = () => _storeEntries.concat(_runEntries)
      .filter(item => item.predicate(ctx, options))
      .sort((a, b) => a.priority - b.priority);

    const rendered = () => list()
      .map(item => {
        const renderItem = Object.assign({}, item);
        if (typeof item.value === 'function') {
          renderItem.value = item.value(ctx, options);
        }
        return renderItem;
      });

    const text = (sep = '') => rendered()
      .map(item => item.value)
      .join(sep);

    const toPromise = () => rendered()
      .map(item => Promise.resolve(item.value));

    return {list, rendered, text, toPromise};
  }

  getSize(entry) {
    entry = this.formatKey(entry);
    const storeLen = this._store[entry] ? this._store[entry].length : 0;
    const runLen = this._run[entry] ? this._run[entry].length : 0;
    return storeLen + runLen;
  }

  register(entry, value, predicate = () => true, priority = 10, isRun) {
    if (!entry) throw new TypeError('entry is required');
    entry = this.formatKey(entry);

    if (typeof value !== 'object') {
      value = { value };
    }
    const options = Object.assign({ predicate, priority, isRun }, value);

    const store = options.isRun ? this._run : this._store;
    store[entry] = store[entry] || [];

    if (typeof options.predicate === 'string') {
      options.predicate = this.is(options.predicate);
    }

    this._ctx.execFilterSync('injector2:register', options, {args: [entry]});
    this._ctx.execFilterSync(`injector2:register-${entry}`, options);

    store[entry].push(options);
    return this;
  }

  is(...types) {
    return locals => {
      for (const type of types) {
        if (type === 'home' && locals.page.__index) return true;
        if (type === 'post' && locals.page.__post) return true;
        if (type === 'page' && locals.page.__page) return true;
        if (type === 'archive' && locals.page.archive) return true;
        if (type === 'category' && locals.page.category) return true;
        if (type === 'tag' && locals.page.tag) return true;
        if (locals.page[type]) return true;
      }
      return false;
    };
  }

  formatKey(entry) {
    return entry.replace(/[-| |_]/g, '').toLowerCase();
  }

  registerDefaultPoint() {
    const { filter } = this._ctx.extend;
    filter.register('_after_html_render', require('./filter')(this));
  }

  registerHelper() {
    const self = this;
    const { helper } = this._ctx.extend;
    helper.register('injector', function(point) {
      return require('./helper/injector')(self, this)(point);
    });
  }

  registerNexTHelper() {
    // 为了能覆盖主题中的注册，请在after_init中调用
    const self = this;
    const { helper } = this._ctx.extend;
    helper.register('next_inject', function(point) {
      return require('./helper/next-inject')(self, this)(point);
    });
  }
}

module.exports = Injector;
