const React = require('react');

const Field = require('./Field');

class FieldSwitch extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			checked: this.props.checked
		}

		this.onChange = this.onChange.bind( this );
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
					value='1'
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

module.exports = FieldSwitch;
