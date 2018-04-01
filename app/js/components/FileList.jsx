/**
 * @file Component for rendering a directory tree.
 */

const React = require('react');

const ReactDOM = require('react-dom');

const FileOptionsScript = require('./FileOptionsScript');

const FileOptionsStylesheet = require('./FileOptionsStylesheet');

const globalUI = require('../helpers/globalUI');

const directoryTree = require('../helpers/directoryTree');

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
			case '.scss':
			case '.sass':
			case '.less':
				return <FileOptionsStylesheet file={ file } />;
			case '.js':
			case '.ts':
			case '.jsx':
				return <FileOptionsScript file={ file } />;
			default:
				return null;
		}
	}

	onClick( event ) {
		event.stopPropagation();

		let _FileOptions = this.getOptions( this.props.file );

		if ( ! _FileOptions ) {
			globalUI.offCanvas( false );
			return;
		}

		ReactDOM.render(
			_FileOptions,
			document.getElementById('off-canvas')
		);

		globalUI.offCanvas( true );
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

class FileListDirectory extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			expanded: false
		};

		this.onClick = this.onClick.bind( this );
	}

	renderChildren() {
		if ( ! this.state.expanded ) {
			return null;
		}

		return this.props.children;
	}

	onClick( event ) {
		event.stopPropagation();

		globalUI.offCanvas( false );

		this.setState( function( prevState ) {
			return { expanded: ! prevState.expanded };
		});
	}

	render() {
		let className = 'directory';

		if ( this.state.expanded ) {
			className += ' expand';
		}

		return (
			<li className={ className } onClick={ this.onClick }>
				<div className='filename'>
					{ String.fromCharCode('0x2003').repeat( this.props.level ) }
					<span className='icon' />
					<strong>{ this.props.file.name }</strong>
				</div>
				{ this.renderChildren() }
			</li>
		);
	}
}

class FileList extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			path: '',
			files: {},
			ignored: [
				'.git',
				'node_modules',
				'.DS_Store'
			],
			loading: false
		};
	}

	componentDidMount() {
		if ( this.props.path ) {
			this.setPath( this.props.path );
		}
	}

	isFileIgnored( filename ) {
		for ( var i = this.state.ignored.length - 1; i >= 0; i-- ) {
			if ( filename === this.state.ignored[ i ] ) {
				return true;
			}
		}

		return false;
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

	walkDirectory( path ) {
		let exclude = new RegExp( this.state.ignored.join('|'), 'i' );

		return directoryTree( path, {
			// depth: 2,
			exclude
		});
	}

	setPath( path ) {
		if ( path === this.state.path ) {
			return;
		}

		this.setState({ loading: true });

		globalUI.loading();

		this.walkDirectory( path ).then( function( files ) {
			this.setState({
				path,
				files,
				loading: false
			});

			globalUI.loading( false );
		}.bind( this ));
	}

	buildTree( file, level = 0 ) {
		let type = file.type;
		let ext  = file.extension || null;
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
			/>;
		}
	}

	renderTree() {
		if ( this.state.loading ) {
			return (
				<FileListPlaceholder type='loading'>
					Loading &hellip;
				</FileListPlaceholder>
			);
		} else if ( ! this.state.path ) {
			return (
				<FileListPlaceholder type='empty'>
					No folder selected.
				</FileListPlaceholder>
			);
		} else if ( ! this.state.files ) {
			return (
				<FileListPlaceholder type='empty'>
					Nothing to see here.
				</FileListPlaceholder>
			);
		}

		let filelist = [];

		if ( this.state.files.children && this.state.files.children.length > 0 ) {
			// Show only the contents of the top-level directory.
			for ( var child in this.state.files.children ) {
				filelist.push( this.buildTree( this.state.files.children[ child ] ) );
			}
		} else {
			filelist.push( this.buildTree( this.state.files ) );
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
