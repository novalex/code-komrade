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

var dialog = require('electron').remote.dialog;

var PATH = require('path');

var React = require('react');
var ReactDOM = require('react-dom');

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
			var project = event.currentTarget.dataset.project;

			if ('new' === project) {
				this.newProject();
			} else {
				this.changeProject(project);
			}

			this.toggleSelect();
		}
	}, {
		key: 'changeProject',
		value: function changeProject(project) {
			this._FileList.setPath(this.state.projects[project].path);

			this.setState({ active: this.state.projects[project] });
		}
	}, {
		key: 'newProject',
		value: function newProject() {
			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				this._FileList.setPath(path[0]);

				var newProject = {
					name: PATH.basename(path[0]),
					path: path[0]
				};

				this.setState(function (prevState) {
					var projects = prevState.projects;

					projects.push(newProject);

					return {
						active: newProject,
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

},{"electron":undefined,"path":undefined,"react":undefined,"react-dom":undefined}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* jshint esversion:6 */

var React = require('react');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('./FileList');

// let projects = config.get('projects');

var projects = [{ name: 'Buildr', path: 'E:/Apps/Buildr' }, { name: 'NTN', path: 'E:/Sites/NTN' }, { name: 'MSO', path: 'E:/Sites/MSO' }];

var active = {
	name: 'Buildr',
	path: 'E:/Apps/Buildr'
};

var Projects = function (_React$Component) {
	_inherits(Projects, _React$Component);

	function Projects(props) {
		_classCallCheck(this, Projects);

		var _this = _possibleConstructorReturn(this, (Projects.__proto__ || Object.getPrototypeOf(Projects)).call(this, props));

		_this.state = {
			projects: [],
			active: {
				name: '',
				path: ''
			}
		};
		return _this;
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (this.props.config) {
				var newState = {};

				var _projects = this.props.config.get('projects');

				if (_projects) {
					newState.projects = _projects;
				}

				var _active = this.props.config.get('active-project');

				if (_active) {
					newState.active = _active;
				}

				if (Object.keys(newState).length > 0) {
					this.setState(newState);
				}
			}

			this._ProjectSelect.setFileList(this._ProjectFileList);
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
					React.createElement(ProjectSelect, { projects: this.state.projects, active: this.state.active, ref: function ref(child) {
							_this2._ProjectSelect = child;
						} })
				),
				React.createElement(
					'div',
					{ id: 'content' },
					React.createElement(FileList, { path: this.state.active.path, ref: function ref(child) {
							_this2._ProjectFileList = child;
						} })
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
var file_list = document.getElementById('files'),
    filenames = file_list.getElementsByTagName('li');

file_list.addEventListener('contextmenu', function (event) {
	var filename_cont = event.target;

	if ('li' !== filename_cont.tagName) {
		filename_cont = event.target.closest('li');
	}

	if (filename_cont.dataset.file) {
		console.log(JSON.parse(decodeURIComponent(filename_cont.dataset.file)));
	}
});

},{"./components/Projects":3,"electron-store":undefined,"react":undefined,"react-dom":undefined}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qcyIsImFwcC9qcy9jb21wb25lbnRzL1Byb2plY3RTZWxlY3QuanMiLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qcyIsImFwcC9qcy9yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7QUFFQSxJQUFNLFVBQVUsUUFBUSxVQUFSLENBQWhCO0FBQ0EsSUFBTSxLQUFLLFFBQVEsWUFBUixDQUFzQixRQUFRLElBQVIsQ0FBdEIsQ0FBWDtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLFNBQVMsYUFBVCxDQUF3QixJQUF4QixFQUF3RDtBQUFBLEtBQTFCLE9BQTBCLHVFQUFoQixFQUFnQjtBQUFBLEtBQVosS0FBWSx1RUFBSixDQUFJOztBQUN2RDtBQUNBLEtBQUssUUFBUSxPQUFSLEtBQW9CLElBQXpCLEVBQWdDO0FBQy9CLFVBQVEsQ0FBUjtBQUNBOztBQUVEO0FBQ0EsS0FBSyxRQUFRLEtBQVIsSUFBaUIsUUFBUSxRQUFRLEtBQXRDLEVBQThDO0FBQzdDLFNBQU8sSUFBUDtBQUNBOztBQUVELEtBQU0sT0FBTyxLQUFLLFFBQUwsQ0FBZSxJQUFmLENBQWI7QUFDQSxLQUFNLE9BQU8sRUFBRSxVQUFGLEVBQVEsVUFBUixFQUFiOztBQUVBLEtBQUksY0FBSjs7QUFFQSxLQUFJO0FBQ0gsVUFBUSxHQUFHLFFBQUgsQ0FBWSxJQUFaLENBQVI7QUFDQSxFQUZELENBRUUsT0FBTyxHQUFQLEVBQWE7QUFDZDtBQUNBLFNBQU8sSUFBUDtBQUNBOztBQUVEO0FBQ0EsS0FBSyxXQUFXLFFBQVEsT0FBbkIsS0FBZ0MsUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQXNC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L0IsQ0FEZjs7QUFHQSxVQUFVLGdCQUFWLENBQTRCLGFBQTVCLEVBQTJDLFVBQVUsS0FBVixFQUFrQjtBQUM1RCxLQUFJLGdCQUFnQixNQUFNLE1BQTFCOztBQUVBLEtBQUssU0FBUyxjQUFjLE9BQTVCLEVBQXNDO0FBQ3JDLGtCQUFnQixNQUFNLE1BQU4sQ0FBYSxPQUFiLENBQXFCLElBQXJCLENBQWhCO0FBQ0E7O0FBRUQsS0FBSyxjQUFjLE9BQWQsQ0FBc0IsSUFBM0IsRUFBa0M7QUFDakMsVUFBUSxHQUFSLENBQWEsS0FBSyxLQUFMLENBQVksbUJBQW9CLGNBQWMsT0FBZCxDQUFzQixJQUExQyxDQUFaLENBQWI7QUFDQTtBQUNELENBVkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qIGpzaGludCBlc3ZlcnNpb246NiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuY29uc3QgUEFUSCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdC8vIElmIGN1cnJlbnQgcGF0aCBpcyBpbmNsdWRlZCwgcmVzZXQgZGVwdGggY291bnRlci5cblx0aWYgKCBvcHRpb25zLmluY2x1ZGUgPT09IHBhdGggKSB7XG5cdFx0ZGVwdGggPSAwO1xuXHR9XG5cblx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRpZiAoIG9wdGlvbnMuZGVwdGggJiYgZGVwdGggPiBvcHRpb25zLmRlcHRoICkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgbmFtZSA9IFBBVEguYmFzZW5hbWUoIHBhdGggKTtcblx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdGxldCBzdGF0cztcblxuXHR0cnkge1xuXHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdH0gY2F0Y2goIGVyciApIHtcblx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRyZXR1cm4gbnVsbDsgIFxuXHR9XG5cblx0aWYgKCBzdGF0cy5pc0ZpbGUoKSApIHtcblx0XHRjb25zdCBleHQgPSBQQVRILmV4dG5hbWUoIHBhdGggKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFxuXHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblx0fSBlbHNlIGlmICggc3RhdHMuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRsZXQgZmlsZXMgPSB7fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKCBwYXRoICk7XG5cdFx0fSBjYXRjaCggZXJyICkge1xuXHRcdFx0aWYgKCBlcnIuY29kZSA9PT0gJ0VBQ0NFUycgKSB7XG5cdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlcyA9PT0gbnVsbCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGl0ZW0uY2hpbGRyZW4gPSBmaWxlc1xuXHRcdFx0Lm1hcCggY2hpbGQgPT4gZGlyZWN0b3J5VHJlZSggUEFUSC5qb2luKCBwYXRoLCBjaGlsZCApLCBvcHRpb25zLCBkZXB0aCArIDEgKSApXG5cdFx0XHQuZmlsdGVyKCBlID0+ICEhZSApO1xuXHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHQvLyBcdGNvbnNvbGUubG9nKCBwcmV2LCBjdXIuc2l6ZSApO1xuXHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHQvLyB9LCAwICk7XG5cdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG51bGw7IC8vIE9yIHNldCBpdGVtLnNpemUgPSAwIGZvciBkZXZpY2VzLCBGSUZPIGFuZCBzb2NrZXRzID9cblx0fVxuXG5cdHJldHVybiBpdGVtO1xufVxuXG5PYmplY3QucmVzb2x2ZSA9IGZ1bmN0aW9uKCBwYXRoLCBvYmogKSB7XG5cdGxldCBwcm9wcyA9IHBhdGguc3BsaXQoJy4nKSxcblx0XHRvYnBhdGggPSAnJztcblxuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKyApIHtcblx0XHRpZiAoIDAgPT09IGkgKSB7XG5cdFx0XHRvYnBhdGggPSAnY2hpbGRyZW4nO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvYnBhdGggKz0gJy4nICsgcHJvcHNbIGkgXSArICcuY2hpbGRyZW4nO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBvYnBhdGguc3BsaXQoJy4nKS5yZWR1Y2UoIGZ1bmN0aW9uKCBwcmV2LCBjdXJyICkge1xuXHRcdHJldHVybiAoIHByZXYgKSA/IHByZXZbIGN1cnIgXSA6IHVuZGVmaW5lZFxuXHR9LCBvYmogfHwgc2VsZiApO1xufTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRmaWxlczoge30sXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XVxuXHRcdH07XG5cblx0XHR0aGlzLmRpckNsaWNrICA9IHRoaXMuZGlyQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMuZmlsZUNsaWNrID0gdGhpcy5maWxlQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFBhdGgoIHRoaXMucHJvcHMucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdGlzRmlsZUlnbm9yZWQoIGZpbGVuYW1lICkge1xuXHRcdGZvciAoIHZhciBpID0gdGhpcy5zdGF0ZS5pZ25vcmVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0aWYgKCBmaWxlbmFtZSA9PT0gdGhpcy5zdGF0ZS5pZ25vcmVkWyBpIF0gKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRpZiAoIG51bGwgIT09IGV4dCApIHtcblx0XHRcdGV4dCA9IGV4dC5yZXBsYWNlKCAnLicsICcnICk7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggZXh0ICkge1xuXHRcdFx0Y2FzZSAnc3ZnJzpcblx0XHRcdGNhc2UgJ3BuZyc6XG5cdFx0XHRjYXNlICdqcGcnOlxuXHRcdFx0XHR0eXBlID0gJ21lZGlhJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3BocCc6XG5cdFx0XHRjYXNlICdodG1sJzpcblx0XHRcdGNhc2UgJ2Nzcyc6XG5cdFx0XHRjYXNlICdzY3NzJzpcblx0XHRcdGNhc2UgJ2pzJzpcblx0XHRcdGNhc2UgJ2pzb24nOlxuXHRcdFx0XHR0eXBlID0gJ2NvZGUnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnemlwJzpcblx0XHRcdGNhc2UgJ3Jhcic6XG5cdFx0XHRjYXNlICd0YXInOlxuXHRcdFx0Y2FzZSAnN3onOlxuXHRcdFx0Y2FzZSAnZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldFBhdGgoIHBhdGggKSB7XG5cdFx0aWYgKCBwYXRoID09PSB0aGlzLnN0YXRlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0ZmlsZXM6IHRoaXMud2Fsa0RpcmVjdG9yeSggcGF0aCApLFxuXHRcdH0pO1xuXHR9XG5cblx0d2Fsa0RpcmVjdG9yeSggcGF0aCwgaW5jbHVkZSA9IG51bGwgKSB7XG5cdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIHBhdGgsIHtcblx0XHRcdC8vIGRlcHRoOiAyLFxuXHRcdFx0ZXhjbHVkZTogbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICksXG5cdFx0XHQvLyBpbmNsdWRlOiBpbmNsdWRlLFxuXHRcdH0gKTtcblx0fVxuXG5cdGRpckNsaWNrKCBldmVudCApIHtcblx0XHQvLyBldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdGxldCBlbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldDtcblxuXHRcdGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZXhwYW5kJyk7XG5cblx0XHRpZiAoIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZCApIHtcblx0XHRcdC8vIExvYWQgdGhlIGZpbGVzIGluIHRoaXMgZGlyZWN0b3J5LlxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZpbGVzOiB0aGlzLndhbGtEaXJlY3RvcnkoIHRoaXMuc3RhdGUucGF0aCwgZWxlbWVudC5kYXRhc2V0Lmxhenlsb2FkICksXG5cdFx0XHR9KTtcblxuXHRcdFx0ZGVsZXRlIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZDtcblx0XHR9XG5cdH1cblxuXHRmaWxlQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwLCBpbmRleCA9IG51bGwgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGUsXG5cdFx0XHRleHQgID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbCxcblx0XHRcdG9uQ2xpY2ssXG5cdFx0XHRsYXp5bG9hZCxcblx0XHRcdGNoaWxkcmVuO1xuXG5cdFx0Ly8gU2tpcCBpZ25vcmVkIGZpbGVzLlxuXHRcdC8vIGlmICggdGhpcy5pc0ZpbGVJZ25vcmVkKCBmaWxlLm5hbWUgKSApIHtcblx0XHQvLyBcdHJldHVybiBudWxsO1xuXHRcdC8vIH1cblxuXHRcdGlmICggJ2RpcmVjdG9yeScgPT09IGZpbGUudHlwZSApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGlmICggaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpbmRleCArPSAnLicgKyBjaGlsZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBjaGlsZDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyggT2JqZWN0LnJlc29sdmUoIGluZGV4LCB0aGlzLnN0YXRlLmZpbGVzICkgKTtcblxuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSwgaW5kZXggKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2hpbGRyZW4gPSA8dWwgY2xhc3NOYW1lPVwiY2hpbGRyZW5cIiBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsYXp5bG9hZCA9IGZpbGUucGF0aDtcblx0XHRcdH1cblxuXHRcdFx0b25DbGljayA9IHRoaXMuZGlyQ2xpY2s7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblx0XHRcdG9uQ2xpY2sgPSB0aGlzLmZpbGVDbGljaztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IHR5cGUgfSBrZXk9eyBmaWxlLnBhdGggfSBkYXRhLWxhenlsb2FkPXsgbGF6eWxvYWQgfSBvbkNsaWNrPXsgb25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZpbGVuYW1lXCI+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIGxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImljb25cIj48L3NwYW4+XG5cdFx0XHRcdFx0PHN0cm9uZz57IGZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IGNoaWxkcmVuIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCApIHtcblx0XHRcdHJldHVybiA8bGkgY2xhc3NOYW1lPVwiZW1wdHlcIj5ObyBwYXRoIHNwZWNpZmllZDwvbGk+O1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5zdGF0ZS5maWxlcyApIHtcblx0XHRcdHJldHVybiA8bGkgY2xhc3NOYW1lPVwiZW1wdHlcIj5ObyBmaWxlczwvbGk+O1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coIHRoaXMuc3RhdGUuZmlsZXMgKTtcblxuXHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5zdGF0ZS5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5zdGF0ZS5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9XCJmaWxlc1wiPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyVHJlZSgpIH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0O1xuIiwiY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBQQVRIID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBSZWFjdCAgICA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0X0ZpbGVMaXN0OiBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46ICAgZmFsc2UsXG5cdFx0XHRhY3RpdmU6ICAgcHJvcHMuYWN0aXZlLFxuXHRcdFx0cHJvamVjdHM6IHByb3BzLnByb2plY3RzLFxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgICAgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ICA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0Ly8gdGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0c2V0RmlsZUxpc3QoIEZpbGVMaXN0ICkge1xuXHRcdHRoaXMuX0ZpbGVMaXN0ID0gRmlsZUxpc3Q7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cmFwJykuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCAhIHByZXZTdGF0ZS5pc09wZW4gKTtcblxuXHRcdFx0cmV0dXJuIHsgaXNPcGVuOiAhIHByZXZTdGF0ZS5pc09wZW4gfTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHR2YXIgcHJvamVjdCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0aWYgKCAnbmV3JyA9PT0gcHJvamVjdCApIHtcblx0XHRcdHRoaXMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIHByb2plY3QgKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXHR9XG5cblx0Y2hhbmdlUHJvamVjdCggcHJvamVjdCApIHtcblx0XHR0aGlzLl9GaWxlTGlzdC5zZXRQYXRoKCB0aGlzLnN0YXRlLnByb2plY3RzWyBwcm9qZWN0IF0ucGF0aCApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZTogdGhpcy5zdGF0ZS5wcm9qZWN0c1sgcHJvamVjdCBdIH0pO1xuXHR9XG5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdLFxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0dGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggcGF0aFswXSApO1xuXG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogUEFUSC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdLFxuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdFx0bGV0IHByb2plY3RzID0gcHJldlN0YXRlLnByb2plY3RzO1xuXG5cdFx0XHRcdHByb2plY3RzLnB1c2goIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGFjdGl2ZTogbmV3UHJvamVjdCxcblx0XHRcdFx0XHRwcm9qZWN0cyxcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnN0YXRlLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9XCJuZXdcIiBkYXRhLXByb2plY3Q9XCJuZXdcIiBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9XCJwcm9qZWN0LXNlbGVjdFwiPlxuXHRcdFx0XHRcdDxkaXYgaWQ9XCJwcm9qZWN0LWFjdGl2ZVwiIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIGFkZCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9XCJwcm9qZWN0LXNlbGVjdFwiPlxuXHRcdFx0XHQ8ZGl2IGlkPVwicHJvamVjdC1hY3RpdmVcIiBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnN0YXRlLmFjdGl2ZS5uYW1lIH08L2gxPlxuXHRcdFx0XHRcdDxoMj57IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggfTwvaDI+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPVwicHJvamVjdC1zZWxlY3QtZHJvcGRvd25cIiBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTZWxlY3Q7XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOjYgKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSgnLi9Qcm9qZWN0U2VsZWN0Jyk7XG5cbmNvbnN0IEZpbGVMaXN0ID0gcmVxdWlyZSgnLi9GaWxlTGlzdCcpO1xuXG4vLyBsZXQgcHJvamVjdHMgPSBjb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXG5sZXQgcHJvamVjdHMgPSBbXG5cdHsgbmFtZTogJ0J1aWxkcicsIHBhdGg6ICdFOi9BcHBzL0J1aWxkcicgfSxcblx0eyBuYW1lOiAnTlROJywgcGF0aDogJ0U6L1NpdGVzL05UTicgfSxcblx0eyBuYW1lOiAnTVNPJywgcGF0aDogJ0U6L1NpdGVzL01TTycgfSxcbl07XG5cbmxldCBhY3RpdmUgPSB7XG5cdG5hbWU6ICdCdWlsZHInLFxuXHRwYXRoOiAnRTovQXBwcy9CdWlsZHInLFxufTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRfUHJvamVjdFNlbGVjdDogUHJvamVjdFNlbGVjdDtcblx0X1Byb2plY3RGaWxlTGlzdDogRmlsZUxpc3Q7XG5cblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHByb2plY3RzOiBbXSxcblx0XHRcdGFjdGl2ZToge1xuXHRcdFx0XHRuYW1lOiAnJyxcblx0XHRcdFx0cGF0aDogJycsXG5cdFx0XHR9LFxuXHRcdH07XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuY29uZmlnICkge1xuXHRcdFx0bGV0IG5ld1N0YXRlID0ge307XG5cblx0XHRcdGxldCBwcm9qZWN0cyA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0cyApIHtcblx0XHRcdFx0bmV3U3RhdGUucHJvamVjdHMgPSBwcm9qZWN0cztcblx0XHRcdH1cblxuXHRcdFx0bGV0IGFjdGl2ZSA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRcdFx0aWYgKCBhY3RpdmUgKSB7XG5cdFx0XHRcdG5ld1N0YXRlLmFjdGl2ZSA9IGFjdGl2ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBPYmplY3Qua2V5cyggbmV3U3RhdGUgKS5sZW5ndGggPiAwICkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKCBuZXdTdGF0ZSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX1Byb2plY3RTZWxlY3Quc2V0RmlsZUxpc3QoIHRoaXMuX1Byb2plY3RGaWxlTGlzdCApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UmVhY3QuRnJhZ21lbnQ+XG5cdFx0XHQ8ZGl2IGlkPVwiaGVhZGVyXCI+XG5cdFx0XHRcdDxQcm9qZWN0U2VsZWN0IHByb2plY3RzPXsgdGhpcy5zdGF0ZS5wcm9qZWN0cyB9IGFjdGl2ZT17IHRoaXMuc3RhdGUuYWN0aXZlIH0gcmVmPXsgKCBjaGlsZCApID0+IHsgdGhpcy5fUHJvamVjdFNlbGVjdCA9IGNoaWxkOyB9IH0gLz5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBpZD1cImNvbnRlbnRcIj5cblx0XHRcdFx0PEZpbGVMaXN0IHBhdGg9eyB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoIH0gcmVmPXsgKCBjaGlsZCApID0+IHsgdGhpcy5fUHJvamVjdEZpbGVMaXN0ID0gY2hpbGQ7IH0gfSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYsIG11bHRpc3RyOiB0cnVlICovXG5cbmNvbnN0IFN0b3JlICA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5jb25zdCBjb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZycsXG59KTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUHJvamVjdHMnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvamVjdHMgY29uZmlnPXsgY29uZmlnIH0gLz4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKVxuKTtcblxuLy8gcmVxdWlyZSggJy4vcGx1Z2lucy92ZWxvY2l0eS5taW4uanMnICk7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVfbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpLFxuXHQgIGZpbGVuYW1lcyA9IGZpbGVfbGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZV9saXN0LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0bGV0IGZpbGVuYW1lX2NvbnQgPSBldmVudC50YXJnZXQ7XG5cblx0aWYgKCAnbGknICE9PSBmaWxlbmFtZV9jb250LnRhZ05hbWUgKSB7XG5cdFx0ZmlsZW5hbWVfY29udCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdsaScpO1xuXHR9XG5cblx0aWYgKCBmaWxlbmFtZV9jb250LmRhdGFzZXQuZmlsZSApIHtcblx0XHRjb25zb2xlLmxvZyggSlNPTi5wYXJzZSggZGVjb2RlVVJJQ29tcG9uZW50KCBmaWxlbmFtZV9jb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG4iXX0=
