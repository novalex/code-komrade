/* jshint esversion: 6 */
 
const { app, BrowserWindow } = require('electron');

const path = require('path');
const url  = require('url');

// require('electron-reload')( __dirname, {
// 	electron: require( 'electron' )
// });

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 600,
		autoHideMenuBar: true,
	});

	mainWindow.loadURL( url.format({
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.webContents.openDevTools();

	mainWindow.webContents.on( 'dom-ready', function() {
		// renderFileList( 'res/img' );
	});

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
