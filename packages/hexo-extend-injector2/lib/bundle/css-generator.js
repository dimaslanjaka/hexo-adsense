'use strict';

const CleanCSS = require('clean-css');

module.exports = (injector, env, options) => () => {
  return Promise.all(injector.get('css', { env }).toPromise())
    .then(values => values.join('\n'))
    .then(source => {
      const output = new CleanCSS(options).minify(source);
      if (output.error) throw output.error;
      return output.styles;
    });
};
