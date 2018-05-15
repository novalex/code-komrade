/**
 * @file Collection of helper functions.
 */

function sleep(milliseconds) {
	var start = new Date().getTime();
	for ( var i = 0; i < 1e7; i++ ) {
		if ( ( new Date().getTime() - start ) > milliseconds ) {
			break;
		}
	}
}

function setProjectConfig( property, value ) {
	let projects = global.config.get('projects');
	let activeIndex = global.config.get('active-project');

	if ( Array.isArray( projects ) && projects[ activeIndex ] ) {
		projects[ activeIndex ][ property ] = value;

		global.config.set( 'projects', projects );
	} else {
		window.alert( 'There was a problem saving the project config.' );
	}
}

module.exports = {
	sleep,
	setProjectConfig
};
