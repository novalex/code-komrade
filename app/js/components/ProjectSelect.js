const shell    = require('electron').shell;
const os       = require('os');
const React    = require('react');
const ReactDOM = require('react-dom');

class ProjectSelect extends React.Component {
	_FileList: null;

	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false,
			currentProject: props.active,
		};

		this.toggleSelect  = this.toggleSelect.bind( this );
		this.selectProject = this.selectProject.bind( this );
	}

	componentDidMount() {
		// this._FileList.setPath( this.state.currentProject.path );
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
		this._FileList.setPath( this.props.projects[ project ].path );

		this.setState( function( prevState ) {
			return { currentProject: this.props.projects[ project ] };
		});
	}

	newProject() {
		shell.showItemInFolder( os.homedir() );
	}

	renderChoices() {
		let choices = [];

		for ( var index in this.props.projects ) {
			choices.push(
				<div key={ index } data-project={ index } onClick={ this.selectProject }>
					{ this.props.projects[ index ].name }
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
		return (
			<div id="project-select">
				<div id="project-active" onClick={ this.toggleSelect }>
					<h1>{ this.state.currentProject.name }</h1>
					<h2>{ this.state.currentProject.path }</h2>
				</div>
				<div id="project-select-dropdown" className={ this.state.isOpen ? 'open' : '' }>
					{ this.renderChoices() }
				</div>
			</div>
		);
	}
}

module.exports = ProjectSelect;