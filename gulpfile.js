'use strict'

/*
  Hello!
  It is unlikely that you should touch this Gulpfile. If you want to, however, I can't stop you. I'm not there!
  Here's some things you can do if you'd like:
  - If you want to brand your app, you'll want to update the `gulp package-osx`, `gulp package-windows`, and
    `gulp package-linux` tasks. You can find documentation for the electronPackager() function at the github repo
    joaomoreno/gulp-atom-electron. There are a few basic branding things you can do there.
  - If you want to contemplate the universe and just feel small and meaningless in general, listen to Neil DeGrasse
    Tyson talk for an extended period of time!
*/

const gulp = require( 'gulp' )
const source = require( 'vinyl-source-stream' )
const browserify = require( 'browserify' )
const glob = require( 'glob' )
const es = require( 'event-stream' )
const babel = require( 'gulp-babel' )
const sass = require( 'gulp-sass' )
const eslint = require( 'gulp-eslint' )
const rename = require( 'gulp-rename' )
const useref = require( 'gulp-useref' )
const replace = require( 'gulp-replace' )
const electron = require( 'electron-connect' ).server.create()
const electronPackager = require( 'gulp-atom-electron' )
const symdest = require( 'gulp-symdest' )
const zip = require( 'gulp-vinyl-zip' )
const path = require( 'path' )

const electronVersion = require( 'electron/package.json' ).version

const paths = {
	client: {
		js: './app/js/*',
		css: './app/css/*.scss',
		html: './app/*.html',
		res: './app/res/**/*'
	},
	server: {
		js: './src/*.js'
	},
	watch: {
		client: {
			js: './app/js/**/*',
			css: './app/css/**/*.scss',
			html: './app/**/*.html',
			res: './app/res/**/*'
		},
		server: {
			js: './src/**/*.js'
		}
	},
	browserify: [ './node_modules', './app/js/' ],
	dist: {
		build: './build'
	}
}

/* These are the building tasks! */

gulp.task( 'build-client-js', ( done ) => {
	glob( './app/js/renderer.js', ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return browserify( {
					entries: [ entry ],
					extensions: [ '.js', '.jsx' ],
					paths: paths.browserify,
					ignoreMissing: true,
					detectGlobals: false,
					bare: true,
					browserField: false,
					insertGlobals: 'global',
					commondir: false,
					builtins: false,
					bundleExternal: false,
					debug: true
				} )
				.transform( 'babelify', { presets: [ 'es2015', 'react' ] } )
				.bundle()
				.pipe( source( entry ) )
				.pipe( rename( {
					dirname: 'js'
				} ) )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build-client-css', ( done ) => {
	glob( paths.client.css, ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( sass() )
				.pipe( rename( {
					dirname: 'css'
				} ) )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build-client-html', ( done ) => {
	glob( paths.client.html, ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build-client-html-production', ( done ) => {
	glob( paths.client.html, ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( useref() )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build-client-res', ( done ) => {
	glob( paths.client.res, ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry, { base: './app' } )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build-client', [
	'build-client-css',
	'build-client-html',
	'build-client-res',
	'build-client-js'
] )

gulp.task( 'build-client-production', [
	'build-client-css',
	'build-client-html-production',
	'build-client-res',
	'build-client-js'
] )

gulp.task( 'build-server', ( done ) => {
	glob( paths.server.js, ( err, files ) => {
		if ( err ) {
			done( err )
		}

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( babel( { presets: [ 'es2015' ] } ) )
				.pipe( gulp.dest( paths.dist.build ) )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'build', [
	'build-client',
	'build-server'
] )

gulp.task( 'build-production', [ 'build-client-production', 'build-server' ], () => {
	gulp.src( './package.json' )
		.pipe( replace( 'build/index.js', 'index.js' ) )
		.pipe( gulp.dest( paths.dist.build ) )
} )

/* These are the watch tasks! */

gulp.task( 'watch-client', () => {
	for ( let type in paths.watch.client ) {
		gulp.watch( paths.watch.client[ type ], [ 'build-client-' + type ], ( e ) => {
			console.log( 'Client file ' + e.path + ' was ' + e.type + ', rebuilding...' )
		} )
	}
} )

gulp.task( 'watch-server', () => {
	gulp.watch( paths.watch.server.js, [ 'build-server' ], ( e ) => {
		console.log( 'Server file ' + e.path + ' was ' + e.type + ', rebuilding...' )
	} )
} )

gulp.task( 'watch', [ 'watch-client', 'watch-server' ] )

/* These are the linting tasks! */

gulp.task( 'lint-client', ( done ) => {
	glob( paths.client.js, ( err, files ) => {
		if ( err ) done( err )

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( eslint() )
				.pipe( eslint.format() )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'lint-server', ( done ) => {
	glob( paths.server.js, ( err, files ) => {
		if ( err ) done( err )

		let tasks = files.map( ( entry ) => {
			return gulp.src( entry )
				.pipe( eslint() )
				.pipe( eslint.format() )
		} )

		es.merge( tasks ).on( 'end', done )
	} )
} )

gulp.task( 'lint', [ 'lint-client', 'lint-server' ] )

/* This is the serve task! */

gulp.task( 'serve', [ 'build', 'watch' ], () => {
	electron.start()
	gulp.watch( paths.dist.build + '/index.js', electron.restart )
	gulp.watch( paths.dist.build + '/js/*.js', electron.reload )
	gulp.watch( paths.dist.build + '/css/app.css', electron.reload )
} )

/* These are the packaging tasks! */

gulp.task( 'package-osx', [ 'build-production' ], () => {
	return gulp.src( paths.dist.build + '/**' )
		.pipe( electronPackager( { version: electronVersion, platform: 'darwin' } ) )
		.pipe( symdest( 'release' ) )
} )

gulp.task( 'package-windows', [ 'build-production' ], () => {
	return gulp.src( paths.dist.build + '/**' )
		.pipe( electronPackager( { version: electronVersion, platform: 'win32' } ) )
		.pipe( zip.dest( './release/windows.zip' ) )
} )

gulp.task( 'package-linux', [ 'build-production' ], () => {
	return gulp.src( paths.dist.build + '/**' )
		.pipe( electronPackager( { version: electronVersion, platform: 'linux' } ) )
		.pipe( zip.dest( './release/linux.zip' ) )
} )

gulp.task( 'package', [ 'build-production', 'package-windows', 'package-osx', 'package-linux' ] )