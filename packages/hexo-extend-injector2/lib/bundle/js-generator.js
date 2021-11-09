'use strict';

const { minify } = require('terser');

module.exports = (injector, options) => () => {
  return Promise.all(injector.get('js').toPromise())
    .then(values => values.join('\n'))
    .then(source => minify(source, options))
    .then(result => result.code);
};
