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

	for (var i = 0; i < tasks.length; i++) {
		var task = tasks[i];
		var filename = void 0;

		if (_typeof(task._events) === 'object' && typeof task._events.update === 'function') {
			filename = path.basename(task.inputPath);
			// Close chokidar watch processes.
			task.inputPathWatcher.close();
			task.rootDirWatcher.close();
		} else {
			filename = path.basename(task.compiler.options.entry);
			// Close webpack watch process.
			task.close();
		}

		// global.logger.log( 'info', `Stopped watching ${filename}.` );

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

	console.log('​runTask -> options', options);

	// Get imported files.
	// let watchFiles = getDependencyArray( dependencyTree({
	// 	filename: options.input,
	// 	directory: options.projectBase
	// }));

	var inputFilename = path.basename(options.input);

	if (taskName === 'watch') {
		// Watch task starting.
		// global.logger.log( 'info', `Watching ${inputFilename}...` );

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

		console.log(stats);

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
		options.getInstance = true;
		var compiler = handleJsCompile(options);
		var _watcher = compiler.watch({
			aggregateTimeout: 300
		}, function (error, stats) {
			if (error) {
				console.error(error);
			}

			console.log(stats);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87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OEM7QUFDN0MsS0FBSSxlQUFlLEVBQW5COztBQUVBLE1BQU0sSUFBSSxVQUFWLElBQXdCLGNBQXhCLEVBQXlDO0FBQ3hDLGVBQWEsSUFBYixDQUFtQixVQUFuQjs7QUFFQSxNQUFLLE9BQU8sSUFBUCxDQUFhLGVBQWdCLFVBQWhCLENBQWIsRUFBNEMsTUFBNUMsR0FBcUQsQ0FBMUQsRUFBOEQ7QUFDN0Qsa0JBQWUsYUFBYSxNQUFiLENBQXFCLG1CQUFvQixlQUFnQixVQUFoQixDQUFwQixDQUFyQixDQUFmO0FBQ0E7QUFDRDs7QUFFRCxRQUFPLFlBQVA7QUFDQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsYUFEZ0I7QUFFaEIsaUNBRmdCO0FBR2hCLG1DQUhnQjtBQUloQjtBQUpnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQGZpbGUgQWN0aW9ucy5cbiAqL1xuXG4vLyBNYWluLlxuXG5mdW5jdGlvbiBjaGFuZ2VWaWV3KCB2aWV3ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfVklFVycsXG5cdFx0dmlld1xuXHR9O1xufVxuXG4vLyBQcm9qZWN0cy5cblxuZnVuY3Rpb24gYWRkUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQUREX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJvamVjdCggaWQgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFTU9WRV9QUk9KRUNUJyxcblx0XHRpZFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfUFJPSkVDVF9TVEFURScsXG5cdFx0cGF5bG9hZDogc3RhdGVcblx0fTtcbn1cblxuLy8gRmlsZXMuXG5cbmZ1bmN0aW9uIHJlY2VpdmVGaWxlcyggZmlsZXMgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFQ0VJVkVfRklMRVMnLFxuXHRcdHBheWxvYWQ6IGZpbGVzXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9BQ1RJVkVfRklMRScsXG5cdFx0cGF5bG9hZDogZmlsZVxuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2hhbmdlVmlldyxcblx0YWRkUHJvamVjdCxcblx0Y2hhbmdlUHJvamVjdCxcblx0cmVtb3ZlUHJvamVjdCxcblx0c2V0UHJvamVjdFN0YXRlLFxuXHRyZWNlaXZlRmlsZXMsXG5cdHNldEFjdGl2ZUZpbGUsXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0XG59O1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuL2NvbXBpbGVyL2ludGVyZmFjZScpO1xuXG5nbG9iYWwuY29tcGlsZXJUYXNrcyA9IFtdO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IHsgUHJvdmlkZXIgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgY3JlYXRlU3RvcmUgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHJvb3RSZWR1Y2VyID0gcmVxdWlyZSgnLi9yZWR1Y2VycycpO1xuXG5jb25zdCB7IGdldEluaXRpYWxTdGF0ZSB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuY29uc3QgaW5pdGlhbFN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKCk7XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyLCBpbml0aWFsU3RhdGUgKTtcblxuZ2xvYmFsLnN0b3JlID0gc3RvcmU7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9eyBzdG9yZSB9PlxuXHRcdDxBcHAgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7XG5cbmNvbnN0IHsgc2xlZXAgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcblxuLy8gQXBwIGNsb3NlL3Jlc3RhcnQgZXZlbnRzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID4gMCApIHtcblx0XHRjb25zb2xlLmxvZyggJ0tpbGxpbmcgJWQgcnVubmluZyB0YXNrcy4uLicsIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXG5cdFx0c2xlZXAoIDMwMCApO1xuXHR9XG59KTtcbiIsIi8qKlxuKiBAZmlsZSBHdWxwIHNjcmlwdHMgYW5kIHRhc2tzLlxuKi9cblxuLyogZ2xvYmFsIE5vdGlmaWNhdGlvbiAqL1xuXG5jb25zdCB7IGFwcCB9ID0gcmVxdWlyZSggJ2VsZWN0cm9uJyApLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG4vLyBjb25zdCBkZXBlbmRlbmN5VHJlZSA9IHJlcXVpcmUoICdkZXBlbmRlbmN5LXRyZWUnICk7XG5cbmNvbnN0IHNhc3MgPSByZXF1aXJlKCAnbm9kZS1zYXNzJyApO1xuY29uc3QgV2F0Y2hTYXNzID0gcmVxdWlyZSggJ25vZGUtc2Fzcy13YXRjaGVyJyApO1xuY29uc3QgYXV0b3ByZWZpeGVyID0gcmVxdWlyZSggJ2F1dG9wcmVmaXhlcicgKTtcbmNvbnN0IHByZWNzcyA9IHJlcXVpcmUoICdwcmVjc3MnICk7XG5jb25zdCBwb3N0Y3NzID0gcmVxdWlyZSggJ3Bvc3Rjc3MnICk7XG5jb25zdCB3ZWJwYWNrID0gcmVxdWlyZSggJ3dlYnBhY2snICk7XG5jb25zdCBVZ2xpZnlKc1BsdWdpbiA9IHJlcXVpcmUoICd1Z2xpZnlqcy13ZWJwYWNrLXBsdWdpbicgKTtcbmNvbnN0IGZvcm1hdE1lc3NhZ2VzID0gcmVxdWlyZSggJy4vbWVzc2FnZXMnICk7XG5cbmNvbnN0IHsgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSggJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyApO1xuLy8gY29uc3QgeyBnZXREZXBlbmRlbmN5QXJyYXkgfSA9IHJlcXVpcmUoICcuLi91dGlscy91dGlscycgKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA9PT0gMCApIHtcblx0XHQvLyBOb3RoaW5nIHRvIGtpbGwgOihcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3M7XG5cblx0Zm9yICggbGV0IGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKysgKSB7XG5cdFx0bGV0IHRhc2sgPSB0YXNrc1sgaSBdO1xuXHRcdGxldCBmaWxlbmFtZTtcblxuXHRcdGlmICggdHlwZW9mIHRhc2suX2V2ZW50cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhc2suX2V2ZW50cy51cGRhdGUgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIHRhc2suaW5wdXRQYXRoICk7XG5cdFx0XHQvLyBDbG9zZSBjaG9raWRhciB3YXRjaCBwcm9jZXNzZXMuXG5cdFx0XHR0YXNrLmlucHV0UGF0aFdhdGNoZXIuY2xvc2UoKTtcblx0XHRcdHRhc2sucm9vdERpcldhdGNoZXIuY2xvc2UoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCB0YXNrLmNvbXBpbGVyLm9wdGlvbnMuZW50cnkgKTtcblx0XHRcdC8vIENsb3NlIHdlYnBhY2sgd2F0Y2ggcHJvY2Vzcy5cblx0XHRcdHRhc2suY2xvc2UoKTtcblx0XHR9XG5cblx0XHQvLyBnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgU3RvcHBlZCB3YXRjaGluZyAke2ZpbGVuYW1lfS5gICk7XG5cblx0XHR0YXNrcy5zcGxpY2UoIGksIDEgKTtcblx0fVxuXG5cdGdsb2JhbC5jb21waWxlclRhc2tzID0gdGFza3M7XG5cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZVxuXHR9O1xuXG5cdGlmICggZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdGZvciAoIHZhciBvcHRpb24gaW4gZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdFx0aWYgKCAhIGZpbGVDb25maWcub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IGZpbGVDb25maWcub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0XHRvcHRpb25zLndhdGNoVGFzayA9IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zID0ge30sIGNhbGxiYWNrID0gbnVsbCApIHtcblx0Y29uc29sZS5sb2coJ+KAi3J1blRhc2sgLT4gb3B0aW9ucycsIG9wdGlvbnMpO1xuXG5cdC8vIEdldCBpbXBvcnRlZCBmaWxlcy5cblx0Ly8gbGV0IHdhdGNoRmlsZXMgPSBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlKHtcblx0Ly8gXHRmaWxlbmFtZTogb3B0aW9ucy5pbnB1dCxcblx0Ly8gXHRkaXJlY3Rvcnk6IG9wdGlvbnMucHJvamVjdEJhc2Vcblx0Ly8gfSkpO1xuXG5cdGxldCBpbnB1dEZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGlmICggdGFza05hbWUgPT09ICd3YXRjaCcgKSB7XG5cdFx0Ly8gV2F0Y2ggdGFzayBzdGFydGluZy5cblx0XHQvLyBnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgV2F0Y2hpbmcgJHtpbnB1dEZpbGVuYW1lfS4uLmAgKTtcblxuXHRcdGhhbmRsZVdhdGNoVGFzayggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIHtcblx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnaW5mbycsIGBDb21waWxpbmcgJHtpbnB1dEZpbGVuYW1lfS4uLmAgKTtcblxuXHRcdHN3aXRjaCAoIHRhc2tOYW1lICkge1xuXHRcdFx0Y2FzZSAnYnVpbGQtc2Fzcyc6XG5cdFx0XHRcdGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2J1aWxkLWNzcyc6XG5cdFx0XHRcdGhhbmRsZUNzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYnVpbGQtanMnOlxuXHRcdFx0XHRoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc29sZS5lcnJvciggYFVuaGFuZGxlZCB0YXNrOiAke3Rhc2tOYW1lfWAgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdG9wdGlvbnMub3V0RmlsZSA9IHBhdGgucmVzb2x2ZSggb3B0aW9ucy5vdXRwdXQsIG9wdGlvbnMuZmlsZW5hbWUgKTtcblxuXHRzYXNzLnJlbmRlcigge1xuXHRcdGZpbGU6IG9wdGlvbnMuaW5wdXQsXG5cdFx0b3V0RmlsZTogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdG91dHB1dFN0eWxlOiBvcHRpb25zLnN0eWxlLFxuXHRcdHNvdXJjZU1hcDogb3B0aW9ucy5zb3VyY2VtYXBzLFxuXHRcdHNvdXJjZU1hcEVtYmVkOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0fSwgZnVuY3Rpb24oIGVycm9yLCByZXN1bHQgKSB7XG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXG5cdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIG9wdGlvbnMuYXV0b3ByZWZpeGVyICkge1xuXHRcdFx0XHRsZXQgcG9zdENzc09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0ZnJvbTogb3B0aW9ucy5pbnB1dCxcblx0XHRcdFx0XHR0bzogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdFx0XHRcdG1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdFx0XHRcdH07XG5cdFx0XHRcdGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCByZXN1bHQuY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGVycm9ycyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLCB3cml0ZSB0aGlzIHJlc3VsdCBvbiB0aGUgZGlza1xuXHRcdFx0XHRmcy53cml0ZUZpbGUoIG9wdGlvbnMub3V0RmlsZSwgcmVzdWx0LmNzcywgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0b3B0aW9ucy5vdXRGaWxlID0gcGF0aC5yZXNvbHZlKCBvcHRpb25zLm91dHB1dCwgb3B0aW9ucyApO1xuXG5cdGxldCBwb3N0Q3NzT3B0aW9ucyA9IHtcblx0XHRmcm9tOiBvcHRpb25zLmlucHV0LFxuXHRcdHRvOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0bWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0fTtcblxuXHRmcy5yZWFkRmlsZSggb3B0aW9ucy5pbnB1dCwgKCBlcnJvciwgY3NzICkgPT4ge1xuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIGNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIGNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0cG9zdGNzcyggWyBwcmVjc3MsIGF1dG9wcmVmaXhlciggeyBicm93c2VyczogWyAnbGFzdCA1IHZlcnNpb25zJyBdIH0gKSBdIClcblx0XHQucHJvY2VzcyggY3NzLCBwb3N0Q3NzT3B0aW9ucyApXG5cdFx0LnRoZW4oIHBvc3RDc3NSZXN1bHQgPT4ge1xuXHRcdFx0Ly8gTm8gZXJyb3JzIGR1cmluZyB0aGUgY29tcGlsYXRpb24sIHdyaXRlIHRoaXMgcmVzdWx0IG9uIHRoZSBkaXNrXG5cdFx0XHRmcy53cml0ZUZpbGUoIG9wdGlvbnMub3V0RmlsZSwgcG9zdENzc1Jlc3VsdC5jc3MsIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKCBhcHAuZ2V0QXBwUGF0aCgpLCAnbm9kZV9tb2R1bGVzJyApO1xuXHRpZiAoICEgbW9kdWxlc1BhdGgubWF0Y2goICdhcHAnICkgKSB7XG5cdFx0bW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdhcHAvbm9kZV9tb2R1bGVzJyApO1xuXHR9XG5cblx0bGV0IGNvbmZpZyA9IHtcblx0XHRtb2RlOiAnbm9uZScsXG5cdFx0ZW50cnk6IG9wdGlvbnMuaW5wdXQsXG5cdFx0Y2FjaGU6IGZhbHNlLFxuXHRcdG91dHB1dDoge1xuXHRcdFx0cGF0aDogb3B0aW9ucy5vdXRwdXQsXG5cdFx0XHRmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZVxuXHRcdH0sXG5cdFx0bW9kdWxlOiB7XG5cdFx0XHRydWxlczogWyB7XG5cdFx0XHRcdHRlc3Q6IC9cXC5qcyQvLFxuXHRcdFx0XHRleGNsdWRlOiAvKG5vZGVfbW9kdWxlc3xib3dlcl9jb21wb25lbnRzKS9cblx0XHRcdH0gXVxuXHRcdH0sXG5cdFx0cmVzb2x2ZUxvYWRlcjoge1xuXHRcdFx0bW9kdWxlczogWyBtb2R1bGVzUGF0aCBdXG5cdFx0fSxcblx0XHRkZXZ0b29sOiAoIG9wdGlvbnMuc291cmNlbWFwcyApID8gJ2lubGluZS1zb3VyY2UtbWFwJyA6IGZhbHNlLFxuXHRcdHBsdWdpbnM6IFtcblx0XHRcdG5ldyB3ZWJwYWNrLkRlZmluZVBsdWdpbigge1xuXHRcdFx0XHQncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeSggJ3Byb2R1Y3Rpb24nIClcblx0XHRcdH0gKSxcblx0XHRcdG5ldyB3ZWJwYWNrLm9wdGltaXplLk1vZHVsZUNvbmNhdGVuYXRpb25QbHVnaW4oKSxcblx0XHRcdG5ldyB3ZWJwYWNrLk5vRW1pdE9uRXJyb3JzUGx1Z2luKClcblx0XHRdXG5cdH07XG5cblx0aWYgKCBvcHRpb25zLmJhYmVsICkge1xuXHRcdGNvbmZpZy5tb2R1bGUucnVsZXNbIDAgXS51c2UgPSB7XG5cdFx0XHRsb2FkZXI6ICdiYWJlbC1sb2FkZXInLFxuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRwcmVzZXRzOiBbIHJlcXVpcmUoICdiYWJlbC1wcmVzZXQtZW52JyApIF0sXG5cdFx0XHRcdHBsdWdpbnM6IFsgcmVxdWlyZSggJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0tb2JqZWN0LXJlc3Qtc3ByZWFkJyApIF1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0aWYgKCBvcHRpb25zLnVnbGlmeSApIHtcblx0XHRsZXQgdWdsaWZ5T3B0aW9ucyA9IHtcblx0XHRcdHBhcmFsbGVsOiBmYWxzZSxcblx0XHRcdHNvdXJjZU1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdFx0fTtcblxuXHRcdGNvbmZpZy5wbHVnaW5zLnB1c2goIG5ldyBVZ2xpZnlKc1BsdWdpbiggdWdsaWZ5T3B0aW9ucyApICk7XG5cdH1cblxuXHRjb25zdCBjb21waWxlciA9IHdlYnBhY2soIGNvbmZpZyApO1xuXG5cdGlmICggb3B0aW9ucy5nZXRJbnN0YW5jZSApIHtcblx0XHRyZXR1cm4gY29tcGlsZXI7XG5cdH1cblxuXHRjb21waWxlci5ydW4oICggZXJyb3IsIHN0YXRzICkgPT4ge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnJvciApO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCBzdGF0cyApO1xuXG5cdFx0Y29uc3QgbWVzc2FnZXMgPSBmb3JtYXRNZXNzYWdlcyggc3RhdHMgKTtcblxuXHRcdGlmICggISBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICYmICFtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgbWVzc2FnZXMuZXJyb3JzICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBvcHRpb25zLCBtZXNzYWdlcy53YXJuaW5ncyApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVdhdGNoVGFzayggb3B0aW9ucyApIHtcblx0aWYgKCBvcHRpb25zLndhdGNoVGFzayA9PT0gJ2J1aWxkLXNhc3MnICkge1xuXHRcdGxldCB3YXRjaGVyT3B0aW9ucyA9IHtcblx0XHRcdHZlcmJvc2l0eTogMVxuXHRcdH07XG5cdFx0bGV0IHdhdGNoZXIgPSBuZXcgV2F0Y2hTYXNzKCBvcHRpb25zLmlucHV0LCB3YXRjaGVyT3B0aW9ucyApO1xuXHRcdC8vIHdhdGNoZXIub24oICdpbml0JywgZnVuY3Rpb24oKSB7IGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zICkgfSk7XG5cdFx0d2F0Y2hlci5vbiggJ3VwZGF0ZScsIGZ1bmN0aW9uKCkgeyBoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucyApIH0gKTtcblx0XHR3YXRjaGVyLnJ1bigpO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MucHVzaCggd2F0Y2hlciApO1xuXHR9IGVsc2UgaWYgKCBvcHRpb25zLndhdGNoVGFzayA9PT0gJ2J1aWxkLWpzJyApIHtcblx0XHRvcHRpb25zLmdldEluc3RhbmNlID0gdHJ1ZTtcblx0XHRsZXQgY29tcGlsZXIgPSBoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMgKTtcblx0XHRsZXQgd2F0Y2hlciA9IGNvbXBpbGVyLndhdGNoKHtcblx0XHRcdGFnZ3JlZ2F0ZVRpbWVvdXQ6IDMwMFxuXHRcdH0sICggZXJyb3IsIHN0YXRzICkgPT4ge1xuXHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyb3IgKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc29sZS5sb2coIHN0YXRzICk7XG5cblx0XHRcdGNvbnN0IG1lc3NhZ2VzID0gZm9ybWF0TWVzc2FnZXMoIHN0YXRzICk7XG5cblx0XHRcdGlmICggISBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICYmICFtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgbWVzc2FnZXMuZXJyb3JzICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIG1lc3NhZ2VzLndhcm5pbmdzICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR3YXRjaGVyLmludmFsaWRhdGUoKTtcblxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzLnB1c2goIHdhdGNoZXIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApIHtcblx0bGV0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGxldCBub3RpZnlUZXh0ID0gYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNpbGVudDogdHJ1ZVxuXHR9ICk7XG5cblx0cmV0dXJuIG5vdGlmeTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvcnMgKSB7XG5cdGNvbnNvbGUuZXJyb3IoIGVycm9ycyApO1xuXG5cdGlmICggISBlcnJvcnMubGVuZ3RoICkge1xuXHRcdGVycm9ycyA9IFsgZXJyb3JzIF07XG5cdH1cblxuXHRsZXQgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0bGV0IG5vdGlmeVRleHQgPSAoIGVycm9ycy5sZW5ndGggPiAxID8gJ0Vycm9ycycgOiAnRXJyb3InICkgKyBgIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9YDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIGVycm9ycy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNvdW5kOiAnQmFzc28nXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIHdhcm5pbmdzICkge1xuXHRjb25zb2xlLndhcm4oIHdhcm5pbmdzICk7XG5cblx0aWYgKCAhIHdhcm5pbmdzLmxlbmd0aCApIHtcblx0XHR3YXJuaW5ncyA9IFsgd2FybmluZ3MgXTtcblx0fVxuXG5cdGxldCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggd2FybmluZ3MubGVuZ3RoID4gMSA/ICdXYXJuaW5ncycgOiAnV2FybmluZycgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnd2FybicsIG5vdGlmeVRleHQgKyAnOicsICc8cHJlPicgKyB3YXJuaW5ncy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9uc1xufVxuIiwiLyoqXG4gKiBUaGlzIGhhcyBiZWVuIGFkYXB0ZWQgZnJvbSBgY3JlYXRlLXJlYWN0LWFwcGAsIGF1dGhvcmVkIGJ5IEZhY2Vib29rLCBJbmMuXG4gKiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2luY3ViYXRvci9jcmVhdGUtcmVhY3QtYXBwL3RyZWUvbWFzdGVyL3BhY2thZ2VzL3JlYWN0LWRldi11dGlsc1xuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IGVycm9yTGFiZWwgPSAnU3ludGF4IGVycm9yOic7XG5jb25zdCBpc0xpa2VseUFTeW50YXhFcnJvciA9IHN0ciA9PiBzdHIuaW5jbHVkZXMoIGVycm9yTGFiZWwgKTtcblxuY29uc3QgZXhwb3J0UmVnZXggPSAvXFxzKiguKz8pXFxzKihcIik/ZXhwb3J0ICcoLis/KScgd2FzIG5vdCBmb3VuZCBpbiAnKC4rPyknLztcbmNvbnN0IHN0YWNrUmVnZXggPSAvXlxccyphdFxccygoPyF3ZWJwYWNrOikuKSo6XFxkKzpcXGQrW1xccyldKihcXG58JCkvZ207XG5jb25zdCBmaWxlQW5kTGluZVJlZ2V4ID0gL2luIChbXihdKilcXHNcXChsaW5lXFxzKFxcZCopLFxcc2NvbHVtblxccyhcXGQqKVxcKS87XG5cbmZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UoIG1lc3NhZ2UsIGlzRXJyb3IgKSB7XG5cdGxldCBsaW5lcyA9IG1lc3NhZ2Uuc3BsaXQoICdcXG4nICk7XG5cblx0aWYgKCBsaW5lcy5sZW5ndGggPiAyICYmIGxpbmVzWyAxIF0gPT09ICcnICkge1xuXHRcdGxpbmVzLnNwbGljZSggMSwgMSApOyAvLyBSZW1vdmUgZXh0cmEgbmV3bGluZS5cblx0fVxuXG5cdC8vIFJlbW92ZSBsb2FkZXIgbm90YXRpb24gZnJvbSBmaWxlbmFtZXM6XG5cdC8vICAgYC4vfi9jc3MtbG9hZGVyIS4vc3JjL0FwcC5jc3NgIH5+PiBgLi9zcmMvQXBwLmNzc2Bcblx0aWYgKCBsaW5lc1swXS5sYXN0SW5kZXhPZiggJyEnICkgIT09IC0xICkge1xuXHRcdGxpbmVzWzBdID0gbGluZXNbMF0uc3Vic3RyKCBsaW5lc1sgMCBdLmxhc3RJbmRleE9mKCAnIScgKSArIDEgKTtcblx0fVxuXG5cdC8vIFJlbW92ZSB1c2VsZXNzIGBlbnRyeWAgZmlsZW5hbWUgc3RhY2sgZGV0YWlsc1xuXHRsaW5lcyA9IGxpbmVzLmZpbHRlciggbGluZSA9PiBsaW5lLmluZGV4T2YoICcgQCAnICkgIT09IDAgKTtcblxuXHQvLyAwIH4+IGZpbGVuYW1lOyAxIH4+IG1haW4gZXJyIG1zZ1xuXHRpZiAoICEgbGluZXNbMF0gfHwgISBsaW5lc1sxXSApIHtcblx0XHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCB2ZXJib3NlIFwibW9kdWxlIG5vdCBmb3VuZFwiIG1lc3NhZ2VzIGZvciBmaWxlcyBhbmQgcGFja2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBub3QgZm91bmQ6ICcgKSApIHtcblx0XHRsaW5lcyA9IFtcblx0XHRcdGxpbmVzWzBdLFxuXHRcdFx0bGluZXNbMV0gLy8gXCJNb2R1bGUgbm90IGZvdW5kOiBcIiBpcyBlbm91Z2ggZGV0YWlsXG5cdFx0XHRcdC5yZXBsYWNlKCBcIkNhbm5vdCByZXNvbHZlICdmaWxlJyBvciAnZGlyZWN0b3J5JyBcIiwgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ0Nhbm5vdCByZXNvbHZlIG1vZHVsZSAnLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnRXJyb3I6ICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdbQ2FzZVNlbnNpdGl2ZVBhdGhzUGx1Z2luXSAnLCAnJyApXG5cdFx0XTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCBzeW50YXggZXJyb3IgbWVzc2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBidWlsZCBmYWlsZWQ6ICcgKSApIHtcblx0XHRsaW5lc1sxXSA9IGxpbmVzWzFdLnJlcGxhY2UoICdNb2R1bGUgYnVpbGQgZmFpbGVkOiBTeW50YXhFcnJvcjonLCBlcnJvckxhYmVsICk7XG5cdH1cblxuXHRpZiAoIGxpbmVzWzFdLm1hdGNoKCBleHBvcnRSZWdleCApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggZXhwb3J0UmVnZXgsIFwiJDEgJyQ0JyBkb2VzIG5vdCBjb250YWluIGFuIGV4cG9ydCBuYW1lZCAnJDMnLlwiICk7XG5cdH1cblxuXHQvLyBSZWFzc2VtYmxlICYgU3RyaXAgaW50ZXJuYWwgdHJhY2luZywgZXhjZXB0IGB3ZWJwYWNrOmAgLS0gKGNyZWF0ZS1yZWFjdC1hcHAvcHVsbC8xMDUwKVxuXHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKS5yZXBsYWNlKCBzdGFja1JlZ2V4LCAnJyApLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU3RkZXJyKCBkYXRhICkge1xuXHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggIXRyaW1tZWQubGVuZ3RoICkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0cmltbWVkID09PSAnRGV0YWlsczonICkge1xuXHRcdFx0c3RhcnRDYXB0dXJlID0gdHJ1ZTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggc3RhcnRDYXB0dXJlICkge1xuXHRcdFx0bGV0IGVyckFyciA9IHRyaW1tZWQuc3BsaXQoIC86XFxzKC4rKS8gKTtcblx0XHRcdGVyck9ialsgZXJyQXJyWyAwIF0gXSA9IGVyckFyclsgMSBdO1xuXG5cdFx0XHRpZiAoIGVyckFyclsgMCBdID09PSAnZm9ybWF0dGVkJyApIHtcblx0XHRcdFx0c3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGlmICggT2JqZWN0LmtleXMoIGVyck9iaiApLmxlbmd0aCApIHtcblx0XHRjb25zb2xlLmVycm9yKCBlcnJPYmogKTtcblxuXHRcdGdldEVyckxpbmVzKCBlcnJPYmouZmlsZSwgZXJyT2JqLmxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0aXRsZSA9IGVyck9iai5mb3JtYXR0ZWQucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0JyBvbiBsaW5lICcgKyBlcnJPYmoubGluZSArXG5cdFx0XHRcdCc8L2NvZGU+JztcblxuXHRcdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdFx0fSApO1xuXHR9XG5cblx0Ly8gcmV0dXJuIGVyck9iajtcbn1cblxuZnVuY3Rpb24gZ2V0RXJyTGluZXMoIGZpbGVuYW1lLCBsaW5lLCBjYWxsYmFjayApIHtcblx0bGluZSA9IE1hdGgubWF4KCBwYXJzZUludCggbGluZSwgMTAgKSAtIDEgfHwgMCwgMCApO1xuXG5cdGZzLnJlYWRGaWxlKCBmaWxlbmFtZSwgZnVuY3Rpb24gKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZyggJ3V0Zi04JyApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0aWYgKCArbGluZSA+IGxpbmVzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgbGluZUFyciA9IFtdO1xuXHRcdGxldCBfbGluZUFyciA9IFtdO1xuXHRcdGxldCBtaW5MaW5lID0gTWF0aC5tYXgoIGxpbmUgLSAyLCAwICk7XG5cdFx0bGV0IG1heExpbmUgPSBNYXRoLm1pbiggbGluZSArIDIsIGxpbmVzLmxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSBtaW5MaW5lOyBpIDw9IG1heExpbmU7IGkrKyApIHtcblx0XHRcdF9saW5lQXJyWyBpIF0gPSBsaW5lc1sgaSBdO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleHRyYW5lb3VzIGluZGVudGF0aW9uLlxuXHRcdGxldCBzdHJpcHBlZExpbmVzID0gc3RyaXBJbmRlbnQoIF9saW5lQXJyLmpvaW4oICdcXG4nICkgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdGZvciAoIHZhciBqID0gbWluTGluZTsgaiA8PSBtYXhMaW5lOyBqKysgKSB7XG5cdFx0XHRsaW5lQXJyLnB1c2goXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwibGluZScgKyAoIGxpbmUgPT09IGogPyAnIGhpZ2hsaWdodCcgOiAnJyApICsgJ1wiPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLWNvbnRlbnRcIj4nICsgc3RyaXBwZWRMaW5lc1sgaiBdICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2soIG51bGwsIGxpbmVBcnIuam9pbiggJ1xcbicgKSApO1xuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtZXNzYWdlICkge1xuXHRsZXQgZmlsZUFuZExpbmUgPSBtZXNzYWdlLm1hdGNoKCBmaWxlQW5kTGluZVJlZ2V4ICk7XG5cblx0aWYgKCAhIGZpbGVBbmRMaW5lICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBmaWxlID0gZmlsZUFuZExpbmVbIDEgXTtcblx0bGV0IGxpbmUgPSBmaWxlQW5kTGluZVsgMiBdO1xuXG5cdGNvbnNvbGUubG9nKCBmaWxlQW5kTGluZSApO1xuXG5cdGdldEVyckxpbmVzKCBmaWxlLCBsaW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCB0aXRsZSA9IG1lc3NhZ2UucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdCc8Y29kZT4nICtcblx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBmaWxlICkgKSArXG5cdFx0XHQnIG9uIGxpbmUgJyArIGxpbmUgK1xuXHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCB0aXRsZSwgZGV0YWlscyApO1xuXHR9ICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHN0YXRzICkge1xuXHRjb25zdCBqc29uID0gc3RhdHMudG9Kc29uKCB7fSwgdHJ1ZSApO1xuXG5cdGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtc2cgKSApO1xuXG5cdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRlcnJvcnM6IGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGZvcm1hdE1lc3NhZ2UoIG1zZywgdHJ1ZSApICksXG5cdFx0d2FybmluZ3M6IGpzb24ud2FybmluZ3MubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCBmYWxzZSApIClcblx0fTtcblxuXHQvLyBPbmx5IHNob3cgc3ludGF4IGVycm9ycyBpZiB3ZSBoYXZlIHRoZW1cblx0aWYgKCByZXN1bHQuZXJyb3JzLnNvbWUoIGlzTGlrZWx5QVN5bnRheEVycm9yICkgKSB7XG5cdFx0cmVzdWx0LmVycm9ycyA9IHJlc3VsdC5lcnJvcnMuZmlsdGVyKCBpc0xpa2VseUFTeW50YXhFcnJvciApO1xuXHR9XG5cblx0Ly8gRmlyc3QgZXJyb3IgaXMgdXN1YWxseSBpdDsgb3RoZXJzIHVzdWFsbHkgdGhlIHNhbWVcblx0aWYgKCByZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDEgKSB7XG5cdFx0cmVzdWx0LmVycm9ycy5sZW5ndGggPSAxO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlO1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBjb21wb25lbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcblxuY29uc3QgU2lkZWJhciA9IHJlcXVpcmUoJy4vU2lkZWJhcicpO1xuXG5jb25zdCBMb2dzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Mb2dzJyk7XG5cbmNvbnN0IFNldHRpbmdzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9TZXR0aW5ncycpO1xuXG5jb25zdCBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvUHJvamVjdHMnKTtcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy52aWV3cyA9IHtcblx0XHRcdGZpbGVzOiAnRmlsZXMnLFxuXHRcdFx0bG9nczogJ0xvZ3MnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXHR9XG5cblx0cmVuZGVyT3ZlcmxheSgpIHtcblx0XHRnbG9iYWwudWkub3ZlcmxheSggdGhpcy5wcm9wcy52aWV3ICE9PSAnZmlsZXMnICk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2ZpbGVzJyApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGNvbnRlbnQ7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnbG9ncycgKSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8TG9ncyAvPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8U2V0dGluZ3MgLz47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxPdmVybGF5IGhhc0Nsb3NlPXsgZmFsc2UgfT5cblx0XHRcdFx0XHR7IGNvbnRlbnQgfVxuXHRcdFx0XHQ8L092ZXJsYXk+XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nYXBwJz5cblx0XHRcdFx0PFNpZGViYXIgaXRlbXM9eyB0aGlzLnZpZXdzIH0gLz5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50LXdyYXAnPlxuXHRcdFx0XHRcdDxQcm9qZWN0cyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyT3ZlcmxheSgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHZpZXc6IHN0YXRlLnZpZXcsXG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0c1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIEFwcCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGVtcHR5IHNjcmVlbi9ubyBjb250ZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcHJvcHMgKSB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyAnbm8tY29udGVudCcgKyAoIHByb3BzLmNsYXNzTmFtZSA/ICcgJyArIHByb3BzLmNsYXNzTmFtZSA6ICcnICkgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYW4gb3ZlcmxheS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHQvLyBjb25zdHJ1Y3RvcigpIHt9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdvdmVybGF5Jz5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmhhc0Nsb3NlICYmXG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgaWQ9J2Nsb3NlLW92ZXJsYXknPiZ0aW1lczs8L2E+XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQ8ZGl2IGlkPSdvdmVybGF5LWNvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTtcbiIsIi8qKlxuICogQGZpbGUgQXBwIHNpZGViYXIuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNoYW5nZVZpZXcgfSA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jbGFzcyBTaWRlYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGxldCB2aWV3ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnZpZXc7XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVZpZXcoIHZpZXcgKTtcblx0fVxuXG5cdHJlbmRlckl0ZW1zKCkge1xuXHRcdGxldCBpdGVtcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGlkIGluIHRoaXMucHJvcHMuaXRlbXMgKSB7XG5cdFx0XHRpdGVtcy5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS12aWV3PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdGlwPXsgdGhpcy5wcm9wcy5pdGVtc1sgaWQgXSB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy5hY3RpdmUgPT09IGlkID8gJ2FjdGl2ZScgOiAnJyB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bmF2IGlkPSdzaWRlYmFyJz5cblx0XHRcdFx0PHVsIGlkPSdtZW51Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVySXRlbXMoKSB9XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L25hdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmU6IHN0YXRlLnZpZXdcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0Y2hhbmdlVmlldzogdmlldyA9PiBkaXNwYXRjaCggY2hhbmdlVmlldyggdmlldyApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFNpZGViYXIgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB3cmFwcGluZyBhIGZpZWxkLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuZnVuY3Rpb24gRmllbGQoIHByb3BzICkge1xuXHRsZXQgY2xhc3NOYW1lID0gJ2ZpZWxkIGZpZWxkLScgKyBwcm9wcy50eXBlICsgJyBsYWJlbC0nICsgKCBwcm9wcy5sYWJlbFBvcyA/IHByb3BzLmxhYmVsUG9zIDogJ3RvcCcgKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0+XG5cdFx0XHR7IHByb3BzLmxhYmVsICYmXG5cdFx0XHRcdDxzdHJvbmcgY2xhc3NOYW1lPSdmaWVsZC1sYWJlbCc+eyBwcm9wcy5sYWJlbCB9PC9zdHJvbmc+XG5cdFx0XHR9XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQtY29udCc+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBzYXZlIGZpbGUgZmllbGQuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2F2ZUZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnByb3BzLnZhbHVlICYmIHRoaXMucHJvcHMuc291cmNlRmlsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucHJvcHMuc291cmNlRmlsZS5wYXRoO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCB0aGlzLnByb3BzLnZhbHVlICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCBzYXZlUGF0aCApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NhdmUtZmlsZScgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2hpZGRlbidcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8c21hbGwgb25DbGljaz17IHRoaXMub25DbGljayB9PnsgdGhpcy5wcm9wcy52YWx1ZSB9PC9zbWFsbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSksXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNhdmVGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5wcm9wcy52YWx1ZSBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggdGhpcy5wcm9wcy5uYW1lLCAhIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbiBlbXB0eSc+XG5cdFx0XHRcdFx0PGgzPk5vIGxvZ3MgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+R28gZm9ydGggYW5kIGNvbXBpbGUhPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUsIHJlZnJlc2hBY3RpdmVQcm9qZWN0IH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdENvbmZpZyB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXRpbHMnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVQcm9qZWN0ID0gdGhpcy50b2dnbGVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHRnbG9iYWwudWkudW5mb2N1cyggISB0aGlzLnN0YXRlLmlzT3BlbiApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGlzT3BlbjogISB0aGlzLnN0YXRlLmlzT3BlbiB9KTtcblx0fVxuXG5cdHRvZ2dsZVByb2plY3QoKSB7XG5cdFx0bGV0IHBhdXNlZCA9ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkIHx8IGZhbHNlO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0U3RhdGUoeyBwYXVzZWQ6IHBhdXNlZCB9KTtcblxuXHRcdHRoaXMucHJvcHMucmVmcmVzaEFjdGl2ZVByb2plY3Qoe1xuXHRcdFx0Li4udGhpcy5wcm9wcy5hY3RpdmUsXG5cdFx0XHRwYXVzZWQ6IHBhdXNlZFxuXHRcdH0pO1xuXG5cdFx0c2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHBhdXNlZCApO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5wcm9wcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldFByb2plY3RTdGF0ZTogc3RhdGUgPT4gZGlzcGF0Y2goIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSApLFxuXHRyZWZyZXNoQWN0aXZlUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggcmVmcmVzaEFjdGl2ZVByb2plY3QoIHByb2plY3QgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCcuLi91aS9Ob3RpY2UnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL1BhbmVsJyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnYnVpbGRyLXByb2plY3QuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaW5pdFByb2plY3QgPSB0aGlzLmluaXRQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3QgPSB0aGlzLmNoYW5nZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVtb3ZlUHJvamVjdCA9IHRoaXMucmVtb3ZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZWZyZXNoUHJvamVjdCA9IHRoaXMucmVmcmVzaFByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuY2hhbmdlUHJvamVjdFBhdGggPSB0aGlzLmNoYW5nZVByb2plY3RQYXRoLmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0bGV0IG5ld1Byb2plY3RJbmRleCA9IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIFtcblx0XHRcdFx0Li4udGhpcy5wcm9wcy5wcm9qZWN0cyxcblx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XSApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbmV3UHJvamVjdEluZGV4LCBuZXdQcm9qZWN0ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQsIHByb2plY3QgPSBudWxsICkge1xuXHRcdGlmICggaWQgPT09IHRoaXMucHJvcHMuYWN0aXZlLmlkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmICggcHJvamVjdCApIHtcblx0XHRcdGFjdGl2ZSA9IHByb2plY3Q7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy5wcm9qZWN0c1tpZF0gKSB7XG5cdFx0XHRhY3RpdmUgPSB0aGlzLnByb3BzLnByb2plY3RzW2lkXTtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpZCApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRpZFxuXHRcdH0pO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoKSB7XG5cdFx0bGV0IHJlbW92ZUluZGV4ID0gcGFyc2VJbnQoIHRoaXMucHJvcHMuYWN0aXZlLmlkLCAxMCApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFJlbW92ZSBwcm9qZWN0IGZyb20gY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCggcmVtb3ZlSW5kZXggKTtcblxuXHRcdC8vIFVuc2V0IGFjdGl2ZSBwcm9qZWN0LlxuXHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbnVsbCApO1xuXHR9XG5cblx0Ly8gQ29uZmlybSBwcm9qZWN0IHJlbW92YWwgd2hlbiBjbGlja2luZyByZW1vdmUgYnV0dG9uLlxuXHRyZW1vdmVQcm9qZWN0QnV0dG9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNvbmZpcm1SZW1vdmUgPSB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJHt0aGlzLnByb3BzLmFjdGl2ZS5uYW1lfT9gICk7XG5cblx0XHRpZiAoIGNvbmZpcm1SZW1vdmUgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZVByb2plY3QoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgYWN0aXZlIHByb2plY3QncyBwYXRoLlxuXHRjaGFuZ2VQcm9qZWN0UGF0aCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZygge1xuXHRcdFx0cHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5J11cblx0XHR9ICk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzO1xuXHRcdFx0bGV0IHByb2plY3RJbmRleCA9IHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0SW5kZXggPT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IG5vdCBmb3VuZC5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0c1sgcHJvamVjdEluZGV4IF0ucGF0aCA9IHBhdGhbMF07XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHRcdC8vIFNldCBuZXcgcHJvamVjdCBhcyBhY3RpdmUuXG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIHByb2plY3RJbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVmcmVzaCB0aGUgcHJvamVjdCBmaWxlcy5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG9yIGZldGNoIHRoZSBwcm9qZWN0IGNvbmZpZyBmaWxlLlxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUuXG5cdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICd3YXJuaW5nJyxcblx0XHRcdFx0XHRcdHRpdGxlOiAnUHJvamVjdCBkaXJlY3RvcnkgbWlzc2luZycsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LiBJdCBtYXkgaGF2ZSBiZWVuIG1vdmVkIG9yIHJlbmFtZWQuYCxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFsgJ0NoYW5nZSBEaXJlY3RvcnknLCAnUmVtb3ZlIFByb2plY3QnIF1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZGlhbG9nLnNob3dNZXNzYWdlQm94KCBvcHRpb25zLCBmdW5jdGlvbiggaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGluZGV4ID09PSAwICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gMSApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVQcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBObyBwcm9qZWN0IHBhdGggcHJvdmlkZWQuXG5cdFx0XHRcdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBudWxsO1xuXG5cdFx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIHt9ICkgKTtcblxuXHRcdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5IGlzIHJlYWRhYmxlLCBnZXQgZmlsZXMgYW5kIHNldHVwIGNvbmZpZy5cblx0XHRcdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKTtcblxuXHRcdFx0XHQvLyBDaGFuZ2UgcHJvY2VzcyBjd2QuXG5cdFx0XHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uIH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMz5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+V291bGQgeW91IGxpa2UgdG8gYWRkIG9uZSBub3c/PC9wPlxuXHRcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPSdsYXJnZSBmbGF0IGFkZC1uZXctcHJvamVjdCcgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PkFkZCBQcm9qZWN0PC9idXR0b24+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdCBzZWxlY3RlZCwgc2hvdyBzZWxlY3Rvci5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdwcm9qZWN0LXNlbGVjdC1zY3JlZW4nPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3RzJz5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlck5vdGljZXMoKSB9XG5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdGZpbGVzPXsgdGhpcy5wcm9wcy5maWxlcyB9XG5cdFx0XHRcdFx0XHRsb2FkaW5nPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8UGFuZWwgLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGFkZFByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIGFkZFByb2plY3QoIHByb2plY3QgKSApLFxuXHRjaGFuZ2VQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggY2hhbmdlUHJvamVjdCggaWQgKSApLFxuXHRyZW1vdmVQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggcmVtb3ZlUHJvamVjdCggaWQgKSApLFxuXHRzZXRBY3RpdmVGaWxlOiBmaWxlID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBmaWxlICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMz5TZXR0aW5nczwvaDM+XG5cdFx0XHRcdDxwPkNvbWluZyBzb29uITwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZUxpc3RGaWxlID0gcmVxdWlyZSgnLi9GaWxlTGlzdEZpbGUnKTtcblxuY29uc3QgRmlsZUxpc3REaXJlY3RvcnkgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RGlyZWN0b3J5Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jb25zdCB7IHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSAmJiB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudCA9PT0gZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdGZpbGVQcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJywgJ2hhcy1vcHRpb25zJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoXG5cdFx0XHR0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0PHA+TG9hZGluZyZoZWxsaXA7PC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vIHByb2plY3QgZm9sZGVyIHNlbGVjdGVkLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5Ob3RoaW5nIHRvIHNlZSBoZXJlLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IGZpbGVsaXN0IH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZVxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRBY3RpdmVGaWxlOiBwYXlsb2FkID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBwYXlsb2FkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggRmlsZUxpc3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCB7IHJlbW90ZSwgc2hlbGwgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmNvbnN0IHsgTWVudSwgTWVudUl0ZW0gfSA9IHJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSh7XG5cdFx0XHRmaWxlOiB0aGlzLnByb3BzLmZpbGUsXG5cdFx0XHRlbGVtZW50OiBldmVudC5jdXJyZW50VGFyZ2V0XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmhhbmRsZUNvbXBpbGVDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSggeyBsb2FkaW5nOiBmYWxzZSB9ICk7XG5cdFx0fS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR0aGlzLmhhbmRsZUNvbXBpbGVDYWxsYmFjayA9IG51bGw7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMgKSB7XG5cdFx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2xvYmFsLmNvbXBpbGVyLmdldEZpbGVPcHRpb25zKCBuZXh0UHJvcHMuZmlsZSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IGNvbXBpbGVPcHRpb25zLnR5cGUsXG5cdFx0XHRmaWxlVHlwZTogY29tcGlsZU9wdGlvbnMuZmlsZVR5cGUsXG5cdFx0XHRidWlsZFRhc2tOYW1lOiBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lLFxuXHRcdFx0b3B0aW9uczogRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5iYXNlLCBuZXh0UHJvcHMuZmlsZSApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRPcHRpb25zRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRsZXQgY2ZpbGUgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApO1xuXG5cdFx0cmV0dXJuICggY2ZpbGUgJiYgY2ZpbGUub3B0aW9ucyApID8gY2ZpbGUub3B0aW9ucyA6IHt9O1xuXHR9XG5cblx0c3RhdGljIGdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGlmICggZmlsZSAmJiBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBiYXNlLCBmaWxlLnBhdGggKSApO1xuXG5cdFx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0XHRsZXQgY2ZpbGUgPSBmaWxlcy5maW5kKCBjZmlsZSA9PiBjZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0XHRpZiAoIGNmaWxlICkge1xuXHRcdFx0XHRyZXR1cm4gY2ZpbGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBudWxsICkgPyBzdG9yZWQgOiBkZWZhdWx0cztcblxuXHRcdGlmICggcHJvcGVydHkgKSB7XG5cdFx0XHRyZXR1cm4gKCBjb25maWdbIHByb3BlcnR5IF0gKSA/IGNvbmZpZ1sgcHJvcGVydHkgXSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9XG5cdH1cblxuXHRzZXRDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBwcm9wZXJ0eSApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGxldCBmaWxlQ29uZmlnID0ge1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0dHlwZTogdGhpcy5zdGF0ZS5maWxlVHlwZSxcblx0XHRcdFx0b3V0cHV0OiBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKSApXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgKSB7XG5cdFx0XHRcdGZpbGVDb25maWdbIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGZpbGVzLnB1c2goIGZpbGVDb25maWcgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRkZWxldGUgZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zICYmIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c2V0T3B0aW9uKCBvcHRpb24sIHZhbHVlICkge1xuXHRcdGxldCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zIHx8IHt9O1xuXHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCBvcHRpb25zICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgb3B0aW9uczogb3B0aW9ucyB9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggbmFtZSwgdmFsdWUgKSB7XG5cdFx0aWYgKCBuYW1lID09PSAnb3V0cHV0JyApIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgdmFsdWUgKTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSggdGhpcy5zdGF0ZSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldE9wdGlvbiggbmFtZSwgdmFsdWUgKTtcblx0XHR9XG5cdH1cblxuXHRkZWZhdWx0T3V0cHV0UGF0aCgpIHtcblx0XHRyZXR1cm4gZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgdGhpcy5vdXRwdXRTdWZmaXgsIHRoaXMub3V0cHV0RXh0ZW5zaW9uICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0dGhpcy5oYW5kbGVDb21waWxlQ2FsbGJhY2tcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVySGVhZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJGb290ZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmb290ZXInPlxuXHRcdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPSdjb21waWxlIGdyZWVuJ1xuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLmhhbmRsZUNvbXBpbGUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5sb2FkaW5nID8gJ0NvbXBpbGluZy4uLicgOiAnQ29tcGlsZScgfVxuXHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9ucztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU2NyaXB0IGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmpzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnSmF2YVNjcmlwdCcsIGV4dGVuc2lvbnM6IFsgJ2pzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0c291cmNlTWFwc0Rpc2FibGVkKCkge1xuXHRcdHJldHVybiAoICEgdGhpcy5zdGF0ZS5vcHRpb25zIHx8ICggISB0aGlzLnN0YXRlLm9wdGlvbnMuYnVuZGxlICYmICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJhYmVsICkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zY3JpcHQnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHR7LyogPEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdidW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdidW5kbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPiAqL31cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0ndWdsaWZ5J1xuXHRcdFx0XHRcdFx0bGFiZWw9J1VnbGlmeSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAndWdsaWZ5JywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc291cmNlTWFwc0Rpc2FibGVkKCkgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSw8YnIgLz4gaXQgY2Fubm90IGJlIGNvbXBpbGVkIG9uIGl0cyBvd24uPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUudHlwZSA9PT0gJ3Nhc3MnICYmXG5cdFx0XHRcdFx0XHQ8RmllbGRTZWxlY3Rcblx0XHRcdFx0XHRcdFx0bmFtZT0nc3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgU3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJywgJ25lc3RlZCcgKSB9XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM9eyB7XG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkOiAnTmVzdGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wYWN0OiAnQ29tcGFjdCcsXG5cdFx0XHRcdFx0XHRcdFx0ZXhwYW5kZWQ6ICdFeHBhbmRlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcHJlc3NlZDogJ0NvbXByZXNzZWQnXG5cdFx0XHRcdFx0XHRcdH0gfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9wcmVmaXhlcicsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTdHlsZXM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igc2hvd2luZyBub3RpY2VzIGFuZCBhbGVydHMuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBOb3RpY2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHR5cGUgPSB0aGlzLnByb3BzLnR5cGUgfHwgJ2luZm8nO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vdGljZSB0eXBlLScgKyB0eXBlIH0+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWNlO1xuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHZpZXcgPSAoIGN1cnJlbnQgPSAnZmlsZXMnLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9WSUVXJzpcblx0XHRcdHJldHVybiBhY3Rpb24udmlldztcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdH1cbn07XG5cbmNvbnN0IHsgcHJvamVjdHMsIGFjdGl2ZVByb2plY3QsIGFjdGl2ZVByb2plY3RGaWxlcyB9ID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5jb25zdCBhY3RpdmVGaWxlID0gKCBmaWxlID0gbnVsbCwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdTRVRfQUNUSVZFX0ZJTEUnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmlsZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHZpZXcsXG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXMsXG5cdGFjdGl2ZUZpbGVcbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBQcm9qZWN0cyByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHByb2plY3RzID0gKCBwcm9qZWN0cyA9IFtdLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0FERF9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdC4uLnByb2plY3RzLFxuXHRcdFx0XHRhY3Rpb24ucGF5bG9hZFxuXHRcdFx0XTtcblx0XHRjYXNlICdSRU1PVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMuZmlsdGVyKCAoIHByb2plY3QsIGluZGV4ICkgPT4gaW5kZXggIT09IGFjdGlvbi5pZCApO1xuXHRcdGNhc2UgJ1JFRlJFU0hfQUNUSVZFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIHByb2plY3RzLm1hcCggZnVuY3Rpb24oIHByb2plY3QsIGluZGV4ICkge1xuXHRcdFx0XHRpZiAoIGluZGV4ID09PSBwYXJzZUludCggYWN0aW9uLnBheWxvYWQuaWQsIDEwICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBwcm9qZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHByb2plY3RzO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0ID0gKCBhY3RpdmUgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0Y2FzZSAnU0VUX1BST0pFQ1RfU1RBVEUnOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uYWN0aXZlLFxuXHRcdFx0XHQuLi5hY3Rpb24ucGF5bG9hZFxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGFjdGl2ZTtcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdEZpbGVzID0gKCBmaWxlcyA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1JFQ0VJVkVfRklMRVMnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmlsZXM7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIExvZ2dlciB1dGlsaXR5LlxuICovXG5cbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5jbGFzcyBMb2dnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmxvZ3MgPSBbXTtcblx0fVxuXG5cdGxvZyggdHlwZSwgdGl0bGUsIGJvZHkgPSAnJyApIHtcblx0XHR0aGlzLmxvZ3MucHVzaCh7XG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0Ym9keTogYm9keSxcblx0XHRcdHRpbWU6IG1vbWVudCgpLmZvcm1hdCgnSEg6bW06c3MuU1NTJylcblx0XHR9KTtcblx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvbG9ncycpICk7XG5cdH1cblxuXHRnZXQoIHR5cGUgPSBudWxsLCBvcmRlciA9ICdkZXNjJyApIHtcblx0XHRsZXQgbG9ncztcblxuXHRcdGlmICggISB0eXBlICkge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncy5maWx0ZXIoIGxvZyA9PiB7IHJldHVybiBsb2cudHlwZSA9PT0gdHlwZSB9ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcmRlciA9PT0gJ2Rlc2MnICkge1xuXHRcdFx0bG9ncyA9IGxvZ3Muc2xpY2UoKS5yZXZlcnNlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxvZ3M7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XG4iLCIvKipcbiAqIEBmaWxlIFdhbGsgYSBkaXJlY3RvcnkgYW5kIHJldHVybiBhbiBvYmplY3Qgb2YgZmlsZXMgYW5kIHN1YmZvbGRlcnMuXG4gKi9cblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwoIHJlcXVpcmUoJ2ZzJykgKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBkaXJlY3RvcnlUcmVlKCBwYXRoLCBvcHRpb25zID0ge30sIGRlcHRoID0gMCApIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICkge1xuXHRcdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0XHRpZiAoIG9wdGlvbnMuZGVwdGggJiYgZGVwdGggPiBvcHRpb25zLmRlcHRoICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5hbWUgPSBmc3BhdGguYmFzZW5hbWUoIHBhdGggKTtcblx0XHRjb25zdCBpdGVtID0geyBwYXRoLCBuYW1lIH07XG5cblx0XHRsZXQgc3RhdHM7XG5cblx0XHR0cnkge1xuXHRcdFx0c3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKTtcblx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdC8vIFNraXAgaWYgaXQgbWF0Y2hlcyB0aGUgZXhjbHVkZSByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGF0cy5pc0ZpbGUoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblxuXHRcdFx0Y29uc3QgZXh0ID0gZnNwYXRoLmV4dG5hbWUoIHBhdGggKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXG5cdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0fSBlbHNlIGlmICggc3RhdHMuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0XHRmcy5yZWFkZGlyKCBwYXRoLCBmdW5jdGlvbiggZXJyLCBmaWxlcyApIHtcblx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIuY29kZSA9PT0gJ0VBQ0NFUycgKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gW107XG5cblx0XHRcdFx0UHJvbWlzZS5tYXAoIGZpbGVzLCBmdW5jdGlvbiggZmlsZSApIHtcblx0XHRcdFx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggZnNwYXRoLmpvaW4oIHBhdGgsIGZpbGUgKSwgb3B0aW9ucywgZGVwdGggKyAxICk7XG5cdFx0XHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBjaGlsZHJlbiApIHtcblx0XHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKCAoZSkgPT4gISFlICk7XG5cdFx0XHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0XHQvLyBcdGNvbnNvbGUubG9nKCBwcmV2LCBjdXIuc2l6ZSApO1xuXHRcdFx0Ly8gXHRyZXR1cm4gcHJldiArIGN1ci5zaXplO1xuXHRcdFx0Ly8gfSwgMCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7IC8vIE9yIHNldCBpdGVtLnNpemUgPSAwIGZvciBkZXZpY2VzLCBGSUZPIGFuZCBzb2NrZXRzID9cblx0XHR9XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yeVRyZWU7XG4iLCIvKipcbiAqIEBmaWxlIEdsb2JhbCBoZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgYXBwJ3MgVUkuXG4gKi9cblxuZnVuY3Rpb24gdW5mb2N1cyggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAndW5mb2N1cycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBsb2FkaW5nKCB0b2dnbGUgPSB0cnVlLCBhcmdzID0ge30gKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ2xvYWRpbmcnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gb3ZlcmxheSggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnb3ZlcmxheScsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCB0cmlnZ2VyRXZlbnQgPSBudWxsLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXG5cdFx0XHRcdGlmICggdHJpZ2dlckV2ZW50ICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIHRyaWdnZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVtb3ZlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG5cdH1cblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dW5mb2N1cyxcblx0bG9hZGluZyxcblx0b3ZlcmxheSxcblx0cmVtb3ZlRm9jdXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBmdW5jdGlvbnMgZm9yIHJlc29sdmluZywgdHJhbnNmb3JtaW5nLCBnZW5lcmF0aW5nIGFuZCBmb3JtYXR0aW5nIHBhdGhzLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvc2xhc2hcbmZ1bmN0aW9uIHNsYXNoKCBpbnB1dCApIHtcblx0Y29uc3QgaXNFeHRlbmRlZExlbmd0aFBhdGggPSAvXlxcXFxcXFxcXFw/XFxcXC8udGVzdChpbnB1dCk7XG5cdGNvbnN0IGhhc05vbkFzY2lpID0gL1teXFx1MDAwMC1cXHUwMDgwXSsvLnRlc3QoaW5wdXQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnRyb2wtcmVnZXhcblxuXHRpZiAoaXNFeHRlbmRlZExlbmd0aFBhdGggfHwgaGFzTm9uQXNjaWkpIHtcblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG5mdW5jdGlvbiBmaWxlT3V0cHV0UGF0aCggZmlsZSwgc3VmZml4ID0gJycsIGV4dGVuc2lvbiA9IGZpbGUuZXh0ZW5zaW9uICkge1xuXHRsZXQgYmFzZWRpciA9IHBhdGgucGFyc2UoIGZpbGUucGF0aCApLmRpcjtcblx0bGV0IGZpbGVuYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoL1xcLlteLy5dKyQvLCAnJykgKyBzdWZmaXggKyBleHRlbnNpb247XG5cblx0cmV0dXJuIHBhdGguam9pbiggYmFzZWRpciwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZmlsZVJlbGF0aXZlUGF0aCggZnJvbSwgdG8gKSB7XG5cdHJldHVybiBwYXRoLnJlbGF0aXZlKCBmcm9tLCB0byApO1xufVxuXG5mdW5jdGlvbiBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuICggcGF0aC5pc0Fic29sdXRlKCBmaWxlbmFtZSApICkgPyBmaWxlbmFtZSA6IHBhdGguam9pbiggYmFzZSwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZGlyQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuIHBhdGgucGFyc2UoIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkgKS5kaXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGFzaCxcblx0ZmlsZU91dHB1dFBhdGgsXG5cdGZpbGVSZWxhdGl2ZVBhdGgsXG5cdGZpbGVBYnNvbHV0ZVBhdGgsXG5cdGRpckFic29sdXRlUGF0aFxufTtcbiIsIi8qKlxuICogQGZpbGUgQ29sbGVjdGlvbiBvZiBoZWxwZXIgZnVuY3Rpb25zLlxuICovXG5cbmZ1bmN0aW9uIHNsZWVwKG1pbGxpc2Vjb25kcykge1xuXHR2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0Zm9yICggdmFyIGkgPSAwOyBpIDwgMWU3OyBpKysgKSB7XG5cdFx0aWYgKCAoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQgKSA+IG1pbGxpc2Vjb25kcyApIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdGxldCBzdGF0ZSA9IHtcblx0XHR2aWV3OiAnZmlsZXMnLFxuXHRcdHByb2plY3RzOiBbXSxcblx0XHRhY3RpdmVQcm9qZWN0OiAwLFxuXHRcdGFjdGl2ZVByb2plY3RGaWxlczoge30sXG5cdFx0YWN0aXZlRmlsZTogbnVsbFxuXHR9O1xuXG5cdGlmICggZ2xvYmFsLmNvbmZpZy5oYXMoICdwcm9qZWN0cycgKSApIHtcblx0XHRzdGF0ZS5wcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCAncHJvamVjdHMnICk7XG5cdH1cblxuXHRpZiAoIHN0YXRlLnByb2plY3RzLmxlbmd0aCAmJiBnbG9iYWwuY29uZmlnLmhhcyggJ2FjdGl2ZS1wcm9qZWN0JyApICkge1xuXHRcdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCAnYWN0aXZlLXByb2plY3QnICk7XG5cblx0XHRpZiAoIHN0YXRlLnByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0c3RhdGUuYWN0aXZlUHJvamVjdCA9IHN0YXRlLnByb2plY3RzWyBhY3RpdmVJbmRleCBdO1xuXHRcdFx0c3RhdGUuYWN0aXZlUHJvamVjdC5pZCA9IGFjdGl2ZUluZGV4O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRsZXQgcHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdHByb2plY3RzWyBhY3RpdmVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWcuJyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUgKSB7XG5cdGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcblxuXHRmb3IgKCB2YXIgZGVwZW5kZW5jeSBpbiBkZXBlbmRlbmN5VHJlZSApIHtcblx0XHRkZXBlbmRlbmNpZXMucHVzaCggZGVwZW5kZW5jeSApO1xuXG5cdFx0aWYgKCBPYmplY3Qua2V5cyggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMuY29uY2F0KCBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKSApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkZXBlbmRlbmNpZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGVlcCxcblx0Z2V0SW5pdGlhbFN0YXRlLFxuXHRzZXRQcm9qZWN0Q29uZmlnLFxuXHRnZXREZXBlbmRlbmN5QXJyYXlcbn07XG4iXX0=
