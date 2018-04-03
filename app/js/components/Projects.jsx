/**
 * @file Component for the project view (project selector and filetree).
 */

const React = require('react');

const Store  = require('electron-store');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./FileList');

class Projects extends React.Component {
	_ProjectSelect: null;
	_ProjectFileList: null;

	constructor( props ) {
		super( props );

		this.state = {
			projects: [],
			active: {
				name: '',
				path: ''
			},
			config: null
		};

		this.setProjects      = this.setProjects.bind( this );
		this.setActiveProject = this.setActiveProject.bind( this );
	}

	componentWillMount() {
		let projects = this.state.projects;
		let active   = this.state.active;
		let config   = this.state.config;

		if ( window.config ) {
			projects = window.config.get('projects');

			let activeIndex = window.config.get('active-project');

			if ( projects[ activeIndex ] ) {
				active = projects[ activeIndex ];
				config = new Store({
					name: 'buildr-project',
					cwd: active.path
				});
			}
		}

		window.projectConfig = config;

		this.setState({
			projects,
			active,
			config
		});
	}

	componentDidMount() {
		this._ProjectSelect.setFileList( this._ProjectFileList );
	}

	setProjects( projects ) {
		this.setState({
			projects
		});

		window.config.set( 'projects', projects );
	}

	setActiveProject( index ) {
		let active = this.state.projects[ index ];

		if ( active ) {
			this.setState({
				active
			});

			window.config.set( 'active-project', index );
		}
	}

	render() {
		return (
			<React.Fragment>
				<div id='header'>
					<ProjectSelect
						active={ this.state.active }
						projects={ this.state.projects }
						setProjects={ this.setProjects }
						setActiveProject={ this.setActiveProject }
						ref={ ( child ) => { this._ProjectSelect = child; } }
					/>
				</div>
				<div id='content'>
					<FileList
						path={ this.state.active.path }
						config={ this.state.config }
						ref={ ( child ) => { this._ProjectFileList = child; } }
					/>
				</div>
			</React.Fragment>
		);
	}
}

module.exports = Projects;
