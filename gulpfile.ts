import gulp from "gulp";
import terser from "terser";
import gulpTerser from "gulp-terser";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import del from "del";
import { exec } from "child_process";
import htmlmin from "gulp-html-minifier-terser";
import Promise from "bluebird";

function tsc(cb) {
  exec("npx tsc", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function copy(done) {
  return Promise.resolve(gulp.src("./source/*.js").pipe(gulpTerser({}, terser.minify)).pipe(gulp.dest("./lib/source")))
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
    .pipe(htmlmin({ collapseWhitespace: true, minifyJS: true, minifyCSS: true, preserveLineBreaks: true }))
    .pipe(gulp.dest("./lib/source"));
}

exports.default = gulp.series(clean, copy, css, html, tsc);
exports.copy = copy;
