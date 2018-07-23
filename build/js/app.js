(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

var app = require('electron').remote.app;

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var psTree = require('ps-tree');

var stripIndent = require('strip-indent');

// const OSCmd = process.platform === 'win32' ? '.cmd' : '';
var gulpPath = path.join(__dirname, '..', 'node_modules', 'gulp', 'bin', 'gulp.js');
var gulpCmdPath = path.join(__dirname, '..', 'app', 'gulp', 'gulp.cmd');
var gulpFilePath = path.join(__dirname, '..', 'app', 'gulp', 'gulpfile.js');

var _require = require('../js/utils/pathHelpers'),
    slash = _require.slash,
    fileAbsolutePath = _require.fileAbsolutePath,
    fileRelativePath = _require.fileRelativePath;

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

	var args = [taskName, '--cwd', app.getAppPath(), '--gulpfile', gulpFilePath, '--no-color'];

	var filename = options.filename || 'file';

	for (var option in options) {
		if (!options.hasOwnProperty(option)) {
			continue;
		}

		if (typeof options[option] !== 'boolean') {
			args.push('--' + option);
			args.push(options[option]);
		} else if (options[option] === true) {
			args.push('--' + option);
		}
	}

	var spawnCmd = process.platform === 'win32' ? gulpCmdPath : gulpPath;

	var cp = spawn(spawnCmd, args);

	console.log('Started %s with PID %d', taskName, cp.pid);

	global.compilerTasks.push(cp);

	cp.stdout.setEncoding('utf8');

	cp.stdout.on('data', function (data) {
		console.log(data);

		if (data.match(/Finished 'build-.*'/)) {
			// Build task successful.
			var notifyText = 'Finished compiling ' + filename + '.';

			var notify = new Notification('Buildr', {
				body: notifyText,
				silent: true
			});

			global.logger.log('success', notifyText);
		} else if (data.match(/Starting 'build-.*'/)) {
			// Build task starting.
			global.logger.log('info', 'Compiling ' + filename + '...');
		}
	});

	cp.stderr.setEncoding('utf8');

	cp.stderr.on('data', handleStderr);

	cp.on('exit', function (code) {
		// Remove this task from global array.
		global.compilerTasks = global.compilerTasks.filter(function (proc) {
			return proc.pid !== cp.pid;
		});

		if (code === 0) {
			// Success.
			// new Notification( 'Buildr', {
			// 	body: `Finished compiling ${filename}.`,
			// 	silent: true
			// });
		} else if (code === 1) {
			// Terminated.
			// console.log( 'Process %s terminated', cp.pid );
		} else if (code) {
			// new Notification( 'Buildr', {
			// 	body: `Error when compiling ${filename}.`,
			// 	sound: 'Basso'
			// });

			console.error('Exited with error code ' + code);
		}

		if (callback) {
			callback(code);
		}
	});
}

function handleStderr(data) {
	var errObj = {};
	var startCapture = false;

	var lines = data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/);

	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = lines[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var line = _step4.value;

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
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
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

module.exports = {
	initProject: initProject,
	runTask: runTask,
	killTasks: killTasks,
	processFile: processFile,
	getFileConfig: getFileConfig,
	getFileOptions: getFileOptions,
	terminateProcess: terminateProcess
};

},{"../js/utils/pathHelpers":29,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined}],2:[function(require,module,exports){
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
	setActiveFile: setActiveFile
};

},{}],3:[function(require,module,exports){
'use strict';

/**
 * @file Main app script.
 */

var Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./utils/globalUI');

global.compiler = require('../gulp/interface');

global.compilerTasks = [];

var React = require('react');

var ReactDOM = require('react-dom');

var _require = require('react-redux'),
    Provider = _require.Provider;

var _require2 = require('redux'),
    createStore = _require2.createStore;

var rootReducer = require('./reducers');

// let initialState = {
// 	view: 'files',
// 	projects: {},
// 	activeProject: 0,
// 	activeProjectFiles: {},
// 	activeFile: null
// };

var store = createStore(rootReducer); // , initialState );

global.store = store;

var App = require('./components/App');

ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(App, null)
), document.getElementById('root'));

var _require3 = require('./utils/utils'),
    sleep = _require3.sleep;

// App close/restart events.


window.addEventListener('beforeunload', function (event) {
	if (global.compilerTasks.length > 0) {
		console.log('Killing %d running tasks...', global.compilerTasks.length);

		global.compiler.killTasks();

		sleep(300);
	}
});

},{"../gulp/interface":1,"./components/App":4,"./reducers":24,"./utils/globalUI":28,"./utils/utils":30,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],4:[function(require,module,exports){
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

},{"./Overlay":6,"./Sidebar":7,"./projects/Logs":12,"./projects/Projects":15,"./projects/Settings":16,"react":undefined,"react-redux":undefined}],5:[function(require,module,exports){
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

},{"react":undefined}],6:[function(require,module,exports){
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

},{"react":undefined}],7:[function(require,module,exports){
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

},{"../actions":2,"react":undefined,"react-redux":undefined}],8:[function(require,module,exports){
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

},{"react":undefined}],9:[function(require,module,exports){
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

},{"../../utils/pathHelpers":29,"./Field":8,"electron":undefined,"prop-types":undefined,"react":undefined}],10:[function(require,module,exports){
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

},{"./Field":8,"prop-types":undefined,"react":undefined}],11:[function(require,module,exports){
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

},{"./Field":8,"prop-types":undefined,"react":undefined}],12:[function(require,module,exports){
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
					{ className: 'logs-screen' },
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

},{"../NoContent":5,"react":undefined}],13:[function(require,module,exports){
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

},{"../NoContent":5,"./fileoptions/FileOptionsScript":21,"./fileoptions/FileOptionsStyle":22,"react":undefined,"react-redux":undefined}],14:[function(require,module,exports){
'use strict';

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
    _setProjectState = _require2.setProjectState;

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
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectSelect);

},{"../../actions":2,"../../utils/utils":30,"react":undefined,"react-redux":undefined}],15:[function(require,module,exports){
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

			if (this.props.projects[id]) {
				active = this.props.projects[id];
			} else if (project) {
				active = project;
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

},{"../../actions":2,"../../utils/Logger":26,"../../utils/directoryTree":27,"../NoContent":5,"../ui/Notice":23,"./Panel":13,"./ProjectSelect":14,"./filelist/FileList":17,"electron":undefined,"electron-store":undefined,"fs":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],16:[function(require,module,exports){
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

},{"../NoContent":5,"react":undefined}],17:[function(require,module,exports){
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

},{"../../../actions":2,"../../NoContent":5,"./FileListDirectory":18,"./FileListFile":19,"react":undefined,"react-redux":undefined}],18:[function(require,module,exports){
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

},{"react":undefined}],19:[function(require,module,exports){
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

},{"electron":undefined,"react":undefined}],20:[function(require,module,exports){
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

			var config = stored !== false ? stored : defaults;

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

			return false;
		}
	}]);

	return FileOptions;
}(React.Component);

module.exports = FileOptions;

},{"../../../utils/pathHelpers":29,"react":undefined}],21:[function(require,module,exports){
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

},{"../../fields/FieldSaveFile":9,"../../fields/FieldSwitch":11,"./FileOptions":20,"react":undefined}],22:[function(require,module,exports){
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

},{"../../NoContent":5,"../../fields/FieldSaveFile":9,"../../fields/FieldSelect":10,"../../fields/FieldSwitch":11,"./FileOptions":20,"react":undefined}],23:[function(require,module,exports){
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

},{"react":undefined}],24:[function(require,module,exports){
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

},{"./projects":25,"redux":undefined}],25:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @file Projects reducer.
 */

var initialProjects = [];

if (global.config.has('projects')) {
	initialProjects = global.config.get('projects');
}

var projects = function projects() {
	var projects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialProjects;
	var action = arguments[1];

	switch (action.type) {
		case 'ADD_PROJECT':
			return [].concat(_toConsumableArray(projects), [action.payload]);
		case 'REMOVE_PROJECT':
			return projects.filter(function (project, index) {
				return index !== action.id;
			});
		default:
			return projects;
	}
};

var initialActive = {
	id: null,
	name: '',
	path: '',
	paused: false
};

if (initialProjects.length && global.config.has('active-project')) {
	var activeIndex = global.config.get('active-project');

	if (initialProjects[activeIndex]) {
		initialActive = initialProjects[activeIndex];
		initialActive.id = activeIndex;
	}
}

var activeProject = function activeProject() {
	var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialActive;
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

},{}],26:[function(require,module,exports){
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

},{"moment":undefined}],27:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{"path":undefined}],30:[function(require,module,exports){
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
	setProjectConfig: setProjectConfig,
	getDependencyArray: getDependencyArray
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvZ3VscC9pbnRlcmZhY2UuanMiLCJhcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsImFwcC9qcy9hcHAuanMiLCJhcHAvanMvY29tcG9uZW50cy9BcHAuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvTm9Db250ZW50LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvU2lkZWJhci5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFN3aXRjaC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1BhbmVsLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RTZWxlY3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvU2V0dGluZ3MuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvdWkvTm90aWNlLmpzeCIsImFwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsImFwcC9qcy9yZWR1Y2Vycy9wcm9qZWN0cy5qcyIsImFwcC9qcy91dGlscy9Mb2dnZXIuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGlscy9wYXRoSGVscGVycy5qcyIsImFwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQTs7SUFFUSxHLEdBQVEsUUFBUSxVQUFSLEVBQW9CLE0sQ0FBNUIsRzs7QUFFUixJQUFNLEtBQUssUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNLFFBQVEsUUFBUSxlQUFSLEVBQXlCLEtBQXZDO0FBQ0EsSUFBTSxTQUFTLFFBQVEsU0FBUixDQUFmOztBQUVBLElBQU0sY0FBYyxRQUFRLGNBQVIsQ0FBcEI7O0FBRUE7QUFDQSxJQUFNLFdBQVcsS0FBSyxJQUFMLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUE0QixjQUE1QixFQUE0QyxNQUE1QyxFQUFvRCxLQUFwRCxFQUEyRCxTQUEzRCxDQUFqQjtBQUNBLElBQU0sY0FBYyxLQUFLLElBQUwsQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLEtBQTVCLEVBQW1DLE1BQW5DLEVBQTJDLFVBQTNDLENBQXBCO0FBQ0EsSUFBTSxlQUFlLEtBQUssSUFBTCxDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBNEIsS0FBNUIsRUFBbUMsTUFBbkMsRUFBMkMsYUFBM0MsQ0FBckI7O2VBRXNELFFBQVEseUJBQVIsQztJQUE5QyxLLFlBQUEsSztJQUFPLGdCLFlBQUEsZ0I7SUFBa0IsZ0IsWUFB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QUFFQSxLQUFLLE1BQU0sT0FBTixDQUFlLFFBQWYsS0FBNkIsU0FBVSxXQUFWLENBQWxDLEVBQTREO0FBQzNELFdBQVUsV0FBVixFQUF5QixRQUF6QixJQUFzQyxLQUF0Qzs7QUFFQSxTQUFPLE1BQVAsQ0FBYyxHQUFkLENBQW1CLFVBQW5CLEVBQStCLFFBQS9CO0FBQ0EsRUFKRCxNQUlPO0FBQ04sU0FBTyxLQUFQLENBQWMsZ0RBQWQ7QUFDQTtBQUNEOztBQUVELFNBQVMsa0JBQVQsQ0FBNkIsY0FBN0IsRUFBOEM7QUFDN0MsS0FBSSxlQUFlLEVBQW5COztBQUVBLE1BQU0sSUFBSSxVQUFWLElBQXdCLGNBQXhCLEVBQXlDO0FBQ3hDLGVBQWEsSUFBYixDQUFtQixVQUFuQjs7QUFFQSxNQUFLLE9BQU8sSUFBUCxDQUFhLGVBQWdCLFVBQWhCLENBQWIsRUFBNEMsTUFBNUMsR0FBcUQsQ0FBMUQsRUFBOEQ7QUFDN0Qsa0JBQWUsYUFBYSxNQUFiLENBQXFCLG1CQUFvQixlQUFnQixVQUFoQixDQUFwQixDQUFyQixDQUFmO0FBQ0E7QUFDRDs7QUFFRCxRQUFPLFlBQVA7QUFDQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsYUFEZ0I7QUFFaEIsbUNBRmdCO0FBR2hCO0FBSGdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduO1xuY29uc3QgcHNUcmVlID0gcmVxdWlyZSgncHMtdHJlZScpO1xuXG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuXG4vLyBjb25zdCBPU0NtZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnLmNtZCcgOiAnJztcbmNvbnN0IGd1bHBQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZ3VscCcsICdiaW4nLCAnZ3VscC5qcycgKTtcbmNvbnN0IGd1bHBDbWRQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdhcHAnLCAnZ3VscCcsICdndWxwLmNtZCcgKTtcbmNvbnN0IGd1bHBGaWxlUGF0aCA9IHBhdGguam9pbiggX19kaXJuYW1lLCAnLi4nLCAnYXBwJywgJ2d1bHAnLCAnZ3VscGZpbGUuanMnICk7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVSZWxhdGl2ZVBhdGggfSA9IHJlcXVpcmUoJy4uL2pzL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmZ1bmN0aW9uIGtpbGxUYXNrcygpIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKSB7XG5cdFx0Zm9yICggdmFyIHRhc2sgb2YgZ2xvYmFsLmNvbXBpbGVyVGFza3MgKSB7XG5cdFx0XHR0ZXJtaW5hdGVQcm9jZXNzKCB0YXNrICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBOb3RoaW5nIHRvIGtpbGwgOihcblx0cmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHRlcm1pbmF0ZVByb2Nlc3MoIHByb2MgKSB7XG5cdHBzVHJlZSggcHJvYy5waWQsIGZ1bmN0aW9uKCBlcnIsIGNoaWxkcmVuICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0fVxuXG5cdFx0Zm9yICggdmFyIHBpZCBvZiBbIHByb2MucGlkIF0uY29uY2F0KCBjaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLlBJRCApICkgKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRwcm9jZXNzLmtpbGwoIHBpZCApO1xuXHRcdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdFx0Ly8gRmFpbCBzaWxlbnRseSBsb2wgWU9MT1xuXHRcdFx0XHQvLyBjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBpbml0UHJvamVjdCgpIHtcblx0a2lsbFRhc2tzKCk7XG5cblx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBwcm9qZWN0RmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cblx0bGV0IHByb2plY3RQYXRoID0gcGF0aC5wYXJzZSggZ2xvYmFsLnByb2plY3RDb25maWcucGF0aCApLmRpcjtcblxuXHRmb3IgKCB2YXIgZmlsZUNvbmZpZyBvZiBwcm9qZWN0RmlsZXMgKSB7XG5cdFx0cHJvY2Vzc0ZpbGUoIHByb2plY3RQYXRoLCBmaWxlQ29uZmlnICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0ZpbGUoIGJhc2UsIGZpbGVDb25maWcsIHRhc2tOYW1lID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgb3B0aW9ucyA9IGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKTtcblxuXHRpZiAoICEgb3B0aW9ucyApIHtcblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoIHRhc2tOYW1lICkge1xuXHRcdHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHR9IGVsc2UgaWYgKCBvcHRpb25zLmF1dG9jb21waWxlICkge1xuXHRcdGlmICggb3B0aW9ucy53YXRjaFRhc2sgKSB7XG5cdFx0XHRvcHRpb25zLmdldEltcG9ydHMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHJ1blRhc2soICd3YXRjaCcsIG9wdGlvbnMgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3B0aW9ucyggZmlsZSApIHtcblx0bGV0IG9wdGlvbnMgPSB7fTtcblxuXHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRjYXNlICcuY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdjc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdzYXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdsZXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5qcyc6XG5cdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnanMnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzY3JpcHQnO1xuXHR9XG5cblx0b3B0aW9ucy5idWlsZFRhc2tOYW1lID0gJ2J1aWxkLScgKyBvcHRpb25zLnR5cGU7XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLnBhdGggfHwgISBmaWxlQ29uZmlnLm91dHB1dCApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgZmlsZVBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLnBhdGggKTtcblx0bGV0IG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLm91dHB1dCApO1xuXHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnZXRGaWxlT3B0aW9ucyh7IGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKCBmaWxlUGF0aCApIH0pO1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRpbnB1dDogZmlsZVBhdGgsXG5cdFx0ZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoIG91dHB1dFBhdGggKSxcblx0XHRvdXRwdXQ6IHBhdGgucGFyc2UoIG91dHB1dFBhdGggKS5kaXIsXG5cdFx0cHJvamVjdEJhc2U6IGJhc2UsXG5cdFx0cHJvamVjdENvbmZpZzogZ2xvYmFsLnByb2plY3RDb25maWcucGF0aFxuXHR9O1xuXG5cdGlmICggZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdGZvciAoIHZhciBvcHRpb24gaW4gZmlsZUNvbmZpZy5vcHRpb25zICkge1xuXHRcdFx0aWYgKCAhIGZpbGVDb25maWcub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSBmaWxlQ29uZmlnLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdGlmICggZmlsZUNvbmZpZy5vcHRpb25zLmF1dG9jb21waWxlICkge1xuXHRcdFx0b3B0aW9ucy53YXRjaFRhc2sgPSBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucyA9IHt9LCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBhcmdzID0gW1xuXHRcdHRhc2tOYW1lLFxuXHRcdCctLWN3ZCcsIGFwcC5nZXRBcHBQYXRoKCksXG5cdFx0Jy0tZ3VscGZpbGUnLCBndWxwRmlsZVBhdGgsXG5cdFx0Jy0tbm8tY29sb3InXG5cdF07XG5cblx0bGV0IGZpbGVuYW1lID0gb3B0aW9ucy5maWxlbmFtZSB8fCAnZmlsZSc7XG5cblx0Zm9yICggdmFyIG9wdGlvbiBpbiBvcHRpb25zICkge1xuXHRcdGlmICggISBvcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mKCBvcHRpb25zWyBvcHRpb24gXSApICE9PSAnYm9vbGVhbicgKSB7XG5cdFx0XHRhcmdzLnB1c2goICctLScgKyBvcHRpb24gKTtcblx0XHRcdGFyZ3MucHVzaCggb3B0aW9uc1sgb3B0aW9uIF0gKTtcblx0XHR9IGVsc2UgaWYgKCBvcHRpb25zWyBvcHRpb24gXSA9PT0gdHJ1ZSApIHtcblx0XHRcdGFyZ3MucHVzaCggJy0tJyArIG9wdGlvbiApO1xuXHRcdH1cblx0fVxuXG5cdGxldCBzcGF3bkNtZCA9ICggcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyApID8gZ3VscENtZFBhdGggOiBndWxwUGF0aDtcblxuXHRjb25zdCBjcCA9IHNwYXduKCBzcGF3bkNtZCwgYXJncyApO1xuXG5cdGNvbnNvbGUubG9nKCAnU3RhcnRlZCAlcyB3aXRoIFBJRCAlZCcsIHRhc2tOYW1lLCBjcC5waWQgKTtcblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCBjcCApO1xuXG5cdGNwLnN0ZG91dC5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcblx0XHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdFx0aWYgKCBkYXRhLm1hdGNoKC9GaW5pc2hlZCAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN1Y2Nlc3NmdWwuXG5cdFx0XHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRcdFx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblx0XHR9IGVsc2UgaWYgKCBkYXRhLm1hdGNoKC9TdGFydGluZyAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2ZpbGVuYW1lfS4uLmAgKTtcblx0XHR9XG5cdH0pO1xuXG5cdGNwLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZGVyci5vbiggJ2RhdGEnLCBoYW5kbGVTdGRlcnIgKTtcblxuXHRjcC5vbiggJ2V4aXQnLCBjb2RlID0+IHtcblx0XHQvLyBSZW1vdmUgdGhpcyB0YXNrIGZyb20gZ2xvYmFsIGFycmF5LlxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3MuZmlsdGVyKCBwcm9jID0+IHtcblx0XHRcdHJldHVybiAoIHByb2MucGlkICE9PSBjcC5waWQgKTtcblx0XHR9KTtcblxuXHRcdGlmICggY29kZSA9PT0gMCApIHtcblx0XHRcdC8vIFN1Y2Nlc3MuXG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHQvLyBcdHNpbGVudDogdHJ1ZVxuXHRcdFx0Ly8gfSk7XG5cdFx0fSBlbHNlIGlmICggY29kZSA9PT0gMSApIHtcblx0XHRcdC8vIFRlcm1pbmF0ZWQuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ1Byb2Nlc3MgJXMgdGVybWluYXRlZCcsIGNwLnBpZCApO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgKSB7XG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRXJyb3Igd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX0uYCxcblx0XHRcdC8vIFx0c291bmQ6ICdCYXNzbydcblx0XHRcdC8vIH0pO1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKGBFeGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7Y29kZX1gKTtcblx0XHR9XG5cblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soIGNvZGUgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggISB0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclswXSBdID0gZXJyQXJyWzFdO1xuXG5cdFx0XHRpZiAoIGVyckFyclswXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbignXFxuJykgKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCdcXG4nKSApO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9qZWN0KCBpZCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVNT1ZFX1BST0pFQ1QnLFxuXHRcdGlkXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9QUk9KRUNUX1NUQVRFJyxcblx0XHRwYXlsb2FkOiBzdGF0ZVxuXHR9O1xufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0QWN0aXZlRmlsZSggZmlsZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX0FDVElWRV9GSUxFJyxcblx0XHRwYXlsb2FkOiBmaWxlXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjaGFuZ2VWaWV3LFxuXHRhZGRQcm9qZWN0LFxuXHRjaGFuZ2VQcm9qZWN0LFxuXHRyZW1vdmVQcm9qZWN0LFxuXHRzZXRQcm9qZWN0U3RhdGUsXG5cdHJlY2VpdmVGaWxlcyxcblx0c2V0QWN0aXZlRmlsZVxufTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgc2NyaXB0LlxuICovXG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuZ2xvYmFsLmNvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdG5hbWU6ICdidWlsZHItY29uZmlnJ1xufSk7XG5cbmdsb2JhbC51aSA9IHJlcXVpcmUoJy4vdXRpbHMvZ2xvYmFsVUknKTtcblxuZ2xvYmFsLmNvbXBpbGVyID0gcmVxdWlyZSgnLi4vZ3VscC9pbnRlcmZhY2UnKTtcblxuZ2xvYmFsLmNvbXBpbGVyVGFza3MgPSBbXTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCB7IFByb3ZpZGVyIH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IGNyZWF0ZVN0b3JlIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCByb290UmVkdWNlciA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxuLy8gbGV0IGluaXRpYWxTdGF0ZSA9IHtcbi8vIFx0dmlldzogJ2ZpbGVzJyxcbi8vIFx0cHJvamVjdHM6IHt9LFxuLy8gXHRhY3RpdmVQcm9qZWN0OiAwLFxuLy8gXHRhY3RpdmVQcm9qZWN0RmlsZXM6IHt9LFxuLy8gXHRhY3RpdmVGaWxlOiBudWxsXG4vLyB9O1xuXG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKCByb290UmVkdWNlciApOyAvLyAsIGluaXRpYWxTdGF0ZSApO1xuXG5nbG9iYWwuc3RvcmUgPSBzdG9yZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBjb21wb25lbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcblxuY29uc3QgU2lkZWJhciA9IHJlcXVpcmUoJy4vU2lkZWJhcicpO1xuXG5jb25zdCBMb2dzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Mb2dzJyk7XG5cbmNvbnN0IFNldHRpbmdzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9TZXR0aW5ncycpO1xuXG5jb25zdCBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvUHJvamVjdHMnKTtcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy52aWV3cyA9IHtcblx0XHRcdGZpbGVzOiAnRmlsZXMnLFxuXHRcdFx0bG9nczogJ0xvZ3MnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXHR9XG5cblx0cmVuZGVyT3ZlcmxheSgpIHtcblx0XHRnbG9iYWwudWkub3ZlcmxheSggdGhpcy5wcm9wcy52aWV3ICE9PSAnZmlsZXMnICk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2ZpbGVzJyApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGNvbnRlbnQ7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnbG9ncycgKSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8TG9ncyAvPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8U2V0dGluZ3MgLz47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxPdmVybGF5IGhhc0Nsb3NlPXsgZmFsc2UgfT5cblx0XHRcdFx0XHR7IGNvbnRlbnQgfVxuXHRcdFx0XHQ8L092ZXJsYXk+XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nYXBwJz5cblx0XHRcdFx0PFNpZGViYXIgaXRlbXM9eyB0aGlzLnZpZXdzIH0gLz5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50LXdyYXAnPlxuXHRcdFx0XHRcdDxQcm9qZWN0cyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyT3ZlcmxheSgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHZpZXc6IHN0YXRlLnZpZXcsXG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0c1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIEFwcCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGVtcHR5IHNjcmVlbi9ubyBjb250ZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcHJvcHMgKSB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyAnbm8tY29udGVudCcgKyAoIHByb3BzLmNsYXNzTmFtZSA/ICcgJyArIHByb3BzLmNsYXNzTmFtZSA6ICcnICkgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYW4gb3ZlcmxheS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHQvLyBjb25zdHJ1Y3RvcigpIHt9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdvdmVybGF5Jz5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmhhc0Nsb3NlICYmXG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgaWQ9J2Nsb3NlLW92ZXJsYXknPiZ0aW1lczs8L2E+XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQ8ZGl2IGlkPSdvdmVybGF5LWNvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTtcbiIsIi8qKlxuICogQGZpbGUgQXBwIHNpZGViYXIuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNoYW5nZVZpZXcgfSA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jbGFzcyBTaWRlYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGxldCB2aWV3ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnZpZXc7XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVZpZXcoIHZpZXcgKTtcblx0fVxuXG5cdHJlbmRlckl0ZW1zKCkge1xuXHRcdGxldCBpdGVtcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGlkIGluIHRoaXMucHJvcHMuaXRlbXMgKSB7XG5cdFx0XHRpdGVtcy5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS12aWV3PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdGlwPXsgdGhpcy5wcm9wcy5pdGVtc1sgaWQgXSB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy5hY3RpdmUgPT09IGlkID8gJ2FjdGl2ZScgOiAnJyB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bmF2IGlkPSdzaWRlYmFyJz5cblx0XHRcdFx0PHVsIGlkPSdtZW51Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVySXRlbXMoKSB9XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L25hdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmU6IHN0YXRlLnZpZXdcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0Y2hhbmdlVmlldzogdmlldyA9PiBkaXNwYXRjaCggY2hhbmdlVmlldyggdmlldyApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFNpZGViYXIgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB3cmFwcGluZyBhIGZpZWxkLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuZnVuY3Rpb24gRmllbGQoIHByb3BzICkge1xuXHRsZXQgY2xhc3NOYW1lID0gJ2ZpZWxkIGZpZWxkLScgKyBwcm9wcy50eXBlICsgJyBsYWJlbC0nICsgKCBwcm9wcy5sYWJlbFBvcyA/IHByb3BzLmxhYmVsUG9zIDogJ3RvcCcgKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0+XG5cdFx0XHR7IHByb3BzLmxhYmVsICYmXG5cdFx0XHRcdDxzdHJvbmcgY2xhc3NOYW1lPSdmaWVsZC1sYWJlbCc+eyBwcm9wcy5sYWJlbCB9PC9zdHJvbmc+XG5cdFx0XHR9XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQtY29udCc+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBzYXZlIGZpbGUgZmllbGQuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2F2ZUZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgcGF0aCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyAnJyA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHBhdGggfTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVTYXZlT3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLnRpdGxlID0gdGhpcy5wcm9wcy5kaWFsb2dUaXRsZTtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlRmlsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucHJvcHMuc291cmNlRmlsZS5wYXRoO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMuc3RhdGUucGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmZpbHRlcnMgPSB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gZGlhbG9nLnNob3dTYXZlRGlhbG9nKCBmaWxlU2F2ZU9wdGlvbnMgKTtcblxuXHRcdGlmICggZmlsZW5hbWUgKSB7XG5cdFx0XHRsZXQgc2F2ZVBhdGggPSBzbGFzaCggZmlsZW5hbWUgKTtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRcdHNhdmVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgZmlsZW5hbWUgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHsgcGF0aDogc2F2ZVBhdGggfSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgc2F2ZVBhdGggKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0naGlkZGVuJ1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5wYXRoIH1cblx0XHRcdFx0XHRyZWFkT25seT0ndHJ1ZSdcblx0XHRcdFx0Lz5cblx0XHRcdFx0PHNtYWxsIG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT57IHRoaXMuc3RhdGUucGF0aCB9PC9zbWFsbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSksXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNhdmVGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0c2VsZWN0ZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgc2VsZWN0ZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBzZWxlY3RlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBzZWxlY3RlZDogZXZlbnQudGFyZ2V0LnZhbHVlIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLnNlbGVjdGVkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5zZWxlY3RlZCA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5zdGF0ZS5zZWxlY3RlZCBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuc3RhdGUuc2VsZWN0ZWQgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Y2hlY2tlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBjaGVja2VkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgY2hlY2tlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBjaGVja2VkOiAhIHByZXZTdGF0ZS5jaGVja2VkIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLmNoZWNrZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3N3aXRjaCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0Y2hlY2tlZD17IHRoaXMuc3RhdGUuY2hlY2tlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFN3aXRjaC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5ib29sLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBsb2dzIGFuZCBpbmZvcm1hdGlvbi5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGxldCBsb2dJbmRleCA9IDA7XG5cdFx0bGV0IGxvZ0xpc3QgPSBbXTtcblxuXHRcdGZvciAoIHZhciBsb2cgb2YgdGhpcy5zdGF0ZS5sb2dzICkge1xuXHRcdFx0bGV0IHRpdGxlSFRNTCA9IHsgX19odG1sOiBsb2cudGl0bGUgfTtcblx0XHRcdGxldCBib2R5SFRNTCA9ICggbG9nLmJvZHkgKSA/IHsgX19odG1sOiBsb2cuYm9keSB9IDogbnVsbDtcblxuXHRcdFx0bG9nTGlzdC5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBsb2dJbmRleCB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgJ3R5cGUtJyArIGxvZy50eXBlIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0XHQ8c21hbGw+eyBsb2cudGltZSB9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUtdGV4dCcgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyB0aXRsZUhUTUwgfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHsgYm9keUhUTUwgJiZcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXRhaWxzJyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IGJvZHlIVE1MIH0gLz5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpO1xuXHRcdFx0bG9nSW5kZXgrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gPHVsPnsgbG9nTGlzdCB9PC91bD47XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUubG9ncy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMz5ObyBsb2dzIHlldC48L2gzPlxuXHRcdFx0XHRcdDxwPkdvIGZvcnRoIGFuZCBjb21waWxlITwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdsb2dzJyBjbGFzc05hbWU9J2xvZ3Mtc2NyZWVuJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHBhbmVsLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1NjcmlwdCA9IHJlcXVpcmUoJy4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTY3JpcHQnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTdHlsZSA9IHJlcXVpcmUoJy4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRnZXRPcHRpb25zKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1N0eWxlIGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1NjcmlwdCBiYXNlPXsgdGhpcy5wcm9wcy5wcm9qZWN0LnBhdGggfSBmaWxlPXsgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUgfSAvPjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNvbnRlbnQoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRsZXQgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuXG5cdFx0XHRpZiAoIG9wdGlvbnMgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdDxwPlNlbGVjdCBhIHN0eWxlc2hlZXQgb3Igc2NyaXB0IGZpbGUgdG8gdmlldyBjb21waWxpbmcgb3B0aW9ucy48L3A+XG5cdFx0XHQ8L05vQ29udGVudD5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwYW5lbCc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDb250ZW50KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZSxcblx0cHJvamVjdDogc3RhdGUuYWN0aXZlUHJvamVjdCxcblx0ZmlsZXM6IHN0YXRlLmFjdGl2ZVByb2plY3RGaWxlc1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIFBhbmVsICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdFN0YXRlIH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdENvbmZpZyB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXRpbHMnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVQcm9qZWN0ID0gdGhpcy50b2dnbGVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHRnbG9iYWwudWkudW5mb2N1cyggISB0aGlzLnN0YXRlLmlzT3BlbiApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGlzT3BlbjogISB0aGlzLnN0YXRlLmlzT3BlbiB9KTtcblx0fVxuXG5cdHRvZ2dsZVByb2plY3QoKSB7XG5cdFx0bGV0IHBhdXNlZCA9ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkIHx8IGZhbHNlO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0U3RhdGUoeyBwYXVzZWQ6IHBhdXNlZCB9KTtcblxuXHRcdHNldFByb2plY3RDb25maWcoICdwYXVzZWQnLCBwYXVzZWQgKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0KCk7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMucHJvcHMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnByb3BzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMucHJvcHMucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gc2VsZWN0IG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0JyBjbGFzc05hbWU9J3NlbGVjdGVkJz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aW9ucyc+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPXsgJ3RvZ2dsZScgKyAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCA/ICcgcGF1c2VkJyA6ICcgYWN0aXZlJyApIH0gb25DbGljaz17IHRoaXMudG9nZ2xlUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZWZyZXNoJyBvbkNsaWNrPXsgdGhpcy5wcm9wcy5yZWZyZXNoUHJvamVjdCB9IC8+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZW1vdmUnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlbW92ZVByb2plY3QgfSAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdFxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRQcm9qZWN0U3RhdGU6IHN0YXRlID0+IGRpc3BhdGNoKCBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdFNlbGVjdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyB2aWV3LlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBfZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2gvZGVib3VuY2UnKTtcblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgTm90aWNlID0gcmVxdWlyZSgnLi4vdWkvTm90aWNlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IFBhbmVsID0gcmVxdWlyZSgnLi9QYW5lbCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZGlyZWN0b3J5VHJlZScpO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9Mb2dnZXInKTtcblxuY29uc3QgeyBhZGRQcm9qZWN0LCByZW1vdmVQcm9qZWN0LCBjaGFuZ2VQcm9qZWN0LCByZWNlaXZlRmlsZXMsIHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJyxcblx0XHRcdFx0J2J1aWxkci1wcm9qZWN0Lmpzb24nXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmluaXRQcm9qZWN0ID0gdGhpcy5pbml0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0ID0gdGhpcy5jaGFuZ2VQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0bGV0IG5ld1Byb2plY3RJbmRleCA9IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIFtcblx0XHRcdFx0Li4udGhpcy5wcm9wcy5wcm9qZWN0cyxcblx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XSApO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbmV3UHJvamVjdEluZGV4LCBuZXdQcm9qZWN0ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQsIHByb2plY3QgPSBudWxsICkge1xuXHRcdGlmICggaWQgPT09IHRoaXMucHJvcHMuYWN0aXZlLmlkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0c1sgaWQgXSApIHtcblx0XHRcdGFjdGl2ZSA9IHRoaXMucHJvcHMucHJvamVjdHNbIGlkIF07XG5cdFx0fSBlbHNlIGlmICggcHJvamVjdCApIHtcblx0XHRcdGFjdGl2ZSA9IHByb2plY3Q7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGNvbmZpZy5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaWQgKTtcblxuXHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVByb2plY3Qoe1xuXHRcdFx0Li4uYWN0aXZlLFxuXHRcdFx0aWRcblx0XHR9KTtcblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIG51bGwgKTtcblxuXHRcdC8vIEluaXQuXG5cdFx0dGhpcy5pbml0UHJvamVjdCggYWN0aXZlLnBhdGggKTtcblx0fVxuXG5cdC8vIFJlbW92ZSB0aGUgY3VycmVudCBwcm9qZWN0LlxuXHRyZW1vdmVQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNvbmZpcm1SZW1vdmUgPSB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJHt0aGlzLnByb3BzLmFjdGl2ZS5uYW1lfT9gICk7XG5cblx0XHRpZiAoIGNvbmZpcm1SZW1vdmUgKSB7XG5cdFx0XHRsZXQgcmVtb3ZlSW5kZXggPSBwYXJzZUludCggdGhpcy5wcm9wcy5hY3RpdmUuaWQsIDEwICk7XG5cblx0XHRcdGxldCBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHMuZmlsdGVyKCAoIHByb2plY3QsIGluZGV4ICkgPT4gaW5kZXggIT09IHJlbW92ZUluZGV4ICk7XG5cblx0XHRcdC8vIFJlbW92ZSBwcm9qZWN0IGZyb20gY29uZmlnLlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCggcmVtb3ZlSW5kZXggKTtcblxuXHRcdFx0Ly8gVW5zZXQgYWN0aXZlIHByb2plY3QuXG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIG51bGwgKTtcblx0XHR9XG5cdH1cblxuXHQvLyBTdGFydCB0aGUgYmFja2dyb3VuZCBjb21waWxlciB0YXNrcy5cblx0aW5pdENvbXBpbGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgKSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIuaW5pdFByb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFJlZnJlc2ggdGhlIHByb2plY3QgZmlsZXMuXG5cdHJlZnJlc2hQcm9qZWN0KCkge1xuXHRcdHRoaXMuZ2V0RmlsZXMoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblx0fVxuXG5cdC8vIENyZWF0ZSBvciBmZXRjaCB0aGUgcHJvamVjdCBjb25maWcgZmlsZS5cblx0c2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKSB7XG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBuZXcgU3RvcmUoe1xuXHRcdFx0bmFtZTogJ2J1aWxkci1wcm9qZWN0Jyxcblx0XHRcdGN3ZDogcGF0aFxuXHRcdH0pO1xuXG5cdFx0Ly8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBwcm9qZWN0J3MgZmlsZSBvcHRpb25zIGFuZCB0cmlnZ2VyIHRoZSBjb21waWxlciBpbml0LlxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLm9uRGlkQ2hhbmdlKCAnZmlsZXMnLCBfZGVib3VuY2UoIHRoaXMuaW5pdENvbXBpbGVyLCAxMDAgKSApO1xuXHR9XG5cblx0Ly8gUmVhZCB0aGUgZmlsZXMgaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5LlxuXHRnZXRGaWxlcyggcGF0aCApIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC51aS5sb2FkaW5nKCk7XG5cblx0XHRsZXQgZXhjbHVkZSA9IG5ldyBSZWdFeHAoIHRoaXMuc3RhdGUuaWdub3JlZC5qb2luKCd8JyksICdpJyApO1xuXG5cdFx0ZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSkudGhlbiggZnVuY3Rpb24oIGZpbGVzICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIGZpbGVzICkgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cdH1cblxuXHQvLyBJbml0aWFsaXplIHByb2plY3QuXG5cdGluaXRQcm9qZWN0KCBwYXRoICkge1xuXHRcdGZzLmFjY2VzcyggcGF0aCwgZnMuY29uc3RhbnRzLldfT0ssIGZ1bmN0aW9uKCBlcnIgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUgb3Igbm8gcGF0aCBwcm92aWRlZC5cblx0XHRcdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCByZWFkIHRoZSAke3BhdGh9IGRpcmVjdG9yeS5gICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG51bGw7XG5cblx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIHt9ICkgKTtcblxuXHRcdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBEaXJlY3RvcnkgaXMgcmVhZGFibGUsIGdldCBmaWxlcyBhbmQgc2V0dXAgY29uZmlnLlxuXHRcdFx0XHR0aGlzLmdldEZpbGVzKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApO1xuXG5cdFx0XHRcdC8vIENoYW5nZSBwcm9jZXNzIGN3ZC5cblx0XHRcdFx0cHJvY2Vzcy5jaGRpciggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXG5cdFx0Z2xvYmFsLmxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblx0fVxuXG5cdHJlbmRlclByb2plY3RTZWxlY3QoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxQcm9qZWN0U2VsZWN0XG5cdFx0XHRcdG5ld1Byb2plY3Q9eyB0aGlzLm5ld1Byb2plY3QgfVxuXHRcdFx0XHRjaGFuZ2VQcm9qZWN0PXsgdGhpcy5jaGFuZ2VQcm9qZWN0IH1cblx0XHRcdFx0cmVtb3ZlUHJvamVjdD17IHRoaXMucmVtb3ZlUHJvamVjdCB9XG5cdFx0XHRcdHJlZnJlc2hQcm9qZWN0PXsgdGhpcy5yZWZyZXNoUHJvamVjdCB9XG5cdFx0XHQvPlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJOb3RpY2VzKCkge1xuXHRcdGxldCBub3RpY2VzID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdG5vdGljZXMucHVzaCggKFxuXHRcdFx0XHQ8Tm90aWNlIGtleT0ncGF1c2VkJyB0eXBlPSd3YXJuaW5nJz5cblx0XHRcdFx0XHQ8cD5Qcm9qZWN0IGlzIHBhdXNlZC4gRmlsZXMgd2lsbCBub3QgYmUgd2F0Y2hlZCBhbmQgYXV0byBjb21waWxlZC48L3A+XG5cdFx0XHRcdDwvTm90aWNlPlxuXHRcdFx0KSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBub3RpY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLnByb2plY3RzIHx8IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdHMgeWV0LCBzaG93IHdlbGNvbWUgc2NyZWVuLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3dlbGNvbWUtc2NyZWVuJz5cblx0XHRcdFx0XHQ8aDM+WW91IGRvbid0IGhhdmUgYW55IHByb2plY3RzIHlldC48L2gzPlxuXHRcdFx0XHRcdDxwPldvdWxkIHlvdSBsaWtlIHRvIGFkZCBvbmUgbm93PzwvcD5cblx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzTmFtZT0nbGFyZ2UgZmxhdCBhZGQtbmV3LXByb2plY3QnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5BZGQgUHJvamVjdDwvYnV0dG9uPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdC8vIE5vIHByb2plY3Qgc2VsZWN0ZWQsIHNob3cgc2VsZWN0b3IuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0ncHJvamVjdC1zZWxlY3Qtc2NyZWVuJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0cyc+XG5cdFx0XHRcdDxkaXYgaWQ9J2hlYWRlcic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJOb3RpY2VzKCkgfVxuXG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMucHJvcHMuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PFBhbmVsIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdCxcblx0ZmlsZXM6IHN0YXRlLmFjdGl2ZVByb2plY3RGaWxlc1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRhZGRQcm9qZWN0OiBwcm9qZWN0ID0+IGRpc3BhdGNoKCBhZGRQcm9qZWN0KCBwcm9qZWN0ICkgKSxcblx0Y2hhbmdlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIGNoYW5nZVByb2plY3QoIGlkICkgKSxcblx0cmVtb3ZlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIHJlbW92ZVByb2plY3QoIGlkICkgKSxcblx0c2V0QWN0aXZlRmlsZTogZmlsZSA9PiBkaXNwYXRjaCggc2V0QWN0aXZlRmlsZSggZmlsZSApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFByb2plY3RzICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyB0aGUgc2V0dGluZ3MuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgU2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdzZXR0aW5ncy1zY3JlZW4nPlxuXHRcdFx0XHQ8aDM+U2V0dGluZ3M8L2gzPlxuXHRcdFx0XHQ8cD5Db21pbmcgc29vbiE8L3A+XG5cdFx0XHQ8L05vQ29udGVudD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVMaXN0RmlsZSA9IHJlcXVpcmUoJy4vRmlsZUxpc3RGaWxlJyk7XG5cbmNvbnN0IEZpbGVMaXN0RGlyZWN0b3J5ID0gcmVxdWlyZSgnLi9GaWxlTGlzdERpcmVjdG9yeScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgeyBzZXRBY3RpdmVGaWxlIH0gPSByZXF1aXJlKCcuLi8uLi8uLi9hY3Rpb25zJyk7XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zZXRBY3RpdmVGaWxlID0gdGhpcy5zZXRBY3RpdmVGaWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICcuc3ZnJzpcblx0XHRcdGNhc2UgJy5wbmcnOlxuXHRcdFx0Y2FzZSAnLmpwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnBocCc6XG5cdFx0XHRjYXNlICcuaHRtbCc6XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcuemlwJzpcblx0XHRcdGNhc2UgJy5yYXInOlxuXHRcdFx0Y2FzZSAnLnRhcic6XG5cdFx0XHRjYXNlICcuN3onOlxuXHRcdFx0Y2FzZSAnLmd6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRzZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgJiYgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQgPT09IGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRmaWxlUHJvcHMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICk7XG5cdH1cblxuXHRidWlsZFRyZWUoIGZpbGUsIGxldmVsID0gMCApIHtcblx0XHRsZXQgdHlwZSA9IGZpbGUudHlwZTtcblx0XHRsZXQgZXh0ID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbDtcblx0XHRsZXQgY2hpbGRyZW47XG5cblx0XHRpZiAoIGZpbGUudHlwZSA9PT0gJ2RpcmVjdG9yeScgKSB7XG5cdFx0XHRpZiAoIGZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0bGV0IGNoaWxkcmVuSXRlbXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gZmlsZS5jaGlsZHJlbiApIHtcblx0XHRcdFx0XHRjaGlsZHJlbkl0ZW1zLnB1c2goIHRoaXMuYnVpbGRUcmVlKCBmaWxlLmNoaWxkcmVuWyBjaGlsZCBdLCBsZXZlbCArIDEgKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2hpbGRyZW4gPSA8dWwgY2xhc3NOYW1lPSdjaGlsZHJlbicga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RGlyZWN0b3J5XG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGNoaWxkcmVuPXsgY2hpbGRyZW4gfVxuXHRcdFx0Lz47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdEZpbGVcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHR0eXBlPXsgdHlwZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRiYXNlPXsgdGhpcy5wcm9wcy5wYXRoIH1cblx0XHRcdFx0c2V0QWN0aXZlRmlsZT17IHRoaXMuc2V0QWN0aXZlRmlsZSB9XG5cdFx0XHQvPjtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5wcm9wcy5sb2FkaW5nICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2xvYWRpbmcnPlxuXHRcdFx0XHRcdDxwPkxvYWRpbmcmaGVsbGlwOzwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5ObyBwcm9qZWN0IGZvbGRlciBzZWxlY3RlZC48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuZmlsZXMgfHwgISBPYmplY3Qua2V5cyggdGhpcy5wcm9wcy5maWxlcyApLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm90aGluZyB0byBzZWUgaGVyZS48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiAmJiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5LlxuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyBmaWxlbGlzdCB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGVcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0c2V0QWN0aXZlRmlsZTogcGF5bG9hZCA9PiBkaXNwYXRjaCggc2V0QWN0aXZlRmlsZSggcGF5bG9hZCApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIEZpbGVMaXN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdERpcmVjdG9yeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRleHBhbmRlZDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgeyByZW1vdGUsIHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5jb25zdCB7IE1lbnUsIE1lbnVJdGVtIH0gPSByZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3RGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLm9uQ29udGV4dE1lbnUgPSB0aGlzLm9uQ29udGV4dE1lbnUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoe1xuXHRcdFx0ZmlsZTogdGhpcy5wcm9wcy5maWxlLFxuXHRcdFx0ZWxlbWVudDogZXZlbnQuY3VycmVudFRhcmdldFxuXHRcdH0pO1xuXHR9XG5cblx0b25Db250ZXh0TWVudSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlUGF0aCA9IHRoaXMucHJvcHMuZmlsZS5wYXRoO1xuXG5cdFx0bGV0IG1lbnUgPSBuZXcgTWVudSgpO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdPcGVuJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwub3Blbkl0ZW0oIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ1Nob3cgaW4gZm9sZGVyJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlciggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdHR5cGU6ICdzZXBhcmF0b3InXG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnRGVsZXRlJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0/YCApICkge1xuXHRcdFx0XHRcdGlmICggc2hlbGwubW92ZUl0ZW1Ub1RyYXNoKCBmaWxlUGF0aCApICkge1xuXHRcdFx0XHRcdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvZmlsZXMnKSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuYWxlcnQoIGBDb3VsZCBub3QgZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9LmAgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSkgKTtcblxuXHRcdG1lbnUucG9wdXAoIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpXG5cdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMudHlwZSB9XG5cdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRvbkNvbnRleHRNZW51PXsgdGhpcy5vbkNvbnRleHRNZW51IH1cblx0XHRcdD5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdEZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGJ1aWxkIG9wdGlvbnMgZm9yIGEgZmlsZS5cbiAqL1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoLCBmaWxlT3V0cHV0UGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZUNoYW5nZSA9IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmhhbmRsZUNvbXBpbGUgPSB0aGlzLmhhbmRsZUNvbXBpbGUuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2V0T3V0cHV0UGF0aCA9IHRoaXMuc2V0T3V0cHV0UGF0aC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMgKSB7XG5cdFx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2xvYmFsLmNvbXBpbGVyLmdldEZpbGVPcHRpb25zKCBuZXh0UHJvcHMuZmlsZSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IGNvbXBpbGVPcHRpb25zLnR5cGUsXG5cdFx0XHRmaWxlVHlwZTogY29tcGlsZU9wdGlvbnMuZmlsZVR5cGUsXG5cdFx0XHRidWlsZFRhc2tOYW1lOiBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lLFxuXHRcdFx0b3B0aW9uczogRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5iYXNlLCBuZXh0UHJvcHMuZmlsZSApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRPcHRpb25zRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRsZXQgY2ZpbGUgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApO1xuXG5cdFx0cmV0dXJuICggY2ZpbGUgJiYgY2ZpbGUub3B0aW9ucyApID8gY2ZpbGUub3B0aW9ucyA6IHt9O1xuXHR9XG5cblx0c3RhdGljIGdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGlmICggZmlsZSAmJiBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBiYXNlLCBmaWxlLnBhdGggKSApO1xuXG5cdFx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0XHRsZXQgY2ZpbGUgPSBmaWxlcy5maW5kKCBjZmlsZSA9PiBjZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0XHRpZiAoIGNmaWxlICkge1xuXHRcdFx0XHRyZXR1cm4gY2ZpbGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0Q29uZmlnKCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRsZXQgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXRoOiBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICksXG5cdFx0XHRvdXRwdXQ6IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSxcblx0XHRcdG9wdGlvbnM6IHt9XG5cdFx0fTtcblxuXHRcdGxldCBzdG9yZWQgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUgKTtcblxuXHRcdGxldCBjb25maWcgPSAoIHN0b3JlZCAhPT0gZmFsc2UgKSA/IHN0b3JlZCA6IGRlZmF1bHRzO1xuXG5cdFx0aWYgKCBwcm9wZXJ0eSApIHtcblx0XHRcdHJldHVybiAoIGNvbmZpZ1sgcHJvcGVydHkgXSApID8gY29uZmlnWyBwcm9wZXJ0eSBdIDogZGVmYXVsdFZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY29uZmlnO1xuXHRcdH1cblx0fVxuXG5cdHNldENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRcdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyB8fCAhIHByb3BlcnR5ICkge1xuXHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlndXJhdGlvbi4nICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSApO1xuXG5cdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdGxldCBmaWxlSW5kZXggPSBmaWxlcy5maW5kSW5kZXgoIGZpbGUgPT4gZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0aWYgKCBmaWxlSW5kZXggPT09IC0xICkge1xuXHRcdFx0bGV0IGZpbGVDb25maWcgPSB7XG5cdFx0XHRcdHBhdGg6IGZpbGVQYXRoLFxuXHRcdFx0XHR0eXBlOiB0aGlzLnN0YXRlLmZpbGVUeXBlLFxuXHRcdFx0XHRvdXRwdXQ6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpIClcblx0XHRcdH07XG5cblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcblx0XHRcdFx0ZmlsZUNvbmZpZ1sgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0ZmlsZXMucHVzaCggZmlsZUNvbmZpZyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHRcdGRlbGV0ZSBmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcuc2V0KCAnZmlsZXMnLCBmaWxlcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9uKCBvcHRpb24sIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLm9wdGlvbnMgJiYgdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRzZXRPcHRpb24oIG9wdGlvbiwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gcHJldlN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IHZhbHVlO1xuXG5cdFx0XHRyZXR1cm4geyBvcHRpb25zIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCB0aGlzLnN0YXRlLm9wdGlvbnMgKTtcblx0XHR9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggZXZlbnQsIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0T3B0aW9uKCBldmVudC50YXJnZXQubmFtZSwgdmFsdWUgKTtcblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlLCB0aGlzLm91dHB1dFN1ZmZpeCwgdGhpcy5vdXRwdXRFeHRlbnNpb24gKTtcblx0fVxuXG5cdHNldE91dHB1dFBhdGgoIGV2ZW50LCBwYXRoICkge1xuXHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgcGF0aCApO1xuXHR9XG5cblx0Z2V0T3V0cHV0UGF0aCggdHlwZSA9ICdyZWxhdGl2ZScgKSB7XG5cdFx0bGV0IHNsYXNoUGF0aCA9ICggdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aCA9ICggdHlwZSA9PT0gJ3JlbGF0aXZlJyB8fCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCk7XG5cdFx0bGV0IG91dHB1dFBhdGggPSB0aGlzLmdldENvbmZpZyggJ291dHB1dCcsIGRlZmF1bHRQYXRoICk7XG5cblx0XHRpZiAoIHJlbGF0aXZlUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggc2xhc2hQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IHNsYXNoKCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFBhdGg7XG5cdH1cblxuXHRoYW5kbGVDb21waWxlKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdGZ1bmN0aW9uKCBjb2RlICkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJIZWFkZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckZvb3RlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2Zvb3Rlcic+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRjbGFzc05hbWU9J2NvbXBpbGUgZ3JlZW4nXG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTY3JpcHQgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuanMnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdKYXZhU2NyaXB0JywgZXh0ZW5zaW9uczogWyAnanMnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRzb3VyY2VNYXBzRGlzYWJsZWQoKSB7XG5cdFx0cmV0dXJuICggISB0aGlzLnN0YXRlLm9wdGlvbnMgfHwgKCAhIHRoaXMuc3RhdGUub3B0aW9ucy5idW5kbGUgJiYgISB0aGlzLnN0YXRlLm9wdGlvbnMuYmFiZWwgKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXNjcmlwdCc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdjb21wcmVzcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU2NyaXB0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHN0eWxlc2hlZXQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTZWxlY3QgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTZWxlY3QnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlcyBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5jc3MnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdDU1MnLCBleHRlbnNpb25zOiBbICdjc3MnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRpc1BhcnRpYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHRcdDxwPlRoaXMgaXMgYSBwYXJ0aWFsIGZpbGUsPGJyIC8+IGl0IGNhbm5vdCBiZSBjb21waWxlZCBvbiBpdHMgb3duLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5zZXRPdXRwdXRQYXRoIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS50eXBlID09PSAnc2FzcycgJiZcblx0XHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBTdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc3R5bGUnLCAnbmVzdGVkJyApIH1cblx0XHRcdFx0XHRcdFx0b3B0aW9ucz17IHtcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wcmVzc2VkOiAnQ29tcHJlc3NlZCdcblx0XHRcdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b3ByZWZpeGVyJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlcztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBzaG93aW5nIG5vdGljZXMgYW5kIGFsZXJ0cy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE5vdGljZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRsZXQgdHlwZSA9IHRoaXMucHJvcHMudHlwZSB8fCAnaW5mbyc7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9eyAnbm90aWNlIHR5cGUtJyArIHR5cGUgfT5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpY2U7XG4iLCIvKipcbiAqIEBmaWxlIFJvb3QgcmVkdWNlci5cbiAqL1xuXG5jb25zdCB7IGNvbWJpbmVSZWR1Y2VycyB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3QgdmlldyA9ICggY3VycmVudCA9ICdmaWxlcycsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1ZJRVcnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi52aWV3O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gY3VycmVudDtcblx0fVxufTtcblxuY29uc3QgeyBwcm9qZWN0cywgYWN0aXZlUHJvamVjdCwgYWN0aXZlUHJvamVjdEZpbGVzIH0gPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG5cbmNvbnN0IGFjdGl2ZUZpbGUgPSAoIGZpbGUgPSBudWxsLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1NFVF9BQ1RJVkVfRklMRSc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcblx0dmlldyxcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlcyxcblx0YWN0aXZlRmlsZVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIFByb2plY3RzIHJlZHVjZXIuXG4gKi9cblxubGV0IGluaXRpYWxQcm9qZWN0cyA9IFtdO1xuXG5pZiAoIGdsb2JhbC5jb25maWcuaGFzKCdwcm9qZWN0cycpICkge1xuXHRpbml0aWFsUHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcbn1cblxuY29uc3QgcHJvamVjdHMgPSAoIHByb2plY3RzID0gaW5pdGlhbFByb2plY3RzLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0FERF9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdC4uLnByb2plY3RzLFxuXHRcdFx0XHRhY3Rpb24ucGF5bG9hZFxuXHRcdFx0XTtcblx0XHRjYXNlICdSRU1PVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMuZmlsdGVyKCAoIHByb2plY3QsIGluZGV4ICkgPT4gaW5kZXggIT09IGFjdGlvbi5pZCApO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHM7XG5cdH1cbn07XG5cbmxldCBpbml0aWFsQWN0aXZlID0ge1xuXHRpZDogbnVsbCxcblx0bmFtZTogJycsXG5cdHBhdGg6ICcnLFxuXHRwYXVzZWQ6IGZhbHNlXG59O1xuXG5pZiAoIGluaXRpYWxQcm9qZWN0cy5sZW5ndGggJiYgZ2xvYmFsLmNvbmZpZy5oYXMoJ2FjdGl2ZS1wcm9qZWN0JykgKSB7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggaW5pdGlhbFByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdGluaXRpYWxBY3RpdmUgPSBpbml0aWFsUHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0aW5pdGlhbEFjdGl2ZS5pZCA9IGFjdGl2ZUluZGV4O1xuXHR9XG59XG5cbmNvbnN0IGFjdGl2ZVByb2plY3QgPSAoIGFjdGl2ZSA9IGluaXRpYWxBY3RpdmUsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGNhc2UgJ1NFVF9QUk9KRUNUX1NUQVRFJzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0Li4uYWN0aW9uLnBheWxvYWRcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBhY3RpdmU7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3RGaWxlcyA9ICggZmlsZXMgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdSRUNFSVZFX0ZJTEVTJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGVzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG92ZXJsYXksXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRsZXQgcHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdHByb2plY3RzWyBhY3RpdmVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWcuJyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUgKSB7XG5cdGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcblxuXHRmb3IgKCB2YXIgZGVwZW5kZW5jeSBpbiBkZXBlbmRlbmN5VHJlZSApIHtcblx0XHRkZXBlbmRlbmNpZXMucHVzaCggZGVwZW5kZW5jeSApO1xuXG5cdFx0aWYgKCBPYmplY3Qua2V5cyggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMuY29uY2F0KCBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKSApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkZXBlbmRlbmNpZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGVlcCxcblx0c2V0UHJvamVjdENvbmZpZyxcblx0Z2V0RGVwZW5kZW5jeUFycmF5XG59O1xuIl19
