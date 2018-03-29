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
		console.log(err);
		return null;
	}

	// Skip if it matches the exclude regex.
	if (options && options.exclude && options.exclude.test(path)) {
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

var FileList = function (_React$Component) {
	_inherits(FileList, _React$Component);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

		_this.state = {
			path: '',
			files: {},
			ignored: ['.git', 'node_modules']
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
				files: directoryTree(path, {
					depth: 3,
					exclude: new RegExp(this.state.ignored.join('|'), 'i')
				})
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
				var file = directoryTree(element.dataset.lazyload);

				ReactDOM.render(this.buildTree(file), element);

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
		value: function buildTree(file, level) {
			var type = file.type,
			    ext = file.extension || null,
			    onClick = void 0,
			    lazyload = void 0,
			    children = void 0;

			// Skip ignored files.
			// if ( this.isFileIgnored( file.name ) ) {
			// 	return null;
			// }

			level = level || 0;

			if ('directory' === file.type) {
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

			console.log(this.state.files);

			var filelist = [];

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

var shell = require('electron').shell;
var os = require('os');
var React = require('react');
var ReactDOM = require('react-dom');

var ProjectSelect = function (_React$Component) {
	_inherits(ProjectSelect, _React$Component);

	function ProjectSelect(props) {
		_classCallCheck(this, ProjectSelect);

		var _this = _possibleConstructorReturn(this, (ProjectSelect.__proto__ || Object.getPrototypeOf(ProjectSelect)).call(this, props));

		_this.state = {
			isOpen: false,
			currentProject: props.active
		};

		_this.toggleSelect = _this.toggleSelect.bind(_this);
		_this.selectProject = _this.selectProject.bind(_this);
		return _this;
	}

	_createClass(ProjectSelect, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			// this._FileList.setPath( this.state.currentProject.path );
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
			this._FileList.setPath(this.props.projects[project].path);

			this.setState(function (prevState) {
				return { currentProject: this.props.projects[project] };
			});
		}
	}, {
		key: 'newProject',
		value: function newProject() {
			shell.showItemInFolder(os.homedir());
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
			return React.createElement(
				'div',
				{ id: 'project-select' },
				React.createElement(
					'div',
					{ id: 'project-active', onClick: this.toggleSelect },
					React.createElement(
						'h1',
						null,
						this.state.currentProject.name
					),
					React.createElement(
						'h2',
						null,
						this.state.currentProject.path
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

},{"electron":undefined,"os":undefined,"react":undefined,"react-dom":undefined}],3:[function(require,module,exports){
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

	function Projects() {
		_classCallCheck(this, Projects);

		return _possibleConstructorReturn(this, (Projects.__proto__ || Object.getPrototypeOf(Projects)).call(this));
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
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
					React.createElement(ProjectSelect, { projects: projects, active: active, ref: function ref(child) {
							_this2._ProjectSelect = child;
						} })
				),
				React.createElement(
					'div',
					{ id: 'content' },
					React.createElement(FileList, { path: active.path, ref: function ref(child) {
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

// let projects = config.get('projects');

var Projects = require('./components/Projects');

ReactDOM.render(React.createElement(Projects, null), document.getElementById('app'));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29tcG9uZW50cy9GaWxlTGlzdC5qcyIsImFwcC9qcy9jb21wb25lbnRzL1Byb2plY3RTZWxlY3QuanMiLCJhcHAvanMvY29tcG9uZW50cy9Qcm9qZWN0cy5qcyIsImFwcC9qcy9yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7QUFFQSxJQUFNLFVBQVUsUUFBUSxVQUFSLENBQWhCO0FBQ0EsSUFBTSxLQUFLLFFBQVEsWUFBUixDQUFzQixRQUFRLElBQVIsQ0FBdEIsQ0FBWDtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLFNBQVMsYUFBVCxDQUF3QixJQUF4QixFQUF3RDtBQUFBLEtBQTFCLE9BQTBCLHVFQUFoQixFQUFnQjtBQUFBLEtBQVosS0FBWSx1RUFBSixDQUFJOztBQUN2RDtBQUNBLEtBQUssUUFBUSxLQUFSLElBQWlCLFFBQVEsUUFBUSxLQUF0QyxFQUE4QztBQUM3QyxTQUFPLElBQVA7QUFDQTs7QUFFRCxLQUFNLE9BQU8sS0FBSyxRQUFMLENBQWUsSUFBZixDQUFiO0FBQ0EsS0FBTSxPQUFPLEVBQUUsVUFBRixFQUFRLFVBQVIsRUFBYjs7QUFFQSxLQUFJLGNBQUo7O0FBRUEsS0FBSTtBQUNILFVBQVEsR0FBRyxRQUFILENBQVksSUFBWixDQUFSO0FBQ0EsRUFGRCxDQUVFLE9BQU8sR0FBUCxFQUFhO0FBQ2QsVUFBUSxHQUFSLENBQWEsR0FBYjtBQUNBLFNBQU8sSUFBUDtBQUNBOztBQUVEO0FBQ0EsS0FBSyxXQUFXLFFBQVEsT0FBbkIsSUFBOEIsUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQXNCLElBQXRCLENBQW5DLEVBQWtFO0FBQ2pFLFNBQU8sSUFBUDtBQUNBOztBQUVE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LGtCQUFnQixNQUFNLE1BQU4sQ0FBYSxPQUFiLENBQXFCLElBQXJCLENBQWhCO0FBQ0E7O0FBRUQsS0FBSyxjQUFjLE9BQWQsQ0FBc0IsSUFBM0IsRUFBa0M7QUFDakMsVUFBUSxHQUFSLENBQWEsS0FBSyxLQUFMLENBQVksbUJBQW9CLGNBQWMsT0FBZCxDQUFzQixJQUExQyxDQUFaLENBQWI7QUFDQTtBQUNELENBVkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qIGpzaGludCBlc3ZlcnNpb246NiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuY29uc3QgUEFUSCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IG5hbWUgPSBQQVRILmJhc2VuYW1lKCBwYXRoICk7XG5cdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRsZXQgc3RhdHM7XG5cblx0dHJ5IHtcblx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHR9IGNhdGNoKCBlcnIgKSB7XG5cdFx0Y29uc29sZS5sb2coIGVyciApO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgKSB7XG5cdFx0cmV0dXJuIG51bGw7ICBcblx0fVxuXG5cdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0Y29uc3QgZXh0ID0gUEFUSC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblx0XHRcblx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0bGV0IGZpbGVzID0ge307XG5cblx0XHR0cnkge1xuXHRcdFx0ZmlsZXMgPSBmcy5yZWFkZGlyU3luYyggcGF0aCApO1xuXHRcdH0gY2F0Y2goIGVyciApIHtcblx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggZmlsZXMgPT09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRpdGVtLmNoaWxkcmVuID0gZmlsZXNcblx0XHRcdC5tYXAoIGNoaWxkID0+IGRpcmVjdG9yeVRyZWUoIFBBVEguam9pbiggcGF0aCwgY2hpbGQgKSwgb3B0aW9ucywgZGVwdGggKyAxICkgKVxuXHRcdFx0LmZpbHRlciggZSA9PiAhIWUgKTtcblx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0Ly8gfSwgMCApO1xuXHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdH1cblxuXHRyZXR1cm4gaXRlbTtcbn1cblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRmaWxlczoge30sXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRdXG5cdFx0fTtcblxuXHRcdHRoaXMuZGlyQ2xpY2sgID0gdGhpcy5kaXJDbGljay5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5maWxlQ2xpY2sgPSB0aGlzLmZpbGVDbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHRoaXMuc2V0UGF0aCggdGhpcy5wcm9wcy5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0aXNGaWxlSWdub3JlZCggZmlsZW5hbWUgKSB7XG5cdFx0Zm9yICggdmFyIGkgPSB0aGlzLnN0YXRlLmlnbm9yZWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG5cdFx0XHRpZiAoIGZpbGVuYW1lID09PSB0aGlzLnN0YXRlLmlnbm9yZWRbIGkgXSApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdGlmICggbnVsbCAhPT0gZXh0ICkge1xuXHRcdFx0ZXh0ID0gZXh0LnJlcGxhY2UoICcuJywgJycgKTtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICdzdmcnOlxuXHRcdFx0Y2FzZSAncG5nJzpcblx0XHRcdGNhc2UgJ2pwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAncGhwJzpcblx0XHRcdGNhc2UgJ2h0bWwnOlxuXHRcdFx0Y2FzZSAnY3NzJzpcblx0XHRcdGNhc2UgJ3Njc3MnOlxuXHRcdFx0Y2FzZSAnanMnOlxuXHRcdFx0Y2FzZSAnanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICd6aXAnOlxuXHRcdFx0Y2FzZSAncmFyJzpcblx0XHRcdGNhc2UgJ3Rhcic6XG5cdFx0XHRjYXNlICc3eic6XG5cdFx0XHRjYXNlICdneic6XG5cdFx0XHRcdHR5cGUgPSAnemlwJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSAndGV4dCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0c2V0UGF0aCggcGF0aCApIHtcblx0XHRpZiAoIHBhdGggPT09IHRoaXMuc3RhdGUucGF0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHBhdGg6IHBhdGgsXG5cdFx0XHRmaWxlczogZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0XHRkZXB0aDogMyxcblx0XHRcdFx0ZXhjbHVkZTogbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICksXG5cdFx0XHR9IClcblx0XHR9KTtcblx0fVxuXG5cdGRpckNsaWNrKCBldmVudCApIHtcblx0XHQvLyBldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdGxldCBlbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldDtcblxuXHRcdGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZXhwYW5kJyk7XG5cblx0XHRpZiAoIGVsZW1lbnQuZGF0YXNldC5sYXp5bG9hZCApIHtcblx0XHRcdC8vIExvYWQgdGhlIGZpbGVzIGluIHRoaXMgZGlyZWN0b3J5LlxuXHRcdFx0bGV0IGZpbGUgPSBkaXJlY3RvcnlUcmVlKCBlbGVtZW50LmRhdGFzZXQubGF6eWxvYWQgKTtcblxuXHRcdFx0UmVhY3RET00ucmVuZGVyKFxuXHRcdFx0XHR0aGlzLmJ1aWxkVHJlZSggZmlsZSApLFxuXHRcdFx0XHRlbGVtZW50XG5cdFx0XHQpO1xuXG5cdFx0XHRkZWxldGUgZWxlbWVudC5kYXRhc2V0Lmxhenlsb2FkO1xuXHRcdH1cblx0fVxuXG5cdGZpbGVDbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCApIHtcblx0XHRsZXQgdHlwZSA9IGZpbGUudHlwZSxcblx0XHRcdGV4dCAgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsLFxuXHRcdFx0b25DbGljayxcblx0XHRcdGxhenlsb2FkLFxuXHRcdFx0Y2hpbGRyZW47XG5cblx0XHQvLyBTa2lwIGlnbm9yZWQgZmlsZXMuXG5cdFx0Ly8gaWYgKCB0aGlzLmlzRmlsZUlnbm9yZWQoIGZpbGUubmFtZSApICkge1xuXHRcdC8vIFx0cmV0dXJuIG51bGw7XG5cdFx0Ly8gfVxuXG5cdFx0bGV2ZWwgPSBsZXZlbCB8fCAwO1xuXG5cdFx0aWYgKCAnZGlyZWN0b3J5JyA9PT0gZmlsZS50eXBlICkge1xuXHRcdFx0aWYgKCBmaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxldCBjaGlsZHJlbkl0ZW1zID0gW107XG5cblx0XHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIGZpbGUuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JdGVtcy5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggZmlsZS5jaGlsZHJlblsgY2hpbGQgXSwgbGV2ZWwgKyAxICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT1cImNoaWxkcmVuXCIga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGF6eWxvYWQgPSBmaWxlLnBhdGg7XG5cdFx0XHR9XG5cblx0XHRcdG9uQ2xpY2sgPSB0aGlzLmRpckNsaWNrO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gdGhpcy5nZXRNaW1lVHlwZSggZXh0ICk7XG5cdFx0XHRvbkNsaWNrID0gdGhpcy5maWxlQ2xpY2s7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyB0eXBlIH0ga2V5PXsgZmlsZS5wYXRoIH0gZGF0YS1sYXp5bG9hZD17IGxhenlsb2FkIH0gb25DbGljaz17IG9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmaWxlbmFtZVwiPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCBsZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJpY29uXCI+PC9zcGFuPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyBmaWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyBjaGlsZHJlbiB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJUcmVlKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gPGxpIGNsYXNzTmFtZT1cImVtcHR5XCI+Tm8gcGF0aCBzcGVjaWZpZWQ8L2xpPjtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuc3RhdGUuZmlsZXMgKSB7XG5cdFx0XHRyZXR1cm4gPGxpIGNsYXNzTmFtZT1cImVtcHR5XCI+Tm8gZmlsZXM8L2xpPjtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyggdGhpcy5zdGF0ZS5maWxlcyApO1xuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMuc3RhdGUuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnN0YXRlLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMuc3RhdGUuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbGlzdDtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPVwiZmlsZXNcIj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDsiLCJjb25zdCBzaGVsbCAgICA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuc2hlbGw7XG5jb25zdCBvcyAgICAgICA9IHJlcXVpcmUoJ29zJyk7XG5jb25zdCBSZWFjdCAgICA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0X0ZpbGVMaXN0OiBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0Y3VycmVudFByb2plY3Q6IHByb3BzLmFjdGl2ZSxcblx0XHR9O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHQvLyB0aGlzLl9GaWxlTGlzdC5zZXRQYXRoKCB0aGlzLnN0YXRlLmN1cnJlbnRQcm9qZWN0LnBhdGggKTtcblx0fVxuXG5cdHNldEZpbGVMaXN0KCBGaWxlTGlzdCApIHtcblx0XHR0aGlzLl9GaWxlTGlzdCA9IEZpbGVMaXN0O1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3JhcCcpLmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgISBwcmV2U3RhdGUuaXNPcGVuICk7XG5cblx0XHRcdHJldHVybiB7IGlzT3BlbjogISBwcmV2U3RhdGUuaXNPcGVuIH07XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0dmFyIHByb2plY3QgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdGlmICggJ25ldycgPT09IHByb2plY3QgKSB7XG5cdFx0XHR0aGlzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblx0fVxuXG5cdGNoYW5nZVByb2plY3QoIHByb2plY3QgKSB7XG5cdFx0dGhpcy5fRmlsZUxpc3Quc2V0UGF0aCggdGhpcy5wcm9wcy5wcm9qZWN0c1sgcHJvamVjdCBdLnBhdGggKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBjdXJyZW50UHJvamVjdDogdGhpcy5wcm9wcy5wcm9qZWN0c1sgcHJvamVjdCBdIH07XG5cdFx0fSk7XG5cdH1cblxuXHRuZXdQcm9qZWN0KCkge1xuXHRcdHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIoIG9zLmhvbWVkaXIoKSApO1xuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMucHJvcHMucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT1cIm5ld1wiIGRhdGEtcHJvamVjdD1cIm5ld1wiIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9XCJwcm9qZWN0LXNlbGVjdFwiPlxuXHRcdFx0XHQ8ZGl2IGlkPVwicHJvamVjdC1hY3RpdmVcIiBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnN0YXRlLmN1cnJlbnRQcm9qZWN0Lm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5zdGF0ZS5jdXJyZW50UHJvamVjdC5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD1cInByb2plY3Qtc2VsZWN0LWRyb3Bkb3duXCIgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U2VsZWN0OyIsIi8qIGpzaGludCBlc3ZlcnNpb246NiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL0ZpbGVMaXN0Jyk7XG5cbi8vIGxldCBwcm9qZWN0cyA9IGNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cbmxldCBwcm9qZWN0cyA9IFtcblx0eyBuYW1lOiAnQnVpbGRyJywgcGF0aDogJ0U6L0FwcHMvQnVpbGRyJyB9LFxuXHR7IG5hbWU6ICdOVE4nLCBwYXRoOiAnRTovU2l0ZXMvTlROJyB9LFxuXHR7IG5hbWU6ICdNU08nLCBwYXRoOiAnRTovU2l0ZXMvTVNPJyB9LFxuXTtcblxubGV0IGFjdGl2ZSA9IHtcblx0bmFtZTogJ0J1aWxkcicsXG5cdHBhdGg6ICdFOi9BcHBzL0J1aWxkcicsXG59O1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdF9Qcm9qZWN0U2VsZWN0OiBQcm9qZWN0U2VsZWN0O1xuXHRfUHJvamVjdEZpbGVMaXN0OiBGaWxlTGlzdDtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5fUHJvamVjdFNlbGVjdC5zZXRGaWxlTGlzdCggdGhpcy5fUHJvamVjdEZpbGVMaXN0ICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdDxkaXYgaWQ9XCJoZWFkZXJcIj5cblx0XHRcdFx0PFByb2plY3RTZWxlY3QgcHJvamVjdHM9eyBwcm9qZWN0cyB9IGFjdGl2ZT17IGFjdGl2ZSB9IHJlZj17ICggY2hpbGQgKSA9PiB7IHRoaXMuX1Byb2plY3RTZWxlY3QgPSBjaGlsZDsgfSB9IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDxkaXYgaWQ9XCJjb250ZW50XCI+XG5cdFx0XHRcdDxGaWxlTGlzdCBwYXRoPXsgYWN0aXZlLnBhdGggfSByZWY9eyAoIGNoaWxkICkgPT4geyB0aGlzLl9Qcm9qZWN0RmlsZUxpc3QgPSBjaGlsZDsgfSB9IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDwvUmVhY3QuRnJhZ21lbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RzOyIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYsIG11bHRpc3RyOiB0cnVlICovXG5cbmNvbnN0IFN0b3JlICA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5jb25zdCBjb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZycsXG59KTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuLy8gbGV0IHByb2plY3RzID0gY29uZmlnLmdldCgncHJvamVjdHMnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUHJvamVjdHMnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvamVjdHMgLz4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKVxuKTtcblxuLy8gcmVxdWlyZSggJy4vcGx1Z2lucy92ZWxvY2l0eS5taW4uanMnICk7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVfbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpLFxuXHQgIGZpbGVuYW1lcyA9IGZpbGVfbGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZV9saXN0LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0bGV0IGZpbGVuYW1lX2NvbnQgPSBldmVudC50YXJnZXQ7XG5cblx0aWYgKCAnbGknICE9PSBmaWxlbmFtZV9jb250LnRhZ05hbWUgKSB7XG5cdFx0ZmlsZW5hbWVfY29udCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdsaScpO1xuXHR9XG5cblx0aWYgKCBmaWxlbmFtZV9jb250LmRhdGFzZXQuZmlsZSApIHtcblx0XHRjb25zb2xlLmxvZyggSlNPTi5wYXJzZSggZGVjb2RlVVJJQ29tcG9uZW50KCBmaWxlbmFtZV9jb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG4iXX0=
