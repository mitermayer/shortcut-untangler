var gulp = require('gulp');

var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var stripDebug = require('gulp-strip-debug');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');

var srcFiles = ['src/js/**/*.js'];
var testFiles = ['src/tests/**/*.js'];
var allFiles = srcFiles.concat(testFiles);

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
    gulp.src(srcFiles)
        .pipe(concat('shortcutUntangler.min.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./'));
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
