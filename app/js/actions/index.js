/**
 * @file Actions.
 */

// Main.

function changeView( view ) {
	return {
		type: 'CHANGE_VIEW',
		view
	};
}

// Projects.

function addProject( project ) {
	return {
		type: 'ADD_PROJECT',
		payload: project
	};
}

function changeProject( project ) {
	return {
		type: 'CHANGE_PROJECT',
		payload: project
	};
}

function removeProject( id ) {
	return {
		type: 'REMOVE_PROJECT',
		id
	};
}

function refreshActiveProject( project ) {
	return {
		type: 'REFRESH_ACTIVE_PROJECT',
		payload: project
	};
}

function setProjectState( state ) {
	return {
		type: 'SET_PROJECT_STATE',
		payload: state
	};
}

// Files.

function receiveFiles( files ) {
	return {
		type: 'RECEIVE_FILES',
		payload: files
	};
}

function setActiveFile( file ) {
	return {
		type: 'SET_ACTIVE_FILE',
		payload: file
	};
}

module.exports = {
	changeView,
	addProject,
	changeProject,
	removeProject,
	setProjectState,
	receiveFiles,
	setActiveFile,
	refreshActiveProject
};
