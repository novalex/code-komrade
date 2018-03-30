/* jshint esversion:6 */

const Promise = require("bluebird");
const fs = Promise.promisifyAll( require('fs') );
const PATH = require('path');

const React = require('react');
const ReactDOM = require('react-dom');

function directoryTree( path, options = {}, depth = 0 ) {
	// If current path is included, reset depth counter.
	if ( options.include === path ) {
		depth = 0;
	}

	// If max depth was reached, bail.
	if ( options.depth && depth > options.depth ) {
		return null;
	}

	const name = PATH.basename( path );
	const item = { path, name };

	let stats;

	try {
		stats = fs.statSync(path);
	} catch( err ) {
		// console.log( err );
		return null;
	}

	// Skip if it matches the exclude regex.
	if ( options && options.exclude && ( options.exclude.test( path ) || options.exclude.test( name ) ) ) {
		return null;  
	}

	if ( stats.isFile() ) {
		const ext = PATH.extname( path ).toLowerCase();
		
		// Skip if it does not match the extension regex.
		if ( options && options.extensions && ! options.extensions.test( ext ) ) {
			return null;
		}

		// item.size = stats.size; // File size in bytes.
		item.extension = ext;
		item.type = 'file';
	} else if ( stats.isDirectory() ) {
		let files = {};

		try {
			files = fs.readdirSync( path );
		} catch( err ) {
			if ( err.code === 'EACCES' ) {
				// User does not have permissions, ignore directory.
				return null;
			} else {
				throw err;
			}
		}

		if ( files === null ) {
			return null;
		}

		item.children = files
			.map( child => directoryTree( PATH.join( path, child ), options, depth + 1 ) )
			.filter( e => !!e );
		// item.size = item.children.reduce( ( prev, cur ) => {
		// 	console.log( prev, cur.size );
		// 	return prev + cur.size;
		// }, 0 );
		item.type = 'directory';
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}

	return item;
}

Object.resolve = function( path, obj ) {
	let props = path.split('.'),
		obpath = '';

	for ( var i = 0; i < props.length; i++ ) {
		if ( 0 === i ) {
			obpath = 'children';
		} else {
			obpath += '.' + props[ i ] + '.children';
		}
	}

	return obpath.split('.').reduce( function( prev, curr ) {
		return ( prev ) ? prev[ curr ] : undefined
	}, obj || self );
};

class FileList extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			path: '',
			files: {},
			ignored: [
				'.git',
				'node_modules',
				'.DS_Store',
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

		if ( null !== ext ) {
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

	setPath( path ) {
		if ( path === this.state.path ) {
			return;
		}

		this.setState({
			path: path,
			files: this.walkDirectory( path ),
		});
	}

	walkDirectory( path, include = null ) {
		return directoryTree( path, {
			// depth: 2,
			exclude: new RegExp( this.state.ignored.join('|'), 'i' ),
			// include: include,
		} );
	}

	dirClick( event ) {
		// event.persist();
		event.stopPropagation()

		let element = event.currentTarget;

		element.classList.toggle('expand');

		if ( element.dataset.lazyload ) {
			// Load the files in this directory.
			this.setState({
				files: this.walkDirectory( this.state.path, element.dataset.lazyload ),
			});

			delete element.dataset.lazyload;
		}
	}

	fileClick( event ) {
		event.persist();
	}

	buildTree( file, level = 0, index = null ) {
		let type = file.type,
			ext  = file.extension || null,
			onClick,
			lazyload,
			children;

		// Skip ignored files.
		// if ( this.isFileIgnored( file.name ) ) {
		// 	return null;
		// }

		if ( 'directory' === file.type ) {
			if ( file.children.length > 0 ) {
				let childrenItems = [];

				for ( var child in file.children ) {
					if ( index ) {
						index += '.' + child;
					} else {
						index = child;
					}

					// console.log( Object.resolve( index, this.state.files ) );

					childrenItems.push( this.buildTree( file.children[ child ], level + 1, index ) );
				}

				children = <ul className="children" key={ file.path + '-children' }>{ childrenItems }</ul>;
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
