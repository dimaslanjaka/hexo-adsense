
import Bluebird from "bluebird";
import { exec } from "child_process";
import { existsSync, rmSync, writeFileSync } from "fs";
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
	return Bluebird.resolve(
		gulp
			.src("./source/*.js")
			.pipe(gulpTerser({}, terser.minify))
			.pipe(gulp.dest("./lib/source"))
	)
		.then(() => {
			//gulp.src(["./packages/**/*", "!**/.git**", "!**/tmp/**"]).pipe(gulp.dest("./lib/packages"));
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

async function clean() {
	const paths = [join(__dirname, "lib")].filter((path) => existsSync(path));
	return (await Bluebird.all(paths)).forEach((path) => {
		rmSync(path, { recursive: true, force: true });
	});
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

function updateVersion() {
	return new Bluebird((resolve) => {
		const parse = String(pkg.version)
			.split(".")
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
		const build = JSON.stringify(pkg, null, 2) + "\n";
		writeFileSync(join(__dirname, "package.json"), build);
		resolve();
	});
}

gulp.task("update", updateVersion);

exports.default = gulp.series(clean, copy, css, html, tsc);
exports.copy = copy;
