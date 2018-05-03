/**
 * @file Component for rendering a file in the filelist.
 */

const { remote, shell } = require('electron');

const { Menu, MenuItem } = remote;

const React = require('react');

const ReactDOM = require('react-dom');

const FileOptionsScript = require('../fileoptions/FileOptionsScript');

const FileOptionsStyle = require('../fileoptions/FileOptionsStyle');

class FileListFile extends React.Component {
	constructor( props ) {
		super( props );

		this.onClick = this.onClick.bind( this );
		this.onContextMenu = this.onContextMenu.bind( this );
	}

	getOptions( file ) {
		if ( ! file.extension ) {
			return null;
		}

		switch ( file.extension ) {
			case '.css':
			case '.scss':
			case '.sass':
			case '.less':
				return <FileOptionsStyle base={ this.props.base } file={ file } />;
			case '.js':
			case '.ts':
			case '.jsx':
				return <FileOptionsScript base={ this.props.base } file={ file } />;
			default:
				return null;
		}
	}

	onClick( event ) {
		event.stopPropagation();

		this.props.setActiveFile( event.currentTarget );

		let _FileOptions = this.getOptions( this.props.file );

		if ( ! _FileOptions ) {
			// Todo: render original panel contents.
			return;
		}

		event.currentTarget.classList.add('has-options');

		ReactDOM.render(
			_FileOptions,
			document.getElementById('panel')
		);
	}

	onContextMenu( event ) {
		event.preventDefault();

		let filePath = this.props.file.path;

		let menu = new Menu();
		menu.append( new MenuItem({
			label: 'Open',
			click: function() { shell.openItem( filePath ) }
		}) );
		menu.append( new MenuItem({
			label: 'Show in folder',
			click: function() { shell.showItemInFolder( filePath ) }
		}) );
		menu.append( new MenuItem({
			type: 'separator'
		}) );
		menu.append( new MenuItem({
			label: 'Delete',
			click: function() {
				if ( window.confirm( `Are you sure you want to delete ${this.props.file.name}?` ) ) {
					if ( shell.moveItemToTrash( filePath ) ) {
						/* global Event */
						document.dispatchEvent( new Event('bd/refresh/files') );
					} else {
						window.alert( `Could not delete ${this.props.file.name}.` );
					}
				}
			}.bind( this )
		}) );

		menu.popup( remote.getCurrentWindow() );
	}

	render() {
		return (
			<li
				className={ this.props.type }
				onClick={ this.onClick }
				onContextMenu={ this.onContextMenu }
			>
				<div className='filename'>
					{ String.fromCharCode('0x2003').repeat( this.props.level ) }
					<span className='icon' />
					<strong>{ this.props.file.name }</strong>
				</div>
			</li>
		);
	}
}

function FileListPlaceholder( props ) {
	return (
		<li className={ props.type + ' informative' }>
			<div className='inner'>{ props.children }</div>
		</li>
	);
}

module.exports = {
	FileListFile,
	FileListPlaceholder
}
