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

global.ui = require('./utils/globalUI');

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

},{"./components/projects/Projects":13,"./utils/globalUI":15,"electron-store":undefined,"react":undefined,"react-dom":undefined}],2:[function(require,module,exports){
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
 * @file Component for a save file field.
 */

var dialog = require('electron').remote.dialog;

var _require = require('../../utils/pathHelpers'),
    fileRelativePath = _require.fileRelativePath;

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
			} else if (this.state.path) {
				fileSaveOptions.defaultPath = this.state.path;
			}

			if (this.props.dialogFilters) {
				fileSaveOptions.filters = this.props.dialogFilters;
			}

			var filename = dialog.showSaveDialog(fileSaveOptions);

			if (filename) {
				var savePath = filename;

				if (this.props.relativeTo) {
					savePath = fileRelativePath(this.props.relativeTo, filename);
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
					type: 'text',
					name: this.props.name,
					onClick: this.onClick,
					id: 'field_' + this.props.name,
					value: this.state.path,
					readOnly: 'true'
				})
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
	dialogFilters: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

module.exports = FieldSaveFile;

},{"../../utils/pathHelpers":16,"./Field":2,"electron":undefined,"prop-types":undefined,"react":undefined}],4:[function(require,module,exports){
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
	onChange: PropTypes.func,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	options: PropTypes.object.isRequired
};

module.exports = FieldSelect;

},{"./Field":2,"prop-types":undefined,"react":undefined}],5:[function(require,module,exports){
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
	onChange: PropTypes.func,
	value: PropTypes.bool
};

module.exports = FieldSwitch;

},{"./Field":2,"prop-types":undefined,"react":undefined}],6:[function(require,module,exports){
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
					base: this.props.path,
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

},{"./FileListDirectory":7,"./FileListFile":8,"react":undefined}],7:[function(require,module,exports){
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

},{"react":undefined}],8:[function(require,module,exports){
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
					return React.createElement(FileOptionsStylesheet, { base: this.props.base, file: file });
				case '.js':
				case '.ts':
				case '.jsx':
					return React.createElement(FileOptionsScript, { base: this.props.base, file: file });
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

},{"../fileoptions/FileOptionsScript":10,"../fileoptions/FileOptionsStylesheet":11,"react":undefined,"react-dom":undefined}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering build options for a file.
 */

var _require = require('../../utils/pathHelpers'),
    fileRelativePath = _require.fileRelativePath,
    fileOutputPath = _require.fileOutputPath;

var React = require('react');

var FileOptions = function (_React$Component) {
	_inherits(FileOptions, _React$Component);

	function FileOptions(props) {
		_classCallCheck(this, FileOptions);

		var _this = _possibleConstructorReturn(this, (FileOptions.__proto__ || Object.getPrototypeOf(FileOptions)).call(this, props));

		_this.state = {
			options: _this.constructor.getOptionsFromConfig(props.base, props.file)
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
		value: function updateFileOptions() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			if (!global.projectConfig || !options) {
				window.alert('There was a problem saving the project configuration.');
				return;
			}

			var filePath = fileRelativePath(this.props.base, this.props.file.path);

			var files = global.projectConfig.get('files', []);
			var fileIndex = files.findIndex(function (file) {
				return file.path === filePath;
			});

			if (fileIndex === -1) {
				files.push({
					path: filePath,
					options: options
				});
			} else {
				files[fileIndex].options = options;
			}

			global.projectConfig.set('files', files);
		}
	}, {
		key: 'defaultOutputPath',
		value: function defaultOutputPath() {
			return fileOutputPath(this.props.file);
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}], [{
		key: 'getDerivedStateFromProps',
		value: function getDerivedStateFromProps(nextProps) {
			var options = FileOptions.getOptionsFromConfig(nextProps.base, nextProps.file);

			return { options: options };
		}
	}, {
		key: 'getOptionsFromConfig',
		value: function getOptionsFromConfig(base, file) {
			if (file && global.projectConfig) {
				var filePath = fileRelativePath(base, file.path);

				var files = global.projectConfig.get('files', []);
				var cfile = files.find(function (cfile) {
					return cfile.path === filePath;
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

},{"../../utils/pathHelpers":16,"react":undefined}],10:[function(require,module,exports){
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

var FieldSaveFile = require('../fields/FieldSaveFile');

var FileOptionsScript = function (_FileOptions) {
	_inherits(FileOptionsScript, _FileOptions);

	function FileOptionsScript() {
		_classCallCheck(this, FileOptionsScript);

		return _possibleConstructorReturn(this, (FileOptionsScript.__proto__ || Object.getPrototypeOf(FileOptionsScript)).apply(this, arguments));
	}

	_createClass(FileOptionsScript, [{
		key: 'saveDialogFilters',
		value: function saveDialogFilters() {
			return [{ name: 'JavaScript', extensions: ['js'] }];
		}
	}, {
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
					React.createElement(FieldSaveFile, {
						name: 'output',
						label: 'Output Path',
						onChange: this.handleChange,
						value: this.getOption('output', this.defaultOutputPath()),
						sourceFile: this.props.file,
						relativeTo: this.props.base,
						dialogFilters: this.saveDialogFilters()
					}),
					React.createElement('hr', null),
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

},{"../fields/FieldSaveFile":3,"../fields/FieldSwitch":5,"./FileOptions":9,"react":undefined}],11:[function(require,module,exports){
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
						value: this.getOption('style', 'nested'),
						options: this.styleOptions()
					})
				)
			);
		}
	}]);

	return FileOptionsStylesheet;
}(FileOptions);

module.exports = FileOptionsStylesheet;

},{"../fields/FieldSelect":4,"../fields/FieldSwitch":5,"./FileOptions":9,"react":undefined}],12:[function(require,module,exports){
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

},{"electron":undefined,"path":undefined,"react":undefined}],13:[function(require,module,exports){
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

var directoryTree = require('../../utils/directoryTree');

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

},{"../../utils/directoryTree":14,"../filelist/FileList":6,"./ProjectSelect":12,"electron-store":undefined,"react":undefined}],14:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
	var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-dist';

	return file.name.replace(/\.[^/.]+$/, '') + suffix + file.extension;
}

function fileRelativePath(from, to) {
	return slash(path.relative(from, to));
}

module.exports = {
	slash: slash,
	fileOutputPath: fileOutputPath,
	fileRelativePath: fileRelativePath
};

},{"path":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGVzaGVldC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsImFwcC9qcy91dGlscy9kaXJlY3RvcnlUcmVlLmpzIiwiYXBwL2pzL3V0aWxzL2dsb2JhbFVJLmpzIiwiYXBwL2pzL3V0aWxzL3BhdGhIZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLElBQU0sUUFBUSxRQUFRLGdCQUFSLENBQWQ7O0FBRUEsT0FBTyxNQUFQLEdBQWdCLElBQUksS0FBSixDQUFVO0FBQ3pC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LFFBQU8sTUFBTyxLQUFLLFFBQUwsQ0FBZSxJQUFmLEVBQXFCLEVBQXJCLENBQVAsQ0FBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQiwrQkFGZ0I7QUFHaEI7QUFIZ0IsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5jb25zdCBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm9qZWN0cyAvPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpXG4pO1xuXG4vLyBDb250ZXh0IG1lbnUuXG5jb25zdCBmaWxlTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpO1xuLy8gY29uc3QgZmlsZW5hbWVzID0gZmlsZUxpc3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG5cbmZpbGVMaXN0LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0bGV0IGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldDtcblxuXHRpZiAoIGZpbGVOYW1lQ29udC50YWdOYW1lICE9PSAnbGknICkge1xuXHRcdGZpbGVOYW1lQ29udCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdsaScpO1xuXHR9XG5cblx0aWYgKCBmaWxlTmFtZUNvbnQuZGF0YXNldC5maWxlICkge1xuXHRcdGNvbnNvbGUubG9nKCBKU09OLnBhcnNlKCBkZWNvZGVVUklDb21wb25lbnQoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSApICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHBhdGggPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gJycgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBwYXRoIH07XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnN0YXRlLnBhdGggKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnN0YXRlLnBhdGg7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IGZpbGVuYW1lO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMucmVsYXRpdmVUbyApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnJlbGF0aXZlVG8sIGZpbGVuYW1lICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoeyBwYXRoOiBzYXZlUGF0aCB9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCBzYXZlUGF0aCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSd0ZXh0J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5wYXRoIH1cblx0XHRcdFx0XHRyZWFkT25seT0ndHJ1ZSdcblx0XHRcdFx0Lz5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSlcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHNlbGVjdGVkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHNlbGVjdGVkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgc2VsZWN0ZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgc2VsZWN0ZWQ6IGV2ZW50LnRhcmdldC52YWx1ZSB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5zZWxlY3RlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMuc3RhdGUuc2VsZWN0ZWQgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Y2hlY2tlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBjaGVja2VkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgY2hlY2tlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBjaGVja2VkOiAhIHByZXZTdGF0ZS5jaGVja2VkIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLmNoZWNrZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3N3aXRjaCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0Y2hlY2tlZD17IHRoaXMuc3RhdGUuY2hlY2tlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxsYWJlbCBodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfT57IHRoaXMucHJvcHMubGFiZWwgfTwvbGFiZWw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTd2l0Y2gucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ29mZi1jYW52YXMtaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2VtcHR5Jz5cblx0XHRcdFx0XHROb3RoaW5nIHRvIHNlZSBoZXJlLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1NjcmlwdCA9IHJlcXVpcmUoJy4uL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGVzaGVldCA9IHJlcXVpcmUoJy4uL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGVzaGVldCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9ucyggZmlsZSApIHtcblx0XHRpZiAoICEgZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGVzaGVldCBiYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH0gZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpXG5cdFx0KTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIHRydWUsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIEZpbGVMaXN0UGxhY2Vob2xkZXIoIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxsaSBjbGFzc05hbWU9eyBwcm9wcy50eXBlICsgJyBpbmZvcm1hdGl2ZScgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+eyBwcm9wcy5jaGlsZHJlbiB9PC9kaXY+XG5cdFx0PC9saT5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdEZpbGVMaXN0RmlsZSxcblx0RmlsZUxpc3RQbGFjZWhvbGRlclxufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlT3V0cHV0UGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRvcHRpb25zOiB0aGlzLmNvbnN0cnVjdG9yLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBwcm9wcy5iYXNlLCBwcm9wcy5maWxlIClcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzaG91bGRDb21wb25lbnRVcGRhdGUoIG5leHRQcm9wcyApIHtcblx0XHRpZiAoXG5cdFx0XHQhIG5leHRQcm9wcy5maWxlIHx8XG5cdFx0XHQoIHRoaXMucHJvcHMuZmlsZSAmJiBuZXh0UHJvcHMuZmlsZS5wYXRoID09PSB0aGlzLnByb3BzLmZpbGUucGF0aCApXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMgKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4geyBvcHRpb25zOiBvcHRpb25zIH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZS5vcHRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRoYW5kbGVDaGFuZ2UoIGV2ZW50LCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSBwcmV2U3RhdGUub3B0aW9ucztcblx0XHRcdG9wdGlvbnNbIGV2ZW50LnRhcmdldC5uYW1lIF0gPSB2YWx1ZTtcblxuXHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnVwZGF0ZUZpbGVPcHRpb25zKCB0aGlzLnN0YXRlLm9wdGlvbnMgKTtcblx0XHR9KTtcblx0fVxuXG5cdHVwZGF0ZUZpbGVPcHRpb25zKCBvcHRpb25zID0gbnVsbCApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBvcHRpb25zICkge1xuXHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlndXJhdGlvbi4nICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApO1xuXG5cdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdGxldCBmaWxlSW5kZXggPSBmaWxlcy5maW5kSW5kZXgoIGZpbGUgPT4gZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0aWYgKCBmaWxlSW5kZXggPT09IC0xICkge1xuXHRcdFx0ZmlsZXMucHVzaCh7XG5cdFx0XHRcdHBhdGg6IGZpbGVQYXRoLFxuXHRcdFx0XHRvcHRpb25zOiBvcHRpb25zXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9ucztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU2NyaXB0IGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRzYXZlRGlhbG9nRmlsdGVycygpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0eyBuYW1lOiAnSmF2YVNjcmlwdCcsIGV4dGVuc2lvbnM6IFsgJ2pzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXNjcmlwdCc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnb3V0cHV0JywgdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRyZWxhdGl2ZVRvPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzKCkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBjb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nY29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQ29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2NvbXByZXNzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlc2hlZXQgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGlzUGFydGlhbCggZmlsZSApIHtcblx0XHRyZXR1cm4gZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHN0eWxlT3B0aW9ucygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmVzdGVkOiAnTmVzdGVkJyxcblx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnXG5cdFx0fTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCB0aGlzLnByb3BzLmZpbGUgKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLCBpdCBjYW5ub3QgYmUgY29tcGlsZWQgYnkgaXRzZWxmLjwvcD5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBjb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0bmFtZT0nc3R5bGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IHN0eWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0b3B0aW9ucz17IHRoaXMuc3R5bGVPcHRpb25zKCkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzaGVldDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRnbG9iYWwudWkudW5mb2N1cyggISBwcmV2U3RhdGUuaXNPcGVuICk7XG5cblx0XHRcdHJldHVybiB7IGlzT3BlbjogISBwcmV2U3RhdGUuaXNPcGVuIH07XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblx0fVxuXG5cdGNoYW5nZVByb2plY3QoIGluZGV4ICkge1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggaW5kZXggKTtcblx0fVxuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cztcblxuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IG5ld1Byb2plY3QucGF0aCApICE9PSAtMSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0cy5wdXNoKCBuZXdQcm9qZWN0ICk7XG5cblx0XHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdHMoIHByb2plY3RzICk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IHByb2plY3RzLmxlbmd0aCAtIDE7XG5cblx0XHRcdGlmICggcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggYWN0aXZlSW5kZXggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gY2hhbmdpbmcgdGhlIGFjdGl2ZSBwcm9qZWN0LicgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gYWRkIG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgdmlldy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4uL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gW107XG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJydcblx0XHR9O1xuXG5cdFx0aWYgKCBnbG9iYWwuY29uZmlnLmhhcygncHJvamVjdHMnKSApIHtcblx0XHRcdHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdFx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdGFjdGl2ZSA9IHByb2plY3RzWyBhY3RpdmVJbmRleCBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwcm9qZWN0cyxcblx0XHRcdGFjdGl2ZSxcblx0XHRcdGZpbGVzOiBudWxsLFxuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0UHJvamVjdHMgPSB0aGlzLnNldFByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldEFjdGl2ZVByb2plY3QgPSB0aGlzLnNldEFjdGl2ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdHNldFByb2plY3RzKCBwcm9qZWN0cyApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHByb2plY3RzXG5cdFx0fSk7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fVxuXG5cdHNldEFjdGl2ZVByb2plY3QoIGluZGV4ICkge1xuXHRcdGxldCBhY3RpdmUgPSB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdO1xuXG5cdFx0aWYgKCBhY3RpdmUgJiYgYWN0aXZlLnBhdGggIT09IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0YWN0aXZlXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0c2V0UHJvamVjdENvbmZpZyggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cdH1cblxuXHR3YWxrRGlyZWN0b3J5KCBwYXRoICkge1xuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSk7XG5cdH1cblxuXHRzZXRQcm9qZWN0UGF0aCggcGF0aCApIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC51aS5sb2FkaW5nKCk7XG5cblx0XHR0aGlzLndhbGtEaXJlY3RvcnkoIHBhdGggKS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0ZmlsZXMsXG5cdFx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXG5cdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnKCBwYXRoICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNldFByb2plY3RzPXsgdGhpcy5zZXRQcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzZXRBY3RpdmVQcm9qZWN0PXsgdGhpcy5zZXRBY3RpdmVQcm9qZWN0IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMuc3RhdGUuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvZmZDYW52YXMoIHRvZ2dsZSA9IHRydWUsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnb2ZmLWNhbnZhcycsIHRvZ2dsZSApO1xuXG5cdGlmICggdG9nZ2xlICkge1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1zaG93JykgKTtcblxuXHRcdHJlbW92ZUZvY3VzKFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29mZi1jYW52YXMnKSxcblx0XHRcdCdvZmYtY2FudmFzJyxcblx0XHRcdG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1oaWRlJyksXG5cdFx0XHRleGNsdWRlXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ29mZi1jYW52YXMtaGlkZScpICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG9mZkNhbnZhcyxcblx0cmVtb3ZlRm9jdXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBmdW5jdGlvbnMgZm9yIHJlc29sdmluZywgdHJhbnNmb3JtaW5nLCBnZW5lcmF0aW5nIGFuZCBmb3JtYXR0aW5nIHBhdGhzLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvc2xhc2hcbmZ1bmN0aW9uIHNsYXNoKCBpbnB1dCApIHtcblx0Y29uc3QgaXNFeHRlbmRlZExlbmd0aFBhdGggPSAvXlxcXFxcXFxcXFw/XFxcXC8udGVzdChpbnB1dCk7XG5cdGNvbnN0IGhhc05vbkFzY2lpID0gL1teXFx1MDAwMC1cXHUwMDgwXSsvLnRlc3QoaW5wdXQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnRyb2wtcmVnZXhcblxuXHRpZiAoaXNFeHRlbmRlZExlbmd0aFBhdGggfHwgaGFzTm9uQXNjaWkpIHtcblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG5mdW5jdGlvbiBmaWxlT3V0cHV0UGF0aCggZmlsZSwgc3VmZml4ID0gJy1kaXN0JyApIHtcblx0cmV0dXJuIGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZmlsZS5leHRlbnNpb247XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gc2xhc2goIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICkgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aFxufTtcbiJdfQ==
