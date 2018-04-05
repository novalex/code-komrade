const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('./fields/FieldSwitch');

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
						checked={ this.getOption( 'autocompile', false ) }
					/>

					<FieldSwitch
						name='compress'
						label='Compress'
						labelPos='left'
						onChange={ this.handleChange }
						checked={ this.getOption( 'compress', false ) }
					/>

					<FieldSwitch
						name='babel'
						label='Babel'
						labelPos='left'
						onChange={ this.handleChange }
						checked={ this.getOption( 'babel', false ) }
					/>

					<FieldSwitch
						name='sourcemap'
						label='Sourcemap'
						labelPos='left'
						onChange={ this.handleChange }
						checked={ this.getOption( 'sourcemap', false ) }
					/>
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsScript;
