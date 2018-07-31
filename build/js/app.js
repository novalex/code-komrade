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

			if (!this.props.value && this.props.sourceFile) {
				fileSaveOptions.defaultPath = this.props.sourceFile.path;
			} else if (this.props.value && this.props.sourceBase) {
				fileSaveOptions.defaultPath = fileAbsolutePath(this.props.sourceBase, this.props.value);
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

				if (this.props.onChange) {
					this.props.onChange(this.props.name, savePath);
				}
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
					value: this.props.value,
					readOnly: 'true'
				}),
				React.createElement(
					'small',
					{ onClick: this.onClick },
					this.props.value
				)
			);
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

		_this.onChange = _this.onChange.bind(_this);
		return _this;
	}

	_createClass(FieldSelect, [{
		key: 'onChange',
		value: function onChange(event) {
			event.persist();

			if (this.props.onChange) {
				this.props.onChange(this.props.name, event.target.value);
			}
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
					this.props.value ? this.props.options[this.props.value] : ''
				),
				React.createElement(
					'select',
					{
						name: this.props.name,
						onChange: this.onChange,
						value: this.props.value,
						disabled: this.props.disabled,
						id: 'field_' + this.props.name
					},
					this.getOptions()
				)
			);
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

		_this.onChange = _this.onChange.bind(_this);
		return _this;
	}

	_createClass(FieldSwitch, [{
		key: 'onChange',
		value: function onChange(event) {
			event.persist();

			if (this.props.onChange) {
				this.props.onChange(this.props.name, !this.props.value);
			}
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
					checked: this.props.value,
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
					output: slash(fileRelativePath(this.props.base, this.defaultOutputPath()))
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
			var options = this.state.options || {};
			options[option] = value;

			this.setConfig('options', options);

			this.setState({ options: options });
		}
	}, {
		key: 'handleChange',
		value: function handleChange(name, value) {
			if (name === 'output') {
				this.setConfig('output', value);

				this.setState(this.state);
			} else {
				this.setOption(name, value);
			}
		}
	}, {
		key: 'defaultOutputPath',
		value: function defaultOutputPath() {
			return fileOutputPath(this.props.file, this.outputSuffix, this.outputExtension);
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

			global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, function () {
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
						onChange: this.handleChange,
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
						onChange: this.handleChange,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87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QUFDRDs7QUFFRCxRQUFPLEtBQVA7QUFDQTs7QUFFRCxTQUFTLGdCQUFULENBQTJCLFFBQTNCLEVBQXFDLEtBQXJDLEVBQTZDO0FBQzVDLEtBQUksV0FBVyxPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLFVBQWxCLENBQWY7QUFDQSxLQUFJLGNBQWMsT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixnQkFBbEIsQ0FBbEI7O0FBRUEsS0FBSyxNQUFNLE9BQU4sQ0FBZSxRQUFmLEtBQTZCLFNBQVUsV0FBVixDQUFsQyxFQUE0RDtBQUMzRCxXQUFVLFdBQVYsRUFBeUIsUUFBekIsSUFBc0MsS0FBdEM7O0FBRUEsU0FBTyxNQUFQLENBQWMsR0FBZCxDQUFtQixVQUFuQixFQUErQixRQUEvQjtBQUNBLEVBSkQsTUFJTztBQUNOLFNBQU8sS0FBUCxDQUFjLGdEQUFkO0FBQ0E7QUFDRDs7QUFFRCxTQUFTLGtCQUFULENBQTZCLGNBQTdCLEVBQThDO0FBQzdDLEtBQUksZUFBZSxFQUFuQjs7QUFFQSxNQUFNLElBQUksVUFBVixJQUF3QixjQUF4QixFQUF5QztBQUN4QyxlQUFhLElBQWIsQ0FBbUIsVUFBbkI7O0FBRUEsTUFBSyxPQUFPLElBQVAsQ0FBYSxlQUFnQixVQUFoQixDQUFiLEVBQTRDLE1BQTVDLEdBQXFELENBQTFELEVBQThEO0FBQzdELGtCQUFlLGFBQWEsTUFBYixDQUFxQixtQkFBb0IsZUFBZ0IsVUFBaEIsQ0FBcEIsQ0FBckIsQ0FBZjtBQUNBO0FBQ0Q7O0FBRUQsUUFBTyxZQUFQO0FBQ0E7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2hCLGFBRGdCO0FBRWhCLGlDQUZnQjtBQUdoQixtQ0FIZ0I7QUFJaEI7QUFKZ0IsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEBmaWxlIEFjdGlvbnMuXG4gKi9cblxuLy8gTWFpbi5cblxuZnVuY3Rpb24gY2hhbmdlVmlldyggdmlldyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1ZJRVcnLFxuXHRcdHZpZXdcblx0fTtcbn1cblxuLy8gUHJvamVjdHMuXG5cbmZ1bmN0aW9uIGFkZFByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0FERF9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIGNoYW5nZVByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb2plY3QoIGlkICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRU1PVkVfUFJPSkVDVCcsXG5cdFx0aWRcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVmcmVzaEFjdGl2ZVByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFRlJFU0hfQUNUSVZFX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX1BST0pFQ1RfU1RBVEUnLFxuXHRcdHBheWxvYWQ6IHN0YXRlXG5cdH07XG59XG5cbi8vIEZpbGVzLlxuXG5mdW5jdGlvbiByZWNlaXZlRmlsZXMoIGZpbGVzICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUNFSVZFX0ZJTEVTJyxcblx0XHRwYXlsb2FkOiBmaWxlc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRBY3RpdmVGaWxlKCBmaWxlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfQUNUSVZFX0ZJTEUnLFxuXHRcdHBheWxvYWQ6IGZpbGVcblx0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNoYW5nZVZpZXcsXG5cdGFkZFByb2plY3QsXG5cdGNoYW5nZVByb2plY3QsXG5cdHJlbW92ZVByb2plY3QsXG5cdHNldFByb2plY3RTdGF0ZSxcblx0cmVjZWl2ZUZpbGVzLFxuXHRzZXRBY3RpdmVGaWxlLFxuXHRyZWZyZXNoQWN0aXZlUHJvamVjdFxufTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgc2NyaXB0LlxuICovXG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuZ2xvYmFsLmNvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdG5hbWU6ICdidWlsZHItY29uZmlnJ1xufSk7XG5cbmdsb2JhbC51aSA9IHJlcXVpcmUoJy4vdXRpbHMvZ2xvYmFsVUknKTtcblxuZ2xvYmFsLmNvbXBpbGVyID0gcmVxdWlyZSgnLi9jb21waWxlci9pbnRlcmZhY2UnKTtcblxuZ2xvYmFsLmNvbXBpbGVyVGFza3MgPSBbXTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCB7IFByb3ZpZGVyIH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IGNyZWF0ZVN0b3JlIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCByb290UmVkdWNlciA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxuY29uc3QgeyBnZXRJbml0aWFsU3RhdGUgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcbmNvbnN0IGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpO1xuXG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKCByb290UmVkdWNlciwgaW5pdGlhbFN0YXRlICk7XG5cbmdsb2JhbC5zdG9yZSA9IHN0b3JlO1xuXG5jb25zdCBBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQXBwJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXsgc3RvcmUgfT5cblx0XHQ8QXBwIC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pO1xuXG5jb25zdCB7IHNsZWVwIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5cbi8vIEFwcCBjbG9zZS9yZXN0YXJ0IGV2ZW50cy5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA+IDAgKSB7XG5cdFx0Y29uc29sZS5sb2coICdLaWxsaW5nICVkIHJ1bm5pbmcgdGFza3MuLi4nLCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblxuXHRcdHNsZWVwKCAzMDAgKTtcblx0fVxufSk7XG4iLCIvKipcbiogQGZpbGUgR3VscCBzY3JpcHRzIGFuZCB0YXNrcy5cbiovXG5cbi8qIGdsb2JhbCBOb3RpZmljYXRpb24gKi9cblxuY29uc3QgeyBhcHAgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcHNUcmVlID0gcmVxdWlyZSgncHMtdHJlZScpO1xuY29uc3QgZGVwZW5kZW5jeVRyZWUgPSByZXF1aXJlKCdkZXBlbmRlbmN5LXRyZWUnKTtcblxuY29uc3Qgc2FzcyA9IHJlcXVpcmUoJ25vZGUtc2FzcycpO1xuY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcbmNvbnN0IGZvcm1hdE1lc3NhZ2VzID0gcmVxdWlyZSgnLi9tZXNzYWdlcycpO1xuXG5jb25zdCB7IGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5jb25zdCB7IGdldERlcGVuZGVuY3lBcnJheSB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbHMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgcGlkIG9mIFsgcHJvYy5waWQgXS5jb25jYXQoIGNoaWxkcmVuLm1hcCggY2hpbGQgPT4gY2hpbGQuUElEICkgKSApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHByb2Nlc3Mua2lsbCggcGlkICk7XG5cdFx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5IGxvbCBZT0xPXG5cdFx0XHRcdC8vIGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZSxcblx0XHRwcm9qZWN0Q29uZmlnOiBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRjb25zb2xlLmxvZyggb3B0aW9ucyApO1xuXG5cdGxldCBtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ25vZGVfbW9kdWxlcycgKTtcblx0aWYgKCAhIG1vZHVsZXNQYXRoLm1hdGNoKCdhcHAnKSApIHtcblx0XHRtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ2FwcC9ub2RlX21vZHVsZXMnICk7XG5cdH1cblxuXHQvLyBHZXQgaW1wb3J0ZWQgZmlsZXMuXG5cdGxldCB3YXRjaEZpbGVzID0gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSh7XG5cdFx0ZmlsZW5hbWU6IG9wdGlvbnMuaW5wdXQsXG5cdFx0ZGlyZWN0b3J5OiBvcHRpb25zLnByb2plY3RCYXNlXG5cdH0pKTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8ICdmaWxlJztcblxuXHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgQ29tcGlsaW5nICR7ZmlsZW5hbWV9Li4uYCApO1xuXG5cdGlmICggdGFza05hbWUgPT09ICdidWlsZC1zYXNzJyApIHtcblx0XHRsZXQgb3V0RmlsZSA9IHBhdGgucmVzb2x2ZSggb3B0aW9ucy5vdXRwdXQsIG9wdGlvbnMuZmlsZW5hbWUgKTtcblxuXHRcdHNhc3MucmVuZGVyKCB7XG5cdFx0XHRmaWxlOiBvcHRpb25zLmlucHV0LFxuXHRcdFx0b3V0RmlsZTogb3V0RmlsZSxcblx0XHRcdG91dHB1dFN0eWxlOiBvcHRpb25zLnN0eWxlLFxuXHRcdFx0c291cmNlTWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0XHR9LCBmdW5jdGlvbiggZXJyb3IsIHJlc3VsdCApIHtcblx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIGZpbGVuYW1lLCBlcnJvciApO1xuXG5cdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gZXJyb3JzIGR1cmluZyB0aGUgY29tcGlsYXRpb24sIHdyaXRlIHRoaXMgcmVzdWx0IG9uIHRoZSBkaXNrXG5cdFx0XHRcdGZzLndyaXRlRmlsZSggb3V0RmlsZSwgcmVzdWx0LmNzcywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBmaWxlbmFtZSwgZXJyICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2VzcyggZmlsZW5hbWUgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0gZWxzZSB7XG5cdFx0bGV0IGNvbmZpZyA9IHtcblx0XHRcdG1vZGU6ICdwcm9kdWN0aW9uJyxcblx0XHRcdGVudHJ5OiBvcHRpb25zLmlucHV0LFxuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdHBhdGg6IG9wdGlvbnMub3V0cHV0LFxuXHRcdFx0XHRmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZVxuXHRcdFx0fSxcblx0XHRcdHJlc29sdmVMb2FkZXI6IHtcblx0XHRcdFx0bW9kdWxlczogWyBtb2R1bGVzUGF0aCBdXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHdlYnBhY2soIGNvbmZpZywgKCBlcnIsIHN0YXRzICkgPT4ge1xuXHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtZXNzYWdlcyA9IGZvcm1hdE1lc3NhZ2VzKCBzdGF0cyApO1xuXG5cdFx0XHRpZiAoICEgbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCAmJiAhIG1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIGZpbGVuYW1lICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggZmlsZW5hbWUsIG1lc3NhZ2VzLmVycm9ycyApO1xuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIHdhcm5pbmcocykuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggZmlsZW5hbWUsIG1lc3NhZ2VzLndhcm5pbmdzICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIGZpbGVuYW1lICkge1xuXHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ3N1Y2Nlc3MnLCBub3RpZnlUZXh0ICk7XG5cblx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0Ym9keTogbm90aWZ5VGV4dCxcblx0XHRzaWxlbnQ6IHRydWVcblx0fSApO1xuXG5cdHJldHVybiBub3RpZnk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVFcnJvciggZmlsZW5hbWUsIGVycm9ycyApIHtcblx0Y29uc29sZS5lcnJvciggZXJyb3JzICk7XG5cblx0aWYgKCAhIGVycm9ycy5sZW5ndGggKSB7XG5cdFx0ZXJyb3JzID0gWyBlcnJvcnMgXTtcblx0fVxuXG5cdGxldCBub3RpZnlUZXh0ID0gKCBlcnJvcnMubGVuZ3RoID4gMSA/ICdFcnJvcnMnIDogJ0Vycm9yJyApICsgYCB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfWA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIG5vdGlmeVRleHQgKyAnOicsICc8cHJlPicgKyBlcnJvcnMuam9pbiggJ1xcclxcbicgKSArICc8L3ByZT4nICk7XG5cblx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0Ym9keTogbm90aWZ5VGV4dCxcblx0XHRzb3VuZDogJ0Jhc3NvJ1xuXHR9ICk7XG5cblx0cmV0dXJuIG5vdGlmeTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBmaWxlbmFtZSwgd2FybmluZ3MgKSB7XG5cdGNvbnNvbGUud2Fybiggd2FybmluZ3MgKTtcblxuXHRpZiAoICEgd2FybmluZ3MubGVuZ3RoICkge1xuXHRcdHdhcm5pbmdzID0gWyB3YXJuaW5ncyBdO1xuXHR9XG5cblx0bGV0IG5vdGlmeVRleHQgPSAoIHdhcm5pbmdzLmxlbmd0aCA+IDEgPyAnV2FybmluZ3MnIDogJ1dhcm5pbmcnICkgKyBgIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9YDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ3dhcm4nLCBub3RpZnlUZXh0ICsgJzonLCAnPHByZT4nICsgd2FybmluZ3Muam9pbiggJ1xcclxcbicgKSArICc8L3ByZT4nICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0UHJvamVjdCxcblx0cnVuVGFzayxcblx0a2lsbFRhc2tzLFxuXHRwcm9jZXNzRmlsZSxcblx0Z2V0RmlsZUNvbmZpZyxcblx0Z2V0RmlsZU9wdGlvbnMsXG5cdHRlcm1pbmF0ZVByb2Nlc3Ncbn1cbiIsIi8qKlxuICogVGhpcyBoYXMgYmVlbiBhZGFwdGVkIGZyb20gYGNyZWF0ZS1yZWFjdC1hcHBgLCBhdXRob3JlZCBieSBGYWNlYm9vaywgSW5jLlxuICogc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2tpbmN1YmF0b3IvY3JlYXRlLXJlYWN0LWFwcC90cmVlL21hc3Rlci9wYWNrYWdlcy9yZWFjdC1kZXYtdXRpbHNcbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcbmNvbnN0IHN0cmlwSW5kZW50ID0gcmVxdWlyZSgnc3RyaXAtaW5kZW50Jyk7XG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBlcnJvckxhYmVsID0gJ1N5bnRheCBlcnJvcjonO1xuY29uc3QgaXNMaWtlbHlBU3ludGF4RXJyb3IgPSBzdHIgPT4gc3RyLmluY2x1ZGVzKCBlcnJvckxhYmVsICk7XG5cbmNvbnN0IGV4cG9ydFJlZ2V4ID0gL1xccyooLis/KVxccyooXCIpP2V4cG9ydCAnKC4rPyknIHdhcyBub3QgZm91bmQgaW4gJyguKz8pJy87XG5jb25zdCBzdGFja1JlZ2V4ID0gL15cXHMqYXRcXHMoKD8hd2VicGFjazopLikqOlxcZCs6XFxkK1tcXHMpXSooXFxufCQpL2dtO1xuY29uc3QgZmlsZUFuZExpbmVSZWdleCA9IC9pbiAoW14oXSopXFxzXFwobGluZVxccyhcXGQqKSxcXHNjb2x1bW5cXHMoXFxkKilcXCkvO1xuXG5mdW5jdGlvbiBmb3JtYXRNZXNzYWdlKCBtZXNzYWdlLCBpc0Vycm9yICkge1xuXHRsZXQgbGluZXMgPSBtZXNzYWdlLnNwbGl0KCAnXFxuJyApO1xuXG5cdGlmICggbGluZXMubGVuZ3RoID4gMiAmJiBsaW5lc1sgMSBdID09PSAnJyApIHtcblx0XHRsaW5lcy5zcGxpY2UoIDEsIDEgKTsgLy8gUmVtb3ZlIGV4dHJhIG5ld2xpbmUuXG5cdH1cblxuXHQvLyBSZW1vdmUgbG9hZGVyIG5vdGF0aW9uIGZyb20gZmlsZW5hbWVzOlxuXHQvLyAgIGAuL34vY3NzLWxvYWRlciEuL3NyYy9BcHAuY3NzYCB+fj4gYC4vc3JjL0FwcC5jc3NgXG5cdGlmICggbGluZXNbMF0ubGFzdEluZGV4T2YoICchJyApICE9PSAtMSApIHtcblx0XHRsaW5lc1swXSA9IGxpbmVzWzBdLnN1YnN0ciggbGluZXNbIDAgXS5sYXN0SW5kZXhPZiggJyEnICkgKyAxICk7XG5cdH1cblxuXHQvLyBSZW1vdmUgdXNlbGVzcyBgZW50cnlgIGZpbGVuYW1lIHN0YWNrIGRldGFpbHNcblx0bGluZXMgPSBsaW5lcy5maWx0ZXIoIGxpbmUgPT4gbGluZS5pbmRleE9mKCAnIEAgJyApICE9PSAwICk7XG5cblx0Ly8gMCB+PiBmaWxlbmFtZTsgMSB+PiBtYWluIGVyciBtc2dcblx0aWYgKCAhIGxpbmVzWzBdIHx8ICEgbGluZXNbMV0gKSB7XG5cdFx0cmV0dXJuIGxpbmVzLmpvaW4oICdcXG4nICk7XG5cdH1cblxuXHQvLyBDbGVhbnMgdXAgdmVyYm9zZSBcIm1vZHVsZSBub3QgZm91bmRcIiBtZXNzYWdlcyBmb3IgZmlsZXMgYW5kIHBhY2thZ2VzLlxuXHRpZiAoIGxpbmVzWzFdLnN0YXJ0c1dpdGgoICdNb2R1bGUgbm90IGZvdW5kOiAnICkgKSB7XG5cdFx0bGluZXMgPSBbXG5cdFx0XHRsaW5lc1swXSxcblx0XHRcdGxpbmVzWzFdIC8vIFwiTW9kdWxlIG5vdCBmb3VuZDogXCIgaXMgZW5vdWdoIGRldGFpbFxuXHRcdFx0XHQucmVwbGFjZSggXCJDYW5ub3QgcmVzb2x2ZSAnZmlsZScgb3IgJ2RpcmVjdG9yeScgXCIsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdDYW5ub3QgcmVzb2x2ZSBtb2R1bGUgJywgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ0Vycm9yOiAnLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnW0Nhc2VTZW5zaXRpdmVQYXRoc1BsdWdpbl0gJywgJycgKVxuXHRcdF07XG5cdH1cblxuXHQvLyBDbGVhbnMgdXAgc3ludGF4IGVycm9yIG1lc3NhZ2VzLlxuXHRpZiAoIGxpbmVzWzFdLnN0YXJ0c1dpdGgoICdNb2R1bGUgYnVpbGQgZmFpbGVkOiAnICkgKSB7XG5cdFx0bGluZXNbMV0gPSBsaW5lc1sxXS5yZXBsYWNlKCAnTW9kdWxlIGJ1aWxkIGZhaWxlZDogU3ludGF4RXJyb3I6JywgZXJyb3JMYWJlbCApO1xuXHR9XG5cblx0aWYgKCBsaW5lc1sxXS5tYXRjaCggZXhwb3J0UmVnZXggKSApIHtcblx0XHRsaW5lc1sxXSA9IGxpbmVzWzFdLnJlcGxhY2UoIGV4cG9ydFJlZ2V4LCBcIiQxICckNCcgZG9lcyBub3QgY29udGFpbiBhbiBleHBvcnQgbmFtZWQgJyQzJy5cIiApO1xuXHR9XG5cblx0Ly8gUmVhc3NlbWJsZSAmIFN0cmlwIGludGVybmFsIHRyYWNpbmcsIGV4Y2VwdCBgd2VicGFjazpgIC0tIChjcmVhdGUtcmVhY3QtYXBwL3B1bGwvMTA1MClcblx0cmV0dXJuIGxpbmVzLmpvaW4oICdcXG4nICkucmVwbGFjZSggc3RhY2tSZWdleCwgJycgKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN0ZGVyciggZGF0YSApIHtcblx0Y29uc29sZS5sb2coIGRhdGEgKTtcblxuXHRsZXQgZXJyT2JqID0ge307XG5cdGxldCBzdGFydENhcHR1cmUgPSBmYWxzZTtcblxuXHR2YXIgbGluZXMgPSBkYXRhLnNwbGl0KCAvKFxcclxcbnxbXFxuXFx2XFxmXFxyXFx4ODVcXHUyMDI4XFx1MjAyOV0pLyApO1xuXG5cdGZvciAoIHZhciBsaW5lIG9mIGxpbmVzICkge1xuXHRcdGxldCB0cmltbWVkID0gbGluZS50cmltKCk7XG5cblx0XHRpZiAoICF0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclsgMCBdIF0gPSBlcnJBcnJbIDEgXTtcblxuXHRcdFx0aWYgKCBlcnJBcnJbIDAgXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGVyck9iai5maWxlICkgKSArXG5cdFx0XHRcdCcgb24gbGluZSAnICsgZXJyT2JqLmxpbmUgK1xuXHRcdFx0XHQnPC9jb2RlPic7XG5cblx0XHRcdGxldCBkZXRhaWxzID0gJzxwcmU+JyArIGxpbmVzICsgJzwvcHJlPic7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCB0aXRsZSwgZGV0YWlscyApO1xuXHRcdH0gKTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uICggZXJyLCBkYXRhICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdHZhciBsaW5lcyA9IGRhdGEudG9TdHJpbmcoICd1dGYtOCcgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdGlmICggK2xpbmUgPiBsaW5lcy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGxpbmVBcnIgPSBbXTtcblx0XHRsZXQgX2xpbmVBcnIgPSBbXTtcblx0XHRsZXQgbWluTGluZSA9IE1hdGgubWF4KCBsaW5lIC0gMiwgMCApO1xuXHRcdGxldCBtYXhMaW5lID0gTWF0aC5taW4oIGxpbmUgKyAyLCBsaW5lcy5sZW5ndGggKTtcblxuXHRcdGZvciAoIHZhciBpID0gbWluTGluZTsgaSA8PSBtYXhMaW5lOyBpKysgKSB7XG5cdFx0XHRfbGluZUFyclsgaSBdID0gbGluZXNbIGkgXTtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgZXh0cmFuZW91cyBpbmRlbnRhdGlvbi5cblx0XHRsZXQgc3RyaXBwZWRMaW5lcyA9IHN0cmlwSW5kZW50KCBfbGluZUFyci5qb2luKCAnXFxuJyApICkuc3BsaXQoICdcXG4nICk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1udW1iZXJcIj4nICsgKCBqICsgMSApICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1jb250ZW50XCI+JyArIHN0cmlwcGVkTGluZXNbIGogXSArICc8L3NwYW4+JyArXG5cdFx0XHRcdCc8L2Rpdj4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNhbGxiYWNrKCBudWxsLCBsaW5lQXJyLmpvaW4oICdcXG4nICkgKTtcblx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVGaWxlQW5kTGluZUVycm9ycyggbWVzc2FnZSApIHtcblx0bGV0IGZpbGVBbmRMaW5lID0gbWVzc2FnZS5tYXRjaCggZmlsZUFuZExpbmVSZWdleCApO1xuXG5cdGlmICggISBmaWxlQW5kTGluZSApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgZmlsZSA9IGZpbGVBbmRMaW5lWyAxIF07XG5cdGxldCBsaW5lID0gZmlsZUFuZExpbmVbIDIgXTtcblxuXHRjb25zb2xlLmxvZyggZmlsZUFuZExpbmUgKTtcblxuXHRnZXRFcnJMaW5lcyggZmlsZSwgbGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgdGl0bGUgPSBtZXNzYWdlLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHQnPGNvZGU+JyArXG5cdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZmlsZSApICkgK1xuXHRcdFx0JyBvbiBsaW5lICcgKyBsaW5lICtcblx0XHRcdCc8L2NvZGU+JztcblxuXHRcdGxldCBkZXRhaWxzID0gJzxwcmU+JyArIGxpbmVzICsgJzwvcHJlPic7XG5cblx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0fSApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBzdGF0cyApIHtcblx0Y29uc3QganNvbiA9IHN0YXRzLnRvSnNvbigge30sIHRydWUgKTtcblxuXHRqc29uLmVycm9ycy5tYXAoIG1zZyA9PiBoYW5kbGVGaWxlQW5kTGluZUVycm9ycyggbXNnICkgKTtcblxuXHRjb25zdCByZXN1bHQgPSB7XG5cdFx0ZXJyb3JzOiBqc29uLmVycm9ycy5tYXAoIG1zZyA9PiBmb3JtYXRNZXNzYWdlKCBtc2csIHRydWUgKSApLFxuXHRcdHdhcm5pbmdzOiBqc29uLndhcm5pbmdzLm1hcCggbXNnID0+IGZvcm1hdE1lc3NhZ2UoIG1zZywgZmFsc2UgKSApXG5cdH07XG5cblx0Ly8gT25seSBzaG93IHN5bnRheCBlcnJvcnMgaWYgd2UgaGF2ZSB0aGVtXG5cdGlmICggcmVzdWx0LmVycm9ycy5zb21lKCBpc0xpa2VseUFTeW50YXhFcnJvciApICkge1xuXHRcdHJlc3VsdC5lcnJvcnMgPSByZXN1bHQuZXJyb3JzLmZpbHRlciggaXNMaWtlbHlBU3ludGF4RXJyb3IgKTtcblx0fVxuXG5cdC8vIEZpcnN0IGVycm9yIGlzIHVzdWFsbHkgaXQ7IG90aGVycyB1c3VhbGx5IHRoZSBzYW1lXG5cdGlmICggcmVzdWx0LmVycm9ycy5sZW5ndGggPiAxICkge1xuXHRcdHJlc3VsdC5lcnJvcnMubGVuZ3RoID0gMTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRNZXNzYWdlID0gZm9ybWF0TWVzc2FnZTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgY29tcG9uZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XG5cbmNvbnN0IFNpZGViYXIgPSByZXF1aXJlKCcuL1NpZGViYXInKTtcblxuY29uc3QgTG9ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvTG9ncycpO1xuXG5jb25zdCBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvU2V0dGluZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMudmlld3MgPSB7XG5cdFx0XHRmaWxlczogJ0ZpbGVzJyxcblx0XHRcdGxvZ3M6ICdMb2dzJyxcblx0XHRcdHNldHRpbmdzOiAnU2V0dGluZ3MnXG5cdFx0fTtcblx0fVxuXG5cdHJlbmRlck92ZXJsYXkoKSB7XG5cdFx0Z2xvYmFsLnVpLm92ZXJsYXkoIHRoaXMucHJvcHMudmlldyAhPT0gJ2ZpbGVzJyApO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdmaWxlcycgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gPFNldHRpbmdzIC8+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8T3ZlcmxheSBoYXNDbG9zZT17IGZhbHNlIH0+XG5cdFx0XHRcdFx0eyBjb250ZW50IH1cblx0XHRcdFx0PC9PdmVybGF5PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2FwcCc+XG5cdFx0XHRcdDxTaWRlYmFyIGl0ZW1zPXsgdGhpcy52aWV3cyB9IC8+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudC13cmFwJz5cblx0XHRcdFx0XHQ8UHJvamVjdHMgLz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlck92ZXJsYXkoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHR2aWV3OiBzdGF0ZS52aWV3LFxuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBBcHAgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBlbXB0eSBzY3JlZW4vbm8gY29udGVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vLWNvbnRlbnQnICsgKCBwcm9wcy5jbGFzc05hbWUgPyAnICcgKyBwcm9wcy5jbGFzc05hbWUgOiAnJyApIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGFuIG92ZXJsYXkuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBPdmVybGF5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Ly8gY29uc3RydWN0b3IoKSB7fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nb3ZlcmxheSc+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5oYXNDbG9zZSAmJlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGlkPSdjbG9zZS1vdmVybGF5Jz4mdGltZXM7PC9hPlxuXHRcdFx0XHR9XG5cblx0XHRcdFx0PGRpdiBpZD0nb3ZlcmxheS1jb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7XG4iLCIvKipcbiAqIEBmaWxlIEFwcCBzaWRlYmFyLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjaGFuZ2VWaWV3IH0gPSByZXF1aXJlKCcuLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY2xhc3MgU2lkZWJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHRsZXQgdmlldyA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC52aWV3O1xuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VWaWV3KCB2aWV3ICk7XG5cdH1cblxuXHRyZW5kZXJJdGVtcygpIHtcblx0XHRsZXQgaXRlbXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpZCBpbiB0aGlzLnByb3BzLml0ZW1zICkge1xuXHRcdFx0aXRlbXMucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdmlldz17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXRpcD17IHRoaXMucHJvcHMuaXRlbXNbIGlkIF0gfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMuYWN0aXZlID09PSBpZCA/ICdhY3RpdmUnIDogJycgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdHJldHVybiBpdGVtcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PG5hdiBpZD0nc2lkZWJhcic+XG5cdFx0XHRcdDx1bCBpZD0nbWVudSc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckl0ZW1zKCkgfVxuXHRcdFx0XHQ8L3VsPlxuXHRcdFx0PC9uYXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlOiBzdGF0ZS52aWV3XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGNoYW5nZVZpZXc6IHZpZXcgPT4gZGlzcGF0Y2goIGNoYW5nZVZpZXcoIHZpZXcgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBTaWRlYmFyICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgc2F2ZSBmaWxlIGZpZWxkLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVTYXZlT3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLnRpdGxlID0gdGhpcy5wcm9wcy5kaWFsb2dUaXRsZTtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnByb3BzLnZhbHVlICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5wcm9wcy52YWx1ZSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmZpbHRlcnMgPSB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gZGlhbG9nLnNob3dTYXZlRGlhbG9nKCBmaWxlU2F2ZU9wdGlvbnMgKTtcblxuXHRcdGlmICggZmlsZW5hbWUgKSB7XG5cdFx0XHRsZXQgc2F2ZVBhdGggPSBzbGFzaCggZmlsZW5hbWUgKTtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRcdHNhdmVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgZmlsZW5hbWUgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgc2F2ZVBhdGggKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdoaWRkZW4nXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRyZWFkT25seT0ndHJ1ZSdcblx0XHRcdFx0Lz5cblx0XHRcdFx0PHNtYWxsIG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT57IHRoaXMucHJvcHMudmFsdWUgfTwvc21hbGw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgZXZlbnQudGFyZ2V0LnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMucHJvcHMudmFsdWUgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXIgXSksXG5cdG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgISB0aGlzLnByb3BzLnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFN3aXRjaC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5ib29sLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBsb2dzIGFuZCBpbmZvcm1hdGlvbi5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGxldCBsb2dJbmRleCA9IDA7XG5cdFx0bGV0IGxvZ0xpc3QgPSBbXTtcblxuXHRcdGZvciAoIHZhciBsb2cgb2YgdGhpcy5zdGF0ZS5sb2dzICkge1xuXHRcdFx0bGV0IHRpdGxlSFRNTCA9IHsgX19odG1sOiBsb2cudGl0bGUgfTtcblx0XHRcdGxldCBib2R5SFRNTCA9ICggbG9nLmJvZHkgKSA/IHsgX19odG1sOiBsb2cuYm9keSB9IDogbnVsbDtcblxuXHRcdFx0bG9nTGlzdC5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBsb2dJbmRleCB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgJ3R5cGUtJyArIGxvZy50eXBlIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0XHQ8c21hbGw+eyBsb2cudGltZSB9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUtdGV4dCcgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyB0aXRsZUhUTUwgfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHsgYm9keUhUTUwgJiZcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXRhaWxzJyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IGJvZHlIVE1MIH0gLz5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpO1xuXHRcdFx0bG9nSW5kZXgrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gPHVsPnsgbG9nTGlzdCB9PC91bD47XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUubG9ncy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4gZW1wdHknPlxuXHRcdFx0XHRcdDxoMz5ObyBsb2dzIHlldC48L2gzPlxuXHRcdFx0XHRcdDxwPkdvIGZvcnRoIGFuZCBjb21waWxlITwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdsb2dzJyBjbGFzc05hbWU9J2xvZ3Mtc2NyZWVuJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHBhbmVsLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1NjcmlwdCA9IHJlcXVpcmUoJy4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTY3JpcHQnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTdHlsZSA9IHJlcXVpcmUoJy4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRnZXRPcHRpb25zKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1N0eWxlIGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1NjcmlwdCBiYXNlPXsgdGhpcy5wcm9wcy5wcm9qZWN0LnBhdGggfSBmaWxlPXsgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUgfSAvPjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNvbnRlbnQoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRsZXQgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuXG5cdFx0XHRpZiAoIG9wdGlvbnMgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdDxwPlNlbGVjdCBhIHN0eWxlc2hlZXQgb3Igc2NyaXB0IGZpbGUgdG8gdmlldyBjb21waWxpbmcgb3B0aW9ucy48L3A+XG5cdFx0XHQ8L05vQ29udGVudD5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwYW5lbCc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDb250ZW50KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZSxcblx0cHJvamVjdDogc3RhdGUuYWN0aXZlUHJvamVjdCxcblx0ZmlsZXM6IHN0YXRlLmFjdGl2ZVByb2plY3RGaWxlc1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIFBhbmVsICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdFN0YXRlLCByZWZyZXNoQWN0aXZlUHJvamVjdCB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IHNldFByb2plY3RDb25maWcgfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3V0aWxzJyk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlUHJvamVjdCA9IHRoaXMudG9nZ2xlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0Z2xvYmFsLnVpLnVuZm9jdXMoICEgdGhpcy5zdGF0ZS5pc09wZW4gKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBpc09wZW46ICEgdGhpcy5zdGF0ZS5pc09wZW4gfSk7XG5cdH1cblxuXHR0b2dnbGVQcm9qZWN0KCkge1xuXHRcdGxldCBwYXVzZWQgPSAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCB8fCBmYWxzZTtcblxuXHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdFN0YXRlKHsgcGF1c2VkOiBwYXVzZWQgfSk7XG5cblx0XHR0aGlzLnByb3BzLnJlZnJlc2hBY3RpdmVQcm9qZWN0KHtcblx0XHRcdC4uLnRoaXMucHJvcHMuYWN0aXZlLFxuXHRcdFx0cGF1c2VkOiBwYXVzZWRcblx0XHR9KTtcblxuXHRcdHNldFByb2plY3RDb25maWcoICdwYXVzZWQnLCBwYXVzZWQgKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0KCk7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMucHJvcHMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnByb3BzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMucHJvcHMucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gc2VsZWN0IG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0JyBjbGFzc05hbWU9J3NlbGVjdGVkJz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aW9ucyc+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPXsgJ3RvZ2dsZScgKyAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCA/ICcgcGF1c2VkJyA6ICcgYWN0aXZlJyApIH0gb25DbGljaz17IHRoaXMudG9nZ2xlUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZWZyZXNoJyBvbkNsaWNrPXsgdGhpcy5wcm9wcy5yZWZyZXNoUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZW1vdmUnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlbW92ZVByb2plY3QgfSAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdFxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRQcm9qZWN0U3RhdGU6IHN0YXRlID0+IGRpc3BhdGNoKCBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkgKSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdFNlbGVjdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyB2aWV3LlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBfZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2gvZGVib3VuY2UnKTtcblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgTm90aWNlID0gcmVxdWlyZSgnLi4vdWkvTm90aWNlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IFBhbmVsID0gcmVxdWlyZSgnLi9QYW5lbCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZGlyZWN0b3J5VHJlZScpO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9Mb2dnZXInKTtcblxuY29uc3QgeyBhZGRQcm9qZWN0LCByZW1vdmVQcm9qZWN0LCBjaGFuZ2VQcm9qZWN0LCByZWNlaXZlRmlsZXMsIHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJyxcblx0XHRcdFx0J2J1aWxkci1wcm9qZWN0Lmpzb24nXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmluaXRQcm9qZWN0ID0gdGhpcy5pbml0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0ID0gdGhpcy5jaGFuZ2VQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0bGV0IG5ld1Byb2plY3RJbmRleCA9IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIFtcblx0XHRcdFx0Li4udGhpcy5wcm9wcy5wcm9qZWN0cyxcblx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XSApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbmV3UHJvamVjdEluZGV4LCBuZXdQcm9qZWN0ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQsIHByb2plY3QgPSBudWxsICkge1xuXHRcdGlmICggaWQgPT09IHRoaXMucHJvcHMuYWN0aXZlLmlkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmICggcHJvamVjdCApIHtcblx0XHRcdGFjdGl2ZSA9IHByb2plY3Q7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy5wcm9qZWN0c1tpZF0gKSB7XG5cdFx0XHRhY3RpdmUgPSB0aGlzLnByb3BzLnByb2plY3RzW2lkXTtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpZCApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRpZFxuXHRcdH0pO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3RoaXMucHJvcHMuYWN0aXZlLm5hbWV9P2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdGxldCByZW1vdmVJbmRleCA9IHBhcnNlSW50KCB0aGlzLnByb3BzLmFjdGl2ZS5pZCwgMTAgKTtcblxuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gcmVtb3ZlSW5kZXggKTtcblxuXHRcdFx0Ly8gUmVtb3ZlIHByb2plY3QgZnJvbSBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdFx0dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0KCByZW1vdmVJbmRleCApO1xuXG5cdFx0XHQvLyBVbnNldCBhY3RpdmUgcHJvamVjdC5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbnVsbCApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVmcmVzaCB0aGUgcHJvamVjdCBmaWxlcy5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG9yIGZldGNoIHRoZSBwcm9qZWN0IGNvbmZpZyBmaWxlLlxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHQvLyBDaG9zZW4gZGlyZWN0b3J5IG5vdCByZWFkYWJsZSBvciBubyBwYXRoIHByb3ZpZGVkLlxuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LmAgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbnVsbDtcblxuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcygge30gKSApO1xuXG5cdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERpcmVjdG9yeSBpcyByZWFkYWJsZSwgZ2V0IGZpbGVzIGFuZCBzZXR1cCBjb25maWcuXG5cdFx0XHRcdHRoaXMuZ2V0RmlsZXMoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLnNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICk7XG5cblx0XHRcdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdFx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHRcdH1cblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0IH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMz5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+V291bGQgeW91IGxpa2UgdG8gYWRkIG9uZSBub3c/PC9wPlxuXHRcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPSdsYXJnZSBmbGF0IGFkZC1uZXctcHJvamVjdCcgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PkFkZCBQcm9qZWN0PC9idXR0b24+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdCBzZWxlY3RlZCwgc2hvdyBzZWxlY3Rvci5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdwcm9qZWN0LXNlbGVjdC1zY3JlZW4nPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3RzJz5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlck5vdGljZXMoKSB9XG5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdGZpbGVzPXsgdGhpcy5wcm9wcy5maWxlcyB9XG5cdFx0XHRcdFx0XHRsb2FkaW5nPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8UGFuZWwgLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGFkZFByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIGFkZFByb2plY3QoIHByb2plY3QgKSApLFxuXHRjaGFuZ2VQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggY2hhbmdlUHJvamVjdCggaWQgKSApLFxuXHRyZW1vdmVQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggcmVtb3ZlUHJvamVjdCggaWQgKSApLFxuXHRzZXRBY3RpdmVGaWxlOiBmaWxlID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBmaWxlICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMz5TZXR0aW5nczwvaDM+XG5cdFx0XHRcdDxwPkNvbWluZyBzb29uITwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZUxpc3RGaWxlID0gcmVxdWlyZSgnLi9GaWxlTGlzdEZpbGUnKTtcblxuY29uc3QgRmlsZUxpc3REaXJlY3RvcnkgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RGlyZWN0b3J5Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jb25zdCB7IHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSAmJiB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudCA9PT0gZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdGZpbGVQcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJywgJ2hhcy1vcHRpb25zJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoXG5cdFx0XHR0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0PHA+TG9hZGluZyZoZWxsaXA7PC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vIHByb2plY3QgZm9sZGVyIHNlbGVjdGVkLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5Ob3RoaW5nIHRvIHNlZSBoZXJlLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IGZpbGVsaXN0IH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZVxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRBY3RpdmVGaWxlOiBwYXlsb2FkID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBwYXlsb2FkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggRmlsZUxpc3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCB7IHJlbW90ZSwgc2hlbGwgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmNvbnN0IHsgTWVudSwgTWVudUl0ZW0gfSA9IHJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSh7XG5cdFx0XHRmaWxlOiB0aGlzLnByb3BzLmZpbGUsXG5cdFx0XHRlbGVtZW50OiBldmVudC5jdXJyZW50VGFyZ2V0XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMgKSB7XG5cdFx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2xvYmFsLmNvbXBpbGVyLmdldEZpbGVPcHRpb25zKCBuZXh0UHJvcHMuZmlsZSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IGNvbXBpbGVPcHRpb25zLnR5cGUsXG5cdFx0XHRmaWxlVHlwZTogY29tcGlsZU9wdGlvbnMuZmlsZVR5cGUsXG5cdFx0XHRidWlsZFRhc2tOYW1lOiBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lLFxuXHRcdFx0b3B0aW9uczogRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5iYXNlLCBuZXh0UHJvcHMuZmlsZSApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRPcHRpb25zRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRsZXQgY2ZpbGUgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApO1xuXG5cdFx0cmV0dXJuICggY2ZpbGUgJiYgY2ZpbGUub3B0aW9ucyApID8gY2ZpbGUub3B0aW9ucyA6IHt9O1xuXHR9XG5cblx0c3RhdGljIGdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGlmICggZmlsZSAmJiBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBiYXNlLCBmaWxlLnBhdGggKSApO1xuXG5cdFx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0XHRsZXQgY2ZpbGUgPSBmaWxlcy5maW5kKCBjZmlsZSA9PiBjZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0XHRpZiAoIGNmaWxlICkge1xuXHRcdFx0XHRyZXR1cm4gY2ZpbGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBudWxsICkgPyBzdG9yZWQgOiBkZWZhdWx0cztcblxuXHRcdGlmICggcHJvcGVydHkgKSB7XG5cdFx0XHRyZXR1cm4gKCBjb25maWdbIHByb3BlcnR5IF0gKSA/IGNvbmZpZ1sgcHJvcGVydHkgXSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9XG5cdH1cblxuXHRzZXRDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBwcm9wZXJ0eSApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGxldCBmaWxlQ29uZmlnID0ge1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0dHlwZTogdGhpcy5zdGF0ZS5maWxlVHlwZSxcblx0XHRcdFx0b3V0cHV0OiBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKSApXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgKSB7XG5cdFx0XHRcdGZpbGVDb25maWdbIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGZpbGVzLnB1c2goIGZpbGVDb25maWcgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRkZWxldGUgZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zICYmIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c2V0T3B0aW9uKCBvcHRpb24sIHZhbHVlICkge1xuXHRcdGxldCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zIHx8IHt9O1xuXHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCBvcHRpb25zICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgb3B0aW9uczogb3B0aW9ucyB9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggbmFtZSwgdmFsdWUgKSB7XG5cdFx0aWYgKCBuYW1lID09PSAnb3V0cHV0JyApIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgdmFsdWUgKTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSggdGhpcy5zdGF0ZSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldE9wdGlvbiggbmFtZSwgdmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRkZWZhdWx0T3V0cHV0UGF0aCgpIHtcblx0XHRyZXR1cm4gZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgdGhpcy5vdXRwdXRTdWZmaXgsIHRoaXMub3V0cHV0RXh0ZW5zaW9uICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdidW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdidW5kbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdjb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsPSdDb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnY29tcHJlc3MnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zb3VyY2VNYXBzRGlzYWJsZWQoKSB9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTdHlsZXMgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuY3NzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnQ1NTJywgZXh0ZW5zaW9uczogWyAnY3NzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0aXNQYXJ0aWFsKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCB0aGlzLmlzUGFydGlhbCgpICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLDxiciAvPiBpdCBjYW5ub3QgYmUgY29tcGlsZWQgb24gaXRzIG93bi48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS50eXBlID09PSAnc2FzcycgJiZcblx0XHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBTdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc3R5bGUnLCAnbmVzdGVkJyApIH1cblx0XHRcdFx0XHRcdFx0b3B0aW9ucz17IHtcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wcmVzc2VkOiAnQ29tcHJlc3NlZCdcblx0XHRcdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b3ByZWZpeGVyJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlcztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBzaG93aW5nIG5vdGljZXMgYW5kIGFsZXJ0cy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE5vdGljZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRsZXQgdHlwZSA9IHRoaXMucHJvcHMudHlwZSB8fCAnaW5mbyc7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9eyAnbm90aWNlIHR5cGUtJyArIHR5cGUgfT5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpY2U7XG4iLCIvKipcbiAqIEBmaWxlIFJvb3QgcmVkdWNlci5cbiAqL1xuXG5jb25zdCB7IGNvbWJpbmVSZWR1Y2VycyB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3QgdmlldyA9ICggY3VycmVudCA9ICdmaWxlcycsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1ZJRVcnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi52aWV3O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gY3VycmVudDtcblx0fVxufTtcblxuY29uc3QgeyBwcm9qZWN0cywgYWN0aXZlUHJvamVjdCwgYWN0aXZlUHJvamVjdEZpbGVzIH0gPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG5cbmNvbnN0IGFjdGl2ZUZpbGUgPSAoIGZpbGUgPSBudWxsLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1NFVF9BQ1RJVkVfRklMRSc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcblx0dmlldyxcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlcyxcblx0YWN0aXZlRmlsZVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIFByb2plY3RzIHJlZHVjZXIuXG4gKi9cblxuY29uc3QgcHJvamVjdHMgPSAoIHByb2plY3RzID0gW10sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQUREX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0Li4ucHJvamVjdHMsXG5cdFx0XHRcdGFjdGlvbi5wYXlsb2FkXG5cdFx0XHRdO1xuXHRcdGNhc2UgJ1JFTU9WRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gYWN0aW9uLmlkICk7XG5cdFx0Y2FzZSAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMubWFwKCBmdW5jdGlvbiggcHJvamVjdCwgaW5kZXggKSB7XG5cdFx0XHRcdGlmICggaW5kZXggPT09IHBhcnNlSW50KCBhY3Rpb24ucGF5bG9hZC5pZCwgMTAgKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb2plY3Q7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHM7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3QgPSAoIGFjdGl2ZSA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRjYXNlICdTRVRfUFJPSkVDVF9TVEFURSc6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRcdC4uLmFjdGlvbi5wYXlsb2FkXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gYWN0aXZlO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0RmlsZXMgPSAoIGZpbGVzID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnUkVDRUlWRV9GSUxFUyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlcztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlc1xufTtcbiIsIi8qKlxuICogQGZpbGUgTG9nZ2VyIHV0aWxpdHkuXG4gKi9cblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNsYXNzIExvZ2dlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubG9ncyA9IFtdO1xuXHR9XG5cblx0bG9nKCB0eXBlLCB0aXRsZSwgYm9keSA9ICcnICkge1xuXHRcdHRoaXMubG9ncy5wdXNoKHtcblx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRib2R5OiBib2R5LFxuXHRcdFx0dGltZTogbW9tZW50KCkuZm9ybWF0KCdISDptbTpzcy5TU1MnKVxuXHRcdH0pO1xuXHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9sb2dzJykgKTtcblx0fVxuXG5cdGdldCggdHlwZSA9IG51bGwsIG9yZGVyID0gJ2Rlc2MnICkge1xuXHRcdGxldCBsb2dzO1xuXG5cdFx0aWYgKCAhIHR5cGUgKSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzLmZpbHRlciggbG9nID0+IHsgcmV0dXJuIGxvZy50eXBlID09PSB0eXBlIH0gKTtcblx0XHR9XG5cblx0XHRpZiAoIG9yZGVyID09PSAnZGVzYycgKSB7XG5cdFx0XHRsb2dzID0gbG9ncy5zbGljZSgpLnJldmVyc2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbG9ncztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dlcjtcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvdmVybGF5KCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvdmVybGF5JywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnJywgZXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb24gKSB7XG5cdGxldCBiYXNlZGlyID0gcGF0aC5wYXJzZSggZmlsZS5wYXRoICkuZGlyO1xuXHRsZXQgZmlsZW5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSArIHN1ZmZpeCArIGV4dGVuc2lvbjtcblxuXHRyZXR1cm4gcGF0aC5qb2luKCBiYXNlZGlyLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBmaWxlUmVsYXRpdmVQYXRoKCBmcm9tLCB0byApIHtcblx0cmV0dXJuIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gKCBwYXRoLmlzQWJzb2x1dGUoIGZpbGVuYW1lICkgKSA/IGZpbGVuYW1lIDogcGF0aC5qb2luKCBiYXNlLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBkaXJBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gcGF0aC5wYXJzZSggZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSApLmRpcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aCxcblx0ZmlsZUFic29sdXRlUGF0aCxcblx0ZGlyQWJzb2x1dGVQYXRoXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBDb2xsZWN0aW9uIG9mIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gc2xlZXAobWlsbGlzZWNvbmRzKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCAxZTc7IGkrKyApIHtcblx0XHRpZiAoICggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCApID4gbWlsbGlzZWNvbmRzICkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0bGV0IHN0YXRlID0ge1xuXHRcdHZpZXc6ICdmaWxlcycsXG5cdFx0cHJvamVjdHM6IFtdLFxuXHRcdGFjdGl2ZVByb2plY3Q6IDAsXG5cdFx0YWN0aXZlUHJvamVjdEZpbGVzOiB7fSxcblx0XHRhY3RpdmVGaWxlOiBudWxsXG5cdH07XG5cblx0aWYgKCBnbG9iYWwuY29uZmlnLmhhcyggJ3Byb2plY3RzJyApICkge1xuXHRcdHN0YXRlLnByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdwcm9qZWN0cycgKTtcblx0fVxuXG5cdGlmICggc3RhdGUucHJvamVjdHMubGVuZ3RoICYmIGdsb2JhbC5jb25maWcuaGFzKCAnYWN0aXZlLXByb2plY3QnICkgKSB7XG5cdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdhY3RpdmUtcHJvamVjdCcgKTtcblxuXHRcdGlmICggc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0ID0gc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0LmlkID0gYWN0aXZlSW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdGxldCBwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0cHJvamVjdHNbIGFjdGl2ZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZy4nICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSApIHtcblx0bGV0IGRlcGVuZGVuY2llcyA9IFtdO1xuXG5cdGZvciAoIHZhciBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY3lUcmVlICkge1xuXHRcdGRlcGVuZGVuY2llcy5wdXNoKCBkZXBlbmRlbmN5ICk7XG5cblx0XHRpZiAoIE9iamVjdC5rZXlzKCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkubGVuZ3RoID4gMCApIHtcblx0XHRcdGRlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcy5jb25jYXQoIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApICk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRlcGVuZGVuY2llcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwLFxuXHRnZXRJbml0aWFsU3RhdGUsXG5cdHNldFByb2plY3RDb25maWcsXG5cdGdldERlcGVuZGVuY3lBcnJheVxufTtcbiJdfQ==
