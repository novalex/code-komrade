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

	render() {
		return (
			<div id='file-options' className='file-options-script'>
				<div className='header'>
					<strong>{ this.props.file.name }</strong>
				</div>

				<div className='body'>
					<FieldSaveFile
						name='output'
						label='Output Path'
						onChange={ this.setOutputPath }
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

					<FieldSwitch
						name='babel'
						label='Babel'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'babel', false ) }
					/>

					<FieldSwitch
						name='compress'
						label='Compress'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'compress', false ) }
					/>

					<FieldSwitch
						name='sourcemap'
						label='Sourcemap'
						labelPos='left'
						onChange={ this.handleChange }
						value={ this.getOption( 'sourcemaps', false ) }
					/>
				</div>

				<div className='footer'>
					{ this.renderButton() }
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsScript;
