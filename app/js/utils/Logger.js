/**
 * @file Logger utility.
 */

class Logger {
	constructor() {
		this.logs = [];
	}

	log( type, title, body = '' ) {
		this.logs.push({
			type: type,
			title: title,
			body: body
		});
	}

	get( type = null ) {
		if ( ! type ) {
			return this.logs;
		}

		return this.logs.filter( log => { return log.type === type } );
	}
}

module.exports = Logger;
