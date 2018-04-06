/**
 * @file Component for rendering build options for a file.
 */

const React = require('react');

class FileOptions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			options: this.constructor.getOptionsFromConfig( props.file )
		};

		this.handleChange = this.handleChange.bind( this );
	}

	shouldComponentUpdate( nextProps ) {
		if (
			! nextProps.file ||
			( this.props.file && nextProps.file.path === this.props.file.path )
		) {
			return false;
		}

		return true;
	}

	getOption( option, defaultValue = null ) {
		if ( this.state.options[ option ] ) {
			return this.state.options[ option ];
		}

		return defaultValue;
	}

	static getDerivedStateFromProps( nextProps ) {
		let options = FileOptions.getOptionsFromConfig( nextProps.file );

		return { options: options };
	}

	static getOptionsFromConfig( file ) {
		if ( file && global.projectConfig ) {
			let files = global.projectConfig.get( 'files', [] );
			let cfile = files.find( cfile => cfile.path === file.path );

			if ( cfile ) {
				return cfile.options;
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
		if ( global.projectConfig ) {
			let files = global.projectConfig.get( 'files', [] );
			let fileIndex = files.findIndex( file => file.path === this.props.file.path );

			if ( fileIndex === -1 ) {
				files.push({
					path: this.props.file.path,
					options: options
				});
			} else {
				files[ fileIndex ].options = options;
			}

			global.projectConfig.set( 'files', files );
		}
	}

	render() {
		return null;
	}
}

module.exports = FileOptions;
