/**
 * This has been adapted from `create-react-app`, authored by Facebook, Inc.
 * see: https://github.com/facebookincubator/create-react-app/tree/master/packages/react-dev-utils
 */

const fs = require( 'fs' );
const stripIndent = require('strip-indent');
const { slash, fileRelativePath } = require('../utils/pathHelpers');

const errorLabel = 'Syntax error:';
const isLikelyASyntaxError = str => str.includes( errorLabel );

const exportRegex = /\s*(.+?)\s*(")?export '(.+?)' was not found in '(.+?)'/;
const stackRegex = /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm;
const fileAndLineRegex = /in ([^(]*)\s\(line\s(\d*),\scolumn\s(\d*)\)/;

function formatMessage( message, isError ) {
	let lines = message.split( '\n' );

	if ( lines.length > 2 && lines[ 1 ] === '' ) {
		lines.splice( 1, 1 ); // Remove extra newline.
	}

	// Remove loader notation from filenames:
	//   `./~/css-loader!./src/App.css` ~~> `./src/App.css`
	if ( lines[0].lastIndexOf( '!' ) !== -1 ) {
		lines[0] = lines[0].substr( lines[ 0 ].lastIndexOf( '!' ) + 1 );
	}

	// Remove useless `entry` filename stack details
	lines = lines.filter( line => line.indexOf( ' @ ' ) !== 0 );

	// 0 ~> filename; 1 ~> main err msg
	if ( ! lines[0] || ! lines[1] ) {
		return lines.join( '\n' );
	}

	// Cleans up verbose "module not found" messages for files and packages.
	if ( lines[1].startsWith( 'Module not found: ' ) ) {
		lines = [
			lines[0],
			lines[1] // "Module not found: " is enough detail
				.replace( "Cannot resolve 'file' or 'directory' ", '' )
				.replace( 'Cannot resolve module ', '' )
				.replace( 'Error: ', '' )
				.replace( '[CaseSensitivePathsPlugin] ', '' )
		];
	}

	// Cleans up syntax error messages.
	if ( lines[1].startsWith( 'Module build failed: ' ) ) {
		lines[1] = lines[1].replace( 'Module build failed: SyntaxError:', errorLabel );
	}

	if ( lines[1].match( exportRegex ) ) {
		lines[1] = lines[1].replace( exportRegex, "$1 '$4' does not contain an export named '$3'." );
	}

	// Reassemble & Strip internal tracing, except `webpack:` -- (create-react-app/pull/1050)
	return lines.join( '\n' ).replace( stackRegex, '' ).trim();
}

function handleStderr( data ) {
	console.log( data );

	let errObj = {};
	let startCapture = false;

	var lines = data.split( /(\r\n|[\n\v\f\r\x85\u2028\u2029])/ );

	for ( var line of lines ) {
		let trimmed = line.trim();

		if ( !trimmed.length ) {
			continue;
		}

		if ( trimmed === 'Details:' ) {
			startCapture = true;
			continue;
		}

		if ( startCapture ) {
			let errArr = trimmed.split( /:\s(.+)/ );
			errObj[ errArr[ 0 ] ] = errArr[ 1 ];

			if ( errArr[ 0 ] === 'formatted' ) {
				startCapture = false;
			}
		}
	};

	if ( Object.keys( errObj ).length ) {
		console.error( errObj );

		getErrLines( errObj.file, errObj.line, function( err, lines ) {
			if ( err ) {
				console.error( err );
				return;
			}

			let title = errObj.formatted.replace( /\.$/, '' ) +
				'<code>' +
				' in ' + slash( fileRelativePath( process.cwd(), errObj.file ) ) +
				' on line ' + errObj.line +
				'</code>';

			let details = '<pre>' + lines + '</pre>';

			global.logger.log( 'error', title, details );
		} );
	}

	// return errObj;
}

function getErrLines( filename, line, callback ) {
	line = Math.max( parseInt( line, 10 ) - 1 || 0, 0 );

	fs.readFile( filename, function ( err, data ) {
		if ( err ) {
			throw err;
		}

		var lines = data.toString( 'utf-8' ).split( '\n' );

		if ( +line > lines.length ) {
			return '';
		}

		let lineArr = [];
		let _lineArr = [];
		let minLine = Math.max( line - 2, 0 );
		let maxLine = Math.min( line + 2, lines.length );

		for ( var i = minLine; i <= maxLine; i++ ) {
			_lineArr[ i ] = lines[ i ];
		}

		// Remove extraneous indentation.
		let strippedLines = stripIndent( _lineArr.join( '\n' ) ).split( '\n' );

		for ( var j = minLine; j <= maxLine; j++ ) {
			lineArr.push(
				'<div class="line' + ( line === j ? ' highlight' : '' ) + '">' +
				'<span class="line-number">' + ( j + 1 ) + '</span>' +
				'<span class="line-content">' + strippedLines[ j ] + '</span>' +
				'</div>'
			);
		}

		callback( null, lineArr.join( '\n' ) );
	} );
}

function handleFileAndLineErrors( message ) {
	let fileAndLine = message.match( fileAndLineRegex );

	if ( ! fileAndLine ) {
		return;
	}

	let file = fileAndLine[ 1 ];
	let line = fileAndLine[ 2 ];

	console.log( fileAndLine );

	getErrLines( file, line, function( err, lines ) {
		if ( err ) {
			console.error( err );
			return;
		}

		let title = message.replace( /\.$/, '' ) +
			'<code>' +
			' in ' + slash( fileRelativePath( process.cwd(), file ) ) +
			' on line ' + line +
			'</code>';

		let details = '<pre>' + lines + '</pre>';

		global.logger.log( 'error', title, details );
	} );
}

module.exports = function( stats ) {
	const json = stats.toJson( {}, true );

	json.errors.map( msg => handleFileAndLineErrors( msg ) );

	const result = {
		errors: json.errors.map( msg => formatMessage( msg, true ) ),
		warnings: json.warnings.map( msg => formatMessage( msg, false ) )
	};

	// Only show syntax errors if we have them
	if ( result.errors.some( isLikelyASyntaxError ) ) {
		result.errors = result.errors.filter( isLikelyASyntaxError );
	}

	// First error is usually it; others usually the same
	if ( result.errors.length > 1 ) {
		result.errors.length = 1;
	}

	return result;
};

module.exports.formatMessage = formatMessage;
