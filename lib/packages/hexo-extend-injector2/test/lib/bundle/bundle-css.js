'use strict';

require('chai').should();
const Hexo = require('hexo');
const Injector = require('../../../lib/injector');
const cssGenerator = require('../../../lib/bundle/css-generator');
const { resolve } = require('path');

describe('CSS Bundler', () => {
  it('basic', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/css-bundle')(hexo, injector);
    injector.register('css', 'a{--color: #6f42c1;}');
    injector.register('css', 'body {\n  color: #abc;\n}\n');

    injector.get('headend').text().should.eql('<link rel="stylesheet" type="text/css" href="/css/injector/main.css" />');

    const exec = cssGenerator(injector, 'default');
    return exec()
      .then(result => {
        result.should.eql('a{--color:#6f42c1}body{color:#abc}');
      });
  });

  it('v0.2 scheme', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/css-bundle')(hexo, injector);
    injector.register('css', { path: resolve(__dirname, 'test.css') });
    injector.register('css', { text: () => 'body {\n  color: #abc;\n}\n' });

    const exec = cssGenerator(injector, 'default');
    return exec()
      .then(result => {
        result.should.eql('.book1{color:#0ff}body{color:#abc}');
      });
  });

  it('dark mode', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/css-bundle')(hexo, injector);
    injector.register('css', 'a{--color: #6f42c1;}');
    injector.register('css', 'body {\n  color: #abc;\n}\n');
    injector.register('css', {env: 'dark', value: 'a{--color: #bbb;}'});
    injector.register('css', {env: 'dark', value: 'book{--color: #aaa;}'});

    injector.get('headend').text().should.eql('<link rel="stylesheet" type="text/css" href="/css/injector/main.css" /><link rel="preload" as="style" href="/css/injector/dark.css" />');

    let exec = cssGenerator(injector, 'default');
    return exec()
      .then(result => {
        result.should.eql('a{--color:#6f42c1}body{color:#abc}');
        exec = cssGenerator(injector, 'dark');
        return exec();
      })
      .then(result => {
        result.should.eql('a{--color:#bbb}book{--color:#aaa}');
      });
  });

  it('light mode', () => {
    const hexo = new Hexo();
    const injector = new Injector(hexo);
    require('../../../lib/bundle/css-bundle')(hexo, injector);
    injector.register('css', 'a{--color: #6f42c1;}');
    injector.register('css', 'body {\n  color: #abc;\n}\n');
    injector.register('css', {env: 'light', value: 'a{--color: #bbb;}'});
    injector.register('css', {env: 'light', value: 'book{--color: #aaa;}'});

    injector.get('headend').text().should.eql('<link rel="stylesheet" type="text/css" href="/css/injector/main.css" /><link rel="preload" as="style" href="/css/injector/light.css" />');

    let exec = cssGenerator(injector, 'default');
    return exec()
      .then(result => {
        result.should.eql('a{--color:#6f42c1}body{color:#abc}');
        exec = cssGenerator(injector, 'light');
        return exec();
      })
      .then(result => {
        result.should.eql('a{--color:#bbb}book{--color:#aaa}');
      });
  });

});
