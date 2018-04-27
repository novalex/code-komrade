/**
 * @file Component for the project selector.
 */

const { dialog } = require('electron').remote;

const fspath = require('path');

const React = require('react');

class ProjectSelect extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false
		};

		this.newProject = this.newProject.bind( this );
		this.removeProject = this.removeProject.bind( this );
		this.toggleSelect = this.toggleSelect.bind( this );
		this.selectProject = this.selectProject.bind( this );
	}

	toggleSelect() {
		this.setState( function( prevState ) {
			global.ui.unfocus( ! prevState.isOpen );

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
	}

	newProject() {
		let path = dialog.showOpenDialog({
			properties: [ 'openDirectory' ]
		});

		if ( path ) {
			let projects = this.props.projects;

			let newProject = {
				name: fspath.basename( path[0] ),
				path: path[0],
				paused: false
			};

			if ( projects.findIndex( project => project.path === newProject.path ) !== -1 ) {
				// Project already exists.
				return;
			}

			projects.push( newProject );

			this.props.setProjects( projects );

			let activeIndex = projects.length - 1;

			if ( projects[ activeIndex ] ) {
				this.props.setActiveProject( activeIndex );
			} else {
				window.alert( 'There was a problem changing the active project.' );
			}
		}
	}

	removeProject( event ) {
		event.preventDefault();

		let confirmRemove = window.confirm( 'Are you sure you want to remove ' + this.props.active.name + '?' );

		if ( confirmRemove ) {
			let remaining = this.props.projects.filter( project => project.path !== this.props.active.path );

			this.props.setProjects( remaining );
			this.props.setActiveProject( null );
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
		if ( ! this.props.projects || this.props.projects.length === 0 ) {
			return (
				<div id='project-select'>
					<div id='project-active' onClick={ this.newProject }>
						<h1>No Project Selected</h1>
						<h2>Click here to add one...</h2>
					</div>
				</div>
			);
		} else if ( ! this.props.active.name || ! this.props.active.path ) {
			return (
				<div id='project-select'>
					<div id='project-active' onClick={ this.toggleSelect }>
						<h1>No Project Selected</h1>
						<h2>Click here to select one...</h2>
					</div>
					<div id='project-select-dropdown' className={ this.state.isOpen ? 'open' : '' }>
						{ this.renderChoices() }
					</div>
				</div>
			);
		}

		return (
			<div id='project-select' className='selected'>
				<div id='project-active' onClick={ this.toggleSelect }>
					<h1>{ this.props.active.name }</h1>
					<h2>{ this.props.active.path }</h2>
				</div>
				<div id='project-actions'>
					<a href='#' className={ 'toggle' + ( this.props.active.paused ? ' paused' : ' active' ) } onClick={ this.props.toggleProject } />
					<a href='#' className='refresh' onClick={ this.props.refreshProject } />
					<a href='#' className='remove' onClick={ this.removeProject } />
				</div>
				<div id='project-select-dropdown' className={ this.state.isOpen ? 'open' : '' }>
					{ this.renderChoices() }
				</div>
			</div>
		);
	}
}

module.exports = ProjectSelect;
