import ansiColors from 'ansi-colors';
import hexoLog from 'hexo-log';
import { debug } from 'sbg-utility';

type LoggerFunction = (...args: any[]) => void;

export const logname = ansiColors.magentaBright('hexo-adsense');

const once = (function (...fn: LoggerFunction[]) {
  let executed = false;
  return function () {
    if (!executed) {
      executed = true;
      // Do something
      if (typeof fn[0] === 'function') return fn[0]();
      console.log(fn);
    }
  };
})();

function stack(msg: string): void {
  const logLineDetails = new Error().stack?.split('at ')[3].trim();
  console.log('DEBUG', new Date().toUTCString(), logLineDetails, msg);
}

const defaultLogger = typeof hexo !== 'undefined' ? hexo.log : hexoLog({ silent: false, debug: true });
const logger = {
  stack,
  once
};

export const debugLog = function (...args: any[]) {
  debug('hexo-adsense')(...args);
  defaultLogger.debug(logname, ...args);
};

export default Object.assign(defaultLogger, logger);
