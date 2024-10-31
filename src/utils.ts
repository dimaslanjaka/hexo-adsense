import Bluebird from 'bluebird';
import fs from 'fs';
import { minimatch } from 'minimatch';
import path from 'path';
import { md5FileSync, normalizePath, normalizePathUnix, writefile } from 'sbg-utility';
import { fileURLToPath } from 'url';
import * as util from 'util';

const md5Cache: Record<string, string> = {};
const fileCache: Record<string, any> = {};

// ESM-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param path0
 * @param exclude
 * @param hexo
 * @returns boolean
 */
const isIgnore = (path0: string, exclude: string | string[], hexo: any): boolean => {
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path0 && exclude && exclude.length) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      const excludePattern = exclude[i];
      if (hexo) {
        const fromBase = normalizePathUnix(hexo.base_dir, excludePattern);
        const fromSource = normalizePathUnix(hexo.source_dir, excludePattern);
        if (minimatch(path0, fromSource)) return true;
        if (minimatch(path0, fromBase)) return true;
      }
      if (minimatch(path0, excludePattern)) return true;
    }
  }
  return false;
};

function streamToString(stream: NodeJS.ReadWriteStream): Promise<string> {
  return new Bluebird((resolve, reject) => {
    const chunks: string[] = [];
    stream.on('data', (chunk) => chunks.push(chunk.toString()));
    stream.on('end', () => resolve(chunks.join('')));
    stream.on('error', reject);
  });
}

async function isFileChanged(filePath: string): Promise<boolean> {
  try {
    const hash1 = md5FileSync(filePath);
    const hash = md5Cache[filePath];
    md5Cache[filePath] = hash1;
    return !hash || hash !== hash1;
  } catch {
    return true;
  }
}

function getFileCache(filePath: string, defaultData: any): any {
  return fileCache[filePath] || defaultData;
}

function setFileCache(filePath: string, newData: any): void {
  fileCache[filePath] = newData;
}

function randomInt(min = 0, max: number): number {
  if (max === undefined) throw new Error('max range number required');
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const memoize = (fn: (...args: any[]) => any, debug?: boolean) => {
  const cache: Record<any, any> = {};
  return (...args: any[]) => {
    const n = args[0];
    if (n in cache) {
      if (debug) console.log('Fetching from cache', n);
      return cache[n];
    } else {
      if (debug) console.log('Calculating result', n);
      const result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};

export const tmpFolder = normalizePath(typeof hexo !== 'undefined' ? hexo.base_dir : process.cwd(), 'tmp/hexo-adsense');

let isFirst = true;
function dump(filename: string, ...obj: any[]): void {
  const loc = path.join(tmpFolder, 'dump', filename);
  if (!fs.existsSync(path.dirname(loc))) {
    fs.mkdirSync(path.dirname(loc));
  } else if (isFirst) {
    isFirst = false;
    writefile(loc, '');
  }
  writefile(loc, util.inspect(obj));
  console.log(`Dump results saved to ${loc}`);
}

export { dump, getFileCache, isFileChanged, isIgnore, memoize, randomInt as randInt, setFileCache, streamToString };
