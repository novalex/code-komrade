/**
 * @file Component for the projects view.
 */

const React = require('react');

const Store = require('electron-store');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./filelist/FileList');

const directoryTree = require('../../utils/directoryTree');

class Projects extends React.Component {
	constructor( props ) {
		super( props );

		let projects = [];
		let active = {
			name: '',
			path: ''
		};

		if ( global.config.has('projects') ) {
			projects = global.config.get('projects');

			let activeIndex = global.config.get('active-project');

			if ( Array.isArray( projects ) && projects[ activeIndex ] ) {
				active = projects[ activeIndex ];
			}
		}

		this.state = {
			projects,
			active,
			files: null,
			ignored: [
				'.git',
				'node_modules',
				'.DS_Store',
				'buildr-project.json'
			],
			loading: false
		};

		this.setProjects = this.setProjects.bind( this );
		this.setActiveProject = this.setActiveProject.bind( this );
	}

	componentDidMount() {
		if ( this.state.active.path ) {
			this.setProjectPath( this.state.active.path );
		}
	}

	setProjects( projects ) {
		this.setState({
			projects
		});

		global.config.set( 'projects', projects );
	}

	setActiveProject( index = null ) {
		if ( index === null ) {
			this.setState({
				active: {
					name: '',
					path: ''
				}
			});

			return;
		}

		let active = this.state.projects[ index ];

		if ( active && active.path !== this.state.active.path ) {
			this.setState({
				active
			});

			this.setProjectPath( active.path );

			global.config.set( 'active-project', index );
		}
	}

	setProjectConfig( path ) {
		global.projectConfig = new Store({
			name: 'buildr-project',
			cwd: path
		});

		global.compiler.initProject();

		global.projectConfig.onDidChange( 'files', function() {
			global.compiler.initProject();
		});
	}

	walkDirectory( path ) {
		let exclude = new RegExp( this.state.ignored.join('|'), 'i' );

		return directoryTree( path, {
			// depth: 2,
			exclude
		});
	}

	setProjectPath( path ) {
		this.setState({ loading: true });

		global.ui.loading();

		this.walkDirectory( path ).then( function( files ) {
			this.setState({
				files,
				loading: false
			});

			global.ui.loading( false );
		}.bind( this ));

		this.setProjectConfig( path );

		// Change process cwd.
		process.chdir( path );
		// console.log(`Current directory: ${process.cwd()}`);
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
					/>
				</div>
				<div id='content'>
					<FileList
						path={ this.state.active.path }
						files={ this.state.files }
						loading={ this.state.loading }
					/>
				</div>
			</React.Fragment>
		);
	}
}

module.exports = Projects;
