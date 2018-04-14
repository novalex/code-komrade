/**
 * @file Main app component.
 */

const React = require('react');

const Sidebar = require('./Sidebar');

const Projects = require('./projects/Projects');

class App extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			view: 'files'
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

	renderContent() {
		if ( this.state.view === 'files' ) {
			return <Projects />;
		} else {
			return (
				<React.Fragment>
					<h2>{ this.views[ this.state.view ] }</h2>
					<p>You shouldn't be here, you naughty naughty boy.</p>
				</React.Fragment>
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
					{ this.renderContent() }
				</div>
			</div>
		);
	}
}

module.exports = App;
