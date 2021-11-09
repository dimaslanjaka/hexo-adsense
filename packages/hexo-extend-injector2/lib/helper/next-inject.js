'use strict';

const injectorHelper = require('./injector');

module.exports = (injector, ctx) => point => {
  const nextInject = ctx.theme.injects[point]
    .map(item => ctx.partial(item.layout, item.locals, item.options))
    .join('');
  let injector2 = injectorHelper(injector, ctx)(point).text();
  if (point === 'head') {
    injector2 += injectorHelper(injector, ctx)('head-end').text();
  }
  return nextInject + injector2;
};
