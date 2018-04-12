/**
 * @file Projects reducer.
 */

const projects = ( state = [], action ) => {
	switch ( action.type ) {
		case 'ADD_PROJECT':
			return [
				...state,
				{
					id: action.id,
					name: action.name,
					path: action.path
				}
			]
		default:
			return state
	}
}

module.exports = projects;
