const checkLocalHost = require("../lib/checkLocalHost");
/*checkLocalHost("localhost").then(function (islocal) {
  console.log("Is localhost localhost -- " + islocal);
});
checkLocalHost("localhost2").then(function (islocal) {
  console.log("Is localhost2 localhost -- " + islocal);
});
checkLocalHost("127.0.0.1").then(function (islocal) {
  console.log("Is 127.0.0.1 localhost -- " + islocal);
});*/

["127.0.0.1", "localhost"].forEach((addr) => {
  checkLocalHost.default(addr).then(function () {
    console.log(arguments);
  });
});
