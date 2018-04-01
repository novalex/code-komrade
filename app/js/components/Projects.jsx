/**
 * @file Component for the project view (project selector and filetree).
 */

const React = require('react');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./FileList');

class Projects extends React.Component {
	_ProjectSelect: null;
	_ProjectFileList: null;

	constructor( props ) {
		super( props );

		let projects = [];
		let active   = {
			name: '',
			path: ''
		};

		if ( window.config ) {
			projects = window.config.get('projects');

			let activeIndex = window.config.get('active-project');

			if ( projects[ activeIndex ] ) {
				active = projects[ activeIndex ];
			}
		}

		this.state = {
			projects,
			active
		};

		this.saveProjects      = this.saveProjects.bind( this );
		this.saveActiveProject = this.saveActiveProject.bind( this );
	}

	componentDidMount() {
		this._ProjectSelect.setFileList( this._ProjectFileList );
	}

	saveProjects( projects ) {
		window.config.set( 'projects', projects );
	}

	saveActiveProject( index ) {
		window.config.set( 'active-project', index );
	}

	render() {
		return (
			<React.Fragment>
				<div id='header'>
					<ProjectSelect
						active={ this.state.active }
						projects={ this.state.projects }
						saveProjects={ this.saveProjects }
						saveActiveProject={ this.saveActiveProject }
						ref={ ( child ) => { this._ProjectSelect = child; } }
					/>
				</div>
				<div id='content'>
					<FileList
						path={ this.state.active.path }
						ref={ ( child ) => { this._ProjectFileList = child; } }
					/>
				</div>
			</React.Fragment>
		);
	}
}

module.exports = Projects;
