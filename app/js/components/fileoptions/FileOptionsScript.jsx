/**
 * @file Component for displaying file options for a script.
 */

const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('../fields/FieldSwitch');

class FileOptionsScript extends FileOptions {
	render() {
		return (
			<div id='file-options' className='file-options-script'>
				<div className='header'>
					<strong>{ this.props.file.name }</strong>
				</div>

				<div className='body'>
					<FieldSwitch
						name='autocompile'
						label='Auto compile'
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