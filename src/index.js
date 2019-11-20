/**
 * @file Main application controller.
 */

const { app, dialog, Menu, BrowserWindow } = require('electron');

const windowStateKeeper = require('electron-window-state');

const path = require('path');
const url = require('url');

var mainWindow = void 0;

function createWindow() {
	let mainWindowState = windowStateKeeper({
		defaultWidth: 800,
		defaultHeight: 600
	});

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		autoHideMenuBar: true,
		icon: path.join( __dirname, 'res/img/logo/png/64x64.png' )
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
			message: 'Code Komrade has become unresponsive.',
			buttons: [ 'Re-launch', 'Quit' ]
		};

		dialog.showMessageBox( options, function( index ) {
			if ( index === 0 ) {
				app.relaunch();
			} else if ( index === 1 ) {
				app.exit( 0 );
			}
		});
	});

	global.mainWindow = mainWindow;

	// Debugging.
	mainWindow.webContents.openDevTools();
}

function createMenu() {
	// Menu template.
	const menuTemplate = [
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'toggledevtools' },
				{ type: 'separator' },
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' }
			]
		},
		{
			role: 'window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'close' }
			]
		}
		// {
		// 	role: 'help',
		// 	submenu: [
		// 		{
		// 			label: 'Learn More',
		// 			click () { require('electron').shell.openExternal('https://electronjs.org') }
		// 		}
		// 	]
		// }
	];

	if ( process.platform === 'darwin' ) {
		menuTemplate.unshift({
			label: app.getName(),
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				// { role: 'services', submenu: [] },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		});

		// Window menu.
		menuTemplate[2].submenu = [
			{ role: 'close' },
			{ role: 'minimize' },
			{ role: 'zoom' },
			{ type: 'separator' },
			{ role: 'front' }
		];
	}
	const appMenu = Menu.buildFromTemplate( menuTemplate );
	Menu.setApplicationMenu( appMenu );
}

app.on( 'ready', function() {
	// Init menu.
	createMenu();

	// Init main window.
	createWindow();
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

app.setAppUserModelId( 'Code Komrade' );
