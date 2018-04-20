/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const { app } = require('electron').remote;

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const psTree = require('ps-tree');

const OSCmd = process.platform === 'win32' ? '.cmd' : '';
const gulpPath = path.join( __dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd );
const gulpFilePath = path.join( __dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js' );

const { fileAbsolutePath } = require('../utils/pathHelpers');

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
		let watchFiles = [];

		if ( fileConfig.imports && fileConfig.imports.length > 0 ) {
			watchFiles = fileConfig.imports.map( importPath => fileAbsolutePath( base, importPath ) );
		}

		watchFiles.push( fileAbsolutePath( base, fileConfig.path ) );

		options.watchFiles = watchFiles.join(' ');

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
		output: path.parse( outputPath ).dir
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
	let args = [
		taskName,
		'--cwd', app.getAppPath(),
		'--gulpfile', gulpFilePath,
		'--no-color'
	];

	let filename = options.filename || 'file';

	for ( var option in options ) {
		if ( ! options.hasOwnProperty( option ) ) {
			continue;
		}

		if ( typeof( options[ option ] ) !== 'boolean' ) {
			args.push( '--' + option );
			args.push( options[ option ] );
		} else if ( options[ option ] === true ) {
			args.push( '--' + option );
		}
	}

	const cp = spawn( gulpPath, args );

	console.log( 'Started %s with PID %d', taskName, cp.pid );

	global.compilerTasks.push( cp );

	cp.stdout.setEncoding('utf8');

	cp.stdout.on( 'data', data => {
		console.log( data );

		if ( data.match(/Finished 'build-.*'/) ) {
			// Build task successful.
			let notifyText = `Finished compiling ${filename}.`;

			let notify = new Notification( 'Buildr', {
				body: notifyText,
				silent: true
			});

			global.logger.log( 'success', notifyText );
		} else if ( data.match(/Starting 'build-.*'/) ) {
			// Build task starting.
			global.logger.log( 'info', `Compiling ${filename}...` );
		}
	});

	cp.stderr.setEncoding('utf8');

	cp.stderr.on( 'data', handleStderr );

	cp.on( 'exit', code => {
		// Remove this task from global array.
		global.compilerTasks = global.compilerTasks.filter( proc => {
			return ( proc.pid !== cp.pid );
		});

		if ( code === 0 ) {
			// Success.
			// new Notification( 'Buildr', {
			// 	body: `Finished compiling ${filename}.`,
			// 	silent: true
			// });
		} else if ( code === 1 ) {
			// Terminated.
			// console.log( 'Process %s terminated', cp.pid );
		} else if ( code ) {
			// new Notification( 'Buildr', {
			// 	body: `Error when compiling ${filename}.`,
			// 	sound: 'Basso'
			// });

			console.error(`Exited with error code ${code}`);
		}

		if ( callback ) {
			callback( code );
		}
	});
}

function handleStderr( data ) {
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

		getLines( errObj.file, errObj.line, function( err, lines ) {
			if ( err ) {
				console.error( err );
			}

			let errLines = lines.join('<br>');

			global.logger.log( 'error', errObj.formatted, errLines );
		});
	}

	// return errObj;
}

function getLines( filename, line, callback ) {
	line = parseInt( line, 10 ) - 1 || 1;

	fs.readFile(filename, function( err, data ) {
		if ( err ) {
			throw err;
		}

		var lines = data.toString('utf-8').split('\n');

		if ( +line > lines.length ) {
			return '';
		}

		let lineArr = [];
		let minLine = Math.max( line - 2, 1 );
		let maxLine = Math.min( line + 2, lines.length );

		for ( var i = minLine; i <= maxLine; i++ ) {
			lineArr.push( lines[ i ] );
		}

		callback( null, lineArr );
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
