'use strict';

const gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    typescript = require('gulp-typescript'),
    rimraf = require('rimraf'),
    tsProject = typescript.createProject('tsconfig.json');

var path = {
    build: {
        html: 'build/',
        lib: 'build/lib/',
        ts: 'lib/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: ['src/*.html', 'src/index.js'],
        lib: 'lib/**/*.js*',
        ts: 'src/ts/**/*.ts',
        style: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        ts: 'src/ts/**/*.ts',
        style: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html));
});

gulp.task('ts:build', function () {
    return gulp.src(path.src.ts)
        .pipe(tsProject(typescript.reporter.defaultReporter())).js
        .pipe(gulp.dest(path.build.ts));
});

gulp.task('style:build', function () {
    return gulp.src(path.src.style)
        .pipe(sass())
        .pipe(gulp.dest(path.build.css));
});

gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
});

gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('lib:build', function() {
    return gulp.src(path.src.lib)
        .pipe(gulp.dest(path.build.lib));
});

gulp.task('build', gulp.series(
    'ts:build',
    'html:build',
    'lib:build',
    'style:build',
    'fonts:build',
    'image:build'
));

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('watch', function () {
    gulp.watch([path.watch.html], gulp.series('html:build'));
    gulp.watch([path.watch.style], gulp.series('style:build'));
    gulp.watch([path.watch.ts], gulp.series('ts:build'));
    gulp.watch([path.watch.img], gulp.series('image:build'));
    gulp.watch([path.watch.fonts], gulp.series('fonts:build'));
});

gulp.task('run', gulp.series(
    'clean',
    'build',
    'watch'
));
