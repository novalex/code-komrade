/**
 * @file Main app component.
 */

const React = require('react');

const { connect } = require('react-redux');

const Overlay = require('./Overlay');

const Sidebar = require('./Sidebar');

const Logs = require('./projects/Logs');

const Projects = require('./projects/Projects');

const { overlay } = require('../utils/globalUI');

class App extends React.Component {
	constructor( props ) {
		super( props );

		this.views = {
			files: 'Files',
			logs: 'Logs',
			settings: 'Settings'
		};
	}

	renderOverlay() {
		overlay( this.props.view !== 'files' );

		if ( this.props.view === 'files' ) {
			return '';
		} else {
			let content;

			if ( this.props.view === 'logs' ) {
				content = <Logs />;
			} else {
				content = (
					<React.Fragment>
						<h2>{ this.views[ this.props.view ] }</h2>
						<p>You shouldn't be here, you naughty naughty boy.</p>
					</React.Fragment>
				);
			}

			return (
				<Overlay hasClose={ false }>
					{ content }
				</Overlay>
			);
		}
	}

	render() {
		return (
			<div id='app'>
				<Sidebar
					items={ this.views }
				/>

				<div id='content-wrap'>
					<Projects />
				</div>

				{ this.renderOverlay() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ({
	view: state.view
});

module.exports = connect( mapStateToProps, null )( App );
