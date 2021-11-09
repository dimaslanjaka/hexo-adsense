var dns = require("dns");
var os = require("os");
const { memoize } = require("./utils");
var ifaces = os.networkInterfaces();

/**
 * Check if address/dnsname is local
 * @param {*} address <ip address/dns name>
 * @see {@link https://github.com/sanketbajoria/check-localhost#readme}
 * @example
 * const locals = ["127.0.0.1", "localhost", "::1"];
 * checkLocalHost(locals[0]).then(function (isLocal){}) // isLocal is true
 */
const checkLocalHost = memoize(function (address) {
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
});

module.exports = {
  default: checkLocalHost,
};
