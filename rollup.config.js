import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import fs from 'fs';
import jsonc from 'jsonc-parser';
import path from 'path';
import { dts } from 'rollup-plugin-dts';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @type {typeof import('./package.json')}
 */
const pkg = jsonc.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const { author, dependencies, devDependencies, name, version } = pkg;
export const external = Object.keys(dependencies)
  .concat(...Object.keys(devDependencies), 'lodash', 'underscore')
  .filter((pkgName) => !['hexo-is', 'p-limit', 'deepmerge-ts'].includes(pkgName));

/**
 * @type {import('rollup').RollupOptions}
 */
const declarations = {
  input: './tmp/dist/src/index.d.ts',
  output: [
    { file: 'dist/index.d.ts', format: 'es' },
    { file: 'dist/index.d.cts', format: 'es' },
    { file: 'dist/index.d.mts', format: 'es' }
  ],
  plugins: [dts()]
};

const banner = `// ${name} ${version} by ${author.name} <${author.email}> (${author.url})`.trim();
const esmBanner = `
${banner}

// import nodeUrl from 'node:url';
// import nodePath from 'path';
// const __filename = nodeUrl.fileURLToPath(import.meta.url);
// const __dirname = nodePath.dirname(__filename);
`.trim();

/**
 * @type {import('rollup').RollupOptions}
 */
const libs = {
  // input: './tmp/dist/src/index.js',
  input: './src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      exports: 'named',
      banner: esmBanner,
      inlineDynamicImports: true
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
      banner,
      inlineDynamicImports: true
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
      banner: esmBanner,
      inlineDynamicImports: true
    }
  ],
  external,
  plugins: [
    typescript({
      tsconfig: false,
      compilerOptions: {
        module: 'ESNext',
        target: 'ESNext',
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        noImplicitAny: false,
        strict: false
      }
    }),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' })
  ]
};

export default [declarations, libs];
