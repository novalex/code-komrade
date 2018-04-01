/**
 * @file Main application controller.
 */

const { app, BrowserWindow } = require('electron');

const windowStateKeeper = require('electron-window-state');

const path = require('path');
const url = require('url');

var mainWindow = void 0;

function createWindow() {
	let mainWindowState = windowStateKeeper({
		defaultWidth: 1200,
		defaultHeight: 1080
	});

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		autoHideMenuBar: true
	});

	mainWindowState.manage( mainWindow );

	mainWindow.loadURL( url.format({
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	}));

	// Debugging.
	mainWindow.webContents.openDevTools();

	// mainWindow.webContents.on( 'dom-ready', function() {
	// });

	mainWindow.on( 'closed', function () {
		mainWindow = null;
	});
}

app.on( 'ready', createWindow );

app.on( 'window-all-closed', function () {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
});

app.on( 'activate', function () {
	if ( mainWindow === null ) {
		createWindow();
	}
});
