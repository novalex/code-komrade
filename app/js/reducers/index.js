/**
 * @file Root reducer.
 */

const { combineReducers } = require('redux');

const projects = require('./projects');

module.exports = combineReducers({
	projects
});
