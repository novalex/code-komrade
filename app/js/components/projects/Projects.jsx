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

const { addProject, removeProject, changeProject, receiveFiles } = require('../../actions');

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
		this.setupProject = this.setupProject.bind( this );
		this.changeProject = this.changeProject.bind( this );
		this.removeProject = this.removeProject.bind( this );
		this.refreshProject = this.refreshProject.bind( this );

		this.initCompiler = this.initCompiler.bind( this );

		document.addEventListener( 'bd/refresh/files', this.refreshProject );
	}

	componentDidMount() {
		if ( this.props.active.path ) {
			this.setupProject( this.props.active.path );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.active.paused !== this.props.active.paused ) {
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

			if ( this.props.projects.findIndex( project => project.path === newProject.path ) !== -1 ) {
				// Project already exists.
				return;
			}

			// Save new project to config.
			this.props.addProject( newProject );

			// Set new project as active.
			this.props.changeProject({
				...newProject,
				id: this.props.projects.length
			});

			// Project setup.
			this.setupProject( newProject.path );
		}
	}

	// Chnage the active project.
	changeProject( id ) {
		let active = {
			name: '',
			path: '',
			paused: true
		};

		if ( this.props.projects[ id ] ) {
			active = this.props.projects[ id ];
		}

		this.props.changeProject({
			...active,
			id
		});

		this.setupProject( active.path );
	}

	// Remove the current project.
	removeProject( event ) {
		event.preventDefault();

		let confirmRemove = window.confirm( `Are you sure you want to remove ${this.props.active.name}?` );

		if ( confirmRemove ) {
			this.props.removeProject( this.props.active.id );

			this.changeProject( null );
		}
	}

	initCompiler() {
		if ( ! this.props.active.paused ) {
			global.compiler.initProject();
		} else {
			global.compiler.killTasks();
		}
	}

	refreshProject() {
		this.getFiles( this.props.active.path );
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
				loading: false
			}, function() {
				global.store.dispatch( receiveFiles( files ) );
			});

			global.ui.loading( false );
		}.bind( this ));
	}

	setupProject( path ) {
		fs.open( path, 'r+', 0o666, function( err, stats ) {
			if ( err ) {
				// Chosen directory not readable or no path provided.
				if ( path ) {
					window.alert( `Could not read the ${path} directory.` );
				}

				global.projectConfig = null;

				global.store.dispatch( receiveFiles( {} ) );

				global.compiler.killTasks();
			} else {
				// Directory is readable, get files and setup config.
				this.getFiles( path );

				this.setProjectConfigFile( path );

				// Change process cwd.
				process.chdir( path );

				this.initCompiler();
			}
		}.bind( this ));

		global.logger = new Logger();
	}

	renderProjectSelect() {
		return (
			<ProjectSelect
				newProject={ this.newProject }
				setupProject={ this.setupProject }
				changeProject={ this.changeProject }
				removeProject={ this.removeProject }
				refreshProject={ this.refreshProject }
			/>
		);
	}

	renderNotices() {
		if ( this.props.active.paused ) {
			return (
				<Notice type='warning'>
					<p>Project is paused. Files will not be watched and auto compiled.</p>
				</Notice>
			);
		}

		return '';
	}

	render() {
		if ( ! this.props.projects || this.props.projects.length === 0 ) {
			// No projects yet, show welcome screen.
			return (
				<NoContent className='welcome-screen'>
					<h3>You don't have any projects yet.</h3>
					<p>Would you like to add one now?</p>
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
	addProject: payload => dispatch( addProject( payload ) ),
	changeProject: id => dispatch( changeProject( id ) ),
	removeProject: id => dispatch( removeProject( id ) )
});

module.exports = connect( mapStateToProps, mapDispatchToProps )( Projects );
