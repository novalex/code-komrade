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
			loading: false,
			options: this.constructor.getOptionsFromConfig( props.base, props.file )
		};

		this.handleChange = this.handleChange.bind( this );
		this.handleCompile = this.handleCompile.bind( this );
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

	defaultOutputPath() {
		return fileOutputPath( this.props.file, this.outputSuffix, this.outputExtension );
	}

	getOutputPath( type = 'relative' ) {
		let slashPath = ( type === 'display' );
		let relativePath = ( type === 'relative' || type === 'display' );
		let defaultPath = this.defaultOutputPath();
		let outputPath = this.getOption( 'output', defaultPath );

		if ( relativePath ) {
			outputPath = fileRelativePath( this.props.base, outputPath );
		} else {
			outputPath = fileAbsolutePath( this.props.base, outputPath );
		}

		if ( slashPath ) {
			outputPath = slash( outputPath );
		}

		return outputPath;
	}

	handleCompile() {
		let outputPath = this.getOutputPath( 'absolute' );
		let taskOptions = {
			input: this.props.file.path,
			filename: path.basename( outputPath ),
			output: path.parse( outputPath ).dir,
			outputStyle: this.getOption( 'style', 'nested' )
		};

		this.setState({ loading: true });

		runTask( this.buildTaskName, taskOptions, function( code ) {
			this.setState({ loading: false });
		}.bind( this ));
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

	renderButton() {
		return (
			<button
				className='compile green'
				onClick={ this.handleCompile }
				disabled={ this.state.loading }
			>
				{ this.state.loading ? 'Compiling...' : 'Compile' }
			</button>
		);
	}

	render() {
		return null;
	}
}

module.exports = FileOptions;
