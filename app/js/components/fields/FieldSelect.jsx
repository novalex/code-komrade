/**
 * @file Component for a dropdown select.
 */

const React = require('react');

const PropTypes = require('prop-types');

const Field = require('./Field');

class FieldSelect extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			selected: this.props.value
		}

		this.onChange = this.onChange.bind( this );
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		let selected = ( nextProps.value === null ) ? false : nextProps.value;

		return { selected };
	}

	onChange( event ) {
		event.persist();

		this.setState( function( prevState ) {
			return { selected: event.target.value };
		}, function() {
			if ( this.props.onChange ) {
				this.props.onChange( event, this.state.selected );
			}
		});
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
				<select
					name={ this.props.name }
					onChange={ this.onChange }
					value={ this.state.selected }
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
	onChange: PropTypes.func.isRequired,
	value: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
	options: PropTypes.object.isRequired
};

module.exports = FieldSelect;
