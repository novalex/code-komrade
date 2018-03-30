/**
 * @file Walk a directory and return the files and folders as an object.
 */

const Promise = require('bluebird');

const fs = Promise.promisifyAll( require('fs') );

const fspath = require('path');

function directoryTree( path, options = {}, depth = 0 ) {
	// If max depth was reached, bail.
	if ( options.depth && depth > options.depth ) {
		return null;
	}

	const name = fspath.basename( path );
	const item = { path, name };

	let stats;

	try {
		stats = fs.statSync(path);
	} catch ( err ) {
		// console.log( err );
		return null;
	}

	// Skip if it matches the exclude regex.
	if ( options && options.exclude && ( options.exclude.test( path ) || options.exclude.test( name ) ) ) {
		return null;
	}

	if ( stats.isFile() ) {
		item.type = 'file';

		const ext = fspath.extname( path ).toLowerCase();

		// Skip if it does not match the extension regex.
		if ( options && options.extensions && ! options.extensions.test( ext ) ) {
			return null;
		}

		// item.size = stats.size; // File size in bytes.
		item.extension = ext;

		return item;
	} else if ( stats.isDirectory() ) {
		item.type = 'directory';

		fs.readdir( path, function( err, files ) {
			if ( err ) {
				if ( err.code === 'EACCES' ) {
					// User does not have permissions, ignore directory.
					return null;
				} else {
					throw err;
				}
			}

			item.children = [];

			for ( let i = 0; i < files.length; i++ ) {
				item.children.push( directoryTree( fspath.join( path, files[ i ] ), options, depth + 1 ) );
			}

			return item;
		});

		// item.size = item.children.reduce( ( prev, cur ) => {
		// 	console.log( prev, cur.size );
		// 	return prev + cur.size;
		// }, 0 );
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}
}

module.exports = directoryTree;
