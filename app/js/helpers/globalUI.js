/**
 * @file Global helper functions for the app's UI.
 */

function unfocus( toggle = true ) {
	document.body.classList.toggle( 'unfocus', toggle );
}

function loading( toggle = true, args = {} ) {
	document.body.classList.toggle( 'loading', toggle );
}

function offCanvas( toggle = true ) {
	document.body.classList.toggle( 'off-canvas', toggle );
}

module.exports = {
	unfocus,
	loading,
	offCanvas
};
