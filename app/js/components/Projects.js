/* jshint esversion:6 */

const React = require('react');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./FileList');

// let projects = config.get('projects');

let projects = [
	{ name: 'Buildr', path: 'E:/Apps/Buildr' },
	{ name: 'NTN', path: 'E:/Sites/NTN' },
	{ name: 'MSO', path: 'E:/Sites/MSO' },
];

let active = {
	name: 'Buildr',
	path: 'E:/Apps/Buildr',
};

class Projects extends React.Component {
	_ProjectSelect: ProjectSelect;
	_ProjectFileList: FileList;

	constructor( props ) {
		super( props );

		this.state = {
			projects: [],
			active: {
				name: '',
				path: '',
			},
		};
	}

	componentDidMount() {
		if ( this.props.config ) {
			let newState = {};

			let projects = this.props.config.get('projects');

			if ( projects ) {
				newState.projects = projects;
			}

			let active = this.props.config.get('active-project');

			if ( active ) {
				newState.active = active;
			}

			if ( Object.keys( newState ).length > 0 ) {
				this.setState( newState );
			}
		}

		this._ProjectSelect.setFileList( this._ProjectFileList );
	}

	render() {
		return (
			<React.Fragment>
			<div id="header">
				<ProjectSelect projects={ this.state.projects } active={ this.state.active } ref={ ( child ) => { this._ProjectSelect = child; } } />
			</div>
			<div id="content">
				<FileList path={ this.state.active.path } ref={ ( child ) => { this._ProjectFileList = child; } } />
			</div>
			</React.Fragment>
		);
	}
}

module.exports = Projects;
