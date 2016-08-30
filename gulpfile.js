var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['compile']);
gulp.task('watch', watch);

gulp.task('clean', clean);
gulp.task('compile', ['clean'], compile);

function clean() {
  return del(['dist/*']);
}

function compile() {
  return gulp.src('src/**/*.js')
    .pipe(concat('novent-engine.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
}

function watch() {
  gulp.watch('src/**/*.js', ['compile']);
}
