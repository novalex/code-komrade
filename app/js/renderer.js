/* jshint esversion: 6, multistr: true */

const Store  = require('electron-store');
const config = new Store({
	name: 'buildr-config'
});

const React = require('react');
const ReactDOM = require('react-dom');

const Projects = require('./components/Projects');

ReactDOM.render(
	<Projects config={ config } />,
	document.getElementById('app')
);

// require( './plugins/velocity.min.js' );

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
