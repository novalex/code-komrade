(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
 * @file Actions.
 */

// Main.

function changeView(view) {
	return {
		type: 'CHANGE_VIEW',
		view: view
	};
}

// Projects.

function addProject(project) {
	return {
		type: 'ADD_PROJECT',
		payload: project
	};
}

function changeProject(project) {
	return {
		type: 'CHANGE_PROJECT',
		payload: project
	};
}

function removeProject(id) {
	return {
		type: 'REMOVE_PROJECT',
		id: id
	};
}

function refreshActiveProject(project) {
	return {
		type: 'REFRESH_ACTIVE_PROJECT',
		payload: project
	};
}

function setProjectState(state) {
	return {
		type: 'SET_PROJECT_STATE',
		payload: state
	};
}

// Files.

function receiveFiles(files) {
	return {
		type: 'RECEIVE_FILES',
		payload: files
	};
}

function setActiveFile(file) {
	return {
		type: 'SET_ACTIVE_FILE',
		payload: file
	};
}

module.exports = {
	changeView: changeView,
	addProject: addProject,
	changeProject: changeProject,
	removeProject: removeProject,
	setProjectState: setProjectState,
	receiveFiles: receiveFiles,
	setActiveFile: setActiveFile,
	refreshActiveProject: refreshActiveProject
};

},{}],2:[function(require,module,exports){
'use strict';

/**
 * @file Main app script.
 */

var Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./utils/globalUI');

global.compiler = require('./compiler/interface');

global.compilerTasks = [];

var React = require('react');

var ReactDOM = require('react-dom');

var _require = require('react-redux'),
    Provider = _require.Provider;

var _require2 = require('redux'),
    createStore = _require2.createStore;

var rootReducer = require('./reducers');

var _require3 = require('./utils/utils'),
    getInitialState = _require3.getInitialState;

var initialState = getInitialState();

var store = createStore(rootReducer, initialState);

global.store = store;

var App = require('./components/App');

ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(App, null)
), document.getElementById('root'));

var _require4 = require('./utils/utils'),
    sleep = _require4.sleep;

// App close/restart events.


window.addEventListener('beforeunload', function (event) {
	if (global.compilerTasks.length > 0) {
		console.log('Killing %d running tasks...', global.compilerTasks.length);

		global.compiler.killTasks();

		sleep(300);
	}
});

},{"./compiler/interface":3,"./components/App":5,"./reducers":25,"./utils/globalUI":29,"./utils/utils":31,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],3:[function(require,module,exports){
'use strict';

/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

var app = require('electron').remote.app;

var fs = require('fs');
var path = require('path');
var psTree = require('ps-tree');
var dependencyTree = require('dependency-tree');

var sass = require('node-sass');
var webpack = require('webpack');
var formatMessages = require('./messages');

var _require = require('../utils/pathHelpers'),
    fileAbsolutePath = _require.fileAbsolutePath;

var _require2 = require('../utils/utils'),
    getDependencyArray = _require2.getDependencyArray;

function killTasks() {
	if (global.compilerTasks.length) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = global.compilerTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var task = _step.value;

				terminateProcess(task);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return true;
	}

	// Nothing to kill :(
	return null;
}

function terminateProcess(proc) {
	psTree(proc.pid, function (err, children) {
		if (err) {
			console.error(err);
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = [proc.pid].concat(children.map(function (child) {
				return child.PID;
			}))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var pid = _step2.value;

				try {
					process.kill(pid);
				} catch (err) {
					// Fail silently lol YOLO
					// console.error( err );
				}
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	});
}

function initProject() {
	killTasks();

	if (!global.projectConfig) {
		return;
	}

	var projectFiles = global.projectConfig.get('files', []);

	var projectPath = path.parse(global.projectConfig.path).dir;

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = projectFiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var fileConfig = _step3.value;

			processFile(projectPath, fileConfig);
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}
}

function processFile(base, fileConfig) {
	var taskName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	var options = getFileConfig(base, fileConfig);

	if (!options) {
		if (callback) {
			callback();
		}

		return;
	}

	if (taskName) {
		runTask(taskName, options, callback);
	} else if (options.autocompile) {
		if (options.watchTask) {
			options.getImports = true;
		}

		runTask('watch', options);
	}
}

function getFileOptions(file) {
	var options = {};

	switch (file.extension) {
		case '.css':
			options.type = 'css';
			options.fileType = 'style-' + options.type;
			break;
		case '.sass':
		case '.scss':
			options.type = 'sass';
			options.fileType = 'style-' + options.type;
			break;
		case '.less':
			options.type = 'less';
			options.fileType = 'style-' + options.type;
			break;
		case '.js':
		case '.jsx':
			options.type = 'js';
			options.fileType = 'script';
	}

	options.buildTaskName = 'build-' + options.type;

	return options;
}

function getFileConfig(base, fileConfig) {
	if (!fileConfig.path || !fileConfig.output) {
		return false;
	}

	var filePath = fileAbsolutePath(base, fileConfig.path);
	var outputPath = fileAbsolutePath(base, fileConfig.output);
	var compileOptions = getFileOptions({ extension: path.extname(filePath) });
	var options = {
		input: filePath,
		filename: path.basename(outputPath),
		output: path.parse(outputPath).dir,
		projectBase: base,
		projectConfig: global.projectConfig.path
	};

	if (fileConfig.options) {
		for (var option in fileConfig.options) {
			if (!fileConfig.options.hasOwnProperty(option)) {
				continue;
			}

			options[option] = fileConfig.options[option];
		}

		if (fileConfig.options.autocompile) {
			options.watchTask = compileOptions.buildTaskName;
		}
	}

	return options;
}

function runTask(taskName) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	console.log(options);

	var modulesPath = path.resolve(app.getAppPath(), 'node_modules');
	if (!modulesPath.match('app')) {
		modulesPath = path.resolve(app.getAppPath(), 'app/node_modules');
	}

	// Get imported files.
	var watchFiles = getDependencyArray(dependencyTree({
		filename: options.input,
		directory: options.projectBase
	}));

	var filename = options.filename || 'file';

	// Build task starting.
	global.logger.log('info', 'Compiling ' + filename + '...');

	if (taskName === 'build-sass') {
		var outFile = path.resolve(options.output, options.filename);

		sass.render({
			file: options.input,
			outFile: outFile,
			outputStyle: options.style,
			sourceMap: options.sourcemaps
		}, function (error, result) {
			if (error) {
				// Compilation error(s).
				handleCompileError(filename, error);

				if (callback) {
					callback();
				}
			} else {
				// No errors during the compilation, write this result on the disk
				fs.writeFile(outFile, result.css, function (err) {
					if (err) {
						// Compilation error(s).
						handleCompileError(filename, err);
					} else {
						// Compilation successful.
						handleCompileSuccess(filename);
					}

					if (callback) {
						callback();
					}
				});
			}
		});
	} else {
		var config = {
			mode: 'production',
			entry: options.input,
			output: {
				path: options.output,
				filename: options.filename
			},
			resolveLoader: {
				modules: [modulesPath]
			}
		};

		webpack(config, function (err, stats) {
			if (callback) {
				callback();
			}

			if (err) {
				console.error(err);
			}

			var messages = formatMessages(stats);

			if (!messages.errors.length && !messages.warnings.length) {
				// Compilation successful.
				handleCompileSuccess(filename);
			}

			if (messages.errors.length) {
				// Compilation error(s).
				handleCompileError(filename, messages.errors);

				return;
			}

			if (messages.warnings.length) {
				// Compilation warning(s).
				handleCompileWarnings(filename, messages.warnings);
			}
		});
	}
}

function handleCompileSuccess(filename) {
	var notifyText = 'Finished compiling ' + filename + '.';

	global.logger.log('success', notifyText);

	var notify = new Notification('Buildr', {
		body: notifyText,
		silent: true
	});

	return notify;
}

function handleCompileError(filename, errors) {
	console.error(errors);

	if (!errors.length) {
		errors = [errors];
	}

	var notifyText = (errors.length > 1 ? 'Errors' : 'Error') + (' when compiling ' + filename);

	global.logger.log('error', notifyText + ':', '<pre>' + errors.join('\r\n') + '</pre>');

	var notify = new Notification('Buildr', {
		body: notifyText,
		sound: 'Basso'
	});

	return notify;
}

function handleCompileWarnings(filename, warnings) {
	console.warn(warnings);

	if (!warnings.length) {
		warnings = [warnings];
	}

	var notifyText = (warnings.length > 1 ? 'Warnings' : 'Warning') + (' when compiling ' + filename);

	global.logger.log('warn', notifyText + ':', '<pre>' + warnings.join('\r\n') + '</pre>');
}

module.exports = {
	initProject: initProject,
	runTask: runTask,
	killTasks: killTasks,
	processFile: processFile,
	getFileConfig: getFileConfig,
	getFileOptions: getFileOptions,
	terminateProcess: terminateProcess
};

},{"../utils/pathHelpers":30,"../utils/utils":31,"./messages":4,"dependency-tree":undefined,"electron":undefined,"fs":undefined,"node-sass":undefined,"path":undefined,"ps-tree":undefined,"webpack":undefined}],4:[function(require,module,exports){
'use strict';

/**
 * This has been adapted from `create-react-app`, authored by Facebook, Inc.
 * see: https://github.com/facebookincubator/create-react-app/tree/master/packages/react-dev-utils
 */

var fs = require('fs');
var stripIndent = require('strip-indent');

var _require = require('../utils/pathHelpers'),
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath;

var errorLabel = 'Syntax error:';
var isLikelyASyntaxError = function isLikelyASyntaxError(str) {
	return str.includes(errorLabel);
};

var exportRegex = /\s*(.+?)\s*(")?export '(.+?)' was not found in '(.+?)'/;
var stackRegex = /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm;
var fileAndLineRegex = /in ([^(]*)\s\(line\s(\d*),\scolumn\s(\d*)\)/;

function formatMessage(message, isError) {
	var lines = message.split('\n');

	if (lines.length > 2 && lines[1] === '') {
		lines.splice(1, 1); // Remove extra newline.
	}

	// Remove loader notation from filenames:
	//   `./~/css-loader!./src/App.css` ~~> `./src/App.css`
	if (lines[0].lastIndexOf('!') !== -1) {
		lines[0] = lines[0].substr(lines[0].lastIndexOf('!') + 1);
	}

	// Remove useless `entry` filename stack details
	lines = lines.filter(function (line) {
		return line.indexOf(' @ ') !== 0;
	});

	// 0 ~> filename; 1 ~> main err msg
	if (!lines[0] || !lines[1]) {
		return lines.join('\n');
	}

	// Cleans up verbose "module not found" messages for files and packages.
	if (lines[1].startsWith('Module not found: ')) {
		lines = [lines[0], lines[1] // "Module not found: " is enough detail
		.replace("Cannot resolve 'file' or 'directory' ", '').replace('Cannot resolve module ', '').replace('Error: ', '').replace('[CaseSensitivePathsPlugin] ', '')];
	}

	// Cleans up syntax error messages.
	if (lines[1].startsWith('Module build failed: ')) {
		lines[1] = lines[1].replace('Module build failed: SyntaxError:', errorLabel);
	}

	if (lines[1].match(exportRegex)) {
		lines[1] = lines[1].replace(exportRegex, "$1 '$4' does not contain an export named '$3'.");
	}

	// Reassemble & Strip internal tracing, except `webpack:` -- (create-react-app/pull/1050)
	return lines.join('\n').replace(stackRegex, '').trim();
}

function handleStderr(data) {
	console.log(data);

	var errObj = {};
	var startCapture = false;

	var lines = data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/);

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var line = _step.value;

			var trimmed = line.trim();

			if (!trimmed.length) {
				continue;
			}

			if (trimmed === 'Details:') {
				startCapture = true;
				continue;
			}

			if (startCapture) {
				var errArr = trimmed.split(/:\s(.+)/);
				errObj[errArr[0]] = errArr[1];

				if (errArr[0] === 'formatted') {
					startCapture = false;
				}
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	;

	if (Object.keys(errObj).length) {
		console.error(errObj);

		getErrLines(errObj.file, errObj.line, function (err, lines) {
			if (err) {
				console.error(err);
				return;
			}

			var title = errObj.formatted.replace(/\.$/, '') + '<code>' + ' in ' + slash(fileRelativePath(process.cwd(), errObj.file)) + ' on line ' + errObj.line + '</code>';

			var details = '<pre>' + lines + '</pre>';

			global.logger.log('error', title, details);
		});
	}

	// return errObj;
}

function getErrLines(filename, line, callback) {
	line = Math.max(parseInt(line, 10) - 1 || 0, 0);

	fs.readFile(filename, function (err, data) {
		if (err) {
			throw err;
		}

		var lines = data.toString('utf-8').split('\n');

		if (+line > lines.length) {
			return '';
		}

		var lineArr = [];
		var _lineArr = [];
		var minLine = Math.max(line - 2, 0);
		var maxLine = Math.min(line + 2, lines.length);

		for (var i = minLine; i <= maxLine; i++) {
			_lineArr[i] = lines[i];
		}

		// Remove extraneous indentation.
		var strippedLines = stripIndent(_lineArr.join('\n')).split('\n');

		for (var j = minLine; j <= maxLine; j++) {
			lineArr.push('<div class="line' + (line === j ? ' highlight' : '') + '">' + '<span class="line-number">' + (j + 1) + '</span>' + '<span class="line-content">' + strippedLines[j] + '</span>' + '</div>');
		}

		callback(null, lineArr.join('\n'));
	});
}

function handleFileAndLineErrors(message) {
	var fileAndLine = message.match(fileAndLineRegex);

	if (!fileAndLine) {
		return;
	}

	var file = fileAndLine[1];
	var line = fileAndLine[2];

	console.log(fileAndLine);

	getErrLines(file, line, function (err, lines) {
		if (err) {
			console.error(err);
			return;
		}

		var title = message.replace(/\.$/, '') + '<code>' + ' in ' + slash(fileRelativePath(process.cwd(), file)) + ' on line ' + line + '</code>';

		var details = '<pre>' + lines + '</pre>';

		global.logger.log('error', title, details);
	});
}

module.exports = function (stats) {
	var json = stats.toJson({}, true);

	json.errors.map(function (msg) {
		return handleFileAndLineErrors(msg);
	});

	var result = {
		errors: json.errors.map(function (msg) {
			return formatMessage(msg, true);
		}),
		warnings: json.warnings.map(function (msg) {
			return formatMessage(msg, false);
		})
	};

	// Only show syntax errors if we have them
	if (result.errors.some(isLikelyASyntaxError)) {
		result.errors = result.errors.filter(isLikelyASyntaxError);
	}

	// First error is usually it; others usually the same
	if (result.errors.length > 1) {
		result.errors.length = 1;
	}

	return result;
};

module.exports.formatMessage = formatMessage;

},{"../utils/pathHelpers":30,"fs":undefined,"strip-indent":undefined}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Main app component.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var Overlay = require('./Overlay');

var Sidebar = require('./Sidebar');

var Logs = require('./projects/Logs');

var Settings = require('./projects/Settings');

var Projects = require('./projects/Projects');

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App(props) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.views = {
			files: 'Files',
			logs: 'Logs',
			settings: 'Settings'
		};
		return _this;
	}

	_createClass(App, [{
		key: 'renderOverlay',
		value: function renderOverlay() {
			global.ui.overlay(this.props.view !== 'files');

			if (this.props.view === 'files') {
				return '';
			} else {
				var content = void 0;

				if (this.props.view === 'logs') {
					content = React.createElement(Logs, null);
				} else {
					content = React.createElement(Settings, null);
				}

				return React.createElement(
					Overlay,
					{ hasClose: false },
					content
				);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'app' },
				React.createElement(Sidebar, { items: this.views }),
				React.createElement(
					'div',
					{ id: 'content-wrap' },
					React.createElement(Projects, null)
				),
				this.renderOverlay()
			);
		}
	}]);

	return App;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		view: state.view,
		projects: state.projects
	};
};

module.exports = connect(mapStateToProps, null)(App);

},{"./Overlay":7,"./Sidebar":8,"./projects/Logs":13,"./projects/Projects":16,"./projects/Settings":17,"react":undefined,"react-redux":undefined}],6:[function(require,module,exports){
'use strict';

/**
 * @file Component for empty screen/no content.
 */

var React = require('react');

module.exports = function (props) {
	return React.createElement(
		'div',
		{ className: 'no-content' + (props.className ? ' ' + props.className : '') },
		React.createElement(
			'div',
			{ className: 'inner' },
			props.children
		)
	);
};

},{"react":undefined}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for an overlay.
 */

var React = require('react');

var Overlay = function (_React$Component) {
	_inherits(Overlay, _React$Component);

	function Overlay() {
		_classCallCheck(this, Overlay);

		return _possibleConstructorReturn(this, (Overlay.__proto__ || Object.getPrototypeOf(Overlay)).apply(this, arguments));
	}

	_createClass(Overlay, [{
		key: 'render',

		// constructor() {}

		value: function render() {
			return React.createElement(
				'div',
				{ id: 'overlay' },
				this.props.hasClose && React.createElement(
					'a',
					{ href: '#', id: 'close-overlay' },
					'\xD7'
				),
				React.createElement(
					'div',
					{ id: 'overlay-content' },
					this.props.children
				)
			);
		}
	}]);

	return Overlay;
}(React.Component);

module.exports = Overlay;

},{"react":undefined}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file App sidebar.
 */

var React = require('react');

var _require = require('../actions'),
    _changeView = _require.changeView;

var _require2 = require('react-redux'),
    connect = _require2.connect;

var Sidebar = function (_React$Component) {
	_inherits(Sidebar, _React$Component);

	function Sidebar(props) {
		_classCallCheck(this, Sidebar);

		var _this = _possibleConstructorReturn(this, (Sidebar.__proto__ || Object.getPrototypeOf(Sidebar)).call(this, props));

		_this.onClick = _this.onClick.bind(_this);
		return _this;
	}

	_createClass(Sidebar, [{
		key: 'onClick',
		value: function onClick(event) {
			event.persist();

			var view = event.currentTarget.dataset.view;

			this.props.changeView(view);
		}
	}, {
		key: 'renderItems',
		value: function renderItems() {
			var items = [];

			for (var id in this.props.items) {
				items.push(React.createElement(
					'li',
					{
						key: id,
						'data-view': id,
						'data-tip': this.props.items[id],
						className: this.props.active === id ? 'active' : '',
						onClick: this.onClick
					},
					React.createElement('span', { className: 'icon' })
				));
			}

			return items;
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'nav',
				{ id: 'sidebar' },
				React.createElement(
					'ul',
					{ id: 'menu' },
					this.renderItems()
				)
			);
		}
	}]);

	return Sidebar;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		active: state.view
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		changeView: function changeView(view) {
			return dispatch(_changeView(view));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(Sidebar);

},{"../actions":1,"react":undefined,"react-redux":undefined}],9:[function(require,module,exports){
'use strict';

/**
 * @file Component for wrapping a field.
 */

var React = require('react');

function Field(props) {
	var className = 'field field-' + props.type + ' label-' + (props.labelPos ? props.labelPos : 'top');

	return React.createElement(
		'div',
		{ className: className },
		props.label && React.createElement(
			'strong',
			{ className: 'field-label' },
			props.label
		),
		React.createElement(
			'div',
			{ className: 'field-cont' },
			props.children
		)
	);
}

module.exports = Field;

},{"react":undefined}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for a save file field.
 */

var dialog = require('electron').remote.dialog;

var _require = require('../../utils/pathHelpers'),
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath,
    fileAbsolutePath = _require.fileAbsolutePath;

var React = require('react');

var PropTypes = require('prop-types');

var Field = require('./Field');

var FieldSaveFile = function (_React$Component) {
	_inherits(FieldSaveFile, _React$Component);

	function FieldSaveFile(props) {
		_classCallCheck(this, FieldSaveFile);

		var _this = _possibleConstructorReturn(this, (FieldSaveFile.__proto__ || Object.getPrototypeOf(FieldSaveFile)).call(this, props));

		_this.state = {
			path: _this.props.value
		};

		_this.onClick = _this.onClick.bind(_this);
		return _this;
	}

	_createClass(FieldSaveFile, [{
		key: 'onClick',
		value: function onClick(event) {
			event.persist();
			event.preventDefault();

			var fileSaveOptions = {};

			if (this.props.dialogTitle) {
				fileSaveOptions.title = this.props.dialogTitle;
			}

			if (!this.state.path && this.props.sourceFile) {
				fileSaveOptions.defaultPath = this.props.sourceFile.path;
			} else if (this.state.path && this.props.sourceBase) {
				fileSaveOptions.defaultPath = fileAbsolutePath(this.props.sourceBase, this.state.path);
			}

			if (this.props.dialogFilters) {
				fileSaveOptions.filters = this.props.dialogFilters;
			}

			var filename = dialog.showSaveDialog(fileSaveOptions);

			if (filename) {
				var savePath = slash(filename);

				if (this.props.sourceBase) {
					savePath = slash(fileRelativePath(this.props.sourceBase, filename));
				}

				this.setState({ path: savePath }, function () {
					if (this.props.onChange) {
						this.props.onChange(event, savePath);
					}
				});
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				Field,
				{ type: 'save-file', label: this.props.label, labelPos: this.props.labelPos },
				React.createElement('input', {
					type: 'hidden',
					name: this.props.name,
					id: 'field_' + this.props.name,
					value: this.state.path,
					readOnly: 'true'
				}),
				React.createElement(
					'small',
					{ onClick: this.onClick },
					this.state.path
				)
			);
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps, prevState) {
			var path = nextProps.value === null ? '' : nextProps.value;

			return { path: path };
		}
	}]);

	return FieldSaveFile;
}(React.Component);

FieldSaveFile.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.string,
	sourceFile: PropTypes.object,
	dialogTitle: PropTypes.string,
	dialogFilters: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	disabled: PropTypes.bool
};

module.exports = FieldSaveFile;

},{"../../utils/pathHelpers":30,"./Field":9,"electron":undefined,"prop-types":undefined,"react":undefined}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for a dropdown select.
 */

var React = require('react');

var PropTypes = require('prop-types');

var Field = require('./Field');

var FieldSelect = function (_React$Component) {
	_inherits(FieldSelect, _React$Component);

	function FieldSelect(props) {
		_classCallCheck(this, FieldSelect);

		var _this = _possibleConstructorReturn(this, (FieldSelect.__proto__ || Object.getPrototypeOf(FieldSelect)).call(this, props));

		_this.state = {
			selected: _this.props.value
		};

		_this.onChange = _this.onChange.bind(_this);
		return _this;
	}

	_createClass(FieldSelect, [{
		key: 'onChange',
		value: function onChange(event) {
			event.persist();

			this.setState(function (prevState) {
				return { selected: event.target.value };
			}, function () {
				if (this.props.onChange) {
					this.props.onChange(event, this.state.selected);
				}
			});
		}
	}, {
		key: 'getOptions',
		value: function getOptions() {
			var options = [];

			for (var value in this.props.options) {
				options.push(React.createElement(
					'option',
					{ key: value, value: value },
					this.props.options[value]
				));
			}

			return options;
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				Field,
				{ type: 'select', label: this.props.label, labelPos: this.props.labelPos },
				React.createElement(
					'label',
					{
						htmlFor: 'field_' + this.props.name
					},
					this.state.selected ? this.props.options[this.state.selected] : ''
				),
				React.createElement(
					'select',
					{
						name: this.props.name,
						onChange: this.onChange,
						value: this.state.selected,
						disabled: this.props.disabled,
						id: 'field_' + this.props.name
					},
					this.getOptions()
				)
			);
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps, prevState) {
			var selected = nextProps.value === null ? false : nextProps.value;

			return { selected: selected };
		}
	}]);

	return FieldSelect;
}(React.Component);

FieldSelect.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	options: PropTypes.object.isRequired,
	disabled: PropTypes.bool
};

module.exports = FieldSelect;

},{"./Field":9,"prop-types":undefined,"react":undefined}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for a toggle switch.
 */

var React = require('react');

var PropTypes = require('prop-types');

var Field = require('./Field');

var FieldSwitch = function (_React$Component) {
	_inherits(FieldSwitch, _React$Component);

	function FieldSwitch(props) {
		_classCallCheck(this, FieldSwitch);

		var _this = _possibleConstructorReturn(this, (FieldSwitch.__proto__ || Object.getPrototypeOf(FieldSwitch)).call(this, props));

		_this.state = {
			checked: _this.props.value
		};

		_this.onChange = _this.onChange.bind(_this);
		return _this;
	}

	_createClass(FieldSwitch, [{
		key: 'onChange',
		value: function onChange(event) {
			event.persist();

			this.setState(function (prevState) {
				return { checked: !prevState.checked };
			}, function () {
				if (this.props.onChange) {
					this.props.onChange(event, this.state.checked);
				}
			});
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				Field,
				{ type: 'switch', label: this.props.label, labelPos: this.props.labelPos },
				React.createElement('input', {
					type: 'checkbox',
					name: this.props.name,
					onChange: this.onChange,
					checked: this.state.checked,
					disabled: this.props.disabled,
					id: 'field_' + this.props.name
				}),
				React.createElement(
					'label',
					{ htmlFor: 'field_' + this.props.name },
					this.props.label
				)
			);
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps, prevState) {
			var checked = nextProps.value === null ? false : nextProps.value;

			return { checked: checked };
		}
	}]);

	return FieldSwitch;
}(React.Component);

FieldSwitch.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelPos: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.bool,
	disabled: PropTypes.bool
};

module.exports = FieldSwitch;

},{"./Field":9,"prop-types":undefined,"react":undefined}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying logs and information.
 */

var React = require('react');

var NoContent = require('../NoContent');

var Logs = function (_React$Component) {
	_inherits(Logs, _React$Component);

	function Logs(props) {
		_classCallCheck(this, Logs);

		var _this = _possibleConstructorReturn(this, (Logs.__proto__ || Object.getPrototypeOf(Logs)).call(this, props));

		var type = null;
		var logs = global.logger ? global.logger.get(type) : [];

		_this.state = {
			type: type,
			logs: logs
		};

		_this.refresh = _this.refresh.bind(_this);

		document.addEventListener('bd/refresh/logs', _this.refresh);
		return _this;
	}

	_createClass(Logs, [{
		key: 'refresh',
		value: function refresh() {
			this.setState({ logs: global.logger.get(this.state.type) });
		}
	}, {
		key: 'renderChildren',
		value: function renderChildren() {
			var logIndex = 0;
			var logList = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.state.logs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var log = _step.value;

					var titleHTML = { __html: log.title };
					var bodyHTML = log.body ? { __html: log.body } : null;

					logList.push(React.createElement(
						'li',
						{
							key: logIndex,
							className: 'type-' + log.type
						},
						React.createElement(
							'div',
							{ className: 'title' },
							React.createElement(
								'small',
								null,
								log.time
							),
							React.createElement('span', { className: 'title-text', dangerouslySetInnerHTML: titleHTML })
						),
						bodyHTML && React.createElement('div', { className: 'details', dangerouslySetInnerHTML: bodyHTML })
					));
					logIndex++;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return React.createElement(
				'ul',
				null,
				logList
			);
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.state.logs.length) {
				return React.createElement(
					NoContent,
					{ className: 'logs-screen empty' },
					React.createElement(
						'h3',
						null,
						'No logs yet.'
					),
					React.createElement(
						'p',
						null,
						'Go forth and compile!'
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'logs', className: 'logs-screen' },
				this.renderChildren()
			);
		}
	}]);

	return Logs;
}(React.Component);

module.exports = Logs;

},{"../NoContent":6,"react":undefined}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects panel.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var FileOptionsScript = require('./fileoptions/FileOptionsScript');

var FileOptionsStyle = require('./fileoptions/FileOptionsStyle');

var NoContent = require('../NoContent');

var Panel = function (_React$Component) {
	_inherits(Panel, _React$Component);

	function Panel() {
		_classCallCheck(this, Panel);

		return _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
	}

	_createClass(Panel, [{
		key: 'getOptions',
		value: function getOptions() {
			if (!this.props.activeFile.file.extension) {
				return null;
			}

			switch (this.props.activeFile.file.extension) {
				case '.css':
				case '.scss':
				case '.sass':
				case '.less':
					return React.createElement(FileOptionsStyle, { base: this.props.project.path, file: this.props.activeFile.file });
				case '.js':
				case '.ts':
				case '.jsx':
					return React.createElement(FileOptionsScript, { base: this.props.project.path, file: this.props.activeFile.file });
				default:
					return null;
			}
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			if (this.props.activeFile) {
				var options = this.getOptions();

				if (options) {
					this.props.activeFile.element.classList.add('has-options');

					return options;
				}
			}

			return React.createElement(
				NoContent,
				null,
				React.createElement(
					'p',
					null,
					'Select a stylesheet or script file to view compiling options.'
				)
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'panel' },
				this.renderContent()
			);
		}
	}]);

	return Panel;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		activeFile: state.activeFile,
		project: state.activeProject,
		files: state.activeProjectFiles
	};
};

module.exports = connect(mapStateToProps, null)(Panel);

},{"../NoContent":6,"./fileoptions/FileOptionsScript":22,"./fileoptions/FileOptionsStyle":23,"react":undefined,"react-redux":undefined}],15:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the project selector.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var _require2 = require('../../actions'),
    _setProjectState = _require2.setProjectState,
    _refreshActiveProject = _require2.refreshActiveProject;

var _require3 = require('../../utils/utils'),
    setProjectConfig = _require3.setProjectConfig;

var ProjectSelect = function (_React$Component) {
	_inherits(ProjectSelect, _React$Component);

	function ProjectSelect(props) {
		_classCallCheck(this, ProjectSelect);

		var _this = _possibleConstructorReturn(this, (ProjectSelect.__proto__ || Object.getPrototypeOf(ProjectSelect)).call(this, props));

		_this.state = {
			isOpen: false
		};

		_this.toggleSelect = _this.toggleSelect.bind(_this);
		_this.selectProject = _this.selectProject.bind(_this);
		_this.toggleProject = _this.toggleProject.bind(_this);
		return _this;
	}

	_createClass(ProjectSelect, [{
		key: 'toggleSelect',
		value: function toggleSelect() {
			global.ui.unfocus(!this.state.isOpen);

			this.setState({ isOpen: !this.state.isOpen });
		}
	}, {
		key: 'toggleProject',
		value: function toggleProject() {
			var paused = !this.props.active.paused || false;

			this.props.setProjectState({ paused: paused });

			this.props.refreshActiveProject(_extends({}, this.props.active, {
				paused: paused
			}));

			setProjectConfig('paused', paused);
		}
	}, {
		key: 'selectProject',
		value: function selectProject(event) {
			event.persist();
			var index = event.currentTarget.dataset.project;

			this.toggleSelect();

			if (index === 'new') {
				this.props.newProject();
			} else {
				this.props.changeProject(index);
			}
		}
	}, {
		key: 'renderChoices',
		value: function renderChoices() {
			var choices = [];

			for (var index in this.props.projects) {
				choices.push(React.createElement(
					'div',
					{ key: index, 'data-project': index, onClick: this.selectProject },
					this.props.projects[index].name
				));
			}

			choices.push(React.createElement(
				'div',
				{ key: 'new', 'data-project': 'new', onClick: this.selectProject },
				'Add new project'
			));

			return choices;
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.props.active.name || !this.props.active.path) {
				return React.createElement(
					'div',
					{ id: 'project-select' },
					React.createElement(
						'div',
						{ id: 'project-active', onClick: this.toggleSelect },
						React.createElement(
							'h1',
							null,
							'No Project Selected'
						),
						React.createElement(
							'h2',
							null,
							'Click here to select one...'
						)
					),
					React.createElement(
						'div',
						{ id: 'project-select-dropdown', className: this.state.isOpen ? 'open' : '' },
						this.renderChoices()
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'project-select', className: 'selected' },
				React.createElement(
					'div',
					{ id: 'project-active', onClick: this.toggleSelect },
					React.createElement(
						'h1',
						null,
						this.props.active.name
					),
					React.createElement(
						'h2',
						null,
						this.props.active.path
					)
				),
				React.createElement(
					'div',
					{ id: 'project-actions' },
					React.createElement('a', { href: '#', className: 'toggle' + (this.props.active.paused ? ' paused' : ' active'), onClick: this.toggleProject }),
					React.createElement('a', { href: '#', className: 'refresh', onClick: this.props.refreshProject }),
					React.createElement('a', { href: '#', className: 'remove', onClick: this.props.removeProject })
				),
				React.createElement(
					'div',
					{ id: 'project-select-dropdown', className: this.state.isOpen ? 'open' : '' },
					this.renderChoices()
				)
			);
		}
	}]);

	return ProjectSelect;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		projects: state.projects,
		active: state.activeProject
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		setProjectState: function setProjectState(state) {
			return dispatch(_setProjectState(state));
		},
		refreshActiveProject: function refreshActiveProject(project) {
			return dispatch(_refreshActiveProject(project));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectSelect);

},{"../../actions":1,"../../utils/utils":31,"react":undefined,"react-redux":undefined}],16:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects view.
 */

var fs = require('fs');

var fspath = require('path');

var _debounce = require('lodash/debounce');

var dialog = require('electron').remote.dialog;

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var Store = require('electron-store');

var NoContent = require('../NoContent');

var Notice = require('../ui/Notice');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('./filelist/FileList');

var Panel = require('./Panel');

var directoryTree = require('../../utils/directoryTree');

var Logger = require('../../utils/Logger');

var _require2 = require('../../actions'),
    _addProject = _require2.addProject,
    _removeProject = _require2.removeProject,
    _changeProject = _require2.changeProject,
    receiveFiles = _require2.receiveFiles,
    _setActiveFile = _require2.setActiveFile;

var Projects = function (_React$Component) {
	_inherits(Projects, _React$Component);

	function Projects(props) {
		_classCallCheck(this, Projects);

		var _this = _possibleConstructorReturn(this, (Projects.__proto__ || Object.getPrototypeOf(Projects)).call(this, props));

		_this.state = {
			ignored: ['.git', 'node_modules', '.DS_Store', 'buildr-project.json'],
			loading: false
		};

		_this.newProject = _this.newProject.bind(_this);
		_this.initProject = _this.initProject.bind(_this);
		_this.changeProject = _this.changeProject.bind(_this);
		_this.removeProject = _this.removeProject.bind(_this);
		_this.refreshProject = _this.refreshProject.bind(_this);

		_this.initCompiler = _this.initCompiler.bind(_this);

		document.addEventListener('bd/refresh/files', _this.refreshProject);
		return _this;
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (this.props.active.path) {
				this.initProject(this.props.active.path);
			}
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps, prevState) {
			if (prevProps.active.path === this.props.active.path && prevProps.active.paused !== this.props.active.paused) {
				// Project was paused/unpaused, trigger compiler tasks or terminate them.
				this.initCompiler();
			}
		}

		// Add a new project.

	}, {
		key: 'newProject',
		value: function newProject() {
			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				var newProject = {
					name: fspath.basename(path[0]),
					path: path[0],
					paused: false
				};
				var newProjectIndex = this.props.projects.length;

				if (this.props.projects.findIndex(function (project) {
					return project.path === newProject.path;
				}) !== -1) {
					// Project already exists.
					return;
				}

				// Save new project to config.
				global.config.set('projects', [].concat(_toConsumableArray(this.props.projects), [newProject]));

				// Update state.
				this.props.addProject(newProject);

				// Set new project as active.
				this.changeProject(newProjectIndex, newProject);
			}
		}

		// Change the active project.

	}, {
		key: 'changeProject',
		value: function changeProject(id) {
			var project = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (id === this.props.active.id) {
				return;
			}

			var active = {
				name: '',
				path: '',
				paused: true
			};

			if (project) {
				active = project;
			} else if (this.props.projects[id]) {
				active = this.props.projects[id];
			}

			// Update config.
			global.config.set('active-project', id);

			// Update state.
			this.props.changeProject(_extends({}, active, {
				id: id
			}));
			this.props.setActiveFile(null);

			// Init.
			this.initProject(active.path);
		}

		// Remove the current project.

	}, {
		key: 'removeProject',
		value: function removeProject(event) {
			event.preventDefault();

			var confirmRemove = window.confirm('Are you sure you want to remove ' + this.props.active.name + '?');

			if (confirmRemove) {
				var removeIndex = parseInt(this.props.active.id, 10);

				var projects = this.props.projects.filter(function (project, index) {
					return index !== removeIndex;
				});

				// Remove project from config.
				global.config.set('projects', projects);

				// Update state.
				this.props.removeProject(removeIndex);

				// Unset active project.
				this.changeProject(null);
			}
		}

		// Start the background compiler tasks.

	}, {
		key: 'initCompiler',
		value: function initCompiler() {
			if (!this.props.active.paused) {
				global.compiler.initProject();
			} else {
				global.compiler.killTasks();
			}
		}

		// Refresh the project files.

	}, {
		key: 'refreshProject',
		value: function refreshProject() {
			this.getFiles(this.props.active.path);
		}

		// Create or fetch the project config file.

	}, {
		key: 'setProjectConfigFile',
		value: function setProjectConfigFile(path) {
			global.projectConfig = new Store({
				name: 'buildr-project',
				cwd: path
			});

			// Listen for changes to the project's file options and trigger the compiler init.
			global.projectConfig.onDidChange('files', _debounce(this.initCompiler, 100));
		}

		// Read the files in the project directory.

	}, {
		key: 'getFiles',
		value: function getFiles(path) {
			this.setState({ loading: true });

			global.ui.loading();

			var exclude = new RegExp(this.state.ignored.join('|'), 'i');

			directoryTree(path, {
				// depth: 2,
				exclude: exclude
			}).then(function (files) {
				this.setState({
					loading: false
				}, function () {
					global.store.dispatch(receiveFiles(files));
				});

				global.ui.loading(false);
			}.bind(this));
		}

		// Initialize project.

	}, {
		key: 'initProject',
		value: function initProject(path) {
			fs.access(path, fs.constants.W_OK, function (err) {
				if (err) {
					// Chosen directory not readable or no path provided.
					if (path) {
						window.alert('Could not read the ' + path + ' directory.');
					}

					global.projectConfig = null;

					global.store.dispatch(receiveFiles({}));

					global.compiler.killTasks();
				} else {
					// Directory is readable, get files and setup config.
					this.getFiles(path);

					this.setProjectConfigFile(path);

					// Change process cwd.
					process.chdir(path);

					this.initCompiler();
				}
			}.bind(this));

			global.logger = new Logger();
		}
	}, {
		key: 'renderProjectSelect',
		value: function renderProjectSelect() {
			return React.createElement(ProjectSelect, {
				newProject: this.newProject,
				changeProject: this.changeProject,
				removeProject: this.removeProject,
				refreshProject: this.refreshProject
			});
		}
	}, {
		key: 'renderNotices',
		value: function renderNotices() {
			var notices = [];

			if (this.props.active.paused) {
				notices.push(React.createElement(
					Notice,
					{ key: 'paused', type: 'warning' },
					React.createElement(
						'p',
						null,
						'Project is paused. Files will not be watched and auto compiled.'
					)
				));
			}

			return notices;
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.props.projects || this.props.projects.length === 0) {
				// No projects yet, show welcome screen.
				return React.createElement(
					NoContent,
					{ className: 'welcome-screen' },
					React.createElement(
						'h3',
						null,
						'You don\'t have any projects yet.'
					),
					React.createElement(
						'p',
						null,
						'Would you like to add one now?'
					),
					React.createElement(
						'button',
						{ className: 'large flat add-new-project', onClick: this.newProject },
						'Add Project'
					)
				);
			} else if (!this.props.active.name || !this.props.active.path) {
				// No project selected, show selector.
				return React.createElement(
					NoContent,
					{ className: 'project-select-screen' },
					this.renderProjectSelect()
				);
			}

			return React.createElement(
				'div',
				{ id: 'projects' },
				React.createElement(
					'div',
					{ id: 'header' },
					this.renderProjectSelect()
				),
				React.createElement(
					'div',
					{ id: 'content' },
					this.renderNotices(),
					React.createElement(FileList, {
						path: this.props.active.path,
						files: this.props.files,
						loading: this.state.loading
					})
				),
				React.createElement(Panel, null)
			);
		}
	}]);

	return Projects;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		projects: state.projects,
		active: state.activeProject,
		files: state.activeProjectFiles
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		addProject: function addProject(project) {
			return dispatch(_addProject(project));
		},
		changeProject: function changeProject(id) {
			return dispatch(_changeProject(id));
		},
		removeProject: function removeProject(id) {
			return dispatch(_removeProject(id));
		},
		setActiveFile: function setActiveFile(file) {
			return dispatch(_setActiveFile(file));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(Projects);

},{"../../actions":1,"../../utils/Logger":27,"../../utils/directoryTree":28,"../NoContent":6,"../ui/Notice":24,"./Panel":14,"./ProjectSelect":15,"./filelist/FileList":18,"electron":undefined,"electron-store":undefined,"fs":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying the settings.
 */

var React = require('react');

var NoContent = require('../NoContent');

var Settings = function (_React$Component) {
	_inherits(Settings, _React$Component);

	function Settings() {
		_classCallCheck(this, Settings);

		return _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).apply(this, arguments));
	}

	_createClass(Settings, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				NoContent,
				{ className: 'settings-screen' },
				React.createElement(
					'h3',
					null,
					'Settings'
				),
				React.createElement(
					'p',
					null,
					'Coming soon!'
				)
			);
		}
	}]);

	return Settings;
}(React.Component);

module.exports = Settings;

},{"../NoContent":6,"react":undefined}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var FileListFile = require('./FileListFile');

var FileListDirectory = require('./FileListDirectory');

var NoContent = require('../../NoContent');

var _require2 = require('../../../actions'),
    _setActiveFile = _require2.setActiveFile;

var FileList = function (_React$Component) {
	_inherits(FileList, _React$Component);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

		_this.setActiveFile = _this.setActiveFile.bind(_this);
		return _this;
	}

	_createClass(FileList, [{
		key: 'getMimeType',
		value: function getMimeType(ext) {
			var type = void 0;

			switch (ext) {
				case '.svg':
				case '.png':
				case '.jpg':
					type = 'media';
					break;

				case '.php':
				case '.html':
				case '.css':
				case '.scss':
				case '.sass':
				case '.less':
				case '.js':
				case '.ts':
				case '.jsx':
				case '.json':
					type = 'code';
					break;

				case '.zip':
				case '.rar':
				case '.tar':
				case '.7z':
				case '.gz':
					type = 'zip';
					break;

				default:
					type = 'text';
					break;
			}

			return type;
		}
	}, {
		key: 'setActiveFile',
		value: function setActiveFile(fileProps) {
			if (this.props.activeFile && this.props.activeFile.element === fileProps.element) {
				return;
			}

			if (fileProps.element) {
				fileProps.element.classList.add('active');
			}

			if (this.props.activeFile) {
				this.props.activeFile.element.classList.remove('active', 'has-options');
			}

			this.props.setActiveFile(fileProps);
		}
	}, {
		key: 'buildTree',
		value: function buildTree(file) {
			var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			var type = file.type;
			var ext = file.extension || null;
			var children = void 0;

			if (file.type === 'directory') {
				if (file.children.length > 0) {
					var childrenItems = [];

					for (var child in file.children) {
						childrenItems.push(this.buildTree(file.children[child], level + 1));
					}

					children = React.createElement(
						'ul',
						{ className: 'children', key: file.path + '-children' },
						childrenItems
					);
				}

				return React.createElement(FileListDirectory, {
					key: file.path,
					file: file,
					level: level,
					children: children
				});
			} else {
				type = this.getMimeType(ext);

				return React.createElement(FileListFile, {
					key: file.path,
					file: file,
					type: type,
					level: level,
					base: this.props.path,
					setActiveFile: this.setActiveFile
				});
			}
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.props.loading) {
				return React.createElement(
					NoContent,
					{ className: 'loading' },
					React.createElement(
						'p',
						null,
						'Loading\u2026'
					)
				);
			} else if (!this.props.path) {
				return React.createElement(
					NoContent,
					{ className: 'empty' },
					React.createElement(
						'p',
						null,
						'No project folder selected.'
					)
				);
			} else if (!this.props.files || !Object.keys(this.props.files).length) {
				return React.createElement(
					NoContent,
					{ className: 'empty' },
					React.createElement(
						'p',
						null,
						'Nothing to see here.'
					)
				);
			}

			var filelist = [];

			if (this.props.files.children && this.props.files.children.length > 0) {
				// Show only the contents of the top-level directory.
				for (var child in this.props.files.children) {
					filelist.push(this.buildTree(this.props.files.children[child]));
				}
			} else {
				filelist.push(this.buildTree(this.props.files));
			}

			return React.createElement(
				'ul',
				{ id: 'files' },
				filelist
			);
		}
	}]);

	return FileList;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		activeFile: state.activeFile
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		setActiveFile: function setActiveFile(payload) {
			return dispatch(_setActiveFile(payload));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(FileList);

},{"../../../actions":1,"../../NoContent":6,"./FileListDirectory":19,"./FileListFile":20,"react":undefined,"react-redux":undefined}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var React = require('react');

var FileListDirectory = function (_React$Component) {
	_inherits(FileListDirectory, _React$Component);

	function FileListDirectory(props) {
		_classCallCheck(this, FileListDirectory);

		var _this = _possibleConstructorReturn(this, (FileListDirectory.__proto__ || Object.getPrototypeOf(FileListDirectory)).call(this, props));

		_this.state = {
			expanded: false
		};

		_this.onClick = _this.onClick.bind(_this);
		return _this;
	}

	_createClass(FileListDirectory, [{
		key: 'renderChildren',
		value: function renderChildren() {
			if (!this.state.expanded) {
				return null;
			}

			return this.props.children;
		}
	}, {
		key: 'onClick',
		value: function onClick(event) {
			event.stopPropagation();

			this.setState(function (prevState) {
				return { expanded: !prevState.expanded };
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var className = 'directory';

			if (this.state.expanded) {
				className += ' expand';
			}

			return React.createElement(
				'li',
				{ className: className, onClick: this.onClick },
				React.createElement(
					'div',
					{ className: 'filename' },
					String.fromCharCode('0x2003').repeat(this.props.level),
					React.createElement('span', { className: 'icon' }),
					React.createElement(
						'strong',
						null,
						this.props.file.name
					)
				),
				this.renderChildren()
			);
		}
	}]);

	return FileListDirectory;
}(React.Component);

module.exports = FileListDirectory;

},{"react":undefined}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a file in the filelist.
 */

var _require = require('electron'),
    remote = _require.remote,
    shell = _require.shell;

var Menu = remote.Menu,
    MenuItem = remote.MenuItem;


var React = require('react');

var FileListFile = function (_React$Component) {
	_inherits(FileListFile, _React$Component);

	function FileListFile(props) {
		_classCallCheck(this, FileListFile);

		var _this = _possibleConstructorReturn(this, (FileListFile.__proto__ || Object.getPrototypeOf(FileListFile)).call(this, props));

		_this.onClick = _this.onClick.bind(_this);
		_this.onContextMenu = _this.onContextMenu.bind(_this);
		return _this;
	}

	_createClass(FileListFile, [{
		key: 'onClick',
		value: function onClick(event) {
			event.stopPropagation();

			this.props.setActiveFile({
				file: this.props.file,
				element: event.currentTarget
			});
		}
	}, {
		key: 'onContextMenu',
		value: function onContextMenu(event) {
			event.preventDefault();

			var filePath = this.props.file.path;

			var menu = new Menu();
			menu.append(new MenuItem({
				label: 'Open',
				click: function click() {
					shell.openItem(filePath);
				}
			}));
			menu.append(new MenuItem({
				label: 'Show in folder',
				click: function click() {
					shell.showItemInFolder(filePath);
				}
			}));
			menu.append(new MenuItem({
				type: 'separator'
			}));
			menu.append(new MenuItem({
				label: 'Delete',
				click: function () {
					if (window.confirm('Are you sure you want to delete ' + this.props.file.name + '?')) {
						if (shell.moveItemToTrash(filePath)) {
							/* global Event */
							document.dispatchEvent(new Event('bd/refresh/files'));
						} else {
							window.alert('Could not delete ' + this.props.file.name + '.');
						}
					}
				}.bind(this)
			}));

			menu.popup(remote.getCurrentWindow());
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'li',
				{
					className: this.props.type,
					onClick: this.onClick,
					onContextMenu: this.onContextMenu
				},
				React.createElement(
					'div',
					{ className: 'filename' },
					String.fromCharCode('0x2003').repeat(this.props.level),
					React.createElement('span', { className: 'icon' }),
					React.createElement(
						'strong',
						null,
						this.props.file.name
					)
				)
			);
		}
	}]);

	return FileListFile;
}(React.Component);

module.exports = FileListFile;

},{"electron":undefined,"react":undefined}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering build options for a file.
 */

var _require = require('../../../utils/pathHelpers'),
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath,
    fileAbsolutePath = _require.fileAbsolutePath,
    fileOutputPath = _require.fileOutputPath;

var React = require('react');

var FileOptions = function (_React$Component) {
	_inherits(FileOptions, _React$Component);

	function FileOptions(props) {
		_classCallCheck(this, FileOptions);

		var _this = _possibleConstructorReturn(this, (FileOptions.__proto__ || Object.getPrototypeOf(FileOptions)).call(this, props));

		_this.state = {
			loading: false
		};

		_this.handleChange = _this.handleChange.bind(_this);
		_this.handleCompile = _this.handleCompile.bind(_this);
		_this.setOutputPath = _this.setOutputPath.bind(_this);
		return _this;
	}

	_createClass(FileOptions, [{
		key: 'getConfig',
		value: function getConfig(property) {
			var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			var defaults = {
				path: fileRelativePath(this.props.base, this.props.file.path),
				output: this.defaultOutputPath(),
				options: {}
			};

			var stored = FileOptions.getFileFromConfig(this.props.base, this.props.file);

			var config = stored !== null ? stored : defaults;

			if (property) {
				return config[property] ? config[property] : defaultValue;
			} else {
				return config;
			}
		}
	}, {
		key: 'setConfig',
		value: function setConfig(property, value) {
			if (!global.projectConfig || !property) {
				window.alert('There was a problem saving the project configuration.');
				return;
			}

			var filePath = slash(fileRelativePath(this.props.base, this.props.file.path));

			var files = global.projectConfig.get('files', []);
			var fileIndex = files.findIndex(function (file) {
				return file.path === filePath;
			});

			if (fileIndex === -1) {
				var fileConfig = {
					path: filePath,
					type: this.state.fileType,
					output: fileRelativePath(this.props.base, this.defaultOutputPath())
				};

				if (typeof value !== 'undefined' && value !== null) {
					fileConfig[property] = value;
				}
				files.push(fileConfig);
			} else {
				if (typeof value !== 'undefined') {
					files[fileIndex][property] = value;
				} else if (value === null) {
					delete files[fileIndex][property];
				}
			}

			global.projectConfig.set('files', files);
		}
	}, {
		key: 'getOption',
		value: function getOption(option) {
			var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (this.state.options && this.state.options[option]) {
				return this.state.options[option];
			}

			return defaultValue;
		}
	}, {
		key: 'setOption',
		value: function setOption(option, value) {
			this.setState(function (prevState) {
				var options = prevState.options || {};
				options[option] = value;

				return { options: options };
			}, function () {
				this.setConfig('options', this.state.options);
			});
		}
	}, {
		key: 'handleChange',
		value: function handleChange(event, value) {
			this.setOption(event.target.name, value);
		}
	}, {
		key: 'defaultOutputPath',
		value: function defaultOutputPath() {
			return fileOutputPath(this.props.file, this.outputSuffix, this.outputExtension);
		}
	}, {
		key: 'setOutputPath',
		value: function setOutputPath(event, path) {
			this.setConfig('output', path);
		}
	}, {
		key: 'getOutputPath',
		value: function getOutputPath() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'relative';

			var slashPath = type === 'display';
			var relativePath = type === 'relative' || type === 'display';
			var defaultPath = this.defaultOutputPath();
			var outputPath = this.getConfig('output', defaultPath);

			if (relativePath) {
				outputPath = fileRelativePath(this.props.base, outputPath);
			} else {
				outputPath = fileAbsolutePath(this.props.base, outputPath);
			}

			if (slashPath) {
				outputPath = slash(outputPath);
			}

			return outputPath;
		}
	}, {
		key: 'handleCompile',
		value: function handleCompile() {
			this.setState({ loading: true });

			global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, function (code) {
				this.setState({ loading: false });
			}.bind(this));
		}
	}, {
		key: 'renderHeader',
		value: function renderHeader() {
			return React.createElement(
				'div',
				{ className: 'header' },
				React.createElement(
					'strong',
					null,
					this.props.file.name
				)
			);
		}
	}, {
		key: 'renderFooter',
		value: function renderFooter() {
			return React.createElement(
				'div',
				{ className: 'footer' },
				React.createElement(
					'button',
					{
						className: 'compile green',
						onClick: this.handleCompile,
						disabled: this.state.loading
					},
					this.state.loading ? 'Compiling...' : 'Compile'
				)
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps) {
			var compileOptions = global.compiler.getFileOptions(nextProps.file);

			return {
				type: compileOptions.type,
				fileType: compileOptions.fileType,
				buildTaskName: compileOptions.buildTaskName,
				options: FileOptions.getOptionsFromConfig(nextProps.base, nextProps.file)
			};
		}
	}, {
		key: 'getOptionsFromConfig',
		value: function getOptionsFromConfig(base, file) {
			var cfile = FileOptions.getFileFromConfig(base, file);

			return cfile && cfile.options ? cfile.options : {};
		}
	}, {
		key: 'getFileFromConfig',
		value: function getFileFromConfig(base, file) {
			if (file && global.projectConfig) {
				var filePath = slash(fileRelativePath(base, file.path));

				var files = global.projectConfig.get('files', []);
				var cfile = files.find(function (cfile) {
					return cfile.path === filePath;
				});

				if (cfile) {
					return cfile;
				}
			}

			return null;
		}
	}]);

	return FileOptions;
}(React.Component);

module.exports = FileOptions;

},{"../../../utils/pathHelpers":30,"react":undefined}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying file options for a script.
 */

var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('../../fields/FieldSwitch');

var FieldSaveFile = require('../../fields/FieldSaveFile');

var FileOptionsScript = function (_FileOptions) {
	_inherits(FileOptionsScript, _FileOptions);

	function FileOptionsScript(props) {
		_classCallCheck(this, FileOptionsScript);

		var _this = _possibleConstructorReturn(this, (FileOptionsScript.__proto__ || Object.getPrototypeOf(FileOptionsScript)).call(this, props));

		_this.outputSuffix = '-dist';
		_this.outputExtension = '.js';
		_this.saveDialogFilters = [{ name: 'JavaScript', extensions: ['js'] }];
		return _this;
	}

	_createClass(FileOptionsScript, [{
		key: 'sourceMapsDisabled',
		value: function sourceMapsDisabled() {
			return !this.state.options || !this.state.options.bundle && !this.state.options.babel;
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'file-options', className: 'file-options-script' },
				this.renderHeader(),
				React.createElement(
					'div',
					{ className: 'body' },
					React.createElement(FieldSaveFile, {
						name: 'output',
						label: 'Output Path',
						onChange: this.setOutputPath,
						value: this.getOutputPath('display'),
						sourceFile: this.props.file,
						sourceBase: this.props.base,
						dialogFilters: this.saveDialogFilters
					}),
					React.createElement('hr', null),
					React.createElement(FieldSwitch, {
						name: 'autocompile',
						label: 'Auto Compile',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('autocompile', false)
					}),
					React.createElement('hr', null),
					React.createElement(FieldSwitch, {
						name: 'bundle',
						label: 'Bundle',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('bundle', false)
					}),
					React.createElement(FieldSwitch, {
						name: 'babel',
						label: 'Babel',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('babel', false)
					}),
					React.createElement(FieldSwitch, {
						name: 'compress',
						label: 'Compress',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('compress', false)
					}),
					React.createElement(FieldSwitch, {
						name: 'sourcemaps',
						label: 'Sourcemaps',
						labelPos: 'left',
						disabled: this.sourceMapsDisabled(),
						onChange: this.handleChange,
						value: this.getOption('sourcemaps', false)
					})
				),
				this.renderFooter()
			);
		}
	}]);

	return FileOptionsScript;
}(FileOptions);

module.exports = FileOptionsScript;

},{"../../fields/FieldSaveFile":10,"../../fields/FieldSwitch":12,"./FileOptions":21,"react":undefined}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying file options for a stylesheet.
 */

var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('../../fields/FieldSwitch');

var FieldSelect = require('../../fields/FieldSelect');

var FieldSaveFile = require('../../fields/FieldSaveFile');

var NoContent = require('../../NoContent');

var FileOptionsStyles = function (_FileOptions) {
	_inherits(FileOptionsStyles, _FileOptions);

	function FileOptionsStyles(props) {
		_classCallCheck(this, FileOptionsStyles);

		var _this = _possibleConstructorReturn(this, (FileOptionsStyles.__proto__ || Object.getPrototypeOf(FileOptionsStyles)).call(this, props));

		_this.outputSuffix = '-dist';
		_this.outputExtension = '.css';
		_this.saveDialogFilters = [{ name: 'CSS', extensions: ['css'] }];
		return _this;
	}

	_createClass(FileOptionsStyles, [{
		key: 'isPartial',
		value: function isPartial() {
			return this.props.file.name.startsWith('_');
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isPartial()) {
				return React.createElement(
					NoContent,
					null,
					React.createElement(
						'p',
						null,
						'This is a partial file,',
						React.createElement('br', null),
						' it cannot be compiled on its own.'
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'file-options', className: 'file-options-style' },
				this.renderHeader(),
				React.createElement(
					'div',
					{ className: 'body' },
					React.createElement(FieldSaveFile, {
						name: 'output',
						label: 'Output Path',
						onChange: this.setOutputPath,
						value: this.getOutputPath('display'),
						sourceFile: this.props.file,
						sourceBase: this.props.base,
						dialogFilters: this.saveDialogFilters
					}),
					React.createElement('hr', null),
					React.createElement(FieldSwitch, {
						name: 'autocompile',
						label: 'Auto Compile',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('autocompile', false)
					}),
					React.createElement('hr', null),
					this.state.type === 'sass' && React.createElement(FieldSelect, {
						name: 'style',
						label: 'Output Style',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('style', 'nested'),
						options: {
							nested: 'Nested',
							compact: 'Compact',
							expanded: 'Expanded',
							compressed: 'Compressed'
						}
					}),
					React.createElement(FieldSwitch, {
						name: 'sourcemaps',
						label: 'Sourcemaps',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('sourcemaps', false)
					}),
					React.createElement(FieldSwitch, {
						name: 'autoprefixer',
						label: 'Autoprefixer',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('autoprefixer', false)
					})
				),
				this.renderFooter()
			);
		}
	}]);

	return FileOptionsStyles;
}(FileOptions);

module.exports = FileOptionsStyles;

},{"../../NoContent":6,"../../fields/FieldSaveFile":10,"../../fields/FieldSelect":11,"../../fields/FieldSwitch":12,"./FileOptions":21,"react":undefined}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for showing notices and alerts.
 */

var React = require('react');

var Notice = function (_React$Component) {
	_inherits(Notice, _React$Component);

	function Notice() {
		_classCallCheck(this, Notice);

		return _possibleConstructorReturn(this, (Notice.__proto__ || Object.getPrototypeOf(Notice)).apply(this, arguments));
	}

	_createClass(Notice, [{
		key: 'render',
		value: function render() {
			var type = this.props.type || 'info';

			return React.createElement(
				'div',
				{ className: 'notice type-' + type },
				this.props.children
			);
		}
	}]);

	return Notice;
}(React.Component);

module.exports = Notice;

},{"react":undefined}],25:[function(require,module,exports){
'use strict';

/**
 * @file Root reducer.
 */

var _require = require('redux'),
    combineReducers = _require.combineReducers;

var view = function view() {
	var current = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'files';
	var action = arguments[1];

	switch (action.type) {
		case 'CHANGE_VIEW':
			return action.view;
		default:
			return current;
	}
};

var _require2 = require('./projects'),
    projects = _require2.projects,
    activeProject = _require2.activeProject,
    activeProjectFiles = _require2.activeProjectFiles;

var activeFile = function activeFile() {
	var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	var action = arguments[1];

	switch (action.type) {
		case 'SET_ACTIVE_FILE':
			return action.payload;
		default:
			return file;
	}
};

module.exports = combineReducers({
	view: view,
	projects: projects,
	activeProject: activeProject,
	activeProjectFiles: activeProjectFiles,
	activeFile: activeFile
});

},{"./projects":26,"redux":undefined}],26:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @file Projects reducer.
 */

var projects = function projects() {
	var projects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var action = arguments[1];

	switch (action.type) {
		case 'ADD_PROJECT':
			return [].concat(_toConsumableArray(projects), [action.payload]);
		case 'REMOVE_PROJECT':
			return projects.filter(function (project, index) {
				return index !== action.id;
			});
		case 'REFRESH_ACTIVE_PROJECT':
			return projects.map(function (project, index) {
				if (index === parseInt(action.payload.id, 10)) {
					return action.payload;
				} else {
					return project;
				}
			});
		default:
			return projects;
	}
};

var activeProject = function activeProject() {
	var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case 'CHANGE_PROJECT':
			return action.payload;
		case 'SET_PROJECT_STATE':
			return _extends({}, active, action.payload);
		default:
			return active;
	}
};

var activeProjectFiles = function activeProjectFiles() {
	var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case 'RECEIVE_FILES':
			return action.payload;
		default:
			return files;
	}
};

module.exports = {
	projects: projects,
	activeProject: activeProject,
	activeProjectFiles: activeProjectFiles
};

},{}],27:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @file Logger utility.
 */

var moment = require('moment');

var Logger = function () {
	function Logger() {
		_classCallCheck(this, Logger);

		this.logs = [];
	}

	_createClass(Logger, [{
		key: 'log',
		value: function log(type, title) {
			var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

			this.logs.push({
				type: type,
				title: title,
				body: body,
				time: moment().format('HH:mm:ss.SSS')
			});
			/* global Event */
			document.dispatchEvent(new Event('bd/refresh/logs'));
		}
	}, {
		key: 'get',
		value: function get() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'desc';

			var logs = void 0;

			if (!type) {
				logs = this.logs;
			} else {
				logs = this.logs.filter(function (log) {
					return log.type === type;
				});
			}

			if (order === 'desc') {
				logs = logs.slice().reverse();
			}

			return logs;
		}
	}]);

	return Logger;
}();

module.exports = Logger;

},{"moment":undefined}],28:[function(require,module,exports){
'use strict';

/**
 * @file Walk a directory and return an object of files and subfolders.
 */

var Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));

var fspath = require('path');

function directoryTree(path) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	return new Promise(function (resolve, reject) {
		// If max depth was reached, bail.
		if (options.depth && depth > options.depth) {
			resolve(null);
		}

		var name = fspath.basename(path);
		var item = { path: path, name: name };

		var stats = void 0;

		try {
			stats = fs.statSync(path);
		} catch (err) {
			// console.log( err );
			resolve(null);
		}

		// Skip if it matches the exclude regex.
		if (options && options.exclude && (options.exclude.test(path) || options.exclude.test(name))) {
			resolve(null);
		}

		if (stats.isFile()) {
			item.type = 'file';

			var ext = fspath.extname(path).toLowerCase();

			// Skip if it does not match the extension regex.
			if (options && options.extensions && !options.extensions.test(ext)) {
				resolve(null);
			}

			// item.size = stats.size; // File size in bytes.
			item.extension = ext;

			resolve(item);
		} else if (stats.isDirectory()) {
			item.type = 'directory';

			fs.readdir(path, function (err, files) {
				if (err) {
					if (err.code === 'EACCES') {
						// User does not have permissions, ignore directory.
						resolve(null);
					} else {
						throw err;
					}
				}

				item.children = [];

				Promise.map(files, function (file) {
					return directoryTree(fspath.join(path, file), options, depth + 1);
				}).then(function (children) {
					item.children = children.filter(function (e) {
						return !!e;
					});
					resolve(item);
				});
			});

			// item.size = item.children.reduce( ( prev, cur ) => {
			// 	console.log( prev, cur.size );
			// 	return prev + cur.size;
			// }, 0 );
		} else {
			resolve(null); // Or set item.size = 0 for devices, FIFO and sockets ?
		}
	});
}

module.exports = directoryTree;

},{"bluebird":undefined,"fs":undefined,"path":undefined}],29:[function(require,module,exports){
'use strict';

/**
 * @file Global helper functions for the app's UI.
 */

function unfocus() {
	var toggle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

	document.body.classList.toggle('unfocus', toggle);
}

function loading() {
	var toggle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	document.body.classList.toggle('loading', toggle);
}

function overlay() {
	var toggle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

	document.body.classList.toggle('overlay', toggle);
}

function removeFocus(element, className) {
	var triggerEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var exclude = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	var outsideClickListener = function outsideClickListener(event) {
		if (!element.contains(event.target)) {
			removeClickListener();

			if (!exclude || !exclude.contains(event.target)) {
				document.body.classList.remove(className);

				if (triggerEvent) {
					document.dispatchEvent(triggerEvent);
				}
			}
		}
	};

	var removeClickListener = function removeClickListener() {
		document.removeEventListener('click', outsideClickListener);
	};

	document.addEventListener('click', outsideClickListener);
}

module.exports = {
	unfocus: unfocus,
	loading: loading,
	overlay: overlay,
	removeFocus: removeFocus
};

},{}],30:[function(require,module,exports){
'use strict';

/**
 * @file Helper functions for resolving, transforming, generating and formatting paths.
 */

var path = require('path');

// https://github.com/sindresorhus/slash
function slash(input) {
	var isExtendedLengthPath = /^\\\\\?\\/.test(input);
	var hasNonAscii = /[^\u0000-\u0080]+/.test(input); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return input;
	}

	return input.replace(/\\/g, '/');
}

function fileOutputPath(file) {
	var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	var extension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : file.extension;

	var basedir = path.parse(file.path).dir;
	var filename = file.name.replace(/\.[^/.]+$/, '') + suffix + extension;

	return path.join(basedir, filename);
}

function fileRelativePath(from, to) {
	return path.relative(from, to);
}

function fileAbsolutePath(base, filename) {
	return path.isAbsolute(filename) ? filename : path.join(base, filename);
}

function dirAbsolutePath(base, filename) {
	return path.parse(fileAbsolutePath(base, filename)).dir;
}

module.exports = {
	slash: slash,
	fileOutputPath: fileOutputPath,
	fileRelativePath: fileRelativePath,
	fileAbsolutePath: fileAbsolutePath,
	dirAbsolutePath: dirAbsolutePath
};

},{"path":undefined}],31:[function(require,module,exports){
'use strict';

/**
 * @file Collection of helper functions.
 */

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if (new Date().getTime() - start > milliseconds) {
			break;
		}
	}
}

function getInitialState() {
	var state = {
		view: 'files',
		projects: [],
		activeProject: 0,
		activeProjectFiles: {},
		activeFile: null
	};

	if (global.config.has('projects')) {
		state.projects = global.config.get('projects');
	}

	if (state.projects.length && global.config.has('active-project')) {
		var activeIndex = global.config.get('active-project');

		if (state.projects[activeIndex]) {
			state.activeProject = state.projects[activeIndex];
			state.activeProject.id = activeIndex;
		}
	}

	return state;
}

function setProjectConfig(property, value) {
	var projects = global.config.get('projects');
	var activeIndex = global.config.get('active-project');

	if (Array.isArray(projects) && projects[activeIndex]) {
		projects[activeIndex][property] = value;

		global.config.set('projects', projects);
	} else {
		window.alert('There was a problem saving the project config.');
	}
}

function getDependencyArray(dependencyTree) {
	var dependencies = [];

	for (var dependency in dependencyTree) {
		dependencies.push(dependency);

		if (Object.keys(dependencyTree[dependency]).length > 0) {
			dependencies = dependencies.concat(getDependencyArray(dependencyTree[dependency]));
		}
	}

	return dependencies;
}

module.exports = {
	sleep: sleep,
	getInitialState: getInitialState,
	setProjectConfig: setProjectConfig,
	getDependencyArray: getDependencyArray
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87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QUFyQyxFQUE2QztBQUM1QyxLQUFJLFdBQVcsT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixVQUFsQixDQUFmO0FBQ0EsS0FBSSxjQUFjLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsZ0JBQWxCLENBQWxCOztBQUVBLEtBQUssTUFBTSxPQUFOLENBQWUsUUFBZixLQUE2QixTQUFVLFdBQVYsQ0FBbEMsRUFBNEQ7QUFDM0QsV0FBVSxXQUFWLEVBQXlCLFFBQXpCLElBQXNDLEtBQXRDOztBQUVBLFNBQU8sTUFBUCxDQUFjLEdBQWQsQ0FBbUIsVUFBbkIsRUFBK0IsUUFBL0I7QUFDQSxFQUpELE1BSU87QUFDTixTQUFPLEtBQVAsQ0FBYyxnREFBZDtBQUNBO0FBQ0Q7O0FBRUQsU0FBUyxrQkFBVCxDQUE2QixjQUE3QixFQUE4QztBQUM3QyxLQUFJLGVBQWUsRUFBbkI7O0FBRUEsTUFBTSxJQUFJLFVBQVYsSUFBd0IsY0FBeEIsRUFBeUM7QUFDeEMsZUFBYSxJQUFiLENBQW1CLFVBQW5COztBQUVBLE1BQUssT0FBTyxJQUFQLENBQWEsZUFBZ0IsVUFBaEIsQ0FBYixFQUE0QyxNQUE1QyxHQUFxRCxDQUExRCxFQUE4RDtBQUM3RCxrQkFBZSxhQUFhLE1BQWIsQ0FBcUIsbUJBQW9CLGVBQWdCLFVBQWhCLENBQXBCLENBQXJCLENBQWY7QUFDQTtBQUNEOztBQUVELFFBQU8sWUFBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQixpQ0FGZ0I7QUFHaEIsbUNBSGdCO0FBSWhCO0FBSmdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9qZWN0KCBpZCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVNT1ZFX1BST0pFQ1QnLFxuXHRcdGlkXG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9QUk9KRUNUX1NUQVRFJyxcblx0XHRwYXlsb2FkOiBzdGF0ZVxuXHR9O1xufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0QWN0aXZlRmlsZSggZmlsZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX0FDVElWRV9GSUxFJyxcblx0XHRwYXlsb2FkOiBmaWxlXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjaGFuZ2VWaWV3LFxuXHRhZGRQcm9qZWN0LFxuXHRjaGFuZ2VQcm9qZWN0LFxuXHRyZW1vdmVQcm9qZWN0LFxuXHRzZXRQcm9qZWN0U3RhdGUsXG5cdHJlY2VpdmVGaWxlcyxcblx0c2V0QWN0aXZlRmlsZSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Rcbn07XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vY29tcGlsZXIvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHsgZ2V0SW5pdGlhbFN0YXRlIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5jb25zdCBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIsIGluaXRpYWxTdGF0ZSApO1xuXG5nbG9iYWwuc3RvcmUgPSBzdG9yZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHBzVHJlZSA9IHJlcXVpcmUoJ3BzLXRyZWUnKTtcbmNvbnN0IGRlcGVuZGVuY3lUcmVlID0gcmVxdWlyZSgnZGVwZW5kZW5jeS10cmVlJyk7XG5cbmNvbnN0IHNhc3MgPSByZXF1aXJlKCdub2RlLXNhc3MnKTtcbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCd3ZWJwYWNrJyk7XG5jb25zdCBmb3JtYXRNZXNzYWdlcyA9IHJlcXVpcmUoJy4vbWVzc2FnZXMnKTtcblxuY29uc3QgeyBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscy9wYXRoSGVscGVycycpO1xuY29uc3QgeyBnZXREZXBlbmRlbmN5QXJyYXkgfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGtpbGxUYXNrcygpIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKSB7XG5cdFx0Zm9yICggdmFyIHRhc2sgb2YgZ2xvYmFsLmNvbXBpbGVyVGFza3MgKSB7XG5cdFx0XHR0ZXJtaW5hdGVQcm9jZXNzKCB0YXNrICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBOb3RoaW5nIHRvIGtpbGwgOihcblx0cmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHRlcm1pbmF0ZVByb2Nlc3MoIHByb2MgKSB7XG5cdHBzVHJlZSggcHJvYy5waWQsIGZ1bmN0aW9uKCBlcnIsIGNoaWxkcmVuICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0fVxuXG5cdFx0Zm9yICggdmFyIHBpZCBvZiBbIHByb2MucGlkIF0uY29uY2F0KCBjaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLlBJRCApICkgKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRwcm9jZXNzLmtpbGwoIHBpZCApO1xuXHRcdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdFx0Ly8gRmFpbCBzaWxlbnRseSBsb2wgWU9MT1xuXHRcdFx0XHQvLyBjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBpbml0UHJvamVjdCgpIHtcblx0a2lsbFRhc2tzKCk7XG5cblx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBwcm9qZWN0RmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cblx0bGV0IHByb2plY3RQYXRoID0gcGF0aC5wYXJzZSggZ2xvYmFsLnByb2plY3RDb25maWcucGF0aCApLmRpcjtcblxuXHRmb3IgKCB2YXIgZmlsZUNvbmZpZyBvZiBwcm9qZWN0RmlsZXMgKSB7XG5cdFx0cHJvY2Vzc0ZpbGUoIHByb2plY3RQYXRoLCBmaWxlQ29uZmlnICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0ZpbGUoIGJhc2UsIGZpbGVDb25maWcsIHRhc2tOYW1lID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgb3B0aW9ucyA9IGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKTtcblxuXHRpZiAoICEgb3B0aW9ucyApIHtcblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoIHRhc2tOYW1lICkge1xuXHRcdHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHR9IGVsc2UgaWYgKCBvcHRpb25zLmF1dG9jb21waWxlICkge1xuXHRcdGlmICggb3B0aW9ucy53YXRjaFRhc2sgKSB7XG5cdFx0XHRvcHRpb25zLmdldEltcG9ydHMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHJ1blRhc2soICd3YXRjaCcsIG9wdGlvbnMgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3B0aW9ucyggZmlsZSApIHtcblx0bGV0IG9wdGlvbnMgPSB7fTtcblxuXHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRjYXNlICcuY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdjc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdzYXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdsZXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5qcyc6XG5cdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnanMnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzY3JpcHQnO1xuXHR9XG5cblx0b3B0aW9ucy5idWlsZFRhc2tOYW1lID0gJ2J1aWxkLScgKyBvcHRpb25zLnR5cGU7XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLnBhdGggfHwgISBmaWxlQ29uZmlnLm91dHB1dCApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgZmlsZVBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLnBhdGggKTtcblx0bGV0IG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLm91dHB1dCApO1xuXHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnZXRGaWxlT3B0aW9ucyh7IGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKCBmaWxlUGF0aCApIH0pO1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRpbnB1dDogZmlsZVBhdGgsXG5cdFx0ZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoIG91dHB1dFBhdGggKSxcblx0XHRvdXRwdXQ6IHBhdGgucGFyc2UoIG91dHB1dFBhdGggKS5kaXIsXG5cdFx0cHJvamVjdEJhc2U6IGJhc2UsXG5cdFx0cHJvamVjdENvbmZpZzogZ2xvYmFsLnByb2plY3RDb25maWcucGF0aFxuXHR9O1xuXG5cdGlmICggZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdGZvciAoIHZhciBvcHRpb24gaW4gZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdFx0aWYgKCAhIGZpbGVDb25maWcub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IGZpbGVDb25maWcub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0XHRvcHRpb25zLndhdGNoVGFzayA9IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zID0ge30sIGNhbGxiYWNrID0gbnVsbCApIHtcblx0Y29uc29sZS5sb2coIG9wdGlvbnMgKTtcblxuXHRsZXQgbW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdub2RlX21vZHVsZXMnICk7XG5cdGlmICggISBtb2R1bGVzUGF0aC5tYXRjaCgnYXBwJykgKSB7XG5cdFx0bW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdhcHAvbm9kZV9tb2R1bGVzJyApO1xuXHR9XG5cblx0Ly8gR2V0IGltcG9ydGVkIGZpbGVzLlxuXHRsZXQgd2F0Y2hGaWxlcyA9IGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUoe1xuXHRcdGZpbGVuYW1lOiBvcHRpb25zLmlucHV0LFxuXHRcdGRpcmVjdG9yeTogb3B0aW9ucy5wcm9qZWN0QmFzZVxuXHR9KSk7XG5cblx0bGV0IGZpbGVuYW1lID0gb3B0aW9ucy5maWxlbmFtZSB8fCAnZmlsZSc7XG5cblx0Ly8gQnVpbGQgdGFzayBzdGFydGluZy5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2ZpbGVuYW1lfS4uLmAgKTtcblxuXHRpZiAoIHRhc2tOYW1lID09PSAnYnVpbGQtc2FzcycgKSB7XG5cdFx0bGV0IG91dEZpbGUgPSBwYXRoLnJlc29sdmUoIG9wdGlvbnMub3V0cHV0LCBvcHRpb25zLmZpbGVuYW1lICk7XG5cblx0XHRzYXNzLnJlbmRlcigge1xuXHRcdFx0ZmlsZTogb3B0aW9ucy5pbnB1dCxcblx0XHRcdG91dEZpbGU6IG91dEZpbGUsXG5cdFx0XHRvdXRwdXRTdHlsZTogb3B0aW9ucy5zdHlsZSxcblx0XHRcdHNvdXJjZU1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdFx0fSwgZnVuY3Rpb24oIGVycm9yLCByZXN1bHQgKSB7XG5cdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBmaWxlbmFtZSwgZXJyb3IgKTtcblxuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGVycm9ycyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLCB3cml0ZSB0aGlzIHJlc3VsdCBvbiB0aGUgZGlza1xuXHRcdFx0XHRmcy53cml0ZUZpbGUoIG91dEZpbGUsIHJlc3VsdC5jc3MsIGZ1bmN0aW9uKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggZmlsZW5hbWUsIGVyciApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIGZpbGVuYW1lICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9IGVsc2Uge1xuXHRcdGxldCBjb25maWcgPSB7XG5cdFx0XHRtb2RlOiAncHJvZHVjdGlvbicsXG5cdFx0XHRlbnRyeTogb3B0aW9ucy5pbnB1dCxcblx0XHRcdG91dHB1dDoge1xuXHRcdFx0XHRwYXRoOiBvcHRpb25zLm91dHB1dCxcblx0XHRcdFx0ZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWVcblx0XHRcdH0sXG5cdFx0XHRyZXNvbHZlTG9hZGVyOiB7XG5cdFx0XHRcdG1vZHVsZXM6IFsgbW9kdWxlc1BhdGggXVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR3ZWJwYWNrKCBjb25maWcsICggZXJyLCBzdGF0cyApID0+IHtcblx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBmb3JtYXRNZXNzYWdlcyggc3RhdHMgKTtcblxuXHRcdFx0aWYgKCAhIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggJiYgISBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBmaWxlbmFtZSApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIGZpbGVuYW1lLCBtZXNzYWdlcy5lcnJvcnMgKTtcblxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlV2FybmluZ3MoIGZpbGVuYW1lLCBtZXNzYWdlcy53YXJuaW5ncyApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBmaWxlbmFtZSApIHtcblx0bGV0IG5vdGlmeVRleHQgPSBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdzdWNjZXNzJywgbm90aWZ5VGV4dCApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c2lsZW50OiB0cnVlXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlRXJyb3IoIGZpbGVuYW1lLCBlcnJvcnMgKSB7XG5cdGNvbnNvbGUuZXJyb3IoIGVycm9ycyApO1xuXG5cdGlmICggISBlcnJvcnMubGVuZ3RoICkge1xuXHRcdGVycm9ycyA9IFsgZXJyb3JzIF07XG5cdH1cblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggZXJyb3JzLmxlbmd0aCA+IDEgPyAnRXJyb3JzJyA6ICdFcnJvcicgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCBub3RpZnlUZXh0ICsgJzonLCAnPHByZT4nICsgZXJyb3JzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c291bmQ6ICdCYXNzbydcblx0fSApO1xuXG5cdHJldHVybiBub3RpZnk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggZmlsZW5hbWUsIHdhcm5pbmdzICkge1xuXHRjb25zb2xlLndhcm4oIHdhcm5pbmdzICk7XG5cblx0aWYgKCAhIHdhcm5pbmdzLmxlbmd0aCApIHtcblx0XHR3YXJuaW5ncyA9IFsgd2FybmluZ3MgXTtcblx0fVxuXG5cdGxldCBub3RpZnlUZXh0ID0gKCB3YXJuaW5ncy5sZW5ndGggPiAxID8gJ1dhcm5pbmdzJyA6ICdXYXJuaW5nJyApICsgYCB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfWA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICd3YXJuJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIHdhcm5pbmdzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdFByb2plY3QsXG5cdHJ1blRhc2ssXG5cdGtpbGxUYXNrcyxcblx0cHJvY2Vzc0ZpbGUsXG5cdGdldEZpbGVDb25maWcsXG5cdGdldEZpbGVPcHRpb25zLFxuXHR0ZXJtaW5hdGVQcm9jZXNzXG59XG4iLCIvKipcbiAqIFRoaXMgaGFzIGJlZW4gYWRhcHRlZCBmcm9tIGBjcmVhdGUtcmVhY3QtYXBwYCwgYXV0aG9yZWQgYnkgRmFjZWJvb2ssIEluYy5cbiAqIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29raW5jdWJhdG9yL2NyZWF0ZS1yZWFjdC1hcHAvdHJlZS9tYXN0ZXIvcGFja2FnZXMvcmVhY3QtZGV2LXV0aWxzXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgZXJyb3JMYWJlbCA9ICdTeW50YXggZXJyb3I6JztcbmNvbnN0IGlzTGlrZWx5QVN5bnRheEVycm9yID0gc3RyID0+IHN0ci5pbmNsdWRlcyggZXJyb3JMYWJlbCApO1xuXG5jb25zdCBleHBvcnRSZWdleCA9IC9cXHMqKC4rPylcXHMqKFwiKT9leHBvcnQgJyguKz8pJyB3YXMgbm90IGZvdW5kIGluICcoLis/KScvO1xuY29uc3Qgc3RhY2tSZWdleCA9IC9eXFxzKmF0XFxzKCg/IXdlYnBhY2s6KS4pKjpcXGQrOlxcZCtbXFxzKV0qKFxcbnwkKS9nbTtcbmNvbnN0IGZpbGVBbmRMaW5lUmVnZXggPSAvaW4gKFteKF0qKVxcc1xcKGxpbmVcXHMoXFxkKiksXFxzY29sdW1uXFxzKFxcZCopXFwpLztcblxuZnVuY3Rpb24gZm9ybWF0TWVzc2FnZSggbWVzc2FnZSwgaXNFcnJvciApIHtcblx0bGV0IGxpbmVzID0gbWVzc2FnZS5zcGxpdCggJ1xcbicgKTtcblxuXHRpZiAoIGxpbmVzLmxlbmd0aCA+IDIgJiYgbGluZXNbIDEgXSA9PT0gJycgKSB7XG5cdFx0bGluZXMuc3BsaWNlKCAxLCAxICk7IC8vIFJlbW92ZSBleHRyYSBuZXdsaW5lLlxuXHR9XG5cblx0Ly8gUmVtb3ZlIGxvYWRlciBub3RhdGlvbiBmcm9tIGZpbGVuYW1lczpcblx0Ly8gICBgLi9+L2Nzcy1sb2FkZXIhLi9zcmMvQXBwLmNzc2Agfn4+IGAuL3NyYy9BcHAuY3NzYFxuXHRpZiAoIGxpbmVzWzBdLmxhc3RJbmRleE9mKCAnIScgKSAhPT0gLTEgKSB7XG5cdFx0bGluZXNbMF0gPSBsaW5lc1swXS5zdWJzdHIoIGxpbmVzWyAwIF0ubGFzdEluZGV4T2YoICchJyApICsgMSApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHVzZWxlc3MgYGVudHJ5YCBmaWxlbmFtZSBzdGFjayBkZXRhaWxzXG5cdGxpbmVzID0gbGluZXMuZmlsdGVyKCBsaW5lID0+IGxpbmUuaW5kZXhPZiggJyBAICcgKSAhPT0gMCApO1xuXG5cdC8vIDAgfj4gZmlsZW5hbWU7IDEgfj4gbWFpbiBlcnIgbXNnXG5cdGlmICggISBsaW5lc1swXSB8fCAhIGxpbmVzWzFdICkge1xuXHRcdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHZlcmJvc2UgXCJtb2R1bGUgbm90IGZvdW5kXCIgbWVzc2FnZXMgZm9yIGZpbGVzIGFuZCBwYWNrYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIG5vdCBmb3VuZDogJyApICkge1xuXHRcdGxpbmVzID0gW1xuXHRcdFx0bGluZXNbMF0sXG5cdFx0XHRsaW5lc1sxXSAvLyBcIk1vZHVsZSBub3QgZm91bmQ6IFwiIGlzIGVub3VnaCBkZXRhaWxcblx0XHRcdFx0LnJlcGxhY2UoIFwiQ2Fubm90IHJlc29sdmUgJ2ZpbGUnIG9yICdkaXJlY3RvcnknIFwiLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnQ2Fubm90IHJlc29sdmUgbW9kdWxlICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdFcnJvcjogJywgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ1tDYXNlU2Vuc2l0aXZlUGF0aHNQbHVnaW5dICcsICcnIClcblx0XHRdO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHN5bnRheCBlcnJvciBtZXNzYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIGJ1aWxkIGZhaWxlZDogJyApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggJ01vZHVsZSBidWlsZCBmYWlsZWQ6IFN5bnRheEVycm9yOicsIGVycm9yTGFiZWwgKTtcblx0fVxuXG5cdGlmICggbGluZXNbMV0ubWF0Y2goIGV4cG9ydFJlZ2V4ICkgKSB7XG5cdFx0bGluZXNbMV0gPSBsaW5lc1sxXS5yZXBsYWNlKCBleHBvcnRSZWdleCwgXCIkMSAnJDQnIGRvZXMgbm90IGNvbnRhaW4gYW4gZXhwb3J0IG5hbWVkICckMycuXCIgKTtcblx0fVxuXG5cdC8vIFJlYXNzZW1ibGUgJiBTdHJpcCBpbnRlcm5hbCB0cmFjaW5nLCBleGNlcHQgYHdlYnBhY2s6YCAtLSAoY3JlYXRlLXJlYWN0LWFwcC9wdWxsLzEwNTApXG5cdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApLnJlcGxhY2UoIHN0YWNrUmVnZXgsICcnICkudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGNvbnNvbGUubG9nKCBkYXRhICk7XG5cblx0bGV0IGVyck9iaiA9IHt9O1xuXHRsZXQgc3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cblx0dmFyIGxpbmVzID0gZGF0YS5zcGxpdCggLyhcXHJcXG58W1xcblxcdlxcZlxcclxceDg1XFx1MjAyOFxcdTIwMjldKS8gKTtcblxuXHRmb3IgKCB2YXIgbGluZSBvZiBsaW5lcyApIHtcblx0XHRsZXQgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuXG5cdFx0aWYgKCAhdHJpbW1lZC5sZW5ndGggKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRyaW1tZWQgPT09ICdEZXRhaWxzOicgKSB7XG5cdFx0XHRzdGFydENhcHR1cmUgPSB0cnVlO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGFydENhcHR1cmUgKSB7XG5cdFx0XHRsZXQgZXJyQXJyID0gdHJpbW1lZC5zcGxpdCggLzpcXHMoLispLyApO1xuXHRcdFx0ZXJyT2JqWyBlcnJBcnJbIDAgXSBdID0gZXJyQXJyWyAxIF07XG5cblx0XHRcdGlmICggZXJyQXJyWyAwIF0gPT09ICdmb3JtYXR0ZWQnICkge1xuXHRcdFx0XHRzdGFydENhcHR1cmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0aWYgKCBPYmplY3Qua2V5cyggZXJyT2JqICkubGVuZ3RoICkge1xuXHRcdGNvbnNvbGUuZXJyb3IoIGVyck9iaiApO1xuXG5cdFx0Z2V0RXJyTGluZXMoIGVyck9iai5maWxlLCBlcnJPYmoubGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHRpdGxlID0gZXJyT2JqLmZvcm1hdHRlZC5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0XHQnPGNvZGU+JyArXG5cdFx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBlcnJPYmouZmlsZSApICkgK1xuXHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9ICk7XG5cdH1cblxuXHQvLyByZXR1cm4gZXJyT2JqO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJMaW5lcyggZmlsZW5hbWUsIGxpbmUsIGNhbGxiYWNrICkge1xuXHRsaW5lID0gTWF0aC5tYXgoIHBhcnNlSW50KCBsaW5lLCAxMCApIC0gMSB8fCAwLCAwICk7XG5cblx0ZnMucmVhZEZpbGUoIGZpbGVuYW1lLCBmdW5jdGlvbiAoIGVyciwgZGF0YSApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cblx0XHR2YXIgbGluZXMgPSBkYXRhLnRvU3RyaW5nKCAndXRmLTgnICkuc3BsaXQoICdcXG4nICk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbiggJ1xcbicgKSApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0Zm9yICggdmFyIGogPSBtaW5MaW5lOyBqIDw9IG1heExpbmU7IGorKyApIHtcblx0XHRcdGxpbmVBcnIucHVzaChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJsaW5lJyArICggbGluZSA9PT0gaiA/ICcgaGlnaGxpZ2h0JyA6ICcnICkgKyAnXCI+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtbnVtYmVyXCI+JyArICggaiArIDEgKSArICc8L3NwYW4+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCAnXFxuJyApICk7XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1lc3NhZ2UgKSB7XG5cdGxldCBmaWxlQW5kTGluZSA9IG1lc3NhZ2UubWF0Y2goIGZpbGVBbmRMaW5lUmVnZXggKTtcblxuXHRpZiAoICEgZmlsZUFuZExpbmUgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGZpbGUgPSBmaWxlQW5kTGluZVsgMSBdO1xuXHRsZXQgbGluZSA9IGZpbGVBbmRMaW5lWyAyIF07XG5cblx0Y29uc29sZS5sb2coIGZpbGVBbmRMaW5lICk7XG5cblx0Z2V0RXJyTGluZXMoIGZpbGUsIGxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHRpdGxlID0gbWVzc2FnZS5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGZpbGUgKSApICtcblx0XHRcdCcgb24gbGluZSAnICsgbGluZSArXG5cdFx0XHQnPC9jb2RlPic7XG5cblx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdH0gKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggc3RhdHMgKSB7XG5cdGNvbnN0IGpzb24gPSBzdGF0cy50b0pzb24oIHt9LCB0cnVlICk7XG5cblx0anNvbi5lcnJvcnMubWFwKCBtc2cgPT4gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1zZyApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdGVycm9yczoganNvbi5lcnJvcnMubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCB0cnVlICkgKSxcblx0XHR3YXJuaW5nczoganNvbi53YXJuaW5ncy5tYXAoIG1zZyA9PiBmb3JtYXRNZXNzYWdlKCBtc2csIGZhbHNlICkgKVxuXHR9O1xuXG5cdC8vIE9ubHkgc2hvdyBzeW50YXggZXJyb3JzIGlmIHdlIGhhdmUgdGhlbVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMuc29tZSggaXNMaWtlbHlBU3ludGF4RXJyb3IgKSApIHtcblx0XHRyZXN1bHQuZXJyb3JzID0gcmVzdWx0LmVycm9ycy5maWx0ZXIoIGlzTGlrZWx5QVN5bnRheEVycm9yICk7XG5cdH1cblxuXHQvLyBGaXJzdCBlcnJvciBpcyB1c3VhbGx5IGl0OyBvdGhlcnMgdXN1YWxseSB0aGUgc2FtZVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMSApIHtcblx0XHRyZXN1bHQuZXJyb3JzLmxlbmd0aCA9IDE7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0TWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2U7XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIGNvbXBvbmVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL1NldHRpbmdzJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHRsb2dzOiAnTG9ncycsXG5cdFx0XHRzZXR0aW5nczogJ1NldHRpbmdzJ1xuXHRcdH07XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGdsb2JhbC51aS5vdmVybGF5KCB0aGlzLnByb3BzLnZpZXcgIT09ICdmaWxlcycgKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgY29udGVudDtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdsb2dzJyApIHtcblx0XHRcdFx0Y29udGVudCA9IDxMb2dzIC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGVudCA9IDxTZXR0aW5ncyAvPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50JyArICggcHJvcHMuY2xhc3NOYW1lID8gJyAnICsgcHJvcHMuY2xhc3NOYW1lIDogJycgKSB9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2lubmVyJz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY2hhbmdlVmlldyB9ID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZTogc3RhdGUudmlld1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRjaGFuZ2VWaWV3OiB2aWV3ID0+IGRpc3BhdGNoKCBjaGFuZ2VWaWV3KCB2aWV3ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggU2lkZWJhciApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwYXRoOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBwYXRoID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/ICcnIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgcGF0aCB9O1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5zdGF0ZS5wYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoeyBwYXRoOiBzYXZlUGF0aCB9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCBzYXZlUGF0aCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdoaWRkZW4nXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnBhdGggfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8c21hbGwgb25DbGljaz17IHRoaXMub25DbGljayB9PnsgdGhpcy5zdGF0ZS5wYXRoIH08L3NtYWxsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2F2ZUZpbGUucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRzb3VyY2VGaWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXHRkaWFsb2dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0ZGlhbG9nRmlsdGVyczogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLm9iamVjdCBdKSxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRzZWxlY3RlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBzZWxlY3RlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHNlbGVjdGVkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IHNlbGVjdGVkOiBldmVudC50YXJnZXQudmFsdWUgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuc2VsZWN0ZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnNlbGVjdGVkID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnN0YXRlLnNlbGVjdGVkIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5zZWxlY3RlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHRvZ2dsZSBzd2l0Y2guXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFN3aXRjaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRjaGVja2VkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IGNoZWNrZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBjaGVja2VkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGNoZWNrZWQ6ICEgcHJldlN0YXRlLmNoZWNrZWQgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuY2hlY2tlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5zdGF0ZS5jaGVja2VkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbiBlbXB0eSc+XG5cdFx0XHRcdFx0PGgzPk5vIGxvZ3MgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+R28gZm9ydGggYW5kIGNvbXBpbGUhPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUsIHJlZnJlc2hBY3RpdmVQcm9qZWN0IH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdENvbmZpZyB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXRpbHMnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVQcm9qZWN0ID0gdGhpcy50b2dnbGVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHRnbG9iYWwudWkudW5mb2N1cyggISB0aGlzLnN0YXRlLmlzT3BlbiApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGlzT3BlbjogISB0aGlzLnN0YXRlLmlzT3BlbiB9KTtcblx0fVxuXG5cdHRvZ2dsZVByb2plY3QoKSB7XG5cdFx0bGV0IHBhdXNlZCA9ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkIHx8IGZhbHNlO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0U3RhdGUoeyBwYXVzZWQ6IHBhdXNlZCB9KTtcblxuXHRcdHRoaXMucHJvcHMucmVmcmVzaEFjdGl2ZVByb2plY3Qoe1xuXHRcdFx0Li4udGhpcy5wcm9wcy5hY3RpdmUsXG5cdFx0XHRwYXVzZWQ6IHBhdXNlZFxuXHRcdH0pO1xuXG5cdFx0c2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHBhdXNlZCApO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5wcm9wcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldFByb2plY3RTdGF0ZTogc3RhdGUgPT4gZGlzcGF0Y2goIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSApLFxuXHRyZWZyZXNoQWN0aXZlUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggcmVmcmVzaEFjdGl2ZVByb2plY3QoIHByb2plY3QgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCcuLi91aS9Ob3RpY2UnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL1BhbmVsJyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnYnVpbGRyLXByb2plY3QuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaW5pdFByb2plY3QgPSB0aGlzLmluaXRQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3QgPSB0aGlzLmNoYW5nZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVtb3ZlUHJvamVjdCA9IHRoaXMucmVtb3ZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZWZyZXNoUHJvamVjdCA9IHRoaXMucmVmcmVzaFByb2plY3QuYmluZCggdGhpcyApO1xuXG5cdFx0dGhpcy5pbml0Q29tcGlsZXIgPSB0aGlzLmluaXRDb21waWxlci5iaW5kKCB0aGlzICk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9maWxlcycsIHRoaXMucmVmcmVzaFByb2plY3QgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuaW5pdFByb2plY3QoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoIHByZXZQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGlmIChcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF0aCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCAmJlxuXHRcdFx0cHJldlByb3BzLmFjdGl2ZS5wYXVzZWQgIT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZFxuXHRcdCkge1xuXHRcdFx0Ly8gUHJvamVjdCB3YXMgcGF1c2VkL3VucGF1c2VkLCB0cmlnZ2VyIGNvbXBpbGVyIHRhc2tzIG9yIHRlcm1pbmF0ZSB0aGVtLlxuXHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgYSBuZXcgcHJvamVjdC5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHRsZXQgbmV3UHJvamVjdEluZGV4ID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGg7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3QgYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgW1xuXHRcdFx0XHQuLi50aGlzLnByb3BzLnByb2plY3RzLFxuXHRcdFx0XHRuZXdQcm9qZWN0XG5cdFx0XHRdICk7XG5cblx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdHRoaXMucHJvcHMuYWRkUHJvamVjdCggbmV3UHJvamVjdCApO1xuXG5cdFx0XHQvLyBTZXQgbmV3IHByb2plY3QgYXMgYWN0aXZlLlxuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBuZXdQcm9qZWN0SW5kZXgsIG5ld1Byb2plY3QgKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgdGhlIGFjdGl2ZSBwcm9qZWN0LlxuXHRjaGFuZ2VQcm9qZWN0KCBpZCwgcHJvamVjdCA9IG51bGwgKSB7XG5cdFx0aWYgKCBpZCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUuaWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0aWYgKCBwcm9qZWN0ICkge1xuXHRcdFx0YWN0aXZlID0gcHJvamVjdDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnByb3BzLnByb2plY3RzW2lkXSApIHtcblx0XHRcdGFjdGl2ZSA9IHRoaXMucHJvcHMucHJvamVjdHNbaWRdO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGlkICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KHtcblx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdGlkXG5cdFx0fSk7XG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cblx0XHQvLyBJbml0LlxuXHRcdHRoaXMuaW5pdFByb2plY3QoIGFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBSZW1vdmUgdGhlIGN1cnJlbnQgcHJvamVjdC5cblx0cmVtb3ZlUHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBjb25maXJtUmVtb3ZlID0gd2luZG93LmNvbmZpcm0oIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlICR7dGhpcy5wcm9wcy5hY3RpdmUubmFtZX0/YCApO1xuXG5cdFx0aWYgKCBjb25maXJtUmVtb3ZlICkge1xuXHRcdFx0bGV0IHJlbW92ZUluZGV4ID0gcGFyc2VJbnQoIHRoaXMucHJvcHMuYWN0aXZlLmlkLCAxMCApO1xuXG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSByZW1vdmVJbmRleCApO1xuXG5cdFx0XHQvLyBSZW1vdmUgcHJvamVjdCBmcm9tIGNvbmZpZy5cblx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLnJlbW92ZVByb2plY3QoIHJlbW92ZUluZGV4ICk7XG5cblx0XHRcdC8vIFVuc2V0IGFjdGl2ZSBwcm9qZWN0LlxuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBudWxsICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gU3RhcnQgdGhlIGJhY2tncm91bmQgY29tcGlsZXIgdGFza3MuXG5cdGluaXRDb21waWxlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmluaXRQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBSZWZyZXNoIHRoZSBwcm9qZWN0IGZpbGVzLlxuXHRyZWZyZXNoUHJvamVjdCgpIHtcblx0XHR0aGlzLmdldEZpbGVzKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBDcmVhdGUgb3IgZmV0Y2ggdGhlIHByb2plY3QgY29uZmlnIGZpbGUuXG5cdHNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdidWlsZHItcHJvamVjdCcsXG5cdFx0XHRjd2Q6IHBhdGhcblx0XHR9KTtcblxuXHRcdC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcHJvamVjdCdzIGZpbGUgb3B0aW9ucyBhbmQgdHJpZ2dlciB0aGUgY29tcGlsZXIgaW5pdC5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5vbkRpZENoYW5nZSggJ2ZpbGVzJywgX2RlYm91bmNlKCB0aGlzLmluaXRDb21waWxlciwgMTAwICkgKTtcblx0fVxuXG5cdC8vIFJlYWQgdGhlIGZpbGVzIGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeS5cblx0Z2V0RmlsZXMoIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwudWkubG9hZGluZygpO1xuXG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdGRpcmVjdG9yeVRyZWUoIHBhdGgsIHtcblx0XHRcdC8vIGRlcHRoOiAyLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGdsb2JhbC5zdG9yZS5kaXNwYXRjaCggcmVjZWl2ZUZpbGVzKCBmaWxlcyApICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Ly8gSW5pdGlhbGl6ZSBwcm9qZWN0LlxuXHRpbml0UHJvamVjdCggcGF0aCApIHtcblx0XHRmcy5hY2Nlc3MoIHBhdGgsIGZzLmNvbnN0YW50cy5XX09LLCBmdW5jdGlvbiggZXJyICkge1xuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdC8vIENob3NlbiBkaXJlY3Rvcnkgbm90IHJlYWRhYmxlIG9yIG5vIHBhdGggcHJvdmlkZWQuXG5cdFx0XHRcdGlmICggcGF0aCApIHtcblx0XHRcdFx0XHR3aW5kb3cuYWxlcnQoIGBDb3VsZCBub3QgcmVhZCB0aGUgJHtwYXRofSBkaXJlY3RvcnkuYCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBudWxsO1xuXG5cdFx0XHRcdGdsb2JhbC5zdG9yZS5kaXNwYXRjaCggcmVjZWl2ZUZpbGVzKCB7fSApICk7XG5cblx0XHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5IGlzIHJlYWRhYmxlLCBnZXQgZmlsZXMgYW5kIHNldHVwIGNvbmZpZy5cblx0XHRcdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKTtcblxuXHRcdFx0XHQvLyBDaGFuZ2UgcHJvY2VzcyBjd2QuXG5cdFx0XHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCggdGhpcyApKTtcblxuXHRcdGdsb2JhbC5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cdH1cblxuXHRyZW5kZXJQcm9qZWN0U2VsZWN0KCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRuZXdQcm9qZWN0PXsgdGhpcy5uZXdQcm9qZWN0IH1cblx0XHRcdFx0Y2hhbmdlUHJvamVjdD17IHRoaXMuY2hhbmdlUHJvamVjdCB9XG5cdFx0XHRcdHJlbW92ZVByb2plY3Q9eyB0aGlzLnJlbW92ZVByb2plY3QgfVxuXHRcdFx0XHRyZWZyZXNoUHJvamVjdD17IHRoaXMucmVmcmVzaFByb2plY3QgfVxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyTm90aWNlcygpIHtcblx0XHRsZXQgbm90aWNlcyA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgKSB7XG5cdFx0XHRub3RpY2VzLnB1c2goIChcblx0XHRcdFx0PE5vdGljZSBrZXk9J3BhdXNlZCcgdHlwZT0nd2FybmluZyc+XG5cdFx0XHRcdFx0PHA+UHJvamVjdCBpcyBwYXVzZWQuIEZpbGVzIHdpbGwgbm90IGJlIHdhdGNoZWQgYW5kIGF1dG8gY29tcGlsZWQuPC9wPlxuXHRcdFx0XHQ8L05vdGljZT5cblx0XHRcdCkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm90aWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5wcm9qZWN0cyB8fCB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdC8vIE5vIHByb2plY3RzIHlldCwgc2hvdyB3ZWxjb21lIHNjcmVlbi5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSd3ZWxjb21lLXNjcmVlbic+XG5cdFx0XHRcdFx0PGgzPllvdSBkb24ndCBoYXZlIGFueSBwcm9qZWN0cyB5ZXQuPC9oMz5cblx0XHRcdFx0XHQ8cD5Xb3VsZCB5b3UgbGlrZSB0byBhZGQgb25lIG5vdz88L3A+XG5cdFx0XHRcdFx0PGJ1dHRvbiBjbGFzc05hbWU9J2xhcmdlIGZsYXQgYWRkLW5ldy1wcm9qZWN0JyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+QWRkIFByb2plY3Q8L2J1dHRvbj5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0IHNlbGVjdGVkLCBzaG93IHNlbGVjdG9yLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3Byb2plY3Qtc2VsZWN0LXNjcmVlbic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdHMnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyTm90aWNlcygpIH1cblxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfVxuXHRcdFx0XHRcdFx0ZmlsZXM9eyB0aGlzLnByb3BzLmZpbGVzIH1cblx0XHRcdFx0XHRcdGxvYWRpbmc9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxQYW5lbCAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0YWRkUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggYWRkUHJvamVjdCggcHJvamVjdCApICksXG5cdGNoYW5nZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCBjaGFuZ2VQcm9qZWN0KCBpZCApICksXG5cdHJlbW92ZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCByZW1vdmVQcm9qZWN0KCBpZCApICksXG5cdHNldEFjdGl2ZUZpbGU6IGZpbGUgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0cyApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIHNldHRpbmdzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nc2V0dGluZ3Mtc2NyZWVuJz5cblx0XHRcdFx0PGgzPlNldHRpbmdzPC9oMz5cblx0XHRcdFx0PHA+Q29taW5nIHNvb24hPC9wPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBGaWxlTGlzdEZpbGUgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNvbnN0IHsgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBGaWxlTGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc2V0QWN0aXZlRmlsZSA9IHRoaXMuc2V0QWN0aXZlRmlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRNaW1lVHlwZSggZXh0ICkge1xuXHRcdGxldCB0eXBlO1xuXG5cdFx0c3dpdGNoICggZXh0ICkge1xuXHRcdFx0Y2FzZSAnLnN2Zyc6XG5cdFx0XHRjYXNlICcucG5nJzpcblx0XHRcdGNhc2UgJy5qcGcnOlxuXHRcdFx0XHR0eXBlID0gJ21lZGlhJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy5waHAnOlxuXHRcdFx0Y2FzZSAnLmh0bWwnOlxuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0Y2FzZSAnLmpzb24nOlxuXHRcdFx0XHR0eXBlID0gJ2NvZGUnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnppcCc6XG5cdFx0XHRjYXNlICcucmFyJzpcblx0XHRcdGNhc2UgJy50YXInOlxuXHRcdFx0Y2FzZSAnLjd6Jzpcblx0XHRcdGNhc2UgJy5neic6XG5cdFx0XHRcdHR5cGUgPSAnemlwJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSAndGV4dCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0c2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICYmIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50ID09PSBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0ZmlsZVByb3BzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnLCAnaGFzLW9wdGlvbnMnKTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCA9IDAgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGU7XG5cdFx0bGV0IGV4dCA9IGZpbGUuZXh0ZW5zaW9uIHx8IG51bGw7XG5cdFx0bGV0IGNoaWxkcmVuO1xuXG5cdFx0aWYgKCBmaWxlLnR5cGUgPT09ICdkaXJlY3RvcnknICkge1xuXHRcdFx0aWYgKCBmaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxldCBjaGlsZHJlbkl0ZW1zID0gW107XG5cblx0XHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIGZpbGUuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JdGVtcy5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggZmlsZS5jaGlsZHJlblsgY2hpbGQgXSwgbGV2ZWwgKyAxICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT0nY2hpbGRyZW4nIGtleT17IGZpbGUucGF0aCArICctY2hpbGRyZW4nIH0+eyBjaGlsZHJlbkl0ZW1zIH08L3VsPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdERpcmVjdG9yeVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRjaGlsZHJlbj17IGNoaWxkcmVuIH1cblx0XHRcdC8+O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gdGhpcy5nZXRNaW1lVHlwZSggZXh0ICk7XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3RGaWxlXG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0dHlwZT17IHR5cGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0YmFzZT17IHRoaXMucHJvcHMucGF0aCB9XG5cdFx0XHRcdHNldEFjdGl2ZUZpbGU9eyB0aGlzLnNldEFjdGl2ZUZpbGUgfVxuXHRcdFx0Lz47XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmIChcblx0XHRcdHRoaXMucHJvcHMubG9hZGluZyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2FkaW5nJz5cblx0XHRcdFx0XHQ8cD5Mb2FkaW5nJmhlbGxpcDs8L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm8gcHJvamVjdCBmb2xkZXIgc2VsZWN0ZWQuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmZpbGVzIHx8ICEgT2JqZWN0LmtleXMoIHRoaXMucHJvcHMuZmlsZXMgKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vdGhpbmcgdG8gc2VlIGhlcmUuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPSdmaWxlcyc+XG5cdFx0XHRcdHsgZmlsZWxpc3QgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldEFjdGl2ZUZpbGU6IHBheWxvYWQgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIHBheWxvYWQgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBGaWxlTGlzdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3REaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgZXhwYW5kZWQ6ICEgcHJldlN0YXRlLmV4cGFuZGVkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0Y2xhc3NOYW1lICs9ICcgZXhwYW5kJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9IG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RGlyZWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGZpbGUgaW4gdGhlIGZpbGVsaXN0LlxuICovXG5cbmNvbnN0IHsgcmVtb3RlLCBzaGVsbCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuY29uc3QgeyBNZW51LCBNZW51SXRlbSB9ID0gcmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5vbkNvbnRleHRNZW51ID0gdGhpcy5vbkNvbnRleHRNZW51LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKHtcblx0XHRcdGZpbGU6IHRoaXMucHJvcHMuZmlsZSxcblx0XHRcdGVsZW1lbnQ6IGV2ZW50LmN1cnJlbnRUYXJnZXRcblx0XHR9KTtcblx0fVxuXG5cdG9uQ29udGV4dE1lbnUoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVBhdGggPSB0aGlzLnByb3BzLmZpbGUucGF0aDtcblxuXHRcdGxldCBtZW51ID0gbmV3IE1lbnUoKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnT3BlbicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLm9wZW5JdGVtKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdTaG93IGluIGZvbGRlcicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIoIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHR0eXBlOiAnc2VwYXJhdG9yJ1xuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ0RlbGV0ZScsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggd2luZG93LmNvbmZpcm0oIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9P2AgKSApIHtcblx0XHRcdFx0XHRpZiAoIHNoZWxsLm1vdmVJdGVtVG9UcmFzaCggZmlsZVBhdGggKSApIHtcblx0XHRcdFx0XHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2ZpbGVzJykgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfS5gICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdH0pICk7XG5cblx0XHRtZW51LnBvcHVwKCByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaVxuXHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfVxuXHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0b25Db250ZXh0TWVudT17IHRoaXMub25Db250ZXh0TWVudSB9XG5cdFx0XHQ+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3RGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlID0gdGhpcy5oYW5kbGVDb21waWxlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldE91dHB1dFBhdGggPSB0aGlzLnNldE91dHB1dFBhdGguYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBjb21waWxlT3B0aW9ucyA9IGdsb2JhbC5jb21waWxlci5nZXRGaWxlT3B0aW9ucyggbmV4dFByb3BzLmZpbGUgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBjb21waWxlT3B0aW9ucy50eXBlLFxuXHRcdFx0ZmlsZVR5cGU6IGNvbXBpbGVPcHRpb25zLmZpbGVUeXBlLFxuXHRcdFx0YnVpbGRUYXNrTmFtZTogY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZSxcblx0XHRcdG9wdGlvbnM6IEZpbGVPcHRpb25zLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBuZXh0UHJvcHMuYmFzZSwgbmV4dFByb3BzLmZpbGUgKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0bGV0IGNmaWxlID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKTtcblxuXHRcdHJldHVybiAoIGNmaWxlICYmIGNmaWxlLm9wdGlvbnMgKSA/IGNmaWxlLm9wdGlvbnMgOiB7fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRpZiAoIGZpbGUgJiYgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICkgKTtcblxuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdFx0aWYgKCBjZmlsZSApIHtcblx0XHRcdFx0cmV0dXJuIGNmaWxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Z2V0Q29uZmlnKCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRsZXQgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXRoOiBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICksXG5cdFx0XHRvdXRwdXQ6IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSxcblx0XHRcdG9wdGlvbnM6IHt9XG5cdFx0fTtcblxuXHRcdGxldCBzdG9yZWQgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUgKTtcblxuXHRcdGxldCBjb25maWcgPSAoIHN0b3JlZCAhPT0gbnVsbCApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICkge1xuXHRcdFx0XHRmaWxlQ29uZmlnWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRmaWxlcy5wdXNoKCBmaWxlQ29uZmlnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcblx0XHRcdFx0ZGVsZXRlIGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9ucyAmJiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXG5cdHNldE9wdGlvbiggb3B0aW9uLCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSBwcmV2U3RhdGUub3B0aW9ucyB8fCB7fTtcblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHRcdHJldHVybiB7IG9wdGlvbnMgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3B0aW9ucycsIHRoaXMuc3RhdGUub3B0aW9ucyApO1xuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRPcHRpb24oIGV2ZW50LnRhcmdldC5uYW1lLCB2YWx1ZSApO1xuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0cmV0dXJuIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHRoaXMub3V0cHV0U3VmZml4LCB0aGlzLm91dHB1dEV4dGVuc2lvbiApO1xuXHR9XG5cblx0c2V0T3V0cHV0UGF0aCggZXZlbnQsIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRDb25maWcoICdvdXRwdXQnLCBwYXRoICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0ZnVuY3Rpb24oIGNvZGUgKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5zZXRPdXRwdXRQYXRoIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYnVuZGxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nY29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQ29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2NvbXByZXNzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc291cmNlTWFwc0Rpc2FibGVkKCkgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSw8YnIgLz4gaXQgY2Fubm90IGJlIGNvbXBpbGVkIG9uIGl0cyBvd24uPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHNob3dpbmcgbm90aWNlcyBhbmQgYWxlcnRzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgTm90aWNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdGxldCB0eXBlID0gdGhpcy5wcm9wcy50eXBlIHx8ICdpbmZvJztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17ICdub3RpY2UgdHlwZS0nICsgdHlwZSB9PlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGljZTtcbiIsIi8qKlxuICogQGZpbGUgUm9vdCByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHsgY29tYmluZVJlZHVjZXJzIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCB2aWV3ID0gKCBjdXJyZW50ID0gJ2ZpbGVzJywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfVklFVyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnZpZXc7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBjdXJyZW50O1xuXHR9XG59O1xuXG5jb25zdCB7IHByb2plY3RzLCBhY3RpdmVQcm9qZWN0LCBhY3RpdmVQcm9qZWN0RmlsZXMgfSA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuY29uc3QgYWN0aXZlRmlsZSA9ICggZmlsZSA9IG51bGwsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnU0VUX0FDVElWRV9GSUxFJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuXHR2aWV3LFxuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzLFxuXHRhY3RpdmVGaWxlXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggcHJvamVjdHMgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5wcm9qZWN0cyxcblx0XHRcdFx0YWN0aW9uLnBheWxvYWRcblx0XHRcdF07XG5cdFx0Y2FzZSAnUkVNT1ZFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIHByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSBhY3Rpb24uaWQgKTtcblx0XHRjYXNlICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5tYXAoIGZ1bmN0aW9uKCBwcm9qZWN0LCBpbmRleCApIHtcblx0XHRcdFx0aWYgKCBpbmRleCA9PT0gcGFyc2VJbnQoIGFjdGlvbi5wYXlsb2FkLmlkLCAxMCApICkge1xuXHRcdFx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9qZWN0cztcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdCA9ICggYWN0aXZlID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGNhc2UgJ1NFVF9QUk9KRUNUX1NUQVRFJzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0Li4uYWN0aW9uLnBheWxvYWRcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBhY3RpdmU7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3RGaWxlcyA9ICggZmlsZXMgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdSRUNFSVZFX0ZJTEVTJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGVzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG92ZXJsYXksXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRsZXQgc3RhdGUgPSB7XG5cdFx0dmlldzogJ2ZpbGVzJyxcblx0XHRwcm9qZWN0czogW10sXG5cdFx0YWN0aXZlUHJvamVjdDogMCxcblx0XHRhY3RpdmVQcm9qZWN0RmlsZXM6IHt9LFxuXHRcdGFjdGl2ZUZpbGU6IG51bGxcblx0fTtcblxuXHRpZiAoIGdsb2JhbC5jb25maWcuaGFzKCAncHJvamVjdHMnICkgKSB7XG5cdFx0c3RhdGUucHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCggJ3Byb2plY3RzJyApO1xuXHR9XG5cblx0aWYgKCBzdGF0ZS5wcm9qZWN0cy5sZW5ndGggJiYgZ2xvYmFsLmNvbmZpZy5oYXMoICdhY3RpdmUtcHJvamVjdCcgKSApIHtcblx0XHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCggJ2FjdGl2ZS1wcm9qZWN0JyApO1xuXG5cdFx0aWYgKCBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QgPSBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QuaWQgPSBhY3RpdmVJbmRleDtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0bGV0IHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRwcm9qZWN0c1sgYWN0aXZlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlnLicgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlICkge1xuXHRsZXQgZGVwZW5kZW5jaWVzID0gW107XG5cblx0Zm9yICggdmFyIGRlcGVuZGVuY3kgaW4gZGVwZW5kZW5jeVRyZWUgKSB7XG5cdFx0ZGVwZW5kZW5jaWVzLnB1c2goIGRlcGVuZGVuY3kgKTtcblxuXHRcdGlmICggT2JqZWN0LmtleXMoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKS5sZW5ndGggPiAwICkge1xuXHRcdFx0ZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzLmNvbmNhdCggZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkgKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZGVwZW5kZW5jaWVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xlZXAsXG5cdGdldEluaXRpYWxTdGF0ZSxcblx0c2V0UHJvamVjdENvbmZpZyxcblx0Z2V0RGVwZW5kZW5jeUFycmF5XG59O1xuIl19
