const React = require('react');

const FileOptions = require('./FileOptions');

const FieldSwitch = require('./fields/FieldSwitch');

class FileOptionsScript extends React.Component {
	render() {
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

					<FieldSwitch
						value='1'
						current='1'
						name='babel'
						label='Babel'
						labelPos='left'
					/>
				</div>
			</FileOptions>
		);
	}
}

module.exports = FileOptionsScript;
