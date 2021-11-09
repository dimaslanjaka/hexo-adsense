'use strict';

const Injector = require('./injector');
const { join } = require('path');
const { readFileSync } = require('fs');

const loadInjector = ctx => {
  const { filter } = ctx.extend;

  // Init injector
  const injector = new Injector(ctx);
  ctx.extend.injector2 = injector;
  ctx.on('generateBefore', () => {
    injector.clean();
  });
  injector.registerHelper();

  const { order, config } = injector;

  if (!config.disable_default_point) {
    injector.registerDefaultPoint();
  }

  // Load next plugin
  const themeD = JSON.parse(readFileSync(join(ctx.theme_dir, 'package.json'), 'utf-8'));
  if (themeD.name === 'hexo-theme-next') {
    if (config.load_next_compatible) {
      filter.register('after_init', () => {
        injector.registerNexTHelper();
      }, order.REGISTER_NEXT_HELPER);
    }
  } else {
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
