/**
 * Check if address/dnsname is local
 * @param {*} address <ip address/dns name>
 * @see {@link https://github.com/sanketbajoria/check-localhost#readme}
 * @example
 * const locals = ["127.0.0.1", "localhost", "::1"];
 * checkLocalHost(locals[0]).then(function (isLocal){}) // isLocal is true
 */
declare const checkLocalHost: <T = Function>(fn: T, hashFn?: (...args: any[]) => string) => T;
export { checkLocalHost as default };
