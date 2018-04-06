/**
 * @file Component for a toggle switch.
 */

const React = require('react');

const PropTypes = require('prop-types');

const Field = require('./Field');

class FieldSwitch extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			checked: this.props.value
		}

		this.onChange = this.onChange.bind( this );
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		let checked = ( nextProps.value === null ) ? false : nextProps.value;

		return { checked };
	}

	onChange( event ) {
		event.persist();

		this.setState( function( prevState ) {
			return { checked: ! prevState.checked };
		}, function() {
			if ( this.props.onChange ) {
				this.props.onChange( event, this.state.checked );
			}
		});
	}

	render() {
		return (
			<Field type='switch' label={ this.props.label } labelPos={ this.props.labelPos }>
				<input
					type='checkbox'
					name={ this.props.name }
					onChange={ this.onChange }
					checked={ this.state.checked }
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
	value: PropTypes.bool
};

module.exports = FieldSwitch;
