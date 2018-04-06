/**
 * @file Main app script.
 */

const React = require('react');

const ReactDOM = require('react-dom');

const Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./utils/globalUI');

const Projects = require('./components/projects/Projects');

ReactDOM.render(
	<Projects />,
	document.getElementById('app')
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
