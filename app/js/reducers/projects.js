/**
 * @file Projects reducer.
 */

let initialProjects = [];

if ( global.config.has('projects') ) {
	initialProjects = global.config.get('projects');
}

const projects = ( projects = initialProjects, action ) => {
	switch ( action.type ) {
		case 'ADD_PROJECT':
			return [
				...projects,
				action.payload
			];
		case 'REMOVE_PROJECT':
			return projects.filter( ( project, index ) => index !== action.id );
		default:
			return projects;
	}
};

let initialActive = {
	id: null,
	name: '',
	path: '',
	paused: false
};

if ( initialProjects.length && global.config.has('active-project') ) {
	let activeIndex = global.config.get('active-project');

	if ( initialProjects[ activeIndex ] ) {
		initialActive = initialProjects[ activeIndex ];
		initialActive.id = activeIndex;
	}
}

const activeProject = ( active = initialActive, action ) => {
	switch ( action.type ) {
		case 'CHANGE_PROJECT':
			return action.payload;
		case 'SET_PROJECT_STATE':
			return {
				...active,
				...action.payload
			};
		default:
			return active;
	}
};

const activeProjectFiles = ( files = {}, action ) => {
	switch ( action.type ) {
		case 'RECEIVE_FILES':
			return action.payload;
		default:
			return files;
	}
}

module.exports = {
	projects,
	activeProject,
	activeProjectFiles
};
