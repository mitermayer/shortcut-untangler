var gulp = require('gulp');
var del = require('del');

var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var stripDebug = require('gulp-strip-debug');
var stylish = require('jshint-stylish');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var srcFiles = ['src/js/**/*.js'];
var testFiles = ['src/tests/integration/**/*.js'];
var allFiles = srcFiles.concat(testFiles);


var DIST = 'dist/';
var MIN_FILE = 'shortcutUntangler.min.js';
var SCRIPT_FILE= 'shortcutUntangler.js';

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del([DIST], cb);
});

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
    del([DIST + MIN_FILE], function() {
        gulp.src(srcFiles)
            .pipe(stripDebug())
            .pipe(uglify())
            .pipe(concat(MIN_FILE))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist'));
    });
});

gulp.task('lint', function() {
    return gulp.src(srcFiles)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

gulp.task('utest', function() {
    // Be sure to return the stream
    return gulp.src(allFiles)
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('dev', function() {
    gulp.src(allFiles)
        .pipe(karma({
            configFile: 'karma.conf.js',
            browsers: ['PhantomJS'],
            action: 'watch'
        }))
});

// used on pre-commit
gulp.task('default', ['lint', 'utest', 'scripts']);

// used for testing
gulp.task('test', ['lint', 'utest']);
