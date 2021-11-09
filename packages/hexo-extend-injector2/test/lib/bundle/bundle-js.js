'use strict';

require('chai').should();
const Hexo = require('hexo');
const Injector = require('../../../lib/injector');
const jsGenerator = require('../../../lib/bundle/js-generator');
const { resolve } = require('path');

describe('JS Bundler', () => {
  it('basic', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/js-bundle')(hexo, injector);
    injector.register('js', 'var a=1;');
    injector.register('js', 'var b=1;');

    injector.get('bodyend').text().should.eql('<script src="/js/injector.js"></script>');
    const exec = jsGenerator(injector);
    return exec().then(result => {
      result.should.eql('var a=1,b=1;');
    });
  });

  it('v0.2 scheme', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/js-bundle')(hexo, injector);
    injector.register('js', { path: resolve(__dirname, 'test.js') });
    injector.register('js', { text: () => 'var b=1;' });
    const exec = jsGenerator(injector);
    return exec().then(result => {
      result.should.eql('var a=1,b=1;');
    });
  });

});
