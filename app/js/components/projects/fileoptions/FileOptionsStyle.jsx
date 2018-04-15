/**
 * @file Component for displaying file options for a stylesheet.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../../fields/FieldSwitch');

const FieldSelect = require('../../fields/FieldSelect');

const FieldSaveFile = require('../../fields/FieldSaveFile');

const sassGraph = require('sass-graph');

class FileOptionsStyles extends FileOptions {
	constructor( props ) {
		super( props );

		this.fileType = 'style';
		this.buildTaskName = 'build-css';
		this.outputSuffix = '-dist';
		this.outputExtension = '.css';
		this.saveDialogFilters = [
			{ name: 'CSS', extensions: [ 'css' ] }
		];
		this.styleOptions = {
			nested: 'Nested',
			compact: 'Compact',
			expanded: 'Expanded',
			compressed: 'Compressed'
		};

		this.handleAutoCompile = this.handleAutoCompile.bind( this );
	}

	isPartial() {
		return this.props.file.name.startsWith('_');
	}

	getFileDependencies() {
		let graph = sassGraph.parseFile( this.props.file.path );

		if ( graph && graph.index && graph.index[ this.props.file.path ] ) {
			return graph.index[ this.props.file.path ].imports;
		}

		return [];
	}

	handleAutoCompile( event, value ) {
		let imports = ( value ) ? this.getFileDependencies() : [];

		this.handleChange( event, value );

		this.setFileImports( imports );
	}

	render() {
		if ( this.isPartial() ) {
			return (
				<div id='file-options' className='file-options-style'>
					<div className='header'>
						<strong>{ this.props.file.name }</strong>
					</div>
					<div className='body'>
						<p>This is a partial file, it cannot be compiled by itself.</p>
					</div>
				</div>
			);
		}

		return (
			<div id='file-options' className='file-options-style'>
				<div className='header'>
					<strong>{ this.props.file.name }</strong>
				</div>

				<div className='body'>
					<FieldSaveFile
						name='output'
						label='Output Path'
						onChange={ this.handleChange }
						value={ this.getOutputPath( 'display' ) }
						sourceFile={ this.props.file }
						sourceBase={ this.props.base }
						dialogFilters={ this.saveDialogFilters }
					/>

					<hr />

					<FieldSwitch
						name='autocompile'
						label='Auto Compile'
						labelPos='left'
						onChange={ this.handleAutoCompile }
						value={ this.getOption( 'autocompile', false ) }
					/>

					<hr />

					<FieldSelect
						name='style'
						label='Output Style'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'style', 'nested' ) }
						options={ this.styleOptions }
					/>

					<FieldSwitch
						name='sourcemaps'
						label='Sourcemaps'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'sourcemaps', false ) }
					/>

					<FieldSwitch
						name='autoprefixer'
						label='Autoprefixer'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'autoprefixer', false ) }
					/>
				</div>

				<div className='footer'>
					{ this.renderButton() }
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsStyles;
