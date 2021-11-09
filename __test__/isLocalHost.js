const checkLocalHost = require("../lib/checkLocalHost");
checkLocalHost.default("localhost").then(function (islocal) {
  console.log("Is localhost localhost -- " + islocal);
});
checkLocalHost.default("localhost2").then(function (islocal) {
  console.log("Is localhost2 localhost -- " + islocal);
});
checkLocalHost.default("127.0.0.1").then(function (islocal) {
  console.log("Is 127.0.0.1 localhost -- " + islocal);
});

["127.0.0.1", "localhost", "::1"].forEach((addr) => {
  checkLocalHost.default(addr).then(function () {
    console.log(addr, arguments);
  });
});
