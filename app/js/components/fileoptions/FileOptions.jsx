/**
 * @file Component for rendering build options for a file.
 */

const path = require('path');

const { slash, fileRelativePath, fileAbsolutePath, fileOutputPath } = require('../../utils/pathHelpers');

const { runTask } = require('../../gulp/interface');

const React = require('react');

class FileOptions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			options: this.constructor.getOptionsFromConfig( props.base, props.file )
		};

		this.handleChange = this.handleChange.bind( this );
		this.handleCompile = this.handleCompile.bind( this );
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
			let filePath = slash( fileRelativePath( base, file.path ) );

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

	defaultOutputPath( relative = true ) {
		let outputPath = fileOutputPath( this.props.file, this.outputSuffix, this.outputExtension );

		return relative ? fileRelativePath( this.props.base, outputPath ) : fileAbsolutePath( this.props.base, outputPath );
	}

	getOutputPath( type = 'relative' ) {
		let slashPath = ( type === 'display' );
		let relativePath = ( type === 'relative' || type === 'display' );
		let defaultPath = this.defaultOutputPath( relativePath );
		let outputPath = this.getOption( 'output', defaultPath );

		return slashPath ? slash( outputPath ) : outputPath;
	}

	handleCompile() {
		let outputPath = this.getOutputPath( 'absolute' );

		runTask(
			this.buildTaskName, // Task name.
			this.props.file.path, // Input file path.
			path.basename( outputPath ), // Ouput file name.
			path.parse( outputPath ).dir // Output directory path.
		);
	}

	updateFileOptions( options = null ) {
		if ( ! global.projectConfig || ! options ) {
			window.alert( 'There was a problem saving the project configuration.' );
			return;
		}

		let filePath = slash( fileRelativePath( this.props.base, this.props.file.path ) );

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

	render() {
		return null;
	}
}

module.exports = FileOptions;
