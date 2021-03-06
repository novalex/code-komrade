/**
 * @file Component for rendering build options for a file.
 */

const { slash, fileRelativePath, fileAbsolutePath, fileOutputPath } = require('../../../utils/pathHelpers');

const React = require('react');

class FileOptions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			loading: false
		};

		this.handleChange = this.handleChange.bind( this );
		this.handleCompile = this.handleCompile.bind( this );
	}

	componentDidMount() {
		this.handleCompileCallback = function() {
			this.setState( { loading: false } );
		}.bind( this );
	}

	componentWillUnmount() {
		this.handleCompileCallback = null;
	}

	static getDerivedStateFromProps( nextProps ) {
		let compileOptions = global.compiler.getFileOptions( nextProps.file );

		return {
			type: compileOptions.type,
			fileType: compileOptions.fileType,
			buildTaskName: compileOptions.buildTaskName,
			options: FileOptions.getOptionsFromConfig( nextProps.base, nextProps.file )
		};
	}

	static getOptionsFromConfig( base, file ) {
		let cfile = FileOptions.getFileFromConfig( base, file );

		return ( cfile && cfile.options ) ? cfile.options : {};
	}

	static getFileFromConfig( base, file ) {
		if ( file && global.projectConfig ) {
			let filePath = slash( fileRelativePath( base, file.path ) );

			let files = global.projectConfig.get( 'files', [] );
			let cfile = files.find( cfile => cfile.path === filePath );

			if ( cfile ) {
				return cfile;
			}
		}

		return null;
	}

	getConfig( property, defaultValue = null ) {
		let defaults = {
			path: fileRelativePath( this.props.base, this.props.file.path ),
			output: this.defaultOutputPath(),
			options: {}
		};

		let stored = FileOptions.getFileFromConfig( this.props.base, this.props.file );

		let config = ( stored !== null ) ? stored : defaults;

		if ( property ) {
			return ( config[ property ] ) ? config[ property ] : defaultValue;
		} else {
			return config;
		}
	}

	setConfig( property, value ) {
		if ( ! global.projectConfig || ! property ) {
			window.alert( 'There was a problem saving the project configuration.' );
			return;
		}

		let filePath = slash( fileRelativePath( this.props.base, this.props.file.path ) );

		let files = global.projectConfig.get( 'files', [] );
		let fileIndex = files.findIndex( file => file.path === filePath );

		if ( fileIndex === -1 ) {
			let fileConfig = {
				path: filePath,
				type: this.state.fileType,
				output: slash( fileRelativePath( this.props.base, this.defaultOutputPath() ) )
			};

			if ( typeof( value ) !== 'undefined' && value !== null ) {
				fileConfig[ property ] = value;
			}
			files.push( fileConfig );
		} else {
			if ( typeof( value ) !== 'undefined' ) {
				files[ fileIndex ][ property ] = value;
			} else if ( value === null ) {
				delete files[ fileIndex ][ property ];
			}
		}

		global.projectConfig.set( 'files', files );
	}

	getOption( option, defaultValue = null ) {
		if ( this.state.options && this.state.options[ option ] ) {
			return this.state.options[ option ];
		}

		return defaultValue;
	}

	setOption( option, value ) {
		let options = this.state.options || {};
		options[ option ] = value;

		this.setConfig( 'options', options );

		this.setState({ options: options });
	}

	handleChange( name, value ) {
		if ( name === 'output' ) {
			this.setConfig( 'output', value );

			this.setState( this.state );
		} else {
			this.setOption( name, value );
		}
	}

	defaultOutputPath() {
		return fileOutputPath( this.props.file, this.outputSuffix, this.outputExtension );
	}

	getOutputPath( type = 'relative' ) {
		let slashPath = ( type === 'display' );
		let relativePath = ( type === 'relative' || type === 'display' );
		let defaultPath = this.defaultOutputPath();
		let outputPath = this.getConfig( 'output', defaultPath );

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
		this.setState({ loading: true });

		global.compiler.processFile(
			this.props.base,
			this.getConfig(),
			this.state.buildTaskName,
			this.handleCompileCallback
		);
	}

	renderHeader() {
		return (
			<div className='header'>
				<strong>{ this.props.file.name }</strong>
			</div>
		);
	}

	renderFooter() {
		return (
			<div className='footer'>
				<button
					className='compile green'
					onClick={ this.handleCompile }
					disabled={ this.state.loading }
				>
					{ this.state.loading ? 'Compiling...' : 'Compile' }
				</button>
			</div>
		);
	}

	render() {
		return null;
	}
}

module.exports = FileOptions;
