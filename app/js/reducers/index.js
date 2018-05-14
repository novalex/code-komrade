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

module.exports = combineReducers({
	view,
	projects,
	activeProject,
	activeProjectFiles
});
