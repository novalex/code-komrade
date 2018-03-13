/* jshint esversion: 6, multistr: true */
 
const { app, BrowserWindow } = require('electron');

const path = require('path');
const url  = require('url');

require('electron-reload')( __dirname, {
	electron: path.join( __dirname, 'node_modules', '.bin', 'electron' )
});

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow( { width: 1200, height: 600 } );

	mainWindow.loadURL( url.format({
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	mainWindow.webContents.openDevTools()

	try {
		renderFileList();
	} catch( e ) {
		console.log( e );
	}

	mainWindow.on( 'closed', function() {
		mainWindow = null;
	} );
}

app.on( 'ready', createWindow );

app.on( 'window-all-closed', function() {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

app.on( 'activate', function() {
	if ( mainWindow === null ) {
		createWindow();
	}
} );

process.on( 'uncaughtException', function( error ) {
	console.log( error );
} );

// Build file list.
const dirTree = require('directory-tree');

function renderFileList() {
	const tree = dirTree('res');

	let fileList = makeFileListMarkup( tree );

	mainWindow.webContents.executeJavaScript(`
		document.getElementById('files').innerHTML = '${fileList}';
	`);
}

function makeFileListMarkup( files ) {
	let html = '';

	html += '<li class="' + files.type + '">\
		<div class="filename">\
			<span class="icon"></span>\
			<strong>' + files.name + '</strong>\
		</div>';

	if ( 'directory' === files.type ) {
		html += '<ul class="children">';
			for ( var i = files.children.length - 1; i >= 0; i-- ) {
				html += makeFileListMarkup( files.children[i] );
			}
		html += '</ul>';
	} else {
		html += '</li>';
	}

	return html;
}
