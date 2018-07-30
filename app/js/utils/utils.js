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

function getInitialState() {
	let state = {
		view: 'files',
		projects: [],
		activeProject: 0,
		activeProjectFiles: {},
		activeFile: null
	};

	if ( global.config.has( 'projects' ) ) {
		state.projects = global.config.get( 'projects' );
	}

	if ( state.projects.length && global.config.has( 'active-project' ) ) {
		let activeIndex = global.config.get( 'active-project' );

		if ( state.projects[ activeIndex ] ) {
			state.activeProject = state.projects[ activeIndex ];
			state.activeProject.id = activeIndex;
		}
	}

	return state;
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

function getDependencyArray( dependencyTree ) {
	let dependencies = [];

	for ( var dependency in dependencyTree ) {
		dependencies.push( dependency );

		if ( Object.keys( dependencyTree[ dependency ] ).length > 0 ) {
			dependencies = dependencies.concat( getDependencyArray( dependencyTree[ dependency ] ) );
		}
	}

	return dependencies;
}

module.exports = {
	sleep,
	getInitialState,
	setProjectConfig,
	getDependencyArray
};
