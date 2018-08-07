/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const { app } = require( 'electron' ).remote;

const fs = require( 'fs' );
const path = require( 'path' );
// const dependencyTree = require( 'dependency-tree' );

const sass = require( 'node-sass' );
const WatchSass = require( 'node-sass-watcher' );
const autoprefixer = require( 'autoprefixer' );
const precss = require( 'precss' );
const postcss = require( 'postcss' );
const webpack = require( 'webpack' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const formatMessages = require( './messages' );

const { fileAbsolutePath } = require( '../utils/pathHelpers' );
// const { getDependencyArray } = require( '../utils/utils' );

function killTasks() {
	if ( global.compilerTasks.length === 0 ) {
		// Nothing to kill :(
		return null;
	}

	const tasks = global.compilerTasks;

	for ( let i = 0; i < tasks.length; i++ ) {
		let task = tasks[ i ];
		let filename;

		if ( typeof task._events === 'object' && typeof task._events.update === 'function' ) {
			filename = path.basename( task.inputPath );
			// Close chokidar watch processes.
			task.inputPathWatcher.close();
			task.rootDirWatcher.close();
		} else {
			filename = path.basename( task.compiler.options.entry );
			// Close webpack watch process.
			task.close();
		}

		global.logger.log( 'info', `Stopped watching ${filename}.` );

		tasks.splice( i, 1 );
	}

	global.compilerTasks = tasks;

	return true;
}

function initProject() {
	killTasks();

	if ( ! global.projectConfig ) {
		return;
	}

	let projectFiles = global.projectConfig.get( 'files', [] );

	let projectPath = path.parse( global.projectConfig.path ).dir;

	for ( var fileConfig of projectFiles ) {
		processFile( projectPath, fileConfig );
	}
}

function processFile( base, fileConfig, taskName = null, callback = null ) {
	let options = getFileConfig( base, fileConfig );

	if ( ! options ) {
		if ( callback ) {
			callback();
		}

		return;
	}

	if ( taskName ) {
		runTask( taskName, options, callback );
	} else if ( options.autocompile ) {
		if ( options.watchTask ) {
			options.getImports = true;
		}

		runTask( 'watch', options );
	}
}

function getFileOptions( file ) {
	let options = {};

	switch ( file.extension ) {
		case '.css':
			options.type = 'css';
			options.fileType = 'style-' + options.type;
			break;
		case '.sass':
		case '.scss':
			options.type = 'sass';
			options.fileType = 'style-' + options.type;
			break;
		case '.less':
			options.type = 'less';
			options.fileType = 'style-' + options.type;
			break;
		case '.js':
		case '.jsx':
			options.type = 'js';
			options.fileType = 'script';
	}

	options.buildTaskName = 'build-' + options.type;

	return options;
}

function getFileConfig( base, fileConfig ) {
	if ( ! fileConfig.path || ! fileConfig.output ) {
		return false;
	}

	let filePath = fileAbsolutePath( base, fileConfig.path );
	let outputPath = fileAbsolutePath( base, fileConfig.output );
	let compileOptions = getFileOptions({ extension: path.extname( filePath ) });
	let options = {
		input: filePath,
		filename: path.basename( outputPath ),
		output: path.parse( outputPath ).dir,
		projectBase: base
	};

	if ( fileConfig.options ) {
		for ( var option in fileConfig.options ) {
			if ( ! fileConfig.options.hasOwnProperty( option ) ) {
				continue;
			}

			options[ option ] = fileConfig.options[ option ];
		}

		if ( fileConfig.options.autocompile ) {
			options.watchTask = compileOptions.buildTaskName;
		}
	}

	return options;
}

function runTask( taskName, options = {}, callback = null ) {
	console.log('​runTask -> options', options);

	// Get imported files.
	// let watchFiles = getDependencyArray( dependencyTree({
	// 	filename: options.input,
	// 	directory: options.projectBase
	// }));

	let inputFilename = path.basename( options.input );

	if ( taskName === 'watch' ) {
		// Watch task starting.
		global.logger.log( 'info', `Watching ${inputFilename}...` );

		handleWatchTask( options, callback );
	} else {
		// Build task starting.
		global.logger.log( 'info', `Compiling ${inputFilename}...` );

		switch ( taskName ) {
			case 'build-sass':
				handleSassCompile( options, callback );
				break;
			case 'build-css':
				handleCssCompile( options, callback );
				break;
			case 'build-js':
				handleJsCompile( options, callback );
				break;
			default:
				console.error( `Unhandled task: ${taskName}` );
				break;
		}
	}
}

function handleSassCompile( options, callback = null ) {
	options.outFile = path.resolve( options.output, options.filename );

	sass.render( {
		file: options.input,
		outFile: options.outFile,
		outputStyle: options.style,
		sourceMap: options.sourcemaps,
		sourceMapEmbed: options.sourcemaps
	}, function( error, result ) {
		if ( error ) {
			// Compilation error(s).
			handleCompileError( options, error );

			if ( callback ) {
				callback();
			}
		} else {
			if ( options.autoprefixer ) {
				let postCssOptions = {
					from: options.input,
					to: options.outFile,
					map: options.sourcemaps
				};
				handlePostCssCompile( options, result.css, postCssOptions, callback );
			} else {
				// No errors during the compilation, write this result on the disk
				fs.writeFile( options.outFile, result.css, function( error ) {
					if ( error ) {
						// Compilation error(s).
						handleCompileError( options, error );
					} else {
						// Compilation successful.
						handleCompileSuccess( options );
					}

					if ( callback ) {
						callback();
					}
				} );
			}
		}
	} );
}

function handleCssCompile( options, callback = null ) {
	options.outFile = path.resolve( options.output, options );

	let postCssOptions = {
		from: options.input,
		to: options.outFile,
		map: options.sourcemaps
	};

	fs.readFile( options.input, ( error, css ) => {
		if ( error ) {
			// Compilation error(s).
			handleCompileError( options, error );
		} else {
			handlePostCssCompile( options, css, postCssOptions, callback );
		}
	});
}

function handlePostCssCompile( options, css, postCssOptions, callback = null ) {
	postcss( [ precss, autoprefixer ] )
		.process( css, postCssOptions )
		.then( postCssResult => {
			// No errors during the compilation, write this result on the disk
			fs.writeFile( options.outFile, postCssResult.css, function( error ) {
				if ( error ) {
					// Compilation error(s).
					handleCompileError( options, error );
				} else {
					// Compilation successful.
					handleCompileSuccess( options );
				}

				if ( callback ) {
					callback();
				}
			} );
		} );
}

function handleJsCompile( options, callback = null ) {
	let modulesPath = path.resolve( app.getAppPath(), 'node_modules' );
	if ( ! modulesPath.match( 'app' ) ) {
		modulesPath = path.resolve( app.getAppPath(), 'app/node_modules' );
	}

	let config = {
		mode: 'none',
		entry: options.input,
		cache: false,
		output: {
			path: options.output,
			filename: options.filename
		},
		module: {
			rules: [ {
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/
			} ]
		},
		resolveLoader: {
			modules: [ modulesPath ]
		},
		optimization: {
			nodeEnv: 'development'
		},
		devtool: ( options.sourcemaps ) ? 'inline-source-map' : false,
	};

	if ( options.babel ) {
		config.module.rules[ 0 ].use = {
			loader: 'babel-loader',
			options: {
				presets: [ require( 'babel-preset-env' ) ],
				plugins: [ require( 'babel-plugin-transform-object-rest-spread' ) ]
			}
		};
	}

	if ( options.compress ) {
		let UglifyJsPluginOptions = {
			parallel: true,
			sourceMap: options.sourcemaps,
			uglifyOptions: {
				compress: true,
				minify( file, sourceMap ) {
					const uglifyJsOptions = {};

					if ( sourceMap ) {
						uglifyJsOptions.sourceMap = {
							content: sourceMap
						};
					}

					return require( 'uglify-js' ).minify( file, uglifyJsOptions );
				}
			}
		};

		config.optimization.minimizer = [
			new UglifyJsPlugin( UglifyJsPluginOptions )
		];
	}

	const compiler = webpack( config );

	if ( options.getInstance ) {
		return compiler;
	}

	compiler.run( ( error, stats ) => {
		if ( callback ) {
			callback();
		}

		if ( error ) {
			console.error( error );
		}

		console.log( stats );

		const messages = formatMessages( stats );

		if ( ! messages.errors.length && !messages.warnings.length ) {
			// Compilation successful.
			handleCompileSuccess( options );
		}

		if ( messages.errors.length ) {
			// Compilation error(s).
			handleCompileError( options, messages.errors );
		}

		if ( messages.warnings.length ) {
			// Compilation warning(s).
			handleCompileWarnings( options, messages.warnings );
		}
	});
}

function handleWatchTask( options ) {
	if ( options.watchTask === 'build-sass' ) {
		let watcherOptions = {
			verbosity: 1
		};
		let watcher = new WatchSass( options.input, watcherOptions );
		// watcher.on( 'init', function() { handleSassCompile( options ) });
		watcher.on( 'update', function() { handleSassCompile( options ) } );
		watcher.run();

		global.compilerTasks.push( watcher );
	} else if ( options.watchTask === 'build-js' ) {
		options.getInstance = true;
		let compiler = handleJsCompile( options );
		let watcher = compiler.watch({
			aggregateTimeout: 300
		}, ( error, stats ) => {
			if ( error ) {
				console.error( error );
			}

			console.log( stats );
		});

		// watcher.invalidate();

		global.compilerTasks.push( watcher );
	}
}

function handleCompileSuccess( options ) {
	let filename = path.basename( options.input );

	let notifyText = `Finished compiling ${filename}.`;

	global.logger.log( 'success', notifyText );

	let notify = new Notification( 'Buildr', {
		body: notifyText,
		silent: true
	} );

	return notify;
}

function handleCompileError( options, errors ) {
	console.error( errors );

	if ( ! errors.length ) {
		errors = [ errors ];
	}

	let filename = path.basename( options.input );

	let notifyText = ( errors.length > 1 ? 'Errors' : 'Error' ) + ` when compiling ${filename}`;

	global.logger.log( 'error', notifyText + ':', '<pre>' + errors.join( '\r\n' ) + '</pre>' );

	let notify = new Notification( 'Buildr', {
		body: notifyText,
		sound: 'Basso'
	} );

	return notify;
}

function handleCompileWarnings( options, warnings ) {
	console.warn( warnings );

	if ( ! warnings.length ) {
		warnings = [ warnings ];
	}

	let filename = path.basename( options.input );

	let notifyText = ( warnings.length > 1 ? 'Warnings' : 'Warning' ) + ` when compiling ${filename}`;

	global.logger.log( 'warn', notifyText + ':', '<pre>' + warnings.join( '\r\n' ) + '</pre>' );
}

module.exports = {
	initProject,
	runTask,
	killTasks,
	processFile,
	getFileConfig,
	getFileOptions
}
