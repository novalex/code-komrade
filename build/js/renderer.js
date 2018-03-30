(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var Promise = require('bluebird');

var React = require('react');

var directoryTree = require('../helpers/directoryTree.js');

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

			if (ext !== null) {
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

			var files = this.walkDirectory(path);

			console.log(files);

			this.setState({
				path: path,
				files: files
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

			var type = file.type;
			var ext = file.extension || null;
			var onClick = void 0;
			var lazyload = void 0;
			var children = void 0;

			// Skip ignored files.
			// if ( this.isFileIgnored( file.name ) ) {
			// 	return null;
			// }

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

},{"../helpers/directoryTree.js":4,"bluebird":undefined,"react":undefined}],2:[function(require,module,exports){
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

/**
 * @file Walk a directory and return the files and folders as an object.
 */

var Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));

var fspath = require('path');

function directoryTree(path) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	// If max depth was reached, bail.
	if (options.depth && depth > options.depth) {
		return null;
	}

	var name = fspath.basename(path);
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
		item.type = 'file';

		var ext = fspath.extname(path).toLowerCase();

		// Skip if it does not match the extension regex.
		if (options && options.extensions && !options.extensions.test(ext)) {
			return null;
		}

		// item.size = stats.size; // File size in bytes.
		item.extension = ext;

		return item;
	} else if (stats.isDirectory()) {
		item.type = 'directory';

		fs.readdir(path, function (err, files) {
			if (err) {
				if (err.code === 'EACCES') {
					// User does not have permissions, ignore directory.
					return null;
				} else {
					throw err;
				}
			}

			item.children = [];

			for (var i = 0; i < files.length; i++) {
				item.children.push(directoryTree(fspath.join(path, files[i]), options, depth + 1));
			}

			return item;
		});

		// item.size = item.children.reduce( ( prev, cur ) => {
		// 	console.log( prev, cur.size );
		// 	return prev + cur.size;
		// }, 0 );
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}
}

module.exports = directoryTree;

},{"bluebird":undefined,"fs":undefined,"path":undefined}],5:[function(require,module,exports){
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

},{"./components/Projects":3,"electron-store":undefined,"react":undefined,"react-dom":undefined}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qcyIsImFwcC9qcy9jb21wb25lbnRzL1Byb2plY3RTZWxlY3QuanMiLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qcyIsImFwcC9qcy9oZWxwZXJzL2RpcmVjdG9yeVRyZWUuanMiLCJhcHAvanMvcmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUE7Ozs7QUFJQSxJQUFNLFVBQVUsUUFBUSxVQUFSLENBQWhCOztBQUVBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLGdCQUFnQixRQUFRLDZCQUFSLENBQXRCOztJQUVNLFE7OztBQUNMLG1CQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSxrSEFDYixLQURhOztBQUdwQixRQUFLLEtBQUwsR0FBYTtBQUNaLFNBQU0sRUFETTtBQUVaLFVBQU8sRUFGSztBQUdaLFlBQVMsQ0FDUixNQURRLEVBRVIsY0FGUSxFQUdSLFdBSFE7QUFIRyxHQUFiOztBQVVBLFFBQUssUUFBTCxHQUFpQixNQUFLLFFBQUwsQ0FBYyxJQUFkLE9BQWpCO0FBQ0EsUUFBSyxTQUFMLEdBQWlCLE1BQUssU0FBTCxDQUFlLElBQWYsT0FBakI7QUFkb0I7QUFlcEI7Ozs7c0NBRW1CO0FBQ25CLE9BQUssS0FBSyxLQUFMLENBQVcsSUFBaEIsRUFBdUI7QUFDdEIsU0FBSyxPQUFMLENBQWMsS0FBSyxLQUFMLENBQVcsSUFBekI7QUFDQTtBQUNEOzs7Z0NBRWMsUSxFQUFXO0FBQ3pCLFFBQU0sSUFBSSxJQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBMUMsRUFBNkMsS0FBSyxDQUFsRCxFQUFxRCxHQUFyRCxFQUEyRDtBQUMxRCxRQUFLLGFBQWEsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFvQixDQUFwQixDQUFsQixFQUE0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RCxRQUFRLENBQWpFLENBQXBCO0FBQ0E7O0FBRUQsVUFBTyxJQUFQO0FBQ0EsR0FqQkQ7O0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUExQk0sTUEwQkE7QUFDTixTQUFPLElBQVAsQ0FETSxDQUNPO0FBQ2I7QUFDRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsYUFBakI7Ozs7O0FDOUVBOztBQUVBLElBQU0sUUFBUyxRQUFRLGdCQUFSLENBQWY7QUFDQSxJQUFNLFNBQVMsSUFBSSxLQUFKLENBQVU7QUFDeEIsT0FBTTtBQURrQixDQUFWLENBQWY7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxXQUFXLFFBQVEsV0FBUixDQUFqQjs7QUFFQSxJQUFNLFdBQVcsUUFBUSx1QkFBUixDQUFqQjs7QUFFQSxTQUFTLE1BQVQsQ0FDQyxvQkFBQyxRQUFELElBQVUsUUFBUyxNQUFuQixHQURELEVBRUMsU0FBUyxjQUFULENBQXdCLEtBQXhCLENBRkQ7O0FBS0E7O0FBRUE7QUFDQSxJQUFNLFdBQVcsU0FBUyxjQUFULENBQXdCLE9BQXhCLENBQWpCO0FBQ0E7O0FBRUEsU0FBUyxnQkFBVCxDQUEyQixhQUEzQixFQUEwQyxVQUFVLEtBQVYsRUFBa0I7QUFDM0QsS0FBSSxlQUFlLE1BQU0sTUFBekI7O0FBRUEsS0FBSyxhQUFhLE9BQWIsS0FBeUIsSUFBOUIsRUFBcUM7QUFDcEMsaUJBQWUsTUFBTSxNQUFOLENBQWEsT0FBYixDQUFxQixJQUFyQixDQUFmO0FBQ0E7O0FBRUQsS0FBSyxhQUFhLE9BQWIsQ0FBcUIsSUFBMUIsRUFBaUM7QUFDaEMsVUFBUSxHQUFSLENBQWEsS0FBSyxLQUFMLENBQVksbUJBQW9CLGFBQWEsT0FBYixDQUFxQixJQUF6QyxDQUFaLENBQWI7QUFDQTtBQUNELENBVkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vaGVscGVycy9kaXJlY3RvcnlUcmVlLmpzJyk7XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6ICcnLFxuXHRcdFx0ZmlsZXM6IHt9LFxuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJ1xuXHRcdFx0XVxuXHRcdH07XG5cblx0XHR0aGlzLmRpckNsaWNrICA9IHRoaXMuZGlyQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMuZmlsZUNsaWNrID0gdGhpcy5maWxlQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFBhdGgoIHRoaXMucHJvcHMucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdGlzRmlsZUlnbm9yZWQoIGZpbGVuYW1lICkge1xuXHRcdGZvciAoIHZhciBpID0gdGhpcy5zdGF0ZS5pZ25vcmVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0aWYgKCBmaWxlbmFtZSA9PT0gdGhpcy5zdGF0ZS5pZ25vcmVkWyBpIF0gKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRpZiAoIGV4dCAhPT0gbnVsbCApIHtcblx0XHRcdGV4dCA9IGV4dC5yZXBsYWNlKCAnLicsICcnICk7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggZXh0ICkge1xuXHRcdFx0Y2FzZSAnc3ZnJzpcblx0XHRcdGNhc2UgJ3BuZyc6XG5cdFx0XHRjYXNlICdqcGcnOlxuXHRcdFx0XHR0eXBlID0gJ21lZGlhJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3BocCc6XG5cdFx0XHRjYXNlICdodG1sJzpcblx0XHRcdGNhc2UgJ2Nzcyc6XG5cdFx0XHRjYXNlICdzY3NzJzpcblx0XHRcdGNhc2UgJ2pzJzpcblx0XHRcdGNhc2UgJ2pzb24nOlxuXHRcdFx0XHR0eXBlID0gJ2NvZGUnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnemlwJzpcblx0XHRcdGNhc2UgJ3Jhcic6XG5cdFx0XHRjYXNlICd0YXInOlxuXHRcdFx0Y2FzZSAnN3onOlxuXHRcdFx0Y2FzZSAnZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHdhbGtEaXJlY3RvcnkoIHBhdGggKSB7XG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KTtcblx0fVxuXG5cdHNldFBhdGgoIHBhdGggKSB7XG5cdFx0aWYgKCBwYXRoID09PSB0aGlzLnN0YXRlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVzID0gdGhpcy53YWxrRGlyZWN0b3J5KCBwYXRoICk7XG5cblx0XHRjb25zb2xlLmxvZyggZmlsZXMgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cGF0aCxcblx0XHRcdGZpbGVzXG5cdFx0fSk7XG5cdH1cblxuXHRkaXJDbGljayggZXZlbnQgKSB7XG5cdFx0Ly8gZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHRsZXQgZWxlbWVudCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG5cblx0XHRlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2V4cGFuZCcpO1xuXG5cdFx0aWYgKCBlbGVtZW50LmRhdGFzZXQubGF6eWxvYWQgKSB7XG5cdFx0XHQvLyBMb2FkIHRoZSBmaWxlcyBpbiB0aGlzIGRpcmVjdG9yeS5cblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmaWxlczogdGhpcy53YWxrRGlyZWN0b3J5KCB0aGlzLnN0YXRlLnBhdGgsIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZCApXG5cdFx0XHR9KTtcblxuXHRcdFx0ZGVsZXRlIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZDtcblx0XHR9XG5cdH1cblxuXHRmaWxlQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbDtcblx0XHRsZXQgb25DbGljaztcblx0XHRsZXQgbGF6eWxvYWQ7XG5cdFx0bGV0IGNoaWxkcmVuO1xuXG5cdFx0Ly8gU2tpcCBpZ25vcmVkIGZpbGVzLlxuXHRcdC8vIGlmICggdGhpcy5pc0ZpbGVJZ25vcmVkKCBmaWxlLm5hbWUgKSApIHtcblx0XHQvLyBcdHJldHVybiBudWxsO1xuXHRcdC8vIH1cblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsYXp5bG9hZCA9IGZpbGUucGF0aDtcblx0XHRcdH1cblxuXHRcdFx0b25DbGljayA9IHRoaXMuZGlyQ2xpY2s7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblx0XHRcdG9uQ2xpY2sgPSB0aGlzLmZpbGVDbGljaztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IHR5cGUgfSBrZXk9eyBmaWxlLnBhdGggfSBkYXRhLWxhenlsb2FkPXsgbGF6eWxvYWQgfSBvbkNsaWNrPXsgb25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZpbGVuYW1lXCI+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIGxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImljb25cIj48L3NwYW4+XG5cdFx0XHRcdFx0PHN0cm9uZz57IGZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IGNoaWxkcmVuIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCApIHtcblx0XHRcdHJldHVybiA8bGkgY2xhc3NOYW1lPVwiZW1wdHlcIj5ObyBwYXRoIHNwZWNpZmllZDwvbGk+O1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5zdGF0ZS5maWxlcyApIHtcblx0XHRcdHJldHVybiA8bGkgY2xhc3NOYW1lPVwiZW1wdHlcIj5ObyBmaWxlczwvbGk+O1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coIHRoaXMuc3RhdGUuZmlsZXMgKTtcblxuXHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5zdGF0ZS5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5zdGF0ZS5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9XCJmaWxlc1wiPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyVHJlZSgpIH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHNlbGVjdG9yLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRfRmlsZUxpc3Q6IG51bGw7XG5cblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogICBmYWxzZSxcblx0XHRcdGFjdGl2ZTogICBwcm9wcy5hY3RpdmUsXG5cdFx0XHRwcm9qZWN0czogcHJvcHMucHJvamVjdHNcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ICAgID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCAgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdC8vIHRoaXMuX0ZpbGVMaXN0LnNldFBhdGgoIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKTtcblx0fVxuXG5cdHNldEZpbGVMaXN0KCBGaWxlTGlzdCApIHtcblx0XHR0aGlzLl9GaWxlTGlzdCA9IEZpbGVMaXN0O1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3JhcCcpLmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgISBwcmV2U3RhdGUuaXNPcGVuICk7XG5cblx0XHRcdHJldHVybiB7IGlzT3BlbjogISBwcmV2U3RhdGUuaXNPcGVuIH07XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblx0fVxuXG5cdGNoYW5nZVByb2plY3QoIGluZGV4ICkge1xuXHRcdHRoaXMucHJvcHMuc2F2ZUFjdGl2ZVByb2plY3QoIGluZGV4ICk7XG5cblx0XHR0aGlzLl9GaWxlTGlzdC5zZXRQYXRoKCB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdLnBhdGggKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBhY3RpdmU6IHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF0gfSk7XG5cdH1cblxuXHRuZXdQcm9qZWN0KCkge1xuXHRcdGxldCBwYXRoID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtcblx0XHRcdHByb3BlcnRpZXM6IFsgJ29wZW5EaXJlY3RvcnknIF1cblx0XHR9KTtcblxuXHRcdGlmICggcGF0aCApIHtcblx0XHRcdHRoaXMuX0ZpbGVMaXN0LnNldFBhdGgoIHBhdGhbMF0gKTtcblxuXHRcdFx0bGV0IHByb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdXG5cdFx0XHR9O1xuXG5cdFx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0XHRsZXQgcHJvamVjdHMgPSBwcmV2U3RhdGUucHJvamVjdHM7XG5cblx0XHRcdFx0cHJvamVjdHMucHVzaCggcHJvamVjdCApO1xuXG5cdFx0XHRcdHRoaXMucHJvcHMuc2F2ZVByb2plY3RzKCBwcm9qZWN0cyApO1xuXHRcdFx0XHR0aGlzLnByb3BzLnNhdmVBY3RpdmVQcm9qZWN0KCBwcm9qZWN0cy5sZW5ndGggLSAxICk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRhY3RpdmU6IHByb2plY3QsXG5cdFx0XHRcdFx0cHJvamVjdHNcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnN0YXRlLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBhZGQgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnN0YXRlLmFjdGl2ZS5uYW1lIH08L2gxPlxuXHRcdFx0XHRcdDxoMj57IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggfTwvaDI+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHZpZXcgKHByb2plY3Qgc2VsZWN0b3IgYW5kIGZpbGV0cmVlKS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL0ZpbGVMaXN0Jyk7XG5cbi8vIGxldCBwcm9qZWN0cyA9IFtcbi8vIFx0eyBuYW1lOiAnQnVpbGRyJywgcGF0aDogJ0U6L0FwcHMvQnVpbGRyJyB9LFxuLy8gXHR7IG5hbWU6ICdOVE4nLCBwYXRoOiAnRTovU2l0ZXMvTlROJyB9LFxuLy8gXHR7IG5hbWU6ICdNU08nLCBwYXRoOiAnRTovU2l0ZXMvTVNPJyB9LFxuLy8gXTtcblxuLy8gbGV0IGFjdGl2ZSA9IHtcbi8vIFx0bmFtZTogJ0J1aWxkcicsXG4vLyBcdHBhdGg6ICdFOi9BcHBzL0J1aWxkcicsXG4vLyB9O1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdF9Qcm9qZWN0U2VsZWN0OiBQcm9qZWN0U2VsZWN0O1xuXHRfUHJvamVjdEZpbGVMaXN0OiBGaWxlTGlzdDtcblxuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSBbXTtcblx0XHRsZXQgYWN0aXZlICAgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnXG5cdFx0fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5jb25maWcgKSB7XG5cdFx0XHRwcm9qZWN0cyA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblxuXHRcdFx0bGV0IGFjdGl2ZUluZGV4ID0gdGhpcy5wcm9wcy5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdFx0XHRpZiAoIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0XHRhY3RpdmUgPSBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cHJvamVjdHMsXG5cdFx0XHRhY3RpdmVcblx0XHR9O1xuXG5cdFx0dGhpcy5zYXZlUHJvamVjdHMgICAgICA9IHRoaXMuc2F2ZVByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNhdmVBY3RpdmVQcm9qZWN0ID0gdGhpcy5zYXZlQWN0aXZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLl9Qcm9qZWN0U2VsZWN0LnNldEZpbGVMaXN0KCB0aGlzLl9Qcm9qZWN0RmlsZUxpc3QgKTtcblx0fVxuXG5cdHNhdmVQcm9qZWN0cyggcHJvamVjdHMgKSB7XG5cdFx0dGhpcy5wcm9wcy5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9XG5cblx0c2F2ZUFjdGl2ZVByb2plY3QoIGluZGV4ICkge1xuXHRcdHRoaXMucHJvcHMuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaW5kZXggKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFJlYWN0LkZyYWdtZW50PlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxQcm9qZWN0U2VsZWN0XG5cdFx0XHRcdFx0XHRwcm9qZWN0cz17IHRoaXMuc3RhdGUucHJvamVjdHMgfVxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cmVmPXsgKCBjaGlsZCApID0+IHsgdGhpcy5fUHJvamVjdFNlbGVjdCA9IGNoaWxkOyB9IH1cblx0XHRcdFx0XHRcdHNhdmVQcm9qZWN0cz17IHRoaXMuc2F2ZVByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNhdmVBY3RpdmVQcm9qZWN0PXsgdGhpcy5zYXZlQWN0aXZlUHJvamVjdCB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggfVxuXHRcdFx0XHRcdFx0cmVmPXsgKCBjaGlsZCApID0+IHsgdGhpcy5fUHJvamVjdEZpbGVMaXN0ID0gY2hpbGQ7IH0gfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9SZWFjdC5GcmFnbWVudD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdHM7XG4iLCIvKipcbiAqIEBmaWxlIFdhbGsgYSBkaXJlY3RvcnkgYW5kIHJldHVybiB0aGUgZmlsZXMgYW5kIGZvbGRlcnMgYXMgYW4gb2JqZWN0LlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IG5hbWUgPSBmc3BhdGguYmFzZW5hbWUoIHBhdGggKTtcblx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdGxldCBzdGF0cztcblxuXHR0cnkge1xuXHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblxuXHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXG5cdFx0cmV0dXJuIGl0ZW07XG5cdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRmcy5yZWFkZGlyKCBwYXRoLCBmdW5jdGlvbiggZXJyLCBmaWxlcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4ucHVzaCggZGlyZWN0b3J5VHJlZSggZnNwYXRoLmpvaW4oIHBhdGgsIGZpbGVzWyBpIF0gKSwgb3B0aW9ucywgZGVwdGggKyAxICkgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fSk7XG5cblx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0Ly8gfSwgMCApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiwgbXVsdGlzdHI6IHRydWUgKi9cblxuY29uc3QgU3RvcmUgID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcbmNvbnN0IGNvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdG5hbWU6ICdidWlsZHItY29uZmlnJ1xufSk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1Byb2plY3RzJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb2plY3RzIGNvbmZpZz17IGNvbmZpZyB9IC8+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbik7XG5cbi8vIHJlcXVpcmUoICcuL3BsdWdpbnMvdmVsb2NpdHkubWluLmpzJyApO1xuXG4vLyBDb250ZXh0IG1lbnUuXG5jb25zdCBmaWxlTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpO1xuLy8gY29uc3QgZmlsZW5hbWVzID0gZmlsZUxpc3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG5cbmZpbGVMaXN0LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0bGV0IGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldDtcblxuXHRpZiAoIGZpbGVOYW1lQ29udC50YWdOYW1lICE9PSAnbGknICkge1xuXHRcdGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdsaScpO1xuXHR9XG5cblx0aWYgKCBmaWxlTmFtZUNvbnQuZGF0YXNldC5maWxlICkge1xuXHRcdGNvbnNvbGUubG9nKCBKU09OLnBhcnNlKCBkZWNvZGVVUklDb21wb25lbnQoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSApICk7XG5cdH1cbn0pO1xuIl19
