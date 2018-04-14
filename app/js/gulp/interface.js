/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const path = require('path');
const spawn = require('child_process').spawn;
const psTree = require('ps-tree');

const OSCmd = process.platform === 'win32' ? '.cmd' : '';
const gulpPath = path.join( __dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd );
const gulpFilePath = path.join( __dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js' );

const { fileAbsolutePath, fileOutputPath } = require('../utils/pathHelpers');

function getTasks() {
	return global.compilerTasks || [];
}

function killTasks() {
	if ( getTasks().length ) {
		for ( var task of getTasks() ) {
			terminateProcess( task );
		}
	}
}

function terminateProcess( proc ) {
	psTree( proc.pid, function( err, children ) {
		if ( err ) {
			console.log( err );
		}

		for ( var pid of [ proc.pid ].concat( children.map( child => child.PID ) ) ) {
			process.kill( pid );
		}
	});
}

function initProject() {
	killTasks();

	if ( ! global.projectConfig ) {
		return;
	}

	let watchCssFiles = [];
	let watchJsFiles = [];
	let projectFiles = global.projectConfig.get( 'files', [] );

	let projectPath = path.parse( global.projectConfig.path ).dir;

	for ( var i = projectFiles.length - 1; i >= 0; i-- ) {
		let file = projectFiles[ i ];

		if ( ! file.options ) {
			continue;
		}

		if ( ! file.options.output ) {
			let suffix = '-dist';
			let extension = ( file.type === 'script' ) ? '.js' : '.css';
			file.name = path.basename( file.path );
			file.options.output = fileOutputPath( file, suffix, extension );
		}

		let imports = [];
		if ( file.options.imports ) {
			imports = file.options.imports.map( importPath => fileAbsolutePath( projectPath, importPath ) );
		}

		if ( file.options.autocompile ) {
			autoCompile( projectPath, file, imports );
		}
	}
}

function autoCompile( base, file, imports ) {
	let filePath = fileAbsolutePath( base, file.path );
	let outputPath = fileAbsolutePath( base, file.options.output );
	let options = {
		input: filePath,
		filename: path.basename( outputPath ),
		output: path.parse( outputPath ).dir,
		watchFiles: imports.join('|')
	};

	if ( file.type === 'style' ) {
		options.watchTask = 'build-css';
		options.outputStyle = file.options.style || 'nested';
	}

	runTask( 'watch', options );
}

function runTask( taskName, options = {}, callback = null ) {
	let args = [
		taskName,
		'--gulpfile', gulpFilePath,
		'--no-color'
	];

	for ( var option in options ) {
		if ( ! options.hasOwnProperty( option ) ) {
			continue;
		}

		args.push( '--' + option );
		args.push( options[ option ] );
	}

	const cp = spawn( gulpPath, args );

	global.compilerTasks.push( cp );

	cp.stdout.setEncoding('utf8');

	cp.stdout.on( 'data', data => {
		console.log( data );
	});

	// TODO: show progress in menubar menu
	// tray.menu = createTrayMenu(name, [], 'progress here');

	cp.stderr.setEncoding('utf8');

	cp.stderr.on( 'data', data => {
		console.error( data );
	});

	cp.on( 'exit', code => {
		let filename = options.filename || 'file';

		// Remove this task from global array.
		global.compilerTasks = global.compilerTasks.filter( proc => {
			return ( proc.pid !== cp.pid );
		});

		if ( code === 0 ) {
			new Notification( 'Buildr', {
				body: `Finished compiling ${filename}.`,
				silent: true
			});
		} else if ( code === 1 ) {
			console.log( 'Process %s terminated', cp.pid );
		} else {
			let filename = options.filename || 'File';

			new Notification( 'Buildr', {
				body: `Error when compiling ${filename}.`,
				sound: 'Basso'
			});

			console.error(`Exited with error code ${code}`);
		}

		if ( callback ) {
			callback( code );
		}
	});
}

module.exports = {
	initProject,
	runTask,
	getTasks,
	killTasks,
	terminateProcess
}
