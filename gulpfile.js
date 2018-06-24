const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();

const { reload } = browserSync;

gulp.task('serve', ['build'], () => {
    browserSync.init({
        server: './demo',
    });
    gulp.watch('demo/**/*.*').on('change', reload);
    gulp.watch('build/*.js').on('change', reload);
    gulp.watch('src/*.js', ['build']);
});

gulp.task('clean', () =>
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build']));

gulp.task('build', ['clean'], () => {
    gulp.src('src/*.js').pipe(gulp.dest('build/')).pipe(gulp.dest('demo/js'));
});


gulp.task('default', ['serve']);
