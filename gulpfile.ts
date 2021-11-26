import gulp from "gulp";
import terser from "terser";
import gulpTerser from "gulp-terser";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import del from "del";
import { exec } from "child_process";

function tsc(cb) {
  exec("tsc", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function es() {
  return gulp.src("./source/*.js").pipe(gulpTerser({}, terser.minify)).pipe(gulp.dest("./lib/source"));
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

exports.default = gulp.series(clean, es, css, tsc);
