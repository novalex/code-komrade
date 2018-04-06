/**
 * @file Component for displaying file options for a script.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../fields/FieldSwitch');

const FieldSaveFile = require('../fields/FieldSaveFile');

const { fileRelativePath, fileOutputPath } = require('../../utils/pathHelpers');

class FileOptionsScript extends FileOptions {
	saveDialogFilters() {
		return [
			{ name: 'JavaScript', extensions: [ 'js' ] }
		];
	}

	defaultOutputPath() {
		let suffix = ( this.getOption( 'compress', false ) ) ? '.min' : '-dist';
		let extension = '.js';

		return fileRelativePath( this.props.base, fileOutputPath( this.props.file, suffix, extension ) );
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
						onChange={ this.handleChange }
						value={ this.getOption( 'output', this.defaultOutputPath() ) }
						sourceFile={ this.props.file }
						sourceBase={ this.props.base }
						dialogFilters={ this.saveDialogFilters() }
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
						value={ this.getOption( 'sourcemap', false ) }
					/>
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsScript;
