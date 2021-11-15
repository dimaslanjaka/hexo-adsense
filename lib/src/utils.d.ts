/**
 * Memorize cache
 *
 * @param {any} fn
 * @see {@link https://www.freecodecamp.org/news/understanding-memoize-in-javascript-51d07d19430e/}
 * @returns {typeof import('underscore').memoize}
 */
export function memoize(fn: any, debug: any): typeof import('underscore').memoize;
/**
 * Dump large objects
 * @param {string} filename
 * @param {any} obj
 */
export function dump(filename: string, ...obj: any): any;
export function isIgnore(path0: any, exclude: any, hexo: any): boolean;
declare function randomInt(min: any, max: any): number;
export function streamToString(stream: any): Promise<any>;
export function isFileChanged(filePath: any): any;
export function getFileCache(filePath: any, defaultData: any): any;
export function setFileCache(filePath: any, newData: any): void;
export function setHexo(inHexo: any): void;
import Promise = require("bluebird");
export { randomInt as randInt };
