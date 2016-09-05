var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('default', ['compile']);
gulp.task('watch', watch);

gulp.task('clean', clean);
gulp.task('compile', ['clean'], compile);

function clean() {
  return del(['dist/*']);
}

function compile() {
  return gulp.src(['bower_components/eventEmitter/EventEmitter.js', 'bower_components/heir/heir.js', 'src/**/*.js'])
    .pipe(concat('novent-engine.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('dist'));
}

function watch() {
  gulp.watch('src/**/*.js', ['compile']);
}
