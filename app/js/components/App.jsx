/**
 * @file Main app component.
 */

const React = require('react');

const { connect } = require( 'react-redux' );

const Overlay = require('./Overlay');

const Sidebar = require('./Sidebar');

const Logs = require('./projects/Logs');

const Settings = require('./projects/Settings');

const Projects = require('./projects/Projects');

class App extends React.Component {

	/**
	 * Constrcutor.
	 *
	 * @param {Object} props
	 */
	constructor( props ) {
		super( props );

		this.views = {
			files: 'Files',
			logs: 'Logs',
			settings: 'Settings'
		};
	}

	/**
	 * Render overlay for logs and settings.
	 */
	renderOverlay() {
		const show = this.props.view !== 'files';

		global.ui.overlay( show );

		if ( ! show ) {
			return '';
		} else {
			let content;

			if ( this.props.view === 'logs' ) {
				content = <Logs />;
			} else {
				content = <Settings />;
			}

			return (
				<Overlay hasClose={ false }>
					{ content }
				</Overlay>
			);
		}
	}

	/**
	 * Render.
	 */
	render() {
		return (
			<div id='app'>
				<Sidebar items={ this.views } />

				<div id='content-wrap'>
					<Projects />
				</div>

				{ this.renderOverlay() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ({
	view: state.view,
	projects: state.projects
});

module.exports = connect( mapStateToProps, null )( App );
