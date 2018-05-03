/**
 * @file Component for showing notices and alerts.
 */

const React = require('react');

class Notice extends React.Component {
	render() {
		let type = this.props.type || 'info';

		return (
			<div className={ 'notice type-' + type }>
				{ this.props.children }
			</div>
		);
	}
}

module.exports = Notice;
