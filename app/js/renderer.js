/* jshint esversion: 6, multistr: true */

const Store  = require('electron-store');
const config = new Store({
	name: 'buildr-config',
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
const file_list = document.getElementById('files'),
	  filenames = file_list.getElementsByTagName('li');

file_list.addEventListener( 'contextmenu', function( event ) {
	let filename_cont = event.target;

	if ( 'li' !== filename_cont.tagName ) {
		filename_cont = event.target.closest('li');
	}

	if ( filename_cont.dataset.file ) {
		console.log( JSON.parse( decodeURIComponent( filename_cont.dataset.file ) ) );
	}
});
