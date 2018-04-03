/**
 * @file Global helper functions for the app's UI.
 */

function unfocus( toggle = true ) {
	document.body.classList.toggle( 'unfocus', toggle );
}

function loading( toggle = true, args = {} ) {
	document.body.classList.toggle( 'loading', toggle );
}

function offCanvas( toggle = true, exclude = null ) {
	/* global Event */
	document.body.classList.toggle( 'off-canvas', toggle );

	if ( toggle ) {
		document.dispatchEvent( new Event('off-canvas-show') );

		removeFocus(
			document.getElementById('off-canvas'),
			'off-canvas',
			new Event('off-canvas-hide'),
			exclude
		);
	} else {
		document.dispatchEvent( new Event('off-canvas-hide') );
	}
}

function removeFocus( element, className, triggerEvent = null, exclude = null ) {
	const outsideClickListener = function( event ) {
		if ( ! element.contains( event.target ) ) {
			removeClickListener();

			if ( ! exclude || ! exclude.contains( event.target ) ) {
				document.body.classList.remove( className );

				if ( triggerEvent ) {
					document.dispatchEvent( triggerEvent );
				}
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
