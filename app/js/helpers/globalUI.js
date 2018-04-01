/**
 * @file Global helper functions for the app's UI.
 */

function unfocus( toggle = true ) {
	document.body.classList.toggle( 'unfocus', toggle );
}

function loading( toggle = true, args = {} ) {
	document.body.classList.toggle( 'loading', toggle );
}

function offCanvas( toggle = true, event = null ) {
	document.body.classList.toggle( 'off-canvas', toggle );

	if ( toggle ) {
		removeFocus( document.getElementById('off-canvas'), 'off-canvas', event );
	}
}

function removeFocus( element, className, exclude = null ) {
	const outsideClickListener = function( event ) {
		if ( ! element.contains( event.target ) ) {
			removeClickListener();

			if ( ! exclude || exclude.target !== event.target ) {
				document.body.classList.remove( className );
			}
		}
	}

	const removeClickListener = function() {
		document.removeEventListener( 'click', outsideClickListener );
	}

	document.addEventListener( 'click', outsideClickListener );
}

module.exports = {
	unfocus,
	loading,
	offCanvas,
	removeFocus
};
