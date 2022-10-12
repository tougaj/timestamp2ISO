const gulp = require('gulp');
let browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const ts = require('gulp-typescript');
var changed = require('gulp-changed');
const replace = require('gulp-replace');
var cleanCSS = require('gulp-clean-css');
const webpack = require('webpack-stream');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const del = require('del');
const plumber = require('gulp-plumber');

let paths = {
	styles: {
		src: ['src/css/*.sass', 'src/css/*.scss'],
		dest: 'css',
	},
	scripts: {
		src: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.d.ts'],
		dest: '.',
	},
};

const styles = () =>
	gulp
		.src(paths.styles.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(plumber())
		.pipe(autoprefixer({}))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);

let tsProject = ts.createProject('./src/js/tsconfig.json');

function typeScripts() {
	let tsResult = gulp
		.src(paths.scripts.src)
		.pipe(plumber())
		.pipe(
			changed('.', {
				extension: '.js',
			})
		)
		.pipe(tsProject());
	return tsResult.js.pipe(gulp.dest(paths.scripts.dest));
}

const sDistDir = './docs';

const clean = () => del([sDistDir]);
const webpackDev = () => runDevWebPack('js/**/*.js', './js/main.js');
const webpackProd = () => runProdWebPack('js/**/*.js', './js/main.js', `${sDistDir}/js`);

function watch() {
	// const hostServerPort = process.env.HOST_SERVER_PORT || 80;
	// browserSync.init({
	// 	proxy: `http://127.0.0.1:${hostServerPort}/tv-dev/`,
	// });
	browserSync.init({
		server: true,
		files: ['css/*.css', 'js/*.js', '*.html'],
	});
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, gulp.series(typeScripts, webpackDev));
	gulp.watch(['./index.html']).on('change', browserSync.reload);
}

function watchUtils() {
	gulp.watch(paths.scripts.src, typeScripts);
}

gulp.task('sass', styles);
gulp.task('ts', typeScripts);
gulp.task('webpack', gulp.series(typeScripts, webpackDev));

gulp.task(
	'build',
	gulp.series(
		clean,
		styles,
		typeScripts,
		gulp.parallel(
			() => gulp.src(['./img/**/*.*']).pipe(gulp.dest(`${sDistDir}/img`)),
			() =>
				gulp
					.src(['./index.html'])
					.pipe(replace(/ts=\[\[0000000000\]\]/g, `ts=${new Date().valueOf().toString(36)}`))
					.pipe(gulp.dest(sDistDir)),
			() =>
				gulp
					.src('css/**/*.css')
					.pipe(cleanCSS())
					.pipe(gulp.dest(`${sDistDir}/css`)),
			webpackProd
		)
	)
);

let development = gulp.series(styles, typeScripts, webpackDev, watch);
gulp.task('default', development);
gulp.task('utils', gulp.series(typeScripts, watchUtils));

function runDevWebPack(sSource, sEntry) {
	return gulp
		.src(sSource)
		.pipe(plumber())
		.pipe(
			webpack({
				entry: {
					main: sEntry,
				},
				// mode: 'none',
				mode: 'development',
				// mode: 'production',
				output: {
					// asyncChunks: true,
					// chunkFilename: '[id].js',
					filename: '[name].bundle.js',
					clean: true,
					// filename: (pathData) => {
					// 	return pathData.chunk.name === 'main' ? 'main.bundle.js' : 'vendors~main.bundle.js';
					// },
				},
				// optimization: {
				// 	splitChunks: {
				// 		chunks: 'all',
				// 	},
				// },
				devtool: 'source-map',
				plugins: [
					new MomentLocalesPlugin({
						localesToKeep: ['uk'],
					}),
				],
			})
		)
		.pipe(gulp.dest('js'))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function runProdWebPack(sSource, sEntry, sDestination) {
	return (
		gulp
			.src(sSource)
			.pipe(
				webpack({
					entry: {
						main: sEntry,
					},
					mode: 'production',
					output: {
						filename: '[name].bundle.js',
					},
					// optimization: {
					// 	splitChunks: {
					// 		chunks: 'all',
					// 	},
					// },
					plugins: [
						new MomentLocalesPlugin({
							localesToKeep: ['uk'],
						}),
					],
				})
			)
			// .pipe(uglify({
			// 	compress: {
			// 		drop_console: true
			// 	}
			// }))
			.pipe(gulp.dest(sDestination))
	);
}
