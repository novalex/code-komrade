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

function addProject( name, path ) {
	return {
		type: 'ADD_PROJECT',
		payload: {
			id: path,
			name,
			path
		}
	};
}

function changeProject( id ) {
	return {
		type: 'CHANGE_PROJECT',
		id
	}
}

function removeProject( id ) {
	return {
		type: 'REMOVE_PROJECT',
		id
	}
}

// Files.

function receiveFiles( files ) {
	return {
		type: 'RECEIVE_FILES',
		payload: files
	}
}

module.exports = {
	changeView,
	addProject,
	changeProject,
	removeProject,
	receiveFiles
};
