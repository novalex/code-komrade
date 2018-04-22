/**
 * @file Component for empty screen/no content.
 */

const React = require('react');

module.exports = function( props ) {
	return (
		<div className='no-content'>
			{ props.children }
		</div>
	);
}
