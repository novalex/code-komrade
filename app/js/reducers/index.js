/**
 * @file Root reducer.
 */

const { combineReducers } = require('redux');

const view = ( current = 'files', action ) => {
	switch ( action.type ) {
		case 'CHANGE_VIEW':
			return action.view;
		default:
			return current;
	}
};

const { projects, activeProject, activeProjectFiles } = require('./projects');

const activeFile = ( file = null, action ) => {
	switch ( action.type ) {
		case 'SET_ACTIVE_FILE':
			return action.payload;
		default:
			return file;
	}
}

module.exports = combineReducers({
	view,
	projects,
	activeProject,
	activeProjectFiles,
	activeFile
});
