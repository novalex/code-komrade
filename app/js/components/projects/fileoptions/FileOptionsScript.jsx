/**
 * @file Component for displaying file options for a script.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../../fields/FieldSwitch');

const FieldSaveFile = require('../../fields/FieldSaveFile');

class FileOptionsScript extends FileOptions {
	constructor( props ) {
		super( props );

		this.outputSuffix = '-dist';
		this.outputExtension = '.js';
		this.saveDialogFilters = [
			{ name: 'JavaScript', extensions: [ 'js' ] }
		];
	}

	sourceMapsDisabled() {
		return ( ! this.state.options || ( ! this.state.options.bundle && ! this.state.options.babel ) );
	}

	render() {
		return (
			<div id='file-options' className='file-options-script'>
				{ this.renderHeader() }

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
						onChange={ this.handleChange }
						value={ this.getOption( 'autocompile', false ) }
					/>

					<hr />

					{/* <FieldSwitch
						name='bundle'
						label='Bundle'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'bundle', false ) }
					/> */}

					<FieldSwitch
						name='babel'
						label='Babel'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'babel', false ) }
					/>

					<FieldSwitch
						name='uglify'
						label='Uglify'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'uglify', false ) }
					/>

					<FieldSwitch
						name='sourcemaps'
						label='Sourcemaps'
						labelPos='left'
						disabled={ this.sourceMapsDisabled() }
						onChange={ this.handleChange }
						value={ this.getOption( 'sourcemaps', false ) }
					/>
				</div>

				{ this.renderFooter() }
			</div>
		);
	}
}

module.exports = FileOptionsScript;
