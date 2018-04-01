/**
 * @file Component for wrapping a field.
 */

const React = require('react');

function Field( props ) {
	let className = 'field field-' + props.type + ' label-' + ( props.labelPos ? props.labelPos : 'top' );

	return (
		<div className={ className }>
			{ props.label &&
				<strong className='field-label'>{ props.label }</strong>
			}
			<div className='field-cont'>
				{ props.children }
			</div>
		</div>
	);
}

module.exports = Field;
