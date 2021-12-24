'use strict';

const Hexo = require('hexo');
const hexo = new Hexo();

const getLocalsFromType = type => {
  let options;
  switch (type) {
    case 'default': options = {context: {page: {}}}; break;
    case 'home': options = {context: {page: {__index: true}}}; break;
    case 'post': options = {context: {page: {__post: true}}}; break;
    case 'page': options = {context: {page: {__page: true}}}; break;
    case 'archive': options = {context: {page: {archive: true}}}; break;
    case 'category': options = {context: {page: {category: true}}}; break;
    case 'tag': options = {context: {page: {tag: true}}}; break;
    default: options = {context: {page: {layout: type}}}; break;
  }
  return options;
};

const Injector2 = require('../../lib/injector');
class Injector extends Injector2 {
  constructor() {
    super(hexo);
  }

  get(entry, to = 'default') {
    const options = getLocalsFromType(to);
    return super.get(entry, options).rendered().map(item => item.value);
  }
  getText(entry, to = 'default') {
    const options = getLocalsFromType(to);
    return super.get(entry, options).text();
  }
}

module.exports = Injector;
