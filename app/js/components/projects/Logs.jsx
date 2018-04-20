/**
 * @file Component for displaying logs and information.
 */

const React = require('react');

class Logs extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			type: null
		};
	}

	renderChildren() {
		if ( ! global.logger ) {
			return <strong>No logs for you!</strong>;
		}

		let logs = global.logger.get( this.state.type );

		if ( ! logs.length ) {
			return <strong>No logs for you!</strong>;
		}

		let logIndex = 0;
		let logList = [];

		for ( var log of logs ) {
			logList.push(
				<li
					key={ logIndex }
					className={ 'type-' + log.type }
				>
					<strong>{ log.title }</strong>
					{ log.body &&
						<div className='details'>{ log.body }</div>
					}
				</li>
			);
			logIndex++;
		}

		return <ul>{ logList }</ul>;
	}

	onClick( event ) {
		event.stopPropagation();

		global.ui.offCanvas( false );

		this.setState( function( prevState ) {
			return { expanded: ! prevState.expanded };
		});
	}

	render() {
		return (
			<div id='logs'>
				{ this.renderChildren() }
			</div>
		);
	}
}

module.exports = Logs;
