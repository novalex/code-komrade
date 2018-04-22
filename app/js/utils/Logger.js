/**
 * @file Logger utility.
 */

const moment = require('moment');

class Logger {
	constructor() {
		this.logs = [];
	}

	log( type, title, body = '' ) {
		this.logs.push({
			type: type,
			title: title,
			body: body,
			time: moment().format('HH:mm:ss.SSS')
		});
		/* global Event */
		document.dispatchEvent( new Event('bd/refresh/logs') );
	}

	get( type = null, order = 'desc' ) {
		let logs;

		if ( ! type ) {
			logs = this.logs;
		} else {
			logs = this.logs.filter( log => { return log.type === type } );
		}

		if ( order === 'desc' ) {
			logs = logs.slice().reverse();
		}

		return logs;
	}
}

module.exports = Logger;
