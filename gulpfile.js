//Overall
var gulp = require('gulp');
var inject = require('gulp-inject');
var webserver = require('gulp-webserver');
var del = require('del');

//HTML
var htmlclean = require('gulp-htmlclean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

//Styling
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

//Logic
var babel = require('gulp-babel');

var paths = {
	src: 'src/**/*',
	srcHTML: 'src/**/*.html',
	srcCSS: 'src/**/*.css',
	srcJS: 'src/**/*.js',

	tmp: 'tmp',
	tmpIndex: 'tmp/index.html',
	tmpCSS: 'tmp/**/*.css',
	tmpJS: 'tmp/**/*.js',

	dist: 'dist',
	distIndex: 'dist/index.html',
	distCSS: 'dist/**/*.css',
	distJS: 'dist/**/*.js'
};

///////////////
//
// SASS
//
//////////////

gulp.task('sass', function() {
	gulp.src('src/styles/**/*.scss')
	    .pipe(sourcemaps.init())
	    .pipe(sass().on('error', sass.logError))
	    .pipe(sourcemaps.write())
	    .pipe(autoprefixer())
		.pipe(gulp.dest(paths.tmp))
})

///////////////
//
// Default
//
//////////////

gulp.task('default', ['watch'] );

gulp.task('html', function() {
	return gulp.src(paths.srcHTML)
		.pipe(gulp.dest(paths.tmp));
});

gulp.task('js', function() {
	return gulp.src(paths.srcJS)
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'sass', 'js']);

gulp.task('inject', ['copy'], function() {
	var css = gulp.src(paths.tmpCSS);
	var js = gulp.src(paths.tmpJS);
	return gulp.src(paths.tmpIndex)
		.pipe(inject(css, {relative: true} ))
		.pipe(inject(js, {relative: true} ))
		.pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function() {
	return gulp.src(paths.tmp)
		.pipe(webserver({
			port: 3003,
			livereload: true
		}));
});

gulp.task('watch', ['serve'], function(){
	gulp.watch(paths.src, ['inject']);
});


///////////////
//
// Build workflow
//
//////////////

gulp.task('html:dist', function() {
	return gulp.src(paths.tmpIndex)
		.pipe(htmlclean())
		.pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function() {
	return gulp.src(paths.tmpCSS)
		.pipe(concat('style.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest(paths.dist));
});

gulp.task('js:dist', function() {
	return gulp.src(paths.tmpJS)
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dist));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
	var css = gulp.src(paths.distCSS);
	var js = gulp.src(paths.distJS);
	return gulp.src(paths.distIndex)
		.pipe(inject( css, { relative:true } ))
		.pipe(inject( js, { relative:true } ))
		.pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['inject:dist']);

///////////////
//
// Cleaner
//
//////////////

gulp.task('clean', function() {
	del([paths.tmp, paths.dist]);
});