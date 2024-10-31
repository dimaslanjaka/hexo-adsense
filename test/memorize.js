const utils = require('../tmp/dist/src/utils.js');
const memoize = utils.memoize;
const factorial = memoize((x) => {
  if (x === 0) {
    return 1;
  } else {
    return x * factorial(x - 1);
  }
}, true);
console.log(factorial(5)); // calculated
console.log(factorial(6)); // calculated for 6 and cached for 5
