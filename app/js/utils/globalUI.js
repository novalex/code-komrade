/**
 * @file Global helper functions for the app's UI.
 */

function unfocus( toggle = true, allowSelector ) {
	document.body.classList.toggle( 'unfocus', toggle );

	const allowClass = 'unfocus-allowed';

	document.querySelectorAll( `.${allowClass}` ).forEach( ( el ) => {
		el.classList.remove( allowClass );
	} );

	if ( toggle && allowSelector && allowSelector.match( /^(#|\.).*$/ ) ) {
		document.querySelectorAll( allowSelector ).forEach( ( el ) => {
			el.classList.add( allowClass );
		} );
	}
}

function loading( toggle = true, args = {} ) {
	document.body.classList.toggle( 'loading', toggle );
}

function overlay( toggle = true ) {
	document.body.classList.toggle( 'overlay', toggle );
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
	overlay,
	removeFocus
};
