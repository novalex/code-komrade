const React = require('react');

const Field = require('./Field');

class FieldSwitch extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			checked: ( this.props.current && this.props.current === this.props.value )
		}

		this.onChange = this.onChange.bind( this );
	}

	onChange( event ) {
		this.setState( function( prevState ) {
			return { checked: ! prevState.checked };
		});
	}

	render() {
		return (
			<Field type='switch' label={ this.props.label } labelPos={ this.props.labelPos }>
				<input
					type='checkbox'
					onChange={ this.onChange }
					name={ this.props.name }
					value={ this.props.value}
					checked={ this.state.checked }
					id={ 'field_' + this.props.name }
				/>
				<label htmlFor={ 'field_' + this.props.name }>{ this.props.label }</label>
			</Field>
		);
	}
}

module.exports = FieldSwitch;
