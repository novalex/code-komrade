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

		this.changeView = this.changeView.bind( this );
	}

	changeView( view ) {
		this.setState({ view });
	}

	renderContent() {
		if ( this.state.view === 'files' ) {
			return <Projects />;
		} else {
			return <p>You shouldn't be here, you naughty naughty boy.</p>;
		}
	}

	render() {
		return (
			<div id='app'>
				<Sidebar active={ this.state.view } changeView={ this.changeView } />

				<div id='content'>
					{ this.renderContent() }
				</div>
			</div>
		);
	}
}

module.exports = App;
