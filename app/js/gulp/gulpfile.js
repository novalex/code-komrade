'use strict'

const gulp = require( 'gulp' )
const source = require( 'vinyl-source-stream' )
const browserify = require( 'browserify' )
const glob = require( 'glob' )
const es = require( 'event-stream' )
const babel = require( 'gulp-babel' )
const sass = require( 'gulp-sass' )
const rename = require( 'gulp-rename' )
const useref = require( 'gulp-useref' )
const replace = require( 'gulp-replace' )
const symdest = require( 'gulp-symdest' )
const path = require( 'path' )
const del = require('del')

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

console.log( arg );

gulp.task( 'build-css', ( done ) => {
	return gulp.src( arg.input )
		.pipe( sass() )
		.pipe( rename( arg.filename ) )
		.pipe( gulp.dest( arg.output ) )
} )
