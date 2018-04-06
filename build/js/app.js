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
				fileSaveOptions.defaultPath = fileAbsolutePath(this.props.sourceFile.path);
			} else if (this.state.path && this.props.sourceBase) {
				fileSaveOptions.defaultPath = fileAbsolutePath(this.props.sourceBase, this.state.path);
			}

			console.log(fileSaveOptions.defaultPath);

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
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath;

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

			var filePath = slash(fileRelativePath(this.props.base, this.props.file.path));

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
				var filePath = slash(fileRelativePath(base, file.path));

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

var _require = require('../../utils/pathHelpers'),
    fileRelativePath = _require.fileRelativePath,
    fileOutputPath = _require.fileOutputPath;

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
		key: 'defaultOutputPath',
		value: function defaultOutputPath() {
			var suffix = this.getOption('compress', false) ? '.min' : '-dist';
			var extension = '.js';

			return fileRelativePath(this.props.base, fileOutputPath(this.props.file, suffix, extension));
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
						sourceBase: this.props.base,
						dialogFilters: this.saveDialogFilters()
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

},{"../../utils/pathHelpers":16,"../fields/FieldSaveFile":3,"../fields/FieldSwitch":5,"./FileOptions":9,"react":undefined}],11:[function(require,module,exports){
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

var FieldSaveFile = require('../fields/FieldSaveFile');

var _require = require('../../utils/pathHelpers'),
    fileRelativePath = _require.fileRelativePath,
    fileOutputPath = _require.fileOutputPath;

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
		key: 'saveDialogFilters',
		value: function saveDialogFilters() {
			return [{ name: 'CSS', extensions: ['css'] }];
		}
	}, {
		key: 'defaultOutputPath',
		value: function defaultOutputPath() {
			var suffix = '-dist';
			var extension = '.css';

			return fileRelativePath(this.props.base, fileOutputPath(this.props.file, suffix, extension));
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
					React.createElement(FieldSaveFile, {
						name: 'output',
						label: 'Output Path',
						onChange: this.handleChange,
						value: this.getOption('output', this.defaultOutputPath()),
						sourceFile: this.props.file,
						sourceBase: this.props.base,
						dialogFilters: this.saveDialogFilters()
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
					React.createElement(FieldSelect, {
						name: 'style',
						label: 'Output Style',
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

},{"../../utils/pathHelpers":16,"../fields/FieldSaveFile":3,"../fields/FieldSelect":4,"../fields/FieldSwitch":5,"./FileOptions":9,"react":undefined}],12:[function(require,module,exports){
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

},{"path":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGVzaGVldC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsImFwcC9qcy91dGlscy9kaXJlY3RvcnlUcmVlLmpzIiwiYXBwL2pzL3V0aWxzL2dsb2JhbFVJLmpzIiwiYXBwL2pzL3V0aWxzL3BhdGhIZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztBQUVBLElBQU0sUUFBUSxRQUFRLGdCQUFSLENBQWQ7O0FBRUEsT0FBTyxNQUFQLEdBQWdCLElBQUksS0FBSixDQUFVO0FBQ3pC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QUFLLElBQWpCLEVBQXdCLEdBQXRDO0FBQ0EsS0FBSSxXQUFXLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsV0FBbEIsRUFBK0IsRUFBL0IsSUFBcUMsTUFBckMsR0FBOEMsU0FBN0Q7O0FBRUEsUUFBTyxLQUFLLElBQUwsQ0FBVyxPQUFYLEVBQW9CLFFBQXBCLENBQVA7QUFDQTs7QUFFRCxTQUFTLGdCQUFULENBQTJCLElBQTNCLEVBQWlDLEVBQWpDLEVBQXNDO0FBQ3JDLFFBQU8sS0FBSyxRQUFMLENBQWUsSUFBZixFQUFxQixFQUFyQixDQUFQO0FBQ0E7O0FBRUQsU0FBUyxnQkFBVCxDQUEyQixJQUEzQixFQUFpQyxRQUFqQyxFQUE0QztBQUMzQyxRQUFTLEtBQUssVUFBTCxDQUFpQixRQUFqQixDQUFGLEdBQWtDLFFBQWxDLEdBQTZDLEtBQUssSUFBTCxDQUFXLElBQVgsRUFBaUIsUUFBakIsQ0FBcEQ7QUFDQTs7QUFFRCxTQUFTLGVBQVQsQ0FBMEIsSUFBMUIsRUFBZ0MsUUFBaEMsRUFBMkM7QUFDMUMsUUFBTyxLQUFLLEtBQUwsQ0FBWSxpQkFBa0IsSUFBbEIsRUFBd0IsUUFBeEIsQ0FBWixFQUFpRCxHQUF4RDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQiwrQkFGZ0I7QUFHaEIsbUNBSGdCO0FBSWhCLG1DQUpnQjtBQUtoQjtBQUxnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb2plY3RzIC8+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbik7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGVzJyk7XG4vLyBjb25zdCBmaWxlbmFtZXMgPSBmaWxlTGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRsZXQgZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0O1xuXG5cdGlmICggZmlsZU5hbWVDb250LnRhZ05hbWUgIT09ICdsaScgKSB7XG5cdFx0ZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cdH1cblxuXHRpZiAoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSB7XG5cdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UoIGRlY29kZVVSSUNvbXBvbmVudCggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgc2F2ZSBmaWxlIGZpZWxkLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHBhdGggPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gJycgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBwYXRoIH07XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aCApO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMuc3RhdGUucGF0aCApO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCBmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmZpbHRlcnMgPSB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gZGlhbG9nLnNob3dTYXZlRGlhbG9nKCBmaWxlU2F2ZU9wdGlvbnMgKTtcblxuXHRcdGlmICggZmlsZW5hbWUgKSB7XG5cdFx0XHRsZXQgc2F2ZVBhdGggPSBzbGFzaCggZmlsZW5hbWUgKTtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRcdHNhdmVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgZmlsZW5hbWUgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHsgcGF0aDogc2F2ZVBhdGggfSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgc2F2ZVBhdGggKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0ndGV4dCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuc3RhdGUucGF0aCB9XG5cdFx0XHRcdFx0cmVhZE9ubHk9J3RydWUnXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRzZWxlY3RlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBzZWxlY3RlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHNlbGVjdGVkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IHNlbGVjdGVkOiBldmVudC50YXJnZXQudmFsdWUgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuc2VsZWN0ZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnNlbGVjdGVkID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnN0YXRlLnNlbGVjdGVkIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5zZWxlY3RlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGNoZWNrZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgY2hlY2tlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IGNoZWNrZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgY2hlY2tlZDogISBwcmV2U3RhdGUuY2hlY2tlZCB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5jaGVja2VkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnN0YXRlLmNoZWNrZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IEZpbGVMaXN0RmlsZSwgRmlsZUxpc3RQbGFjZWhvbGRlciB9ID0gcmVxdWlyZSgnLi9GaWxlTGlzdEZpbGUnKTtcblxuY29uc3QgRmlsZUxpc3REaXJlY3RvcnkgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RGlyZWN0b3J5Jyk7XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGFjdGl2ZUZpbGU6IG51bGxcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRBY3RpdmVGaWxlID0gdGhpcy5zZXRBY3RpdmVGaWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdvZmYtY2FudmFzLWhpZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICcuc3ZnJzpcblx0XHRcdGNhc2UgJy5wbmcnOlxuXHRcdFx0Y2FzZSAnLmpwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnBocCc6XG5cdFx0XHRjYXNlICcuaHRtbCc6XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcuemlwJzpcblx0XHRcdGNhc2UgJy5yYXInOlxuXHRcdFx0Y2FzZSAnLnRhcic6XG5cdFx0XHRjYXNlICcuN3onOlxuXHRcdFx0Y2FzZSAnLmd6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRzZXRBY3RpdmVGaWxlKCBlbGVtZW50ICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5hY3RpdmVGaWxlICYmIHRoaXMuc3RhdGUuYWN0aXZlRmlsZSA9PT0gZWxlbWVudCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGVsZW1lbnQgKSB7XG5cdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRpZiAoIHByZXZTdGF0ZS5hY3RpdmVGaWxlICkge1xuXHRcdFx0XHRwcmV2U3RhdGUuYWN0aXZlRmlsZS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnLCAnaGFzLW9wdGlvbnMnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgYWN0aXZlRmlsZTogZWxlbWVudCB9O1xuXHRcdH0pXG5cdH1cblxuXHRidWlsZFRyZWUoIGZpbGUsIGxldmVsID0gMCApIHtcblx0XHRsZXQgdHlwZSA9IGZpbGUudHlwZTtcblx0XHRsZXQgZXh0ID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbDtcblx0XHRsZXQgY2hpbGRyZW47XG5cblx0XHRpZiAoIGZpbGUudHlwZSA9PT0gJ2RpcmVjdG9yeScgKSB7XG5cdFx0XHRpZiAoIGZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0bGV0IGNoaWxkcmVuSXRlbXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gZmlsZS5jaGlsZHJlbiApIHtcblx0XHRcdFx0XHRjaGlsZHJlbkl0ZW1zLnB1c2goIHRoaXMuYnVpbGRUcmVlKCBmaWxlLmNoaWxkcmVuWyBjaGlsZCBdLCBsZXZlbCArIDEgKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2hpbGRyZW4gPSA8dWwgY2xhc3NOYW1lPSdjaGlsZHJlbicga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RGlyZWN0b3J5XG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGNoaWxkcmVuPXsgY2hpbGRyZW4gfVxuXHRcdFx0Lz47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdEZpbGVcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHR0eXBlPXsgdHlwZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRiYXNlPXsgdGhpcy5wcm9wcy5wYXRoIH1cblx0XHRcdFx0c2V0QWN0aXZlRmlsZT17IHRoaXMuc2V0QWN0aXZlRmlsZSB9XG5cdFx0XHQvPjtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJUcmVlKCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5sb2FkaW5nICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0TG9hZGluZyAmaGVsbGlwO1xuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nZW1wdHknPlxuXHRcdFx0XHRcdE5vIGZvbGRlciBzZWxlY3RlZC5cblx0XHRcdFx0PC9GaWxlTGlzdFBsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuZmlsZXMgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm90aGluZyB0byBzZWUgaGVyZS5cblx0XHRcdFx0PC9GaWxlTGlzdFBsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiAmJiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5LlxuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbGlzdDtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPSdmaWxlcyc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJUcmVlKCkgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdERpcmVjdG9yeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRleHBhbmRlZDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIGZhbHNlICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgZXhwYW5kZWQ6ICEgcHJldlN0YXRlLmV4cGFuZGVkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0Y2xhc3NOYW1lICs9ICcgZXhwYW5kJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9IG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RGlyZWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGZpbGUgaW4gdGhlIGZpbGVsaXN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlc2hlZXQgPSByZXF1aXJlKCcuLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlc2hlZXQnKTtcblxuY2xhc3MgRmlsZUxpc3RGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbnMoIGZpbGUgKSB7XG5cdFx0aWYgKCAhIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdFx0cmV0dXJuIDxGaWxlT3B0aW9uc1N0eWxlc2hlZXQgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfSBmaWxlPXsgZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKTtcblxuXHRcdGxldCBfRmlsZU9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0aWYgKCAhIF9GaWxlT3B0aW9ucyApIHtcblx0XHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIGZhbHNlICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQuY3VycmVudFRhcmdldC5jbGFzc0xpc3QuYWRkKCdoYXMtb3B0aW9ucycpO1xuXG5cdFx0UmVhY3RET00ucmVuZGVyKFxuXHRcdFx0X0ZpbGVPcHRpb25zLFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29mZi1jYW52YXMnKVxuXHRcdCk7XG5cblx0XHRnbG9iYWwudWkub2ZmQ2FudmFzKCB0cnVlLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZXMnKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBGaWxlTGlzdFBsYWNlaG9sZGVyKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8bGkgY2xhc3NOYW1lPXsgcHJvcHMudHlwZSArICcgaW5mb3JtYXRpdmUnIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPnsgcHJvcHMuY2hpbGRyZW4gfTwvZGl2PlxuXHRcdDwvbGk+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRGaWxlTGlzdEZpbGUsXG5cdEZpbGVMaXN0UGxhY2Vob2xkZXJcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0b3B0aW9uczogdGhpcy5jb25zdHJ1Y3Rvci5nZXRPcHRpb25zRnJvbUNvbmZpZyggcHJvcHMuYmFzZSwgcHJvcHMuZmlsZSApXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c2hvdWxkQ29tcG9uZW50VXBkYXRlKCBuZXh0UHJvcHMgKSB7XG5cdFx0aWYgKFxuXHRcdFx0ISBuZXh0UHJvcHMuZmlsZSB8fFxuXHRcdFx0KCB0aGlzLnByb3BzLmZpbGUgJiYgbmV4dFByb3BzLmZpbGUucGF0aCA9PT0gdGhpcy5wcm9wcy5maWxlLnBhdGggKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBvcHRpb25zID0gRmlsZU9wdGlvbnMuZ2V0T3B0aW9uc0Zyb21Db25maWcoIG5leHRQcm9wcy5iYXNlLCBuZXh0UHJvcHMuZmlsZSApO1xuXG5cdFx0cmV0dXJuIHsgb3B0aW9uczogb3B0aW9ucyB9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGlmICggZmlsZSAmJiBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBiYXNlLCBmaWxlLnBhdGggKSApO1xuXG5cdFx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0XHRsZXQgY2ZpbGUgPSBmaWxlcy5maW5kKCBjZmlsZSA9PiBjZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0XHRpZiAoIGNmaWxlICkge1xuXHRcdFx0XHRyZXR1cm4gY2ZpbGUub3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gcHJldlN0YXRlLm9wdGlvbnM7XG5cdFx0XHRvcHRpb25zWyBldmVudC50YXJnZXQubmFtZSBdID0gdmFsdWU7XG5cblx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy51cGRhdGVGaWxlT3B0aW9ucyggdGhpcy5zdGF0ZS5vcHRpb25zICk7XG5cdFx0fSk7XG5cdH1cblxuXHR1cGRhdGVGaWxlT3B0aW9ucyggb3B0aW9ucyA9IG51bGwgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgb3B0aW9ucyApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGZpbGVzLnB1c2goe1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0b3B0aW9uczogb3B0aW9uc1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXS5vcHRpb25zID0gb3B0aW9ucztcblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9ucztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNvbnN0IHsgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU2NyaXB0IGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRzYXZlRGlhbG9nRmlsdGVycygpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0eyBuYW1lOiAnSmF2YVNjcmlwdCcsIGV4dGVuc2lvbnM6IFsgJ2pzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0bGV0IHN1ZmZpeCA9ICggdGhpcy5nZXRPcHRpb24oICdjb21wcmVzcycsIGZhbHNlICkgKSA/ICcubWluJyA6ICctZGlzdCc7XG5cdFx0bGV0IGV4dGVuc2lvbiA9ICcuanMnO1xuXG5cdFx0cmV0dXJuIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgc3VmZml4LCBleHRlbnNpb24gKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXNjcmlwdCc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnb3V0cHV0JywgdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzKCkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nY29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQ29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2NvbXByZXNzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY29uc3QgeyBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlT3V0cHV0UGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTdHlsZXNoZWV0IGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRpc1BhcnRpYWwoIGZpbGUgKSB7XG5cdFx0cmV0dXJuIGZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHRzdHlsZU9wdGlvbnMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRjb21wYWN0OiAnQ29tcGFjdCcsXG5cdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJ1xuXHRcdH07XG5cdH1cblxuXHRzYXZlRGlhbG9nRmlsdGVycygpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0eyBuYW1lOiAnQ1NTJywgZXh0ZW5zaW9uczogWyAnY3NzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0bGV0IHN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0bGV0IGV4dGVuc2lvbiA9ICcuY3NzJztcblxuXHRcdHJldHVybiBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHN1ZmZpeCwgZXh0ZW5zaW9uICkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCB0aGlzLnByb3BzLmZpbGUgKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLCBpdCBjYW5ub3QgYmUgY29tcGlsZWQgYnkgaXRzZWxmLjwvcD5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdvdXRwdXQnLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMoKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgU3R5bGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJywgJ25lc3RlZCcgKSB9XG5cdFx0XHRcdFx0XHRvcHRpb25zPXsgdGhpcy5zdHlsZU9wdGlvbnMoKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTdHlsZXNoZWV0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHNlbGVjdG9yLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGdsb2JhbC51aS51bmZvY3VzKCAhIHByZXZTdGF0ZS5pc09wZW4gKTtcblxuXHRcdFx0cmV0dXJuIHsgaXNPcGVuOiAhIHByZXZTdGF0ZS5pc09wZW4gfTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXHR9XG5cblx0Y2hhbmdlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVQcm9qZWN0KCBpbmRleCApO1xuXHR9XG5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzO1xuXG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF1cblx0XHRcdH07XG5cblx0XHRcdGlmICggcHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHByb2plY3RzLnB1c2goIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0cyggcHJvamVjdHMgKTtcblxuXHRcdFx0bGV0IGFjdGl2ZUluZGV4ID0gcHJvamVjdHMubGVuZ3RoIC0gMTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVQcm9qZWN0KCBhY3RpdmVJbmRleCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBjaGFuZ2luZyB0aGUgYWN0aXZlIHByb2plY3QuJyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnByb3BzLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBhZGQgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIH08L2gxPlxuXHRcdFx0XHRcdDxoMj57IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfTwvaDI+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyB2aWV3LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSgnLi9Qcm9qZWN0U2VsZWN0Jyk7XG5cbmNvbnN0IEZpbGVMaXN0ID0gcmVxdWlyZSgnLi4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RpcmVjdG9yeVRyZWUnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSBbXTtcblx0XHRsZXQgYWN0aXZlID0ge1xuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRwYXRoOiAnJ1xuXHRcdH07XG5cblx0XHRpZiAoIGdsb2JhbC5jb25maWcuaGFzKCdwcm9qZWN0cycpICkge1xuXHRcdFx0cHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblxuXHRcdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0XHRcdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdFx0YWN0aXZlID0gcHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHByb2plY3RzLFxuXHRcdFx0YWN0aXZlLFxuXHRcdFx0ZmlsZXM6IG51bGwsXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRQcm9qZWN0cyA9IHRoaXMuc2V0UHJvamVjdHMuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2V0QWN0aXZlUHJvamVjdCA9IHRoaXMuc2V0QWN0aXZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFByb2plY3RQYXRoKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0c2V0UHJvamVjdHMoIHByb2plY3RzICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cHJvamVjdHNcblx0XHR9KTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9XG5cblx0c2V0QWN0aXZlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0bGV0IGFjdGl2ZSA9IHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF07XG5cblx0XHRpZiAoIGFjdGl2ZSAmJiBhY3RpdmUucGF0aCAhPT0gdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRhY3RpdmVcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldFByb2plY3RQYXRoKCBhY3RpdmUucGF0aCApO1xuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRzZXRQcm9qZWN0Q29uZmlnKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdidWlsZHItcHJvamVjdCcsXG5cdFx0XHRjd2Q6IHBhdGhcblx0XHR9KTtcblx0fVxuXG5cdHdhbGtEaXJlY3RvcnkoIHBhdGggKSB7XG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KTtcblx0fVxuXG5cdHNldFByb2plY3RQYXRoKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdHRoaXMud2Fsa0RpcmVjdG9yeSggcGF0aCApLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmaWxlcyxcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHR0aGlzLnNldFByb2plY3RDb25maWcoIHBhdGggKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFJlYWN0LkZyYWdtZW50PlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxQcm9qZWN0U2VsZWN0XG5cdFx0XHRcdFx0XHRhY3RpdmU9eyB0aGlzLnN0YXRlLmFjdGl2ZSB9XG5cdFx0XHRcdFx0XHRwcm9qZWN0cz17IHRoaXMuc3RhdGUucHJvamVjdHMgfVxuXHRcdFx0XHRcdFx0c2V0UHJvamVjdHM9eyB0aGlzLnNldFByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNldEFjdGl2ZVByb2plY3Q9eyB0aGlzLnNldEFjdGl2ZVByb2plY3QgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdGZpbGVzPXsgdGhpcy5zdGF0ZS5maWxlcyB9XG5cdFx0XHRcdFx0XHRsb2FkaW5nPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvUmVhY3QuRnJhZ21lbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RzO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG9mZkNhbnZhcyggdG9nZ2xlID0gdHJ1ZSwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvZmYtY2FudmFzJywgdG9nZ2xlICk7XG5cblx0aWYgKCB0b2dnbGUgKSB7XG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdvZmYtY2FudmFzLXNob3cnKSApO1xuXG5cdFx0cmVtb3ZlRm9jdXMoXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpLFxuXHRcdFx0J29mZi1jYW52YXMnLFxuXHRcdFx0bmV3IEV2ZW50KCdvZmYtY2FudmFzLWhpZGUnKSxcblx0XHRcdGV4Y2x1ZGVcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1oaWRlJykgKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCB0cmlnZ2VyRXZlbnQgPSBudWxsLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXG5cdFx0XHRcdGlmICggdHJpZ2dlckV2ZW50ICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIHRyaWdnZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVtb3ZlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG5cdH1cblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dW5mb2N1cyxcblx0bG9hZGluZyxcblx0b2ZmQ2FudmFzLFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnLWRpc3QnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iXX0=
