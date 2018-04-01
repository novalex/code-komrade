/**
 * @file Component for rendering build options for a file.
 */

const React = require('react');

class FileOptions extends React.Component {
	render() {
		return (
			<div id='file-options'>
				{ this.props.children }
			</div>
		);
	}
}

module.exports = FileOptions;
