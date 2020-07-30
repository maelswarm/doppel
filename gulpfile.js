const gulp = require('gulp');
const minify = require('gulp-minify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const nodemon = require('gulp-nodemon');

const fs = require('fs');

sass.compiler = require('node-sass');

const gulpIt = () => {
    gulp
        .src('app/src/**/*.js')
        .pipe(minify({
            ext: {
                src: "-orig.js",
                min: ".js"
            }
        }))
        .pipe(gulp.dest('app/dist'));

    gulp.src('app/src/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/dist'));

    gulp
        .src('app/src/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('app/dist'));
}

gulp.task('default', function (cb) {

    var started = false;

    return nodemon({
        script: './app/server/server.js',
        watch: './app/src',
        ext: 'js html scss'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            const folders = [
                'app/dist'
            ];

            folders.forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                    console.log('📁 created:', dir);
                }
            });
            gulpIt();
            started = true;
            cb();
        }
        cb();
    }).on('restart', function () {
        gulpIt();
    });
});