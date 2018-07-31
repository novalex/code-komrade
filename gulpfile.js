'use strict'

/*
Update the `gulp package-osx`, `gulp package-windows`, and `gulp package-linux` tasks.
You can find documentation for the electronPackager() function at the github repo joaomoreno/gulp-atom-electron.
There are a few basic branding things you can do there.
*/

const gulp = require('gulp')
const source = require('vinyl-source-stream')
const browserify = require('browserify')
const glob = require('glob')
const es = require('event-stream')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const useref = require('gulp-useref')
const replace = require('gulp-replace')
const electron = require('electron-connect').server.create()
// const zip = require('gulp-vinyl-zip')
const del = require('del')
const path = require('path')

// const packageJSON = require('./package.json')
// const appVersion = packageJSON.version

const paths = {
	client: {
		js: './app/js/*.js',
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
	browserify: [ './app/node_modules', './app/js/' ],
	dist: {
		build: './build',
		release: './release'
	},
	cwd: './'
}

// Clean the build folder.
gulp.task( 'build-clean', () => {
	return del( [ paths.dist.build + '/*' ] );
} )

// Symlink dependencies.
gulp.task( 'symlink-deps', () => {
	return gulp.src( './app/node_modules' ).pipe( gulp.symlink( paths.dist.build ) );
} )

gulp.task( 'build-client-js', ( done ) => {
	glob( paths.client.js, ( err, files ) => {
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
				debug: true,
				basedir: path.resolve( '.' )
			} )
				.plugin( './vendor/browserify-sourcemap-root-transform' )
				.transform( 'babelify' )
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

gulp.task( 'build-client', gulp.parallel(
	'build-client-css',
	'build-client-html',
	'build-client-res',
	'build-client-js'
) )

gulp.task( 'build-client-production', gulp.parallel(
	'build-client-css',
	'build-client-html-production',
	'build-client-res',
	'build-client-js'
) )

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

gulp.task( 'build',
	gulp.series(
		'build-clean',
		'symlink-deps',
		gulp.parallel(
			'build-client',
			'build-server'
		)
	)
)

gulp.task( 'build-production',
	gulp.series(
		'build-clean',
		'symlink-deps',
		gulp.parallel(
			'build-client-production',
			'build-server'
		),
		() => {
			return gulp.src( './package.json' )
				.pipe( replace( 'build/index.js', 'index.js' ) )
				.pipe( gulp.dest( paths.dist.build ) )
		}
	)
)

gulp.task( 'watch-client', () => {
	for ( let type in paths.watch.client ) {
		gulp.watch( paths.watch.client[ type ], gulp.parallel( 'build-client-' + type ), ( e ) => {
			console.log( 'Client file ' + e.path + ' was ' + e.type + ', rebuilding...' )
		} )
	}
} )

gulp.task( 'watch-server', () => {
	gulp.watch( paths.watch.server.js, gulp.parallel( 'build-server' ), ( e ) => {
		console.log( 'Server file ' + e.path + ' was ' + e.type + ', rebuilding...' )
	} )
} )

gulp.task( 'watch', gulp.parallel( 'watch-client', 'watch-server' ) )

gulp.task( 'serve', gulp.series( 'build', gulp.parallel( 'watch', () => {
	electron.start( () => {
		gulp.watch( paths.dist.build + '/index.js', restart )
		gulp.watch( [ paths.dist.build + '/js/*.js', paths.dist.build + '/css/app.css' ], reload )
	})
} ) ) )

function restart( done ) {
	electron.restart( '--enable-logging', function( state ) {
		if ( state === 'restarted' || state === 'restarting' || state === 'reloading' ) {
			done( null );
		} else {
			done( 'Unexpected state while restarting electron-connect server. State ' + state );
		}
	});
}

function reload( done ) {
	electron.reload();
	done( null );
}
