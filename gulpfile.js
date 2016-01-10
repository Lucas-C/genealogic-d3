// USAGE: gulp --genealogy $json_file

var gulp = require('gulp'),
	concat = require('gulp-concat');

gulp.task('js-bundle', function () {
    return gulp.src([
            'bower_components/angular/angular.min.js',
            'bower_components/angular-translate/angular-translate.min.js',
            'bower_components/d3/d3.min.js',
            'bower_components/flex-calendar/dist/flex-calendar.min.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/moment-ferie-fr/moment-ferie-fr.min.js',
            'src/genealogic-d3.js',
            'src/birthday-calendar.js'
        ])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('css-bundle', function () {
    return gulp.src([
            'bower_components/flex-calendar/dist/flex-calendar.min.css',
            'src/genealogic-d3.css',
            'src/birthday-calendar.css',
            'src/birthday-calendar-genealogy.css'
        ])
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['js-bundle', 'css-bundle']);
