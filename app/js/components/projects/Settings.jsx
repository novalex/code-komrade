/**
 * @file Component for displaying the settings.
 */

const React = require('react');

const NoContent = require('../NoContent');

class Settings extends React.Component {
	render() {
		return (
			<NoContent className='settings-screen'>
				<h3>Settings</h3>
				<p>Coming soon!</p>
			</NoContent>
		);
	}
}

module.exports = Settings;
