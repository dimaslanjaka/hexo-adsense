'use strict';

module.exports = (injector, ctx) => point => {
  injector.config[`injector_point_${injector.formatKey(point)}`] = true;
  return injector.get(point, { context: ctx });
};
