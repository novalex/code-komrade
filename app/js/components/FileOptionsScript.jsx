const React = require('react');

const FileOptions = require('./FileOptions');

class FileOptionsScript extends React.Component {
	render() {
		return (
			<FileOptions>
				<div className='header'>
					<strong>{ this.props.file.name }</strong>
				</div>
				<div className='body'>
					<div className='field'>
						<label htmlFor='autocompile'>Auto-compile</label>
						<input type='checkbox' name='autocompile' value='1' />
					</div>

					<div className='field'>
						<label htmlFor='babel'>Babel</label>
						<input type='checkbox' name='babel' value='1' />
					</div>
				</div>
			</FileOptions>
		);
	}
}

module.exports = FileOptionsScript;
