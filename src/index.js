/**
 * @file Main application controller.
 */

const electron = require('electron');

const { app, dialog, BrowserWindow } = electron;

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

	mainWindow.on( 'closed', function () {
		mainWindow = null;
	});

	mainWindow.on( 'unresponsive', function () {
		const options = {
			type: 'warning',
			title: 'Just Hangin\'',
			message: 'Buildr has become unresponsive.',
			buttons: [ 'Re-launch', 'Quit' ]
		};

		dialog.showMessageBox( options, function( index ) {
			if ( index === 0 ) {
				app.relaunch();
			}
			app.exit( 0 );
		});
	});
}

app.on( 'ready', function() {
	createWindow();

	// Debugging.
	mainWindow.webContents.openDevTools();

	// mainWindow.webContents.on( 'dom-ready', function() {
	// });

	// let scaleFactor = electron.screen.getPrimaryDisplay();

	// mainWindow.webContents.executeJavaScript(`console.log( ${ JSON.stringify(scaleFactor) } )`);
});

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

app.setAppUserModelId( 'Buildr' );
