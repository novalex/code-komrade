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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

var app = require('electron').remote.app;

var fs = require('fs');
var path = require('path');
// const dependencyTree = require( 'dependency-tree' );

var sass = require('node-sass');
var WatchSass = require('node-sass-watcher');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var postcss = require('postcss');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var formatMessages = require('./messages');

var _require = require('../utils/pathHelpers'),
    fileAbsolutePath = _require.fileAbsolutePath;
// const { getDependencyArray } = require( '../utils/utils' );

function killTasks() {
	if (global.compilerTasks.length === 0) {
		// Nothing to kill :(
		return null;
	}

	var tasks = global.compilerTasks;

	for (var i = tasks.length - 1; i >= 0; i--) {
		var task = tasks[i];
		var filename = void 0;

		if (_typeof(task._events) === 'object' && typeof task._events.update === 'function') {
			filename = task.inputPath;
			// Close chokidar watch processes.
			task.inputPathWatcher.close();
			task.rootDirWatcher.close();
		} else {
			filename = task.compiler.options.entry;
			// Close webpack watch process.
			task.close();
		}

		console.warn('Stopped watching "' + filename + '".');

		// Remove task from array.
		tasks.splice(i, 1);
	}

	global.compilerTasks = tasks;

	return true;
}

function initProject() {
	killTasks();

	if (!global.projectConfig) {
		return;
	}

	var projectFiles = global.projectConfig.get('files', []);

	var projectPath = path.parse(global.projectConfig.path).dir;

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = projectFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var fileConfig = _step.value;

			processFile(projectPath, fileConfig);
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
		projectBase: base
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

	console.group('Running task');
	console.log('Running "' + taskName + '" with options:', options);
	console.groupEnd();

	var inputFilename = path.basename(options.input);

	if (taskName === 'watch') {
		handleWatchTask(options, callback);
	} else {
		// Build task starting.
		global.logger.log('info', 'Compiling ' + inputFilename + '...');

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
			handleCompileError(options, error);

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
				fs.writeFile(options.outFile, result.css, function (error) {
					if (error) {
						// Compilation error(s).
						handleCompileError(options, error);
					} else {
						// Compilation successful.
						handleCompileSuccess(options);
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

	options.outFile = path.resolve(options.output, options);

	var postCssOptions = {
		from: options.input,
		to: options.outFile,
		map: options.sourcemaps
	};

	fs.readFile(options.input, function (error, css) {
		if (error) {
			// Compilation error(s).
			handleCompileError(options, error);
		} else {
			handlePostCssCompile(options, css, postCssOptions, callback);
		}
	});
}

function handlePostCssCompile(options, css, postCssOptions) {
	var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	postcss([precss, autoprefixer({ browsers: ['last 5 versions'] })]).process(css, postCssOptions).then(function (postCssResult) {
		// No errors during the compilation, write this result on the disk
		fs.writeFile(options.outFile, postCssResult.css, function (error) {
			if (error) {
				// Compilation error(s).
				handleCompileError(options, error);
			} else {
				// Compilation successful.
				handleCompileSuccess(options);
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
		mode: 'none',
		entry: options.input,
		cache: false,
		output: {
			path: options.output,
			filename: options.filename
		},
		module: {
			rules: [{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/
			}]
		},
		resolveLoader: {
			modules: [modulesPath]
		},
		devtool: options.sourcemaps ? 'inline-source-map' : false,
		plugins: [new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}), new webpack.optimize.ModuleConcatenationPlugin(), new webpack.NoEmitOnErrorsPlugin()]
	};

	if (options.babel) {
		config.module.rules[0].use = {
			loader: 'babel-loader',
			options: {
				presets: [require('babel-preset-env')],
				plugins: [require('babel-plugin-transform-object-rest-spread')]
			}
		};
	}

	if (options.uglify) {
		var uglifyOptions = {
			parallel: false,
			sourceMap: options.sourcemaps
		};

		config.plugins.push(new UglifyJsPlugin(uglifyOptions));
	}

	var compiler = webpack(config);

	if (options.getInstance) {
		return compiler;
	}

	compiler.run(function (error, stats) {
		if (callback) {
			callback();
		}

		if (error) {
			console.error(error);
		}

		console.group('Webpack');
		console.log(stats);
		console.groupEnd();

		var messages = formatMessages(stats);

		if (!messages.errors.length && !messages.warnings.length) {
			// Compilation successful.
			handleCompileSuccess(options);
		}

		if (messages.errors.length) {
			// Compilation error(s).
			handleCompileError(options, messages.errors);
		}

		if (messages.warnings.length) {
			// Compilation warning(s).
			handleCompileWarnings(options, messages.warnings);
		}
	});
}

function handleWatchTask(options) {
	if (options.watchTask === 'build-sass') {
		var watcherOptions = {
			verbosity: 1
		};
		var watcher = new WatchSass(options.input, watcherOptions);
		// watcher.on( 'init', function() { handleSassCompile( options ) });
		watcher.on('update', function () {
			handleSassCompile(options);
		});
		watcher.run();

		global.compilerTasks.push(watcher);
	} else if (options.watchTask === 'build-js') {
		console.warn('Start watching "' + options.input + '"...');
		options.getInstance = true;
		var compiler = handleJsCompile(options);
		var _watcher = compiler.watch({
			aggregateTimeout: 300
		}, function (error, stats) {
			if (error) {
				console.error(error);
			}

			console.group('Webpack');
			console.log(stats);
			console.groupEnd();

			var messages = formatMessages(stats);

			if (!messages.errors.length && !messages.warnings.length) {
				// Compilation successful.
				handleCompileSuccess(options);
			}

			if (messages.errors.length) {
				// Compilation error(s).
				handleCompileError(options, messages.errors);
			}

			if (messages.warnings.length) {
				// Compilation warning(s).
				handleCompileWarnings(options, messages.warnings);
			}
		});

		_watcher.invalidate();

		global.compilerTasks.push(_watcher);
	}
}

function handleCompileSuccess(options) {
	var filename = path.basename(options.input);

	var notifyText = 'Finished compiling ' + filename + '.';

	global.logger.log('success', notifyText);

	var notify = new Notification('Buildr', {
		body: notifyText,
		silent: true
	});

	return notify;
}

function handleCompileError(options, errors) {
	console.error(errors);

	if (!errors.length) {
		errors = [errors];
	}

	var filename = path.basename(options.input);

	var notifyText = (errors.length > 1 ? 'Errors' : 'Error') + (' when compiling ' + filename);

	global.logger.log('error', notifyText + ':', '<pre>' + errors.join('\r\n') + '</pre>');

	var notify = new Notification('Buildr', {
		body: notifyText,
		sound: 'Basso'
	});

	return notify;
}

function handleCompileWarnings(options, warnings) {
	console.warn(warnings);

	if (!warnings.length) {
		warnings = [warnings];
	}

	var filename = path.basename(options.input);

	var notifyText = (warnings.length > 1 ? 'Warnings' : 'Warning') + (' when compiling ' + filename);

	global.logger.log('warn', notifyText + ':', '<pre>' + warnings.join('\r\n') + '</pre>');
}

module.exports = {
	initProject: initProject,
	runTask: runTask,
	killTasks: killTasks,
	processFile: processFile,
	getFileConfig: getFileConfig,
	getFileOptions: getFileOptions
};

},{"../utils/pathHelpers":30,"./messages":4,"autoprefixer":undefined,"babel-plugin-transform-object-rest-spread":undefined,"babel-preset-env":undefined,"electron":undefined,"fs":undefined,"node-sass":undefined,"node-sass-watcher":undefined,"path":undefined,"postcss":undefined,"precss":undefined,"uglifyjs-webpack-plugin":undefined,"webpack":undefined}],4:[function(require,module,exports){
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
					readOnly: true
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
		return _this;
	}

	_createClass(Logs, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			document.addEventListener('bd/refresh/logs', this.refresh);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			document.removeEventListener('bd/refresh/logs', this.refresh);
		}
	}, {
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
						'h1',
						null,
						'No logs yet.'
					),
					React.createElement(
						'h2',
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
				'+ Add new project'
			));

			return choices;
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.props.active.name || !this.props.active.path) {
				return React.createElement(
					'div',
					{ id: 'project-select', className: 'empty' },
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
		_this.removeProjectButton = _this.removeProjectButton.bind(_this);

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
						'h1',
						null,
						'You don\'t have any projects yet.'
					),
					React.createElement(
						'h2',
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
					'h1',
					null,
					'Settings'
				),
				React.createElement(
					'h2',
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
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.handleCompileCallback = function () {
				this.setState({ loading: false });
			}.bind(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.handleCompileCallback = null;
		}
	}, {
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

			global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, this.handleCompileCallback);
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
						name: 'babel',
						label: 'Babel',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('babel', false)
					}),
					React.createElement(FieldSwitch, {
						name: 'uglify',
						label: 'Uglify',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('uglify', false)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiL1VzZXJzL2FsZXgvQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiL1VzZXJzL2FsZXgvQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiL1VzZXJzL2FsZXgvQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiL1VzZXJzL2FsZXgvQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIi9Vc2Vycy9hbGV4L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiL1VzZXJzL2FsZXgvQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCIvVXNlcnMvYWxleC9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87QUFDTixRQUFNLGFBREE7QUFFTjtBQUZNLEVBQVA7QUFJQTs7QUFFRDs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsT0FBckIsRUFBK0I7QUFDOUIsUUFBTztBQUNOLFFBQU0sYUFEQTtBQUVOLFdBQVM7QUFGSCxFQUFQO0FBSUE7O0FBRUQsU0FBUyxhQUFULENBQXdCLE9BQXhCLEVBQWtDO0FBQ2pDLFFBQU87QUFDTixRQUFNLGdCQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsRUFBeEIsRUFBNkI7QUFDNUIsUUFBTztBQUNOLFFBQU0sZ0JBREE7QUFFTjtBQUZNLEVBQVA7QUFJQTs7QUFFRCxTQUFTLG9CQUFULENBQStCLE9BQS9CLEVBQXlDO0FBQ3hDLFFBQU87QUFDTixRQUFNLHdCQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGVBQVQsQ0FBMEIsS0FBMUIsRUFBa0M7QUFDakMsUUFBTztBQUNOLFFBQU0sbUJBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVEOztBQUVBLFNBQVMsWUFBVCxDQUF1QixLQUF2QixFQUErQjtBQUM5QixRQUFPO0FBQ04sUUFBTSxlQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsSUFBeEIsRUFBK0I7QUFDOUIsUUFBTztBQUNOLFFBQU0saUJBREE7QUFF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dEI7QUFDQSxTQUFNLGFBQU4sQ0FBb0IsRUFBcEIsR0FBeUIsV0FBekI7QUFDQTtBQUNEOztBQUVELFFBQU8sS0FBUDtBQUNBOztBQUVELFNBQVMsZ0JBQVQsQ0FBMkIsUUFBM0IsRUFBcUMsS0FBckMsRUFBNkM7QUFDNUMsS0FBSSxXQUFXLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsVUFBbEIsQ0FBZjtBQUNBLEtBQUksY0FBYyxPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLGdCQUFsQixDQUFsQjs7QUFFQSxLQUFLLE1BQU0sT0FBTixDQUFlLFFBQWYsS0FBNkIsU0FBVSxXQUFWLENBQWxDLEVBQTREO0FBQzNELFdBQVUsV0FBVixFQUF5QixRQUF6QixJQUFzQyxLQUF0Qzs7QUFFQSxTQUFPLE1BQVAsQ0FBYyxHQUFkLENBQW1CLFVBQW5CLEVBQStCLFFBQS9CO0FBQ0EsRUFKRCxNQUlPO0FBQ04sU0FBTyxLQUFQLENBQWMsZ0RBQWQ7QUFDQTtBQUNEOztBQUVELFNBQVMsa0JBQVQsQ0FBNkIsY0FBN0IsRUFBOEM7QUFDN0MsS0FBSSxlQUFlLEVBQW5COztBQUVBLE1BQU0sSUFBSSxVQUFWLElBQXdCLGNBQXhCLEVBQXlDO0FBQ3hDLGVBQWEsSUFBYixDQUFtQixVQUFuQjs7QUFFQSxNQUFLLE9BQU8sSUFBUCxDQUFhLGVBQWdCLFVBQWhCLENBQWIsRUFBNEMsTUFBNUMsR0FBcUQsQ0FBMUQsRUFBOEQ7QUFDN0Qsa0JBQWUsYUFBYSxNQUFiLENBQXFCLG1CQUFvQixlQUFnQixVQUFoQixDQUFwQixDQUFyQixDQUFmO0FBQ0E7QUFDRDs7QUFFRCxRQUFPLFlBQVA7QUFDQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsYUFEZ0I7QUFFaEIsaUNBRmdCO0FBR2hCLG1DQUhnQjtBQUloQjtBQUpnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQGZpbGUgQWN0aW9ucy5cbiAqL1xuXG4vLyBNYWluLlxuXG5mdW5jdGlvbiBjaGFuZ2VWaWV3KCB2aWV3ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfVklFVycsXG5cdFx0dmlld1xuXHR9O1xufVxuXG4vLyBQcm9qZWN0cy5cblxuZnVuY3Rpb24gYWRkUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQUREX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJvamVjdCggaWQgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFTU9WRV9QUk9KRUNUJyxcblx0XHRpZFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfUFJPSkVDVF9TVEFURScsXG5cdFx0cGF5bG9hZDogc3RhdGVcblx0fTtcbn1cblxuLy8gRmlsZXMuXG5cbmZ1bmN0aW9uIHJlY2VpdmVGaWxlcyggZmlsZXMgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFQ0VJVkVfRklMRVMnLFxuXHRcdHBheWxvYWQ6IGZpbGVzXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9BQ1RJVkVfRklMRScsXG5cdFx0cGF5bG9hZDogZmlsZVxuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2hhbmdlVmlldyxcblx0YWRkUHJvamVjdCxcblx0Y2hhbmdlUHJvamVjdCxcblx0cmVtb3ZlUHJvamVjdCxcblx0c2V0UHJvamVjdFN0YXRlLFxuXHRyZWNlaXZlRmlsZXMsXG5cdHNldEFjdGl2ZUZpbGUsXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0XG59O1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuL2NvbXBpbGVyL2ludGVyZmFjZScpO1xuXG5nbG9iYWwuY29tcGlsZXJUYXNrcyA9IFtdO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IHsgUHJvdmlkZXIgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgY3JlYXRlU3RvcmUgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHJvb3RSZWR1Y2VyID0gcmVxdWlyZSgnLi9yZWR1Y2VycycpO1xuXG5jb25zdCB7IGdldEluaXRpYWxTdGF0ZSB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuY29uc3QgaW5pdGlhbFN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKCk7XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyLCBpbml0aWFsU3RhdGUgKTtcblxuZ2xvYmFsLnN0b3JlID0gc3RvcmU7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9eyBzdG9yZSB9PlxuXHRcdDxBcHAgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7XG5cbmNvbnN0IHsgc2xlZXAgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcblxuLy8gQXBwIGNsb3NlL3Jlc3RhcnQgZXZlbnRzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID4gMCApIHtcblx0XHRjb25zb2xlLmxvZyggJ0tpbGxpbmcgJWQgcnVubmluZyB0YXNrcy4uLicsIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXG5cdFx0c2xlZXAoIDMwMCApO1xuXHR9XG59KTtcbiIsIi8qKlxuKiBAZmlsZSBHdWxwIHNjcmlwdHMgYW5kIHRhc2tzLlxuKi9cblxuLyogZ2xvYmFsIE5vdGlmaWNhdGlvbiAqL1xuXG5jb25zdCB7IGFwcCB9ID0gcmVxdWlyZSggJ2VsZWN0cm9uJyApLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG4vLyBjb25zdCBkZXBlbmRlbmN5VHJlZSA9IHJlcXVpcmUoICdkZXBlbmRlbmN5LXRyZWUnICk7XG5cbmNvbnN0IHNhc3MgPSByZXF1aXJlKCAnbm9kZS1zYXNzJyApO1xuY29uc3QgV2F0Y2hTYXNzID0gcmVxdWlyZSggJ25vZGUtc2Fzcy13YXRjaGVyJyApO1xuY29uc3QgYXV0b3ByZWZpeGVyID0gcmVxdWlyZSggJ2F1dG9wcmVmaXhlcicgKTtcbmNvbnN0IHByZWNzcyA9IHJlcXVpcmUoICdwcmVjc3MnICk7XG5jb25zdCBwb3N0Y3NzID0gcmVxdWlyZSggJ3Bvc3Rjc3MnICk7XG5jb25zdCB3ZWJwYWNrID0gcmVxdWlyZSggJ3dlYnBhY2snICk7XG5jb25zdCBVZ2xpZnlKc1BsdWdpbiA9IHJlcXVpcmUoICd1Z2xpZnlqcy13ZWJwYWNrLXBsdWdpbicgKTtcbmNvbnN0IGZvcm1hdE1lc3NhZ2VzID0gcmVxdWlyZSggJy4vbWVzc2FnZXMnICk7XG5cbmNvbnN0IHsgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSggJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyApO1xuLy8gY29uc3QgeyBnZXREZXBlbmRlbmN5QXJyYXkgfSA9IHJlcXVpcmUoICcuLi91dGlscy91dGlscycgKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA9PT0gMCApIHtcblx0XHQvLyBOb3RoaW5nIHRvIGtpbGwgOihcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3M7XG5cblx0Zm9yICggbGV0IGkgPSB0YXNrcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblx0XHRsZXQgdGFzayA9IHRhc2tzWyBpIF07XG5cdFx0bGV0IGZpbGVuYW1lO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGFzay5fZXZlbnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFzay5fZXZlbnRzLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdGZpbGVuYW1lID0gdGFzay5pbnB1dFBhdGg7XG5cdFx0XHQvLyBDbG9zZSBjaG9raWRhciB3YXRjaCBwcm9jZXNzZXMuXG5cdFx0XHR0YXNrLmlucHV0UGF0aFdhdGNoZXIuY2xvc2UoKTtcblx0XHRcdHRhc2sucm9vdERpcldhdGNoZXIuY2xvc2UoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZW5hbWUgPSB0YXNrLmNvbXBpbGVyLm9wdGlvbnMuZW50cnk7XG5cdFx0XHQvLyBDbG9zZSB3ZWJwYWNrIHdhdGNoIHByb2Nlc3MuXG5cdFx0XHR0YXNrLmNsb3NlKCk7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS53YXJuKCBgU3RvcHBlZCB3YXRjaGluZyBcIiR7ZmlsZW5hbWV9XCIuYCApO1xuXG5cdFx0Ly8gUmVtb3ZlIHRhc2sgZnJvbSBhcnJheS5cblx0XHR0YXNrcy5zcGxpY2UoIGksIDEgKTtcblx0fVxuXG5cdGdsb2JhbC5jb21waWxlclRhc2tzID0gdGFza3M7XG5cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZVxuXHR9O1xuXG5cdGlmICggZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdGZvciAoIHZhciBvcHRpb24gaW4gZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdFx0aWYgKCAhIGZpbGVDb25maWcub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IGZpbGVDb25maWcub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0XHRvcHRpb25zLndhdGNoVGFzayA9IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zID0ge30sIGNhbGxiYWNrID0gbnVsbCApIHtcblx0Y29uc29sZS5ncm91cCggJ1J1bm5pbmcgdGFzaycgKTtcblx0Y29uc29sZS5sb2coIGBSdW5uaW5nIFwiJHt0YXNrTmFtZX1cIiB3aXRoIG9wdGlvbnM6YCwgb3B0aW9ucyApO1xuXHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cblx0bGV0IGlucHV0RmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0aWYgKCB0YXNrTmFtZSA9PT0gJ3dhdGNoJyApIHtcblx0XHRoYW5kbGVXYXRjaFRhc2soIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQnVpbGQgdGFzayBzdGFydGluZy5cblx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgQ29tcGlsaW5nICR7aW5wdXRGaWxlbmFtZX0uLi5gICk7XG5cblx0XHRzd2l0Y2ggKCB0YXNrTmFtZSApIHtcblx0XHRcdGNhc2UgJ2J1aWxkLXNhc3MnOlxuXHRcdFx0XHRoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdidWlsZC1jc3MnOlxuXHRcdFx0XHRoYW5kbGVDc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2J1aWxkLWpzJzpcblx0XHRcdFx0aGFuZGxlSnNDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGBVbmhhbmRsZWQgdGFzazogJHt0YXNrTmFtZX1gICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRvcHRpb25zLm91dEZpbGUgPSBwYXRoLnJlc29sdmUoIG9wdGlvbnMub3V0cHV0LCBvcHRpb25zLmZpbGVuYW1lICk7XG5cblx0c2Fzcy5yZW5kZXIoIHtcblx0XHRmaWxlOiBvcHRpb25zLmlucHV0LFxuXHRcdG91dEZpbGU6IG9wdGlvbnMub3V0RmlsZSxcblx0XHRvdXRwdXRTdHlsZTogb3B0aW9ucy5zdHlsZSxcblx0XHRzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlbWFwcyxcblx0XHRzb3VyY2VNYXBFbWJlZDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdH0sIGZ1bmN0aW9uKCBlcnJvciwgcmVzdWx0ICkge1xuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblxuXHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCBvcHRpb25zLmF1dG9wcmVmaXhlciApIHtcblx0XHRcdFx0bGV0IHBvc3RDc3NPcHRpb25zID0ge1xuXHRcdFx0XHRcdGZyb206IG9wdGlvbnMuaW5wdXQsXG5cdFx0XHRcdFx0dG86IG9wdGlvbnMub3V0RmlsZSxcblx0XHRcdFx0XHRtYXA6IG9wdGlvbnMuc291cmNlbWFwc1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgcmVzdWx0LmNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBObyBlcnJvcnMgZHVyaW5nIHRoZSBjb21waWxhdGlvbiwgd3JpdGUgdGhpcyByZXN1bHQgb24gdGhlIGRpc2tcblx0XHRcdFx0ZnMud3JpdGVGaWxlKCBvcHRpb25zLm91dEZpbGUsIHJlc3VsdC5jc3MsIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdG9wdGlvbnMub3V0RmlsZSA9IHBhdGgucmVzb2x2ZSggb3B0aW9ucy5vdXRwdXQsIG9wdGlvbnMgKTtcblxuXHRsZXQgcG9zdENzc09wdGlvbnMgPSB7XG5cdFx0ZnJvbTogb3B0aW9ucy5pbnB1dCxcblx0XHR0bzogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdG1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdH07XG5cblx0ZnMucmVhZEZpbGUoIG9wdGlvbnMuaW5wdXQsICggZXJyb3IsIGNzcyApID0+IHtcblx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCBjc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCBjc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdHBvc3Rjc3MoIFsgcHJlY3NzLCBhdXRvcHJlZml4ZXIoIHsgYnJvd3NlcnM6IFsgJ2xhc3QgNSB2ZXJzaW9ucycgXSB9ICkgXSApXG5cdFx0LnByb2Nlc3MoIGNzcywgcG9zdENzc09wdGlvbnMgKVxuXHRcdC50aGVuKCBwb3N0Q3NzUmVzdWx0ID0+IHtcblx0XHRcdC8vIE5vIGVycm9ycyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLCB3cml0ZSB0aGlzIHJlc3VsdCBvbiB0aGUgZGlza1xuXHRcdFx0ZnMud3JpdGVGaWxlKCBvcHRpb25zLm91dEZpbGUsIHBvc3RDc3NSZXN1bHQuY3NzLCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlSnNDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ25vZGVfbW9kdWxlcycgKTtcblx0aWYgKCAhIG1vZHVsZXNQYXRoLm1hdGNoKCAnYXBwJyApICkge1xuXHRcdG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKCBhcHAuZ2V0QXBwUGF0aCgpLCAnYXBwL25vZGVfbW9kdWxlcycgKTtcblx0fVxuXG5cdGxldCBjb25maWcgPSB7XG5cdFx0bW9kZTogJ25vbmUnLFxuXHRcdGVudHJ5OiBvcHRpb25zLmlucHV0LFxuXHRcdGNhY2hlOiBmYWxzZSxcblx0XHRvdXRwdXQ6IHtcblx0XHRcdHBhdGg6IG9wdGlvbnMub3V0cHV0LFxuXHRcdFx0ZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWVcblx0XHR9LFxuXHRcdG1vZHVsZToge1xuXHRcdFx0cnVsZXM6IFsge1xuXHRcdFx0XHR0ZXN0OiAvXFwuanMkLyxcblx0XHRcdFx0ZXhjbHVkZTogLyhub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cykvXG5cdFx0XHR9IF1cblx0XHR9LFxuXHRcdHJlc29sdmVMb2FkZXI6IHtcblx0XHRcdG1vZHVsZXM6IFsgbW9kdWxlc1BhdGggXVxuXHRcdH0sXG5cdFx0ZGV2dG9vbDogKCBvcHRpb25zLnNvdXJjZW1hcHMgKSA/ICdpbmxpbmUtc291cmNlLW1hcCcgOiBmYWxzZSxcblx0XHRwbHVnaW5zOiBbXG5cdFx0XHRuZXcgd2VicGFjay5EZWZpbmVQbHVnaW4oIHtcblx0XHRcdFx0J3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkoICdwcm9kdWN0aW9uJyApXG5cdFx0XHR9ICksXG5cdFx0XHRuZXcgd2VicGFjay5vcHRpbWl6ZS5Nb2R1bGVDb25jYXRlbmF0aW9uUGx1Z2luKCksXG5cdFx0XHRuZXcgd2VicGFjay5Ob0VtaXRPbkVycm9yc1BsdWdpbigpXG5cdFx0XVxuXHR9O1xuXG5cdGlmICggb3B0aW9ucy5iYWJlbCApIHtcblx0XHRjb25maWcubW9kdWxlLnJ1bGVzWyAwIF0udXNlID0ge1xuXHRcdFx0bG9hZGVyOiAnYmFiZWwtbG9hZGVyJyxcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0cHJlc2V0czogWyByZXF1aXJlKCAnYmFiZWwtcHJlc2V0LWVudicgKSBdLFxuXHRcdFx0XHRwbHVnaW5zOiBbIHJlcXVpcmUoICdiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZCcgKSBdXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGlmICggb3B0aW9ucy51Z2xpZnkgKSB7XG5cdFx0bGV0IHVnbGlmeU9wdGlvbnMgPSB7XG5cdFx0XHRwYXJhbGxlbDogZmFsc2UsXG5cdFx0XHRzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlbWFwc1xuXHRcdH07XG5cblx0XHRjb25maWcucGx1Z2lucy5wdXNoKCBuZXcgVWdsaWZ5SnNQbHVnaW4oIHVnbGlmeU9wdGlvbnMgKSApO1xuXHR9XG5cblx0Y29uc3QgY29tcGlsZXIgPSB3ZWJwYWNrKCBjb25maWcgKTtcblxuXHRpZiAoIG9wdGlvbnMuZ2V0SW5zdGFuY2UgKSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVyO1xuXHR9XG5cblx0Y29tcGlsZXIucnVuKCAoIGVycm9yLCBzdGF0cyApID0+IHtcblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyb3IgKTtcblx0XHR9XG5cblx0XHRjb25zb2xlLmdyb3VwKCAnV2VicGFjaycgKTtcblx0XHRjb25zb2xlLmxvZyggc3RhdHMgKTtcblx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cblx0XHRjb25zdCBtZXNzYWdlcyA9IGZvcm1hdE1lc3NhZ2VzKCBzdGF0cyApO1xuXG5cdFx0aWYgKCAhIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggJiYgIW1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdH1cblxuXHRcdGlmICggbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBtZXNzYWdlcy5lcnJvcnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIHdhcm5pbmcocykuXG5cdFx0XHRoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIG1lc3NhZ2VzLndhcm5pbmdzICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlV2F0Y2hUYXNrKCBvcHRpb25zICkge1xuXHRpZiAoIG9wdGlvbnMud2F0Y2hUYXNrID09PSAnYnVpbGQtc2FzcycgKSB7XG5cdFx0bGV0IHdhdGNoZXJPcHRpb25zID0ge1xuXHRcdFx0dmVyYm9zaXR5OiAxXG5cdFx0fTtcblx0XHRsZXQgd2F0Y2hlciA9IG5ldyBXYXRjaFNhc3MoIG9wdGlvbnMuaW5wdXQsIHdhdGNoZXJPcHRpb25zICk7XG5cdFx0Ly8gd2F0Y2hlci5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHsgaGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMgKSB9KTtcblx0XHR3YXRjaGVyLm9uKCAndXBkYXRlJywgZnVuY3Rpb24oKSB7IGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zICkgfSApO1xuXHRcdHdhdGNoZXIucnVuKCk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCB3YXRjaGVyICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMud2F0Y2hUYXNrID09PSAnYnVpbGQtanMnICkge1xuXHRcdGNvbnNvbGUud2FybiggYFN0YXJ0IHdhdGNoaW5nIFwiJHtvcHRpb25zLmlucHV0fVwiLi4uYCApO1xuXHRcdG9wdGlvbnMuZ2V0SW5zdGFuY2UgPSB0cnVlO1xuXHRcdGxldCBjb21waWxlciA9IGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucyApO1xuXHRcdGxldCB3YXRjaGVyID0gY29tcGlsZXIud2F0Y2goe1xuXHRcdFx0YWdncmVnYXRlVGltZW91dDogMzAwXG5cdFx0fSwgKCBlcnJvciwgc3RhdHMgKSA9PiB7XG5cdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnJvciApO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zb2xlLmdyb3VwKCAnV2VicGFjaycgKTtcblx0XHRcdGNvbnNvbGUubG9nKCBzdGF0cyApO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXG5cdFx0XHRjb25zdCBtZXNzYWdlcyA9IGZvcm1hdE1lc3NhZ2VzKCBzdGF0cyApO1xuXG5cdFx0XHRpZiAoICEgbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCAmJiAhbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIG1lc3NhZ2VzLmVycm9ycyApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gd2FybmluZyhzKS5cblx0XHRcdFx0aGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBvcHRpb25zLCBtZXNzYWdlcy53YXJuaW5ncyApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0d2F0Y2hlci5pbnZhbGlkYXRlKCk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCB3YXRjaGVyICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKSB7XG5cdGxldCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ3N1Y2Nlc3MnLCBub3RpZnlUZXh0ICk7XG5cblx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0Ym9keTogbm90aWZ5VGV4dCxcblx0XHRzaWxlbnQ6IHRydWVcblx0fSApO1xuXG5cdHJldHVybiBub3RpZnk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3JzICkge1xuXHRjb25zb2xlLmVycm9yKCBlcnJvcnMgKTtcblxuXHRpZiAoICEgZXJyb3JzLmxlbmd0aCApIHtcblx0XHRlcnJvcnMgPSBbIGVycm9ycyBdO1xuXHR9XG5cblx0bGV0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGxldCBub3RpZnlUZXh0ID0gKCBlcnJvcnMubGVuZ3RoID4gMSA/ICdFcnJvcnMnIDogJ0Vycm9yJyApICsgYCB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfWA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIG5vdGlmeVRleHQgKyAnOicsICc8cHJlPicgKyBlcnJvcnMuam9pbiggJ1xcclxcbicgKSArICc8L3ByZT4nICk7XG5cblx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0Ym9keTogbm90aWZ5VGV4dCxcblx0XHRzb3VuZDogJ0Jhc3NvJ1xuXHR9ICk7XG5cblx0cmV0dXJuIG5vdGlmeTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBvcHRpb25zLCB3YXJuaW5ncyApIHtcblx0Y29uc29sZS53YXJuKCB3YXJuaW5ncyApO1xuXG5cdGlmICggISB3YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0d2FybmluZ3MgPSBbIHdhcm5pbmdzIF07XG5cdH1cblxuXHRsZXQgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0bGV0IG5vdGlmeVRleHQgPSAoIHdhcm5pbmdzLmxlbmd0aCA+IDEgPyAnV2FybmluZ3MnIDogJ1dhcm5pbmcnICkgKyBgIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9YDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ3dhcm4nLCBub3RpZnlUZXh0ICsgJzonLCAnPHByZT4nICsgd2FybmluZ3Muam9pbiggJ1xcclxcbicgKSArICc8L3ByZT4nICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0UHJvamVjdCxcblx0cnVuVGFzayxcblx0a2lsbFRhc2tzLFxuXHRwcm9jZXNzRmlsZSxcblx0Z2V0RmlsZUNvbmZpZyxcblx0Z2V0RmlsZU9wdGlvbnNcbn1cbiIsIi8qKlxuICogVGhpcyBoYXMgYmVlbiBhZGFwdGVkIGZyb20gYGNyZWF0ZS1yZWFjdC1hcHBgLCBhdXRob3JlZCBieSBGYWNlYm9vaywgSW5jLlxuICogc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2tpbmN1YmF0b3IvY3JlYXRlLXJlYWN0LWFwcC90cmVlL21hc3Rlci9wYWNrYWdlcy9yZWFjdC1kZXYtdXRpbHNcbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcbmNvbnN0IHN0cmlwSW5kZW50ID0gcmVxdWlyZSgnc3RyaXAtaW5kZW50Jyk7XG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBlcnJvckxhYmVsID0gJ1N5bnRheCBlcnJvcjonO1xuY29uc3QgaXNMaWtlbHlBU3ludGF4RXJyb3IgPSBzdHIgPT4gc3RyLmluY2x1ZGVzKCBlcnJvckxhYmVsICk7XG5cbmNvbnN0IGV4cG9ydFJlZ2V4ID0gL1xccyooLis/KVxccyooXCIpP2V4cG9ydCAnKC4rPyknIHdhcyBub3QgZm91bmQgaW4gJyguKz8pJy87XG5jb25zdCBzdGFja1JlZ2V4ID0gL15cXHMqYXRcXHMoKD8hd2VicGFjazopLikqOlxcZCs6XFxkK1tcXHMpXSooXFxufCQpL2dtO1xuY29uc3QgZmlsZUFuZExpbmVSZWdleCA9IC9pbiAoW14oXSopXFxzXFwobGluZVxccyhcXGQqKSxcXHNjb2x1bW5cXHMoXFxkKilcXCkvO1xuXG5mdW5jdGlvbiBmb3JtYXRNZXNzYWdlKCBtZXNzYWdlLCBpc0Vycm9yICkge1xuXHRsZXQgbGluZXMgPSBtZXNzYWdlLnNwbGl0KCAnXFxuJyApO1xuXG5cdGlmICggbGluZXMubGVuZ3RoID4gMiAmJiBsaW5lc1sgMSBdID09PSAnJyApIHtcblx0XHRsaW5lcy5zcGxpY2UoIDEsIDEgKTsgLy8gUmVtb3ZlIGV4dHJhIG5ld2xpbmUuXG5cdH1cblxuXHQvLyBSZW1vdmUgbG9hZGVyIG5vdGF0aW9uIGZyb20gZmlsZW5hbWVzOlxuXHQvLyAgIGAuL34vY3NzLWxvYWRlciEuL3NyYy9BcHAuY3NzYCB+fj4gYC4vc3JjL0FwcC5jc3NgXG5cdGlmICggbGluZXNbMF0ubGFzdEluZGV4T2YoICchJyApICE9PSAtMSApIHtcblx0XHRsaW5lc1swXSA9IGxpbmVzWzBdLnN1YnN0ciggbGluZXNbIDAgXS5sYXN0SW5kZXhPZiggJyEnICkgKyAxICk7XG5cdH1cblxuXHQvLyBSZW1vdmUgdXNlbGVzcyBgZW50cnlgIGZpbGVuYW1lIHN0YWNrIGRldGFpbHNcblx0bGluZXMgPSBsaW5lcy5maWx0ZXIoIGxpbmUgPT4gbGluZS5pbmRleE9mKCAnIEAgJyApICE9PSAwICk7XG5cblx0Ly8gMCB+PiBmaWxlbmFtZTsgMSB+PiBtYWluIGVyciBtc2dcblx0aWYgKCAhIGxpbmVzWzBdIHx8ICEgbGluZXNbMV0gKSB7XG5cdFx0cmV0dXJuIGxpbmVzLmpvaW4oICdcXG4nICk7XG5cdH1cblxuXHQvLyBDbGVhbnMgdXAgdmVyYm9zZSBcIm1vZHVsZSBub3QgZm91bmRcIiBtZXNzYWdlcyBmb3IgZmlsZXMgYW5kIHBhY2thZ2VzLlxuXHRpZiAoIGxpbmVzWzFdLnN0YXJ0c1dpdGgoICdNb2R1bGUgbm90IGZvdW5kOiAnICkgKSB7XG5cdFx0bGluZXMgPSBbXG5cdFx0XHRsaW5lc1swXSxcblx0XHRcdGxpbmVzWzFdIC8vIFwiTW9kdWxlIG5vdCBmb3VuZDogXCIgaXMgZW5vdWdoIGRldGFpbFxuXHRcdFx0XHQucmVwbGFjZSggXCJDYW5ub3QgcmVzb2x2ZSAnZmlsZScgb3IgJ2RpcmVjdG9yeScgXCIsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdDYW5ub3QgcmVzb2x2ZSBtb2R1bGUgJywgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ0Vycm9yOiAnLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnW0Nhc2VTZW5zaXRpdmVQYXRoc1BsdWdpbl0gJywgJycgKVxuXHRcdF07XG5cdH1cblxuXHQvLyBDbGVhbnMgdXAgc3ludGF4IGVycm9yIG1lc3NhZ2VzLlxuXHRpZiAoIGxpbmVzWzFdLnN0YXJ0c1dpdGgoICdNb2R1bGUgYnVpbGQgZmFpbGVkOiAnICkgKSB7XG5cdFx0bGluZXNbMV0gPSBsaW5lc1sxXS5yZXBsYWNlKCAnTW9kdWxlIGJ1aWxkIGZhaWxlZDogU3ludGF4RXJyb3I6JywgZXJyb3JMYWJlbCApO1xuXHR9XG5cblx0aWYgKCBsaW5lc1sxXS5tYXRjaCggZXhwb3J0UmVnZXggKSApIHtcblx0XHRsaW5lc1sxXSA9IGxpbmVzWzFdLnJlcGxhY2UoIGV4cG9ydFJlZ2V4LCBcIiQxICckNCcgZG9lcyBub3QgY29udGFpbiBhbiBleHBvcnQgbmFtZWQgJyQzJy5cIiApO1xuXHR9XG5cblx0Ly8gUmVhc3NlbWJsZSAmIFN0cmlwIGludGVybmFsIHRyYWNpbmcsIGV4Y2VwdCBgd2VicGFjazpgIC0tIChjcmVhdGUtcmVhY3QtYXBwL3B1bGwvMTA1MClcblx0cmV0dXJuIGxpbmVzLmpvaW4oICdcXG4nICkucmVwbGFjZSggc3RhY2tSZWdleCwgJycgKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN0ZGVyciggZGF0YSApIHtcblx0Y29uc29sZS5sb2coIGRhdGEgKTtcblxuXHRsZXQgZXJyT2JqID0ge307XG5cdGxldCBzdGFydENhcHR1cmUgPSBmYWxzZTtcblxuXHR2YXIgbGluZXMgPSBkYXRhLnNwbGl0KCAvKFxcclxcbnxbXFxuXFx2XFxmXFxyXFx4ODVcXHUyMDI4XFx1MjAyOV0pLyApO1xuXG5cdGZvciAoIHZhciBsaW5lIG9mIGxpbmVzICkge1xuXHRcdGxldCB0cmltbWVkID0gbGluZS50cmltKCk7XG5cblx0XHRpZiAoICF0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclsgMCBdIF0gPSBlcnJBcnJbIDEgXTtcblxuXHRcdFx0aWYgKCBlcnJBcnJbIDAgXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGVyck9iai5maWxlICkgKSArXG5cdFx0XHRcdCcgb24gbGluZSAnICsgZXJyT2JqLmxpbmUgK1xuXHRcdFx0XHQnPC9jb2RlPic7XG5cblx0XHRcdGxldCBkZXRhaWxzID0gJzxwcmU+JyArIGxpbmVzICsgJzwvcHJlPic7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCB0aXRsZSwgZGV0YWlscyApO1xuXHRcdH0gKTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uICggZXJyLCBkYXRhICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdHZhciBsaW5lcyA9IGRhdGEudG9TdHJpbmcoICd1dGYtOCcgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdGlmICggK2xpbmUgPiBsaW5lcy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGxpbmVBcnIgPSBbXTtcblx0XHRsZXQgX2xpbmVBcnIgPSBbXTtcblx0XHRsZXQgbWluTGluZSA9IE1hdGgubWF4KCBsaW5lIC0gMiwgMCApO1xuXHRcdGxldCBtYXhMaW5lID0gTWF0aC5taW4oIGxpbmUgKyAyLCBsaW5lcy5sZW5ndGggKTtcblxuXHRcdGZvciAoIHZhciBpID0gbWluTGluZTsgaSA8PSBtYXhMaW5lOyBpKysgKSB7XG5cdFx0XHRfbGluZUFyclsgaSBdID0gbGluZXNbIGkgXTtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgZXh0cmFuZW91cyBpbmRlbnRhdGlvbi5cblx0XHRsZXQgc3RyaXBwZWRMaW5lcyA9IHN0cmlwSW5kZW50KCBfbGluZUFyci5qb2luKCAnXFxuJyApICkuc3BsaXQoICdcXG4nICk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1udW1iZXJcIj4nICsgKCBqICsgMSApICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1jb250ZW50XCI+JyArIHN0cmlwcGVkTGluZXNbIGogXSArICc8L3NwYW4+JyArXG5cdFx0XHRcdCc8L2Rpdj4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNhbGxiYWNrKCBudWxsLCBsaW5lQXJyLmpvaW4oICdcXG4nICkgKTtcblx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVGaWxlQW5kTGluZUVycm9ycyggbWVzc2FnZSApIHtcblx0bGV0IGZpbGVBbmRMaW5lID0gbWVzc2FnZS5tYXRjaCggZmlsZUFuZExpbmVSZWdleCApO1xuXG5cdGlmICggISBmaWxlQW5kTGluZSApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgZmlsZSA9IGZpbGVBbmRMaW5lWyAxIF07XG5cdGxldCBsaW5lID0gZmlsZUFuZExpbmVbIDIgXTtcblxuXHRjb25zb2xlLmxvZyggZmlsZUFuZExpbmUgKTtcblxuXHRnZXRFcnJMaW5lcyggZmlsZSwgbGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgdGl0bGUgPSBtZXNzYWdlLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHQnPGNvZGU+JyArXG5cdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZmlsZSApICkgK1xuXHRcdFx0JyBvbiBsaW5lICcgKyBsaW5lICtcblx0XHRcdCc8L2NvZGU+JztcblxuXHRcdGxldCBkZXRhaWxzID0gJzxwcmU+JyArIGxpbmVzICsgJzwvcHJlPic7XG5cblx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0fSApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBzdGF0cyApIHtcblx0Y29uc3QganNvbiA9IHN0YXRzLnRvSnNvbigge30sIHRydWUgKTtcblxuXHRqc29uLmVycm9ycy5tYXAoIG1zZyA9PiBoYW5kbGVGaWxlQW5kTGluZUVycm9ycyggbXNnICkgKTtcblxuXHRjb25zdCByZXN1bHQgPSB7XG5cdFx0ZXJyb3JzOiBqc29uLmVycm9ycy5tYXAoIG1zZyA9PiBmb3JtYXRNZXNzYWdlKCBtc2csIHRydWUgKSApLFxuXHRcdHdhcm5pbmdzOiBqc29uLndhcm5pbmdzLm1hcCggbXNnID0+IGZvcm1hdE1lc3NhZ2UoIG1zZywgZmFsc2UgKSApXG5cdH07XG5cblx0Ly8gT25seSBzaG93IHN5bnRheCBlcnJvcnMgaWYgd2UgaGF2ZSB0aGVtXG5cdGlmICggcmVzdWx0LmVycm9ycy5zb21lKCBpc0xpa2VseUFTeW50YXhFcnJvciApICkge1xuXHRcdHJlc3VsdC5lcnJvcnMgPSByZXN1bHQuZXJyb3JzLmZpbHRlciggaXNMaWtlbHlBU3ludGF4RXJyb3IgKTtcblx0fVxuXG5cdC8vIEZpcnN0IGVycm9yIGlzIHVzdWFsbHkgaXQ7IG90aGVycyB1c3VhbGx5IHRoZSBzYW1lXG5cdGlmICggcmVzdWx0LmVycm9ycy5sZW5ndGggPiAxICkge1xuXHRcdHJlc3VsdC5lcnJvcnMubGVuZ3RoID0gMTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRNZXNzYWdlID0gZm9ybWF0TWVzc2FnZTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgY29tcG9uZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XG5cbmNvbnN0IFNpZGViYXIgPSByZXF1aXJlKCcuL1NpZGViYXInKTtcblxuY29uc3QgTG9ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvTG9ncycpO1xuXG5jb25zdCBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvU2V0dGluZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMudmlld3MgPSB7XG5cdFx0XHRmaWxlczogJ0ZpbGVzJyxcblx0XHRcdGxvZ3M6ICdMb2dzJyxcblx0XHRcdHNldHRpbmdzOiAnU2V0dGluZ3MnXG5cdFx0fTtcblx0fVxuXG5cdHJlbmRlck92ZXJsYXkoKSB7XG5cdFx0Z2xvYmFsLnVpLm92ZXJsYXkoIHRoaXMucHJvcHMudmlldyAhPT0gJ2ZpbGVzJyApO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdmaWxlcycgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gPFNldHRpbmdzIC8+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8T3ZlcmxheSBoYXNDbG9zZT17IGZhbHNlIH0+XG5cdFx0XHRcdFx0eyBjb250ZW50IH1cblx0XHRcdFx0PC9PdmVybGF5PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2FwcCc+XG5cdFx0XHRcdDxTaWRlYmFyIGl0ZW1zPXsgdGhpcy52aWV3cyB9IC8+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudC13cmFwJz5cblx0XHRcdFx0XHQ8UHJvamVjdHMgLz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlck92ZXJsYXkoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHR2aWV3OiBzdGF0ZS52aWV3LFxuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBBcHAgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBlbXB0eSBzY3JlZW4vbm8gY29udGVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vLWNvbnRlbnQnICsgKCBwcm9wcy5jbGFzc05hbWUgPyAnICcgKyBwcm9wcy5jbGFzc05hbWUgOiAnJyApIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGFuIG92ZXJsYXkuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBPdmVybGF5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Ly8gY29uc3RydWN0b3IoKSB7fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nb3ZlcmxheSc+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5oYXNDbG9zZSAmJlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGlkPSdjbG9zZS1vdmVybGF5Jz4mdGltZXM7PC9hPlxuXHRcdFx0XHR9XG5cblx0XHRcdFx0PGRpdiBpZD0nb3ZlcmxheS1jb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7XG4iLCIvKipcbiAqIEBmaWxlIEFwcCBzaWRlYmFyLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjaGFuZ2VWaWV3IH0gPSByZXF1aXJlKCcuLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY2xhc3MgU2lkZWJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHRsZXQgdmlldyA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC52aWV3O1xuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VWaWV3KCB2aWV3ICk7XG5cdH1cblxuXHRyZW5kZXJJdGVtcygpIHtcblx0XHRsZXQgaXRlbXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpZCBpbiB0aGlzLnByb3BzLml0ZW1zICkge1xuXHRcdFx0aXRlbXMucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdmlldz17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXRpcD17IHRoaXMucHJvcHMuaXRlbXNbIGlkIF0gfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMuYWN0aXZlID09PSBpZCA/ICdhY3RpdmUnIDogJycgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdHJldHVybiBpdGVtcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PG5hdiBpZD0nc2lkZWJhcic+XG5cdFx0XHRcdDx1bCBpZD0nbWVudSc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckl0ZW1zKCkgfVxuXHRcdFx0XHQ8L3VsPlxuXHRcdFx0PC9uYXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlOiBzdGF0ZS52aWV3XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGNoYW5nZVZpZXc6IHZpZXcgPT4gZGlzcGF0Y2goIGNoYW5nZVZpZXcoIHZpZXcgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBTaWRlYmFyICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgc2F2ZSBmaWxlIGZpZWxkLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVTYXZlT3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLnRpdGxlID0gdGhpcy5wcm9wcy5kaWFsb2dUaXRsZTtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnByb3BzLnZhbHVlICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5wcm9wcy52YWx1ZSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmZpbHRlcnMgPSB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gZGlhbG9nLnNob3dTYXZlRGlhbG9nKCBmaWxlU2F2ZU9wdGlvbnMgKTtcblxuXHRcdGlmICggZmlsZW5hbWUgKSB7XG5cdFx0XHRsZXQgc2F2ZVBhdGggPSBzbGFzaCggZmlsZW5hbWUgKTtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRcdHNhdmVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgZmlsZW5hbWUgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgc2F2ZVBhdGggKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdoaWRkZW4nXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRyZWFkT25seVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8c21hbGwgb25DbGljaz17IHRoaXMub25DbGljayB9PnsgdGhpcy5wcm9wcy52YWx1ZSB9PC9zbWFsbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSksXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNhdmVGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5wcm9wcy52YWx1ZSBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCAhIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbiBlbXB0eSc+XG5cdFx0XHRcdFx0PGgxPk5vIGxvZ3MgeWV0LjwvaDE+XG5cdFx0XHRcdFx0PGgyPkdvIGZvcnRoIGFuZCBjb21waWxlITwvaDI+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nbG9ncycgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbic+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyBwYW5lbC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGUgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Z2V0T3B0aW9ucygpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5wcm9qZWN0LnBhdGggfSBmaWxlPXsgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDb250ZW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcblxuXHRcdFx0aWYgKCBvcHRpb25zICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoYXMtb3B0aW9ucycpO1xuXG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHQ8cD5TZWxlY3QgYSBzdHlsZXNoZWV0IG9yIHNjcmlwdCBmaWxlIHRvIHZpZXcgY29tcGlsaW5nIG9wdGlvbnMuPC9wPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncGFuZWwnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ29udGVudCgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGUsXG5cdHByb2plY3Q6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBQYW5lbCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHNlbGVjdG9yLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IHNldFByb2plY3RTdGF0ZSwgcmVmcmVzaEFjdGl2ZVByb2plY3QgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0Q29uZmlnIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy91dGlscycpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVByb2plY3QgPSB0aGlzLnRvZ2dsZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdGdsb2JhbC51aS51bmZvY3VzKCAhIHRoaXMuc3RhdGUuaXNPcGVuICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgaXNPcGVuOiAhIHRoaXMuc3RhdGUuaXNPcGVuIH0pO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgfHwgZmFsc2U7XG5cblx0XHR0aGlzLnByb3BzLnNldFByb2plY3RTdGF0ZSh7IHBhdXNlZDogcGF1c2VkIH0pO1xuXG5cdFx0dGhpcy5wcm9wcy5yZWZyZXNoQWN0aXZlUHJvamVjdCh7XG5cdFx0XHQuLi50aGlzLnByb3BzLmFjdGl2ZSxcblx0XHRcdHBhdXNlZDogcGF1c2VkXG5cdFx0fSk7XG5cblx0XHRzZXRQcm9qZWN0Q29uZmlnKCAncGF1c2VkJywgcGF1c2VkICk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnByb3BzLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0KyBBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCcgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gc2VsZWN0IG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0JyBjbGFzc05hbWU9J3NlbGVjdGVkJz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aW9ucyc+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPXsgJ3RvZ2dsZScgKyAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCA/ICcgcGF1c2VkJyA6ICcgYWN0aXZlJyApIH0gb25DbGljaz17IHRoaXMudG9nZ2xlUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZWZyZXNoJyBvbkNsaWNrPXsgdGhpcy5wcm9wcy5yZWZyZXNoUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZW1vdmUnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlbW92ZVByb2plY3QgfSAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdFxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRQcm9qZWN0U3RhdGU6IHN0YXRlID0+IGRpc3BhdGNoKCBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkgKSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdFNlbGVjdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyB2aWV3LlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBfZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2gvZGVib3VuY2UnKTtcblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgTm90aWNlID0gcmVxdWlyZSgnLi4vdWkvTm90aWNlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IFBhbmVsID0gcmVxdWlyZSgnLi9QYW5lbCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZGlyZWN0b3J5VHJlZScpO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9Mb2dnZXInKTtcblxuY29uc3QgeyBhZGRQcm9qZWN0LCByZW1vdmVQcm9qZWN0LCBjaGFuZ2VQcm9qZWN0LCByZWNlaXZlRmlsZXMsIHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJyxcblx0XHRcdFx0J2J1aWxkci1wcm9qZWN0Lmpzb24nXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmluaXRQcm9qZWN0ID0gdGhpcy5pbml0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0ID0gdGhpcy5jaGFuZ2VQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoID0gdGhpcy5jaGFuZ2VQcm9qZWN0UGF0aC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uID0gdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uLmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0bGV0IG5ld1Byb2plY3RJbmRleCA9IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIFtcblx0XHRcdFx0Li4udGhpcy5wcm9wcy5wcm9qZWN0cyxcblx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XSApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbmV3UHJvamVjdEluZGV4LCBuZXdQcm9qZWN0ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQsIHByb2plY3QgPSBudWxsICkge1xuXHRcdGlmICggaWQgPT09IHRoaXMucHJvcHMuYWN0aXZlLmlkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmICggcHJvamVjdCApIHtcblx0XHRcdGFjdGl2ZSA9IHByb2plY3Q7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy5wcm9qZWN0c1tpZF0gKSB7XG5cdFx0XHRhY3RpdmUgPSB0aGlzLnByb3BzLnByb2plY3RzW2lkXTtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpZCApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRpZFxuXHRcdH0pO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoKSB7XG5cdFx0bGV0IHJlbW92ZUluZGV4ID0gcGFyc2VJbnQoIHRoaXMucHJvcHMuYWN0aXZlLmlkLCAxMCApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFJlbW92ZSBwcm9qZWN0IGZyb20gY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCggcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFVuc2V0IGFjdGl2ZSBwcm9qZWN0LlxuXHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbnVsbCApO1xuXHR9XG5cblx0Ly8gQ29uZmlybSBwcm9qZWN0IHJlbW92YWwgd2hlbiBjbGlja2luZyByZW1vdmUgYnV0dG9uLlxuXHRyZW1vdmVQcm9qZWN0QnV0dG9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNvbmZpcm1SZW1vdmUgPSB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJHt0aGlzLnByb3BzLmFjdGl2ZS5uYW1lfT9gICk7XG5cblx0XHRpZiAoIGNvbmZpcm1SZW1vdmUgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZVByb2plY3QoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgYWN0aXZlIHByb2plY3QncyBwYXRoLlxuXHRjaGFuZ2VQcm9qZWN0UGF0aCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZygge1xuXHRcdFx0cHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5J11cblx0XHR9ICk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzO1xuXHRcdFx0bGV0IHByb2plY3RJbmRleCA9IHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0SW5kZXggPT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IG5vdCBmb3VuZC5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0c1sgcHJvamVjdEluZGV4IF0ucGF0aCA9IHBhdGhbMF07XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHRcdC8vIFNldCBuZXcgcHJvamVjdCBhcyBhY3RpdmUuXG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIHByb2plY3RJbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVmcmVzaCB0aGUgcHJvamVjdCBmaWxlcy5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG9yIGZldGNoIHRoZSBwcm9qZWN0IGNvbmZpZyBmaWxlLlxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUuXG5cdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICd3YXJuaW5nJyxcblx0XHRcdFx0XHRcdHRpdGxlOiAnUHJvamVjdCBkaXJlY3RvcnkgbWlzc2luZycsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LiBJdCBtYXkgaGF2ZSBiZWVuIG1vdmVkIG9yIHJlbmFtZWQuYCxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFsgJ0NoYW5nZSBEaXJlY3RvcnknLCAnUmVtb3ZlIFByb2plY3QnIF1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZGlhbG9nLnNob3dNZXNzYWdlQm94KCBvcHRpb25zLCBmdW5jdGlvbiggaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGluZGV4ID09PSAwICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gMSApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVQcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBObyBwcm9qZWN0IHBhdGggcHJvdmlkZWQuXG5cdFx0XHRcdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBudWxsO1xuXG5cdFx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIHt9ICkgKTtcblxuXHRcdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5IGlzIHJlYWRhYmxlLCBnZXQgZmlsZXMgYW5kIHNldHVwIGNvbmZpZy5cblx0XHRcdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKTtcblxuXHRcdFx0XHQvLyBDaGFuZ2UgcHJvY2VzcyBjd2QuXG5cdFx0XHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uIH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMT5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDE+XG5cdFx0XHRcdFx0PGgyPldvdWxkIHlvdSBsaWtlIHRvIGFkZCBvbmUgbm93PzwvaDI+XG5cdFx0XHRcdFx0PGJ1dHRvbiBjbGFzc05hbWU9J2xhcmdlIGZsYXQgYWRkLW5ldy1wcm9qZWN0JyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+QWRkIFByb2plY3Q8L2J1dHRvbj5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0IHNlbGVjdGVkLCBzaG93IHNlbGVjdG9yLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3Byb2plY3Qtc2VsZWN0LXNjcmVlbic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdHMnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyTm90aWNlcygpIH1cblxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfVxuXHRcdFx0XHRcdFx0ZmlsZXM9eyB0aGlzLnByb3BzLmZpbGVzIH1cblx0XHRcdFx0XHRcdGxvYWRpbmc9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxQYW5lbCAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0YWRkUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggYWRkUHJvamVjdCggcHJvamVjdCApICksXG5cdGNoYW5nZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCBjaGFuZ2VQcm9qZWN0KCBpZCApICksXG5cdHJlbW92ZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCByZW1vdmVQcm9qZWN0KCBpZCApICksXG5cdHNldEFjdGl2ZUZpbGU6IGZpbGUgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0cyApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIHNldHRpbmdzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nc2V0dGluZ3Mtc2NyZWVuJz5cblx0XHRcdFx0PGgxPlNldHRpbmdzPC9oMT5cblx0XHRcdFx0PGgyPkNvbWluZyBzb29uITwvaDI+XG5cdFx0XHQ8L05vQ29udGVudD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVMaXN0RmlsZSA9IHJlcXVpcmUoJy4vRmlsZUxpc3RGaWxlJyk7XG5cbmNvbnN0IEZpbGVMaXN0RGlyZWN0b3J5ID0gcmVxdWlyZSgnLi9GaWxlTGlzdERpcmVjdG9yeScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgeyBzZXRBY3RpdmVGaWxlIH0gPSByZXF1aXJlKCcuLi8uLi8uLi9hY3Rpb25zJyk7XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zZXRBY3RpdmVGaWxlID0gdGhpcy5zZXRBY3RpdmVGaWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICcuc3ZnJzpcblx0XHRcdGNhc2UgJy5wbmcnOlxuXHRcdFx0Y2FzZSAnLmpwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnBocCc6XG5cdFx0XHRjYXNlICcuaHRtbCc6XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcuemlwJzpcblx0XHRcdGNhc2UgJy5yYXInOlxuXHRcdFx0Y2FzZSAnLnRhcic6XG5cdFx0XHRjYXNlICcuN3onOlxuXHRcdFx0Y2FzZSAnLmd6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRzZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgJiYgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQgPT09IGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRmaWxlUHJvcHMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICk7XG5cdH1cblxuXHRidWlsZFRyZWUoIGZpbGUsIGxldmVsID0gMCApIHtcblx0XHRsZXQgdHlwZSA9IGZpbGUudHlwZTtcblx0XHRsZXQgZXh0ID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbDtcblx0XHRsZXQgY2hpbGRyZW47XG5cblx0XHRpZiAoIGZpbGUudHlwZSA9PT0gJ2RpcmVjdG9yeScgKSB7XG5cdFx0XHRpZiAoIGZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0bGV0IGNoaWxkcmVuSXRlbXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gZmlsZS5jaGlsZHJlbiApIHtcblx0XHRcdFx0XHRjaGlsZHJlbkl0ZW1zLnB1c2goIHRoaXMuYnVpbGRUcmVlKCBmaWxlLmNoaWxkcmVuWyBjaGlsZCBdLCBsZXZlbCArIDEgKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2hpbGRyZW4gPSA8dWwgY2xhc3NOYW1lPSdjaGlsZHJlbicga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RGlyZWN0b3J5XG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGNoaWxkcmVuPXsgY2hpbGRyZW4gfVxuXHRcdFx0Lz47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdEZpbGVcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHR0eXBlPXsgdHlwZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRiYXNlPXsgdGhpcy5wcm9wcy5wYXRoIH1cblx0XHRcdFx0c2V0QWN0aXZlRmlsZT17IHRoaXMuc2V0QWN0aXZlRmlsZSB9XG5cdFx0XHQvPjtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5wcm9wcy5sb2FkaW5nICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2xvYWRpbmcnPlxuXHRcdFx0XHRcdDxwPkxvYWRpbmcmaGVsbGlwOzwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5ObyBwcm9qZWN0IGZvbGRlciBzZWxlY3RlZC48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuZmlsZXMgfHwgISBPYmplY3Qua2V5cyggdGhpcy5wcm9wcy5maWxlcyApLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm90aGluZyB0byBzZWUgaGVyZS48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiAmJiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5LlxuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyBmaWxlbGlzdCB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGVcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0c2V0QWN0aXZlRmlsZTogcGF5bG9hZCA9PiBkaXNwYXRjaCggc2V0QWN0aXZlRmlsZSggcGF5bG9hZCApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIEZpbGVMaXN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdERpcmVjdG9yeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRleHBhbmRlZDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgeyByZW1vdGUsIHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5jb25zdCB7IE1lbnUsIE1lbnVJdGVtIH0gPSByZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3RGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLm9uQ29udGV4dE1lbnUgPSB0aGlzLm9uQ29udGV4dE1lbnUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoe1xuXHRcdFx0ZmlsZTogdGhpcy5wcm9wcy5maWxlLFxuXHRcdFx0ZWxlbWVudDogZXZlbnQuY3VycmVudFRhcmdldFxuXHRcdH0pO1xuXHR9XG5cblx0b25Db250ZXh0TWVudSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlUGF0aCA9IHRoaXMucHJvcHMuZmlsZS5wYXRoO1xuXG5cdFx0bGV0IG1lbnUgPSBuZXcgTWVudSgpO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdPcGVuJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwub3Blbkl0ZW0oIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ1Nob3cgaW4gZm9sZGVyJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlciggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdHR5cGU6ICdzZXBhcmF0b3InXG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnRGVsZXRlJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0/YCApICkge1xuXHRcdFx0XHRcdGlmICggc2hlbGwubW92ZUl0ZW1Ub1RyYXNoKCBmaWxlUGF0aCApICkge1xuXHRcdFx0XHRcdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvZmlsZXMnKSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuYWxlcnQoIGBDb3VsZCBub3QgZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9LmAgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSkgKTtcblxuXHRcdG1lbnUucG9wdXAoIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpXG5cdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMudHlwZSB9XG5cdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRvbkNvbnRleHRNZW51PXsgdGhpcy5vbkNvbnRleHRNZW51IH1cblx0XHRcdD5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdEZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGJ1aWxkIG9wdGlvbnMgZm9yIGEgZmlsZS5cbiAqL1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoLCBmaWxlT3V0cHV0UGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZUNoYW5nZSA9IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmhhbmRsZUNvbXBpbGUgPSB0aGlzLmhhbmRsZUNvbXBpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoIHsgbG9hZGluZzogZmFsc2UgfSApO1xuXHRcdH0uYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlQ2FsbGJhY2sgPSBudWxsO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBjb21waWxlT3B0aW9ucyA9IGdsb2JhbC5jb21waWxlci5nZXRGaWxlT3B0aW9ucyggbmV4dFByb3BzLmZpbGUgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBjb21waWxlT3B0aW9ucy50eXBlLFxuXHRcdFx0ZmlsZVR5cGU6IGNvbXBpbGVPcHRpb25zLmZpbGVUeXBlLFxuXHRcdFx0YnVpbGRUYXNrTmFtZTogY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZSxcblx0XHRcdG9wdGlvbnM6IEZpbGVPcHRpb25zLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBuZXh0UHJvcHMuYmFzZSwgbmV4dFByb3BzLmZpbGUgKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0bGV0IGNmaWxlID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKTtcblxuXHRcdHJldHVybiAoIGNmaWxlICYmIGNmaWxlLm9wdGlvbnMgKSA/IGNmaWxlLm9wdGlvbnMgOiB7fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRpZiAoIGZpbGUgJiYgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICkgKTtcblxuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdFx0aWYgKCBjZmlsZSApIHtcblx0XHRcdFx0cmV0dXJuIGNmaWxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Z2V0Q29uZmlnKCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRsZXQgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXRoOiBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICksXG5cdFx0XHRvdXRwdXQ6IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSxcblx0XHRcdG9wdGlvbnM6IHt9XG5cdFx0fTtcblxuXHRcdGxldCBzdG9yZWQgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUgKTtcblxuXHRcdGxldCBjb25maWcgPSAoIHN0b3JlZCAhPT0gbnVsbCApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpICkgKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICkge1xuXHRcdFx0XHRmaWxlQ29uZmlnWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRmaWxlcy5wdXNoKCBmaWxlQ29uZmlnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcblx0XHRcdFx0ZGVsZXRlIGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9ucyAmJiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXG5cdHNldE9wdGlvbiggb3B0aW9uLCB2YWx1ZSApIHtcblx0XHRsZXQgb3B0aW9ucyA9IHRoaXMuc3RhdGUub3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zWyBvcHRpb24gXSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5zZXRDb25maWcoICdvcHRpb25zJywgb3B0aW9ucyApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IG9wdGlvbnM6IG9wdGlvbnMgfSk7XG5cdH1cblxuXHRoYW5kbGVDaGFuZ2UoIG5hbWUsIHZhbHVlICkge1xuXHRcdGlmICggbmFtZSA9PT0gJ291dHB1dCcgKSB7XG5cdFx0XHR0aGlzLnNldENvbmZpZyggJ291dHB1dCcsIHZhbHVlICk7XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoIHRoaXMuc3RhdGUgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRPcHRpb24oIG5hbWUsIHZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0cmV0dXJuIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHRoaXMub3V0cHV0U3VmZml4LCB0aGlzLm91dHB1dEV4dGVuc2lvbiApO1xuXHR9XG5cblx0Z2V0T3V0cHV0UGF0aCggdHlwZSA9ICdyZWxhdGl2ZScgKSB7XG5cdFx0bGV0IHNsYXNoUGF0aCA9ICggdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aCA9ICggdHlwZSA9PT0gJ3JlbGF0aXZlJyB8fCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCk7XG5cdFx0bGV0IG91dHB1dFBhdGggPSB0aGlzLmdldENvbmZpZyggJ291dHB1dCcsIGRlZmF1bHRQYXRoICk7XG5cblx0XHRpZiAoIHJlbGF0aXZlUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggc2xhc2hQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IHNsYXNoKCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFBhdGg7XG5cdH1cblxuXHRoYW5kbGVDb21waWxlKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0ey8qIDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYnVuZGxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz4gKi99XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3VnbGlmeSdcblx0XHRcdFx0XHRcdGxhYmVsPSdVZ2xpZnknXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3VnbGlmeScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU2NyaXB0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHN0eWxlc2hlZXQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTZWxlY3QgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTZWxlY3QnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlcyBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5jc3MnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdDU1MnLCBleHRlbnNpb25zOiBbICdjc3MnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRpc1BhcnRpYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHRcdDxwPlRoaXMgaXMgYSBwYXJ0aWFsIGZpbGUsPGJyIC8+IGl0IGNhbm5vdCBiZSBjb21waWxlZCBvbiBpdHMgb3duLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHNob3dpbmcgbm90aWNlcyBhbmQgYWxlcnRzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgTm90aWNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdGxldCB0eXBlID0gdGhpcy5wcm9wcy50eXBlIHx8ICdpbmZvJztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17ICdub3RpY2UgdHlwZS0nICsgdHlwZSB9PlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGljZTtcbiIsIi8qKlxuICogQGZpbGUgUm9vdCByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHsgY29tYmluZVJlZHVjZXJzIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCB2aWV3ID0gKCBjdXJyZW50ID0gJ2ZpbGVzJywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfVklFVyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnZpZXc7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBjdXJyZW50O1xuXHR9XG59O1xuXG5jb25zdCB7IHByb2plY3RzLCBhY3RpdmVQcm9qZWN0LCBhY3RpdmVQcm9qZWN0RmlsZXMgfSA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuY29uc3QgYWN0aXZlRmlsZSA9ICggZmlsZSA9IG51bGwsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnU0VUX0FDVElWRV9GSUxFJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuXHR2aWV3LFxuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzLFxuXHRhY3RpdmVGaWxlXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggcHJvamVjdHMgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5wcm9qZWN0cyxcblx0XHRcdFx0YWN0aW9uLnBheWxvYWRcblx0XHRcdF07XG5cdFx0Y2FzZSAnUkVNT1ZFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIHByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSBhY3Rpb24uaWQgKTtcblx0XHRjYXNlICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5tYXAoIGZ1bmN0aW9uKCBwcm9qZWN0LCBpbmRleCApIHtcblx0XHRcdFx0aWYgKCBpbmRleCA9PT0gcGFyc2VJbnQoIGFjdGlvbi5wYXlsb2FkLmlkLCAxMCApICkge1xuXHRcdFx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9qZWN0cztcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdCA9ICggYWN0aXZlID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGNhc2UgJ1NFVF9QUk9KRUNUX1NUQVRFJzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0Li4uYWN0aW9uLnBheWxvYWRcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBhY3RpdmU7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3RGaWxlcyA9ICggZmlsZXMgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdSRUNFSVZFX0ZJTEVTJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGVzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG92ZXJsYXksXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRsZXQgc3RhdGUgPSB7XG5cdFx0dmlldzogJ2ZpbGVzJyxcblx0XHRwcm9qZWN0czogW10sXG5cdFx0YWN0aXZlUHJvamVjdDogMCxcblx0XHRhY3RpdmVQcm9qZWN0RmlsZXM6IHt9LFxuXHRcdGFjdGl2ZUZpbGU6IG51bGxcblx0fTtcblxuXHRpZiAoIGdsb2JhbC5jb25maWcuaGFzKCAncHJvamVjdHMnICkgKSB7XG5cdFx0c3RhdGUucHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCggJ3Byb2plY3RzJyApO1xuXHR9XG5cblx0aWYgKCBzdGF0ZS5wcm9qZWN0cy5sZW5ndGggJiYgZ2xvYmFsLmNvbmZpZy5oYXMoICdhY3RpdmUtcHJvamVjdCcgKSApIHtcblx0XHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCggJ2FjdGl2ZS1wcm9qZWN0JyApO1xuXG5cdFx0aWYgKCBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QgPSBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QuaWQgPSBhY3RpdmVJbmRleDtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0bGV0IHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRwcm9qZWN0c1sgYWN0aXZlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlnLicgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlICkge1xuXHRsZXQgZGVwZW5kZW5jaWVzID0gW107XG5cblx0Zm9yICggdmFyIGRlcGVuZGVuY3kgaW4gZGVwZW5kZW5jeVRyZWUgKSB7XG5cdFx0ZGVwZW5kZW5jaWVzLnB1c2goIGRlcGVuZGVuY3kgKTtcblxuXHRcdGlmICggT2JqZWN0LmtleXMoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKS5sZW5ndGggPiAwICkge1xuXHRcdFx0ZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzLmNvbmNhdCggZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkgKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZGVwZW5kZW5jaWVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xlZXAsXG5cdGdldEluaXRpYWxTdGF0ZSxcblx0c2V0UHJvamVjdENvbmZpZyxcblx0Z2V0RGVwZW5kZW5jeUFycmF5XG59O1xuIl19
