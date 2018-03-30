/**
 * @file Walk a directory and return the files and folders as an object.
 */

const Promise = require('bluebird');

const fs = Promise.promisifyAll( require('fs') );

const fspath = require('path');

function directoryTree( path, options = {}, depth = 0 ) {
	return new Promise( function( resolve, reject ) {
		// If max depth was reached, bail.
		if ( options.depth && depth > options.depth ) {
			resolve( null );
		}

		const name = fspath.basename( path );
		const item = { path, name };

		let stats;

		try {
			stats = fs.statSync(path);
		} catch ( err ) {
			// console.log( err );
			resolve( null );
		}

		// Skip if it matches the exclude regex.
		if ( options && options.exclude && ( options.exclude.test( path ) || options.exclude.test( name ) ) ) {
			resolve( null );
		}

		if ( stats.isFile() ) {
			item.type = 'file';

			const ext = fspath.extname( path ).toLowerCase();

			// Skip if it does not match the extension regex.
			if ( options && options.extensions && ! options.extensions.test( ext ) ) {
				resolve( null );
			}

			// item.size = stats.size; // File size in bytes.
			item.extension = ext;

			resolve( item );
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

				Promise.map( files, function( file ) {
					return directoryTree( fspath.join( path, file ), options, depth + 1 );
				}).then( function( children ) {
					item.children = children.filter( (e) => !!e );
					resolve( item );
				});
			});

			// item.size = item.children.reduce( ( prev, cur ) => {
			// 	console.log( prev, cur.size );
			// 	return prev + cur.size;
			// }, 0 );
		} else {
			resolve( null ); // Or set item.size = 0 for devices, FIFO and sockets ?
		}
	});
}

module.exports = directoryTree;
