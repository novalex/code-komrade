/**
 * @file Component for the projects panel.
 */

const React = require('react');

const { connect } = require('react-redux');

const NoContent = require('../NoContent');

class Panel extends React.Component {
	renderContent() {
		if ( ! this.props.project ) {
			return <NoContent>No project currently selected.</NoContent>;
		}

		return (
			<div id='project-info'>
				<h1>{ this.props.project.name }</h1>
				<h2>{ this.props.project.path }</h2>
				{ this.props.files &&
					<p>Number of files: { Object.keys( this.props.files ).length }</p>
				}
			</div>
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
	project: state.activeProject,
	selectedFile: state.selectedFile
});

module.exports = connect( mapStateToProps, null )( Panel );
