'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    typescript = require('gulp-typescript'),
    rimraf = require('rimraf'),
    tsProject = typescript.createProject('tsconfig.json');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        ts: 'src/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        ts: 'src/ts/*.ts',
        js: 'src/js/**/*.js',
        style: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        ts: 'src/ts/**/*.ts',
        js: 'src/js/**/*.js',
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

gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(gulp.dest(path.build.js));
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

gulp.task('build', gulp.series(
    'html:build',
    'ts:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
));

gulp.task('scripts', gulp.series(
    'ts:build',
    'js:build'
));

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('watch', function () {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});
