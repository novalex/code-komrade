(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

/**
 * @file Main app script.
 */

var Store = require('electron-store');

global.config = new Store({
	name: 'buildr-config'
});

global.ui = require('./utils/globalUI');

global.compiler = require('./gulp/interface');

global.compilerTasks = [];

var React = require('react');

var ReactDOM = require('react-dom');

var _require = require('react-redux'),
    Provider = _require.Provider;

var _require2 = require('redux'),
    createStore = _require2.createStore;

var rootReducer = require('./reducers');

var store = createStore(rootReducer);

var App = require('./components/App');

ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(App, null)
), document.getElementById('root'));

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

},{"./components/App":2,"./gulp/interface":18,"./reducers":19,"./utils/globalUI":23,"./utils/utils":25,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Main app component.
 */

var React = require('react');

var Overlay = require('./Overlay');

var Sidebar = require('./Sidebar');

var Logs = require('./projects/Logs');

var Projects = require('./projects/Projects');

var _require = require('../utils/globalUI'),
    overlay = _require.overlay;

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App(props) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.state = {
			view: 'term'
		};

		_this.views = {
			files: 'Files',
			term: 'Terminal',
			settings: 'Settings'
		};

		_this.changeView = _this.changeView.bind(_this);
		return _this;
	}

	_createClass(App, [{
		key: 'changeView',
		value: function changeView(view) {
			this.setState({ view: view });
		}
	}, {
		key: 'renderOverlay',
		value: function renderOverlay() {
			if (this.state.view === 'files') {
				overlay(false);
				return '';
			} else {
				overlay(true);
				var content = void 0;

				if (this.state.view === 'term') {
					content = React.createElement(Logs, null);
				} else {
					content = React.createElement(
						React.Fragment,
						null,
						React.createElement(
							'h2',
							null,
							this.views[this.state.view]
						),
						React.createElement(
							'p',
							null,
							'You shouldn\'t be here, you naughty naughty boy.'
						)
					);
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
				React.createElement(Sidebar, {
					items: this.views,
					active: this.state.view,
					changeView: this.changeView
				}),
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

module.exports = App;

},{"../utils/globalUI":23,"./Overlay":3,"./Sidebar":4,"./projects/Logs":9,"./projects/Projects":11,"react":undefined}],3:[function(require,module,exports){
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

},{"react":undefined}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file App sidebar.
 */

var React = require('react');

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
				React.createElement('div', { id: 'logo' }),
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

module.exports = Sidebar;

},{"react":undefined}],5:[function(require,module,exports){
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

},{"react":undefined}],6:[function(require,module,exports){
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
					type: 'text',
					name: this.props.name,
					onClick: this.onClick,
					id: 'field_' + this.props.name,
					value: this.state.path,
					readOnly: 'true',
					disabled: this.props.disabled
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
	dialogFilters: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	disabled: PropTypes.bool
};

module.exports = FieldSaveFile;

},{"../../utils/pathHelpers":24,"./Field":5,"electron":undefined,"prop-types":undefined,"react":undefined}],7:[function(require,module,exports){
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

},{"./Field":5,"prop-types":undefined,"react":undefined}],8:[function(require,module,exports){
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

},{"./Field":5,"prop-types":undefined,"react":undefined}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying logs and information.
 */

var React = require('react');

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
			if (!this.state.logs.length) {
				return React.createElement(
					'strong',
					null,
					'No logs yet. Go forth and compile!'
				);
			}

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
			return React.createElement(
				'div',
				{ id: 'logs' },
				this.renderChildren()
			);
		}
	}]);

	return Logs;
}(React.Component);

module.exports = Logs;

},{"react":undefined}],10:[function(require,module,exports){
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
		_this.removeProject = _this.removeProject.bind(_this);
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
					// Project already exists.
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
		key: 'removeProject',
		value: function removeProject(event) {
			var _this2 = this;

			event.preventDefault();

			var confirmRemove = window.confirm('Are you sure you want to remove ' + this.props.active.name + '?');

			if (confirmRemove) {
				var remaining = this.props.projects.filter(function (project) {
					return project.path !== _this2.props.active.path;
				});

				this.props.setProjects(remaining);
				this.props.setActiveProject(null);
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
			if (!this.props.projects || this.props.projects.length === 0) {
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
			} else if (!this.props.active.name || !this.props.active.path) {
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
					React.createElement(
						'a',
						{ href: '#', className: 'remove', onClick: this.removeProject },
						'\xD7'
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

},{"electron":undefined,"path":undefined,"react":undefined}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects view.
 */

var _debounce = require('lodash/debounce');

var React = require('react');

var Store = require('electron-store');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('./filelist/FileList');

var directoryTree = require('../../utils/directoryTree');

var Logger = require('../../utils/Logger');

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
			ignored: ['.git', 'node_modules', '.DS_Store', 'buildr-project.json'],
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
		value: function setActiveProject() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			if (index === null) {
				this.setState({
					active: {
						name: '',
						path: ''
					}
				});

				return;
			}

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

			global.projectConfig.onDidChange('files', _debounce(global.compiler.initProject, 100));
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

			// Change process cwd.
			process.chdir(path);
			// console.log(`Current directory: ${process.cwd()}`);

			global.logger = new Logger();

			global.compiler.initProject();
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

},{"../../utils/Logger":21,"../../utils/directoryTree":22,"./ProjectSelect":10,"./filelist/FileList":12,"electron-store":undefined,"lodash/debounce":undefined,"react":undefined}],12:[function(require,module,exports){
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

},{"./FileListDirectory":13,"./FileListFile":14,"react":undefined}],13:[function(require,module,exports){
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

},{"react":undefined}],14:[function(require,module,exports){
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

var ReactDOM = require('react-dom');

var FileOptionsScript = require('../fileoptions/FileOptionsScript');

var FileOptionsStyle = require('../fileoptions/FileOptionsStyle');

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
					return React.createElement(FileOptionsStyle, { base: this.props.base, file: file });
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
				click: function click() {
					shell.moveItemToTrash(filePath);
				}
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

},{"../fileoptions/FileOptionsScript":16,"../fileoptions/FileOptionsStyle":17,"electron":undefined,"react":undefined,"react-dom":undefined}],15:[function(require,module,exports){
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
					output: this.defaultOutputPath()
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
		key: 'setFileImports',
		value: function setFileImports(imports) {
			var _this2 = this;

			var relativeImports = imports.map(function (path) {
				return slash(fileRelativePath(_this2.props.base, path));
			});

			this.setConfig('imports', relativeImports);
		}
	}, {
		key: 'handleCompile',
		value: function handleCompile() {
			global.ui.loading(true);
			this.setState({ loading: true });

			global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, function (code) {
				global.ui.loading(false);
				this.setState({ loading: false });
			}.bind(this));
		}
	}, {
		key: 'renderButton',
		value: function renderButton() {
			return React.createElement(
				'button',
				{
					className: 'compile green',
					onClick: this.handleCompile,
					disabled: this.state.loading
				},
				this.state.loading ? 'Compiling...' : 'Compile'
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

},{"../../../utils/pathHelpers":24,"react":undefined}],16:[function(require,module,exports){
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
				React.createElement(
					'div',
					{ className: 'footer' },
					this.renderButton()
				)
			);
		}
	}]);

	return FileOptionsScript;
}(FileOptions);

module.exports = FileOptionsScript;

},{"../../fields/FieldSaveFile":6,"../../fields/FieldSwitch":8,"./FileOptions":15,"react":undefined}],17:[function(require,module,exports){
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

var sassGraph = require('sass-graph');

var FileOptionsStyles = function (_FileOptions) {
	_inherits(FileOptionsStyles, _FileOptions);

	function FileOptionsStyles(props) {
		_classCallCheck(this, FileOptionsStyles);

		var _this = _possibleConstructorReturn(this, (FileOptionsStyles.__proto__ || Object.getPrototypeOf(FileOptionsStyles)).call(this, props));

		_this.outputSuffix = '-dist';
		_this.outputExtension = '.css';
		_this.saveDialogFilters = [{ name: 'CSS', extensions: ['css'] }];

		_this.handleAutoCompile = _this.handleAutoCompile.bind(_this);
		return _this;
	}

	_createClass(FileOptionsStyles, [{
		key: 'isPartial',
		value: function isPartial() {
			return this.props.file.name.startsWith('_');
		}
	}, {
		key: 'getFileDependencies',
		value: function getFileDependencies() {
			var graph = sassGraph.parseFile(this.props.file.path);

			if (graph && graph.index && graph.index[this.props.file.path]) {
				return graph.index[this.props.file.path].imports;
			}

			return [];
		}
	}, {
		key: 'handleAutoCompile',
		value: function handleAutoCompile(event, value) {
			this.handleChange(event, value);

			// Auto compile is turned on, create dependency graph and save to config.
			if (value) {
				this.setFileImports(this.getFileDependencies());
			}
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isPartial()) {
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
						onChange: this.handleAutoCompile,
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
				React.createElement(
					'div',
					{ className: 'footer' },
					this.renderButton()
				)
			);
		}
	}]);

	return FileOptionsStyles;
}(FileOptions);

module.exports = FileOptionsStyles;

},{"../../fields/FieldSaveFile":6,"../../fields/FieldSelect":7,"../../fields/FieldSwitch":8,"./FileOptions":15,"react":undefined,"sass-graph":undefined}],18:[function(require,module,exports){
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

var OSCmd = process.platform === 'win32' ? '.cmd' : '';
var gulpPath = path.join(__dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd);
var gulpFilePath = path.join(__dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js');

var _require = require('../utils/pathHelpers'),
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
		var watchFiles = [];

		if (fileConfig.imports && fileConfig.imports.length > 0) {
			watchFiles = fileConfig.imports.map(function (importPath) {
				return fileAbsolutePath(base, importPath);
			});
		}

		watchFiles.push(fileAbsolutePath(base, fileConfig.path));

		options.watchFiles = watchFiles.join(' ');

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
		output: path.parse(outputPath).dir
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

	var cp = spawn(gulpPath, args);

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

},{"../utils/pathHelpers":24,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined}],19:[function(require,module,exports){
'use strict';

/**
 * @file Root reducer.
 */

var _require = require('redux'),
    combineReducers = _require.combineReducers;

var projects = require('./projects');

module.exports = combineReducers({
  projects: projects
});

},{"./projects":20,"redux":undefined}],20:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @file Projects reducer.
 */

var projects = function projects() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var action = arguments[1];

	switch (action.type) {
		case 'ADD_PROJECT':
			return [].concat(_toConsumableArray(state), [{
				id: action.id,
				name: action.name,
				path: action.path
			}]);
		default:
			return state;
	}
};

module.exports = projects;

},{}],21:[function(require,module,exports){
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

},{"moment":undefined}],22:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],23:[function(require,module,exports){
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
	overlay: overlay,
	offCanvas: offCanvas,
	removeFocus: removeFocus
};

},{}],24:[function(require,module,exports){
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

},{"path":undefined}],25:[function(require,module,exports){
"use strict";

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

module.exports = {
	sleep: sleep
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvU2lkZWJhci5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFN3aXRjaC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RTZWxlY3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUuanN4IiwiYXBwL2pzL2d1bHAvaW50ZXJmYWNlLmpzIiwiYXBwL2pzL3JlZHVjZXJzL2luZGV4LmpzIiwiYXBwL2pzL3JlZHVjZXJzL3Byb2plY3RzLmpzIiwiYXBwL2pzL3V0aWxzL0xvZ2dlci5qcyIsImFwcC9qcy91dGlscy9kaXJlY3RvcnlUcmVlLmpzIiwiYXBwL2pzL3V0aWxzL2dsb2JhbFVJLmpzIiwiYXBwL2pzL3V0aWxzL3BhdGhIZWxwZXJzLmpzIiwiYXBwL2pzL3V0aWxzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLGdCQUFSLENBQWQ7O0FBRUEsT0FBTyxNQUFQLEdBQWdCLElBQUksS0FBSixDQUFVO0FBQ3pCLE9BQU07QUFEbUIsQ0FBVixDQUFoQjs7QUFJQSxPQUFPLEVBQVAsR0FBWSxRQUFRLGtCQUFSLENBQVo7O0FBRUEsT0FBTyxRQUFQLEdBQWtCLFFBQVEsa0JBQVIsQ0FBbEI7O0FBRUEsT0FBTyxhQUFQLEdBQXVCLEVBQXZCOztBQUVBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFdBQVcsUUFBUSxXQUFSLENBQWpCOztlQUVxQixRQUFRLGFBQVIsQztJQUFiLFEsWUFBQSxROztnQkFFZ0IsUUFBUSxPQUFSLEM7SUFBaEIsVyxhQUFBLFc7O0FBRVIsSUFBTSxjQUFjLFFBQVEsWUFBUixDQUFwQjs7QUFFQSxJQUFNLFFBQVEsWUFBYSxXQUFiLENBQWQ7O0FBRUEsSUFBTSxNQUFNLFFBQVEsa0JBQVIsQ0FBWjs7QUFFQSxTQUFTLE1BQVQsQ0FDQztBQUFDLFNBQUQ7QUFBQSxHQUFVLE9BQVEsS0FBbEI7QUFDQyxxQkFBQyxHQUFEO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOztBQU9BO0FBQ0EsSUFBTSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFqQjtBQUNBOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMkIsYUFBM0IsRUFBMEMsVUFBVSxLQUFWLEVBQWtCO0FBQzNELEtBQUksZUFBZSxNQUFNLE1BQXpCOztBQUVBLEtBQUssYUFBYSxPQUFiLEtBQXlCLElBQTlCLEVBQXFDO0FBQ3BDLGlCQUFlLE1BQU0s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QUFDQSxNQUFNLElBQUksSUFBSSxDQUFkLEVBQWlCLElBQUksR0FBckIsRUFBMEIsR0FBMUIsRUFBZ0M7QUFDL0IsTUFBTyxJQUFJLElBQUosR0FBVyxPQUFYLEtBQXVCLEtBQXpCLEdBQW1DLFlBQXhDLEVBQXVEO0FBQ3REO0FBQ0E7QUFDRDtBQUNEOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQjtBQURnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuL2d1bHAvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyICk7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9eyBzdG9yZSB9PlxuXHRcdDxBcHAgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7XG5cbi8vIENvbnRleHQgbWVudS5cbmNvbnN0IGZpbGVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGVzJyk7XG4vLyBjb25zdCBmaWxlbmFtZXMgPSBmaWxlTGlzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRsZXQgZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0O1xuXG5cdGlmICggZmlsZU5hbWVDb250LnRhZ05hbWUgIT09ICdsaScgKSB7XG5cdFx0ZmlsZU5hbWVDb250ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cdH1cblxuXHRpZiAoIGZpbGVOYW1lQ29udC5kYXRhc2V0LmZpbGUgKSB7XG5cdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UoIGRlY29kZVVSSUNvbXBvbmVudCggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApICkgKTtcblx0fVxufSk7XG5cbmNvbnN0IHsgc2xlZXAgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcblxuLy8gQXBwIGNsb3NlL3Jlc3RhcnQgZXZlbnRzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID4gMCApIHtcblx0XHRjb25zb2xlLmxvZyggJ0tpbGxpbmcgJWQgcnVubmluZyB0YXNrcy4uLicsIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXG5cdFx0c2xlZXAoIDMwMCApO1xuXHR9XG59KTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgY29tcG9uZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNvbnN0IHsgb3ZlcmxheSB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvZ2xvYmFsVUknKTtcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHZpZXc6ICd0ZXJtJ1xuXHRcdH07XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHR0ZXJtOiAnVGVybWluYWwnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXG5cdFx0dGhpcy5jaGFuZ2VWaWV3ID0gdGhpcy5jaGFuZ2VWaWV3LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IHZpZXcgfSk7XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0b3ZlcmxheSggZmFsc2UgKTtcblx0XHRcdHJldHVybiAnJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3ZlcmxheSggdHJ1ZSApO1xuXHRcdFx0bGV0IGNvbnRlbnQ7XG5cblx0XHRcdGlmICggdGhpcy5zdGF0ZS52aWV3ID09PSAndGVybScgKSB7XG5cdFx0XHRcdGNvbnRlbnQgPSA8TG9ncyAvPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnRlbnQgPSAoXG5cdFx0XHRcdFx0PFJlYWN0LkZyYWdtZW50PlxuXHRcdFx0XHRcdFx0PGgyPnsgdGhpcy52aWV3c1sgdGhpcy5zdGF0ZS52aWV3IF0gfTwvaDI+XG5cdFx0XHRcdFx0XHQ8cD5Zb3Ugc2hvdWxkbid0IGJlIGhlcmUsIHlvdSBuYXVnaHR5IG5hdWdodHkgYm95LjwvcD5cblx0XHRcdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8T3ZlcmxheSBoYXNDbG9zZT17IGZhbHNlIH0+XG5cdFx0XHRcdFx0eyBjb250ZW50IH1cblx0XHRcdFx0PC9PdmVybGF5PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2FwcCc+XG5cdFx0XHRcdDxTaWRlYmFyXG5cdFx0XHRcdFx0aXRlbXM9eyB0aGlzLnZpZXdzIH1cblx0XHRcdFx0XHRhY3RpdmU9eyB0aGlzLnN0YXRlLnZpZXcgfVxuXHRcdFx0XHRcdGNoYW5nZVZpZXc9eyB0aGlzLmNoYW5nZVZpZXcgfVxuXHRcdFx0XHQvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8ZGl2IGlkPSdsb2dvJyAvPlxuXG5cdFx0XHRcdDx1bCBpZD0nbWVudSc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckl0ZW1zKCkgfVxuXHRcdFx0XHQ8L3VsPlxuXHRcdFx0PC9uYXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGViYXI7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgc2F2ZSBmaWxlIGZpZWxkLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHBhdGggPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gJycgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBwYXRoIH07XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCB0aGlzLnN0YXRlLnBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycyApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5maWx0ZXJzID0gdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZyggZmlsZVNhdmVPcHRpb25zICk7XG5cblx0XHRpZiAoIGZpbGVuYW1lICkge1xuXHRcdFx0bGV0IHNhdmVQYXRoID0gc2xhc2goIGZpbGVuYW1lICk7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0XHRzYXZlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIGZpbGVuYW1lICkgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7IHBhdGg6IHNhdmVQYXRoIH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHNhdmVQYXRoICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NhdmUtZmlsZScgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J3RleHQnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnBhdGggfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdC8+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHNlbGVjdGVkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHNlbGVjdGVkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgc2VsZWN0ZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgc2VsZWN0ZWQ6IGV2ZW50LnRhcmdldC52YWx1ZSB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5zZWxlY3RlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMuc3RhdGUuc2VsZWN0ZWQgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGVkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXIgXSksXG5cdG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGNoZWNrZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgY2hlY2tlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IGNoZWNrZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgY2hlY2tlZDogISBwcmV2U3RhdGUuY2hlY2tlZCB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5jaGVja2VkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnN0YXRlLmNoZWNrZWQgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxsYWJlbCBodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfT57IHRoaXMucHJvcHMubGFiZWwgfTwvbGFiZWw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTd2l0Y2gucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuYm9vbCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU3dpdGNoO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgbG9ncyBhbmQgaW5mb3JtYXRpb24uXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmxvZ3MubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIDxzdHJvbmc+Tm8gbG9ncyB5ZXQuIEdvIGZvcnRoIGFuZCBjb21waWxlITwvc3Ryb25nPjtcblx0XHR9XG5cblx0XHRsZXQgbG9nSW5kZXggPSAwO1xuXHRcdGxldCBsb2dMaXN0ID0gW107XG5cblx0XHRmb3IgKCB2YXIgbG9nIG9mIHRoaXMuc3RhdGUubG9ncyApIHtcblx0XHRcdGxldCB0aXRsZUhUTUwgPSB7IF9faHRtbDogbG9nLnRpdGxlIH07XG5cdFx0XHRsZXQgYm9keUhUTUwgPSAoIGxvZy5ib2R5ICkgPyB7IF9faHRtbDogbG9nLmJvZHkgfSA6IG51bGw7XG5cblx0XHRcdGxvZ0xpc3QucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgbG9nSW5kZXggfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17ICd0eXBlLScgKyBsb2cudHlwZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPlxuXHRcdFx0XHRcdFx0PHNtYWxsPnsgbG9nLnRpbWUgfTwvc21hbGw+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3RpdGxlLXRleHQnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgdGl0bGVIVE1MIH0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7IGJvZHlIVE1MICYmXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZGV0YWlscycgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyBib2R5SFRNTCB9IC8+XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KTtcblx0XHRcdGxvZ0luZGV4Kys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDx1bD57IGxvZ0xpc3QgfTwvdWw+O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdsb2dzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMubmV3UHJvamVjdCA9IHRoaXMubmV3UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZW1vdmVQcm9qZWN0ID0gdGhpcy5yZW1vdmVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRnbG9iYWwudWkudW5mb2N1cyggISBwcmV2U3RhdGUuaXNPcGVuICk7XG5cblx0XHRcdHJldHVybiB7IGlzT3BlbjogISBwcmV2U3RhdGUuaXNPcGVuIH07XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblx0fVxuXG5cdGNoYW5nZVByb2plY3QoIGluZGV4ICkge1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggaW5kZXggKTtcblx0fVxuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cztcblxuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IG5ld1Byb2plY3QucGF0aCApICE9PSAtMSApIHtcblx0XHRcdFx0Ly8gUHJvamVjdCBhbHJlYWR5IGV4aXN0cy5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0cy5wdXNoKCBuZXdQcm9qZWN0ICk7XG5cblx0XHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdHMoIHByb2plY3RzICk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IHByb2plY3RzLmxlbmd0aCAtIDE7XG5cblx0XHRcdGlmICggcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggYWN0aXZlSW5kZXggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gY2hhbmdpbmcgdGhlIGFjdGl2ZSBwcm9qZWN0LicgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW1vdmVQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNvbmZpcm1SZW1vdmUgPSB3aW5kb3cuY29uZmlybSggJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJyArIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgKyAnPycgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdGxldCByZW1haW5pbmcgPSB0aGlzLnByb3BzLnByb2plY3RzLmZpbHRlciggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggIT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblxuXHRcdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0cyggcmVtYWluaW5nICk7XG5cdFx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZVByb2plY3QoIG51bGwgKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLnByb2plY3RzIHx8IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBhZGQgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gc2VsZWN0IG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0JyBjbGFzc05hbWU9J3NlbGVjdGVkJz5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVNlbGVjdCB9PlxuXHRcdFx0XHRcdDxoMT57IHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfTwvaDE+XG5cdFx0XHRcdFx0PGgyPnsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9PC9oMj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aW9ucyc+XG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgY2xhc3NOYW1lPSdyZW1vdmUnIG9uQ2xpY2s9eyB0aGlzLnJlbW92ZVByb2plY3QgfT4mdGltZXM7PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgdmlldy5cbiAqL1xuXG5jb25zdCBfZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2gvZGVib3VuY2UnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdGxldCBwcm9qZWN0cyA9IFtdO1xuXHRcdGxldCBhY3RpdmUgPSB7XG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHBhdGg6ICcnXG5cdFx0fTtcblxuXHRcdGlmICggZ2xvYmFsLmNvbmZpZy5oYXMoJ3Byb2plY3RzJykgKSB7XG5cdFx0XHRwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXG5cdFx0XHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0XHRhY3RpdmUgPSBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cHJvamVjdHMsXG5cdFx0XHRhY3RpdmUsXG5cdFx0XHRmaWxlczogbnVsbCxcblx0XHRcdGlnbm9yZWQ6IFtcblx0XHRcdFx0Jy5naXQnLFxuXHRcdFx0XHQnbm9kZV9tb2R1bGVzJyxcblx0XHRcdFx0Jy5EU19TdG9yZScsXG5cdFx0XHRcdCdidWlsZHItcHJvamVjdC5qc29uJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0UHJvamVjdHMgPSB0aGlzLnNldFByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldEFjdGl2ZVByb2plY3QgPSB0aGlzLnNldEFjdGl2ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdHNldFByb2plY3RzKCBwcm9qZWN0cyApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHByb2plY3RzXG5cdFx0fSk7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fVxuXG5cdHNldEFjdGl2ZVByb2plY3QoIGluZGV4ID0gbnVsbCApIHtcblx0XHRpZiAoIGluZGV4ID09PSBudWxsICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGFjdGl2ZToge1xuXHRcdFx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0XHRcdHBhdGg6ICcnXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGFjdGl2ZSA9IHRoaXMuc3RhdGUucHJvamVjdHNbIGluZGV4IF07XG5cblx0XHRpZiAoIGFjdGl2ZSAmJiBhY3RpdmUucGF0aCAhPT0gdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRhY3RpdmVcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldFByb2plY3RQYXRoKCBhY3RpdmUucGF0aCApO1xuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRzZXRQcm9qZWN0Q29uZmlnKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdidWlsZHItcHJvamVjdCcsXG5cdFx0XHRjd2Q6IHBhdGhcblx0XHR9KTtcblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLm9uRGlkQ2hhbmdlKCAnZmlsZXMnLCBfZGVib3VuY2UoIGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCwgMTAwICkgKTtcblx0fVxuXG5cdHdhbGtEaXJlY3RvcnkoIHBhdGggKSB7XG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KTtcblx0fVxuXG5cdHNldFByb2plY3RQYXRoKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdHRoaXMud2Fsa0RpcmVjdG9yeSggcGF0aCApLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmaWxlcyxcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHR0aGlzLnNldFByb2plY3RDb25maWcoIHBhdGggKTtcblxuXHRcdC8vIENoYW5nZSBwcm9jZXNzIGN3ZC5cblx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cdFx0Ly8gY29uc29sZS5sb2coYEN1cnJlbnQgZGlyZWN0b3J5OiAke3Byb2Nlc3MuY3dkKCl9YCk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmluaXRQcm9qZWN0KCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNldFByb2plY3RzPXsgdGhpcy5zZXRQcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzZXRBY3RpdmVQcm9qZWN0PXsgdGhpcy5zZXRBY3RpdmVQcm9qZWN0IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMuc3RhdGUuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ29mZi1jYW52YXMtaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2VtcHR5Jz5cblx0XHRcdFx0XHROb3RoaW5nIHRvIHNlZSBoZXJlLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgeyByZW1vdGUsIHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5jb25zdCB7IE1lbnUsIE1lbnVJdGVtIH0gPSByZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZScpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCBmaWxlICkge1xuXHRcdGlmICggISBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH0gZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpXG5cdFx0KTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIHRydWUsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpICk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cblx0XHRtZW51LnBvcHVwKCByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaVxuXHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfVxuXHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0b25Db250ZXh0TWVudT17IHRoaXMub25Db250ZXh0TWVudSB9XG5cdFx0XHQ+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIEZpbGVMaXN0UGxhY2Vob2xkZXIoIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxsaSBjbGFzc05hbWU9eyBwcm9wcy50eXBlICsgJyBpbmZvcm1hdGl2ZScgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+eyBwcm9wcy5jaGlsZHJlbiB9PC9kaXY+XG5cdFx0PC9saT5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdEZpbGVMaXN0RmlsZSxcblx0RmlsZUxpc3RQbGFjZWhvbGRlclxufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlID0gdGhpcy5oYW5kbGVDb21waWxlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldE91dHB1dFBhdGggPSB0aGlzLnNldE91dHB1dFBhdGguYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBjb21waWxlT3B0aW9ucyA9IGdsb2JhbC5jb21waWxlci5nZXRGaWxlT3B0aW9ucyggbmV4dFByb3BzLmZpbGUgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBjb21waWxlT3B0aW9ucy50eXBlLFxuXHRcdFx0ZmlsZVR5cGU6IGNvbXBpbGVPcHRpb25zLmZpbGVUeXBlLFxuXHRcdFx0YnVpbGRUYXNrTmFtZTogY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZSxcblx0XHRcdG9wdGlvbnM6IEZpbGVPcHRpb25zLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBuZXh0UHJvcHMuYmFzZSwgbmV4dFByb3BzLmZpbGUgKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0bGV0IGNmaWxlID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKTtcblxuXHRcdHJldHVybiAoIGNmaWxlICYmIGNmaWxlLm9wdGlvbnMgKSA/IGNmaWxlLm9wdGlvbnMgOiB7fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRpZiAoIGZpbGUgJiYgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICkgKTtcblxuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdFx0aWYgKCBjZmlsZSApIHtcblx0XHRcdFx0cmV0dXJuIGNmaWxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldENvbmZpZyggcHJvcGVydHksIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0bGV0IGRlZmF1bHRzID0ge1xuXHRcdFx0cGF0aDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApLFxuXHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCksXG5cdFx0XHRvcHRpb25zOiB7fVxuXHRcdH07XG5cblx0XHRsZXQgc3RvcmVkID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRsZXQgY29uZmlnID0gKCBzdG9yZWQgIT09IGZhbHNlICkgPyBzdG9yZWQgOiBkZWZhdWx0cztcblxuXHRcdGlmICggcHJvcGVydHkgKSB7XG5cdFx0XHRyZXR1cm4gKCBjb25maWdbIHByb3BlcnR5IF0gKSA/IGNvbmZpZ1sgcHJvcGVydHkgXSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9XG5cdH1cblxuXHRzZXRDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBwcm9wZXJ0eSApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGxldCBmaWxlQ29uZmlnID0ge1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0dHlwZTogdGhpcy5zdGF0ZS5maWxlVHlwZSxcblx0XHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKClcblx0XHRcdH07XG5cblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcblx0XHRcdFx0ZmlsZUNvbmZpZ1sgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0ZmlsZXMucHVzaCggZmlsZUNvbmZpZyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHRcdGRlbGV0ZSBmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcuc2V0KCAnZmlsZXMnLCBmaWxlcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9uKCBvcHRpb24sIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLm9wdGlvbnMgJiYgdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRzZXRPcHRpb24oIG9wdGlvbiwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gcHJldlN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IHZhbHVlO1xuXG5cdFx0XHRyZXR1cm4geyBvcHRpb25zIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCB0aGlzLnN0YXRlLm9wdGlvbnMgKTtcblx0XHR9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggZXZlbnQsIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0T3B0aW9uKCBldmVudC50YXJnZXQubmFtZSwgdmFsdWUgKTtcblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlLCB0aGlzLm91dHB1dFN1ZmZpeCwgdGhpcy5vdXRwdXRFeHRlbnNpb24gKTtcblx0fVxuXG5cdHNldE91dHB1dFBhdGgoIGV2ZW50LCBwYXRoICkge1xuXHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgcGF0aCApO1xuXHR9XG5cblx0Z2V0T3V0cHV0UGF0aCggdHlwZSA9ICdyZWxhdGl2ZScgKSB7XG5cdFx0bGV0IHNsYXNoUGF0aCA9ICggdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aCA9ICggdHlwZSA9PT0gJ3JlbGF0aXZlJyB8fCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCk7XG5cdFx0bGV0IG91dHB1dFBhdGggPSB0aGlzLmdldENvbmZpZyggJ291dHB1dCcsIGRlZmF1bHRQYXRoICk7XG5cblx0XHRpZiAoIHJlbGF0aXZlUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggc2xhc2hQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IHNsYXNoKCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFBhdGg7XG5cdH1cblxuXHRzZXRGaWxlSW1wb3J0cyggaW1wb3J0cyApIHtcblx0XHRsZXQgcmVsYXRpdmVJbXBvcnRzID0gaW1wb3J0cy5tYXAoIHBhdGggPT4gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgcGF0aCApICkgKTtcblxuXHRcdHRoaXMuc2V0Q29uZmlnKCAnaW1wb3J0cycsIHJlbGF0aXZlSW1wb3J0cyApO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHRnbG9iYWwudWkubG9hZGluZyggdHJ1ZSApO1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdGZ1bmN0aW9uKCBjb2RlICkge1xuXHRcdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyQnV0dG9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdD5cblx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHQ8L2J1dHRvbj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdjb21wcmVzcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQnV0dG9uKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBzYXNzR3JhcGggPSByZXF1aXJlKCdzYXNzLWdyYXBoJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblxuXHRcdHRoaXMuaGFuZGxlQXV0b0NvbXBpbGUgPSB0aGlzLmhhbmRsZUF1dG9Db21waWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0Z2V0RmlsZURlcGVuZGVuY2llcygpIHtcblx0XHRsZXQgZ3JhcGggPSBzYXNzR3JhcGgucGFyc2VGaWxlKCB0aGlzLnByb3BzLmZpbGUucGF0aCApO1xuXG5cdFx0aWYgKCBncmFwaCAmJiBncmFwaC5pbmRleCAmJiBncmFwaC5pbmRleFsgdGhpcy5wcm9wcy5maWxlLnBhdGggXSApIHtcblx0XHRcdHJldHVybiBncmFwaC5pbmRleFsgdGhpcy5wcm9wcy5maWxlLnBhdGggXS5pbXBvcnRzO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXTtcblx0fVxuXG5cdGhhbmRsZUF1dG9Db21waWxlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UoIGV2ZW50LCB2YWx1ZSApO1xuXG5cdFx0Ly8gQXV0byBjb21waWxlIGlzIHR1cm5lZCBvbiwgY3JlYXRlIGRlcGVuZGVuY3kgZ3JhcGggYW5kIHNhdmUgdG8gY29uZmlnLlxuXHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLnNldEZpbGVJbXBvcnRzKCB0aGlzLmdldEZpbGVEZXBlbmRlbmNpZXMoKSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSwgaXQgY2Fubm90IGJlIGNvbXBpbGVkIGJ5IGl0c2VsZi48L3A+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVBdXRvQ29tcGlsZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUudHlwZSA9PT0gJ3Nhc3MnICYmXG5cdFx0XHRcdFx0XHQ8RmllbGRTZWxlY3Rcblx0XHRcdFx0XHRcdFx0bmFtZT0nc3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgU3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJywgJ25lc3RlZCcgKSB9XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM9eyB7XG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkOiAnTmVzdGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wYWN0OiAnQ29tcGFjdCcsXG5cdFx0XHRcdFx0XHRcdFx0ZXhwYW5kZWQ6ICdFeHBhbmRlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcHJlc3NlZDogJ0NvbXByZXNzZWQnXG5cdFx0XHRcdFx0XHRcdH0gfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9wcmVmaXhlcicsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmb290ZXInPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJCdXR0b24oKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduO1xuY29uc3QgcHNUcmVlID0gcmVxdWlyZSgncHMtdHJlZScpO1xuXG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuXG5jb25zdCBPU0NtZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnLmNtZCcgOiAnJztcbmNvbnN0IGd1bHBQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnLmJpbicsICdndWxwJyArIE9TQ21kICk7XG5jb25zdCBndWxwRmlsZVBhdGggPSBwYXRoLmpvaW4oIF9fZGlybmFtZSwgJy4uJywgJ2FwcCcsICdqcycsICdndWxwJywgJ2d1bHBmaWxlLmpzJyApO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlQWJzb2x1dGVQYXRoLCBmaWxlUmVsYXRpdmVQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5mdW5jdGlvbiBraWxsVGFza3MoKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICkge1xuXHRcdGZvciAoIHZhciB0YXNrIG9mIGdsb2JhbC5jb21waWxlclRhc2tzICkge1xuXHRcdFx0dGVybWluYXRlUHJvY2VzcyggdGFzayApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gTm90aGluZyB0byBraWxsIDooXG5cdHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB0ZXJtaW5hdGVQcm9jZXNzKCBwcm9jICkge1xuXHRwc1RyZWUoIHByb2MucGlkLCBmdW5jdGlvbiggZXJyLCBjaGlsZHJlbiApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdH1cblxuXHRcdGZvciAoIHZhciBwaWQgb2YgWyBwcm9jLnBpZCBdLmNvbmNhdCggY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBjaGlsZC5QSUQgKSApICkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cHJvY2Vzcy5raWxsKCBwaWQgKTtcblx0XHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHRcdC8vIEZhaWwgc2lsZW50bHkgbG9sIFlPTE9cblx0XHRcdFx0Ly8gY29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaW5pdFByb2plY3QoKSB7XG5cdGtpbGxUYXNrcygpO1xuXG5cdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgcHJvamVjdEZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXG5cdGxldCBwcm9qZWN0UGF0aCA9IHBhdGgucGFyc2UoIGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGggKS5kaXI7XG5cblx0Zm9yICggdmFyIGZpbGVDb25maWcgb2YgcHJvamVjdEZpbGVzICkge1xuXHRcdHByb2Nlc3NGaWxlKCBwcm9qZWN0UGF0aCwgZmlsZUNvbmZpZyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NGaWxlKCBiYXNlLCBmaWxlQ29uZmlnLCB0YXNrTmFtZSA9IG51bGwsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG9wdGlvbnMgPSBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICk7XG5cblx0aWYgKCAhIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCB0YXNrTmFtZSApIHtcblx0XHRydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRsZXQgd2F0Y2hGaWxlcyA9IFtdO1xuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLmltcG9ydHMgJiYgZmlsZUNvbmZpZy5pbXBvcnRzLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHR3YXRjaEZpbGVzID0gZmlsZUNvbmZpZy5pbXBvcnRzLm1hcCggaW1wb3J0UGF0aCA9PiBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBpbXBvcnRQYXRoICkgKTtcblx0XHR9XG5cblx0XHR3YXRjaEZpbGVzLnB1c2goIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApICk7XG5cblx0XHRvcHRpb25zLndhdGNoRmlsZXMgPSB3YXRjaEZpbGVzLmpvaW4oJyAnKTtcblxuXHRcdHJ1blRhc2soICd3YXRjaCcsIG9wdGlvbnMgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3B0aW9ucyggZmlsZSApIHtcblx0bGV0IG9wdGlvbnMgPSB7fTtcblxuXHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRjYXNlICcuY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdjc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdzYXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdsZXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5qcyc6XG5cdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnanMnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzY3JpcHQnO1xuXHR9XG5cblx0b3B0aW9ucy5idWlsZFRhc2tOYW1lID0gJ2J1aWxkLScgKyBvcHRpb25zLnR5cGU7XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLnBhdGggfHwgISBmaWxlQ29uZmlnLm91dHB1dCApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgZmlsZVBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLnBhdGggKTtcblx0bGV0IG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLm91dHB1dCApO1xuXHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnZXRGaWxlT3B0aW9ucyh7IGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKCBmaWxlUGF0aCApIH0pO1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRpbnB1dDogZmlsZVBhdGgsXG5cdFx0ZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoIG91dHB1dFBhdGggKSxcblx0XHRvdXRwdXQ6IHBhdGgucGFyc2UoIG91dHB1dFBhdGggKS5kaXJcblx0fTtcblxuXHRpZiAoIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRmb3IgKCB2YXIgb3B0aW9uIGluIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRcdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgYXJncyA9IFtcblx0XHR0YXNrTmFtZSxcblx0XHQnLS1jd2QnLCBhcHAuZ2V0QXBwUGF0aCgpLFxuXHRcdCctLWd1bHBmaWxlJywgZ3VscEZpbGVQYXRoLFxuXHRcdCctLW5vLWNvbG9yJ1xuXHRdO1xuXG5cdGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWUgfHwgJ2ZpbGUnO1xuXG5cdGZvciAoIHZhciBvcHRpb24gaW4gb3B0aW9ucyApIHtcblx0XHRpZiAoICEgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiggb3B0aW9uc1sgb3B0aW9uIF0gKSAhPT0gJ2Jvb2xlYW4nICkge1xuXHRcdFx0YXJncy5wdXNoKCAnLS0nICsgb3B0aW9uICk7XG5cdFx0XHRhcmdzLnB1c2goIG9wdGlvbnNbIG9wdGlvbiBdICk7XG5cdFx0fSBlbHNlIGlmICggb3B0aW9uc1sgb3B0aW9uIF0gPT09IHRydWUgKSB7XG5cdFx0XHRhcmdzLnB1c2goICctLScgKyBvcHRpb24gKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBjcCA9IHNwYXduKCBndWxwUGF0aCwgYXJncyApO1xuXG5cdGNvbnNvbGUubG9nKCAnU3RhcnRlZCAlcyB3aXRoIFBJRCAlZCcsIHRhc2tOYW1lLCBjcC5waWQgKTtcblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCBjcCApO1xuXG5cdGNwLnN0ZG91dC5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcblx0XHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdFx0aWYgKCBkYXRhLm1hdGNoKC9GaW5pc2hlZCAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN1Y2Nlc3NmdWwuXG5cdFx0XHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRcdFx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblx0XHR9IGVsc2UgaWYgKCBkYXRhLm1hdGNoKC9TdGFydGluZyAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2ZpbGVuYW1lfS4uLmAgKTtcblx0XHR9XG5cdH0pO1xuXG5cdGNwLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZGVyci5vbiggJ2RhdGEnLCBoYW5kbGVTdGRlcnIgKTtcblxuXHRjcC5vbiggJ2V4aXQnLCBjb2RlID0+IHtcblx0XHQvLyBSZW1vdmUgdGhpcyB0YXNrIGZyb20gZ2xvYmFsIGFycmF5LlxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3MuZmlsdGVyKCBwcm9jID0+IHtcblx0XHRcdHJldHVybiAoIHByb2MucGlkICE9PSBjcC5waWQgKTtcblx0XHR9KTtcblxuXHRcdGlmICggY29kZSA9PT0gMCApIHtcblx0XHRcdC8vIFN1Y2Nlc3MuXG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHQvLyBcdHNpbGVudDogdHJ1ZVxuXHRcdFx0Ly8gfSk7XG5cdFx0fSBlbHNlIGlmICggY29kZSA9PT0gMSApIHtcblx0XHRcdC8vIFRlcm1pbmF0ZWQuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ1Byb2Nlc3MgJXMgdGVybWluYXRlZCcsIGNwLnBpZCApO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgKSB7XG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRXJyb3Igd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX0uYCxcblx0XHRcdC8vIFx0c291bmQ6ICdCYXNzbydcblx0XHRcdC8vIH0pO1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKGBFeGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7Y29kZX1gKTtcblx0XHR9XG5cblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soIGNvZGUgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggISB0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclswXSBdID0gZXJyQXJyWzFdO1xuXG5cdFx0XHRpZiAoIGVyckFyclswXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbignXFxuJykgKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCdcXG4nKSApO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHByb2plY3RzXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggc3RhdGUgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBhY3Rpb24uaWQsXG5cdFx0XHRcdFx0bmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdFx0cGF0aDogYWN0aW9uLnBhdGhcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gc3RhdGVcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3RzO1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gb2ZmQ2FudmFzKCB0b2dnbGUgPSB0cnVlLCBleGNsdWRlID0gbnVsbCApIHtcblx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ29mZi1jYW52YXMnLCB0b2dnbGUgKTtcblxuXHRpZiAoIHRvZ2dsZSApIHtcblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ29mZi1jYW52YXMtc2hvdycpICk7XG5cblx0XHRyZW1vdmVGb2N1cyhcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmYtY2FudmFzJyksXG5cdFx0XHQnb2ZmLWNhbnZhcycsXG5cdFx0XHRuZXcgRXZlbnQoJ29mZi1jYW52YXMtaGlkZScpLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdvZmYtY2FudmFzLWhpZGUnKSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRvZmZDYW52YXMsXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwXG59O1xuIl19
