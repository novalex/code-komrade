'use strict';

/**
 * @file Main application controller.
 */

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
		width: 1200,
		height: 2000,
		autoHideMenuBar: true
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Debugging.
	mainWindow.webContents.openDevTools();
	mainWindow.webContents.executeJavaScript("require('electron-react-devtools').install()");

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