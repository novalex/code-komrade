/*
   Copyright (c) 2014 BlackBerry Limited.

   Licensed under the Apache License, Version 2.0 (the 'License');
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an 'AS IS' BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

var through = require( 'through' );
var path = require( 'path' );

module.exports = function( b, options ) {
	/**
	 * Automatically replace the sourcemap dirname
	 */
	var basedir;
	if ( 'basedir' in options ) {
		basedir = options.basedir;
	} else if ( '_options' in b && 'basedir' in b._options ) {
		basedir = b._options.basedir;
	} else {
		try {
			basedir = require( path.join( process.cwd(), 'package.json' ) ).name;
		} catch ( e ) {}
	}
	b.pipeline.get( 'debug' ).splice( 0, 1, through( function write( dep ) {
		var sourceFile = path.relative( process.cwd(), dep.file );
		if ( basedir ) {
			sourceFile = path.join( basedir, sourceFile );
		}
		dep.sourceFile = sourceFile;
		this.queue( dep );
	}, function end() {
		this.queue( null );
	} ) );

	return this;
};