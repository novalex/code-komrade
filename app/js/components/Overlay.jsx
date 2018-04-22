/**
 * @file Component for an overlay.
 */

const React = require('react');

class Overlay extends React.Component {
	// constructor() {}

	render() {
		return (
			<div id='overlay'>
				{ this.props.hasClose &&
					<a href='#' id='close-overlay'>&times;</a>
				}

				<div id='overlay-content'>
					{ this.props.children }
				</div>
			</div>
		)
	}
}

module.exports = Overlay;
