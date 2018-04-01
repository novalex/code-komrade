const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('./fields/FieldSwitch');

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
					</div>
					<div className='body'>
						<p>This is a partial file, it cannot be compiled by itself.</p>
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
					<FieldSwitch
						value='1'
						current='0'
						name='autocompile'
						label='Auto compile'
						labelPos='left'
					/>
				</div>
			</FileOptions>
		);
	}
}

module.exports = FileOptionsStylesheet;
