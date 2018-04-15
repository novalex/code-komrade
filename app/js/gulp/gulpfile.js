'use strict'

const gulp = require( 'gulp' );
const plugins = require('gulp-load-plugins')();
const source = require( 'vinyl-source-stream' );
const browserify = require( 'browserify' );
const glob = require( 'glob' );
const es = require( 'event-stream' );
const path = require( 'path' );
const del = require('del');

// fetch command line arguments.
const arg = ( argList => {
	let arg = {}, a, opt, thisOpt, curOpt;
	for ( a = 0; a < argList.length; a++ ) {
		thisOpt = argList[a].trim();
		opt = thisOpt.replace(/^\-+/, '');

		if ( opt === thisOpt ) {
			// argument value
			if ( curOpt ) {
				arg[curOpt] = opt;
			}

			curOpt = null;
		} else {
			// argument name
			curOpt = opt;
			arg[curOpt] = true;
		}
	}

	return arg;
})( process.argv );

let options = {
	autoprefixer: {
		browsers: [ 'last 2 versions', '> 5%', 'Firefox ESR' ]
	}
}

gulp.task( 'build-css', ( done ) => {
	return gulp.src( arg.input )
		.pipe( plugins.if( arg.sourcemaps, plugins.sourcemaps.init() ) )
		.pipe( plugins.sass({
			outputStyle: arg.outputStyle
		}) )
		.pipe( plugins.if( arg.sourcemaps, plugins.sourcemaps.write() ) )
		.pipe( plugins.if( arg.autoprefixer, plugins.autoprefixer( options.autoprefixer ) ) )
		.pipe( plugins.rename( arg.filename ) )
		.pipe( gulp.dest( arg.output ) )
});

gulp.task( 'build-js', ( done ) => {
	return browserify( {
			entries: [ arg.input ],
			extensions: [ '.js', '.jsx' ]
			// ignoreMissing: true,
			// detectGlobals: false,
			// bare: true,
			// browserField: false,
			// insertGlobals: 'global',
			// commondir: false,
			// builtins: false,
			// bundleExternal: false,
			// debug: true
		} )
		.transform( 'babelify', { presets: [ 'es2015', 'react' ] } )
		.bundle()
		.pipe( source( arg.input ) )
		.pipe( plugins.rename( arg.filename ) )
		.pipe( gulp.dest( arg.output ) )
});

gulp.task( 'watch', ( done ) => {
	gulp.watch( arg.watchFiles.split(' '), gulp.parallel( arg.watchTask ) );
	done();
});
