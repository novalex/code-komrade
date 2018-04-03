const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('./fields/FieldSwitch');

class FileOptionsStylesheet extends FileOptions {
	isPartial( file ) {
		return file.name.startsWith('_');
	}

	render() {
		if ( this.isPartial( this.props.file ) ) {
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
					<FieldSwitch
						value='1'
						current='0'
						name='autocompile'
						label='Auto compile'
						labelPos='left'
						onChange={ this.handleChange }
						checked={ this.state.options.autocompile }
					/>
				</div>
			</div>
		);
	}
}

module.exports = FileOptionsStylesheet;
