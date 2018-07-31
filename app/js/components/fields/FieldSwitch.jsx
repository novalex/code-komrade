/**
 * @file Component for a toggle switch.
 */

const React = require('react');

const PropTypes = require('prop-types');

const Field = require('./Field');

class FieldSwitch extends React.Component {
	constructor( props ) {
		super( props );

		this.onChange = this.onChange.bind( this );
	}

	onChange( event ) {
		event.persist();

		if ( this.props.onChange ) {
			this.props.onChange( this.props.name, ! this.props.value );
		}
	}

	render() {
		return (
			<Field type='switch' label={ this.props.label } labelPos={ this.props.labelPos }>
				<input
					type='checkbox'
					name={ this.props.name }
					onChange={ this.onChange }
					checked={ this.props.value }
					disabled={ this.props.disabled }
					id={ 'field_' + this.props.name }
				/>
				<label htmlFor={ 'field_' + this.props.name }>{ this.props.label }</label>
			</Field>
		);
	}
}

FieldSwitch.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.bool,
	disabled: PropTypes.bool
};

module.exports = FieldSwitch;
