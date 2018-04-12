/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const path = require('path');
const spawn = require('child_process').spawn;

let OSCmd = process.platform === 'win32' ? '.cmd' : '';
let gulpPath = path.join( __dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd );
let gulpFilePath = path.join( __dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js' );

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

		if ( code === 0 ) {
			new Notification( 'Buildr', {
				body: `Finished compiling ${filename}.`,
				silent: true
			});
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
	runTask
}
