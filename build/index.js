'use strict';

/* jshint esversion: 6 */

var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow;

var path = require('path');
var url = require('url');

// require('electron-reload')( __dirname, {
// 	electron: require( 'electron' )
// });

var mainWindow = void 0;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 600,
		autoHideMenuBar: true
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.webContents.openDevTools();

	mainWindow.webContents.on('dom-ready', function () {
		// renderFileList( 'res/img' );
	});

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});