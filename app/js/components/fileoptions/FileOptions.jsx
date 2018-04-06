/**
 * @file Component for rendering build options for a file.
 */

const { fileRelativePath, fileOutputPath } = require('../../utils/pathHelpers');

const React = require('react');

class FileOptions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			options: this.constructor.getOptionsFromConfig( props.base, props.file )
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

	static getDerivedStateFromProps( nextProps ) {
		let options = FileOptions.getOptionsFromConfig( nextProps.base, nextProps.file );

		return { options: options };
	}

	static getOptionsFromConfig( base, file ) {
		if ( file && global.projectConfig ) {
			let filePath = fileRelativePath( base, file.path );

			let files = global.projectConfig.get( 'files', [] );
			let cfile = files.find( cfile => cfile.path === filePath );

			if ( cfile ) {
				return cfile.options;
			}
		}

		return {};
	}

	getOption( option, defaultValue = null ) {
		if ( this.state.options[ option ] ) {
			return this.state.options[ option ];
		}

		return defaultValue;
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

	updateFileOptions( options = null ) {
		if ( ! global.projectConfig || ! options ) {
			window.alert( 'There was a problem saving the project configuration.' );
			return;
		}

		let filePath = fileRelativePath( this.props.base, this.props.file.path );

		let files = global.projectConfig.get( 'files', [] );
		let fileIndex = files.findIndex( file => file.path === filePath );

		if ( fileIndex === -1 ) {
			files.push({
				path: filePath,
				options: options
			});
		} else {
			files[ fileIndex ].options = options;
		}

		global.projectConfig.set( 'files', files );
	}

	defaultOutputPath() {
		return fileOutputPath( this.props.file );
	}

	render() {
		return null;
	}
}

module.exports = FileOptions;
