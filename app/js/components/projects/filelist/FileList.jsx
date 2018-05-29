/**
 * @file Component for rendering a directory tree.
 */

const React = require('react');

const { connect } = require('react-redux');

const FileListFile = require('./FileListFile');

const FileListDirectory = require('./FileListDirectory');

const NoContent = require('../../NoContent');

const { setActiveFile } = require('../../../actions');

class FileList extends React.Component {
	constructor( props ) {
		super( props );

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

	setActiveFile( fileProps ) {
		if ( this.props.activeFile && this.props.activeFile.element === fileProps.element ) {
			return;
		}

		if ( fileProps.element ) {
			fileProps.element.classList.add('active');
		}

		if ( this.props.activeFile ) {
			this.props.activeFile.element.classList.remove('active', 'has-options');
		}

		this.props.setActiveFile( fileProps );
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

	render() {
		if (
			this.props.loading ) {
			return (
				<NoContent className='loading'>
					<p>Loading&hellip;</p>
				</NoContent>
			);
		} else if ( ! this.props.path ) {
			return (
				<NoContent className='empty'>
					<p>No project folder selected.</p>
				</NoContent>
			);
		} else if ( ! this.props.files || ! Object.keys( this.props.files ).length ) {
			return (
				<NoContent className='empty'>
					<p>Nothing to see here.</p>
				</NoContent>
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

		return (
			<ul id='files'>
				{ filelist }
			</ul>
		);
	}
}

const mapStateToProps = ( state ) => ({
	activeFile: state.activeFile
});

const mapDispatchToProps = ( dispatch ) => ({
	setActiveFile: payload => dispatch( setActiveFile( payload ) )
});

module.exports = connect( mapStateToProps, mapDispatchToProps )( FileList );
