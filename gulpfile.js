var gulp = require('gulp');
var del = require('del');
var fs = require('fs');

var amdclean  = require('gulp-amdclean');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var rjs = require('gulp-requirejs');
var sourcemaps = require('gulp-sourcemaps');
var stripDebug = require('gulp-strip-debug');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');


var srcFiles = ['src/js/**/*.js'];
var testFiles = ['src/tests/unit/**/*.js'];
var allFiles = srcFiles.concat(testFiles);


var DIST = './dist/';
var MIN_FILE = 'shortcutUntangler.min.js';
var SCRIPT_FILE= 'shortcutUntangler.js';

gulp.task('build', function() {
    var license = '/*\n' + fs.readFileSync('LICENSE', 'utf8') + '*/\n';
    var startFragment = fs.readFileSync('src/parts/umd.frag', 'utf8');
    var endFragment = fs.readFileSync('src/parts/umd-end.frag', 'utf8');

    rjs({
        name: 'main',
        baseUrl: 'src/js/',
        out: SCRIPT_FILE
    })
    .pipe(amdclean.gulp({
       wrap: {
           start: license + startFragment,
           end: endFragment
       },
      prefixMode: 'standard'
      // some other options
    }))
    .pipe(gulp.dest(DIST)); // pipe it to the output DIR
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del([DIST], cb);
});

// JS concat, strip debugging and minify
gulp.task('min', function() {
    var license = '/*\n' + fs.readFileSync('LICENSE', 'utf8') + '*/\n';
    var startFragment = fs.readFileSync('src/parts/umd.frag', 'utf8');
    var endFragment = fs.readFileSync('src/parts/umd-end.frag', 'utf8');

    del([DIST + MIN_FILE], function() {
            rjs({
                name: 'main',
                baseUrl: 'src/js/',
                out: MIN_FILE
            })
            .pipe(amdclean.gulp({
               wrap: {
                   start: license + startFragment,
                   end: endFragment
               },
              prefixMode: 'standard'
              // some other options
            }))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(DIST));
    });
});

gulp.task('lint', function() {
    return gulp.src(srcFiles)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

// when unit tests will be enabled
//gulp.task('utest', function() {
//    // Be sure to return the stream
//    return gulp.src(allFiles)
//        .pipe(karma({
//            configFile: 'karma-unit.conf.js',
//            action: 'run'
//        }))
//        .on('error', function(err) {
//            // Make sure failed tests cause gulp to exit non-zero
//            throw err;
//        });
//});

gulp.task('integration-test', ['build'], function() {
    // Be sure to return the stream
    return gulp.src([DIST + SCRIPT_FILE].concat(testFiles))
        .pipe(karma({
            configFile: 'karma-integration.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('integration-test-dev', ['build'], function() {
    // Be sure to return the stream
    gulp.src([DIST + SCRIPT_FILE].concat(testFiles))
        .pipe(karma({
            configFile: 'karma-integration.conf.js',
            action: 'run'
        }))
        .on('error', function swallowError(error) {
            // Make sure failed tests cause gulp to exit non-zero
            console.log(error.toString());
            this.emit('end');
        });
});

gulp.task('dev', function() {
    gulp.watch(allFiles, ['lint','integration-test-dev']);
});

// used for testing
gulp.task('test', ['lint', 'integration-test']);

// used on pre-commit
gulp.task('default', ['lint', 'test', 'min']);

