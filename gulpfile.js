import Bluebird from 'bluebird';
import fs from 'fs-extra';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-html-minifier-terser';
import sourcemaps from 'gulp-sourcemaps';
import gulpTerser from 'gulp-terser';
import path from 'path';
import * as terser from 'terser';
import { fileURLToPath } from 'url';
import pkg from './package.json' assert { type: 'json' };
import * as cp from 'cross-spawn';
import browserify from 'browserify';
import through2 from 'through2';

// ESM-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function promiseStream(stream) {
  return new Bluebird((resolve, reject) => {
    stream.once('end', () => resolve());
    stream.on('error', reject);
  });
}

export function sourceJs() {
  return gulp
    .src('./source/*.js')
    .pipe(
      through2.obj((file, enc, next) => {
        var self = this;

        if (file.isStream()) {
          self.emit('error', new Error('browserify', 'Streams not supported'));
          return next();
        }

        if (file.isNull()) {
          return next();
        }

        const b = browserify();
        b.add(file.path);
        b.bundle(function (err, result) {
          if (err) {
            console.log(err);
            return next(err);
          }
          file.contents = result;
          next(null, file);
        });
      })
    )
    .pipe(gulpTerser({}, terser.minify))
    .pipe(gulp.dest('./dist/source'));
}

export function sourceCss() {
  return gulp
    .src('./source/*.css')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(autoprefixer())
    .pipe(
      cleanCSS({ compatibility: 'ie8', debug: true }, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/source'));
}

export function sourceHtml() {
  return gulp
    .src('source/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        preserveLineBreaks: true
      })
    )
    .pipe(gulp.dest('./dist/source'));
}

function updateVersion() {
  return new Bluebird((resolve) => {
    const parse = String(pkg.version)
      .split('.')
      .map((n) => parseInt(n));
    let major = parse[0];
    let minor = parse[1];
    if (minor > 10) {
      minor = 0;
      major += 1;
    }
    let patch = parse[2] + 1; // +1
    if (patch > 10) {
      patch = 0;
      minor += 1;
    }

    const merge = `${major}.${minor}.${patch}`;
    pkg.version = merge;
    const build = JSON.stringify(pkg, null, 2) + '\n';
    fs.writeFileSync(path.join(__dirname, 'package.json'), build);
    resolve();
  });
}

gulp.task('update', updateVersion);

export async function copyDemo() {
  const cwd = path.join(__dirname, 'test/demo');
  await cp.async('npx', ['hexo', 'generate'], { cwd, stdio: 'inherit' });
  const dest = path.join(__dirname, '.deploy_git/hexo-adsense');
  if (fs.existsSync(dest)) await fs.rm(dest, { force: true, recursive: true });
  const stream = gulp.src('public/**/*', { cwd }).pipe(gulp.dest('./.deploy_git/hexo-adsense'));
  await promiseStream(stream);
}

export default gulp.series(sourceJs, sourceHtml, sourceCss, copyDemo);
