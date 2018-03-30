/**
 * @file Component for the project view (project selector and filetree).
 */

const React = require('react');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./FileList');

// let projects = [
// 	{ name: 'Buildr', path: 'E:/Apps/Buildr' },
// 	{ name: 'NTN', path: 'E:/Sites/NTN' },
// 	{ name: 'MSO', path: 'E:/Sites/MSO' },
// ];

// let active = {
// 	name: 'Buildr',
// 	path: 'E:/Apps/Buildr',
// };

class Projects extends React.Component {
	_ProjectSelect: ProjectSelect;
	_ProjectFileList: FileList;

	constructor( props ) {
		super( props );

		let projects = [];
		let active   = {
			name: '',
			path: ''
		};

		if ( this.props.config ) {
			projects = this.props.config.get('projects');

			let activeIndex = this.props.config.get('active-project');

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
		this.props.config.set( 'projects', projects );
	}

	saveActiveProject( index ) {
		this.props.config.set( 'active-project', index );
	}

	render() {
		return (
			<React.Fragment>
				<div id='header'>
					<ProjectSelect
						projects={ this.state.projects }
						active={ this.state.active }
						ref={ ( child ) => { this._ProjectSelect = child; } }
						saveProjects={ this.saveProjects }
						saveActiveProject={ this.saveActiveProject }
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
