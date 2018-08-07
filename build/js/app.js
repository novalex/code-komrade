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

		global.logger.log('info', 'Stopped watching ' + filename + '.');

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
		global.logger.log('info', 'Watching ' + inputFilename + '...');

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

	postcss([precss, autoprefixer]).process(css, postCssOptions).then(function (postCssResult) {
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
		optimization: {
			nodeEnv: 'development'
		},
		devtool: options.sourcemaps ? 'inline-source-map' : false
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

	if (options.compress) {
		var UglifyJsPluginOptions = {
			parallel: true,
			sourceMap: options.sourcemaps,
			uglifyOptions: {
				compress: true,
				minify: function minify(file, sourceMap) {
					var uglifyJsOptions = {};

					if (sourceMap) {
						uglifyJsOptions.sourceMap = {
							content: sourceMap
						};
					}

					return require('uglify-js').minify(file, uglifyJsOptions);
				}
			}
		};

		config.optimization.minimizer = [new UglifyJsPlugin(UglifyJsPluginOptions)];
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
		});

		// watcher.invalidate();

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

},{"../utils/pathHelpers":30,"./messages":4,"autoprefixer":undefined,"babel-plugin-transform-object-rest-spread":undefined,"babel-preset-env":undefined,"electron":undefined,"fs":undefined,"node-sass":undefined,"node-sass-watcher":undefined,"path":undefined,"postcss":undefined,"precss":undefined,"uglify-js":undefined,"uglifyjs-webpack-plugin":undefined,"webpack":undefined}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9hcHAuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBpbGVyL21lc3NhZ2VzLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9QYW5lbC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1NldHRpbmdzLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsIkU6L0FwcHMvQnVpbGRyL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiRTovQXBwcy9CdWlsZHIvYXBwL2pzL3V0aWxzL2RpcmVjdG9yeVRyZWUuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvZ2xvYmFsVUkuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCJFOi9BcHBzL0J1aWxkci9hcHAvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBSUE7O0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFFBQU87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QUE0QyxNQUE1QyxHQUFxRCxDQUExRCxFQUE4RDtBQUM3RCxrQkFBZSxhQUFhLE1BQWIsQ0FBcUIsbUJBQW9CLGVBQWdCLFVBQWhCLENBQXBCLENBQXJCLENBQWY7QUFDQTtBQUNEOztBQUVELFFBQU8sWUFBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQixpQ0FGZ0I7QUFHaEIsbUNBSGdCO0FBSWhCO0FBSmdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9qZWN0KCBpZCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVNT1ZFX1BST0pFQ1QnLFxuXHRcdGlkXG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9QUk9KRUNUX1NUQVRFJyxcblx0XHRwYXlsb2FkOiBzdGF0ZVxuXHR9O1xufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0QWN0aXZlRmlsZSggZmlsZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX0FDVElWRV9GSUxFJyxcblx0XHRwYXlsb2FkOiBmaWxlXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjaGFuZ2VWaWV3LFxuXHRhZGRQcm9qZWN0LFxuXHRjaGFuZ2VQcm9qZWN0LFxuXHRyZW1vdmVQcm9qZWN0LFxuXHRzZXRQcm9qZWN0U3RhdGUsXG5cdHJlY2VpdmVGaWxlcyxcblx0c2V0QWN0aXZlRmlsZSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Rcbn07XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vY29tcGlsZXIvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHsgZ2V0SW5pdGlhbFN0YXRlIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5jb25zdCBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIsIGluaXRpYWxTdGF0ZSApO1xuXG5nbG9iYWwuc3RvcmUgPSBzdG9yZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCAnZWxlY3Ryb24nICkucmVtb3RlO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcbi8vIGNvbnN0IGRlcGVuZGVuY3lUcmVlID0gcmVxdWlyZSggJ2RlcGVuZGVuY3ktdHJlZScgKTtcblxuY29uc3Qgc2FzcyA9IHJlcXVpcmUoICdub2RlLXNhc3MnICk7XG5jb25zdCBXYXRjaFNhc3MgPSByZXF1aXJlKCAnbm9kZS1zYXNzLXdhdGNoZXInICk7XG5jb25zdCBhdXRvcHJlZml4ZXIgPSByZXF1aXJlKCAnYXV0b3ByZWZpeGVyJyApO1xuY29uc3QgcHJlY3NzID0gcmVxdWlyZSggJ3ByZWNzcycgKTtcbmNvbnN0IHBvc3Rjc3MgPSByZXF1aXJlKCAncG9zdGNzcycgKTtcbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCAnd2VicGFjaycgKTtcbmNvbnN0IFVnbGlmeUpzUGx1Z2luID0gcmVxdWlyZSggJ3VnbGlmeWpzLXdlYnBhY2stcGx1Z2luJyApO1xuY29uc3QgZm9ybWF0TWVzc2FnZXMgPSByZXF1aXJlKCAnLi9tZXNzYWdlcycgKTtcblxuY29uc3QgeyBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCAnLi4vdXRpbHMvcGF0aEhlbHBlcnMnICk7XG4vLyBjb25zdCB7IGdldERlcGVuZGVuY3lBcnJheSB9ID0gcmVxdWlyZSggJy4uL3V0aWxzL3V0aWxzJyApO1xuXG5mdW5jdGlvbiBraWxsVGFza3MoKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID09PSAwICkge1xuXHRcdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgdGFza3MgPSBnbG9iYWwuY29tcGlsZXJUYXNrcztcblxuXHRmb3IgKCBsZXQgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkrKyApIHtcblx0XHRsZXQgdGFzayA9IHRhc2tzWyBpIF07XG5cdFx0bGV0IGZpbGVuYW1lO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGFzay5fZXZlbnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFzay5fZXZlbnRzLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggdGFzay5pbnB1dFBhdGggKTtcblx0XHRcdC8vIENsb3NlIGNob2tpZGFyIHdhdGNoIHByb2Nlc3Nlcy5cblx0XHRcdHRhc2suaW5wdXRQYXRoV2F0Y2hlci5jbG9zZSgpO1xuXHRcdFx0dGFzay5yb290RGlyV2F0Y2hlci5jbG9zZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIHRhc2suY29tcGlsZXIub3B0aW9ucy5lbnRyeSApO1xuXHRcdFx0Ly8gQ2xvc2Ugd2VicGFjayB3YXRjaCBwcm9jZXNzLlxuXHRcdFx0dGFzay5jbG9zZSgpO1xuXHRcdH1cblxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnaW5mbycsIGBTdG9wcGVkIHdhdGNoaW5nICR7ZmlsZW5hbWV9LmAgKTtcblxuXHRcdHRhc2tzLnNwbGljZSggaSwgMSApO1xuXHR9XG5cblx0Z2xvYmFsLmNvbXBpbGVyVGFza3MgPSB0YXNrcztcblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaW5pdFByb2plY3QoKSB7XG5cdGtpbGxUYXNrcygpO1xuXG5cdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgcHJvamVjdEZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXG5cdGxldCBwcm9qZWN0UGF0aCA9IHBhdGgucGFyc2UoIGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGggKS5kaXI7XG5cblx0Zm9yICggdmFyIGZpbGVDb25maWcgb2YgcHJvamVjdEZpbGVzICkge1xuXHRcdHByb2Nlc3NGaWxlKCBwcm9qZWN0UGF0aCwgZmlsZUNvbmZpZyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NGaWxlKCBiYXNlLCBmaWxlQ29uZmlnLCB0YXNrTmFtZSA9IG51bGwsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG9wdGlvbnMgPSBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICk7XG5cblx0aWYgKCAhIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCB0YXNrTmFtZSApIHtcblx0XHRydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRpZiAoIG9wdGlvbnMud2F0Y2hUYXNrICkge1xuXHRcdFx0b3B0aW9ucy5nZXRJbXBvcnRzID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRydW5UYXNrKCAnd2F0Y2gnLCBvcHRpb25zICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU9wdGlvbnMoIGZpbGUgKSB7XG5cdGxldCBvcHRpb25zID0ge307XG5cblx0c3dpdGNoICggZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnY3NzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5zYXNzJzpcblx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnc2Fzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnbGVzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuanMnOlxuXHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2pzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc2NyaXB0Jztcblx0fVxuXG5cdG9wdGlvbnMuYnVpbGRUYXNrTmFtZSA9ICdidWlsZC0nICsgb3B0aW9ucy50eXBlO1xuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICkge1xuXHRpZiAoICEgZmlsZUNvbmZpZy5wYXRoIHx8ICEgZmlsZUNvbmZpZy5vdXRwdXQgKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0bGV0IGZpbGVQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5wYXRoICk7XG5cdGxldCBvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5vdXRwdXQgKTtcblx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2V0RmlsZU9wdGlvbnMoeyBleHRlbnNpb246IHBhdGguZXh0bmFtZSggZmlsZVBhdGggKSB9KTtcblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0aW5wdXQ6IGZpbGVQYXRoLFxuXHRcdGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKCBvdXRwdXRQYXRoICksXG5cdFx0b3V0cHV0OiBwYXRoLnBhcnNlKCBvdXRwdXRQYXRoICkuZGlyLFxuXHRcdHByb2plY3RCYXNlOiBiYXNlXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRjb25zb2xlLmxvZygn4oCLcnVuVGFzayAtPiBvcHRpb25zJywgb3B0aW9ucyk7XG5cblx0Ly8gR2V0IGltcG9ydGVkIGZpbGVzLlxuXHQvLyBsZXQgd2F0Y2hGaWxlcyA9IGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUoe1xuXHQvLyBcdGZpbGVuYW1lOiBvcHRpb25zLmlucHV0LFxuXHQvLyBcdGRpcmVjdG9yeTogb3B0aW9ucy5wcm9qZWN0QmFzZVxuXHQvLyB9KSk7XG5cblx0bGV0IGlucHV0RmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0aWYgKCB0YXNrTmFtZSA9PT0gJ3dhdGNoJyApIHtcblx0XHQvLyBXYXRjaCB0YXNrIHN0YXJ0aW5nLlxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnaW5mbycsIGBXYXRjaGluZyAke2lucHV0RmlsZW5hbWV9Li4uYCApO1xuXG5cdFx0aGFuZGxlV2F0Y2hUYXNrKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEJ1aWxkIHRhc2sgc3RhcnRpbmcuXG5cdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2lucHV0RmlsZW5hbWV9Li4uYCApO1xuXG5cdFx0c3dpdGNoICggdGFza05hbWUgKSB7XG5cdFx0XHRjYXNlICdidWlsZC1zYXNzJzpcblx0XHRcdFx0aGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYnVpbGQtY3NzJzpcblx0XHRcdFx0aGFuZGxlQ3NzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdidWlsZC1qcyc6XG5cdFx0XHRcdGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBgVW5oYW5kbGVkIHRhc2s6ICR7dGFza05hbWV9YCApO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0b3B0aW9ucy5vdXRGaWxlID0gcGF0aC5yZXNvbHZlKCBvcHRpb25zLm91dHB1dCwgb3B0aW9ucy5maWxlbmFtZSApO1xuXG5cdHNhc3MucmVuZGVyKCB7XG5cdFx0ZmlsZTogb3B0aW9ucy5pbnB1dCxcblx0XHRvdXRGaWxlOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0b3V0cHV0U3R5bGU6IG9wdGlvbnMuc3R5bGUsXG5cdFx0c291cmNlTWFwOiBvcHRpb25zLnNvdXJjZW1hcHMsXG5cdFx0c291cmNlTWFwRW1iZWQ6IG9wdGlvbnMuc291cmNlbWFwc1xuXHR9LCBmdW5jdGlvbiggZXJyb3IsIHJlc3VsdCApIHtcblx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cblx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggb3B0aW9ucy5hdXRvcHJlZml4ZXIgKSB7XG5cdFx0XHRcdGxldCBwb3N0Q3NzT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRmcm9tOiBvcHRpb25zLmlucHV0LFxuXHRcdFx0XHRcdHRvOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0XHRcdFx0bWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0XHRcdFx0fTtcblx0XHRcdFx0aGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIHJlc3VsdC5jc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gZXJyb3JzIGR1cmluZyB0aGUgY29tcGlsYXRpb24sIHdyaXRlIHRoaXMgcmVzdWx0IG9uIHRoZSBkaXNrXG5cdFx0XHRcdGZzLndyaXRlRmlsZSggb3B0aW9ucy5vdXRGaWxlLCByZXN1bHQuY3NzLCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ3NzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRvcHRpb25zLm91dEZpbGUgPSBwYXRoLnJlc29sdmUoIG9wdGlvbnMub3V0cHV0LCBvcHRpb25zICk7XG5cblx0bGV0IHBvc3RDc3NPcHRpb25zID0ge1xuXHRcdGZyb206IG9wdGlvbnMuaW5wdXQsXG5cdFx0dG86IG9wdGlvbnMub3V0RmlsZSxcblx0XHRtYXA6IG9wdGlvbnMuc291cmNlbWFwc1xuXHR9O1xuXG5cdGZzLnJlYWRGaWxlKCBvcHRpb25zLmlucHV0LCAoIGVycm9yLCBjc3MgKSA9PiB7XG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRwb3N0Y3NzKCBbIHByZWNzcywgYXV0b3ByZWZpeGVyIF0gKVxuXHRcdC5wcm9jZXNzKCBjc3MsIHBvc3RDc3NPcHRpb25zIClcblx0XHQudGhlbiggcG9zdENzc1Jlc3VsdCA9PiB7XG5cdFx0XHQvLyBObyBlcnJvcnMgZHVyaW5nIHRoZSBjb21waWxhdGlvbiwgd3JpdGUgdGhpcyByZXN1bHQgb24gdGhlIGRpc2tcblx0XHRcdGZzLndyaXRlRmlsZSggb3B0aW9ucy5vdXRGaWxlLCBwb3N0Q3NzUmVzdWx0LmNzcywgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgbW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdub2RlX21vZHVsZXMnICk7XG5cdGlmICggISBtb2R1bGVzUGF0aC5tYXRjaCggJ2FwcCcgKSApIHtcblx0XHRtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ2FwcC9ub2RlX21vZHVsZXMnICk7XG5cdH1cblxuXHRsZXQgY29uZmlnID0ge1xuXHRcdG1vZGU6ICdub25lJyxcblx0XHRlbnRyeTogb3B0aW9ucy5pbnB1dCxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0b3V0cHV0OiB7XG5cdFx0XHRwYXRoOiBvcHRpb25zLm91dHB1dCxcblx0XHRcdGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lXG5cdFx0fSxcblx0XHRtb2R1bGU6IHtcblx0XHRcdHJ1bGVzOiBbIHtcblx0XHRcdFx0dGVzdDogL1xcLmpzJC8sXG5cdFx0XHRcdGV4Y2x1ZGU6IC8obm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMpL1xuXHRcdFx0fSBdXG5cdFx0fSxcblx0XHRyZXNvbHZlTG9hZGVyOiB7XG5cdFx0XHRtb2R1bGVzOiBbIG1vZHVsZXNQYXRoIF1cblx0XHR9LFxuXHRcdG9wdGltaXphdGlvbjoge1xuXHRcdFx0bm9kZUVudjogJ2RldmVsb3BtZW50J1xuXHRcdH0sXG5cdFx0ZGV2dG9vbDogKCBvcHRpb25zLnNvdXJjZW1hcHMgKSA/ICdpbmxpbmUtc291cmNlLW1hcCcgOiBmYWxzZSxcblx0fTtcblxuXHRpZiAoIG9wdGlvbnMuYmFiZWwgKSB7XG5cdFx0Y29uZmlnLm1vZHVsZS5ydWxlc1sgMCBdLnVzZSA9IHtcblx0XHRcdGxvYWRlcjogJ2JhYmVsLWxvYWRlcicsXG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHByZXNldHM6IFsgcmVxdWlyZSggJ2JhYmVsLXByZXNldC1lbnYnICkgXSxcblx0XHRcdFx0cGx1Z2luczogWyByZXF1aXJlKCAnYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1vYmplY3QtcmVzdC1zcHJlYWQnICkgXVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRpZiAoIG9wdGlvbnMuY29tcHJlc3MgKSB7XG5cdFx0bGV0IFVnbGlmeUpzUGx1Z2luT3B0aW9ucyA9IHtcblx0XHRcdHBhcmFsbGVsOiB0cnVlLFxuXHRcdFx0c291cmNlTWFwOiBvcHRpb25zLnNvdXJjZW1hcHMsXG5cdFx0XHR1Z2xpZnlPcHRpb25zOiB7XG5cdFx0XHRcdGNvbXByZXNzOiB0cnVlLFxuXHRcdFx0XHRtaW5pZnkoIGZpbGUsIHNvdXJjZU1hcCApIHtcblx0XHRcdFx0XHRjb25zdCB1Z2xpZnlKc09wdGlvbnMgPSB7fTtcblxuXHRcdFx0XHRcdGlmICggc291cmNlTWFwICkge1xuXHRcdFx0XHRcdFx0dWdsaWZ5SnNPcHRpb25zLnNvdXJjZU1hcCA9IHtcblx0XHRcdFx0XHRcdFx0Y29udGVudDogc291cmNlTWFwXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiByZXF1aXJlKCAndWdsaWZ5LWpzJyApLm1pbmlmeSggZmlsZSwgdWdsaWZ5SnNPcHRpb25zICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uZmlnLm9wdGltaXphdGlvbi5taW5pbWl6ZXIgPSBbXG5cdFx0XHRuZXcgVWdsaWZ5SnNQbHVnaW4oIFVnbGlmeUpzUGx1Z2luT3B0aW9ucyApXG5cdFx0XTtcblx0fVxuXG5cdGNvbnN0IGNvbXBpbGVyID0gd2VicGFjayggY29uZmlnICk7XG5cblx0aWYgKCBvcHRpb25zLmdldEluc3RhbmNlICkge1xuXHRcdHJldHVybiBjb21waWxlcjtcblx0fVxuXG5cdGNvbXBpbGVyLnJ1biggKCBlcnJvciwgc3RhdHMgKSA9PiB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVycm9yICk7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coIHN0YXRzICk7XG5cblx0XHRjb25zdCBtZXNzYWdlcyA9IGZvcm1hdE1lc3NhZ2VzKCBzdGF0cyApO1xuXG5cdFx0aWYgKCAhIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggJiYgIW1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdH1cblxuXHRcdGlmICggbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBtZXNzYWdlcy5lcnJvcnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIHdhcm5pbmcocykuXG5cdFx0XHRoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIG1lc3NhZ2VzLndhcm5pbmdzICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlV2F0Y2hUYXNrKCBvcHRpb25zICkge1xuXHRpZiAoIG9wdGlvbnMud2F0Y2hUYXNrID09PSAnYnVpbGQtc2FzcycgKSB7XG5cdFx0bGV0IHdhdGNoZXJPcHRpb25zID0ge1xuXHRcdFx0dmVyYm9zaXR5OiAxXG5cdFx0fTtcblx0XHRsZXQgd2F0Y2hlciA9IG5ldyBXYXRjaFNhc3MoIG9wdGlvbnMuaW5wdXQsIHdhdGNoZXJPcHRpb25zICk7XG5cdFx0Ly8gd2F0Y2hlci5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHsgaGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMgKSB9KTtcblx0XHR3YXRjaGVyLm9uKCAndXBkYXRlJywgZnVuY3Rpb24oKSB7IGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zICkgfSApO1xuXHRcdHdhdGNoZXIucnVuKCk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCB3YXRjaGVyICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMud2F0Y2hUYXNrID09PSAnYnVpbGQtanMnICkge1xuXHRcdG9wdGlvbnMuZ2V0SW5zdGFuY2UgPSB0cnVlO1xuXHRcdGxldCBjb21waWxlciA9IGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucyApO1xuXHRcdGxldCB3YXRjaGVyID0gY29tcGlsZXIud2F0Y2goe1xuXHRcdFx0YWdncmVnYXRlVGltZW91dDogMzAwXG5cdFx0fSwgKCBlcnJvciwgc3RhdHMgKSA9PiB7XG5cdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnJvciApO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zb2xlLmxvZyggc3RhdHMgKTtcblx0XHR9KTtcblxuXHRcdC8vIHdhdGNoZXIuaW52YWxpZGF0ZSgpO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MucHVzaCggd2F0Y2hlciApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICkge1xuXHRsZXQgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0bGV0IG5vdGlmeVRleHQgPSBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdzdWNjZXNzJywgbm90aWZ5VGV4dCApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c2lsZW50OiB0cnVlXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9ycyApIHtcblx0Y29uc29sZS5lcnJvciggZXJyb3JzICk7XG5cblx0aWYgKCAhIGVycm9ycy5sZW5ndGggKSB7XG5cdFx0ZXJyb3JzID0gWyBlcnJvcnMgXTtcblx0fVxuXG5cdGxldCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggZXJyb3JzLmxlbmd0aCA+IDEgPyAnRXJyb3JzJyA6ICdFcnJvcicgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCBub3RpZnlUZXh0ICsgJzonLCAnPHByZT4nICsgZXJyb3JzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c291bmQ6ICdCYXNzbydcblx0fSApO1xuXG5cdHJldHVybiBub3RpZnk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggb3B0aW9ucywgd2FybmluZ3MgKSB7XG5cdGNvbnNvbGUud2Fybiggd2FybmluZ3MgKTtcblxuXHRpZiAoICEgd2FybmluZ3MubGVuZ3RoICkge1xuXHRcdHdhcm5pbmdzID0gWyB3YXJuaW5ncyBdO1xuXHR9XG5cblx0bGV0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGxldCBub3RpZnlUZXh0ID0gKCB3YXJuaW5ncy5sZW5ndGggPiAxID8gJ1dhcm5pbmdzJyA6ICdXYXJuaW5nJyApICsgYCB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfWA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICd3YXJuJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIHdhcm5pbmdzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdFByb2plY3QsXG5cdHJ1blRhc2ssXG5cdGtpbGxUYXNrcyxcblx0cHJvY2Vzc0ZpbGUsXG5cdGdldEZpbGVDb25maWcsXG5cdGdldEZpbGVPcHRpb25zXG59XG4iLCIvKipcbiAqIFRoaXMgaGFzIGJlZW4gYWRhcHRlZCBmcm9tIGBjcmVhdGUtcmVhY3QtYXBwYCwgYXV0aG9yZWQgYnkgRmFjZWJvb2ssIEluYy5cbiAqIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29raW5jdWJhdG9yL2NyZWF0ZS1yZWFjdC1hcHAvdHJlZS9tYXN0ZXIvcGFja2FnZXMvcmVhY3QtZGV2LXV0aWxzXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgZXJyb3JMYWJlbCA9ICdTeW50YXggZXJyb3I6JztcbmNvbnN0IGlzTGlrZWx5QVN5bnRheEVycm9yID0gc3RyID0+IHN0ci5pbmNsdWRlcyggZXJyb3JMYWJlbCApO1xuXG5jb25zdCBleHBvcnRSZWdleCA9IC9cXHMqKC4rPylcXHMqKFwiKT9leHBvcnQgJyguKz8pJyB3YXMgbm90IGZvdW5kIGluICcoLis/KScvO1xuY29uc3Qgc3RhY2tSZWdleCA9IC9eXFxzKmF0XFxzKCg/IXdlYnBhY2s6KS4pKjpcXGQrOlxcZCtbXFxzKV0qKFxcbnwkKS9nbTtcbmNvbnN0IGZpbGVBbmRMaW5lUmVnZXggPSAvaW4gKFteKF0qKVxcc1xcKGxpbmVcXHMoXFxkKiksXFxzY29sdW1uXFxzKFxcZCopXFwpLztcblxuZnVuY3Rpb24gZm9ybWF0TWVzc2FnZSggbWVzc2FnZSwgaXNFcnJvciApIHtcblx0bGV0IGxpbmVzID0gbWVzc2FnZS5zcGxpdCggJ1xcbicgKTtcblxuXHRpZiAoIGxpbmVzLmxlbmd0aCA+IDIgJiYgbGluZXNbIDEgXSA9PT0gJycgKSB7XG5cdFx0bGluZXMuc3BsaWNlKCAxLCAxICk7IC8vIFJlbW92ZSBleHRyYSBuZXdsaW5lLlxuXHR9XG5cblx0Ly8gUmVtb3ZlIGxvYWRlciBub3RhdGlvbiBmcm9tIGZpbGVuYW1lczpcblx0Ly8gICBgLi9+L2Nzcy1sb2FkZXIhLi9zcmMvQXBwLmNzc2Agfn4+IGAuL3NyYy9BcHAuY3NzYFxuXHRpZiAoIGxpbmVzWzBdLmxhc3RJbmRleE9mKCAnIScgKSAhPT0gLTEgKSB7XG5cdFx0bGluZXNbMF0gPSBsaW5lc1swXS5zdWJzdHIoIGxpbmVzWyAwIF0ubGFzdEluZGV4T2YoICchJyApICsgMSApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHVzZWxlc3MgYGVudHJ5YCBmaWxlbmFtZSBzdGFjayBkZXRhaWxzXG5cdGxpbmVzID0gbGluZXMuZmlsdGVyKCBsaW5lID0+IGxpbmUuaW5kZXhPZiggJyBAICcgKSAhPT0gMCApO1xuXG5cdC8vIDAgfj4gZmlsZW5hbWU7IDEgfj4gbWFpbiBlcnIgbXNnXG5cdGlmICggISBsaW5lc1swXSB8fCAhIGxpbmVzWzFdICkge1xuXHRcdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHZlcmJvc2UgXCJtb2R1bGUgbm90IGZvdW5kXCIgbWVzc2FnZXMgZm9yIGZpbGVzIGFuZCBwYWNrYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIG5vdCBmb3VuZDogJyApICkge1xuXHRcdGxpbmVzID0gW1xuXHRcdFx0bGluZXNbMF0sXG5cdFx0XHRsaW5lc1sxXSAvLyBcIk1vZHVsZSBub3QgZm91bmQ6IFwiIGlzIGVub3VnaCBkZXRhaWxcblx0XHRcdFx0LnJlcGxhY2UoIFwiQ2Fubm90IHJlc29sdmUgJ2ZpbGUnIG9yICdkaXJlY3RvcnknIFwiLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnQ2Fubm90IHJlc29sdmUgbW9kdWxlICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdFcnJvcjogJywgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ1tDYXNlU2Vuc2l0aXZlUGF0aHNQbHVnaW5dICcsICcnIClcblx0XHRdO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHN5bnRheCBlcnJvciBtZXNzYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIGJ1aWxkIGZhaWxlZDogJyApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggJ01vZHVsZSBidWlsZCBmYWlsZWQ6IFN5bnRheEVycm9yOicsIGVycm9yTGFiZWwgKTtcblx0fVxuXG5cdGlmICggbGluZXNbMV0ubWF0Y2goIGV4cG9ydFJlZ2V4ICkgKSB7XG5cdFx0bGluZXNbMV0gPSBsaW5lc1sxXS5yZXBsYWNlKCBleHBvcnRSZWdleCwgXCIkMSAnJDQnIGRvZXMgbm90IGNvbnRhaW4gYW4gZXhwb3J0IG5hbWVkICckMycuXCIgKTtcblx0fVxuXG5cdC8vIFJlYXNzZW1ibGUgJiBTdHJpcCBpbnRlcm5hbCB0cmFjaW5nLCBleGNlcHQgYHdlYnBhY2s6YCAtLSAoY3JlYXRlLXJlYWN0LWFwcC9wdWxsLzEwNTApXG5cdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApLnJlcGxhY2UoIHN0YWNrUmVnZXgsICcnICkudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGNvbnNvbGUubG9nKCBkYXRhICk7XG5cblx0bGV0IGVyck9iaiA9IHt9O1xuXHRsZXQgc3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cblx0dmFyIGxpbmVzID0gZGF0YS5zcGxpdCggLyhcXHJcXG58W1xcblxcdlxcZlxcclxceDg1XFx1MjAyOFxcdTIwMjldKS8gKTtcblxuXHRmb3IgKCB2YXIgbGluZSBvZiBsaW5lcyApIHtcblx0XHRsZXQgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuXG5cdFx0aWYgKCAhdHJpbW1lZC5sZW5ndGggKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRyaW1tZWQgPT09ICdEZXRhaWxzOicgKSB7XG5cdFx0XHRzdGFydENhcHR1cmUgPSB0cnVlO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGFydENhcHR1cmUgKSB7XG5cdFx0XHRsZXQgZXJyQXJyID0gdHJpbW1lZC5zcGxpdCggLzpcXHMoLispLyApO1xuXHRcdFx0ZXJyT2JqWyBlcnJBcnJbIDAgXSBdID0gZXJyQXJyWyAxIF07XG5cblx0XHRcdGlmICggZXJyQXJyWyAwIF0gPT09ICdmb3JtYXR0ZWQnICkge1xuXHRcdFx0XHRzdGFydENhcHR1cmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0aWYgKCBPYmplY3Qua2V5cyggZXJyT2JqICkubGVuZ3RoICkge1xuXHRcdGNvbnNvbGUuZXJyb3IoIGVyck9iaiApO1xuXG5cdFx0Z2V0RXJyTGluZXMoIGVyck9iai5maWxlLCBlcnJPYmoubGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHRpdGxlID0gZXJyT2JqLmZvcm1hdHRlZC5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0XHQnPGNvZGU+JyArXG5cdFx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBlcnJPYmouZmlsZSApICkgK1xuXHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9ICk7XG5cdH1cblxuXHQvLyByZXR1cm4gZXJyT2JqO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJMaW5lcyggZmlsZW5hbWUsIGxpbmUsIGNhbGxiYWNrICkge1xuXHRsaW5lID0gTWF0aC5tYXgoIHBhcnNlSW50KCBsaW5lLCAxMCApIC0gMSB8fCAwLCAwICk7XG5cblx0ZnMucmVhZEZpbGUoIGZpbGVuYW1lLCBmdW5jdGlvbiAoIGVyciwgZGF0YSApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cblx0XHR2YXIgbGluZXMgPSBkYXRhLnRvU3RyaW5nKCAndXRmLTgnICkuc3BsaXQoICdcXG4nICk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbiggJ1xcbicgKSApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0Zm9yICggdmFyIGogPSBtaW5MaW5lOyBqIDw9IG1heExpbmU7IGorKyApIHtcblx0XHRcdGxpbmVBcnIucHVzaChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJsaW5lJyArICggbGluZSA9PT0gaiA/ICcgaGlnaGxpZ2h0JyA6ICcnICkgKyAnXCI+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtbnVtYmVyXCI+JyArICggaiArIDEgKSArICc8L3NwYW4+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCAnXFxuJyApICk7XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1lc3NhZ2UgKSB7XG5cdGxldCBmaWxlQW5kTGluZSA9IG1lc3NhZ2UubWF0Y2goIGZpbGVBbmRMaW5lUmVnZXggKTtcblxuXHRpZiAoICEgZmlsZUFuZExpbmUgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGZpbGUgPSBmaWxlQW5kTGluZVsgMSBdO1xuXHRsZXQgbGluZSA9IGZpbGVBbmRMaW5lWyAyIF07XG5cblx0Y29uc29sZS5sb2coIGZpbGVBbmRMaW5lICk7XG5cblx0Z2V0RXJyTGluZXMoIGZpbGUsIGxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHRpdGxlID0gbWVzc2FnZS5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGZpbGUgKSApICtcblx0XHRcdCcgb24gbGluZSAnICsgbGluZSArXG5cdFx0XHQnPC9jb2RlPic7XG5cblx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdH0gKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggc3RhdHMgKSB7XG5cdGNvbnN0IGpzb24gPSBzdGF0cy50b0pzb24oIHt9LCB0cnVlICk7XG5cblx0anNvbi5lcnJvcnMubWFwKCBtc2cgPT4gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1zZyApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdGVycm9yczoganNvbi5lcnJvcnMubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCB0cnVlICkgKSxcblx0XHR3YXJuaW5nczoganNvbi53YXJuaW5ncy5tYXAoIG1zZyA9PiBmb3JtYXRNZXNzYWdlKCBtc2csIGZhbHNlICkgKVxuXHR9O1xuXG5cdC8vIE9ubHkgc2hvdyBzeW50YXggZXJyb3JzIGlmIHdlIGhhdmUgdGhlbVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMuc29tZSggaXNMaWtlbHlBU3ludGF4RXJyb3IgKSApIHtcblx0XHRyZXN1bHQuZXJyb3JzID0gcmVzdWx0LmVycm9ycy5maWx0ZXIoIGlzTGlrZWx5QVN5bnRheEVycm9yICk7XG5cdH1cblxuXHQvLyBGaXJzdCBlcnJvciBpcyB1c3VhbGx5IGl0OyBvdGhlcnMgdXN1YWxseSB0aGUgc2FtZVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMSApIHtcblx0XHRyZXN1bHQuZXJyb3JzLmxlbmd0aCA9IDE7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0TWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2U7XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIGNvbXBvbmVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL1NldHRpbmdzJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHRsb2dzOiAnTG9ncycsXG5cdFx0XHRzZXR0aW5nczogJ1NldHRpbmdzJ1xuXHRcdH07XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGdsb2JhbC51aS5vdmVybGF5KCB0aGlzLnByb3BzLnZpZXcgIT09ICdmaWxlcycgKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgY29udGVudDtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdsb2dzJyApIHtcblx0XHRcdFx0Y29udGVudCA9IDxMb2dzIC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGVudCA9IDxTZXR0aW5ncyAvPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50JyArICggcHJvcHMuY2xhc3NOYW1lID8gJyAnICsgcHJvcHMuY2xhc3NOYW1lIDogJycgKSB9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2lubmVyJz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY2hhbmdlVmlldyB9ID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZTogc3RhdGUudmlld1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRjaGFuZ2VWaWV3OiB2aWV3ID0+IGRpc3BhdGNoKCBjaGFuZ2VWaWV3KCB2aWV3ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggU2lkZWJhciApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycyApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5maWx0ZXJzID0gdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZyggZmlsZVNhdmVPcHRpb25zICk7XG5cblx0XHRpZiAoIGZpbGVuYW1lICkge1xuXHRcdFx0bGV0IHNhdmVQYXRoID0gc2xhc2goIGZpbGVuYW1lICk7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0XHRzYXZlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIGZpbGVuYW1lICkgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCB0aGlzLnByb3BzLm5hbWUsIHNhdmVQYXRoICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0naGlkZGVuJ1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0cmVhZE9ubHk9J3RydWUnXG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxzbWFsbCBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+eyB0aGlzLnByb3BzLnZhbHVlIH08L3NtYWxsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2F2ZUZpbGUucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRzb3VyY2VGaWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXHRkaWFsb2dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0ZGlhbG9nRmlsdGVyczogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLm9iamVjdCBdKSxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCB0aGlzLnByb3BzLm5hbWUsIGV2ZW50LnRhcmdldC52YWx1ZSApO1xuXHRcdH1cblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnZhbHVlID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnByb3BzLnZhbHVlIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHRvZ2dsZSBzd2l0Y2guXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFN3aXRjaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCB0aGlzLnByb3BzLm5hbWUsICEgdGhpcy5wcm9wcy52YWx1ZSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3N3aXRjaCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0Y2hlY2tlZD17IHRoaXMucHJvcHMudmFsdWUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxsYWJlbCBodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfT57IHRoaXMucHJvcHMubGFiZWwgfTwvbGFiZWw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTd2l0Y2gucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuYm9vbCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU3dpdGNoO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgbG9ncyBhbmQgaW5mb3JtYXRpb24uXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgTG9ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdGxldCB0eXBlID0gbnVsbDtcblx0XHRsZXQgbG9ncyA9ICggZ2xvYmFsLmxvZ2dlciApID8gZ2xvYmFsLmxvZ2dlci5nZXQoIHR5cGUgKSA6IFtdO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHR5cGUsXG5cdFx0XHRsb2dzXG5cdFx0fTtcblxuXHRcdHRoaXMucmVmcmVzaCA9IHRoaXMucmVmcmVzaC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9sb2dzJywgdGhpcy5yZWZyZXNoICk7XG5cdH1cblxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9sb2dzJywgdGhpcy5yZWZyZXNoICk7XG5cdH1cblxuXHRyZWZyZXNoKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2dzOiBnbG9iYWwubG9nZ2VyLmdldCggdGhpcy5zdGF0ZS50eXBlICkgfSk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRsZXQgbG9nSW5kZXggPSAwO1xuXHRcdGxldCBsb2dMaXN0ID0gW107XG5cblx0XHRmb3IgKCB2YXIgbG9nIG9mIHRoaXMuc3RhdGUubG9ncyApIHtcblx0XHRcdGxldCB0aXRsZUhUTUwgPSB7IF9faHRtbDogbG9nLnRpdGxlIH07XG5cdFx0XHRsZXQgYm9keUhUTUwgPSAoIGxvZy5ib2R5ICkgPyB7IF9faHRtbDogbG9nLmJvZHkgfSA6IG51bGw7XG5cblx0XHRcdGxvZ0xpc3QucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgbG9nSW5kZXggfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17ICd0eXBlLScgKyBsb2cudHlwZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPlxuXHRcdFx0XHRcdFx0PHNtYWxsPnsgbG9nLnRpbWUgfTwvc21hbGw+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3RpdGxlLXRleHQnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgdGl0bGVIVE1MIH0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7IGJvZHlIVE1MICYmXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZGV0YWlscycgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyBib2R5SFRNTCB9IC8+XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KTtcblx0XHRcdGxvZ0luZGV4Kys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDx1bD57IGxvZ0xpc3QgfTwvdWw+O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmxvZ3MubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2xvZ3Mtc2NyZWVuIGVtcHR5Jz5cblx0XHRcdFx0XHQ8aDM+Tm8gbG9ncyB5ZXQuPC9oMz5cblx0XHRcdFx0XHQ8cD5HbyBmb3J0aCBhbmQgY29tcGlsZSE8L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nbG9ncycgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbic+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyBwYW5lbC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGUgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Z2V0T3B0aW9ucygpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5wcm9qZWN0LnBhdGggfSBmaWxlPXsgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDb250ZW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcblxuXHRcdFx0aWYgKCBvcHRpb25zICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoYXMtb3B0aW9ucycpO1xuXG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHQ8cD5TZWxlY3QgYSBzdHlsZXNoZWV0IG9yIHNjcmlwdCBmaWxlIHRvIHZpZXcgY29tcGlsaW5nIG9wdGlvbnMuPC9wPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncGFuZWwnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ29udGVudCgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGUsXG5cdHByb2plY3Q6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBQYW5lbCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHNlbGVjdG9yLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IHNldFByb2plY3RTdGF0ZSwgcmVmcmVzaEFjdGl2ZVByb2plY3QgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0Q29uZmlnIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy91dGlscycpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVByb2plY3QgPSB0aGlzLnRvZ2dsZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdGdsb2JhbC51aS51bmZvY3VzKCAhIHRoaXMuc3RhdGUuaXNPcGVuICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgaXNPcGVuOiAhIHRoaXMuc3RhdGUuaXNPcGVuIH0pO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgfHwgZmFsc2U7XG5cblx0XHR0aGlzLnByb3BzLnNldFByb2plY3RTdGF0ZSh7IHBhdXNlZDogcGF1c2VkIH0pO1xuXG5cdFx0dGhpcy5wcm9wcy5yZWZyZXNoQWN0aXZlUHJvamVjdCh7XG5cdFx0XHQuLi50aGlzLnByb3BzLmFjdGl2ZSxcblx0XHRcdHBhdXNlZDogcGF1c2VkXG5cdFx0fSk7XG5cblx0XHRzZXRQcm9qZWN0Q29uZmlnKCAncGF1c2VkJywgcGF1c2VkICk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnByb3BzLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIHNlbGVjdCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCcgY2xhc3NOYW1lPSdzZWxlY3RlZCc+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIH08L2gxPlxuXHRcdFx0XHRcdDxoMj57IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfTwvaDI+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGlvbnMnPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT17ICd0b2dnbGUnICsgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgPyAnIHBhdXNlZCcgOiAnIGFjdGl2ZScgKSB9IG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVByb2plY3QgfSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVmcmVzaCcgb25DbGljaz17IHRoaXMucHJvcHMucmVmcmVzaFByb2plY3QgfSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVtb3ZlJyBvbkNsaWNrPXsgdGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0IH0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3Rcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0c2V0UHJvamVjdFN0YXRlOiBzdGF0ZSA9PiBkaXNwYXRjaCggc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApICksXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0OiBwcm9qZWN0ID0+IGRpc3BhdGNoKCByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFByb2plY3RTZWxlY3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgdmlldy5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgX2RlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoL2RlYm91bmNlJyk7XG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNvbnN0IE5vdGljZSA9IHJlcXVpcmUoJy4uL3VpL05vdGljZScpO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSgnLi9Qcm9qZWN0U2VsZWN0Jyk7XG5cbmNvbnN0IEZpbGVMaXN0ID0gcmVxdWlyZSgnLi9maWxlbGlzdC9GaWxlTGlzdCcpO1xuXG5jb25zdCBQYW5lbCA9IHJlcXVpcmUoJy4vUGFuZWwnKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RpcmVjdG9yeVRyZWUnKTtcblxuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvTG9nZ2VyJyk7XG5cbmNvbnN0IHsgYWRkUHJvamVjdCwgcmVtb3ZlUHJvamVjdCwgY2hhbmdlUHJvamVjdCwgcmVjZWl2ZUZpbGVzLCBzZXRBY3RpdmVGaWxlIH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlnbm9yZWQ6IFtcblx0XHRcdFx0Jy5naXQnLFxuXHRcdFx0XHQnbm9kZV9tb2R1bGVzJyxcblx0XHRcdFx0Jy5EU19TdG9yZScsXG5cdFx0XHRcdCdidWlsZHItcHJvamVjdC5qc29uJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMubmV3UHJvamVjdCA9IHRoaXMubmV3UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5pbml0UHJvamVjdCA9IHRoaXMuaW5pdFByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuY2hhbmdlUHJvamVjdCA9IHRoaXMuY2hhbmdlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZW1vdmVQcm9qZWN0ID0gdGhpcy5yZW1vdmVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlZnJlc2hQcm9qZWN0ID0gdGhpcy5yZWZyZXNoUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0UGF0aCA9IHRoaXMuY2hhbmdlUHJvamVjdFBhdGguYmluZCggdGhpcyApO1xuXG5cdFx0dGhpcy5pbml0Q29tcGlsZXIgPSB0aGlzLmluaXRDb21waWxlci5iaW5kKCB0aGlzICk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9maWxlcycsIHRoaXMucmVmcmVzaFByb2plY3QgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuaW5pdFByb2plY3QoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoIHByZXZQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGlmIChcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF0aCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCAmJlxuXHRcdFx0cHJldlByb3BzLmFjdGl2ZS5wYXVzZWQgIT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZFxuXHRcdCkge1xuXHRcdFx0Ly8gUHJvamVjdCB3YXMgcGF1c2VkL3VucGF1c2VkLCB0cmlnZ2VyIGNvbXBpbGVyIHRhc2tzIG9yIHRlcm1pbmF0ZSB0aGVtLlxuXHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgYSBuZXcgcHJvamVjdC5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHRsZXQgbmV3UHJvamVjdEluZGV4ID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGg7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3QgYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgW1xuXHRcdFx0XHQuLi50aGlzLnByb3BzLnByb2plY3RzLFxuXHRcdFx0XHRuZXdQcm9qZWN0XG5cdFx0XHRdICk7XG5cblx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdHRoaXMucHJvcHMuYWRkUHJvamVjdCggbmV3UHJvamVjdCApO1xuXG5cdFx0XHQvLyBTZXQgbmV3IHByb2plY3QgYXMgYWN0aXZlLlxuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBuZXdQcm9qZWN0SW5kZXgsIG5ld1Byb2plY3QgKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgdGhlIGFjdGl2ZSBwcm9qZWN0LlxuXHRjaGFuZ2VQcm9qZWN0KCBpZCwgcHJvamVjdCA9IG51bGwgKSB7XG5cdFx0aWYgKCBpZCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUuaWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0aWYgKCBwcm9qZWN0ICkge1xuXHRcdFx0YWN0aXZlID0gcHJvamVjdDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnByb3BzLnByb2plY3RzW2lkXSApIHtcblx0XHRcdGFjdGl2ZSA9IHRoaXMucHJvcHMucHJvamVjdHNbaWRdO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGlkICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KHtcblx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdGlkXG5cdFx0fSk7XG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cblx0XHQvLyBJbml0LlxuXHRcdHRoaXMuaW5pdFByb2plY3QoIGFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBSZW1vdmUgdGhlIGN1cnJlbnQgcHJvamVjdC5cblx0cmVtb3ZlUHJvamVjdCgpIHtcblx0XHRsZXQgcmVtb3ZlSW5kZXggPSBwYXJzZUludCggdGhpcy5wcm9wcy5hY3RpdmUuaWQsIDEwICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gUmVtb3ZlIHByb2plY3QgZnJvbSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0KCByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gVW5zZXQgYWN0aXZlIHByb2plY3QuXG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBudWxsICk7XG5cdH1cblxuXHQvLyBDb25maXJtIHByb2plY3QgcmVtb3ZhbCB3aGVuIGNsaWNraW5nIHJlbW92ZSBidXR0b24uXG5cdHJlbW92ZVByb2plY3RCdXR0b24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3RoaXMucHJvcHMuYWN0aXZlLm5hbWV9P2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdHRoaXMucmVtb3ZlUHJvamVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoYW5nZSBhY3RpdmUgcHJvamVjdCdzIHBhdGguXG5cdGNoYW5nZVByb2plY3RQYXRoKCkge1xuXHRcdGxldCBwYXRoID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nKCB7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknXVxuXHRcdH0gKTtcblxuXHRcdGlmICggcGF0aCApIHtcblx0XHRcdGxldCBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHM7XG5cdFx0XHRsZXQgcHJvamVjdEluZGV4ID0gcHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXG5cdFx0XHRpZiAoIHByb2plY3RJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3Qgbm90IGZvdW5kLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHByb2plY3RzWyBwcm9qZWN0SW5kZXggXS5wYXRoID0gcGF0aFswXTtcblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggcHJvamVjdEluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gU3RhcnQgdGhlIGJhY2tncm91bmQgY29tcGlsZXIgdGFza3MuXG5cdGluaXRDb21waWxlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmluaXRQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBSZWZyZXNoIHRoZSBwcm9qZWN0IGZpbGVzLlxuXHRyZWZyZXNoUHJvamVjdCgpIHtcblx0XHR0aGlzLmdldEZpbGVzKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBDcmVhdGUgb3IgZmV0Y2ggdGhlIHByb2plY3QgY29uZmlnIGZpbGUuXG5cdHNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdidWlsZHItcHJvamVjdCcsXG5cdFx0XHRjd2Q6IHBhdGhcblx0XHR9KTtcblxuXHRcdC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcHJvamVjdCdzIGZpbGUgb3B0aW9ucyBhbmQgdHJpZ2dlciB0aGUgY29tcGlsZXIgaW5pdC5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5vbkRpZENoYW5nZSggJ2ZpbGVzJywgX2RlYm91bmNlKCB0aGlzLmluaXRDb21waWxlciwgMTAwICkgKTtcblx0fVxuXG5cdC8vIFJlYWQgdGhlIGZpbGVzIGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeS5cblx0Z2V0RmlsZXMoIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwudWkubG9hZGluZygpO1xuXG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdGRpcmVjdG9yeVRyZWUoIHBhdGgsIHtcblx0XHRcdC8vIGRlcHRoOiAyLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGdsb2JhbC5zdG9yZS5kaXNwYXRjaCggcmVjZWl2ZUZpbGVzKCBmaWxlcyApICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Ly8gSW5pdGlhbGl6ZSBwcm9qZWN0LlxuXHRpbml0UHJvamVjdCggcGF0aCApIHtcblx0XHRmcy5hY2Nlc3MoIHBhdGgsIGZzLmNvbnN0YW50cy5XX09LLCBmdW5jdGlvbiggZXJyICkge1xuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdGlmICggcGF0aCApIHtcblx0XHRcdFx0XHQvLyBDaG9zZW4gZGlyZWN0b3J5IG5vdCByZWFkYWJsZS5cblx0XHRcdFx0XHRjb25zdCBvcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0dHlwZTogJ3dhcm5pbmcnLFxuXHRcdFx0XHRcdFx0dGl0bGU6ICdQcm9qZWN0IGRpcmVjdG9yeSBtaXNzaW5nJyxcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IGBDb3VsZCBub3QgcmVhZCB0aGUgJHtwYXRofSBkaXJlY3RvcnkuIEl0IG1heSBoYXZlIGJlZW4gbW92ZWQgb3IgcmVuYW1lZC5gLFxuXHRcdFx0XHRcdFx0YnV0dG9uczogWyAnQ2hhbmdlIERpcmVjdG9yeScsICdSZW1vdmUgUHJvamVjdCcgXVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRkaWFsb2cuc2hvd01lc3NhZ2VCb3goIG9wdGlvbnMsIGZ1bmN0aW9uKCBpbmRleCApIHtcblx0XHRcdFx0XHRcdGlmICggaW5kZXggPT09IDAgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdFBhdGgoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIGluZGV4ID09PSAxICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlbW92ZVByb2plY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIE5vIHByb2plY3QgcGF0aCBwcm92aWRlZC5cblx0XHRcdFx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG51bGw7XG5cblx0XHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcygge30gKSApO1xuXG5cdFx0XHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBEaXJlY3RvcnkgaXMgcmVhZGFibGUsIGdldCBmaWxlcyBhbmQgc2V0dXAgY29uZmlnLlxuXHRcdFx0XHR0aGlzLmdldEZpbGVzKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApO1xuXG5cdFx0XHRcdC8vIENoYW5nZSBwcm9jZXNzIGN3ZC5cblx0XHRcdFx0cHJvY2Vzcy5jaGRpciggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblxuXHRcdGdsb2JhbC5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cdH1cblxuXHRyZW5kZXJQcm9qZWN0U2VsZWN0KCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRuZXdQcm9qZWN0PXsgdGhpcy5uZXdQcm9qZWN0IH1cblx0XHRcdFx0Y2hhbmdlUHJvamVjdD17IHRoaXMuY2hhbmdlUHJvamVjdCB9XG5cdFx0XHRcdHJlbW92ZVByb2plY3Q9eyB0aGlzLnJlbW92ZVByb2plY3RCdXR0b24gfVxuXHRcdFx0XHRyZWZyZXNoUHJvamVjdD17IHRoaXMucmVmcmVzaFByb2plY3QgfVxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyTm90aWNlcygpIHtcblx0XHRsZXQgbm90aWNlcyA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgKSB7XG5cdFx0XHRub3RpY2VzLnB1c2goIChcblx0XHRcdFx0PE5vdGljZSBrZXk9J3BhdXNlZCcgdHlwZT0nd2FybmluZyc+XG5cdFx0XHRcdFx0PHA+UHJvamVjdCBpcyBwYXVzZWQuIEZpbGVzIHdpbGwgbm90IGJlIHdhdGNoZWQgYW5kIGF1dG8gY29tcGlsZWQuPC9wPlxuXHRcdFx0XHQ8L05vdGljZT5cblx0XHRcdCkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm90aWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5wcm9qZWN0cyB8fCB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdC8vIE5vIHByb2plY3RzIHlldCwgc2hvdyB3ZWxjb21lIHNjcmVlbi5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSd3ZWxjb21lLXNjcmVlbic+XG5cdFx0XHRcdFx0PGgzPllvdSBkb24ndCBoYXZlIGFueSBwcm9qZWN0cyB5ZXQuPC9oMz5cblx0XHRcdFx0XHQ8cD5Xb3VsZCB5b3UgbGlrZSB0byBhZGQgb25lIG5vdz88L3A+XG5cdFx0XHRcdFx0PGJ1dHRvbiBjbGFzc05hbWU9J2xhcmdlIGZsYXQgYWRkLW5ldy1wcm9qZWN0JyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+QWRkIFByb2plY3Q8L2J1dHRvbj5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0IHNlbGVjdGVkLCBzaG93IHNlbGVjdG9yLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3Byb2plY3Qtc2VsZWN0LXNjcmVlbic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdHMnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyTm90aWNlcygpIH1cblxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfVxuXHRcdFx0XHRcdFx0ZmlsZXM9eyB0aGlzLnByb3BzLmZpbGVzIH1cblx0XHRcdFx0XHRcdGxvYWRpbmc9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxQYW5lbCAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0YWRkUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggYWRkUHJvamVjdCggcHJvamVjdCApICksXG5cdGNoYW5nZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCBjaGFuZ2VQcm9qZWN0KCBpZCApICksXG5cdHJlbW92ZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCByZW1vdmVQcm9qZWN0KCBpZCApICksXG5cdHNldEFjdGl2ZUZpbGU6IGZpbGUgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0cyApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIHNldHRpbmdzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nc2V0dGluZ3Mtc2NyZWVuJz5cblx0XHRcdFx0PGgzPlNldHRpbmdzPC9oMz5cblx0XHRcdFx0PHA+Q29taW5nIHNvb24hPC9wPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBGaWxlTGlzdEZpbGUgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNvbnN0IHsgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBGaWxlTGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc2V0QWN0aXZlRmlsZSA9IHRoaXMuc2V0QWN0aXZlRmlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRNaW1lVHlwZSggZXh0ICkge1xuXHRcdGxldCB0eXBlO1xuXG5cdFx0c3dpdGNoICggZXh0ICkge1xuXHRcdFx0Y2FzZSAnLnN2Zyc6XG5cdFx0XHRjYXNlICcucG5nJzpcblx0XHRcdGNhc2UgJy5qcGcnOlxuXHRcdFx0XHR0eXBlID0gJ21lZGlhJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy5waHAnOlxuXHRcdFx0Y2FzZSAnLmh0bWwnOlxuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0Y2FzZSAnLmpzb24nOlxuXHRcdFx0XHR0eXBlID0gJ2NvZGUnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnppcCc6XG5cdFx0XHRjYXNlICcucmFyJzpcblx0XHRcdGNhc2UgJy50YXInOlxuXHRcdFx0Y2FzZSAnLjd6Jzpcblx0XHRcdGNhc2UgJy5neic6XG5cdFx0XHRcdHR5cGUgPSAnemlwJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSAndGV4dCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0c2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICYmIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50ID09PSBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0ZmlsZVByb3BzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnLCAnaGFzLW9wdGlvbnMnKTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCA9IDAgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGU7XG5cdFx0bGV0IGV4dCA9IGZpbGUuZXh0ZW5zaW9uIHx8IG51bGw7XG5cdFx0bGV0IGNoaWxkcmVuO1xuXG5cdFx0aWYgKCBmaWxlLnR5cGUgPT09ICdkaXJlY3RvcnknICkge1xuXHRcdFx0aWYgKCBmaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxldCBjaGlsZHJlbkl0ZW1zID0gW107XG5cblx0XHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIGZpbGUuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JdGVtcy5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggZmlsZS5jaGlsZHJlblsgY2hpbGQgXSwgbGV2ZWwgKyAxICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT0nY2hpbGRyZW4nIGtleT17IGZpbGUucGF0aCArICctY2hpbGRyZW4nIH0+eyBjaGlsZHJlbkl0ZW1zIH08L3VsPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdERpcmVjdG9yeVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRjaGlsZHJlbj17IGNoaWxkcmVuIH1cblx0XHRcdC8+O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gdGhpcy5nZXRNaW1lVHlwZSggZXh0ICk7XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3RGaWxlXG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0dHlwZT17IHR5cGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0YmFzZT17IHRoaXMucHJvcHMucGF0aCB9XG5cdFx0XHRcdHNldEFjdGl2ZUZpbGU9eyB0aGlzLnNldEFjdGl2ZUZpbGUgfVxuXHRcdFx0Lz47XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmIChcblx0XHRcdHRoaXMucHJvcHMubG9hZGluZyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2FkaW5nJz5cblx0XHRcdFx0XHQ8cD5Mb2FkaW5nJmhlbGxpcDs8L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm8gcHJvamVjdCBmb2xkZXIgc2VsZWN0ZWQuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmZpbGVzIHx8ICEgT2JqZWN0LmtleXMoIHRoaXMucHJvcHMuZmlsZXMgKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vdGhpbmcgdG8gc2VlIGhlcmUuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPSdmaWxlcyc+XG5cdFx0XHRcdHsgZmlsZWxpc3QgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldEFjdGl2ZUZpbGU6IHBheWxvYWQgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIHBheWxvYWQgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBGaWxlTGlzdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3REaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgZXhwYW5kZWQ6ICEgcHJldlN0YXRlLmV4cGFuZGVkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0Y2xhc3NOYW1lICs9ICcgZXhwYW5kJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9IG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RGlyZWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGZpbGUgaW4gdGhlIGZpbGVsaXN0LlxuICovXG5cbmNvbnN0IHsgcmVtb3RlLCBzaGVsbCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuY29uc3QgeyBNZW51LCBNZW51SXRlbSB9ID0gcmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5vbkNvbnRleHRNZW51ID0gdGhpcy5vbkNvbnRleHRNZW51LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKHtcblx0XHRcdGZpbGU6IHRoaXMucHJvcHMuZmlsZSxcblx0XHRcdGVsZW1lbnQ6IGV2ZW50LmN1cnJlbnRUYXJnZXRcblx0XHR9KTtcblx0fVxuXG5cdG9uQ29udGV4dE1lbnUoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVBhdGggPSB0aGlzLnByb3BzLmZpbGUucGF0aDtcblxuXHRcdGxldCBtZW51ID0gbmV3IE1lbnUoKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnT3BlbicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLm9wZW5JdGVtKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdTaG93IGluIGZvbGRlcicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIoIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHR0eXBlOiAnc2VwYXJhdG9yJ1xuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ0RlbGV0ZScsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggd2luZG93LmNvbmZpcm0oIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9P2AgKSApIHtcblx0XHRcdFx0XHRpZiAoIHNoZWxsLm1vdmVJdGVtVG9UcmFzaCggZmlsZVBhdGggKSApIHtcblx0XHRcdFx0XHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2ZpbGVzJykgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfS5gICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdH0pICk7XG5cblx0XHRtZW51LnBvcHVwKCByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaVxuXHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfVxuXHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0b25Db250ZXh0TWVudT17IHRoaXMub25Db250ZXh0TWVudSB9XG5cdFx0XHQ+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3RGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlID0gdGhpcy5oYW5kbGVDb21waWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKCB7IGxvYWRpbmc6IGZhbHNlIH0gKTtcblx0XHR9LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrID0gbnVsbDtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGdldENvbmZpZyggcHJvcGVydHksIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0bGV0IGRlZmF1bHRzID0ge1xuXHRcdFx0cGF0aDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApLFxuXHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCksXG5cdFx0XHRvcHRpb25zOiB7fVxuXHRcdH07XG5cblx0XHRsZXQgc3RvcmVkID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRsZXQgY29uZmlnID0gKCBzdG9yZWQgIT09IG51bGwgKSA/IHN0b3JlZCA6IGRlZmF1bHRzO1xuXG5cdFx0aWYgKCBwcm9wZXJ0eSApIHtcblx0XHRcdHJldHVybiAoIGNvbmZpZ1sgcHJvcGVydHkgXSApID8gY29uZmlnWyBwcm9wZXJ0eSBdIDogZGVmYXVsdFZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY29uZmlnO1xuXHRcdH1cblx0fVxuXG5cdHNldENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRcdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyB8fCAhIHByb3BlcnR5ICkge1xuXHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlndXJhdGlvbi4nICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSApO1xuXG5cdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdGxldCBmaWxlSW5kZXggPSBmaWxlcy5maW5kSW5kZXgoIGZpbGUgPT4gZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0aWYgKCBmaWxlSW5kZXggPT09IC0xICkge1xuXHRcdFx0bGV0IGZpbGVDb25maWcgPSB7XG5cdFx0XHRcdHBhdGg6IGZpbGVQYXRoLFxuXHRcdFx0XHR0eXBlOiB0aGlzLnN0YXRlLmZpbGVUeXBlLFxuXHRcdFx0XHRvdXRwdXQ6IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSApIClcblx0XHRcdH07XG5cblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcblx0XHRcdFx0ZmlsZUNvbmZpZ1sgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0ZmlsZXMucHVzaCggZmlsZUNvbmZpZyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHRcdGRlbGV0ZSBmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcuc2V0KCAnZmlsZXMnLCBmaWxlcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9uKCBvcHRpb24sIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLm9wdGlvbnMgJiYgdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRzZXRPcHRpb24oIG9wdGlvbiwgdmFsdWUgKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSB2YWx1ZTtcblxuXHRcdHRoaXMuc2V0Q29uZmlnKCAnb3B0aW9ucycsIG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBvcHRpb25zOiBvcHRpb25zIH0pO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBuYW1lLCB2YWx1ZSApIHtcblx0XHRpZiAoIG5hbWUgPT09ICdvdXRwdXQnICkge1xuXHRcdFx0dGhpcy5zZXRDb25maWcoICdvdXRwdXQnLCB2YWx1ZSApO1xuXG5cdFx0XHR0aGlzLnNldFN0YXRlKCB0aGlzLnN0YXRlICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0T3B0aW9uKCBuYW1lLCB2YWx1ZSApO1xuXHRcdH1cblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlLCB0aGlzLm91dHB1dFN1ZmZpeCwgdGhpcy5vdXRwdXRFeHRlbnNpb24gKTtcblx0fVxuXG5cdGdldE91dHB1dFBhdGgoIHR5cGUgPSAncmVsYXRpdmUnICkge1xuXHRcdGxldCBzbGFzaFBhdGggPSAoIHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCByZWxhdGl2ZVBhdGggPSAoIHR5cGUgPT09ICdyZWxhdGl2ZScgfHwgdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IGRlZmF1bHRQYXRoID0gdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpO1xuXHRcdGxldCBvdXRwdXRQYXRoID0gdGhpcy5nZXRDb25maWcoICdvdXRwdXQnLCBkZWZhdWx0UGF0aCApO1xuXG5cdFx0aWYgKCByZWxhdGl2ZVBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHNsYXNoUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBzbGFzaCggb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRQYXRoO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5wcm9jZXNzRmlsZShcblx0XHRcdHRoaXMucHJvcHMuYmFzZSxcblx0XHRcdHRoaXMuZ2V0Q29uZmlnKCksXG5cdFx0XHR0aGlzLnN0YXRlLmJ1aWxkVGFza05hbWUsXG5cdFx0XHR0aGlzLmhhbmRsZUNvbXBpbGVDYWxsYmFja1xuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJIZWFkZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckZvb3RlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2Zvb3Rlcic+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRjbGFzc05hbWU9J2NvbXBpbGUgZ3JlZW4nXG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTY3JpcHQgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuanMnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdKYXZhU2NyaXB0JywgZXh0ZW5zaW9uczogWyAnanMnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRzb3VyY2VNYXBzRGlzYWJsZWQoKSB7XG5cdFx0cmV0dXJuICggISB0aGlzLnN0YXRlLm9wdGlvbnMgfHwgKCAhIHRoaXMuc3RhdGUub3B0aW9ucy5idW5kbGUgJiYgISB0aGlzLnN0YXRlLm9wdGlvbnMuYmFiZWwgKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXNjcmlwdCc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsvKiA8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+ICovfVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdjb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsPSdDb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnY29tcHJlc3MnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zb3VyY2VNYXBzRGlzYWJsZWQoKSB9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTdHlsZXMgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuY3NzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnQ1NTJywgZXh0ZW5zaW9uczogWyAnY3NzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0aXNQYXJ0aWFsKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCB0aGlzLmlzUGFydGlhbCgpICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLDxiciAvPiBpdCBjYW5ub3QgYmUgY29tcGlsZWQgb24gaXRzIG93bi48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS50eXBlID09PSAnc2FzcycgJiZcblx0XHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBTdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc3R5bGUnLCAnbmVzdGVkJyApIH1cblx0XHRcdFx0XHRcdFx0b3B0aW9ucz17IHtcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wcmVzc2VkOiAnQ29tcHJlc3NlZCdcblx0XHRcdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b3ByZWZpeGVyJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlcztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBzaG93aW5nIG5vdGljZXMgYW5kIGFsZXJ0cy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE5vdGljZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRsZXQgdHlwZSA9IHRoaXMucHJvcHMudHlwZSB8fCAnaW5mbyc7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9eyAnbm90aWNlIHR5cGUtJyArIHR5cGUgfT5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpY2U7XG4iLCIvKipcbiAqIEBmaWxlIFJvb3QgcmVkdWNlci5cbiAqL1xuXG5jb25zdCB7IGNvbWJpbmVSZWR1Y2VycyB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3QgdmlldyA9ICggY3VycmVudCA9ICdmaWxlcycsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1ZJRVcnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi52aWV3O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gY3VycmVudDtcblx0fVxufTtcblxuY29uc3QgeyBwcm9qZWN0cywgYWN0aXZlUHJvamVjdCwgYWN0aXZlUHJvamVjdEZpbGVzIH0gPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG5cbmNvbnN0IGFjdGl2ZUZpbGUgPSAoIGZpbGUgPSBudWxsLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1NFVF9BQ1RJVkVfRklMRSc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcblx0dmlldyxcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlcyxcblx0YWN0aXZlRmlsZVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIFByb2plY3RzIHJlZHVjZXIuXG4gKi9cblxuY29uc3QgcHJvamVjdHMgPSAoIHByb2plY3RzID0gW10sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQUREX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0Li4ucHJvamVjdHMsXG5cdFx0XHRcdGFjdGlvbi5wYXlsb2FkXG5cdFx0XHRdO1xuXHRcdGNhc2UgJ1JFTU9WRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gYWN0aW9uLmlkICk7XG5cdFx0Y2FzZSAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMubWFwKCBmdW5jdGlvbiggcHJvamVjdCwgaW5kZXggKSB7XG5cdFx0XHRcdGlmICggaW5kZXggPT09IHBhcnNlSW50KCBhY3Rpb24ucGF5bG9hZC5pZCwgMTAgKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb2plY3Q7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHM7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3QgPSAoIGFjdGl2ZSA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRjYXNlICdTRVRfUFJPSkVDVF9TVEFURSc6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRcdC4uLmFjdGlvbi5wYXlsb2FkXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gYWN0aXZlO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0RmlsZXMgPSAoIGZpbGVzID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnUkVDRUlWRV9GSUxFUyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlcztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlc1xufTtcbiIsIi8qKlxuICogQGZpbGUgTG9nZ2VyIHV0aWxpdHkuXG4gKi9cblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNsYXNzIExvZ2dlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubG9ncyA9IFtdO1xuXHR9XG5cblx0bG9nKCB0eXBlLCB0aXRsZSwgYm9keSA9ICcnICkge1xuXHRcdHRoaXMubG9ncy5wdXNoKHtcblx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRib2R5OiBib2R5LFxuXHRcdFx0dGltZTogbW9tZW50KCkuZm9ybWF0KCdISDptbTpzcy5TU1MnKVxuXHRcdH0pO1xuXHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9sb2dzJykgKTtcblx0fVxuXG5cdGdldCggdHlwZSA9IG51bGwsIG9yZGVyID0gJ2Rlc2MnICkge1xuXHRcdGxldCBsb2dzO1xuXG5cdFx0aWYgKCAhIHR5cGUgKSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzLmZpbHRlciggbG9nID0+IHsgcmV0dXJuIGxvZy50eXBlID09PSB0eXBlIH0gKTtcblx0XHR9XG5cblx0XHRpZiAoIG9yZGVyID09PSAnZGVzYycgKSB7XG5cdFx0XHRsb2dzID0gbG9ncy5zbGljZSgpLnJldmVyc2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbG9ncztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dlcjtcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvdmVybGF5KCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvdmVybGF5JywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnJywgZXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb24gKSB7XG5cdGxldCBiYXNlZGlyID0gcGF0aC5wYXJzZSggZmlsZS5wYXRoICkuZGlyO1xuXHRsZXQgZmlsZW5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSArIHN1ZmZpeCArIGV4dGVuc2lvbjtcblxuXHRyZXR1cm4gcGF0aC5qb2luKCBiYXNlZGlyLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBmaWxlUmVsYXRpdmVQYXRoKCBmcm9tLCB0byApIHtcblx0cmV0dXJuIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gKCBwYXRoLmlzQWJzb2x1dGUoIGZpbGVuYW1lICkgKSA/IGZpbGVuYW1lIDogcGF0aC5qb2luKCBiYXNlLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBkaXJBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gcGF0aC5wYXJzZSggZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSApLmRpcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aCxcblx0ZmlsZUFic29sdXRlUGF0aCxcblx0ZGlyQWJzb2x1dGVQYXRoXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBDb2xsZWN0aW9uIG9mIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gc2xlZXAobWlsbGlzZWNvbmRzKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCAxZTc7IGkrKyApIHtcblx0XHRpZiAoICggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCApID4gbWlsbGlzZWNvbmRzICkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0bGV0IHN0YXRlID0ge1xuXHRcdHZpZXc6ICdmaWxlcycsXG5cdFx0cHJvamVjdHM6IFtdLFxuXHRcdGFjdGl2ZVByb2plY3Q6IDAsXG5cdFx0YWN0aXZlUHJvamVjdEZpbGVzOiB7fSxcblx0XHRhY3RpdmVGaWxlOiBudWxsXG5cdH07XG5cblx0aWYgKCBnbG9iYWwuY29uZmlnLmhhcyggJ3Byb2plY3RzJyApICkge1xuXHRcdHN0YXRlLnByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdwcm9qZWN0cycgKTtcblx0fVxuXG5cdGlmICggc3RhdGUucHJvamVjdHMubGVuZ3RoICYmIGdsb2JhbC5jb25maWcuaGFzKCAnYWN0aXZlLXByb2plY3QnICkgKSB7XG5cdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoICdhY3RpdmUtcHJvamVjdCcgKTtcblxuXHRcdGlmICggc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0ID0gc3RhdGUucHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHRzdGF0ZS5hY3RpdmVQcm9qZWN0LmlkID0gYWN0aXZlSW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdGxldCBwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0cHJvamVjdHNbIGFjdGl2ZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZy4nICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSApIHtcblx0bGV0IGRlcGVuZGVuY2llcyA9IFtdO1xuXG5cdGZvciAoIHZhciBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY3lUcmVlICkge1xuXHRcdGRlcGVuZGVuY2llcy5wdXNoKCBkZXBlbmRlbmN5ICk7XG5cblx0XHRpZiAoIE9iamVjdC5rZXlzKCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkubGVuZ3RoID4gMCApIHtcblx0XHRcdGRlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcy5jb25jYXQoIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApICk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRlcGVuZGVuY2llcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwLFxuXHRnZXRJbml0aWFsU3RhdGUsXG5cdHNldFByb2plY3RDb25maWcsXG5cdGdldERlcGVuZGVuY3lBcnJheVxufTtcbiJdfQ==
