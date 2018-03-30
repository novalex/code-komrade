(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* jshint esversion:6 */

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs'));
var PATH = require('path');

var React = require('react');
var ReactDOM = require('react-dom');

function directoryTree(path) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	// If current path is included, reset depth counter.
	if (options.include === path) {
		depth = 0;
	}

	// If max depth was reached, bail.
	if (options.depth && depth > options.depth) {
		return null;
	}

	var name = PATH.basename(path);
	var item = { path: path, name: name };

	var stats = void 0;

	try {
		stats = fs.statSync(path);
	} catch (err) {
		// console.log( err );
		return null;
	}

	// Skip if it matches the exclude regex.
	if (options && options.exclude && (options.exclude.test(path) || options.exclude.test(name))) {
		return null;
	}

	if (stats.isFile()) {
		var ext = PATH.extname(path).toLowerCase();

		// Skip if it does not match the extension regex.
		if (options && options.extensions && !options.extensions.test(ext)) {
			return null;
		}

		// item.size = stats.size; // File size in bytes.
		item.extension = ext;
		item.type = 'file';
	} else if (stats.isDirectory()) {
		var files = {};

		try {
			files = fs.readdirSync(path);
		} catch (err) {
			if (err.code === 'EACCES') {
				// User does not have permissions, ignore directory.
				return null;
			} else {
				throw err;
			}
		}

		if (files === null) {
			return null;
		}

		item.children = files.map(function (child) {
			return directoryTree(PATH.join(path, child), options, depth + 1);
		}).filter(function (e) {
			return !!e;
		});
		// item.size = item.children.reduce( ( prev, cur ) => {
		// 	console.log( prev, cur.size );
		// 	return prev + cur.size;
		// }, 0 );
		item.type = 'directory';
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}

	return item;
}

Object.resolve = function (path, obj) {
	var props = path.split('.'),
	    obpath = '';

	for (var i = 0; i < props.length; i++) {
		if (0 === i) {
			obpath = 'children';
		} else {
			obpath += '.' + props[i] + '.children';
		}
	}

	return obpath.split('.').reduce(function (prev, curr) {
		return prev ? prev[curr] : undefined;
	}, obj || self);
};

var FileList = function (_React$Component) {
	_inherits(FileList, _React$Component);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

		_this.state = {
			path: '',
			files: {},
			ignored: ['.git', 'node_modules', '.DS_Store']
		};

		_this.dirClick = _this.dirClick.bind(_this);
		_this.fileClick = _this.fileClick.bind(_this);
		return _this;
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

			if (null !== ext) {
				ext = ext.replace('.', '');
			}

			switch (ext) {
				case 'svg':
				case 'png':
				case 'jpg':
					type = 'media';
					break;

				case 'php':
				case 'html':
				case 'css':
				case 'scss':
				case 'js':
				case 'json':
					type = 'code';
					break;

				case 'zip':
				case 'rar':
				case 'tar':
				case '7z':
				case 'gz':
					type = 'zip';
					break;

				default:
					type = 'text';
					break;
			}

			return type;
		}
	}, {
		key: 'setPath',
		value: function setPath(path) {
			if (path === this.state.path) {
				return;
			}

			this.setState({
				path: path,
				files: this.walkDirectory(path)
			});
		}
	}, {
		key: 'walkDirectory',
		value: function walkDirectory(path) {
			var include = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			return directoryTree(path, {
				// depth: 2,
				exclude: new RegExp(this.state.ignored.join('|'), 'i')
				// include: include,
			});
		}
	}, {
		key: 'dirClick',
		value: function dirClick(event) {
			// event.persist();
			event.stopPropagation();

			var element = event.currentTarget;

			element.classList.toggle('expand');

			if (element.dataset.lazyload) {
				// Load the files in this directory.
				this.setState({
					files: this.walkDirectory(this.state.path, element.dataset.lazyload)
				});

				delete element.dataset.lazyload;
			}
		}
	}, {
		key: 'fileClick',
		value: function fileClick(event) {
			event.persist();
		}
	}, {
		key: 'buildTree',
		value: function buildTree(file) {
			var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
			var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			var type = file.type,
			    ext = file.extension || null,
			    onClick = void 0,
			    lazyload = void 0,
			    children = void 0;

			// Skip ignored files.
			// if ( this.isFileIgnored( file.name ) ) {
			// 	return null;
			// }

			if ('directory' === file.type) {
				if (file.children.length > 0) {
					var childrenItems = [];

					for (var child in file.children) {
						if (index) {
							index += '.' + child;
						} else {
							index = child;
						}

						// console.log( Object.resolve( index, this.state.files ) );

						childrenItems.push(this.buildTree(file.children[child], level + 1, index));
					}

					children = React.createElement(
						'ul',
						{ className: 'children', key: file.path + '-children' },
						childrenItems
					);
				} else {
					lazyload = file.path;
				}

				onClick = this.dirClick;
			} else {
				type = this.getMimeType(ext);
				onClick = this.fileClick;
			}

			return React.createElement(
				'li',
				{ className: type, key: file.path, 'data-lazyload': lazyload, onClick: onClick },
				React.createElement(
					'div',
					{ className: 'filename' },
					String.fromCharCode('0x2003').repeat(level),
					React.createElement('span', { className: 'icon' }),
					React.createElement(
						'strong',
						null,
						file.name
					)
				),
				children
			);
		}
	}, {
		key: 'renderTree',
		value: function renderTree() {
			if (!this.state.path) {
				return React.createElement(
					'li',
					{ className: 'empty' },
					'No path specified'
				);
			} else if (!this.state.files) {
				return React.createElement(
					'li',
					{ className: 'empty' },
					'No files'
				);
			}

			var filelist = [];

			// console.log( this.state.files );

			// Show only the contents of the directory.
			if (this.state.files.children) {
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

},{"bluebird":undefined,"fs":undefined,"path":undefined,"react":undefined,"react-dom":undefined}],2:[function(require,module,exports){
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
		key: 'componentDidMount',
		value: function componentDidMount() {
			// this._FileList.setPath( this.state.active.path );
		}
	}, {
		key: 'setFileList',
		value: function setFileList(FileList) {
			this._FileList = FileList;
		}
	}, {
		key: 'toggleSelect',
		value: function toggleSelect() {
			this.setState(function (prevState) {
				document.getElementById('wrap').classList.toggle('unfocus', !prevState.isOpen);

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

},{"electron":undefined,"path":undefined,"react":undefined}],3:[function(require,module,exports){
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

// let projects = [
// 	{ name: 'Buildr', path: 'E:/Apps/Buildr' },
// 	{ name: 'NTN', path: 'E:/Sites/NTN' },
// 	{ name: 'MSO', path: 'E:/Sites/MSO' },
// ];

// let active = {
// 	name: 'Buildr',
// 	path: 'E:/Apps/Buildr',
// };

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

		if (_this.props.config) {
			projects = _this.props.config.get('projects');

			var activeIndex = _this.props.config.get('active-project');

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
			this.props.config.set('projects', projects);
		}
	}, {
		key: 'saveActiveProject',
		value: function saveActiveProject(index) {
			this.props.config.set('active-project', index);
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
						projects: this.state.projects,
						active: this.state.active,
						ref: function ref(child) {
							_this2._ProjectSelect = child;
						},
						saveProjects: this.saveProjects,
						saveActiveProject: this.saveActiveProject
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

},{"./FileList":1,"./ProjectSelect":2,"react":undefined}],4:[function(require,module,exports){
'use strict';

/* jshint esversion: 6, multistr: true */

var Store = require('electron-store');
var config = new Store({
	name: 'buildr-config'
});

var React = require('react');
var ReactDOM = require('react-dom');

var Projects = require('./components/Projects');

ReactDOM.render(React.createElement(Projects, { config: config }), document.getElementById('app'));

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

},{"./components/Projects":3,"electron-store":undefined,"react":undefined,"react-dom":undefined}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qcyIsImFwcC9qcy9jb21wb25lbnRzL1Byb2plY3RTZWxlY3QuanMiLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qcyIsImFwcC9qcy9yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7QUFFQSxJQUFNLFVBQVUsUUFBUSxVQUFSLENBQWhCO0FBQ0EsSUFBTSxLQUFLLFFBQVEsWUFBUixDQUFzQixRQUFRLElBQVIsQ0FBdEIsQ0FBWDtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLFNBQVMsYUFBVCxDQUF3QixJQUF4QixFQUF3RDtBQUFBLEtBQTFCLE9BQTBCLHVFQUFoQixFQUFnQjtBQUFBLEtBQVosS0FBWSx1RUFBSixDQUFJOztBQUN2RDtBQUNBLEtBQUssUUFBUSxPQUFSLEtBQW9CLElBQXpCLEVBQWdDO0FBQy9CLFVBQVEsQ0FBUjtBQUNBOztBQUVEO0FBQ0EsS0FBSyxRQUFRLEtBQVIsSUFBaUIsUUFBUSxRQUFRLEtBQXRDLEVBQThDO0FBQzdDLFNBQU8sSUFBUDtBQUNBOztBQUVELEtBQU0sT0FBTyxLQUFLLFFBQUwsQ0FBZSxJQUFmLENBQWI7QUFDQSxLQUFNLE9BQU8sRUFBRSxVQUFGLEVBQVEsVUFBUixFQUFiOztBQUVBLEtBQUksY0FBSjs7QUFFQSxLQUFJO0FBQ0gsVUFBUSxHQUFHLFFBQUgsQ0FBWSxJQUFaLENBQVI7QUFDQSxFQUZELENBRUUsT0FBTyxHQUFQLEVBQWE7QUFDZDtBQUNBLFNBQU8sSUFBUDtBQUNBOztBQUVEO0FBQ0EsS0FBSyxXQUFXLFFBQVEsT0FBbkIsS0FBZ0MsUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQXNC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QVMsTUFBbkIsR0FERCxFQUVDLFNBQVMsY0FBVCxDQUF3QixLQUF4QixDQUZEOztBQUtBOztBQUVBO0FBQ0EsSUFBTSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFqQjtBQUNBOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMkIsYUFBM0IsRUFBMEMsVUFBVSxLQUFWLEVBQWtCO0FBQzNELEtBQUksZUFBZSxNQUFNLE1BQXpCOztBQUVBLEtBQUssYUFBYSxPQUFiLEtBQXlCLElBQTlCLEVBQXFDO0FBQ3BDLGlCQUFlLE1BQU0sTUFBTixDQUFhLE9BQWIsQ0FBcUIsSUFBckIsQ0FBZjtBQUNBOztBQUVELEtBQUssYUFBYSxPQUFiLENBQXFCLElBQTFCLEVBQWlDO0FBQ2hDLFVBQVEsR0FBUixDQUFhLEtBQUssS0FBTCxDQUFZLG1CQUFvQixhQUFhLE9BQWIsQ0FBcUIsSUFBekMsQ0FBWixDQUFiO0FBQ0E7QUFDRCxDQVZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOjYgKi9cblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwoIHJlcXVpcmUoJ2ZzJykgKTtcbmNvbnN0IFBBVEggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHQvLyBJZiBjdXJyZW50IHBhdGggaXMgaW5jbHVkZWQsIHJlc2V0IGRlcHRoIGNvdW50ZXIuXG5cdGlmICggb3B0aW9ucy5pbmNsdWRlID09PSBwYXRoICkge1xuXHRcdGRlcHRoID0gMDtcblx0fVxuXG5cdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IG5hbWUgPSBQQVRILmJhc2VuYW1lKCBwYXRoICk7XG5cdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRsZXQgc3RhdHM7XG5cblx0dHJ5IHtcblx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHR9IGNhdGNoKCBlcnIgKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0cmV0dXJuIG51bGw7ICBcblx0fVxuXG5cdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0Y29uc3QgZXh0ID0gUEFUSC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblx0XHRcblx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0bGV0IGZpbGVzID0ge307XG5cblx0XHR0cnkge1xuXHRcdFx0ZmlsZXMgPSBmcy5yZWFkZGlyU3luYyggcGF0aCApO1xuXHRcdH0gY2F0Y2goIGVyciApIHtcblx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggZmlsZXMgPT09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRpdGVtLmNoaWxkcmVuID0gZmlsZXNcblx0XHRcdC5tYXAoIGNoaWxkID0+IGRpcmVjdG9yeVRyZWUoIFBBVEguam9pbiggcGF0aCwgY2hpbGQgKSwgb3B0aW9ucywgZGVwdGggKyAxICkgKVxuXHRcdFx0LmZpbHRlciggZSA9PiAhIWUgKTtcblx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0Ly8gfSwgMCApO1xuXHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdH1cblxuXHRyZXR1cm4gaXRlbTtcbn1cblxuT2JqZWN0LnJlc29sdmUgPSBmdW5jdGlvbiggcGF0aCwgb2JqICkge1xuXHRsZXQgcHJvcHMgPSBwYXRoLnNwbGl0KCcuJyksXG5cdFx0b2JwYXRoID0gJyc7XG5cblx0Zm9yICggdmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKysgKSB7XG5cdFx0aWYgKCAwID09PSBpICkge1xuXHRcdFx0b2JwYXRoID0gJ2NoaWxkcmVuJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0b2JwYXRoICs9ICcuJyArIHByb3BzWyBpIF0gKyAnLmNoaWxkcmVuJztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb2JwYXRoLnNwbGl0KCcuJykucmVkdWNlKCBmdW5jdGlvbiggcHJldiwgY3VyciApIHtcblx0XHRyZXR1cm4gKCBwcmV2ICkgPyBwcmV2WyBjdXJyIF0gOiB1bmRlZmluZWRcblx0fSwgb2JqIHx8IHNlbGYgKTtcbn07XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0ZmlsZXM6IHt9LFxuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJyxcblx0XHRcdF1cblx0XHR9O1xuXG5cdFx0dGhpcy5kaXJDbGljayAgPSB0aGlzLmRpckNsaWNrLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmZpbGVDbGljayA9IHRoaXMuZmlsZUNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5wYXRoICkge1xuXHRcdFx0dGhpcy5zZXRQYXRoKCB0aGlzLnByb3BzLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHRpc0ZpbGVJZ25vcmVkKCBmaWxlbmFtZSApIHtcblx0XHRmb3IgKCB2YXIgaSA9IHRoaXMuc3RhdGUuaWdub3JlZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblx0XHRcdGlmICggZmlsZW5hbWUgPT09IHRoaXMuc3RhdGUuaWdub3JlZFsgaSBdICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXRNaW1lVHlwZSggZXh0ICkge1xuXHRcdGxldCB0eXBlO1xuXG5cdFx0aWYgKCBudWxsICE9PSBleHQgKSB7XG5cdFx0XHRleHQgPSBleHQucmVwbGFjZSggJy4nLCAnJyApO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJ3N2Zyc6XG5cdFx0XHRjYXNlICdwbmcnOlxuXHRcdFx0Y2FzZSAnanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdwaHAnOlxuXHRcdFx0Y2FzZSAnaHRtbCc6XG5cdFx0XHRjYXNlICdjc3MnOlxuXHRcdFx0Y2FzZSAnc2Nzcyc6XG5cdFx0XHRjYXNlICdqcyc6XG5cdFx0XHRjYXNlICdqc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3ppcCc6XG5cdFx0XHRjYXNlICdyYXInOlxuXHRcdFx0Y2FzZSAndGFyJzpcblx0XHRcdGNhc2UgJzd6Jzpcblx0XHRcdGNhc2UgJ2d6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRzZXRQYXRoKCBwYXRoICkge1xuXHRcdGlmICggcGF0aCA9PT0gdGhpcy5zdGF0ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cGF0aDogcGF0aCxcblx0XHRcdGZpbGVzOiB0aGlzLndhbGtEaXJlY3RvcnkoIHBhdGggKSxcblx0XHR9KTtcblx0fVxuXG5cdHdhbGtEaXJlY3RvcnkoIHBhdGgsIGluY2x1ZGUgPSBudWxsICkge1xuXHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGU6IG5ldyBSZWdFeHAoIHRoaXMuc3RhdGUuaWdub3JlZC5qb2luKCd8JyksICdpJyApLFxuXHRcdFx0Ly8gaW5jbHVkZTogaW5jbHVkZSxcblx0XHR9ICk7XG5cdH1cblxuXHRkaXJDbGljayggZXZlbnQgKSB7XG5cdFx0Ly8gZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHRsZXQgZWxlbWVudCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG5cblx0XHRlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2V4cGFuZCcpO1xuXG5cdFx0aWYgKCBlbGVtZW50LmRhdGFzZXQubGF6eWxvYWQgKSB7XG5cdFx0XHQvLyBMb2FkIHRoZSBmaWxlcyBpbiB0aGlzIGRpcmVjdG9yeS5cblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmaWxlczogdGhpcy53YWxrRGlyZWN0b3J5KCB0aGlzLnN0YXRlLnBhdGgsIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZCApLFxuXHRcdFx0fSk7XG5cblx0XHRcdGRlbGV0ZSBlbGVtZW50LmRhdGFzZXQubGF6eWxvYWQ7XG5cdFx0fVxuXHR9XG5cblx0ZmlsZUNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdH1cblxuXHRidWlsZFRyZWUoIGZpbGUsIGxldmVsID0gMCwgaW5kZXggPSBudWxsICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlLFxuXHRcdFx0ZXh0ICA9IGZpbGUuZXh0ZW5zaW9uIHx8IG51bGwsXG5cdFx0XHRvbkNsaWNrLFxuXHRcdFx0bGF6eWxvYWQsXG5cdFx0XHRjaGlsZHJlbjtcblxuXHRcdC8vIFNraXAgaWdub3JlZCBmaWxlcy5cblx0XHQvLyBpZiAoIHRoaXMuaXNGaWxlSWdub3JlZCggZmlsZS5uYW1lICkgKSB7XG5cdFx0Ly8gXHRyZXR1cm4gbnVsbDtcblx0XHQvLyB9XG5cblx0XHRpZiAoICdkaXJlY3RvcnknID09PSBmaWxlLnR5cGUgKSB7XG5cdFx0XHRpZiAoIGZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0bGV0IGNoaWxkcmVuSXRlbXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gZmlsZS5jaGlsZHJlbiApIHtcblx0XHRcdFx0XHRpZiAoIGluZGV4ICkge1xuXHRcdFx0XHRcdFx0aW5kZXggKz0gJy4nICsgY2hpbGQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gY2hpbGQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coIE9iamVjdC5yZXNvbHZlKCBpbmRleCwgdGhpcy5zdGF0ZS5maWxlcyApICk7XG5cblx0XHRcdFx0XHRjaGlsZHJlbkl0ZW1zLnB1c2goIHRoaXMuYnVpbGRUcmVlKCBmaWxlLmNoaWxkcmVuWyBjaGlsZCBdLCBsZXZlbCArIDEsIGluZGV4ICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT1cImNoaWxkcmVuXCIga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGF6eWxvYWQgPSBmaWxlLnBhdGg7XG5cdFx0XHR9XG5cblx0XHRcdG9uQ2xpY2sgPSB0aGlzLmRpckNsaWNrO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gdGhpcy5nZXRNaW1lVHlwZSggZXh0ICk7XG5cdFx0XHRvbkNsaWNrID0gdGhpcy5maWxlQ2xpY2s7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyB0eXBlIH0ga2V5PXsgZmlsZS5wYXRoIH0gZGF0YS1sYXp5bG9hZD17IGxhenlsb2FkIH0gb25DbGljaz17IG9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmaWxlbmFtZVwiPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCBsZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJpY29uXCI+PC9zcGFuPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyBmaWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyBjaGlsZHJlbiB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJUcmVlKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gPGxpIGNsYXNzTmFtZT1cImVtcHR5XCI+Tm8gcGF0aCBzcGVjaWZpZWQ8L2xpPjtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuc3RhdGUuZmlsZXMgKSB7XG5cdFx0XHRyZXR1cm4gPGxpIGNsYXNzTmFtZT1cImVtcHR5XCI+Tm8gZmlsZXM8L2xpPjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdC8vIGNvbnNvbGUubG9nKCB0aGlzLnN0YXRlLmZpbGVzICk7XG5cblx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMuc3RhdGUuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbGlzdDtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPVwiZmlsZXNcIj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0X0ZpbGVMaXN0OiBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46ICAgZmFsc2UsXG5cdFx0XHRhY3RpdmU6ICAgcHJvcHMuYWN0aXZlLFxuXHRcdFx0cHJvamVjdHM6IHByb3BzLnByb2plY3RzXG5cdFx0fTtcblxuXHRcdHRoaXMubmV3UHJvamVjdCAgICA9IHRoaXMubmV3UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHQvLyB0aGlzLl9GaWxlTGlzdC5zZXRQYXRoKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHRzZXRGaWxlTGlzdCggRmlsZUxpc3QgKSB7XG5cdFx0dGhpcy5fRmlsZUxpc3QgPSBGaWxlTGlzdDtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXAnKS5jbGFzc0xpc3QudG9nZ2xlKCAndW5mb2N1cycsICEgcHJldlN0YXRlLmlzT3BlbiApO1xuXG5cdFx0XHRyZXR1cm4geyBpc09wZW46ICEgcHJldlN0YXRlLmlzT3BlbiB9O1xuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0KCk7XG5cdH1cblxuXHRjaGFuZ2VQcm9qZWN0KCBpbmRleCApIHtcblx0XHR0aGlzLnByb3BzLnNhdmVBY3RpdmVQcm9qZWN0KCBpbmRleCApO1xuXG5cdFx0dGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggdGhpcy5zdGF0ZS5wcm9qZWN0c1sgaW5kZXggXS5wYXRoICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgYWN0aXZlOiB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdIH0pO1xuXHR9XG5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHR0aGlzLl9GaWxlTGlzdC5zZXRQYXRoKCBwYXRoWzBdICk7XG5cblx0XHRcdGxldCBwcm9qZWN0ID0ge1xuXHRcdFx0XHRuYW1lOiBmc3BhdGguYmFzZW5hbWUoIHBhdGhbMF0gKSxcblx0XHRcdFx0cGF0aDogcGF0aFswXVxuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdFx0bGV0IHByb2plY3RzID0gcHJldlN0YXRlLnByb2plY3RzO1xuXG5cdFx0XHRcdHByb2plY3RzLnB1c2goIHByb2plY3QgKTtcblxuXHRcdFx0XHR0aGlzLnByb3BzLnNhdmVQcm9qZWN0cyggcHJvamVjdHMgKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5zYXZlQWN0aXZlUHJvamVjdCggcHJvamVjdHMubGVuZ3RoIC0gMSApO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0YWN0aXZlOiBwcm9qZWN0LFxuXHRcdFx0XHRcdHByb2plY3RzXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5zdGF0ZS5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gYWRkIG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5zdGF0ZS5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCB2aWV3IChwcm9qZWN0IHNlbGVjdG9yIGFuZCBmaWxldHJlZSkuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSgnLi9Qcm9qZWN0U2VsZWN0Jyk7XG5cbmNvbnN0IEZpbGVMaXN0ID0gcmVxdWlyZSgnLi9GaWxlTGlzdCcpO1xuXG4vLyBsZXQgcHJvamVjdHMgPSBbXG4vLyBcdHsgbmFtZTogJ0J1aWxkcicsIHBhdGg6ICdFOi9BcHBzL0J1aWxkcicgfSxcbi8vIFx0eyBuYW1lOiAnTlROJywgcGF0aDogJ0U6L1NpdGVzL05UTicgfSxcbi8vIFx0eyBuYW1lOiAnTVNPJywgcGF0aDogJ0U6L1NpdGVzL01TTycgfSxcbi8vIF07XG5cbi8vIGxldCBhY3RpdmUgPSB7XG4vLyBcdG5hbWU6ICdCdWlsZHInLFxuLy8gXHRwYXRoOiAnRTovQXBwcy9CdWlsZHInLFxuLy8gfTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRfUHJvamVjdFNlbGVjdDogUHJvamVjdFNlbGVjdDtcblx0X1Byb2plY3RGaWxlTGlzdDogRmlsZUxpc3Q7XG5cblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gW107XG5cdFx0bGV0IGFjdGl2ZSAgID0ge1xuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRwYXRoOiAnJ1xuXHRcdH07XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuY29uZmlnICkge1xuXHRcdFx0cHJvamVjdHMgPSB0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdFx0YWN0aXZlID0gcHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHByb2plY3RzLFxuXHRcdFx0YWN0aXZlXG5cdFx0fTtcblxuXHRcdHRoaXMuc2F2ZVByb2plY3RzICAgICAgPSB0aGlzLnNhdmVQcm9qZWN0cy5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zYXZlQWN0aXZlUHJvamVjdCA9IHRoaXMuc2F2ZUFjdGl2ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5fUHJvamVjdFNlbGVjdC5zZXRGaWxlTGlzdCggdGhpcy5fUHJvamVjdEZpbGVMaXN0ICk7XG5cdH1cblxuXHRzYXZlUHJvamVjdHMoIHByb2plY3RzICkge1xuXHRcdHRoaXMucHJvcHMuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fVxuXG5cdHNhdmVBY3RpdmVQcm9qZWN0KCBpbmRleCApIHtcblx0XHR0aGlzLnByb3BzLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGluZGV4ICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdGFjdGl2ZT17IHRoaXMuc3RhdGUuYWN0aXZlIH1cblx0XHRcdFx0XHRcdHJlZj17ICggY2hpbGQgKSA9PiB7IHRoaXMuX1Byb2plY3RTZWxlY3QgPSBjaGlsZDsgfSB9XG5cdFx0XHRcdFx0XHRzYXZlUHJvamVjdHM9eyB0aGlzLnNhdmVQcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzYXZlQWN0aXZlUHJvamVjdD17IHRoaXMuc2F2ZUFjdGl2ZVByb2plY3QgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdHJlZj17ICggY2hpbGQgKSA9PiB7IHRoaXMuX1Byb2plY3RGaWxlTGlzdCA9IGNoaWxkOyB9IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvUmVhY3QuRnJhZ21lbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RzO1xuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiwgbXVsdGlzdHI6IHRydWUgKi9cblxuY29uc3QgU3RvcmUgID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcbmNvbnN0IGNvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdG5hbWU6ICdidWlsZHItY29uZmlnJ1xufSk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1Byb2plY3RzJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb2plY3RzIGNvbmZpZz17IGNvbmZpZyB9IC8+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbik7XG5cbi8vIHJlcXVpcmUoICcuL3BsdWdpbnMvdmVsb2NpdHkubWluLmpzJyApO1xuXG4vLyBDb250ZXh0IG1lbnUuXG5jb25zdCBmaWxlTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpO1xuLy8gY29uc3QgZmlsZW5hbWVzID0gZmlsZUxpc3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG5cbmZpbGVMaXN0LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0bGV0IGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldDtcblxuXHRpZiAoIGZpbGVOYW1lQ29udC50YWdOYW1lICE9PSAnbGknICkge1xuXHRcdGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdsaScpO1xuXHR9XG5cblx0aWYgKCBmaWxlTmFtZUNvbnQuZGF0YXNldC5maWxlICkge1xuXHRcdGNvbnNvbGUubG9nKCBKU09OLnBhcnNlKCBkZWNvZGVVUklDb21wb25lbnQoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSApICk7XG5cdH1cbn0pO1xuIl19
