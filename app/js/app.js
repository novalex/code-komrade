/**
 * @file Main app script.
 */

const Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./utils/globalUI');

global.compiler = require('./gulp/interface');

global.compilerTasks = [];

const React = require('react');

const ReactDOM = require('react-dom');

const { Provider } = require('react-redux');

const { createStore } = require('redux');

const rootReducer = require('./reducers');

const store = createStore( rootReducer );

const App = require('./components/App');

ReactDOM.render(
	<Provider store={ store }>
		<App />
	</Provider>,
	document.getElementById('root')
);

// Context menu.
const fileList = document.getElementById('files');
// const filenames = fileList.getElementsByTagName('li');

fileList.addEventListener( 'contextmenu', function( event ) {
	let fileNameCont = event.target;

	if ( fileNameCont.tagName !== 'li' ) {
		fileNameCont = event.target.closest('li');
	}

	if ( fileNameCont.dataset.file ) {
		console.log( JSON.parse( decodeURIComponent( fileNameCont.dataset.file ) ) );
	}
});

const { sleep } = require('./utils/utils');

// App close/restart events.
window.addEventListener( 'beforeunload', function( event ) {
	if ( global.compilerTasks.length > 0 ) {
		console.log( 'Killing %d running tasks...', global.compilerTasks.length );

		global.compiler.killTasks();

		sleep( 300 );
	}
});
