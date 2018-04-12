/**
 * @file Actions.
 */

function changeView( view ) {
	return {
		type: 'CHNAGE_VIEW',
		view
	};
}

function addProject( name, path ) {
	return {
		type: 'ADD_PROJECT',
		id: path,
		name,
		path
	};
}

module.exports = {
	changeView,
	addProject
};
