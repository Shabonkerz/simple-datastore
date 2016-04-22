import gulp from 'gulp';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import notify from 'gulp-notify';
import mocha from 'gulp-mocha';

var filePath = {
	src: 'src/**/*.js',
	tests: 'tests/**/*.js'
};

gulp.task('lint', () => {
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src( filePath.src )
		// eslint() attaches the lint output to the "eslint" property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});

gulp.task('build', () => {
	return gulp.src( filePath.src )
		.pipe(babel({
			presets: [ 'es2015', 'stage-0' ]
		}))
		.pipe(gulp.dest('dist'))
		.pipe(notify({ message: 'Project successfully built!', onLast: true } ));
});

gulp.task('test', () => {
	return gulp.src( filePath.tests )
		.pipe(mocha())
        .once('error', () => {
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        });
});

gulp.task('watch', () => {
	gulp.watch(filePath.src, [ 'lint', 'build', 'test' ]);
});

gulp.task('default', [ 'build', 'watch' ]);
