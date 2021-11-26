var logger = {
    log: log2,
    once: once
};
var once = (function () {
    var fn = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fn[_i] = arguments[_i];
    }
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;
            // do something
            if (typeof fn[0] == "function")
                return fn[0]();
            console.log(fn);
        }
    };
})();
function log2(msg) {
    var logLineDetails = new Error().stack.split("at ")[3].trim();
    console.log("DEBUG", new Date().toUTCString(), logLineDetails, msg);
}
module.exports = logger;
