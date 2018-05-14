/**
 * @file Component for rendering a directory tree.
 */

const React = require('react');

const { FileListFile, FileListPlaceholder } = require('./FileListFile');

const FileListDirectory = require('./FileListDirectory');

class FileList extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			activeFile: null
		};

		this.setActiveFile = this.setActiveFile.bind( this );
	}

	getMimeType( ext ) {
		let type;

		switch ( ext ) {
			case '.svg':
			case '.png':
			case '.jpg':
				type = 'media';
				break;

			case '.php':
			case '.html':
			case '.css':
			case '.scss':
			case '.sass':
			case '.less':
			case '.js':
			case '.ts':
			case '.jsx':
			case '.json':
				type = 'code';
				break;

			case '.zip':
			case '.rar':
			case '.tar':
			case '.7z':
			case '.gz':
				type = 'zip';
				break;

			default:
				type = 'text';
				break;
		}

		return type;
	}

	setActiveFile( element ) {
		if ( this.state.activeFile && this.state.activeFile === element ) {
			return;
		}

		if ( element ) {
			element.classList.add('active');
		}

		this.setState( function( prevState ) {
			if ( prevState.activeFile ) {
				prevState.activeFile.classList.remove('active', 'has-options');
			}

			return { activeFile: element };
		})
	}

	buildTree( file, level = 0 ) {
		let type = file.type;
		let ext = file.extension || null;
		let children;

		if ( file.type === 'directory' ) {
			if ( file.children.length > 0 ) {
				let childrenItems = [];

				for ( var child in file.children ) {
					childrenItems.push( this.buildTree( file.children[ child ], level + 1 ) );
				}

				children = <ul className='children' key={ file.path + '-children' }>{ childrenItems }</ul>;
			}

			return <FileListDirectory
				key={ file.path }
				file={ file }
				level={ level }
				children={ children }
			/>;
		} else {
			type = this.getMimeType( ext );

			return <FileListFile
				key={ file.path }
				file={ file }
				type={ type }
				level={ level }
				base={ this.props.path }
				setActiveFile={ this.setActiveFile }
			/>;
		}
	}

	renderTree() {
		if ( this.props.loading ) {
			return (
				<FileListPlaceholder type='loading'>
					Loading &hellip;
				</FileListPlaceholder>
			);
		} else if ( ! this.props.path ) {
			return (
				<FileListPlaceholder type='empty'>
					No folder selected.
				</FileListPlaceholder>
			);
		} else if ( ! this.props.files || ! Object.keys( this.props.files ).length ) {
			return (
				<FileListPlaceholder type='empty'>
					Nothing to see here.
				</FileListPlaceholder>
			);
		}

		let filelist = [];

		if ( this.props.files.children && this.props.files.children.length > 0 ) {
			// Show only the contents of the top-level directory.
			for ( var child in this.props.files.children ) {
				filelist.push( this.buildTree( this.props.files.children[ child ] ) );
			}
		} else {
			filelist.push( this.buildTree( this.props.files ) );
		}

		return filelist;
	}

	render() {
		return (
			<ul id='files'>
				{ this.renderTree() }
			</ul>
		);
	}
}

module.exports = FileList;
