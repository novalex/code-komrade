/**
 * @file Component for the projects panel.
 */

const React = require('react');

const { connect } = require('react-redux');

const FileOptionsScript = require('./fileoptions/FileOptionsScript');

const FileOptionsStyle = require('./fileoptions/FileOptionsStyle');

const NoContent = require('../NoContent');

class Panel extends React.Component {
	getOptions() {
		if ( ! this.props.activeFile.file.extension ) {
			return null;
		}

		switch ( this.props.activeFile.file.extension ) {
			case '.css':
			case '.scss':
			case '.sass':
			case '.less':
				return <FileOptionsStyle base={ this.props.project.path } file={ this.props.activeFile.file } />;
			case '.js':
			case '.ts':
			case '.jsx':
				return <FileOptionsScript base={ this.props.project.path } file={ this.props.activeFile.file } />;
			default:
				return null;
		}
	}

	renderContent() {
		if ( this.props.activeFile ) {
			let options = this.getOptions();

			if ( options ) {
				this.props.activeFile.element.classList.add('has-options');

				return options;
			}
		}

		return (
			<NoContent>
				<p>Select a stylesheet or script file to view compiling options.</p>
			</NoContent>
		);
	}

	render() {
		return (
			<div id='panel'>
				{ this.renderContent() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ({
	activeFile: state.activeFile,
	project: state.activeProject,
	files: state.activeProjectFiles
});

module.exports = connect( mapStateToProps, null )( Panel );
