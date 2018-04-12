/**
 * @file App sidebar.
 */

const React = require('react');

class Sidebar extends React.Component {
	constructor( props ) {
		super( props );

		this.items = {
			files: 'Files',
			term: 'Terminal',
			settings: 'Settings'
		};

		this.onClick = this.onClick.bind( this );
	}

	onClick( event ) {
		event.persist();

		let view = event.currentTarget.dataset.view;

		this.props.changeView( view );
	}

	renderItems() {
		let items = [];

		for ( var id in this.items ) {
			items.push(
				<li
					key={ id }
					data-view={ id }
					data-tip={ this.items[ id ] }
					className={ this.props.active === id ? 'active' : '' }
					onClick={ this.onClick }
				>
					<span className='icon' />
				</li>
			)
		}

		return items;
	}

	render() {
		return (
			<nav id='sidebar'>
				<div id='logo' />

				<ul id='menu'>
					{ this.renderItems() }
				</ul>
			</nav>
		);
	}
}

module.exports = Sidebar;
