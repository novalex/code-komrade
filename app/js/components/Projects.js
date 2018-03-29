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

	constructor() {
		super();
	}

	componentDidMount() {
		this._ProjectSelect.setFileList( this._ProjectFileList );
	}

	render() {
		return (
			<React.Fragment>
			<div id="header">
				<ProjectSelect projects={ projects } active={ active } ref={ ( child ) => { this._ProjectSelect = child; } } />
			</div>
			<div id="content">
				<FileList path={ active.path } ref={ ( child ) => { this._ProjectFileList = child; } } />
			</div>
			</React.Fragment>
		);
	}
}

module.exports = Projects;