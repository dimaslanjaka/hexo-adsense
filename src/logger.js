var logger = {
  log: log2,
  once: once,
};

var once = (function (...fn) {
  var executed = false;
  return function () {
    if (!executed) {
      executed = true;
      // do something
      if (typeof fn[0] == "function") return fn[0]();
      console.log(fn);
    }
  };
})();

function log2(msg) {
  let logLineDetails = new Error().stack.split("at ")[3].trim();
  console.log("DEBUG", new Date().toUTCString(), logLineDetails, msg);
}

module.exports = logger;
