'use strict';

require('chai').should();
const Injector = require('../../../lib/injector');
const Hexo = require('hexo');
const hexo = new Hexo();
const injectorHelper = require('../../../lib/helper/injector');

describe('injector', () => {

  it('injector(point).text()', () => {
    const injector = new Injector(hexo);
    injector.register('body-start', 'xx');
    injector.register('head-start', 'ww');
    injector.register('head-end', 'cc');
    injector.register('body-end', 'a');
    injector.register('body end', 'b');
    injector.register('bodyend', 'c');
    injector.register('body_end', 'd');
    const result = injectorHelper(injector)('body-end').text();
    injector.config.injector_point_bodyend.should.be.true;
    result.should.eql('abcd');
  });

  it('use injector(point).text() in home', () => {
    const injector = new Injector(hexo);
    injector.register('body-end', 'a');
    injector.register('body-end', 'b', 'home');
    injector.register('body-end', 'v', injector.is('post'));
    const result = injectorHelper(injector, {page: {__index: true}})('body-end').text();
    injector.config.injector_point_bodyend.should.be.true;
    result.should.eql('ab');
  });

  it('use injector(point).text() in post', () => {
    const injector = new Injector(hexo);
    injector.register('body-end', 'a');
    injector.register('body-end', 'b', 'home');
    injector.register('body-end', 'v', injector.is('post'));
    const result = injectorHelper(injector, {page: {__post: true}})('body-end').text();
    injector.config.injector_point_bodyend.should.be.true;
    result.should.eql('av');
  });

});
