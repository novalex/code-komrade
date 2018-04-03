/**
 * @file Component for rendering build options for a file.
 */

const React = require('react');

class FileOptions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			options: this.getOptionsFromConfig()
		};

		this.handleChange = this.handleChange.bind( this );
	}

	static getDerivedStateFromProps() {
		let options = this.getOptionsFromConfig();

		return ( Object.keys( options ).length === 0 ) ? null : options;
	}

	getOptionsFromConfig() {
		if ( window.projectConfig ) {
			let files = window.projectConfig.get( 'files', [] );
			let file  = files.find( file => file.path === this.props.file.path );

			console.log( file );

			if ( file ) {
				return file.options;
			}
		}

		return {};
	}

	handleChange( event, value ) {
		this.setState( function( prevState ) {
			let options = prevState.options;
			options[ event.target.name ] = value;

			return options;
		}, function() {
			this.updateFileOptions( this.state.options );
		});
	}

	updateFileOptions( options ) {
		if ( window.projectConfig ) {
			let files = window.projectConfig.get( 'files', [] );
			let fileIndex = files.findIndex( file => file.path === this.props.file.path );

			if ( fileIndex === -1 ) {
				files.push({
					path: this.props.file.path,
					options: options
				});
			} else {
				files[ fileIndex ].options = options;
			}

			window.projectConfig.set( 'files', files );
		}
	}

	render() {
		return null;
	}
}

module.exports = FileOptions;
