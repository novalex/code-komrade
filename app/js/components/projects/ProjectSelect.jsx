/**
 * @file Component for the project selector.
 */

const React = require('react');

const { connect } = require('react-redux');

const { setProjectState, refreshActiveProject } = require('../../actions');

const { setProjectConfig } = require('../../utils/utils');

class ProjectSelect extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false
		};

		this.toggleSelect = this.toggleSelect.bind( this );
		this.selectProject = this.selectProject.bind( this );
		this.toggleProject = this.toggleProject.bind( this );
	}

	toggleSelect() {
		global.ui.unfocus( ! this.state.isOpen );

		this.setState({ isOpen: ! this.state.isOpen });
	}

	toggleProject() {
		let paused = ! this.props.active.paused || false;

		this.props.setProjectState({ paused: paused });

		this.props.refreshActiveProject({
			...this.props.active,
			paused: paused
		});

		setProjectConfig( 'paused', paused );
	}

	selectProject( event ) {
		event.persist();
		let index = event.currentTarget.dataset.project;

		this.toggleSelect();

		if ( index === 'new' ) {
			this.props.newProject();
		} else {
			this.props.changeProject( index );
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
					<a href='#' className={ 'toggle' + ( this.props.active.paused ? ' paused' : ' active' ) } onClick={ this.toggleProject } />
					<a href='#' className='refresh' onClick={ this.props.refreshProject } />
					<a href='#' className='remove' onClick={ this.props.removeProject } />
				</div>
				<div id='project-select-dropdown' className={ this.state.isOpen ? 'open' : '' }>
					{ this.renderChoices() }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ({
	projects: state.projects,
	active: state.activeProject
});

const mapDispatchToProps = ( dispatch ) => ({
	setProjectState: state => dispatch( setProjectState( state ) ),
	refreshActiveProject: project => dispatch( refreshActiveProject( project ) )
});

module.exports = connect( mapStateToProps, mapDispatchToProps )( ProjectSelect );
