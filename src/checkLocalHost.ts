import dns from 'dns';
import os from 'os';
import { memoize } from './utils';

const ifaces = os.networkInterfaces();

/**
 * Check if address/dns name is local
 * @param address - IP address or DNS name to check
 * @returns A promise that resolves to `true` if the address is local, otherwise `false`.
 * @see {@link https://github.com/sanketbajoria/check-localhost#readme}
 * @example
 * const locals = ["127.0.0.1", "localhost", "::1"];
 * checkLocalHost(locals[0]).then(isLocal => console.log(isLocal)); // isLocal is true
 */
export const checkLocalHost = memoize(function (address: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    dns.lookup(address, (err, addr) => {
      if (err) {
        return resolve(false);
      }

      try {
        address = addr;
        Object.keys(ifaces).forEach((ifname) => {
          ifaces[ifname]?.forEach((iface) => {
            if (iface.address === address) resolve(true);
          });
        });
        resolve(false);
      } catch (error) {
        reject(error);
      }
    });
  });
});

export default checkLocalHost;
