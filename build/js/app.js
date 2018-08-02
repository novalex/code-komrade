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
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var postcss = require('postcss');
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

	// Get imported files.
	var watchFiles = getDependencyArray(dependencyTree({
		filename: options.input,
		directory: options.projectBase
	}));

	// Build task starting.
	global.logger.log('info', 'Compiling ' + options.filename + '...');

	switch (taskName) {
		case 'build-sass':
			handleSassCompile(options, callback);
			break;
		case 'build-css':
			handleCssCompile(options, callback);
			break;
		case 'build-js':
			handleJsCompile(options, callback);
			break;
		default:
			console.error('Unhandled task: ' + taskName);
			break;
	}
}

function handleSassCompile(options) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	options.outFile = path.resolve(options.output, options.filename);

	sass.render({
		file: options.input,
		outFile: options.outFile,
		outputStyle: options.style,
		sourceMap: options.sourcemaps,
		sourceMapEmbed: options.sourcemaps
	}, function (error, result) {
		if (error) {
			// Compilation error(s).
			handleCompileError(options.filename, error);

			if (callback) {
				callback();
			}
		} else {
			if (options.autoprefixer) {
				var postCssOptions = {
					from: options.input,
					to: options.outFile,
					map: options.sourcemaps
				};
				handlePostCssCompile(options, result.css, postCssOptions, callback);
			} else {
				// No errors during the compilation, write this result on the disk
				fs.writeFile(options.outFile, result.css, function (err) {
					if (err) {
						// Compilation error(s).
						handleCompileError(options.filename, err);
					} else {
						// Compilation successful.
						handleCompileSuccess(options.filename);
					}

					if (callback) {
						callback();
					}
				});
			}
		}
	});
}

function handleCssCompile(options) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	options.outFile = path.resolve(options.output, options.filename);

	var postCssOptions = {
		from: options.input,
		to: options.outFile,
		map: options.sourcemaps
	};

	fs.readFile(options.input, function (err, css) {
		if (err) {
			// Compilation error(s).
			handleCompileError(options.filename, err);
		} else {
			handlePostCssCompile(options, css, postCssOptions, callback);
		}
	});
}

function handlePostCssCompile(options, css, postCssOptions) {
	var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	postcss([precss, autoprefixer]).process(css, postCssOptions).then(function (postCssResult) {
		// No errors during the compilation, write this result on the disk
		fs.writeFile(options.outFile, postCssResult.css, function (err) {
			if (err) {
				// Compilation error(s).
				handleCompileError(options.filename, err);
			} else {
				// Compilation successful.
				handleCompileSuccess(options.filename);
			}

			if (callback) {
				callback();
			}
		});
	});
}

function handleJsCompile(options) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	var modulesPath = path.resolve(app.getAppPath(), 'node_modules');
	if (!modulesPath.match('app')) {
		modulesPath = path.resolve(app.getAppPath(), 'app/node_modules');
	}

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
			handleCompileSuccess(options.filename);
		}

		if (messages.errors.length) {
			// Compilation error(s).
			handleCompileError(options.filename, messages.errors);

			return;
		}

		if (messages.warnings.length) {
			// Compilation warning(s).
			handleCompileWarnings(options.filename, messages.warnings);
		}
	});
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

},{"../utils/pathHelpers":30,"../utils/utils":31,"./messages":4,"autoprefixer":undefined,"dependency-tree":undefined,"electron":undefined,"fs":undefined,"node-sass":undefined,"path":undefined,"postcss":undefined,"precss":undefined,"ps-tree":undefined,"webpack":undefined}],4:[function(require,module,exports){
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
		_this.changeProjectPath = _this.changeProjectPath.bind(_this);

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
		value: function removeProject() {
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

		// Confirm project removal when clicking remove button.

	}, {
		key: 'removeProjectButton',
		value: function removeProjectButton(event) {
			event.preventDefault();

			var confirmRemove = window.confirm('Are you sure you want to remove ' + this.props.active.name + '?');

			if (confirmRemove) {
				this.removeProject();
			}
		}

		// Change active project's path.

	}, {
		key: 'changeProjectPath',
		value: function changeProjectPath() {
			var _this2 = this;

			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				var projects = this.props.projects;
				var projectIndex = projects.findIndex(function (project) {
					return project.path === _this2.props.active.path;
				});

				if (projectIndex === -1) {
					// Project not found.
					return;
				}

				projects[projectIndex].path = path[0];

				// Save new project to config.
				global.config.set('projects', projects);

				// Set new project as active.
				this.changeProject(projectIndex);
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
					if (path) {
						// Chosen directory not readable.
						var options = {
							type: 'warning',
							title: 'Project directory missing',
							message: 'Could not read the ' + path + ' directory. It may have been moved or renamed.',
							buttons: ['Change Directory', 'Remove Project']
						};

						dialog.showMessageBox(options, function (index) {
							if (index === 0) {
								this.changeProjectPath();
							} else if (index === 1) {
								this.removeProject();
							}
						}.bind(this));
					} else {
						// No project path provided.
						global.projectConfig = null;

						global.store.dispatch(receiveFiles({}));

						global.compiler.killTasks();
					}
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
				removeProject: this.removeProjectButton,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87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QUE3QixFQUE4QztBQUM3QyxLQUFJLGVBQWUsRUFBbkI7O0FBRUEsTUFBTSxJQUFJLFVBQVYsSUFBd0IsY0FBeEIsRUFBeUM7QUFDeEMsZUFBYSxJQUFiLENBQW1CLFVBQW5COztBQUVBLE1BQUssT0FBTyxJQUFQLENBQWEsZUFBZ0IsVUFBaEIsQ0FBYixFQUE0QyxNQUE1QyxHQUFxRCxDQUExRCxFQUE4RDtBQUM3RCxrQkFBZSxhQUFhLE1BQWIsQ0FBcUIsbUJBQW9CLGVBQWdCLFVBQWhCLENBQXBCLENBQXJCLENBQWY7QUFDQTtBQUNEOztBQUVELFFBQU8sWUFBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQixpQ0FGZ0I7QUFHaEIsbUNBSGdCO0FBSWhCO0FBSmdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9qZWN0KCBpZCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVNT1ZFX1BST0pFQ1QnLFxuXHRcdGlkXG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9QUk9KRUNUX1NUQVRFJyxcblx0XHRwYXlsb2FkOiBzdGF0ZVxuXHR9O1xufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0QWN0aXZlRmlsZSggZmlsZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX0FDVElWRV9GSUxFJyxcblx0XHRwYXlsb2FkOiBmaWxlXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjaGFuZ2VWaWV3LFxuXHRhZGRQcm9qZWN0LFxuXHRjaGFuZ2VQcm9qZWN0LFxuXHRyZW1vdmVQcm9qZWN0LFxuXHRzZXRQcm9qZWN0U3RhdGUsXG5cdHJlY2VpdmVGaWxlcyxcblx0c2V0QWN0aXZlRmlsZSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Rcbn07XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vY29tcGlsZXIvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHsgZ2V0SW5pdGlhbFN0YXRlIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5jb25zdCBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIsIGluaXRpYWxTdGF0ZSApO1xuXG5nbG9iYWwuc3RvcmUgPSBzdG9yZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHBzVHJlZSA9IHJlcXVpcmUoJ3BzLXRyZWUnKTtcbmNvbnN0IGRlcGVuZGVuY3lUcmVlID0gcmVxdWlyZSgnZGVwZW5kZW5jeS10cmVlJyk7XG5cbmNvbnN0IHNhc3MgPSByZXF1aXJlKCdub2RlLXNhc3MnKTtcbmNvbnN0IGF1dG9wcmVmaXhlciA9IHJlcXVpcmUoJ2F1dG9wcmVmaXhlcicpO1xuY29uc3QgcHJlY3NzID0gcmVxdWlyZSgncHJlY3NzJyk7XG5jb25zdCBwb3N0Y3NzID0gcmVxdWlyZSgncG9zdGNzcycpO1xuY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcbmNvbnN0IGZvcm1hdE1lc3NhZ2VzID0gcmVxdWlyZSgnLi9tZXNzYWdlcycpO1xuXG5jb25zdCB7IGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5jb25zdCB7IGdldERlcGVuZGVuY3lBcnJheSB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbHMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgcGlkIG9mIFsgcHJvYy5waWQgXS5jb25jYXQoIGNoaWxkcmVuLm1hcCggY2hpbGQgPT4gY2hpbGQuUElEICkgKSApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHByb2Nlc3Mua2lsbCggcGlkICk7XG5cdFx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5IGxvbCBZT0xPXG5cdFx0XHRcdC8vIGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZSxcblx0XHRwcm9qZWN0Q29uZmlnOiBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHQvLyBHZXQgaW1wb3J0ZWQgZmlsZXMuXG5cdGxldCB3YXRjaEZpbGVzID0gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSh7XG5cdFx0ZmlsZW5hbWU6IG9wdGlvbnMuaW5wdXQsXG5cdFx0ZGlyZWN0b3J5OiBvcHRpb25zLnByb2plY3RCYXNlXG5cdH0pKTtcblxuXHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgQ29tcGlsaW5nICR7b3B0aW9ucy5maWxlbmFtZX0uLi5gICk7XG5cblx0c3dpdGNoICggdGFza05hbWUgKSB7XG5cdFx0Y2FzZSAnYnVpbGQtc2Fzcyc6XG5cdFx0XHRoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2J1aWxkLWNzcyc6XG5cdFx0XHRoYW5kbGVDc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnYnVpbGQtanMnOlxuXHRcdFx0aGFuZGxlSnNDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGBVbmhhbmRsZWQgdGFzazogJHt0YXNrTmFtZX1gICk7XG5cdFx0XHRicmVhaztcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRvcHRpb25zLm91dEZpbGUgPSBwYXRoLnJlc29sdmUoIG9wdGlvbnMub3V0cHV0LCBvcHRpb25zLmZpbGVuYW1lICk7XG5cblx0c2Fzcy5yZW5kZXIoIHtcblx0XHRmaWxlOiBvcHRpb25zLmlucHV0LFxuXHRcdG91dEZpbGU6IG9wdGlvbnMub3V0RmlsZSxcblx0XHRvdXRwdXRTdHlsZTogb3B0aW9ucy5zdHlsZSxcblx0XHRzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlbWFwcyxcblx0XHRzb3VyY2VNYXBFbWJlZDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdH0sIGZ1bmN0aW9uKCBlcnJvciwgcmVzdWx0ICkge1xuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucy5maWxlbmFtZSwgZXJyb3IgKTtcblxuXHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCBvcHRpb25zLmF1dG9wcmVmaXhlciApIHtcblx0XHRcdFx0bGV0IHBvc3RDc3NPcHRpb25zID0ge1xuXHRcdFx0XHRcdGZyb206IG9wdGlvbnMuaW5wdXQsXG5cdFx0XHRcdFx0dG86IG9wdGlvbnMub3V0RmlsZSxcblx0XHRcdFx0XHRtYXA6IG9wdGlvbnMuc291cmNlbWFwc1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgcmVzdWx0LmNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBObyBlcnJvcnMgZHVyaW5nIHRoZSBjb21waWxhdGlvbiwgd3JpdGUgdGhpcyByZXN1bHQgb24gdGhlIGRpc2tcblx0XHRcdFx0ZnMud3JpdGVGaWxlKCBvcHRpb25zLm91dEZpbGUsIHJlc3VsdC5jc3MsIGZ1bmN0aW9uKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucy5maWxlbmFtZSwgZXJyICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucy5maWxlbmFtZSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdG9wdGlvbnMub3V0RmlsZSA9IHBhdGgucmVzb2x2ZSggb3B0aW9ucy5vdXRwdXQsIG9wdGlvbnMuZmlsZW5hbWUgKTtcblxuXHRsZXQgcG9zdENzc09wdGlvbnMgPSB7XG5cdFx0ZnJvbTogb3B0aW9ucy5pbnB1dCxcblx0XHR0bzogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdG1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdH07XG5cblx0ZnMucmVhZEZpbGUoIG9wdGlvbnMuaW5wdXQsICggZXJyLCBjc3MgKSA9PiB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucy5maWxlbmFtZSwgZXJyICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCBjc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCBjc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdHBvc3Rjc3MoIFsgcHJlY3NzLCBhdXRvcHJlZml4ZXIgXSApXG5cdFx0LnByb2Nlc3MoIGNzcywgcG9zdENzc09wdGlvbnMgKVxuXHRcdC50aGVuKCBwb3N0Q3NzUmVzdWx0ID0+IHtcblx0XHRcdC8vIE5vIGVycm9ycyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLCB3cml0ZSB0aGlzIHJlc3VsdCBvbiB0aGUgZGlza1xuXHRcdFx0ZnMud3JpdGVGaWxlKCBvcHRpb25zLm91dEZpbGUsIHBvc3RDc3NSZXN1bHQuY3NzLCBmdW5jdGlvbiggZXJyICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMuZmlsZW5hbWUsIGVyciApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMuZmlsZW5hbWUgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlSnNDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ25vZGVfbW9kdWxlcycgKTtcblx0aWYgKCAhIG1vZHVsZXNQYXRoLm1hdGNoKCAnYXBwJyApICkge1xuXHRcdG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKCBhcHAuZ2V0QXBwUGF0aCgpLCAnYXBwL25vZGVfbW9kdWxlcycgKTtcblx0fVxuXG5cdGxldCBjb25maWcgPSB7XG5cdFx0bW9kZTogJ3Byb2R1Y3Rpb24nLFxuXHRcdGVudHJ5OiBvcHRpb25zLmlucHV0LFxuXHRcdG91dHB1dDoge1xuXHRcdFx0cGF0aDogb3B0aW9ucy5vdXRwdXQsXG5cdFx0XHRmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZVxuXHRcdH0sXG5cdFx0cmVzb2x2ZUxvYWRlcjoge1xuXHRcdFx0bW9kdWxlczogWyBtb2R1bGVzUGF0aCBdXG5cdFx0fVxuXHR9O1xuXG5cdHdlYnBhY2soIGNvbmZpZywgKCBlcnIsIHN0YXRzICkgPT4ge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWVzc2FnZXMgPSBmb3JtYXRNZXNzYWdlcyggc3RhdHMgKTtcblxuXHRcdGlmICggISBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICYmICEgbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zLmZpbGVuYW1lICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMuZmlsZW5hbWUsIG1lc3NhZ2VzLmVycm9ycyApO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBvcHRpb25zLmZpbGVuYW1lLCBtZXNzYWdlcy53YXJuaW5ncyApO1xuXHRcdH1cblx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlU3VjY2VzcyggZmlsZW5hbWUgKSB7XG5cdGxldCBub3RpZnlUZXh0ID0gYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNpbGVudDogdHJ1ZVxuXHR9ICk7XG5cblx0cmV0dXJuIG5vdGlmeTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZUVycm9yKCBmaWxlbmFtZSwgZXJyb3JzICkge1xuXHRjb25zb2xlLmVycm9yKCBlcnJvcnMgKTtcblxuXHRpZiAoICEgZXJyb3JzLmxlbmd0aCApIHtcblx0XHRlcnJvcnMgPSBbIGVycm9ycyBdO1xuXHR9XG5cblx0bGV0IG5vdGlmeVRleHQgPSAoIGVycm9ycy5sZW5ndGggPiAxID8gJ0Vycm9ycycgOiAnRXJyb3InICkgKyBgIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9YDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIGVycm9ycy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNvdW5kOiAnQmFzc28nXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlV2FybmluZ3MoIGZpbGVuYW1lLCB3YXJuaW5ncyApIHtcblx0Y29uc29sZS53YXJuKCB3YXJuaW5ncyApO1xuXG5cdGlmICggISB3YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0d2FybmluZ3MgPSBbIHdhcm5pbmdzIF07XG5cdH1cblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggd2FybmluZ3MubGVuZ3RoID4gMSA/ICdXYXJuaW5ncycgOiAnV2FybmluZycgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnd2FybicsIG5vdGlmeVRleHQgKyAnOicsICc8cHJlPicgKyB3YXJuaW5ncy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBUaGlzIGhhcyBiZWVuIGFkYXB0ZWQgZnJvbSBgY3JlYXRlLXJlYWN0LWFwcGAsIGF1dGhvcmVkIGJ5IEZhY2Vib29rLCBJbmMuXG4gKiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2luY3ViYXRvci9jcmVhdGUtcmVhY3QtYXBwL3RyZWUvbWFzdGVyL3BhY2thZ2VzL3JlYWN0LWRldi11dGlsc1xuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IGVycm9yTGFiZWwgPSAnU3ludGF4IGVycm9yOic7XG5jb25zdCBpc0xpa2VseUFTeW50YXhFcnJvciA9IHN0ciA9PiBzdHIuaW5jbHVkZXMoIGVycm9yTGFiZWwgKTtcblxuY29uc3QgZXhwb3J0UmVnZXggPSAvXFxzKiguKz8pXFxzKihcIik/ZXhwb3J0ICcoLis/KScgd2FzIG5vdCBmb3VuZCBpbiAnKC4rPyknLztcbmNvbnN0IHN0YWNrUmVnZXggPSAvXlxccyphdFxccygoPyF3ZWJwYWNrOikuKSo6XFxkKzpcXGQrW1xccyldKihcXG58JCkvZ207XG5jb25zdCBmaWxlQW5kTGluZVJlZ2V4ID0gL2luIChbXihdKilcXHNcXChsaW5lXFxzKFxcZCopLFxcc2NvbHVtblxccyhcXGQqKVxcKS87XG5cbmZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UoIG1lc3NhZ2UsIGlzRXJyb3IgKSB7XG5cdGxldCBsaW5lcyA9IG1lc3NhZ2Uuc3BsaXQoICdcXG4nICk7XG5cblx0aWYgKCBsaW5lcy5sZW5ndGggPiAyICYmIGxpbmVzWyAxIF0gPT09ICcnICkge1xuXHRcdGxpbmVzLnNwbGljZSggMSwgMSApOyAvLyBSZW1vdmUgZXh0cmEgbmV3bGluZS5cblx0fVxuXG5cdC8vIFJlbW92ZSBsb2FkZXIgbm90YXRpb24gZnJvbSBmaWxlbmFtZXM6XG5cdC8vICAgYC4vfi9jc3MtbG9hZGVyIS4vc3JjL0FwcC5jc3NgIH5+PiBgLi9zcmMvQXBwLmNzc2Bcblx0aWYgKCBsaW5lc1swXS5sYXN0SW5kZXhPZiggJyEnICkgIT09IC0xICkge1xuXHRcdGxpbmVzWzBdID0gbGluZXNbMF0uc3Vic3RyKCBsaW5lc1sgMCBdLmxhc3RJbmRleE9mKCAnIScgKSArIDEgKTtcblx0fVxuXG5cdC8vIFJlbW92ZSB1c2VsZXNzIGBlbnRyeWAgZmlsZW5hbWUgc3RhY2sgZGV0YWlsc1xuXHRsaW5lcyA9IGxpbmVzLmZpbHRlciggbGluZSA9PiBsaW5lLmluZGV4T2YoICcgQCAnICkgIT09IDAgKTtcblxuXHQvLyAwIH4+IGZpbGVuYW1lOyAxIH4+IG1haW4gZXJyIG1zZ1xuXHRpZiAoICEgbGluZXNbMF0gfHwgISBsaW5lc1sxXSApIHtcblx0XHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCB2ZXJib3NlIFwibW9kdWxlIG5vdCBmb3VuZFwiIG1lc3NhZ2VzIGZvciBmaWxlcyBhbmQgcGFja2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBub3QgZm91bmQ6ICcgKSApIHtcblx0XHRsaW5lcyA9IFtcblx0XHRcdGxpbmVzWzBdLFxuXHRcdFx0bGluZXNbMV0gLy8gXCJNb2R1bGUgbm90IGZvdW5kOiBcIiBpcyBlbm91Z2ggZGV0YWlsXG5cdFx0XHRcdC5yZXBsYWNlKCBcIkNhbm5vdCByZXNvbHZlICdmaWxlJyBvciAnZGlyZWN0b3J5JyBcIiwgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ0Nhbm5vdCByZXNvbHZlIG1vZHVsZSAnLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnRXJyb3I6ICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdbQ2FzZVNlbnNpdGl2ZVBhdGhzUGx1Z2luXSAnLCAnJyApXG5cdFx0XTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCBzeW50YXggZXJyb3IgbWVzc2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBidWlsZCBmYWlsZWQ6ICcgKSApIHtcblx0XHRsaW5lc1sxXSA9IGxpbmVzWzFdLnJlcGxhY2UoICdNb2R1bGUgYnVpbGQgZmFpbGVkOiBTeW50YXhFcnJvcjonLCBlcnJvckxhYmVsICk7XG5cdH1cblxuXHRpZiAoIGxpbmVzWzFdLm1hdGNoKCBleHBvcnRSZWdleCApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggZXhwb3J0UmVnZXgsIFwiJDEgJyQ0JyBkb2VzIG5vdCBjb250YWluIGFuIGV4cG9ydCBuYW1lZCAnJDMnLlwiICk7XG5cdH1cblxuXHQvLyBSZWFzc2VtYmxlICYgU3RyaXAgaW50ZXJuYWwgdHJhY2luZywgZXhjZXB0IGB3ZWJwYWNrOmAgLS0gKGNyZWF0ZS1yZWFjdC1hcHAvcHVsbC8xMDUwKVxuXHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKS5yZXBsYWNlKCBzdGFja1JlZ2V4LCAnJyApLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU3RkZXJyKCBkYXRhICkge1xuXHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggIXRyaW1tZWQubGVuZ3RoICkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0cmltbWVkID09PSAnRGV0YWlsczonICkge1xuXHRcdFx0c3RhcnRDYXB0dXJlID0gdHJ1ZTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggc3RhcnRDYXB0dXJlICkge1xuXHRcdFx0bGV0IGVyckFyciA9IHRyaW1tZWQuc3BsaXQoIC86XFxzKC4rKS8gKTtcblx0XHRcdGVyck9ialsgZXJyQXJyWyAwIF0gXSA9IGVyckFyclsgMSBdO1xuXG5cdFx0XHRpZiAoIGVyckFyclsgMCBdID09PSAnZm9ybWF0dGVkJyApIHtcblx0XHRcdFx0c3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGlmICggT2JqZWN0LmtleXMoIGVyck9iaiApLmxlbmd0aCApIHtcblx0XHRjb25zb2xlLmVycm9yKCBlcnJPYmogKTtcblxuXHRcdGdldEVyckxpbmVzKCBlcnJPYmouZmlsZSwgZXJyT2JqLmxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0aXRsZSA9IGVyck9iai5mb3JtYXR0ZWQucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0JyBvbiBsaW5lICcgKyBlcnJPYmoubGluZSArXG5cdFx0XHRcdCc8L2NvZGU+JztcblxuXHRcdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdFx0fSApO1xuXHR9XG5cblx0Ly8gcmV0dXJuIGVyck9iajtcbn1cblxuZnVuY3Rpb24gZ2V0RXJyTGluZXMoIGZpbGVuYW1lLCBsaW5lLCBjYWxsYmFjayApIHtcblx0bGluZSA9IE1hdGgubWF4KCBwYXJzZUludCggbGluZSwgMTAgKSAtIDEgfHwgMCwgMCApO1xuXG5cdGZzLnJlYWRGaWxlKCBmaWxlbmFtZSwgZnVuY3Rpb24gKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZyggJ3V0Zi04JyApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0aWYgKCArbGluZSA+IGxpbmVzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgbGluZUFyciA9IFtdO1xuXHRcdGxldCBfbGluZUFyciA9IFtdO1xuXHRcdGxldCBtaW5MaW5lID0gTWF0aC5tYXgoIGxpbmUgLSAyLCAwICk7XG5cdFx0bGV0IG1heExpbmUgPSBNYXRoLm1pbiggbGluZSArIDIsIGxpbmVzLmxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSBtaW5MaW5lOyBpIDw9IG1heExpbmU7IGkrKyApIHtcblx0XHRcdF9saW5lQXJyWyBpIF0gPSBsaW5lc1sgaSBdO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleHRyYW5lb3VzIGluZGVudGF0aW9uLlxuXHRcdGxldCBzdHJpcHBlZExpbmVzID0gc3RyaXBJbmRlbnQoIF9saW5lQXJyLmpvaW4oICdcXG4nICkgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdGZvciAoIHZhciBqID0gbWluTGluZTsgaiA8PSBtYXhMaW5lOyBqKysgKSB7XG5cdFx0XHRsaW5lQXJyLnB1c2goXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwibGluZScgKyAoIGxpbmUgPT09IGogPyAnIGhpZ2hsaWdodCcgOiAnJyApICsgJ1wiPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLWNvbnRlbnRcIj4nICsgc3RyaXBwZWRMaW5lc1sgaiBdICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2soIG51bGwsIGxpbmVBcnIuam9pbiggJ1xcbicgKSApO1xuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtZXNzYWdlICkge1xuXHRsZXQgZmlsZUFuZExpbmUgPSBtZXNzYWdlLm1hdGNoKCBmaWxlQW5kTGluZVJlZ2V4ICk7XG5cblx0aWYgKCAhIGZpbGVBbmRMaW5lICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBmaWxlID0gZmlsZUFuZExpbmVbIDEgXTtcblx0bGV0IGxpbmUgPSBmaWxlQW5kTGluZVsgMiBdO1xuXG5cdGNvbnNvbGUubG9nKCBmaWxlQW5kTGluZSApO1xuXG5cdGdldEVyckxpbmVzKCBmaWxlLCBsaW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCB0aXRsZSA9IG1lc3NhZ2UucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdCc8Y29kZT4nICtcblx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBmaWxlICkgKSArXG5cdFx0XHQnIG9uIGxpbmUgJyArIGxpbmUgK1xuXHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCB0aXRsZSwgZGV0YWlscyApO1xuXHR9ICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHN0YXRzICkge1xuXHRjb25zdCBqc29uID0gc3RhdHMudG9Kc29uKCB7fSwgdHJ1ZSApO1xuXG5cdGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtc2cgKSApO1xuXG5cdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRlcnJvcnM6IGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGZvcm1hdE1lc3NhZ2UoIG1zZywgdHJ1ZSApICksXG5cdFx0d2FybmluZ3M6IGpzb24ud2FybmluZ3MubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCBmYWxzZSApIClcblx0fTtcblxuXHQvLyBPbmx5IHNob3cgc3ludGF4IGVycm9ycyBpZiB3ZSBoYXZlIHRoZW1cblx0aWYgKCByZXN1bHQuZXJyb3JzLnNvbWUoIGlzTGlrZWx5QVN5bnRheEVycm9yICkgKSB7XG5cdFx0cmVzdWx0LmVycm9ycyA9IHJlc3VsdC5lcnJvcnMuZmlsdGVyKCBpc0xpa2VseUFTeW50YXhFcnJvciApO1xuXHR9XG5cblx0Ly8gRmlyc3QgZXJyb3IgaXMgdXN1YWxseSBpdDsgb3RoZXJzIHVzdWFsbHkgdGhlIHNhbWVcblx0aWYgKCByZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDEgKSB7XG5cdFx0cmVzdWx0LmVycm9ycy5sZW5ndGggPSAxO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlO1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBjb21wb25lbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcblxuY29uc3QgU2lkZWJhciA9IHJlcXVpcmUoJy4vU2lkZWJhcicpO1xuXG5jb25zdCBMb2dzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Mb2dzJyk7XG5cbmNvbnN0IFNldHRpbmdzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9TZXR0aW5ncycpO1xuXG5jb25zdCBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvUHJvamVjdHMnKTtcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy52aWV3cyA9IHtcblx0XHRcdGZpbGVzOiAnRmlsZXMnLFxuXHRcdFx0bG9nczogJ0xvZ3MnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXHR9XG5cblx0cmVuZGVyT3ZlcmxheSgpIHtcblx0XHRnbG9iYWwudWkub3ZlcmxheSggdGhpcy5wcm9wcy52aWV3ICE9PSAnZmlsZXMnICk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2ZpbGVzJyApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGNvbnRlbnQ7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnbG9ncycgKSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8TG9ncyAvPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8U2V0dGluZ3MgLz47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxPdmVybGF5IGhhc0Nsb3NlPXsgZmFsc2UgfT5cblx0XHRcdFx0XHR7IGNvbnRlbnQgfVxuXHRcdFx0XHQ8L092ZXJsYXk+XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nYXBwJz5cblx0XHRcdFx0PFNpZGViYXIgaXRlbXM9eyB0aGlzLnZpZXdzIH0gLz5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50LXdyYXAnPlxuXHRcdFx0XHRcdDxQcm9qZWN0cyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyT3ZlcmxheSgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHZpZXc6IHN0YXRlLnZpZXcsXG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0c1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIEFwcCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGVtcHR5IHNjcmVlbi9ubyBjb250ZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcHJvcHMgKSB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyAnbm8tY29udGVudCcgKyAoIHByb3BzLmNsYXNzTmFtZSA/ICcgJyArIHByb3BzLmNsYXNzTmFtZSA6ICcnICkgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYW4gb3ZlcmxheS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHQvLyBjb25zdHJ1Y3RvcigpIHt9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdvdmVybGF5Jz5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmhhc0Nsb3NlICYmXG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgaWQ9J2Nsb3NlLW92ZXJsYXknPiZ0aW1lczs8L2E+XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQ8ZGl2IGlkPSdvdmVybGF5LWNvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTtcbiIsIi8qKlxuICogQGZpbGUgQXBwIHNpZGViYXIuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNoYW5nZVZpZXcgfSA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jbGFzcyBTaWRlYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGxldCB2aWV3ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnZpZXc7XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVZpZXcoIHZpZXcgKTtcblx0fVxuXG5cdHJlbmRlckl0ZW1zKCkge1xuXHRcdGxldCBpdGVtcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGlkIGluIHRoaXMucHJvcHMuaXRlbXMgKSB7XG5cdFx0XHRpdGVtcy5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS12aWV3PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdGlwPXsgdGhpcy5wcm9wcy5pdGVtc1sgaWQgXSB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy5hY3RpdmUgPT09IGlkID8gJ2FjdGl2ZScgOiAnJyB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bmF2IGlkPSdzaWRlYmFyJz5cblx0XHRcdFx0PHVsIGlkPSdtZW51Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVySXRlbXMoKSB9XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L25hdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmU6IHN0YXRlLnZpZXdcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0Y2hhbmdlVmlldzogdmlldyA9PiBkaXNwYXRjaCggY2hhbmdlVmlldyggdmlldyApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFNpZGViYXIgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB3cmFwcGluZyBhIGZpZWxkLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuZnVuY3Rpb24gRmllbGQoIHByb3BzICkge1xuXHRsZXQgY2xhc3NOYW1lID0gJ2ZpZWxkIGZpZWxkLScgKyBwcm9wcy50eXBlICsgJyBsYWJlbC0nICsgKCBwcm9wcy5sYWJlbFBvcyA/IHByb3BzLmxhYmVsUG9zIDogJ3RvcCcgKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0+XG5cdFx0XHR7IHByb3BzLmxhYmVsICYmXG5cdFx0XHRcdDxzdHJvbmcgY2xhc3NOYW1lPSdmaWVsZC1sYWJlbCc+eyBwcm9wcy5sYWJlbCB9PC9zdHJvbmc+XG5cdFx0XHR9XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQtY29udCc+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBzYXZlIGZpbGUgZmllbGQuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2F2ZUZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnByb3BzLnZhbHVlICYmIHRoaXMucHJvcHMuc291cmNlRmlsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucHJvcHMuc291cmNlRmlsZS5wYXRoO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCB0aGlzLnByb3BzLnZhbHVlICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCBzYXZlUGF0aCApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NhdmUtZmlsZScgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2hpZGRlbidcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8c21hbGwgb25DbGljaz17IHRoaXMub25DbGljayB9PnsgdGhpcy5wcm9wcy52YWx1ZSB9PC9zbWFsbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSksXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNhdmVGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5wcm9wcy52YWx1ZSBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCAhIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbiBlbXB0eSc+XG5cdFx0XHRcdFx0PGgzPk5vIGxvZ3MgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+R28gZm9ydGggYW5kIGNvbXBpbGUhPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUsIHJlZnJlc2hBY3RpdmVQcm9qZWN0IH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdENvbmZpZyB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXRpbHMnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVQcm9qZWN0ID0gdGhpcy50b2dnbGVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHRnbG9iYWwudWkudW5mb2N1cyggISB0aGlzLnN0YXRlLmlzT3BlbiApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGlzT3BlbjogISB0aGlzLnN0YXRlLmlzT3BlbiB9KTtcblx0fVxuXG5cdHRvZ2dsZVByb2plY3QoKSB7XG5cdFx0bGV0IHBhdXNlZCA9ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkIHx8IGZhbHNlO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0U3RhdGUoeyBwYXVzZWQ6IHBhdXNlZCB9KTtcblxuXHRcdHRoaXMucHJvcHMucmVmcmVzaEFjdGl2ZVByb2plY3Qoe1xuXHRcdFx0Li4udGhpcy5wcm9wcy5hY3RpdmUsXG5cdFx0XHRwYXVzZWQ6IHBhdXNlZFxuXHRcdH0pO1xuXG5cdFx0c2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHBhdXNlZCApO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5wcm9wcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldFByb2plY3RTdGF0ZTogc3RhdGUgPT4gZGlzcGF0Y2goIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSApLFxuXHRyZWZyZXNoQWN0aXZlUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggcmVmcmVzaEFjdGl2ZVByb2plY3QoIHByb2plY3QgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCcuLi91aS9Ob3RpY2UnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL1BhbmVsJyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnYnVpbGRyLXByb2plY3QuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaW5pdFByb2plY3QgPSB0aGlzLmluaXRQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3QgPSB0aGlzLmNoYW5nZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVtb3ZlUHJvamVjdCA9IHRoaXMucmVtb3ZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZWZyZXNoUHJvamVjdCA9IHRoaXMucmVmcmVzaFByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuY2hhbmdlUHJvamVjdFBhdGggPSB0aGlzLmNoYW5nZVByb2plY3RQYXRoLmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0bGV0IG5ld1Byb2plY3RJbmRleCA9IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIFtcblx0XHRcdFx0Li4udGhpcy5wcm9wcy5wcm9qZWN0cyxcblx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XSApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbmV3UHJvamVjdEluZGV4LCBuZXdQcm9qZWN0ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQsIHByb2plY3QgPSBudWxsICkge1xuXHRcdGlmICggaWQgPT09IHRoaXMucHJvcHMuYWN0aXZlLmlkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmICggcHJvamVjdCApIHtcblx0XHRcdGFjdGl2ZSA9IHByb2plY3Q7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy5wcm9qZWN0c1tpZF0gKSB7XG5cdFx0XHRhY3RpdmUgPSB0aGlzLnByb3BzLnByb2plY3RzW2lkXTtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpZCApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRpZFxuXHRcdH0pO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoKSB7XG5cdFx0bGV0IHJlbW92ZUluZGV4ID0gcGFyc2VJbnQoIHRoaXMucHJvcHMuYWN0aXZlLmlkLCAxMCApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFJlbW92ZSBwcm9qZWN0IGZyb20gY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCggcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFVuc2V0IGFjdGl2ZSBwcm9qZWN0LlxuXHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbnVsbCApO1xuXHR9XG5cblx0Ly8gQ29uZmlybSBwcm9qZWN0IHJlbW92YWwgd2hlbiBjbGlja2luZyByZW1vdmUgYnV0dG9uLlxuXHRyZW1vdmVQcm9qZWN0QnV0dG9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNvbmZpcm1SZW1vdmUgPSB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJHt0aGlzLnByb3BzLmFjdGl2ZS5uYW1lfT9gICk7XG5cblx0XHRpZiAoIGNvbmZpcm1SZW1vdmUgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZVByb2plY3QoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgYWN0aXZlIHByb2plY3QncyBwYXRoLlxuXHRjaGFuZ2VQcm9qZWN0UGF0aCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZygge1xuXHRcdFx0cHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5J11cblx0XHR9ICk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzO1xuXHRcdFx0bGV0IHByb2plY3RJbmRleCA9IHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0SW5kZXggPT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IG5vdCBmb3VuZC5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0c1sgcHJvamVjdEluZGV4IF0ucGF0aCA9IHBhdGhbMF07XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHRcdC8vIFNldCBuZXcgcHJvamVjdCBhcyBhY3RpdmUuXG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIHByb2plY3RJbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVmcmVzaCB0aGUgcHJvamVjdCBmaWxlcy5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG9yIGZldGNoIHRoZSBwcm9qZWN0IGNvbmZpZyBmaWxlLlxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUuXG5cdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICd3YXJuaW5nJyxcblx0XHRcdFx0XHRcdHRpdGxlOiAnUHJvamVjdCBkaXJlY3RvcnkgbWlzc2luZycsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LiBJdCBtYXkgaGF2ZSBiZWVuIG1vdmVkIG9yIHJlbmFtZWQuYCxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFsgJ0NoYW5nZSBEaXJlY3RvcnknLCAnUmVtb3ZlIFByb2plY3QnIF1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZGlhbG9nLnNob3dNZXNzYWdlQm94KCBvcHRpb25zLCBmdW5jdGlvbiggaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGluZGV4ID09PSAwICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gMSApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVQcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBObyBwcm9qZWN0IHBhdGggcHJvdmlkZWQuXG5cdFx0XHRcdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBudWxsO1xuXG5cdFx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIHt9ICkgKTtcblxuXHRcdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5IGlzIHJlYWRhYmxlLCBnZXQgZmlsZXMgYW5kIHNldHVwIGNvbmZpZy5cblx0XHRcdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKTtcblxuXHRcdFx0XHQvLyBDaGFuZ2UgcHJvY2VzcyBjd2QuXG5cdFx0XHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uIH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMz5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+V291bGQgeW91IGxpa2UgdG8gYWRkIG9uZSBub3c/PC9wPlxuXHRcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPSdsYXJnZSBmbGF0IGFkZC1uZXctcHJvamVjdCcgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PkFkZCBQcm9qZWN0PC9idXR0b24+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdCBzZWxlY3RlZCwgc2hvdyBzZWxlY3Rvci5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdwcm9qZWN0LXNlbGVjdC1zY3JlZW4nPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3RzJz5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlck5vdGljZXMoKSB9XG5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdGZpbGVzPXsgdGhpcy5wcm9wcy5maWxlcyB9XG5cdFx0XHRcdFx0XHRsb2FkaW5nPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8UGFuZWwgLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGFkZFByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIGFkZFByb2plY3QoIHByb2plY3QgKSApLFxuXHRjaGFuZ2VQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggY2hhbmdlUHJvamVjdCggaWQgKSApLFxuXHRyZW1vdmVQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggcmVtb3ZlUHJvamVjdCggaWQgKSApLFxuXHRzZXRBY3RpdmVGaWxlOiBmaWxlID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBmaWxlICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMz5TZXR0aW5nczwvaDM+XG5cdFx0XHRcdDxwPkNvbWluZyBzb29uITwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZUxpc3RGaWxlID0gcmVxdWlyZSgnLi9GaWxlTGlzdEZpbGUnKTtcblxuY29uc3QgRmlsZUxpc3REaXJlY3RvcnkgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RGlyZWN0b3J5Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jb25zdCB7IHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSAmJiB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudCA9PT0gZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdGZpbGVQcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJywgJ2hhcy1vcHRpb25zJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoXG5cdFx0XHR0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0PHA+TG9hZGluZyZoZWxsaXA7PC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vIHByb2plY3QgZm9sZGVyIHNlbGVjdGVkLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5Ob3RoaW5nIHRvIHNlZSBoZXJlLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IGZpbGVsaXN0IH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZVxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRBY3RpdmVGaWxlOiBwYXlsb2FkID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBwYXlsb2FkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggRmlsZUxpc3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCB7IHJlbW90ZSwgc2hlbGwgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmNvbnN0IHsgTWVudSwgTWVudUl0ZW0gfSA9IHJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSh7XG5cdFx0XHRmaWxlOiB0aGlzLnByb3BzLmZpbGUsXG5cdFx0XHRlbGVtZW50OiBldmVudC5jdXJyZW50VGFyZ2V0XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMgKSB7XG5cdFx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2xvYmFsLmNvbXBpbGVyLmdldEZpbGVPcHRpb25zKCBuZXh0UHJvcHMuZmlsZSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IGNvbXBpbGVPcHRpb25zLnR5cGUsXG5cdFx0XHRmaWxlVHlwZTogY29tcGlsZU9wdGlvbnMuZmlsZVR5cGUsXG5cdFx0XHRidWlsZFRhc2tOYW1lOiBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lLFxuXHRcdFx0b3B0aW9uczogRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5iYXNlLCBuZXh0UHJvcHMuZmlsZSApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRPcHRpb25zRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRsZXQgY2ZpbGUgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApO1xuXG5cdFx0cmV0dXJuICggY2ZpbGUgJiYgY2ZpbGUub3B0aW9ucyApID8gY2ZpbGUub3B0aW9ucyA6IHt9O1xuXHR9XG5cblx0c3RhdGljIGdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGlmICggZmlsZSAmJiBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBiYXNlLCBmaWxlLnBhdGggKSApO1xuXG5cdFx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0XHRsZXQgY2ZpbGUgPSBmaWxlcy5maW5kKCBjZmlsZSA9PiBjZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0XHRpZiAoIGNmaWxlICkge1xuXHRcdFx0XHRyZXR1cm4gY2ZpbGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBudWxsICkgPyBzdG9yZWQgOiBkZWZhdWx0cztcblxuXHRcdGlmICggcHJvcGVydHkgKSB7XG5cdFx0XHRyZXR1cm4gKCBjb25maWdbIHByb3BlcnR5IF0gKSA/IGNvbmZpZ1sgcHJvcGVydHkgXSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9XG5cdH1cblxuXHRzZXRDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBwcm9wZXJ0eSApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGxldCBmaWxlQ29uZmlnID0ge1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0dHlwZTogdGhpcy5zdGF0ZS5maWxlVHlwZSxcblx0XHRcdFx0b3V0cHV0OiBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKSApXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgKSB7XG5cdFx0XHRcdGZpbGVDb25maWdbIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGZpbGVzLnB1c2goIGZpbGVDb25maWcgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRkZWxldGUgZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zICYmIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c2V0T3B0aW9uKCBvcHRpb24sIHZhbHVlICkge1xuXHRcdGxldCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zIHx8IHt9O1xuXHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCBvcHRpb25zICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgb3B0aW9uczogb3B0aW9ucyB9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggbmFtZSwgdmFsdWUgKSB7XG5cdFx0aWYgKCBuYW1lID09PSAnb3V0cHV0JyApIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgdmFsdWUgKTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSggdGhpcy5zdGF0ZSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldE9wdGlvbiggbmFtZSwgdmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRkZWZhdWx0T3V0cHV0UGF0aCgpIHtcblx0XHRyZXR1cm4gZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgdGhpcy5vdXRwdXRTdWZmaXgsIHRoaXMub3V0cHV0RXh0ZW5zaW9uICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdidW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdidW5kbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdjb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsPSdDb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnY29tcHJlc3MnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zb3VyY2VNYXBzRGlzYWJsZWQoKSB9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTdHlsZXMgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuY3NzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnQ1NTJywgZXh0ZW5zaW9uczogWyAnY3NzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0aXNQYXJ0aWFsKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCB0aGlzLmlzUGFydGlhbCgpICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLDxiciAvPiBpdCBjYW5ub3QgYmUgY29tcGlsZWQgb24gaXRzIG93bi48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS50eXBlID09PSAnc2FzcycgJiZcblx0XHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBTdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc3R5bGUnLCAnbmVzdGVkJyApIH1cblx0XHRcdFx0XHRcdFx0b3B0aW9ucz17IHtcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wcmVzc2VkOiAnQ29tcHJlc3NlZCdcblx0XHRcdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b3ByZWZpeGVyJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlcztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBzaG93aW5nIG5vdGljZXMgYW5kIGFsZXJ0cy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE5vdGljZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRsZXQgdHlwZSA9IHRoaXMucHJvcHMudHlwZSB8fCAnaW5mbyc7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9eyAnbm90aWNlIHR5cGUtJyArIHR5cGUgfT5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpY2U7XG4iLCIvKipcbiAqIEBmaWxlIFJvb3QgcmVkdWNlci5cbiAqL1xuXG5jb25zdCB7IGNvbWJpbmVSZWR1Y2VycyB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3QgdmlldyA9ICggY3VycmVudCA9ICdmaWxlcycsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1ZJRVcnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi52aWV3O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gY3VycmVudDtcblx0fVxufTtcblxuY29uc3QgeyBwcm9qZWN0cywgYWN0aXZlUHJvamVjdCwgYWN0aXZlUHJvamVjdEZpbGVzIH0gPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG5cbmNvbnN0IGFjdGl2ZUZpbGUgPSAoIGZpbGUgPSBudWxsLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1NFVF9BQ1RJVkVfRklMRSc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcblx0dmlldyxcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlcyxcblx0YWN0aXZlRmlsZVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIFByb2plY3RzIHJlZHVjZXIuXG4gKi9cblxuY29uc3QgcHJvamVjdHMgPSAoIHByb2plY3RzID0gW10sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQUREX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0Li4ucHJvamVjdHMsXG5cdFx0XHRcdGFjdGlvbi5wYXlsb2FkXG5cdFx0XHRdO1xuXHRcdGNhc2UgJ1JFTU9WRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gYWN0aW9uLmlkICk7XG5cdFx0Y2FzZSAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMubWFwKCBmdW5jdGlvbiggcHJvamVjdCwgaW5kZXggKSB7XG5cdFx0XHRcdGlmICggaW5kZXggPT09IHBhcnNlSW50KCBhY3Rpb24ucGF5bG9hZC5pZCwgMTAgKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb2plY3Q7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHM7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3QgPSAoIGFjdGl2ZSA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRjYXNlICdTRVRfUFJPSkVDVF9TVEFURSc6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRcdC4uLmFjdGlvbi5wYXlsb2FkXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gYWN0aXZlO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0RmlsZXMgPSAoIGZpbGVzID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnUkVDRUlWRV9GSUxFUyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlcztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlc1xufTtcbiIsIi8qKlxuICogQGZpbGUgTG9nZ2VyIHV0aWxpdHkuXG4gKi9cblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNsYXNzIExvZ2dlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubG9ncyA9IFtdO1xuXHR9XG5cblx0bG9nKCB0eXBlLCB0aXRsZSwgYm9keSA9ICcnICkge1xuXHRcdHRoaXMubG9ncy5wdXNoKHtcblx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRib2R5OiBib2R5LFxuXHRcdFx0dGltZTogbW9tZW50KCkuZm9ybWF0KCdISDptbTpzcy5TU1MnKVxuXHRcdH0pO1xuXHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9sb2dzJykgKTtcblx0fVxuXG5cdGdldCggdHlwZSA9IG51bGwsIG9yZGVyID0gJ2Rlc2MnICkge1xuXHRcdGxldCBsb2dzO1xuXG5cdFx0aWYgKCAhIHR5cGUgKSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzLmZpbHRlciggbG9nID0+IHsgcmV0dXJuIGxvZy50eXBlID09PSB0eXBlIH0gKTtcblx0XHR9XG5cblx0XHRpZiAoIG9yZGVyID09PSAnZGVzYycgKSB7XG5cdFx0XHRsb2dzID0gbG9ncy5zbGljZSgpLnJldmVyc2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbG9ncztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dlcjtcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvdmVybGF5KCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvdmVybGF5JywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnJywgZXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb24gKSB7XG5cdGxldCBiYXNlZGlyID0gcGF0aC5wYXJzZSggZmlsZS5wYXRoICkuZGlyO1xuXHRsZXQgZmlsZW5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSArIHN1ZmZpeCArIGV4dGVuc2lvbjtcblxuXHRyZXR1cm4gcGF0aC5qb2luKCBiYXNlZGlyLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBmaWxlUmVsYXRpdmVQYXRoKCBmcm9tLCB0byApIHtcblx0cmV0dXJuIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gKCBwYXRoLmlzQWJzb2x1dGUoIGZpbGVuYW1lICkgKSA/IGZpbGVuYW1lIDogcGF0aC5qb2luKCBiYXNlLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBkaXJBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gcGF0aC5wYXJzZSggZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSApLmRpcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aCxcblx0ZmlsZUFic29sdXRlUGF0aCxcblx0ZGlyQWJzb2x1dGVQYXRoXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBDb2xsZWN0aW9uIG9mIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gc2xlZXAobWlsbGlzZWNvbmRzKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCAxZTc7IGkrKyApIHtcblx0XHRpZiAoICggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCApID4gbWlsbGlzZWNvbmRzICkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0bGV0IHN0YXRlID0ge1xuXHRcdHZpZXc6ICdmaWxlcycsXG5cdFx0cHJvamVjdHM6IFtdLFxuXHRcdGFjdGl2ZVByb2plY3Q6IDAsXG5cdFx0YWN0aXZlUHJvamVjdEZpbGVzOiB7fSxcblx0XHRhY3RpdmVGaWxlOiBudWxsXG5cdH07XG5cblx0aWYgKCBnbG9iYWwuY29uZmlnLmhhcyggJ3Byb2plY3RzJyApICkge1xuXHRcdHN0YXRlLnByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdwcm9qZWN0cycgKTtcblx0fVxuXG5cdGlmICggc3RhdGUucHJvamVjdHMubGVuZ3RoICYmIGdsb2JhbC5jb25maWcuaGFzKCAnYWN0aXZlLXByb2plY3QnICkgKSB7XG5cdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdhY3RpdmUtcHJvamVjdCcgKTtcblxuXHRcdGlmICggc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0ID0gc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0LmlkID0gYWN0aXZlSW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdGxldCBwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0cHJvamVjdHNbIGFjdGl2ZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZy4nICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSApIHtcblx0bGV0IGRlcGVuZGVuY2llcyA9IFtdO1xuXG5cdGZvciAoIHZhciBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY3lUcmVlICkge1xuXHRcdGRlcGVuZGVuY2llcy5wdXNoKCBkZXBlbmRlbmN5ICk7XG5cblx0XHRpZiAoIE9iamVjdC5rZXlzKCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkubGVuZ3RoID4gMCApIHtcblx0XHRcdGRlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcy5jb25jYXQoIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApICk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRlcGVuZGVuY2llcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwLFxuXHRnZXRJbml0aWFsU3RhdGUsXG5cdHNldFByb2plY3RDb25maWcsXG5cdGdldERlcGVuZGVuY3lBcnJheVxufTtcbiJdfQ==
