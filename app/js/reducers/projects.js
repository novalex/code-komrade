/**
 * @file Projects reducer.
 */

const projects = ( projects = [], action ) => {
	switch ( action.type ) {
		case 'ADD_PROJECT':
			return [
				...projects,
				action.payload
			];
		case 'REMOVE_PROJECT':
			return projects.filter( ( project, index ) => index !== action.id );
		case 'REFRESH_ACTIVE_PROJECT':
			return projects.map( function( project, index ) {
				if ( index === parseInt( action.payload.id, 10 ) ) {
					return action.payload;
				} else {
					return project;
				}
			});
		default:
			return projects;
	}
};

const activeProject = ( active = {}, action ) => {
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
