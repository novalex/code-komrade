/**
 * @file Component for the project info component shown in the panel.
 */

const React = require('react');

class ProjectInfo extends React.Component {
	render() {
		if ( ! this.props.project ) {
			return (
				<p>No project currently selected.</p>
			);
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
}

module.exports = ProjectInfo;
