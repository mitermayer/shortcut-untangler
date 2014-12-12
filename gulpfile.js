var karma = require('gulp-karma');
var jshint = require('gulp-jshint');
var gulp = require('gulp');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var stylish = require('jshint-stylish');

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
    return gulp.src(allFiles)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

gulp.task('test', function() {
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

    gulp.watch(allFiles, function() {
        gulp.src(allFiles)
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
    });
});

gulp.task('default', ['lint', 'test'], function() {
    console.log("Default task");
});
