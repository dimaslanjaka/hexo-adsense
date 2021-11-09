'use strict';

const handleDataPre = require('./handle-data-pre');
const jsGenerator = require('./js-generator');

const loadJsScript = (ctx, injector, config) => {
  const { generator } = ctx.extend;
  const { REGISTER_JS } = injector.order;

  const url_for = require('hexo-util').url_for.bind(ctx);
  injector.register('body-end', {
    value: `<script src="${url_for(config.path)}"></script>`,
    priority: REGISTER_JS
  });

  generator.register('js-bundler', () => {
    return {
      path: config.path,
      data: jsGenerator(injector, config.options)
    };
  });
};

module.exports = (ctx, injector) => {

  const config = injector.config.js;

  if (!config.enable) return;

  const { filter } = ctx.extend;

  let isLoadJsScript = false;

  filter.register('injector2:register-js', data => {
    if (!isLoadJsScript) {
      loadJsScript(ctx, injector, config);
      isLoadJsScript = true;
    }
    handleDataPre(ctx, data, ['.js']);
  });

};
