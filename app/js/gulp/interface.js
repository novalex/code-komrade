/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const { app } = require('electron').remote;

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const psTree = require('ps-tree');

const sass = require('node-sass');
const webpack = require('webpack');

const stripIndent = require('strip-indent');

const { slash, fileAbsolutePath, fileRelativePath } = require('../utils/pathHelpers');

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

	let filename = options.filename || 'file';

	let notify;
	let build;

	// Build task starting.
	global.logger.log( 'info', `Compiling ${filename}...` );

	switch ( taskName ) {
		case 'build-css':
			build = buildCssFile( options, callback );
			break;

		case 'build-sass':
			build = buildSassFile( options, callback );
			break;

		case 'build-js':
			build = buildJsFile( options, callback );
			break;

		default:
			break;
	}

	if ( build.status === 'success' ) {
		// Build task successful.
		let notifyText = `Finished compiling ${filename}.`;

		notify = new Notification( 'Buildr', {
			body: notifyText,
			silent: true
		} );

		global.logger.log( 'success', notifyText );

		return notify;
	} else {
		// Build task error.
		notify = new Notification( 'Buildr', {
			body: `Error when compiling ${filename}.`,
			sound: 'Basso'
		} );

		return notify;
	}
}

function buildCssFile( options = {}, callback = null ) {
	return true;
}

function buildSassFile( options = {}, callback = null ) {
	sass.render({
		file: options.input,
		outFile: options.output,
		sourcemaps: options.sourcemaps,
		outputStyle: options.style
	}, function( error, result ) {
		if ( ! error ) {
			fs.writeFile( options.output, result.css, function ( err ) {
				if ( ! err ) {
					return true;
				}

				return { error: 'file_write_fail' };
			});
		}

		return { error: 'file_compile_fail' };
	});
}

function buildJsFile( options = {}, callback = null ) {
	let config = {
		mode: 'development',
		entry: options.input,
		output: {
			path: options.output,
			filename: options.filename
		}
	};

	webpack( config, ( err, stats ) => {
		console.log( err );
		console.log( stats );
		if ( err || stats.hasErrors() ) {
			// Handle errors here
		}

		if ( callback ) {
			callback();
		}

		return true;
	} );
}

function handleStderr( data ) {
	console.log( data );

	let errObj = {};
	let startCapture = false;

	var lines = data.split( /(\r\n|[\n\v\f\r\x85\u2028\u2029])/ );

	for ( var line of lines ) {
		let trimmed = line.trim();

		if ( ! trimmed.length ) {
			continue;
		}

		if ( trimmed === 'Details:' ) {
			startCapture = true;
			continue;
		}

		if ( startCapture ) {
			let errArr = trimmed.split( /:\s(.+)/ );
			errObj[ errArr[0] ] = errArr[1];

			if ( errArr[0] === 'formatted' ) {
				startCapture = false;
			}
		}
	};

	if ( Object.keys( errObj ).length ) {
		console.error( errObj );

		getErrLines( errObj.file, errObj.line, function( err, lines ) {
			if ( err ) {
				console.error( err );
				return;
			}

			let title = errObj.formatted.replace( /\.$/, '' ) +
				'<code>' +
					' in ' + slash( fileRelativePath( process.cwd(), errObj.file ) ) +
					' on line ' + errObj.line +
				'</code>';

			let details = '<pre>' + lines + '</pre>';

			global.logger.log( 'error', title, details );
		});
	}

	// return errObj;
}

function getErrLines( filename, line, callback ) {
	line = Math.max( parseInt( line, 10 ) - 1 || 0, 0 );

	fs.readFile( filename, function( err, data ) {
		if ( err ) {
			throw err;
		}

		var lines = data.toString('utf-8').split('\n');

		if ( +line > lines.length ) {
			return '';
		}

		let lineArr = [];
		let _lineArr = [];
		let minLine = Math.max( line - 2, 0 );
		let maxLine = Math.min( line + 2, lines.length );

		for ( var i = minLine; i <= maxLine; i++ ) {
			_lineArr[ i ] = lines[ i ];
		}

		// Remove extraneous indentation.
		let strippedLines = stripIndent( _lineArr.join('\n') ).split('\n');

		for ( var j = minLine; j <= maxLine; j++ ) {
			lineArr.push(
				'<div class="line' + ( line === j ? ' highlight' : '' ) + '">' +
					'<span class="line-number">' + ( j + 1 ) + '</span>' +
					'<span class="line-content">' + strippedLines[ j ] + '</span>' +
				'</div>'
			);
		}

		callback( null, lineArr.join('\n') );
	});
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
