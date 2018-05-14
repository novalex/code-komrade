/**
 * @file App sidebar.
 */

const React = require('react');

const { changeView } = require('../actions');

const { connect } = require('react-redux');

class Sidebar extends React.Component {
	constructor( props ) {
		super( props );

		this.onClick = this.onClick.bind( this );
	}

	onClick( event ) {
		event.persist();

		let view = event.currentTarget.dataset.view;

		this.props.changeView( view );
	}

	renderItems() {
		let items = [];

		for ( var id in this.props.items ) {
			items.push(
				<li
					key={ id }
					data-view={ id }
					data-tip={ this.props.items[ id ] }
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
				<ul id='menu'>
					{ this.renderItems() }
				</ul>
			</nav>
		);
	}
}

const mapStateToProps = ( state ) => ({
	active: state.view
});

const mapDispatchToProps = ( dispatch ) => ({
	changeView: view => dispatch( changeView( view ) )
});

module.exports = connect( mapStateToProps, mapDispatchToProps )( Sidebar );
