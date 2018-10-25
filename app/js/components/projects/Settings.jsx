/**
 * @file Component for displaying the settings.
 */

const React = require('react');

const NoContent = require('../NoContent');

class Settings extends React.Component {
	render() {
		return (
			<NoContent className='settings-screen'>
				<h1>Settings</h1>
				<h2>Coming soon!</h2>
			</NoContent>
		);
	}
}

module.exports = Settings;
