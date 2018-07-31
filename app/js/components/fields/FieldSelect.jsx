/**
 * @file Component for a dropdown select.
 */

const React = require('react');

const PropTypes = require('prop-types');

const Field = require('./Field');

class FieldSelect extends React.Component {
	constructor( props ) {
		super( props );

		this.onChange = this.onChange.bind( this );
	}

	onChange( event ) {
		event.persist();

		if ( this.props.onChange ) {
			this.props.onChange( this.props.name, event.target.value );
		}
	}

	getOptions() {
		let options = [];

		for ( let value in this.props.options ) {
			options.push(
				<option key={ value } value={ value }>
					{ this.props.options[ value ] }
				</option>
			);
		}

		return options;
	}

	render() {
		return (
			<Field type='select' label={ this.props.label } labelPos={ this.props.labelPos }>
				<label
					htmlFor={ 'field_' + this.props.name }
				>
					{ this.props.value ? this.props.options[ this.props.value ] : '' }
				</label>
				<select
					name={ this.props.name }
					onChange={ this.onChange }
					value={ this.props.value }
					disabled={ this.props.disabled }
					id={ 'field_' + this.props.name }
				>
					{ this.getOptions() }
				</select>
			</Field>
		);
	}
}

FieldSelect.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
	options: PropTypes.object.isRequired,
	disabled: PropTypes.bool
};

module.exports = FieldSelect;
