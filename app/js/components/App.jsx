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
			view: 'term'
		};

		this.views = {
			files: 'Files',
			term: 'Terminal',
			settings: 'Settings'
		};

		this.changeView = this.changeView.bind( this );
	}

	changeView( view ) {
		this.setState({ view });
	}

	renderOverlay() {
		if ( this.state.view === 'files' ) {
			overlay( false );
			return '';
		} else {
			overlay( true );
			let content;

			if ( this.state.view === 'term' ) {
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
