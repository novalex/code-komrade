/**
 * @file Component for rendering a file in the filelist.
 */

const React = require('react');

const ReactDOM = require('react-dom');

const FileOptionsScript = require('../fileoptions/FileOptionsScript');

const FileOptionsStyle = require('../fileoptions/FileOptionsStyle');

class FileListFile extends React.Component {
	constructor( props ) {
		super( props );

		this.onClick = this.onClick.bind( this );
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
			global.ui.offCanvas( false );
			return;
		}

		event.currentTarget.classList.add('has-options');

		ReactDOM.render(
			_FileOptions,
			document.getElementById('off-canvas')
		);

		global.ui.offCanvas( true, document.getElementById('files') );
	}

	render() {
		return (
			<li className={ this.props.type } onClick={ this.onClick }>
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
