/**
 * @file Component for the projects view.
 */

const _debounce = require('lodash/debounce');

const React = require('react');

const { connect } = require('react-redux');

const Store = require('electron-store');

const Notice = require('../ui/Notice');

const ProjectSelect = require('./ProjectSelect');

const FileList = require('./filelist/FileList');

const Panel = require('./Panel');

const directoryTree = require('../../utils/directoryTree');

const Logger = require('../../utils/Logger');

const { receiveFiles } = require('../../actions');

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

		this.setProjects = this.setProjects.bind( this );
		this.initCompiler = this.initCompiler.bind( this );
		this.toggleProject = this.toggleProject.bind( this );
		this.refreshProject = this.refreshProject.bind( this );
		this.setActiveProject = this.setActiveProject.bind( this );

		document.addEventListener( 'bd/refresh/files', this.refreshProject );
	}

	componentDidMount() {
		if ( this.props.active.path ) {
			this.setProjectPath( this.props.active.path );
		}
	}

	initCompiler() {
		if ( ! this.props.active.paused ) {
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
			this.setProjectConfig( 'paused', this.props.active.paused );

			this.initCompiler();
		});
	}

	refreshProject() {
		this.getFiles( this.props.active.path );
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

		let active = this.props.projects[ index ];

		if ( active && active.path !== this.props.active.path ) {
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
				loading: false
			}, function() {
				// global.store.dispatch( receiveFiles( files ) );
			});

			global.ui.loading( false );
		}.bind( this ));
	}

	setProjectPath( path ) {
		this.getFiles( path );

		this.setProjectConfigFile( path );

		// Change process cwd.
		process.chdir( path );

		global.logger = new Logger();

		this.initCompiler();
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
		return (
			<React.Fragment>
				<div id='header'>
					<ProjectSelect
						active={ this.props.active }
						projects={ this.props.projects }
						setProjects={ this.setProjects }
						toggleProject={ this.toggleProject }
						refreshProject={ this.refreshProject }
						setActiveProject={ this.setActiveProject }
					/>
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
			</React.Fragment>
		);
	}
}

const mapStateToProps = ( state ) => ({
	projects: state.projects,
	active: state.activeProject,
	files: state.activeProjectFiles
});

module.exports = connect( mapStateToProps, null )( Projects );
