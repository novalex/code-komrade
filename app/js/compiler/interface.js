/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const { app } = require('electron').remote;

const fs = require('fs');
const path = require('path');
const psTree = require('ps-tree');
const dependencyTree = require('dependency-tree');

const sass = require('node-sass');
const webpack = require('webpack');
const formatMessages = require('./messages');

const { fileAbsolutePath } = require('../utils/pathHelpers');
const { getDependencyArray } = require('../utils/utils');

function killTasks() {
	if ( global.compilerTasks.length ) {
		for ( var task of global.compilerTasks ) {
			terminateProcess( task );
		}

		return true;
	}

	// Nothing to kill :(
	return null;
}

function terminateProcess( proc ) {
	psTree( proc.pid, function( err, children ) {
		if ( err ) {
			console.error( err );
		}

		for ( var pid of [ proc.pid ].concat( children.map( child => child.PID ) ) ) {
			try {
				process.kill( pid );
			} catch ( err ) {
				// Fail silently lol YOLO
				// console.error( err );
			}
		}
	});
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
		projectBase: base,
		projectConfig: global.projectConfig.path
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
	console.log( options );

	let modulesPath = path.resolve( app.getAppPath(), 'node_modules' );
	if ( ! modulesPath.match('app') ) {
		modulesPath = path.resolve( app.getAppPath(), 'app/node_modules' );
	}

	// Get imported files.
	let watchFiles = getDependencyArray( dependencyTree({
		filename: options.input,
		directory: options.projectBase
	}));

	let filename = options.filename || 'file';

	// Build task starting.
	global.logger.log( 'info', `Compiling ${filename}...` );

	if ( taskName === 'build-sass' ) {
		let outFile = path.resolve( options.output, options.filename );

		sass.render( {
			file: options.input,
			outFile: outFile,
			outputStyle: options.style,
			sourceMap: options.sourcemaps
		}, function( error, result ) {
			if ( error ) {
				// Compilation error(s).
				handleCompileError( filename, error );

				if ( callback ) {
					callback();
				}
			} else {
				// No errors during the compilation, write this result on the disk
				fs.writeFile( outFile, result.css, function( err ) {
					if ( err ) {
						// Compilation error(s).
						handleCompileError( filename, err );
					} else {
						// Compilation successful.
						handleCompileSuccess( filename );
					}

					if ( callback ) {
						callback();
					}
				} );
			}
		} );
	} else {
		let config = {
			mode: 'production',
			entry: options.input,
			output: {
				path: options.output,
				filename: options.filename
			},
			resolveLoader: {
				modules: [ modulesPath ]
			}
		};

		webpack( config, ( err, stats ) => {
			if ( callback ) {
				callback();
			}

			if ( err ) {
				console.error( err );
			}

			const messages = formatMessages( stats );

			if ( ! messages.errors.length && ! messages.warnings.length ) {
				// Compilation successful.
				handleCompileSuccess( filename );
			}

			if ( messages.errors.length ) {
				// Compilation error(s).
				handleCompileError( filename, messages.errors );

				return;
			}

			if ( messages.warnings.length ) {
				// Compilation warning(s).
				handleCompileWarnings( filename, messages.warnings );
			}
		});
	}
}

function handleCompileSuccess( filename ) {
	let notifyText = `Finished compiling ${filename}.`;

	global.logger.log( 'success', notifyText );

	let notify = new Notification( 'Buildr', {
		body: notifyText,
		silent: true
	} );

	return notify;
}

function handleCompileError( filename, errors ) {
	console.error( errors );

	if ( ! errors.length ) {
		errors = [ errors ];
	}

	let notifyText = ( errors.length > 1 ? 'Errors' : 'Error' ) + ` when compiling ${filename}`;

	global.logger.log( 'error', notifyText + ':', '<pre>' + errors.join( '\r\n' ) + '</pre>' );

	let notify = new Notification( 'Buildr', {
		body: notifyText,
		sound: 'Basso'
	} );

	return notify;
}

function handleCompileWarnings( filename, warnings ) {
	console.warn( warnings );

	if ( ! warnings.length ) {
		warnings = [ warnings ];
	}

	let notifyText = ( warnings.length > 1 ? 'Warnings' : 'Warning' ) + ` when compiling ${filename}`;

	global.logger.log( 'warn', notifyText + ':', '<pre>' + warnings.join( '\r\n' ) + '</pre>' );
}

module.exports = {
	initProject,
	runTask,
	killTasks,
	processFile,
	getFileConfig,
	getFileOptions,
	terminateProcess
}
