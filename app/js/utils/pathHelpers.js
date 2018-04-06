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

function fileOutputPath( file, suffix = '-dist' ) {
	return file.name.replace(/\.[^/.]+$/, '') + suffix + file.extension;
}

function fileRelativePath( from, to ) {
	return slash( path.relative( from, to ) );
}

module.exports = {
	slash,
	fileOutputPath,
	fileRelativePath
};
