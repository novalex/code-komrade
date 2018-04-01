(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var React = require('react');

var ReactDOM = require('react-dom');

var FileOptionsScript = require('./FileOptionsScript');

var FileOptionsStylesheet = require('./FileOptionsStylesheet');

var globalUI = require('../helpers/globalUI');

var directoryTree = require('../helpers/directoryTree');

var FileListFile = function (_React$Component) {
	_inherits(FileListFile, _React$Component);

	function FileListFile(props) {
		_classCallCheck(this, FileListFile);

		var _this = _possibleConstructorReturn(this, (FileListFile.__proto__ || Object.getPrototypeOf(FileListFile)).call(this, props));

		_this.onClick = _this.onClick.bind(_this);

		if (_this.props.file.name === 'gulpfile.js') {
			var _FileOptions = _this.getOptions(_this.props.file);

			if (!_FileOptions) {
				globalUI.offCanvas(false);
				return _possibleConstructorReturn(_this);
			}

			ReactDOM.render(_FileOptions, document.getElementById('off-canvas'));

			globalUI.offCanvas(true);
		}
		return _this;
	}

	_createClass(FileListFile, [{
		key: 'getOptions',
		value: function getOptions(file) {
			if (!file.extension) {
				return null;
			}

			switch (file.extension) {
				case '.scss':
				case '.sass':
				case '.less':
					return React.createElement(FileOptionsStylesheet, { file: file });
				case '.js':
				case '.ts':
				case '.jsx':
					return React.createElement(FileOptionsScript, { file: file });
				default:
					return null;
			}
		}
	}, {
		key: 'onClick',
		value: function onClick(event) {
			event.stopPropagation();

			var _FileOptions = this.getOptions(this.props.file);

			if (!_FileOptions) {
				globalUI.offCanvas(false);
				return;
			}

			ReactDOM.render(_FileOptions, document.getElementById('off-canvas'));

			globalUI.offCanvas(true, document.getElementById('files'));
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'li',
				{ className: this.props.type, onClick: this.onClick },
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

function FileListPlaceholder(props) {
	return React.createElement(
		'li',
		{ className: props.type + ' informative' },
		React.createElement(
			'div',
			{ className: 'inner' },
			props.children
		)
	);
}

var FileListDirectory = function (_React$Component2) {
	_inherits(FileListDirectory, _React$Component2);

	function FileListDirectory(props) {
		_classCallCheck(this, FileListDirectory);

		var _this2 = _possibleConstructorReturn(this, (FileListDirectory.__proto__ || Object.getPrototypeOf(FileListDirectory)).call(this, props));

		_this2.state = {
			expanded: false
		};

		_this2.onClick = _this2.onClick.bind(_this2);
		return _this2;
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

			globalUI.offCanvas(false);

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

var FileList = function (_React$Component3) {
	_inherits(FileList, _React$Component3);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this3 = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

		_this3.state = {
			path: '',
			files: {},
			ignored: ['.git', 'node_modules', '.DS_Store'],
			loading: false
		};
		return _this3;
	}

	_createClass(FileList, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (this.props.path) {
				this.setPath(this.props.path);
			}
		}
	}, {
		key: 'isFileIgnored',
		value: function isFileIgnored(filename) {
			for (var i = this.state.ignored.length - 1; i >= 0; i--) {
				if (filename === this.state.ignored[i]) {
					return true;
				}
			}

			return false;
		}
	}, {
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
		key: 'walkDirectory',
		value: function walkDirectory(path) {
			var exclude = new RegExp(this.state.ignored.join('|'), 'i');

			return directoryTree(path, {
				// depth: 2,
				exclude: exclude
			});
		}
	}, {
		key: 'setPath',
		value: function setPath(path) {
			if (path === this.state.path) {
				return;
			}

			this.setState({ loading: true });

			globalUI.loading();

			this.walkDirectory(path).then(function (files) {
				this.setState({
					path: path,
					files: files,
					loading: false
				});

				globalUI.loading(false);
			}.bind(this));
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
					level: level
				});
			}
		}
	}, {
		key: 'renderTree',
		value: function renderTree() {
			if (this.state.loading) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'loading' },
					'Loading \u2026'
				);
			} else if (!this.state.path) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'empty' },
					'No folder selected.'
				);
			} else if (!this.state.files) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'empty' },
					'Nothing to see here.'
				);
			}

			var filelist = [];

			if (this.state.files.children && this.state.files.children.length > 0) {
				// Show only the contents of the top-level directory.
				for (var child in this.state.files.children) {
					filelist.push(this.buildTree(this.state.files.children[child]));
				}
			} else {
				filelist.push(this.buildTree(this.state.files));
			}

			return filelist;
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'ul',
				{ id: 'files' },
				this.renderTree()
			);
		}
	}]);

	return FileList;
}(React.Component);

module.exports = FileList;

},{"../helpers/directoryTree":9,"../helpers/globalUI":10,"./FileOptionsScript":3,"./FileOptionsStylesheet":4,"react":undefined,"react-dom":undefined}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering build options for a file.
 */

var React = require('react');

var FileOptions = function (_React$Component) {
	_inherits(FileOptions, _React$Component);

	function FileOptions() {
		_classCallCheck(this, FileOptions);

		return _possibleConstructorReturn(this, (FileOptions.__proto__ || Object.getPrototypeOf(FileOptions)).apply(this, arguments));
	}

	_createClass(FileOptions, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'file-options' },
				this.props.children
			);
		}
	}]);

	return FileOptions;
}(React.Component);

module.exports = FileOptions;

},{"react":undefined}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('./fields/FieldSwitch');

var FileOptionsScript = function (_React$Component) {
	_inherits(FileOptionsScript, _React$Component);

	function FileOptionsScript() {
		_classCallCheck(this, FileOptionsScript);

		return _possibleConstructorReturn(this, (FileOptionsScript.__proto__ || Object.getPrototypeOf(FileOptionsScript)).apply(this, arguments));
	}

	_createClass(FileOptionsScript, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				FileOptions,
				null,
				React.createElement(
					'div',
					{ className: 'header' },
					React.createElement(
						'strong',
						null,
						this.props.file.name
					)
				),
				React.createElement(
					'div',
					{ className: 'body' },
					React.createElement(FieldSwitch, {
						value: '1',
						current: '0',
						name: 'autocompile',
						label: 'Auto compile',
						labelPos: 'left'
					}),
					React.createElement(FieldSwitch, {
						value: '1',
						current: '1',
						name: 'babel',
						label: 'Babel',
						labelPos: 'left'
					})
				)
			);
		}
	}]);

	return FileOptionsScript;
}(React.Component);

module.exports = FileOptionsScript;

},{"./FileOptions":2,"./fields/FieldSwitch":8,"react":undefined}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('./fields/FieldSwitch');

var FileOptionsStylesheet = function (_React$Component) {
	_inherits(FileOptionsStylesheet, _React$Component);

	function FileOptionsStylesheet() {
		_classCallCheck(this, FileOptionsStylesheet);

		return _possibleConstructorReturn(this, (FileOptionsStylesheet.__proto__ || Object.getPrototypeOf(FileOptionsStylesheet)).apply(this, arguments));
	}

	_createClass(FileOptionsStylesheet, [{
		key: 'isPartial',
		value: function isPartial(file) {
			return file.name.startsWith('_');
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isPartial(this.props.file)) {
				return React.createElement(
					FileOptions,
					null,
					React.createElement(
						'div',
						{ className: 'header' },
						React.createElement(
							'strong',
							null,
							this.props.file.name
						)
					),
					React.createElement(
						'div',
						{ className: 'body' },
						React.createElement(
							'p',
							null,
							'This is a partial file, it cannot be compiled by itself.'
						)
					)
				);
			}

			return React.createElement(
				FileOptions,
				null,
				React.createElement(
					'div',
					{ className: 'header' },
					React.createElement(
						'strong',
						null,
						this.props.file.name
					)
				),
				React.createElement(
					'div',
					{ className: 'body' },
					React.createElement(FieldSwitch, {
						value: '1',
						current: '0',
						name: 'autocompile',
						label: 'Auto compile',
						labelPos: 'left'
					})
				)
			);
		}
	}]);

	return FileOptionsStylesheet;
}(React.Component);

module.exports = FileOptionsStylesheet;

},{"./FileOptions":2,"./fields/FieldSwitch":8,"react":undefined}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the project selector.
 */

var dialog = require('electron').remote.dialog;

var fspath = require('path');

var React = require('react');

var globalUI = require('../helpers/globalUI');

var ProjectSelect = function (_React$Component) {
	_inherits(ProjectSelect, _React$Component);

	function ProjectSelect(props) {
		_classCallCheck(this, ProjectSelect);

		var _this = _possibleConstructorReturn(this, (ProjectSelect.__proto__ || Object.getPrototypeOf(ProjectSelect)).call(this, props));

		_this.state = {
			isOpen: false,
			active: props.active,
			projects: props.projects
		};

		_this.newProject = _this.newProject.bind(_this);
		_this.toggleSelect = _this.toggleSelect.bind(_this);
		_this.selectProject = _this.selectProject.bind(_this);
		return _this;
	}

	_createClass(ProjectSelect, [{
		key: 'setFileList',
		value: function setFileList(FileList) {
			this._FileList = FileList;
		}
	}, {
		key: 'toggleSelect',
		value: function toggleSelect() {
			this.setState(function (prevState) {
				globalUI.unfocus(!prevState.isOpen);

				return { isOpen: !prevState.isOpen };
			});
		}
	}, {
		key: 'selectProject',
		value: function selectProject(event) {
			event.persist();
			var index = event.currentTarget.dataset.project;

			if (index === 'new') {
				this.newProject();
			} else {
				this.changeProject(index);
			}

			this.toggleSelect();
		}
	}, {
		key: 'changeProject',
		value: function changeProject(index) {
			this.props.saveActiveProject(index);

			this._FileList.setPath(this.state.projects[index].path);

			this.setState({ active: this.state.projects[index] });
		}
	}, {
		key: 'newProject',
		value: function newProject() {
			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				this._FileList.setPath(path[0]);

				var project = {
					name: fspath.basename(path[0]),
					path: path[0]
				};

				this.setState(function (prevState) {
					var projects = prevState.projects;

					projects.push(project);

					this.props.saveProjects(projects);
					this.props.saveActiveProject(projects.length - 1);

					return {
						active: project,
						projects: projects
					};
				});
			}
		}
	}, {
		key: 'renderChoices',
		value: function renderChoices() {
			var choices = [];

			for (var index in this.state.projects) {
				choices.push(React.createElement(
					'div',
					{ key: index, 'data-project': index, onClick: this.selectProject },
					this.state.projects[index].name
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
			if (!this.state.active.name || !this.state.active.path) {
				return React.createElement(
					'div',
					{ id: 'project-select' },
					React.createElement(
						'div',
						{ id: 'project-active', onClick: this.newProject },
						React.createElement(
							'h1',
							null,
							'No Project Selected'
						),
						React.createElement(
							'h2',
							null,
							'Click here to add one...'
						)
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'project-select' },
				React.createElement(
					'div',
					{ id: 'project-active', onClick: this.toggleSelect },
					React.createElement(
						'h1',
						null,
						this.state.active.name
					),
					React.createElement(
						'h2',
						null,
						this.state.active.path
					)
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

module.exports = ProjectSelect;

},{"../helpers/globalUI":10,"electron":undefined,"path":undefined,"react":undefined}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the project view (project selector and filetree).
 */

var React = require('react');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('./FileList');

var Projects = function (_React$Component) {
	_inherits(Projects, _React$Component);

	function Projects(props) {
		_classCallCheck(this, Projects);

		var _this = _possibleConstructorReturn(this, (Projects.__proto__ || Object.getPrototypeOf(Projects)).call(this, props));

		var projects = [];
		var active = {
			name: '',
			path: ''
		};

		if (window.config) {
			projects = window.config.get('projects');

			var activeIndex = window.config.get('active-project');

			if (projects[activeIndex]) {
				active = projects[activeIndex];
			}
		}

		_this.state = {
			projects: projects,
			active: active
		};

		_this.saveProjects = _this.saveProjects.bind(_this);
		_this.saveActiveProject = _this.saveActiveProject.bind(_this);
		return _this;
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this._ProjectSelect.setFileList(this._ProjectFileList);
		}
	}, {
		key: 'saveProjects',
		value: function saveProjects(projects) {
			window.config.set('projects', projects);
		}
	}, {
		key: 'saveActiveProject',
		value: function saveActiveProject(index) {
			window.config.set('active-project', index);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			return React.createElement(
				React.Fragment,
				null,
				React.createElement(
					'div',
					{ id: 'header' },
					React.createElement(ProjectSelect, {
						active: this.state.active,
						projects: this.state.projects,
						saveProjects: this.saveProjects,
						saveActiveProject: this.saveActiveProject,
						ref: function ref(child) {
							_this2._ProjectSelect = child;
						}
					})
				),
				React.createElement(
					'div',
					{ id: 'content' },
					React.createElement(FileList, {
						path: this.state.active.path,
						ref: function ref(child) {
							_this2._ProjectFileList = child;
						}
					})
				)
			);
		}
	}]);

	return Projects;
}(React.Component);

module.exports = Projects;

},{"./FileList":1,"./ProjectSelect":5,"react":undefined}],7:[function(require,module,exports){
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

},{"react":undefined}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var Field = require('./Field');

var FieldSwitch = function (_React$Component) {
	_inherits(FieldSwitch, _React$Component);

	function FieldSwitch(props) {
		_classCallCheck(this, FieldSwitch);

		var _this = _possibleConstructorReturn(this, (FieldSwitch.__proto__ || Object.getPrototypeOf(FieldSwitch)).call(this, props));

		_this.state = {
			checked: _this.props.current && _this.props.current === _this.props.value
		};

		_this.onChange = _this.onChange.bind(_this);
		return _this;
	}

	_createClass(FieldSwitch, [{
		key: 'onChange',
		value: function onChange(event) {
			this.setState(function (prevState) {
				return { checked: !prevState.checked };
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
					onChange: this.onChange,
					name: this.props.name,
					value: this.props.value,
					checked: this.state.checked,
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

module.exports = FieldSwitch;

},{"./Field":7,"react":undefined}],9:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],10:[function(require,module,exports){
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

function offCanvas() {
	var toggle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	var exclude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	document.body.classList.toggle('off-canvas', toggle);

	if (toggle) {
		removeFocus(document.getElementById('off-canvas'), 'off-canvas', exclude);
	}
}

function removeFocus(element, className) {
	var exclude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var outsideClickListener = function outsideClickListener(event) {
		if (!element.contains(event.target)) {
			removeClickListener();

			if (!exclude || !exclude.contains(event.target)) {
				document.body.classList.remove(className);
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
	offCanvas: offCanvas,
	removeFocus: removeFocus
};

},{}],11:[function(require,module,exports){
'use strict';

/* jshint esversion: 6, multistr: true */

var Store = require('electron-store');

window.config = new Store({
	name: 'buildr-config'
});

var React = require('react');
var ReactDOM = require('react-dom');

var Projects = require('./components/Projects');

ReactDOM.render(React.createElement(Projects, null), document.getElementById('app'));

// require( './plugins/velocity.min.js' );

// Context menu.
var fileList = document.getElementById('files');
// const filenames = fileList.getElementsByTagName('li');

fileList.addEventListener('contextmenu', function (event) {
	var fileNameCont = event.target;

	if (fileNameCont.tagName !== 'li') {
		fileNameCont = event.target.closest('li');
	}

	if (fileNameCont.dataset.file) {
		console.log(JSON.parse(decodeURIComponent(fileNameCont.dataset.file)));
	}
});

},{"./components/Projects":6,"electron-store":undefined,"react":undefined,"react-dom":undefined}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9GaWxlT3B0aW9ucy5qc3giLCJhcHAvanMvY29tcG9uZW50cy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9GaWxlT3B0aW9uc1N0eWxlc2hlZXQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvUHJvamVjdFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU3dpdGNoLmpzeCIsImFwcC9qcy9oZWxwZXJzL2RpcmVjdG9yeVRyZWUuanMiLCJhcHAvanMvaGVscGVycy9nbG9iYWxVSS5qcyIsImFwcC9qcy9yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLElBQU0sb0JBQW9CLFFBQVEscUJBQVIsQ0FBMUI7O0FBRUEsSUFBTSx3QkFBd0IsUUFBUSx5QkFBUixDQUE5Qjs7QUFFQSxJQUFNLFdBQVcsUUFBUSxxQkFBUixDQUFqQjs7QUFFQSxJQUFNLGdCQUFnQixRQUFRLDBCQUFSLENBQXRCOztJQUVNLFk7OztBQUNMLHVCQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSwwSEFDYixLQURhOztBQUdwQixRQUFLLE9BQUwsR0FBZSxNQUFLLE9BQUwsQ0FBYSxJQUFiLE9BQWY7O0FBRUEsTUFBSyxNQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQWhCLEtBQXlCLGFBQTlCLEVBQThDO0FBQzdDLE9BQUksZUFBZSxNQUFLLFVBQUwsQ0FBaUIsTUFB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V0FBUixDQUFqQjs7QUFFQSxJQUFNLFdBQVcsUUFBUSx1QkFBUixDQUFqQjs7QUFFQSxTQUFTLE1BQVQsQ0FDQyxvQkFBQyxRQUFELE9BREQsRUFFQyxTQUFTLGNBQVQsQ0FBd0IsS0FBeEIsQ0FGRDs7QUFLQTs7QUFFQTtBQUNBLElBQU0sV0FBVyxTQUFTLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBakI7QUFDQTs7QUFFQSxTQUFTLGdCQUFULENBQTJCLGFBQTNCLEVBQTBDLFVBQVUsS0FBVixFQUFrQjtBQUMzRCxLQUFJLGVBQWUsTUFBTSxNQUF6Qjs7QUFFQSxLQUFLLGFBQWEsT0FBYixLQUF5QixJQUE5QixFQUFxQztBQUNwQyxpQkFBZSxNQUFNLE1BQU4sQ0FBYSxPQUFiLENBQXFCLElBQXJCLENBQWY7QUFDQTs7QUFFRCxLQUFLLGFBQWEsT0FBYixDQUFxQixJQUExQixFQUFpQztBQUNoQyxVQUFRLEdBQVIsQ0FBYSxLQUFLLEtBQUwsQ0FBWSxtQkFBb0IsYUFBYSxPQUFiLENBQXFCLElBQXpDLENBQVosQ0FBYjtBQUNBO0FBQ0QsQ0FWRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGVzaGVldCA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnNTdHlsZXNoZWV0Jyk7XG5cbmNvbnN0IGdsb2JhbFVJID0gcmVxdWlyZSgnLi4vaGVscGVycy9nbG9iYWxVSScpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vaGVscGVycy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZS5uYW1lID09PSAnZ3VscGZpbGUuanMnICkge1xuXHRcdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRcdGlmICggISBfRmlsZU9wdGlvbnMgKSB7XG5cdFx0XHRcdGdsb2JhbFVJLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRcdF9GaWxlT3B0aW9ucyxcblx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29mZi1jYW52YXMnKVxuXHRcdFx0KTtcblxuXHRcdFx0Z2xvYmFsVUkub2ZmQ2FudmFzKCB0cnVlICk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3B0aW9ucyggZmlsZSApIHtcblx0XHRpZiAoICEgZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1N0eWxlc2hlZXQgZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsVUkub2ZmQ2FudmFzKCBmYWxzZSApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdFJlYWN0RE9NLnJlbmRlcihcblx0XHRcdF9GaWxlT3B0aW9ucyxcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmYtY2FudmFzJylcblx0XHQpO1xuXG5cdFx0Z2xvYmFsVUkub2ZmQ2FudmFzKCB0cnVlLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZXMnKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBGaWxlTGlzdFBsYWNlaG9sZGVyKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8bGkgY2xhc3NOYW1lPXsgcHJvcHMudHlwZSArICcgaW5mb3JtYXRpdmUnIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPnsgcHJvcHMuY2hpbGRyZW4gfTwvZGl2PlxuXHRcdDwvbGk+XG5cdCk7XG59XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0Z2xvYmFsVUkub2ZmQ2FudmFzKCBmYWxzZSApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRmaWxlczoge30sXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFBhdGgoIHRoaXMucHJvcHMucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdGlzRmlsZUlnbm9yZWQoIGZpbGVuYW1lICkge1xuXHRcdGZvciAoIHZhciBpID0gdGhpcy5zdGF0ZS5pZ25vcmVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0aWYgKCBmaWxlbmFtZSA9PT0gdGhpcy5zdGF0ZS5pZ25vcmVkWyBpIF0gKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICcuc3ZnJzpcblx0XHRcdGNhc2UgJy5wbmcnOlxuXHRcdFx0Y2FzZSAnLmpwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnBocCc6XG5cdFx0XHRjYXNlICcuaHRtbCc6XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcuemlwJzpcblx0XHRcdGNhc2UgJy5yYXInOlxuXHRcdFx0Y2FzZSAnLnRhcic6XG5cdFx0XHRjYXNlICcuN3onOlxuXHRcdFx0Y2FzZSAnLmd6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHR3YWxrRGlyZWN0b3J5KCBwYXRoICkge1xuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSk7XG5cdH1cblxuXHRzZXRQYXRoKCBwYXRoICkge1xuXHRcdGlmICggcGF0aCA9PT0gdGhpcy5zdGF0ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsVUkubG9hZGluZygpO1xuXG5cdFx0dGhpcy53YWxrRGlyZWN0b3J5KCBwYXRoICkudGhlbiggZnVuY3Rpb24oIGZpbGVzICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdHBhdGgsXG5cdFx0XHRcdGZpbGVzLFxuXHRcdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbFVJLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCA9IDAgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGU7XG5cdFx0bGV0IGV4dCAgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHQvPjtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJUcmVlKCkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5sb2FkaW5nICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0TG9hZGluZyAmaGVsbGlwO1xuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5zdGF0ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nZW1wdHknPlxuXHRcdFx0XHRcdE5vIGZvbGRlciBzZWxlY3RlZC5cblx0XHRcdFx0PC9GaWxlTGlzdFBsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuc3RhdGUuZmlsZXMgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm90aGluZyB0byBzZWUgaGVyZS5cblx0XHRcdFx0PC9GaWxlTGlzdFBsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5maWxlcy5jaGlsZHJlbiAmJiB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5LlxuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMuc3RhdGUuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbGlzdDtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPSdmaWxlcyc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJUcmVlKCkgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGJ1aWxkIG9wdGlvbnMgZm9yIGEgZmlsZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpbGVPcHRpb25zPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0dmFsdWU9JzEnXG5cdFx0XHRcdFx0XHRjdXJyZW50PScwJ1xuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBjb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0dmFsdWU9JzEnXG5cdFx0XHRcdFx0XHRjdXJyZW50PScxJ1xuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvRmlsZU9wdGlvbnM+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU2NyaXB0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlc2hlZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRpc1BhcnRpYWwoIGZpbGUgKSB7XG5cdFx0cmV0dXJuIGZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCB0aGlzLmlzUGFydGlhbCggdGhpcy5wcm9wcy5maWxlICkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZU9wdGlvbnM+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHRcdDxwPlRoaXMgaXMgYSBwYXJ0aWFsIGZpbGUsIGl0IGNhbm5vdCBiZSBjb21waWxlZCBieSBpdHNlbGYuPC9wPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L0ZpbGVPcHRpb25zPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpbGVPcHRpb25zPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0dmFsdWU9JzEnXG5cdFx0XHRcdFx0XHRjdXJyZW50PScwJ1xuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBjb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0ZpbGVPcHRpb25zPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlc2hlZXQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgZ2xvYmFsVUkgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2dsb2JhbFVJJyk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRfRmlsZUxpc3Q6IG51bGw7XG5cblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogICBmYWxzZSxcblx0XHRcdGFjdGl2ZTogICBwcm9wcy5hY3RpdmUsXG5cdFx0XHRwcm9qZWN0czogcHJvcHMucHJvamVjdHNcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ICAgID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCAgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHNldEZpbGVMaXN0KCBGaWxlTGlzdCApIHtcblx0XHR0aGlzLl9GaWxlTGlzdCA9IEZpbGVMaXN0O1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRnbG9iYWxVSS51bmZvY3VzKCAhIHByZXZTdGF0ZS5pc09wZW4gKTtcblxuXHRcdFx0cmV0dXJuIHsgaXNPcGVuOiAhIHByZXZTdGF0ZS5pc09wZW4gfTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXHR9XG5cblx0Y2hhbmdlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0dGhpcy5wcm9wcy5zYXZlQWN0aXZlUHJvamVjdCggaW5kZXggKTtcblxuXHRcdHRoaXMuX0ZpbGVMaXN0LnNldFBhdGgoIHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF0ucGF0aCApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZTogdGhpcy5zdGF0ZS5wcm9qZWN0c1sgaW5kZXggXSB9KTtcblx0fVxuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0dGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggcGF0aFswXSApO1xuXG5cdFx0XHRsZXQgcHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF1cblx0XHRcdH07XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRcdGxldCBwcm9qZWN0cyA9IHByZXZTdGF0ZS5wcm9qZWN0cztcblxuXHRcdFx0XHRwcm9qZWN0cy5wdXNoKCBwcm9qZWN0ICk7XG5cblx0XHRcdFx0dGhpcy5wcm9wcy5zYXZlUHJvamVjdHMoIHByb2plY3RzICk7XG5cdFx0XHRcdHRoaXMucHJvcHMuc2F2ZUFjdGl2ZVByb2plY3QoIHByb2plY3RzLmxlbmd0aCAtIDEgKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGFjdGl2ZTogcHJvamVjdCxcblx0XHRcdFx0XHRwcm9qZWN0c1xuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMuc3RhdGUucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5hY3RpdmUubmFtZSB8fCAhIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIGFkZCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMuc3RhdGUuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3QgdmlldyAocHJvamVjdCBzZWxlY3RvciBhbmQgZmlsZXRyZWUpLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vRmlsZUxpc3QnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRfUHJvamVjdFNlbGVjdDogbnVsbDtcblx0X1Byb2plY3RGaWxlTGlzdDogbnVsbDtcblxuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSBbXTtcblx0XHRsZXQgYWN0aXZlICAgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnXG5cdFx0fTtcblxuXHRcdGlmICggd2luZG93LmNvbmZpZyApIHtcblx0XHRcdHByb2plY3RzID0gd2luZG93LmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IHdpbmRvdy5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdFx0XHRpZiAoIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0XHRhY3RpdmUgPSBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cHJvamVjdHMsXG5cdFx0XHRhY3RpdmVcblx0XHR9O1xuXG5cdFx0dGhpcy5zYXZlUHJvamVjdHMgICAgICA9IHRoaXMuc2F2ZVByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNhdmVBY3RpdmVQcm9qZWN0ID0gdGhpcy5zYXZlQWN0aXZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLl9Qcm9qZWN0U2VsZWN0LnNldEZpbGVMaXN0KCB0aGlzLl9Qcm9qZWN0RmlsZUxpc3QgKTtcblx0fVxuXG5cdHNhdmVQcm9qZWN0cyggcHJvamVjdHMgKSB7XG5cdFx0d2luZG93LmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH1cblxuXHRzYXZlQWN0aXZlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0d2luZG93LmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGluZGV4ICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNhdmVQcm9qZWN0cz17IHRoaXMuc2F2ZVByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNhdmVBY3RpdmVQcm9qZWN0PXsgdGhpcy5zYXZlQWN0aXZlUHJvamVjdCB9XG5cdFx0XHRcdFx0XHRyZWY9eyAoIGNoaWxkICkgPT4geyB0aGlzLl9Qcm9qZWN0U2VsZWN0ID0gY2hpbGQ7IH0gfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdHJlZj17ICggY2hpbGQgKSA9PiB7IHRoaXMuX1Byb2plY3RGaWxlTGlzdCA9IGNoaWxkOyB9IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvUmVhY3QuRnJhZ21lbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGNoZWNrZWQ6ICggdGhpcy5wcm9wcy5jdXJyZW50ICYmIHRoaXMucHJvcHMuY3VycmVudCA9PT0gdGhpcy5wcm9wcy52YWx1ZSApXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBjaGVja2VkOiAhIHByZXZTdGF0ZS5jaGVja2VkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZX1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5zdGF0ZS5jaGVja2VkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU3dpdGNoO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG9mZkNhbnZhcyggdG9nZ2xlID0gdHJ1ZSwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ29mZi1jYW52YXMnLCB0b2dnbGUgKTtcblxuXHRpZiAoIHRvZ2dsZSApIHtcblx0XHRyZW1vdmVGb2N1cyhcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmYtY2FudmFzJyksXG5cdFx0XHQnb2ZmLWNhbnZhcycsXG5cdFx0XHRleGNsdWRlXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG9mZkNhbnZhcyxcblx0cmVtb3ZlRm9jdXNcbn07XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2LCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG5jb25zdCBTdG9yZSAgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG53aW5kb3cuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUHJvamVjdHMnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvamVjdHMgLz4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKVxuKTtcblxuLy8gcmVxdWlyZSggJy4vcGx1Z2lucy92ZWxvY2l0eS5taW4uanMnICk7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGVzJyk7XG4vLyBjb25zdCBmaWxlbmFtZXMgPSBmaWxlTGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRsZXQgZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0O1xuXG5cdGlmICggZmlsZU5hbWVDb250LnRhZ05hbWUgIT09ICdsaScgKSB7XG5cdFx0ZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cdH1cblxuXHRpZiAoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSB7XG5cdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UoIGRlY29kZVVSSUNvbXBvbmVudCggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG4iXX0=
