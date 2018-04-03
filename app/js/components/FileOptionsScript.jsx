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
						checked={ this.state.options.autocompile }
					/>

					<FieldSwitch
						name='babel'
						label='Babel'
						labelPos='left'
						onChange={ this.handleChange }
						checked={ this.state.options.babel }
					/>
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsScript;
