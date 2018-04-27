/**
 * @file Component for the projects view.
 */

const _debounce = require('lodash/debounce');

const React = require('react');

const Store = require('electron-store');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./filelist/FileList');

const directoryTree = require('../../utils/directoryTree');

const Logger = require('../../utils/Logger');

class Projects extends React.Component {
	constructor( props ) {
		super( props );

		let projects = [];
		let active = {
			name: '',
			path: '',
			paused: false
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
		this.toggleProject = this.toggleProject.bind( this );
		this.refreshProject = this.refreshProject.bind( this );
		this.setActiveProject = this.setActiveProject.bind( this );

		document.addEventListener( 'bd/refresh/files', this.refreshProject );
	}

	componentDidMount() {
		if ( this.state.active.path ) {
			this.setProjectPath( this.state.active.path );
		}
	}

	initCompiler() {
		console.log( this.state.active );

		if ( ! this.state.active.paused ) {
			global.compiler.initProject();
		} else {
			global.compiler.killTasks();
		}
	}

	setProjects( projects ) {
		this.setState({
			projects
		});

		global.config.set( 'projects', projects );
	}

	toggleProject() {
		this.setState( function( prevState ) {
			let paused = prevState.active.paused || false;
			let newState = Object.assign( {}, prevState );

			newState.active.paused = ! paused;

			return newState;
		}, function() {
			this.setProjectConfig( 'paused', this.state.active.paused );
		});
	}

	refreshProject() {
		this.getFiles( this.state.active.path );
	}

	setActiveProject( index = null ) {
		if ( index === null ) {
			this.setState({
				active: {
					name: '',
					path: '',
					paused: false
				}
			});

			return;
		}

		let active = this.state.projects[ index ];

		if ( active && active.path !== this.state.active.path ) {
			this.setState({
				active
			}, function() {
				this.setProjectPath( active.path );
			});

			global.config.set( 'active-project', index );
		}
	}

	setProjectConfig( property, value ) {
		let projects = global.config.get('projects');
		let activeIndex = global.config.get('active-project');

		if ( Array.isArray( projects ) && projects[ activeIndex ] ) {
			projects[ activeIndex ][ property ] = value;

			global.config.set( 'projects', projects );
		} else {
			window.alert( 'There was a problem saving the project config.' );
		}
	}

	setProjectConfigFile( path ) {
		global.projectConfig = new Store({
			name: 'buildr-project',
			cwd: path
		});

		global.projectConfig.onDidChange( 'files', _debounce( this.initCompiler, 100 ) );
	}

	getFiles( path ) {
		this.setState({ loading: true });

		global.ui.loading();

		let exclude = new RegExp( this.state.ignored.join('|'), 'i' );

		directoryTree( path, {
			// depth: 2,
			exclude
		}).then( function( files ) {
			this.setState({
				files,
				loading: false
			});

			global.ui.loading( false );
		}.bind( this ));
	}

	setProjectPath( path ) {
		this.getFiles( path );

		this.setProjectConfigFile( path );

		// Change process cwd.
		process.chdir( path );
		// console.log(`Current directory: ${process.cwd()}`);

		global.logger = new Logger();

		this.initCompiler();
	}

	renderNotices() {
		if ( this.state.active.paused ) {
			return (
				<p>Project is paused. Files will not be watched and auto compiled.</p>
			);
		}

		return '';
	}

	render() {
		return (
			<React.Fragment>
				<div id='header'>
					<ProjectSelect
						active={ this.state.active }
						projects={ this.state.projects }
						setProjects={ this.setProjects }
						toggleProject={ this.toggleProject }
						refreshProject={ this.refreshProject }
						setActiveProject={ this.setActiveProject }
					/>
				</div>
				<div id='content'>
					{ this.renderNotices() }

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
