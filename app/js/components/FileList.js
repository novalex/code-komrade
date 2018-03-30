/**
 * @file Component for rendering a directory tree.
 */

const Promise = require('bluebird');

const React = require('react');

const directoryTree = require('../helpers/directoryTree.js');

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
			]
		};

		this.dirClick  = this.dirClick.bind( this );
		this.fileClick = this.fileClick.bind( this );
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

		if ( ext !== null ) {
			ext = ext.replace( '.', '' );
		}

		switch ( ext ) {
			case 'svg':
			case 'png':
			case 'jpg':
				type = 'media';
				break;

			case 'php':
			case 'html':
			case 'css':
			case 'scss':
			case 'js':
			case 'json':
				type = 'code';
				break;

			case 'zip':
			case 'rar':
			case 'tar':
			case '7z':
			case 'gz':
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

		let files = this.walkDirectory( path );

		console.log( files );

		this.setState({
			path,
			files
		});
	}

	dirClick( event ) {
		// event.persist();
		event.stopPropagation()

		let element = event.currentTarget;

		element.classList.toggle('expand');

		if ( element.dataset.lazyload ) {
			// Load the files in this directory.
			this.setState({
				files: this.walkDirectory( this.state.path, element.dataset.lazyload )
			});

			delete element.dataset.lazyload;
		}
	}

	fileClick( event ) {
		event.persist();
	}

	buildTree( file, level = 0 ) {
		let type = file.type;
		let ext  = file.extension || null;
		let onClick;
		let lazyload;
		let children;

		// Skip ignored files.
		// if ( this.isFileIgnored( file.name ) ) {
		// 	return null;
		// }

		if ( file.type === 'directory' ) {
			if ( file.children.length > 0 ) {
				let childrenItems = [];

				for ( var child in file.children ) {
					childrenItems.push( this.buildTree( file.children[ child ], level + 1 ) );
				}

				children = <ul className='children' key={ file.path + '-children' }>{ childrenItems }</ul>;
			} else {
				lazyload = file.path;
			}

			onClick = this.dirClick;
		} else {
			type = this.getMimeType( ext );
			onClick = this.fileClick;
		}

		return (
			<li className={ type } key={ file.path } data-lazyload={ lazyload } onClick={ onClick }>
				<div className="filename">
					{ String.fromCharCode('0x2003').repeat( level ) }
					<span className="icon"></span>
					<strong>{ file.name }</strong>
				</div>
				{ children }
			</li>
		);
	}

	renderTree() {
		if ( ! this.state.path ) {
			return <li className="empty">No path specified</li>;
		} else if ( ! this.state.files ) {
			return <li className="empty">No files</li>;
		}

		let filelist = [];

		// console.log( this.state.files );

		// Show only the contents of the directory.
		if ( this.state.files.children ) {
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
			<ul id="files">
				{ this.renderTree() }
			</ul>
		);
	}
}

module.exports = FileList;
