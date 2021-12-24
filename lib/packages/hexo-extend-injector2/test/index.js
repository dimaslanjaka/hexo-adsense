'use strict';

const Hexo = require('hexo');
// eslint-disable-next-line no-unused-vars
const hexo = new Hexo(__dirname, { silent: true });

describe('main', () => {
  require('./lib/injector');
  describe('helper', () => {
    require('./lib/helper/injector');
    require('./lib/helper/next-inject');
  });
  describe('bundler', () => {
    require('./lib/bundle/bundle-js');
    require('./lib/bundle/bundle-css');
  });
  require('./lib/hexo-compatible');
});
