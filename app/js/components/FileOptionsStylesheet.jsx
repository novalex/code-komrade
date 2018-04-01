const React = require('react');

const FileOptions = require('./FileOptions');

class FileOptionsStylesheet extends React.Component {
	isPartial( file ) {
		return file.name.startsWith('_');
	}

	render() {
		if ( this.isPartial( this.props.file ) ) {
			return (
				<FileOptions>
					<div className='header'>
						<strong>{ this.props.file.name }</strong>
						<p>This is a partial file, it cannot be rendered by itself.</p>
					</div>
				</FileOptions>
			);
		}

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
				</div>
			</FileOptions>
		);
	}
}

module.exports = FileOptionsStylesheet;
