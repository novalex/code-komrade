'use strict'

const del = require('del');
const path = require('path');
const gulp = require( 'gulp' );
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const plugins = require('gulp-load-plugins')();
const browserify = require('browserify');

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

// console.log( arg );

let options = {
	autoprefixer: {
		browsers: [ 'last 5 versions' ]
	}
};

const modulesPath = path.join( arg.cwd, 'node_modules' );

gulp.task( 'build-css', ( done ) => {
	let postCssPlugins = [];
	let postCssOptions = {};

	return gulp.src( arg.input )
		.pipe( plugins.if( arg.sourcemaps, plugins.sourcemaps.init() ) )
		.pipe( plugins.postcss( postCssPlugins, postCssOptions) )
		.pipe( plugins.if( arg.sourcemaps, plugins.sourcemaps.write() ) )
		.pipe( plugins.if( arg.autoprefixer, plugins.autoprefixer( options.autoprefixer ) ) )
		.pipe( plugins.rename( arg.filename ) )
		.pipe( gulp.dest( arg.output ) )
});

gulp.task( 'build-sass', ( done ) => {
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
	let fileStream;
	let sourcemaps = ( ! arg.bundle && ! arg.babel ) ? false : arg.sourcemaps;
	let babelOptions = {
		presets: [
			path.join( modulesPath, 'babel-preset-es2015' ),
			path.join( modulesPath, 'babel-preset-react' )
		],
		sourceMaps: arg.sourcemaps
	};

	if ( arg.bundle ) {
		fileStream = browserify( {
			entries: [ arg.input ],
			extensions: [ '.js', '.jsx' ],
			// paths: [ path.join( arg.cwd, 'node_modules' ) ],
			// ignoreMissing: true,
			// detectGlobals: false,
			// bare: true,
			// browserField: false,
			// insertGlobals: 'global',
			// commondir: false,
			// builtins: false,
			// bundleExternal: false,
			// debug: true
		} );

		if ( arg.babel ) {
			fileStream = fileStream.transform( 'babelify', babelOptions );
		}

		fileStream = fileStream.bundle()
			.pipe( source( arg.input ) )
			.pipe( buffer() );
	} else {
		fileStream = gulp.src( arg.input );

		if ( arg.babel ) {
			fileStream = fileStream.pipe( plugins.babel( babelOptions ) );
		}
	}

	return fileStream
		.pipe( plugins.rename( arg.filename ) )
		.pipe( plugins.if( sourcemaps, plugins.sourcemaps.init( { loadMaps: true } ) ) )
		.pipe( plugins.if( arg.compress, plugins.uglify({
			compress: true	
		}) ) )
		.pipe( plugins.if( sourcemaps, plugins.sourcemaps.write() ) )
		.pipe( gulp.dest( arg.output ) )
});

gulp.task( 'watch', ( done ) => {
	gulp.watch( arg.watchFiles.split(' '), gulp.parallel( arg.watchTask ) );
	done();
});
