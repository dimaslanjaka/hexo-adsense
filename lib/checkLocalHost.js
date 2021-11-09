var dns = require("dns");
var os = require("os");
var ifaces = os.networkInterfaces();

/**
 * Check if address/dnsname is local
 * @param {*} address <ip address/dns name>
 * @see {@link https://github.com/sanketbajoria/check-localhost#readme}
 */
function checkLocalHost(address) {
  return new Promise((resolve, reject) => {
    dns.lookup(address, function (err, addr) {
      if (err) {
        return resolve(false, addr);
      }

      try {
        address = addr;
        Object.keys(ifaces).forEach(function (ifname) {
          ifaces[ifname].forEach(function (iface) {
            if (iface.address === address) resolve(true, iface);
          });
        });
        resolve(false, ifaces);
      } catch (err) {
        reject(err, addr);
      }
    });
  });
}

/**
 * is node localhost
 * @returns {Promise<boolean|Error>}
 */
function isLocalHost() {
  console.log("checking localhost");
  return new Promise(function (resolve, reject) {
    let address = ["127.0.0.1", "localhost"];
    for (let index = 0; index < address.length; index++) {
      const addr = address[index];
      checkLocalHost(addr)
        .then(function (result) {
          if (result) {
            console.log("true is localhost");
            return resolve(true);
          }
        })
        .catch(function () {});
    }
    resolve(false);
  });
}

module.exports = {
  default: checkLocalHost,
  isLocalHost,
};
