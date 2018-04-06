(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

/**
 * @file Main app script.
 */

var React = require('react');

var ReactDOM = require('react-dom');

var Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./helpers/globalUI');

var Projects = require('./components/projects/Projects');

ReactDOM.render(React.createElement(Projects, null), document.getElementById('app'));

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

},{"./components/projects/Projects":12,"./helpers/globalUI":14,"electron-store":undefined,"react":undefined,"react-dom":undefined}],2:[function(require,module,exports){
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

},{"react":undefined}],3:[function(require,module,exports){
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
	onChange: PropTypes.func.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	options: PropTypes.object.isRequired
};

module.exports = FieldSelect;

},{"./Field":2,"prop-types":undefined,"react":undefined}],4:[function(require,module,exports){
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
	onChange: PropTypes.func.isRequired,
	value: PropTypes.bool
};

module.exports = FieldSwitch;

},{"./Field":2,"prop-types":undefined,"react":undefined}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var React = require('react');

var _require = require('./FileListFile'),
    FileListFile = _require.FileListFile,
    FileListPlaceholder = _require.FileListPlaceholder;

var FileListDirectory = require('./FileListDirectory');

var FileList = function (_React$Component) {
	_inherits(FileList, _React$Component);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

		_this.state = {
			activeFile: null
		};

		_this.setActiveFile = _this.setActiveFile.bind(_this);
		return _this;
	}

	_createClass(FileList, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			document.addEventListener('off-canvas-hide', function () {
				this.setActiveFile(null);
			}.bind(this));
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
		key: 'setActiveFile',
		value: function setActiveFile(element) {
			if (this.state.activeFile && this.state.activeFile === element) {
				return;
			}

			if (element) {
				element.classList.add('active');
			}

			this.setState(function (prevState) {
				if (prevState.activeFile) {
					prevState.activeFile.classList.remove('active', 'has-options');
				}

				return { activeFile: element };
			});
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
					setActiveFile: this.setActiveFile
				});
			}
		}
	}, {
		key: 'renderTree',
		value: function renderTree() {
			if (this.props.loading) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'loading' },
					'Loading \u2026'
				);
			} else if (!this.props.path) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'empty' },
					'No folder selected.'
				);
			} else if (!this.props.files) {
				return React.createElement(
					FileListPlaceholder,
					{ type: 'empty' },
					'Nothing to see here.'
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

},{"./FileListDirectory":6,"./FileListFile":7,"react":undefined}],6:[function(require,module,exports){
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

			global.ui.offCanvas(false);

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

},{"react":undefined}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a file in the filelist.
 */

var React = require('react');

var ReactDOM = require('react-dom');

var FileOptionsScript = require('../fileoptions/FileOptionsScript');

var FileOptionsStylesheet = require('../fileoptions/FileOptionsStylesheet');

var FileListFile = function (_React$Component) {
	_inherits(FileListFile, _React$Component);

	function FileListFile(props) {
		_classCallCheck(this, FileListFile);

		var _this = _possibleConstructorReturn(this, (FileListFile.__proto__ || Object.getPrototypeOf(FileListFile)).call(this, props));

		_this.onClick = _this.onClick.bind(_this);
		return _this;
	}

	_createClass(FileListFile, [{
		key: 'getOptions',
		value: function getOptions(file) {
			if (!file.extension) {
				return null;
			}

			switch (file.extension) {
				case '.css':
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

			this.props.setActiveFile(event.currentTarget);

			var _FileOptions = this.getOptions(this.props.file);

			if (!_FileOptions) {
				global.ui.offCanvas(false);
				return;
			}

			event.currentTarget.classList.add('has-options');

			ReactDOM.render(_FileOptions, document.getElementById('off-canvas'));

			global.ui.offCanvas(true, document.getElementById('files'));
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

module.exports = {
	FileListFile: FileListFile,
	FileListPlaceholder: FileListPlaceholder
};

},{"../fileoptions/FileOptionsScript":9,"../fileoptions/FileOptionsStylesheet":10,"react":undefined,"react-dom":undefined}],8:[function(require,module,exports){
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

	function FileOptions(props) {
		_classCallCheck(this, FileOptions);

		var _this = _possibleConstructorReturn(this, (FileOptions.__proto__ || Object.getPrototypeOf(FileOptions)).call(this, props));

		_this.state = {
			options: _this.constructor.getOptionsFromConfig(props.file)
		};

		_this.handleChange = _this.handleChange.bind(_this);
		return _this;
	}

	_createClass(FileOptions, [{
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps) {
			if (!nextProps.file || this.props.file && nextProps.file.path === this.props.file.path) {
				return false;
			}

			return true;
		}
	}, {
		key: 'getOption',
		value: function getOption(option) {
			var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (this.state.options[option]) {
				return this.state.options[option];
			}

			return defaultValue;
		}
	}, {
		key: 'handleChange',
		value: function handleChange(event, value) {
			this.setState(function (prevState) {
				var options = prevState.options;
				options[event.target.name] = value;

				return options;
			}, function () {
				this.updateFileOptions(this.state.options);
			});
		}
	}, {
		key: 'updateFileOptions',
		value: function updateFileOptions(options) {
			var _this2 = this;

			if (global.projectConfig) {
				var files = global.projectConfig.get('files', []);
				var fileIndex = files.findIndex(function (file) {
					return file.path === _this2.props.file.path;
				});

				if (fileIndex === -1) {
					files.push({
						path: this.props.file.path,
						options: options
					});
				} else {
					files[fileIndex].options = options;
				}

				global.projectConfig.set('files', files);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps) {
			var options = FileOptions.getOptionsFromConfig(nextProps.file);

			return { options: options };
		}
	}, {
		key: 'getOptionsFromConfig',
		value: function getOptionsFromConfig(file) {
			if (file && global.projectConfig) {
				var files = global.projectConfig.get('files', []);
				var cfile = files.find(function (cfile) {
					return cfile.path === file.path;
				});

				if (cfile) {
					return cfile.options;
				}
			}

			return {};
		}
	}]);

	return FileOptions;
}(React.Component);

module.exports = FileOptions;

},{"react":undefined}],9:[function(require,module,exports){
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

var FieldSwitch = require('../fields/FieldSwitch');

var FileOptionsScript = function (_FileOptions) {
	_inherits(FileOptionsScript, _FileOptions);

	function FileOptionsScript() {
		_classCallCheck(this, FileOptionsScript);

		return _possibleConstructorReturn(this, (FileOptionsScript.__proto__ || Object.getPrototypeOf(FileOptionsScript)).apply(this, arguments));
	}

	_createClass(FileOptionsScript, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'file-options', className: 'file-options-script' },
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
						name: 'autocompile',
						label: 'Auto compile',
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
						name: 'sourcemap',
						label: 'Sourcemap',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('sourcemap', false)
					})
				)
			);
		}
	}]);

	return FileOptionsScript;
}(FileOptions);

module.exports = FileOptionsScript;

},{"../fields/FieldSwitch":4,"./FileOptions":8,"react":undefined}],10:[function(require,module,exports){
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

var FieldSwitch = require('../fields/FieldSwitch');

var FieldSelect = require('../fields/FieldSelect');

var FileOptionsStylesheet = function (_FileOptions) {
	_inherits(FileOptionsStylesheet, _FileOptions);

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
		key: 'styleOptions',
		value: function styleOptions() {
			return {
				nested: 'Nested',
				compact: 'Compact',
				expanded: 'Expanded'
			};
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isPartial(this.props.file)) {
				return React.createElement(
					'div',
					{ id: 'file-options', className: 'file-options-style' },
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
				'div',
				{ id: 'file-options', className: 'file-options-style' },
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
						name: 'autocompile',
						label: 'Auto compile',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('autocompile', false)
					}),
					React.createElement('hr', null),
					React.createElement(FieldSelect, {
						name: 'style',
						label: 'Output style',
						labelPos: 'left',
						onChange: this.handleChange,
						value: this.getOption('style'),
						options: this.styleOptions()
					})
				)
			);
		}
	}]);

	return FileOptionsStylesheet;
}(FileOptions);

module.exports = FileOptionsStylesheet;

},{"../fields/FieldSelect":3,"../fields/FieldSwitch":4,"./FileOptions":8,"react":undefined}],11:[function(require,module,exports){
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
			isOpen: false
		};

		_this.newProject = _this.newProject.bind(_this);
		_this.toggleSelect = _this.toggleSelect.bind(_this);
		_this.selectProject = _this.selectProject.bind(_this);
		return _this;
	}

	_createClass(ProjectSelect, [{
		key: 'toggleSelect',
		value: function toggleSelect() {
			this.setState(function (prevState) {
				global.ui.unfocus(!prevState.isOpen);

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
			this.props.setActiveProject(index);
		}
	}, {
		key: 'newProject',
		value: function newProject() {
			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				var projects = this.props.projects;

				var newProject = {
					name: fspath.basename(path[0]),
					path: path[0]
				};

				if (projects.findIndex(function (project) {
					return project.path === newProject.path;
				}) !== -1) {
					return;
				}

				projects.push(newProject);

				this.props.setProjects(projects);

				var activeIndex = projects.length - 1;

				if (projects[activeIndex]) {
					this.props.setActiveProject(activeIndex);
				} else {
					window.alert('There was a problem changing the active project.');
				}
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
					{ id: 'project-select-dropdown', className: this.state.isOpen ? 'open' : '' },
					this.renderChoices()
				)
			);
		}
	}]);

	return ProjectSelect;
}(React.Component);

module.exports = ProjectSelect;

},{"electron":undefined,"path":undefined,"react":undefined}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects view.
 */

var React = require('react');

var Store = require('electron-store');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('../filelist/FileList');

var directoryTree = require('../../helpers/directoryTree');

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

		if (global.config.has('projects')) {
			projects = global.config.get('projects');

			var activeIndex = global.config.get('active-project');

			if (Array.isArray(projects) && projects[activeIndex]) {
				active = projects[activeIndex];
			}
		}

		_this.state = {
			projects: projects,
			active: active,
			files: null,
			ignored: ['.git', 'node_modules', '.DS_Store'],
			loading: false
		};

		_this.setProjects = _this.setProjects.bind(_this);
		_this.setActiveProject = _this.setActiveProject.bind(_this);
		return _this;
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (this.state.active.path) {
				this.setProjectPath(this.state.active.path);
			}
		}
	}, {
		key: 'setProjects',
		value: function setProjects(projects) {
			this.setState({
				projects: projects
			});

			global.config.set('projects', projects);
		}
	}, {
		key: 'setActiveProject',
		value: function setActiveProject(index) {
			var active = this.state.projects[index];

			if (active && active.path !== this.state.active.path) {
				this.setState({
					active: active
				});

				this.setProjectPath(active.path);

				global.config.set('active-project', index);
			}
		}
	}, {
		key: 'setProjectConfig',
		value: function setProjectConfig(path) {
			global.projectConfig = new Store({
				name: 'buildr-project',
				cwd: path
			});
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
		key: 'setProjectPath',
		value: function setProjectPath(path) {
			this.setState({ loading: true });

			global.ui.loading();

			this.walkDirectory(path).then(function (files) {
				this.setState({
					files: files,
					loading: false
				});

				global.ui.loading(false);
			}.bind(this));

			this.setProjectConfig(path);
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				React.Fragment,
				null,
				React.createElement(
					'div',
					{ id: 'header' },
					React.createElement(ProjectSelect, {
						active: this.state.active,
						projects: this.state.projects,
						setProjects: this.setProjects,
						setActiveProject: this.setActiveProject
					})
				),
				React.createElement(
					'div',
					{ id: 'content' },
					React.createElement(FileList, {
						path: this.state.active.path,
						files: this.state.files,
						loading: this.state.loading
					})
				)
			);
		}
	}]);

	return Projects;
}(React.Component);

module.exports = Projects;

},{"../../helpers/directoryTree":13,"../filelist/FileList":5,"./ProjectSelect":11,"electron-store":undefined,"react":undefined}],13:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],14:[function(require,module,exports){
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

	/* global Event */
	document.body.classList.toggle('off-canvas', toggle);

	if (toggle) {
		document.dispatchEvent(new Event('off-canvas-show'));

		removeFocus(document.getElementById('off-canvas'), 'off-canvas', new Event('off-canvas-hide'), exclude);
	} else {
		document.dispatchEvent(new Event('off-canvas-hide'));
	}
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
	offCanvas: offCanvas,
	removeFocus: removeFocus
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGVzaGVldC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsImFwcC9qcy9oZWxwZXJzL2RpcmVjdG9yeVRyZWUuanMiLCJhcHAvanMvaGVscGVycy9nbG9iYWxVSS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsSUFBTSxXQUFXLFFBQVEsV0FBUixDQUFqQjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxnQkFBUixDQUFkOztBQUVBLE9BQU8sTUFBUCxHQUFnQixJQUFJLEtBQUosQ0FBVTtBQUN6QixPQUFNO0FBRG1CLENBQVYsQ0FBaEI7O0FBSUEsT0FBTyxFQUFQLEdBQVksUUFBUSxvQkFBUixDQUFaOztBQUVBLElBQU0s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RixJQUFhLENBQUUsUUFBUSxRQUFSLENBQWtCLE1BQU0sTUFBeEIsQ0FBcEIsRUFBdUQ7QUFDdEQsYUFBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUFnQyxTQUFoQzs7QUFFQSxRQUFLLFlBQUwsRUFBb0I7QUFDbkIsY0FBUyxhQUFULENBQXdCLFlBQXhCO0FBQ0E7QUFDRDtBQUNEO0FBQ0QsRUFaRDs7QUFjQSxLQUFNLHNCQUFzQixTQUF0QixtQkFBc0IsR0FBVztBQUN0QyxXQUFTLG1CQUFULENBQThCLE9BQTlCLEVBQXVDLG9CQUF2QztBQUNBLEVBRkQ7O0FBSUEsVUFBUyxnQkFBVCxDQUEyQixPQUEzQixFQUFvQyxvQkFBcEM7QUFDQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsaUJBRGdCO0FBRWhCLGlCQUZnQjtBQUdoQixxQkFIZ0I7QUFJaEI7QUFKZ0IsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbFVJJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb2plY3RzIC8+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbik7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGVzJyk7XG4vLyBjb25zdCBmaWxlbmFtZXMgPSBmaWxlTGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRsZXQgZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0O1xuXG5cdGlmICggZmlsZU5hbWVDb250LnRhZ05hbWUgIT09ICdsaScgKSB7XG5cdFx0ZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cdH1cblxuXHRpZiAoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSB7XG5cdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UoIGRlY29kZVVSSUNvbXBvbmVudCggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0c2VsZWN0ZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgc2VsZWN0ZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBzZWxlY3RlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBzZWxlY3RlZDogZXZlbnQudGFyZ2V0LnZhbHVlIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLnNlbGVjdGVkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5zZWxlY3RlZCA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5zdGF0ZS5zZWxlY3RlZCBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuc3RhdGUuc2VsZWN0ZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGNoZWNrZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgY2hlY2tlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IGNoZWNrZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgY2hlY2tlZDogISBwcmV2U3RhdGUuY2hlY2tlZCB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5jaGVja2VkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnN0YXRlLmNoZWNrZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdHZhbHVlOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ29mZi1jYW52YXMtaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdHNldEFjdGl2ZUZpbGU9eyB0aGlzLnNldEFjdGl2ZUZpbGUgfVxuXHRcdFx0Lz47XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyVHJlZSgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMubG9hZGluZyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2xvYWRpbmcnPlxuXHRcdFx0XHRcdExvYWRpbmcgJmhlbGxpcDtcblx0XHRcdFx0PC9GaWxlTGlzdFBsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2VtcHR5Jz5cblx0XHRcdFx0XHRObyBmb2xkZXIgc2VsZWN0ZWQuXG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmZpbGVzICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nZW1wdHknPlxuXHRcdFx0XHRcdE5vdGhpbmcgdG8gc2VlIGhlcmUuXG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZWxpc3Q7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyVHJlZSgpIH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3REaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRnbG9iYWwudWkub2ZmQ2FudmFzKCBmYWxzZSApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTY3JpcHQnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTdHlsZXNoZWV0ID0gcmVxdWlyZSgnLi4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZXNoZWV0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCBmaWxlICkge1xuXHRcdGlmICggISBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZXNoZWV0IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpXG5cdFx0KTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIHRydWUsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIEZpbGVMaXN0UGxhY2Vob2xkZXIoIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxsaSBjbGFzc05hbWU9eyBwcm9wcy50eXBlICsgJyBpbmZvcm1hdGl2ZScgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+eyBwcm9wcy5jaGlsZHJlbiB9PC9kaXY+XG5cdFx0PC9saT5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdEZpbGVMaXN0RmlsZSxcblx0RmlsZUxpc3RQbGFjZWhvbGRlclxufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRvcHRpb25zOiB0aGlzLmNvbnN0cnVjdG9yLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBwcm9wcy5maWxlIClcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzaG91bGRDb21wb25lbnRVcGRhdGUoIG5leHRQcm9wcyApIHtcblx0XHRpZiAoXG5cdFx0XHQhIG5leHRQcm9wcy5maWxlIHx8XG5cdFx0XHQoIHRoaXMucHJvcHMuZmlsZSAmJiBuZXh0UHJvcHMuZmlsZS5wYXRoID09PSB0aGlzLnByb3BzLmZpbGUucGF0aCApXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBvcHRpb25zID0gRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4geyBvcHRpb25zOiBvcHRpb25zIH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZS5wYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZS5vcHRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggZXZlbnQsIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRsZXQgb3B0aW9ucyA9IHByZXZTdGF0ZS5vcHRpb25zO1xuXHRcdFx0b3B0aW9uc1sgZXZlbnQudGFyZ2V0Lm5hbWUgXSA9IHZhbHVlO1xuXG5cdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudXBkYXRlRmlsZU9wdGlvbnMoIHRoaXMuc3RhdGUub3B0aW9ucyApO1xuXHRcdH0pO1xuXHR9XG5cblx0dXBkYXRlRmlsZU9wdGlvbnMoIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBmaWxlSW5kZXggPSBmaWxlcy5maW5kSW5kZXgoIGZpbGUgPT4gZmlsZS5wYXRoID09PSB0aGlzLnByb3BzLmZpbGUucGF0aCApO1xuXG5cdFx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRcdGZpbGVzLnB1c2goe1xuXHRcdFx0XHRcdHBhdGg6IHRoaXMucHJvcHMuZmlsZS5wYXRoLFxuXHRcdFx0XHRcdG9wdGlvbnM6IG9wdGlvbnNcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF0ub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0XHR9XG5cblx0XHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9ucztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTY3JpcHQgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zY3JpcHQnPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIGNvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdjb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsPSdDb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnY29tcHJlc3MnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXAnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXAnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzaGVldCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0aXNQYXJ0aWFsKCBmaWxlICkge1xuXHRcdHJldHVybiBmaWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0c3R5bGVPcHRpb25zKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0ZXhwYW5kZWQ6ICdFeHBhbmRlZCdcblx0XHR9O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoIHRoaXMucHJvcHMuZmlsZSApICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHRcdDxwPlRoaXMgaXMgYSBwYXJ0aWFsIGZpbGUsIGl0IGNhbm5vdCBiZSBjb21waWxlZCBieSBpdHNlbGYuPC9wPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIGNvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgc3R5bGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJyApIH1cblx0XHRcdFx0XHRcdG9wdGlvbnM9eyB0aGlzLnN0eWxlT3B0aW9ucygpIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlc2hlZXQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMubmV3UHJvamVjdCA9IHRoaXMubmV3UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0Z2xvYmFsLnVpLnVuZm9jdXMoICEgcHJldlN0YXRlLmlzT3BlbiApO1xuXG5cdFx0XHRyZXR1cm4geyBpc09wZW46ICEgcHJldlN0YXRlLmlzT3BlbiB9O1xuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0KCk7XG5cdH1cblxuXHRjaGFuZ2VQcm9qZWN0KCBpbmRleCApIHtcblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZVByb2plY3QoIGluZGV4ICk7XG5cdH1cblxuXHRuZXdQcm9qZWN0KCkge1xuXHRcdGxldCBwYXRoID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtcblx0XHRcdHByb3BlcnRpZXM6IFsgJ29wZW5EaXJlY3RvcnknIF1cblx0XHR9KTtcblxuXHRcdGlmICggcGF0aCApIHtcblx0XHRcdGxldCBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHM7XG5cblx0XHRcdGxldCBuZXdQcm9qZWN0ID0ge1xuXHRcdFx0XHRuYW1lOiBmc3BhdGguYmFzZW5hbWUoIHBhdGhbMF0gKSxcblx0XHRcdFx0cGF0aDogcGF0aFswXVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cHJvamVjdHMucHVzaCggbmV3UHJvamVjdCApO1xuXG5cdFx0XHR0aGlzLnByb3BzLnNldFByb2plY3RzKCBwcm9qZWN0cyApO1xuXG5cdFx0XHRsZXQgYWN0aXZlSW5kZXggPSBwcm9qZWN0cy5sZW5ndGggLSAxO1xuXG5cdFx0XHRpZiAoIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZVByb2plY3QoIGFjdGl2ZUluZGV4ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIGNoYW5naW5nIHRoZSBhY3RpdmUgcHJvamVjdC4nICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ2hvaWNlcygpIHtcblx0XHRsZXQgY2hvaWNlcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGluZGV4IGluIHRoaXMucHJvcHMucHJvamVjdHMgKSB7XG5cdFx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHRcdDxkaXYga2V5PXsgaW5kZXggfSBkYXRhLXByb2plY3Q9eyBpbmRleCB9IG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMucHJvamVjdHNbIGluZGV4IF0ubmFtZSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjaG9pY2VzLnB1c2goXG5cdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRBZGQgbmV3IHByb2plY3Rcblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gY2hvaWNlcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIGFkZCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuLi9maWxlbGlzdC9GaWxlTGlzdCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vLi4vaGVscGVycy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gW107XG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJydcblx0XHR9O1xuXG5cdFx0aWYgKCBnbG9iYWwuY29uZmlnLmhhcygncHJvamVjdHMnKSApIHtcblx0XHRcdHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdFx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdGFjdGl2ZSA9IHByb2plY3RzWyBhY3RpdmVJbmRleCBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwcm9qZWN0cyxcblx0XHRcdGFjdGl2ZSxcblx0XHRcdGZpbGVzOiBudWxsLFxuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0UHJvamVjdHMgPSB0aGlzLnNldFByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldEFjdGl2ZVByb2plY3QgPSB0aGlzLnNldEFjdGl2ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdHNldFByb2plY3RzKCBwcm9qZWN0cyApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHByb2plY3RzXG5cdFx0fSk7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fVxuXG5cdHNldEFjdGl2ZVByb2plY3QoIGluZGV4ICkge1xuXHRcdGxldCBhY3RpdmUgPSB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdO1xuXG5cdFx0aWYgKCBhY3RpdmUgJiYgYWN0aXZlLnBhdGggIT09IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0YWN0aXZlXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0c2V0UHJvamVjdENvbmZpZyggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cdH1cblxuXHR3YWxrRGlyZWN0b3J5KCBwYXRoICkge1xuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSk7XG5cdH1cblxuXHRzZXRQcm9qZWN0UGF0aCggcGF0aCApIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC51aS5sb2FkaW5nKCk7XG5cblx0XHR0aGlzLndhbGtEaXJlY3RvcnkoIHBhdGggKS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0ZmlsZXMsXG5cdFx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXG5cdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnKCBwYXRoICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNldFByb2plY3RzPXsgdGhpcy5zZXRQcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzZXRBY3RpdmVQcm9qZWN0PXsgdGhpcy5zZXRBY3RpdmVQcm9qZWN0IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMuc3RhdGUuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvZmZDYW52YXMoIHRvZ2dsZSA9IHRydWUsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnb2ZmLWNhbnZhcycsIHRvZ2dsZSApO1xuXG5cdGlmICggdG9nZ2xlICkge1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1zaG93JykgKTtcblxuXHRcdHJlbW92ZUZvY3VzKFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29mZi1jYW52YXMnKSxcblx0XHRcdCdvZmYtY2FudmFzJyxcblx0XHRcdG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1oaWRlJyksXG5cdFx0XHRleGNsdWRlXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ29mZi1jYW52YXMtaGlkZScpICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG9mZkNhbnZhcyxcblx0cmVtb3ZlRm9jdXNcbn07XG4iXX0=
