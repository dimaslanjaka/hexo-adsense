'use strict';

require('chai').should();
const Injector = require('../../lib/injector');
const Hexo = require('hexo');
const hexo = new Hexo();

describe('injector', () => {

  it('basic', () => {
    const injector = new Injector(hexo);
    injector.register('body-end', 'a');
    injector.register('body-end', 'b');
    injector.get('body-end').list().should.have.lengthOf(2);
    injector.get('body-end').text().should.eql('ab');
  });

  it('format key', () => {
    const injector = new Injector(hexo);
    const registerKey = 'o n_e-tW o';
    injector.register(registerKey, 'a');
    injector.formatKey(registerKey).should.eql('onetwo');
  });

  it('value is function, should render when call rendered', () => {
    const injector = new Injector(hexo);
    injector.register('one', () => 'a');
    injector.get('one').rendered()[0].should.include({value: 'a'});
  });

  it('exec predicate', () => {
    const injector = new Injector(hexo);
    const homeEnv = {page: {__index: true}};
    const postEnv = {page: {__post: true}};
    const pageEnv = {page: {__page: true}};
    injector.register('one', 'a', 'home');
    injector.register('one', 'b', 'post');
    injector.register('one', 'c', injector.is('post', 'page'));
    injector.register('one', 'd', ctx => ctx.page.__index || ctx.page.__page);
    injector.get('one', {context: homeEnv}).text().should.eql('ad');
    injector.get('one', {context: postEnv}).text().should.eql('bc');
    injector.get('one', {context: pageEnv}).text().should.eql('cd');
  });

  it('exec priority', () => {
    const injector = new Injector(hexo);
    injector.register('one', 'a', () => true, 2);
    injector.register('one', 'b', () => true, 1);
    injector.get('one').text().should.eql('ba');
  });

  it('should be clean when isRun is true', () => {
    const injector = new Injector(hexo);
    injector.register('one', 'a', () => true, 2, true);
    injector.register('one', 'b', () => true, 1, false);
    injector.clean();
    injector.get('one').text().should.eql('b');
  });

  it('getSize()', () => {
    const injector = new Injector(hexo);
    injector.register('one', 'a', () => true, 2, true);
    injector.register('one', 'b', () => true, 1, false);
    injector.register('two', 'c', () => true, 1, true);
    injector.register('three', 'c', () => true, 1, false);
    injector.getSize('one').should.eql(2);
    injector.getSize('two').should.eql(1);
    injector.getSize('three').should.eql(1);
    injector.getSize('four').should.eql(0);
    injector.clean();
    injector.getSize('one').should.eql(1);
    injector.getSize('two').should.eql(0);
    injector.getSize('three').should.eql(1);
    injector.getSize('four').should.eql(0);
  });

  it('exec filter', () => {
    const newHexo = new Hexo();
    const injector = new Injector(newHexo);
    newHexo.extend.filter.register('injector2:register', data => {
      data.value += 'x';
    });
    newHexo.extend.filter.register('injector2:register-bodyend', data => {
      data.value += 'bodyend';
    });
    injector.register('body-end', 'a');
    injector.register('body-end', 'b');
    injector.register('one', 'a', () => true, 2, true);
    injector.get('bodyend').text().should.eql('axbodyendbxbodyend');
    injector.get('one').text().should.eql('ax');
  });

});
