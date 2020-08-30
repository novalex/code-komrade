/**
 * @file Component for the project selector.
 */

const React = require( 'react' );

const { connect } = require( 'react-redux' );

const autoBind = require( 'auto-bind' );

const { setProjectState, refreshActiveProject } = require( '../../actions' );

const { setProjectConfig } = require( '../../utils/utils' );

class ProjectSelect extends React.Component {

	/**
	 * Constrcutor.
	 *
	 * @param {Object} props
	 */
	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false
		};

		autoBind( this );
	}

	toggleSelect() {
		global.ui.unfocus( !this.state.isOpen, '#project-select' );

		this.setState( { isOpen: !this.state.isOpen } );
	}

	toggleProject() {
		let paused = !this.props.active.paused || false;

		this.props.setProjectState( { paused: paused } );

		this.props.refreshActiveProject( {
			...this.props.active,
			paused: paused
		} );

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

	render() {
		const selectDropdown = (
			<div id='project-select-dropdown' className={this.state.isOpen ? 'open' : ''}>
				{this.props.projects.map( ( project, index ) => {
					return (
						<div key={index} data-project={index} onClick={this.selectProject}>
							{project.name}
						</div>
					);
				} )}

				<div key='new' data-project='new' onClick={this.selectProject}>
					+ Add new project
				</div>
			</div>
		);

		if ( !this.props.active.name || !this.props.active.path ) {
			return (
				<div id='project-select' className='empty'>
					<div id='project-active' onClick={this.toggleSelect}>
						<h1>No Project Selected</h1>
						<h2>Click here to select one...</h2>
					</div>
					{selectDropdown}
				</div>
			);
		}

		return (
			<>
				<div id='project-select' className='selected'>
					<div id='project-active' onClick={this.toggleSelect}>
						<h1>{this.props.active.name}</h1>
						<h2>{this.props.active.path}</h2>
					</div>
					{selectDropdown}
				</div>

				<div id='project-actions'>
					<a href='#' className={'toggle' + ( this.props.active.paused ? ' paused' : ' active' )} onClick={this.toggleProject} />
					<a href='#' className='refresh' onClick={this.props.refreshProject} />
					<a href='#' className='remove' onClick={this.props.removeProject} />
				</div>
			</>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	projects: state.projects,
	active: state.activeProject
} );

const mapDispatchToProps = ( dispatch ) => ( {
	setProjectState: state => dispatch( setProjectState( state ) ),
	refreshActiveProject: project => dispatch( refreshActiveProject( project ) )
} );

module.exports = connect( mapStateToProps, mapDispatchToProps )( ProjectSelect );
