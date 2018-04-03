/**
 * @file Component for the project selector.
 */

const { dialog } = require('electron').remote;

const fspath = require('path');

const React = require('react');

const globalUI = require('../helpers/globalUI');

class ProjectSelect extends React.Component {
	_FileList: null;

	constructor( props ) {
		super( props );

		this.state = {
			isOpen:   false
		};

		this.newProject    = this.newProject.bind( this );
		this.toggleSelect  = this.toggleSelect.bind( this );
		this.selectProject = this.selectProject.bind( this );
	}

	setFileList( FileList ) {
		this._FileList = FileList;
	}

	toggleSelect() {
		this.setState( function( prevState ) {
			globalUI.unfocus( ! prevState.isOpen );

			return { isOpen: ! prevState.isOpen };
		});
	}

	selectProject( event ) {
		event.persist();
		let index = event.currentTarget.dataset.project;

		if ( index === 'new' ) {
			this.newProject();
		} else {
			this.changeProject( index );
		}

		this.toggleSelect();
	}

	changeProject( index ) {
		this.props.setActiveProject( index );

		this._FileList.setPath( this.props.projects[ index ].path );

		this.setState({ active: this.props.projects[ index ] });
	}

	newProject() {
		let path = dialog.showOpenDialog({
			properties: [ 'openDirectory' ]
		});

		if ( path ) {
			this._FileList.setPath( path[0] );

			let project = {
				name: fspath.basename( path[0] ),
				path: path[0]
			};

			this.setState( function( prevState ) {
				let projects = prevState.projects;

				projects.push( project );

				this.props.setProjects( projects );
				this.props.setActiveProject( projects.length - 1 );

				return {
					active: project,
					projects
				};
			});
		}
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
			<div key='new' data-project='new' onClick={ this.selectProject }>
				Add new project
			</div>
		);

		return choices;
	}

	render() {
		if ( ! this.props.active.name || ! this.props.active.path ) {
			return (
				<div id='project-select'>
					<div id='project-active' onClick={ this.newProject }>
						<h1>No Project Selected</h1>
						<h2>Click here to add one...</h2>
					</div>
				</div>
			);
		}

		return (
			<div id='project-select'>
				<div id='project-active' onClick={ this.toggleSelect }>
					<h1>{ this.props.active.name }</h1>
					<h2>{ this.props.active.path }</h2>
				</div>
				<div id='project-select-dropdown' className={ this.state.isOpen ? 'open' : '' }>
					{ this.renderChoices() }
				</div>
			</div>
		);
	}
}

module.exports = ProjectSelect;
