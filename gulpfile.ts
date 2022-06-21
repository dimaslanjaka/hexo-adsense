import Promise from "bluebird";
import { exec } from "child_process";
import del from "del";
import { writeFileSync } from "fs";
import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import htmlmin from "gulp-html-minifier-terser";
import sourcemaps from "gulp-sourcemaps";
import gulpTerser from "gulp-terser";
import { join } from "path";
import terser from "terser";
import pkg from "./package.json";

function tsc(cb) {
  exec("npx tsc", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function copy(done) {
  return Promise.resolve(
    gulp
      .src("./source/*.js")
      .pipe(gulpTerser({}, terser.minify))
      .pipe(gulp.dest("./lib/source"))
  )
    .then(() => {
      //gulp.src(["./packages/**/*", "!**/.git**", "!**.gitmodules**"]).pipe(gulp.dest("./lib/packages"));
    })
    .finally(done);
}

function css() {
  return gulp
    .src("./source/*.css")
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(autoprefixer())
    .pipe(
      cleanCSS({ compatibility: "ie8", debug: true }, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./lib/source"));
}

function clean() {
  return del(["./lib"]);
}

function html() {
  return gulp
    .src("source/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        preserveLineBreaks: true,
      })
    )
    .pipe(gulp.dest("./lib/source"));
}

async function updateVersion() {
  const parse = String(pkg.version)
    .split(".")
    .map((n) => parseInt(n));
  const major = parse[0];
  const minor = parse[1];
  const patch = parse[2] + 1; // +1
  const merge = `${major}.${minor}.${patch}`;
  pkg.version = merge;
  const build = JSON.stringify(pkg, null, 2) + "\n";
  writeFileSync(join(__dirname, "package.json"), build);
}

gulp.task("update", updateVersion);

exports.default = gulp.series(clean, copy, css, html, tsc);
exports.copy = copy;
