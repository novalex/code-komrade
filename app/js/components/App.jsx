/**
 * @file Main app component.
 */

const React = require('react');

const Overlay = require('./Overlay');

const Sidebar = require('./Sidebar');

const Logs = require('./projects/Logs');

const Projects = require('./projects/Projects');

const { overlay } = require('../utils/globalUI');

class App extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			view: 'files'
		};

		this.views = {
			files: 'Files',
			logs: 'Logs',
			settings: 'Settings'
		};

		this.changeView = this.changeView.bind( this );
	}

	changeView( view ) {
		this.setState({ view });
	}

	renderOverlay() {
		overlay( this.state.view !== 'files' );

		if ( this.state.view === 'files' ) {
			return '';
		} else {
			let content;

			if ( this.state.view === 'logs' ) {
				content = <Logs />;
			} else {
				content = (
					<React.Fragment>
						<h2>{ this.views[ this.state.view ] }</h2>
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
					active={ this.state.view }
					changeView={ this.changeView }
				/>

				<div id='content-wrap'>
					<Projects />
				</div>

				{ this.renderOverlay() }
			</div>
		);
	}
}

module.exports = App;
