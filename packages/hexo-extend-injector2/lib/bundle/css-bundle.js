'use strict';

const handleDataPre = require('./handle-data-pre');
const cssGenerator = require('./css-generator');


const loadCss = (ctx, injector, config) => {
  const { generator } = ctx.extend;
  const { options, file, env } = config;
  const { REGISTER_CSS } = injector.order;

  const url_for = require('hexo-util').url_for.bind(ctx);
  if (file.link === 'preload') {
    injector.register('head-end', {
      value: `<link rel="preload" as="style" href="${url_for(file.path)}" />`,
      priority: REGISTER_CSS
    });
  }
  if (file.link === 'load') {
    injector.register('head-end', {
      value: `<link rel="stylesheet" type="text/css" href="${url_for(file.path)}" />`,
      priority: REGISTER_CSS
    });
  }

  generator.register(`css-bundler-${env}`, () => {
    return {
      path: file.path,
      data: cssGenerator(injector, env, options)
    };
  });

};

module.exports = (ctx, injector) => {

  const config = injector.config.css;

  if (!config.enable) return;

  const { filter } = ctx.extend;

  const { REGISTER_VARIABLE, REGISTER_STYLE } = injector.order;

  filter.register('injector2:register-variable', data => {
    data.priority = REGISTER_VARIABLE;
    injector.register('css', data);
  });
  filter.register('injector2:register-style', data => {
    data.priority = REGISTER_STYLE;
    injector.register('css', data);
  });

  if (typeof config.path === 'string') {
    const { path } = config;
    config.path = {
      default: {
        path,
        link: 'load'
      }
    };
  }

  const isLoadCss = {};

  filter.register('injector2:register-css', data => {
    const env = data.env || 'default';
    data.env = env;
    const file = config.path[env];
    const options = config.options;
    if (file && !isLoadCss[env]) {
      loadCss(ctx, injector, {options, env, file});
      isLoadCss[env] = true;
    }
    handleDataPre(ctx, data, ['.css', '.sass', '.styl']);
    data.predicate = (ctx, options) => options.env === env;
  });

};
