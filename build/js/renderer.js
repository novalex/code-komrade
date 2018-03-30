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

			this.walkDirectory(path).then(function (files) {
				this.setState({
					path: path,
					files: files
				});
			}.bind(this));
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

},{"../helpers/directoryTree.js":4,"react":undefined}],2:[function(require,module,exports){
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
						return null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qcyIsImFwcC9qcy9jb21wb25lbnRzL1Byb2plY3RTZWxlY3QuanMiLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qcyIsImFwcC9qcy9oZWxwZXJzL2RpcmVjdG9yeVRyZWUuanMiLCJhcHAvanMvcmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsSUFBTSxnQkFBZ0IsUUFBUSw2QkFBUixDQUF0Qjs7SUFFTSxROzs7QUFDTCxtQkFBYSxLQUFiLEVBQXFCO0FBQUE7O0FBQUEsa0hBQ2IsS0FEYTs7QUFHcEIsUUFBSyxLQUFMLEdBQWE7QUFDWixTQUFNLEVBRE07QUFFWixVQUFPLEVBRks7QUFHWixZQUFTLENBQ1IsTUFEUSxFQUVSLGNBRlEsRUFHUixXQUhRO0FBSEcsR0FBYjs7QUFVQSxRQUFLLFFBQUwsR0FBaUIsTUFBSyxRQUFMLENBQWMsSUFBZCxPQUFqQjtBQUNBLFFBQUssU0FBTCxHQUFpQixNQUFLLFNBQUwsQ0FBZSxJQUFmLE9BQWpCO0FBZG9CO0FBZXBCOzs7O3NDQUVtQjtBQUNuQixPQUFLLEtBQUssS0FBTCxDQUFXLElBQWhCLEVBQXVCO0FBQ3RCLFNBQUssT0FBTCxDQUFjLEtBQUssS0FBTCxDQUFXLElBQXpCO0FBQ0E7QUFDRDs7O2dDQUVjLFEsRUFBVztBQUN6QixRQUFNLElBQUksSUFBSSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLE1BQW5CLEdBQTRCLENBQTFDLEVBQTZDLEtBQUssQ0FBbEQsRUFBcUQsR0FBckQsRUFBMkQ7QUFDMUQsUUFBSyxhQUFhLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBb0IsQ0FBcEIsQ0FBbEIsRUFBNEM7QUFDM0MsWUFBTyxJQUFQO0FBQ0E7QUFDRDs7QUFF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QW9CLGFBQWEsT0FBYixDQUFxQixJQUF6QyxDQUFaLENBQWI7QUFDQTtBQUNELENBVkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2RpcmVjdG9yeVRyZWUuanMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRmaWxlczoge30sXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnXG5cdFx0XHRdXG5cdFx0fTtcblxuXHRcdHRoaXMuZGlyQ2xpY2sgID0gdGhpcy5kaXJDbGljay5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5maWxlQ2xpY2sgPSB0aGlzLmZpbGVDbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHRoaXMuc2V0UGF0aCggdGhpcy5wcm9wcy5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0aXNGaWxlSWdub3JlZCggZmlsZW5hbWUgKSB7XG5cdFx0Zm9yICggdmFyIGkgPSB0aGlzLnN0YXRlLmlnbm9yZWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG5cdFx0XHRpZiAoIGZpbGVuYW1lID09PSB0aGlzLnN0YXRlLmlnbm9yZWRbIGkgXSApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdGlmICggZXh0ICE9PSBudWxsICkge1xuXHRcdFx0ZXh0ID0gZXh0LnJlcGxhY2UoICcuJywgJycgKTtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICdzdmcnOlxuXHRcdFx0Y2FzZSAncG5nJzpcblx0XHRcdGNhc2UgJ2pwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAncGhwJzpcblx0XHRcdGNhc2UgJ2h0bWwnOlxuXHRcdFx0Y2FzZSAnY3NzJzpcblx0XHRcdGNhc2UgJ3Njc3MnOlxuXHRcdFx0Y2FzZSAnanMnOlxuXHRcdFx0Y2FzZSAnanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICd6aXAnOlxuXHRcdFx0Y2FzZSAncmFyJzpcblx0XHRcdGNhc2UgJ3Rhcic6XG5cdFx0XHRjYXNlICc3eic6XG5cdFx0XHRjYXNlICdneic6XG5cdFx0XHRcdHR5cGUgPSAnemlwJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSAndGV4dCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0d2Fsa0RpcmVjdG9yeSggcGF0aCApIHtcblx0XHRsZXQgZXhjbHVkZSA9IG5ldyBSZWdFeHAoIHRoaXMuc3RhdGUuaWdub3JlZC5qb2luKCd8JyksICdpJyApO1xuXG5cdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIHBhdGgsIHtcblx0XHRcdC8vIGRlcHRoOiAyLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdH0pO1xuXHR9XG5cblx0c2V0UGF0aCggcGF0aCApIHtcblx0XHRpZiAoIHBhdGggPT09IHRoaXMuc3RhdGUucGF0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLndhbGtEaXJlY3RvcnkoIHBhdGggKS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0cGF0aCxcblx0XHRcdFx0ZmlsZXNcblx0XHRcdH0pO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdGRpckNsaWNrKCBldmVudCApIHtcblx0XHQvLyBldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdGxldCBlbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldDtcblxuXHRcdGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZXhwYW5kJyk7XG5cblx0XHRpZiAoIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZCApIHtcblx0XHRcdC8vIExvYWQgdGhlIGZpbGVzIGluIHRoaXMgZGlyZWN0b3J5LlxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZpbGVzOiB0aGlzLndhbGtEaXJlY3RvcnkoIHRoaXMuc3RhdGUucGF0aCwgZWxlbWVudC5kYXRhc2V0Lmxhenlsb2FkIClcblx0XHRcdH0pO1xuXG5cdFx0XHRkZWxldGUgZWxlbWVudC5kYXRhc2V0Lmxhenlsb2FkO1xuXHRcdH1cblx0fVxuXG5cdGZpbGVDbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCA9IDAgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGU7XG5cdFx0bGV0IGV4dCAgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBvbkNsaWNrO1xuXHRcdGxldCBsYXp5bG9hZDtcblx0XHRsZXQgY2hpbGRyZW47XG5cblx0XHQvLyBTa2lwIGlnbm9yZWQgZmlsZXMuXG5cdFx0Ly8gaWYgKCB0aGlzLmlzRmlsZUlnbm9yZWQoIGZpbGUubmFtZSApICkge1xuXHRcdC8vIFx0cmV0dXJuIG51bGw7XG5cdFx0Ly8gfVxuXG5cdFx0aWYgKCBmaWxlLnR5cGUgPT09ICdkaXJlY3RvcnknICkge1xuXHRcdFx0aWYgKCBmaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxldCBjaGlsZHJlbkl0ZW1zID0gW107XG5cblx0XHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIGZpbGUuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JdGVtcy5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggZmlsZS5jaGlsZHJlblsgY2hpbGQgXSwgbGV2ZWwgKyAxICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT0nY2hpbGRyZW4nIGtleT17IGZpbGUucGF0aCArICctY2hpbGRyZW4nIH0+eyBjaGlsZHJlbkl0ZW1zIH08L3VsPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxhenlsb2FkID0gZmlsZS5wYXRoO1xuXHRcdFx0fVxuXG5cdFx0XHRvbkNsaWNrID0gdGhpcy5kaXJDbGljaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXHRcdFx0b25DbGljayA9IHRoaXMuZmlsZUNsaWNrO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgdHlwZSB9IGtleT17IGZpbGUucGF0aCB9IGRhdGEtbGF6eWxvYWQ9eyBsYXp5bG9hZCB9IG9uQ2xpY2s9eyBvbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZmlsZW5hbWVcIj5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggbGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiaWNvblwiPjwvc3Bhbj5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgY2hpbGRyZW4gfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyVHJlZSgpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIDxsaSBjbGFzc05hbWU9XCJlbXB0eVwiPk5vIHBhdGggc3BlY2lmaWVkPC9saT47XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnN0YXRlLmZpbGVzICkge1xuXHRcdFx0cmV0dXJuIDxsaSBjbGFzc05hbWU9XCJlbXB0eVwiPk5vIGZpbGVzPC9saT47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHQvLyBjb25zb2xlLmxvZyggdGhpcy5zdGF0ZS5maWxlcyApO1xuXG5cdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LlxuXHRcdGlmICggdGhpcy5zdGF0ZS5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5zdGF0ZS5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnN0YXRlLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZWxpc3Q7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD1cImZpbGVzXCI+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJUcmVlKCkgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdF9GaWxlTGlzdDogbnVsbDtcblxuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiAgIGZhbHNlLFxuXHRcdFx0YWN0aXZlOiAgIHByb3BzLmFjdGl2ZSxcblx0XHRcdHByb2plY3RzOiBwcm9wcy5wcm9qZWN0c1xuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgICAgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ICA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0Ly8gdGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0c2V0RmlsZUxpc3QoIEZpbGVMaXN0ICkge1xuXHRcdHRoaXMuX0ZpbGVMaXN0ID0gRmlsZUxpc3Q7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cmFwJykuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCAhIHByZXZTdGF0ZS5pc09wZW4gKTtcblxuXHRcdFx0cmV0dXJuIHsgaXNPcGVuOiAhIHByZXZTdGF0ZS5pc09wZW4gfTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXHR9XG5cblx0Y2hhbmdlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0dGhpcy5wcm9wcy5zYXZlQWN0aXZlUHJvamVjdCggaW5kZXggKTtcblxuXHRcdHRoaXMuX0ZpbGVMaXN0LnNldFBhdGgoIHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF0ucGF0aCApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZTogdGhpcy5zdGF0ZS5wcm9qZWN0c1sgaW5kZXggXSB9KTtcblx0fVxuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0dGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggcGF0aFswXSApO1xuXG5cdFx0XHRsZXQgcHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF1cblx0XHRcdH07XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRcdGxldCBwcm9qZWN0cyA9IHByZXZTdGF0ZS5wcm9qZWN0cztcblxuXHRcdFx0XHRwcm9qZWN0cy5wdXNoKCBwcm9qZWN0ICk7XG5cblx0XHRcdFx0dGhpcy5wcm9wcy5zYXZlUHJvamVjdHMoIHByb2plY3RzICk7XG5cdFx0XHRcdHRoaXMucHJvcHMuc2F2ZUFjdGl2ZVByb2plY3QoIHByb2plY3RzLmxlbmd0aCAtIDEgKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGFjdGl2ZTogcHJvamVjdCxcblx0XHRcdFx0XHRwcm9qZWN0c1xuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMuc3RhdGUucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5hY3RpdmUubmFtZSB8fCAhIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIGFkZCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMuc3RhdGUuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3QgdmlldyAocHJvamVjdCBzZWxlY3RvciBhbmQgZmlsZXRyZWUpLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vRmlsZUxpc3QnKTtcblxuLy8gbGV0IHByb2plY3RzID0gW1xuLy8gXHR7IG5hbWU6ICdCdWlsZHInLCBwYXRoOiAnRTovQXBwcy9CdWlsZHInIH0sXG4vLyBcdHsgbmFtZTogJ05UTicsIHBhdGg6ICdFOi9TaXRlcy9OVE4nIH0sXG4vLyBcdHsgbmFtZTogJ01TTycsIHBhdGg6ICdFOi9TaXRlcy9NU08nIH0sXG4vLyBdO1xuXG4vLyBsZXQgYWN0aXZlID0ge1xuLy8gXHRuYW1lOiAnQnVpbGRyJyxcbi8vIFx0cGF0aDogJ0U6L0FwcHMvQnVpbGRyJyxcbi8vIH07XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0X1Byb2plY3RTZWxlY3Q6IFByb2plY3RTZWxlY3Q7XG5cdF9Qcm9qZWN0RmlsZUxpc3Q6IEZpbGVMaXN0O1xuXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdGxldCBwcm9qZWN0cyA9IFtdO1xuXHRcdGxldCBhY3RpdmUgICA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJydcblx0XHR9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmNvbmZpZyApIHtcblx0XHRcdHByb2plY3RzID0gdGhpcy5wcm9wcy5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXG5cdFx0XHRsZXQgYWN0aXZlSW5kZXggPSB0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0XHRcdGlmICggcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdGFjdGl2ZSA9IHByb2plY3RzWyBhY3RpdmVJbmRleCBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwcm9qZWN0cyxcblx0XHRcdGFjdGl2ZVxuXHRcdH07XG5cblx0XHR0aGlzLnNhdmVQcm9qZWN0cyAgICAgID0gdGhpcy5zYXZlUHJvamVjdHMuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2F2ZUFjdGl2ZVByb2plY3QgPSB0aGlzLnNhdmVBY3RpdmVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuX1Byb2plY3RTZWxlY3Quc2V0RmlsZUxpc3QoIHRoaXMuX1Byb2plY3RGaWxlTGlzdCApO1xuXHR9XG5cblx0c2F2ZVByb2plY3RzKCBwcm9qZWN0cyApIHtcblx0XHR0aGlzLnByb3BzLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH1cblxuXHRzYXZlQWN0aXZlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0dGhpcy5wcm9wcy5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpbmRleCApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UmVhY3QuRnJhZ21lbnQ+XG5cdFx0XHRcdDxkaXYgaWQ9J2hlYWRlcic+XG5cdFx0XHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0XHRcdHByb2plY3RzPXsgdGhpcy5zdGF0ZS5wcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRhY3RpdmU9eyB0aGlzLnN0YXRlLmFjdGl2ZSB9XG5cdFx0XHRcdFx0XHRyZWY9eyAoIGNoaWxkICkgPT4geyB0aGlzLl9Qcm9qZWN0U2VsZWN0ID0gY2hpbGQ7IH0gfVxuXHRcdFx0XHRcdFx0c2F2ZVByb2plY3RzPXsgdGhpcy5zYXZlUHJvamVjdHMgfVxuXHRcdFx0XHRcdFx0c2F2ZUFjdGl2ZVByb2plY3Q9eyB0aGlzLnNhdmVBY3RpdmVQcm9qZWN0IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRyZWY9eyAoIGNoaWxkICkgPT4geyB0aGlzLl9Qcm9qZWN0RmlsZUxpc3QgPSBjaGlsZDsgfSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIHRoZSBmaWxlcyBhbmQgZm9sZGVycyBhcyBhbiBvYmplY3QuXG4gKi9cblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwoIHJlcXVpcmUoJ2ZzJykgKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBkaXJlY3RvcnlUcmVlKCBwYXRoLCBvcHRpb25zID0ge30sIGRlcHRoID0gMCApIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICkge1xuXHRcdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0XHRpZiAoIG9wdGlvbnMuZGVwdGggJiYgZGVwdGggPiBvcHRpb25zLmRlcHRoICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5hbWUgPSBmc3BhdGguYmFzZW5hbWUoIHBhdGggKTtcblx0XHRjb25zdCBpdGVtID0geyBwYXRoLCBuYW1lIH07XG5cblx0XHRsZXQgc3RhdHM7XG5cblx0XHR0cnkge1xuXHRcdFx0c3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKTtcblx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdC8vIFNraXAgaWYgaXQgbWF0Y2hlcyB0aGUgZXhjbHVkZSByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGF0cy5pc0ZpbGUoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblxuXHRcdFx0Y29uc3QgZXh0ID0gZnNwYXRoLmV4dG5hbWUoIHBhdGggKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXG5cdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0fSBlbHNlIGlmICggc3RhdHMuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0XHRmcy5yZWFkZGlyKCBwYXRoLCBmdW5jdGlvbiggZXJyLCBmaWxlcyApIHtcblx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIuY29kZSA9PT0gJ0VBQ0NFUycgKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYsIG11bHRpc3RyOiB0cnVlICovXG5cbmNvbnN0IFN0b3JlICA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5jb25zdCBjb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9Qcm9qZWN0cycpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm9qZWN0cyBjb25maWc9eyBjb25maWcgfSAvPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpXG4pO1xuXG4vLyByZXF1aXJlKCAnLi9wbHVnaW5zL3ZlbG9jaXR5Lm1pbi5qcycgKTtcblxuLy8gQ29udGV4dCBtZW51LlxuY29uc3QgZmlsZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZXMnKTtcbi8vIGNvbnN0IGZpbGVuYW1lcyA9IGZpbGVMaXN0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xuXG5maWxlTGlzdC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGxldCBmaWxlTmFtZUNvbnQgPSBldmVudC50YXJnZXQ7XG5cblx0aWYgKCBmaWxlTmFtZUNvbnQudGFnTmFtZSAhPT0gJ2xpJyApIHtcblx0XHRmaWxlTmFtZUNvbnQgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnbGknKTtcblx0fVxuXG5cdGlmICggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApIHtcblx0XHRjb25zb2xlLmxvZyggSlNPTi5wYXJzZSggZGVjb2RlVVJJQ29tcG9uZW50KCBmaWxlTmFtZUNvbnQuZGF0YXNldC5maWxlICkgKSApO1xuXHR9XG59KTtcbiJdfQ==
