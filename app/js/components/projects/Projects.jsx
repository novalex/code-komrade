/**
 * @file Component for the projects view.
 */

const fs = require('fs');

const fspath = require('path');

const _debounce = require('lodash/debounce');

const { dialog } = require('electron').remote;

const React = require('react');

const { connect } = require('react-redux');

const Store = require('electron-store');

const NoContent = require('../NoContent');

const Notice = require('../ui/Notice');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./filelist/FileList');

const Panel = require('./Panel');

const directoryTree = require('../../utils/directoryTree');

const Logger = require('../../utils/Logger');

const { addProject, removeProject, changeProject, receiveFiles, setActiveFile } = require('../../actions');

class Projects extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			ignored: [
				'.git',
				'node_modules',
				'.DS_Store',
				'buildr-project.json'
			],
			loading: false
		};

		this.newProject = this.newProject.bind( this );
		this.initProject = this.initProject.bind( this );
		this.changeProject = this.changeProject.bind( this );
		this.removeProject = this.removeProject.bind( this );
		this.refreshProject = this.refreshProject.bind( this );
		this.changeProjectPath = this.changeProjectPath.bind( this );

		this.initCompiler = this.initCompiler.bind( this );

		document.addEventListener( 'bd/refresh/files', this.refreshProject );
	}

	componentDidMount() {
		if ( this.props.active.path ) {
			this.initProject( this.props.active.path );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		if (
			prevProps.active.path === this.props.active.path &&
			prevProps.active.paused !== this.props.active.paused
		) {
			// Project was paused/unpaused, trigger compiler tasks or terminate them.
			this.initCompiler();
		}
	}

	// Add a new project.
	newProject() {
		let path = dialog.showOpenDialog({
			properties: [ 'openDirectory' ]
		});

		if ( path ) {
			let newProject = {
				name: fspath.basename( path[0] ),
				path: path[0],
				paused: false
			};
			let newProjectIndex = this.props.projects.length;

			if ( this.props.projects.findIndex( project => project.path === newProject.path ) !== -1 ) {
				// Project already exists.
				return;
			}

			// Save new project to config.
			global.config.set( 'projects', [
				...this.props.projects,
				newProject
			] );

			// Update state.
			this.props.addProject( newProject );

			// Set new project as active.
			this.changeProject( newProjectIndex, newProject );
		}
	}

	// Change the active project.
	changeProject( id, project = null ) {
		if ( id === this.props.active.id ) {
			return;
		}

		let active = {
			name: '',
			path: '',
			paused: true
		};

		if ( project ) {
			active = project;
		} else if ( this.props.projects[id] ) {
			active = this.props.projects[id];
		}

		// Update config.
		global.config.set( 'active-project', id );

		// Update state.
		this.props.changeProject({
			...active,
			id
		});
		this.props.setActiveFile( null );

		// Init.
		this.initProject( active.path );
	}

	// Remove the current project.
	removeProject() {
		let removeIndex = parseInt( this.props.active.id, 10 );

		let projects = this.props.projects.filter( ( project, index ) => index !== removeIndex );

		// Remove project from config.
		global.config.set( 'projects', projects );

		// Update state.
		this.props.removeProject( removeIndex );

		// Unset active project.
		this.changeProject( null );
	}

	// Confirm project removal when clicking remove button.
	removeProjectButton( event ) {
		event.preventDefault();

		let confirmRemove = window.confirm( `Are you sure you want to remove ${this.props.active.name}?` );

		if ( confirmRemove ) {
			this.removeProject();
		}
	}

	// Change active project's path.
	changeProjectPath() {
		let path = dialog.showOpenDialog( {
			properties: ['openDirectory']
		} );

		if ( path ) {
			let projects = this.props.projects;
			let projectIndex = projects.findIndex( project => project.path === this.props.active.path );

			if ( projectIndex === -1 ) {
				// Project not found.
				return;
			}

			projects[ projectIndex ].path = path[0];

			// Save new project to config.
			global.config.set( 'projects', projects );

			// Set new project as active.
			this.changeProject( projectIndex );
		}
	}

	// Start the background compiler tasks.
	initCompiler() {
		if ( ! this.props.active.paused ) {
			global.compiler.initProject();
		} else {
			global.compiler.killTasks();
		}
	}

	// Refresh the project files.
	refreshProject() {
		this.getFiles( this.props.active.path );
	}

	// Create or fetch the project config file.
	setProjectConfigFile( path ) {
		global.projectConfig = new Store({
			name: 'buildr-project',
			cwd: path
		});

		// Listen for changes to the project's file options and trigger the compiler init.
		global.projectConfig.onDidChange( 'files', _debounce( this.initCompiler, 100 ) );
	}

	// Read the files in the project directory.
	getFiles( path ) {
		this.setState({ loading: true });

		global.ui.loading();

		let exclude = new RegExp( this.state.ignored.join('|'), 'i' );

		directoryTree( path, {
			// depth: 2,
			exclude
		}).then( function( files ) {
			this.setState({
				loading: false
			}, function() {
				global.store.dispatch( receiveFiles( files ) );
			});

			global.ui.loading( false );
		}.bind( this ));
	}

	// Initialize project.
	initProject( path ) {
		fs.access( path, fs.constants.W_OK, function( err ) {
			if ( err ) {
				if ( path ) {
					// Chosen directory not readable.
					const options = {
						type: 'warning',
						title: 'Project directory missing',
						message: `Could not read the ${path} directory. It may have been moved or renamed.`,
						buttons: [ 'Change Directory', 'Remove Project' ]
					};

					dialog.showMessageBox( options, function( index ) {
						if ( index === 0 ) {
							this.changeProjectPath();
						} else if ( index === 1 ) {
							this.removeProject();
						}
					}.bind( this ) );
				} else {
					// No project path provided.
					global.projectConfig = null;

					global.store.dispatch( receiveFiles( {} ) );

					global.compiler.killTasks();
				}
			} else {
				// Directory is readable, get files and setup config.
				this.getFiles( path );

				this.setProjectConfigFile( path );

				// Change process cwd.
				process.chdir( path );

				this.initCompiler();
			}
		}.bind( this ) );

		global.logger = new Logger();
	}

	renderProjectSelect() {
		return (
			<ProjectSelect
				newProject={ this.newProject }
				changeProject={ this.changeProject }
				removeProject={ this.removeProjectButton }
				refreshProject={ this.refreshProject }
			/>
		);
	}

	renderNotices() {
		let notices = [];

		if ( this.props.active.paused ) {
			notices.push( (
				<Notice key='paused' type='warning'>
					<p>Project is paused. Files will not be watched and auto compiled.</p>
				</Notice>
			) );
		}

		return notices;
	}

	render() {
		if ( ! this.props.projects || this.props.projects.length === 0 ) {
			// No projects yet, show welcome screen.
			return (
				<NoContent className='welcome-screen'>
					<h1>You don't have any projects yet.</h1>
					<h2>Would you like to add one now?</h2>
					<button className='large flat add-new-project' onClick={ this.newProject }>Add Project</button>
				</NoContent>
			);
		} else if ( ! this.props.active.name || ! this.props.active.path ) {
			// No project selected, show selector.
			return (
				<NoContent className='project-select-screen'>
					{ this.renderProjectSelect() }
				</NoContent>
			);
		}

		return (
			<div id='projects'>
				<div id='header'>
					{ this.renderProjectSelect() }
				</div>

				<div id='content'>
					{ this.renderNotices() }

					<FileList
						path={ this.props.active.path }
						files={ this.props.files }
						loading={ this.state.loading }
					/>
				</div>

				<Panel />
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ({
	projects: state.projects,
	active: state.activeProject,
	files: state.activeProjectFiles
});

const mapDispatchToProps = ( dispatch ) => ({
	addProject: project => dispatch( addProject( project ) ),
	changeProject: id => dispatch( changeProject( id ) ),
	removeProject: id => dispatch( removeProject( id ) ),
	setActiveFile: file => dispatch( setActiveFile( file ) )
});

module.exports = connect( mapStateToProps, mapDispatchToProps )( Projects );
