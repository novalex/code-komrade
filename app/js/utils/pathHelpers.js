/**
 * @file Helper functions for resolving, transforming, generating and formatting paths.
 */

const path = require('path');

// https://github.com/sindresorhus/slash
function slash( input ) {
	const isExtendedLengthPath = /^\\\\\?\\/.test(input);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(input); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return input;
	}

	return input.replace(/\\/g, '/');
}

function fileOutputPath( file, suffix = '-dist', extension = file.extension ) {
	let basedir = path.parse( file.path ).dir;
	let filename = file.name.replace(/\.[^/.]+$/, '') + suffix + extension;

	return path.join( basedir, filename );
}

function fileRelativePath( from, to ) {
	return path.relative( from, to );
}

function fileAbsolutePath( base, filename ) {
	return ( path.isAbsolute( filename ) ) ? filename : path.join( base, filename );
}

function dirAbsolutePath( base, filename ) {
	return path.parse( fileAbsolutePath( base, filename ) ).dir;
}

module.exports = {
	slash,
	fileOutputPath,
	fileRelativePath,
	fileAbsolutePath,
	dirAbsolutePath
};
