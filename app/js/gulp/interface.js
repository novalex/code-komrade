/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

const path = require('path');
const spawn = require('child_process').spawn;

let OSCmd = process.platform === 'win32' ? '.cmd' : '';
let gulpPath = path.join( __dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd );
let gulpFilePath = path.join( __dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js' );

function runTask( taskName, input, filename, output ) {
	let args = [
		taskName,
		'--gulpfile', gulpFilePath,
		'--input', input,
		'--filename', filename,
		'--output', output,
		'--no-color'
	];
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
		let gulpNotification = new Notification( 'Buildr compile error', {
			body: `[error] ${data}`
		});
	});

	cp.on( 'exit', code => {
		let gulpNotification;

		if ( code === 0 ) {
			gulpNotification = new Notification('Buildr', {
				body: 'Finished running tasks'
			});
		} else {
			console.error(`Exited with error code ${code}`);

			gulpNotification = new Notification( 'Buildr compile error', {
				body: `Exited with error code ${code}`,
				sound: 'Basso'
			});
		}
	});
}

module.exports = {
	runTask
}
