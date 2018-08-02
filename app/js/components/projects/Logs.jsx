/**
 * @file Component for displaying logs and information.
 */

const React = require('react');

const NoContent = require('../NoContent');

class Logs extends React.Component {
	constructor( props ) {
		super( props );

		let type = null;
		let logs = ( global.logger ) ? global.logger.get( type ) : [];

		this.state = {
			type,
			logs
		};

		this.refresh = this.refresh.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'bd/refresh/logs', this.refresh );
	}

	componentWillUnmount() {
		document.removeEventListener( 'bd/refresh/logs', this.refresh );
	}

	refresh() {
		this.setState({ logs: global.logger.get( this.state.type ) });
	}

	renderChildren() {
		let logIndex = 0;
		let logList = [];

		for ( var log of this.state.logs ) {
			let titleHTML = { __html: log.title };
			let bodyHTML = ( log.body ) ? { __html: log.body } : null;

			logList.push(
				<li
					key={ logIndex }
					className={ 'type-' + log.type }
				>
					<div className='title'>
						<small>{ log.time }</small>
						<span className='title-text' dangerouslySetInnerHTML={ titleHTML } />
					</div>
					{ bodyHTML &&
						<div className='details' dangerouslySetInnerHTML={ bodyHTML } />
					}
				</li>
			);
			logIndex++;
		}

		return <ul>{ logList }</ul>;
	}

	render() {
		if ( ! this.state.logs.length ) {
			return (
				<NoContent className='logs-screen empty'>
					<h3>No logs yet.</h3>
					<p>Go forth and compile!</p>
				</NoContent>
			);
		}

		return (
			<div id='logs' className='logs-screen'>
				{ this.renderChildren() }
			</div>
		);
	}
}

module.exports = Logs;
