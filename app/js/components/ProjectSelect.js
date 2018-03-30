const { dialog } = require('electron').remote;

const PATH = require('path');

const React    = require('react');
const ReactDOM = require('react-dom');

class ProjectSelect extends React.Component {
	_FileList: null;

	constructor( props ) {
		super( props );

		this.state = {
			isOpen:   false,
			active:   props.active,
			projects: props.projects,
		};

		this.newProject    = this.newProject.bind( this );
		this.toggleSelect  = this.toggleSelect.bind( this );
		this.selectProject = this.selectProject.bind( this );
	}

	componentDidMount() {
		// this._FileList.setPath( this.state.active.path );
	}

	setFileList( FileList ) {
		this._FileList = FileList;
	}

	toggleSelect() {
		this.setState( function( prevState ) {
			document.getElementById('wrap').classList.toggle( 'unfocus', ! prevState.isOpen );

			return { isOpen: ! prevState.isOpen };
		});
	}

	selectProject( event ) {
		event.persist();
		var project = event.currentTarget.dataset.project;

		if ( 'new' === project ) {
			this.newProject();
		} else {
			this.changeProject( project );
		}

		this.toggleSelect();
	}

	changeProject( project ) {
		this._FileList.setPath( this.state.projects[ project ].path );

		this.setState({ active: this.state.projects[ project ] });
	}

	newProject() {
		let path = dialog.showOpenDialog({
			properties: [ 'openDirectory' ],
		});

		if ( path ) {
			this._FileList.setPath( path[0] );

			let newProject = {
				name: PATH.basename( path[0] ),
				path: path[0],
			};

			this.setState( function( prevState ) {
				let projects = prevState.projects;

				projects.push( newProject );

				return {
					active: newProject,
					projects,
				};
			});
		}
	}

	renderChoices() {
		let choices = [];

		for ( var index in this.state.projects ) {
			choices.push(
				<div key={ index } data-project={ index } onClick={ this.selectProject }>
					{ this.state.projects[ index ].name }
				</div>
			);
		}

		choices.push(
			<div key="new" data-project="new" onClick={ this.selectProject }>
				Add new project
			</div>
		);

		return choices;
	}

	render() {
		if ( ! this.state.active.name || ! this.state.active.path ) {
			return (
				<div id="project-select">
					<div id="project-active" onClick={ this.newProject }>
						<h1>No Project Selected</h1>
						<h2>Click here to add one...</h2>
					</div>
				</div>
			);
		}

		return (
			<div id="project-select">
				<div id="project-active" onClick={ this.toggleSelect }>
					<h1>{ this.state.active.name }</h1>
					<h2>{ this.state.active.path }</h2>
				</div>
				<div id="project-select-dropdown" className={ this.state.isOpen ? 'open' : '' }>
					{ this.renderChoices() }
				</div>
			</div>
		);
	}
}

module.exports = ProjectSelect;
