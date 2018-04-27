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

},{"./components/App":2,"./gulp/interface":19,"./reducers":20,"./utils/globalUI":24,"./utils/utils":26,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],2:[function(require,module,exports){
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
			view: 'files'
		};

		_this.views = {
			files: 'Files',
			logs: 'Logs',
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
			overlay(this.state.view !== 'files');

			if (this.state.view === 'files') {
				return '';
			} else {
				var content = void 0;

				if (this.state.view === 'logs') {
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

},{"../utils/globalUI":24,"./Overlay":4,"./Sidebar":5,"./projects/Logs":10,"./projects/Projects":12,"react":undefined}],3:[function(require,module,exports){
'use strict';

/**
 * @file Component for empty screen/no content.
 */

var React = require('react');

module.exports = function (props) {
	return React.createElement(
		'div',
		{ className: 'no-content' },
		props.children
	);
};

},{"react":undefined}],4:[function(require,module,exports){
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

},{"react":undefined}],5:[function(require,module,exports){
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

},{"react":undefined}],6:[function(require,module,exports){
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

},{"react":undefined}],7:[function(require,module,exports){
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

},{"../../utils/pathHelpers":25,"./Field":6,"electron":undefined,"prop-types":undefined,"react":undefined}],8:[function(require,module,exports){
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

},{"./Field":6,"prop-types":undefined,"react":undefined}],9:[function(require,module,exports){
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

},{"./Field":6,"prop-types":undefined,"react":undefined}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying logs and information.
 */

var React = require('react');

var NoContent = require('../NoContent');

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
			if (!this.state.logs.length) {
				return React.createElement(
					NoContent,
					null,
					'No logs yet. Go forth and compile!'
				);
			}

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

},{"../NoContent":3,"react":undefined}],11:[function(require,module,exports){
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
					path: path[0],
					paused: false
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
					React.createElement('a', { href: '#', className: 'toggle' + (this.props.active.paused ? ' paused' : ' active'), onClick: this.props.toggleProject }),
					React.createElement('a', { href: '#', className: 'refresh', onClick: this.props.refreshProject }),
					React.createElement('a', { href: '#', className: 'remove', onClick: this.removeProject })
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
			path: '',
			paused: false
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
		_this.toggleProject = _this.toggleProject.bind(_this);
		_this.refreshProject = _this.refreshProject.bind(_this);
		_this.setActiveProject = _this.setActiveProject.bind(_this);

		document.addEventListener('bd/refresh/files', _this.refreshProject);
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
		key: 'initCompiler',
		value: function initCompiler() {
			console.log(this.state.active);

			if (!this.state.active.paused) {
				global.compiler.initProject();
			} else {
				global.compiler.killTasks();
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
		key: 'toggleProject',
		value: function toggleProject() {
			this.setState(function (prevState) {
				var paused = prevState.active.paused || false;
				var newState = Object.assign({}, prevState);

				newState.active.paused = !paused;

				return newState;
			}, function () {
				this.setProjectConfig('paused', this.state.active.paused);
			});
		}
	}, {
		key: 'refreshProject',
		value: function refreshProject() {
			this.getFiles(this.state.active.path);
		}
	}, {
		key: 'setActiveProject',
		value: function setActiveProject() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			if (index === null) {
				this.setState({
					active: {
						name: '',
						path: '',
						paused: false
					}
				});

				return;
			}

			var active = this.state.projects[index];

			if (active && active.path !== this.state.active.path) {
				this.setState({
					active: active
				}, function () {
					this.setProjectPath(active.path);
				});

				global.config.set('active-project', index);
			}
		}
	}, {
		key: 'setProjectConfig',
		value: function setProjectConfig(property, value) {
			var projects = global.config.get('projects');
			var activeIndex = global.config.get('active-project');

			if (Array.isArray(projects) && projects[activeIndex]) {
				projects[activeIndex][property] = value;

				global.config.set('projects', projects);
			} else {
				window.alert('There was a problem saving the project config.');
			}
		}
	}, {
		key: 'setProjectConfigFile',
		value: function setProjectConfigFile(path) {
			global.projectConfig = new Store({
				name: 'buildr-project',
				cwd: path
			});

			global.projectConfig.onDidChange('files', _debounce(this.initCompiler, 100));
		}
	}, {
		key: 'getFiles',
		value: function getFiles(path) {
			this.setState({ loading: true });

			global.ui.loading();

			var exclude = new RegExp(this.state.ignored.join('|'), 'i');

			directoryTree(path, {
				// depth: 2,
				exclude: exclude
			}).then(function (files) {
				this.setState({
					files: files,
					loading: false
				});

				global.ui.loading(false);
			}.bind(this));
		}
	}, {
		key: 'setProjectPath',
		value: function setProjectPath(path) {
			this.getFiles(path);

			this.setProjectConfigFile(path);

			// Change process cwd.
			process.chdir(path);
			// console.log(`Current directory: ${process.cwd()}`);

			global.logger = new Logger();

			this.initCompiler();
		}
	}, {
		key: 'renderNotices',
		value: function renderNotices() {
			if (this.state.active.paused) {
				return React.createElement(
					'p',
					null,
					'Project is paused. Files will not be watched and auto compiled.'
				);
			}

			return '';
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
						toggleProject: this.toggleProject,
						refreshProject: this.refreshProject,
						setActiveProject: this.setActiveProject
					})
				),
				React.createElement(
					'div',
					{ id: 'content' },
					this.renderNotices(),
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

},{"../../utils/Logger":22,"../../utils/directoryTree":23,"./ProjectSelect":11,"./filelist/FileList":13,"electron-store":undefined,"lodash/debounce":undefined,"react":undefined}],13:[function(require,module,exports){
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

},{"./FileListDirectory":14,"./FileListFile":15,"react":undefined}],14:[function(require,module,exports){
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

},{"react":undefined}],15:[function(require,module,exports){
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
				click: function () {
					if (window.confirm('Are you sure you want to delete ' + this.props.file.name + '?')) {
						if (shell.moveItemToTrash(filePath)) {
							/* global Event */
							document.dispatchEvent(new Event('bd/refresh/files'));
						} else {
							window.alert('Could not delete ' + this.props.file.name + '.');
						}
					}
				}.bind(this)
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

},{"../fileoptions/FileOptionsScript":17,"../fileoptions/FileOptionsStyle":18,"electron":undefined,"react":undefined,"react-dom":undefined}],16:[function(require,module,exports){
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

},{"../../../utils/pathHelpers":25,"react":undefined}],17:[function(require,module,exports){
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

},{"../../fields/FieldSaveFile":7,"../../fields/FieldSwitch":9,"./FileOptions":16,"react":undefined}],18:[function(require,module,exports){
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

var FileOptionsStyles = function (_FileOptions) {
	_inherits(FileOptionsStyles, _FileOptions);

	function FileOptionsStyles(props) {
		_classCallCheck(this, FileOptionsStyles);

		var _this = _possibleConstructorReturn(this, (FileOptionsStyles.__proto__ || Object.getPrototypeOf(FileOptionsStyles)).call(this, props));

		_this.outputSuffix = '-dist';
		_this.outputExtension = '.css';
		_this.saveDialogFilters = [{ name: 'CSS', extensions: ['css'] }];
		return _this;
	}

	_createClass(FileOptionsStyles, [{
		key: 'isPartial',
		value: function isPartial() {
			return this.props.file.name.startsWith('_');
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
						onChange: this.handleChange,
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

},{"../../fields/FieldSaveFile":7,"../../fields/FieldSelect":8,"../../fields/FieldSwitch":9,"./FileOptions":16,"react":undefined}],19:[function(require,module,exports){
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
		if (options.watchTask && options.watchTask === 'build-sass') {
			options.getImports = true;
		}

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
		output: path.parse(outputPath).dir,
		projectBase: base,
		projectConfig: global.projectConfig.path
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

},{"../utils/pathHelpers":25,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined}],20:[function(require,module,exports){
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

},{"./projects":21,"redux":undefined}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{"moment":undefined}],23:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"path":undefined}],26:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9PdmVybGF5LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvTG9ncy5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RGlyZWN0b3J5LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0RmlsZS5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlLmpzeCIsImFwcC9qcy9ndWxwL2ludGVyZmFjZS5qcyIsImFwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsImFwcC9qcy9yZWR1Y2Vycy9wcm9qZWN0cy5qcyIsImFwcC9qcy91dGlscy9Mb2dnZXIuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGlscy9wYXRoSGVscGVycy5qcyIsImFwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxnQkFBUixDQUFkOztBQUVBLE9BQU8sTUFBUCxHQUFnQixJQUFJLEtBQUosQ0FBVTtBQUN6QixPQUFNO0FBRG1CLENBQVYsQ0FBaEI7O0FBSUEsT0FBTyxFQUFQLEdBQVksUUFBUSxrQkFBUixDQUFaOztBQUVBLE9BQU8sUUFBUCxHQUFrQixRQUFRLGtCQUFSLENBQWxCOztBQUVBLE9BQU8sYUFBUCxHQUF1QixFQUF2Qjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsSUFBTSxXQUFXLFFBQVEsV0FBUixDQUFqQjs7ZUFFcUIsUUFBUSxhQUFSLEM7SUFBYixRLFlBQUEsUTs7Z0JBRWdCLFFBQVEsT0FBUixDO0lBQWhCLFcsYUFBQSxXOztBQUVSLElBQU0sY0FBYyxRQUFRLFlBQVIsQ0FBcEI7O0FBRUEsSUFBTSxRQUFRLFlBQWEsV0FBYixDQUFkOztBQUVBLElBQU0sTUFBTSxRQUFRLGtCQUFSLENBQVo7O0FBRUEsU0FBUyxNQUFULENBQ0M7QUFBQyxTQUFEO0FBQUEsR0FBVSxPQUFRLEtBQWxCO0FBQ0MscUJBQUMsR0FBRDtBQURELENBREQsRUFJQyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FKRDs7Z0JBT2tCLFFBQVEsZUFBUixDO0lBQVYsSyxhQUFBLEs7O0FBRVI7OztBQUNBLE9BQU8sZ0JBQVAsQ0FBeUIsY0FBekIsRUFBeUMsVUFBVSxLQUFWLEVBQWtCO0FBQzFELEtBQUssT0FBTyxhQUFQLENBQXFCLE1BQXJCLEdBQThCLENBQW5DLEVBQXVDO0FBQ3RDLFVBQVEsR0FBUixDQUFhLDZCQUFiLEVBQTRDLE9BQU8sYUFBUCxDQUFxQixNQUFqRTs7QUFFQSxTQUFPLFFBQVAsQ0FBZ0IsU0FBaEI7O0FBRUEsUUFBTyxHQUFQO0FBQ0E7QUFDRCxDQVJEOzs7Ozs7Ozs7Ozs7O0FDeENBOzs7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztBQUVBLElBQU0sVUFBVSxRQUFRLFdBQVIsQ0FBaEI7O0FBRUEsSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFoQjs7QUFFQSxJQUFNLE9BQU8sUUFBUSxpQkFBUixDQUFiOztBQUVBLElBQU0sV0FBVyxRQUFRLHFCQUFSLENBQWpCOztlQUVvQixRQUFRLG1CQUFSLEM7SUFBWixPLFlBQUEsTzs7SUFFRixHOzs7QUFDTCxjQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSx3R0FDYixLQURhOztBQUdwQixRQUFLLEtBQUwsR0FBYTtBQUNaLFNBQU07QUFETSxHQUFiOztBQUlBLFFBQUssS0FBTCxHQUFhO0FBQ1osVUFBTyxPQURLO0FBRVosU0FBTSxNQUZNO0FBR1osYUFBVTtBQUhFLEdBQWI7O0FBTUEsUUFBSyxVQUFMLEdBQWtCLE1BQUssVUFBTCxDQUFnQixJQUFoQixPQUFsQjtBQWJvQjtBQWNwQjs7Ozs2QkFFVyxJLEVBQU87QUFDbEIsUUFBSyxRQUFMLENBQWMsRUFBRSxVQUFGLEVBQWQ7QUFDQTs7O2tDQUVlO0FBQ2YsV0FBUyxLQUFLLEtBQUwsQ0FBVyxJQUFYLEtBQW9CLE9BQTdCOztBQUVBLE9BQUssS0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixPQUF6QixFQUFtQztBQUNsQyxXQUFPLEVBQVA7QUFDQSxJQUZELE1BRU87QUFDTixRQUFJLGdCQUFKOztBQUVBLFFBQUssS0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixNQUF6QixFQUFrQztBQUNqQyxlQUFVLG9CQUFDLElBQUQsT0FBVjtBQUNBLEtBRkQsTUFFTztBQUNOLGVBQ0M7QUFBQyxXQUFELENBQU8sUUFBUDtBQUFBO0FBQ0M7QUFBQTtBQUFBO0FBQU0sWUFBSyxLQUFMLENBQVksS0FBSyxLQUFMLENBQVcsSUFBdkI7QUFBTixPQUREO0FBRUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUZELE1BREQ7QUFNQTs7QUFFRCxXQUNDO0FBQUMsWUFBRDtBQUFBLE9BQVMsVUFBVyxLQUFwQjtBQUNHO0FBREgsS0FERDtBQUtBO0FBQ0Q7OzsyQkFFUTtBQUNSLFVBQ0M7QUFBQTtBQUFBLE1BQUssSUFBRyxLQUFSO0FBQ0Msd0JBQUMsT0FBRDtBQUNDLFlBQVEsS0FBSyxLQURkO0FBRUMsYUFBUyxLQUFLLEtBQUwsQ0FBVyxJQUZyQjtBQUdDLGlCQUFhLEtBQUs7QUFIbkIsTUFERDtBQU9DO0FBQUE7QUFBQSxPQUFLLElBQUcsY0FBUjtBQUNDLHlCQUFDLFFBQUQ7QUFERCxLQVBEO0FBV0csU0FBSyxhQUFMO0FBWEgsSUFERDtBQWVBOzs7O0VBaEVnQixNQUFNLFM7O0FBbUV4QixPQUFPLE9BQVAsR0FBaUIsR0FBakI7Ozs7O0FDbkZBOzs7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLEtBQVYsRUFBa0I7QUFDbEMsUUFDQztBQUFBO0FBQUEsSUFBSyxXQUFVLFlBQWY7QUFDRyxRQUFNO0FBRFQsRUFERDtBQUtBLENBTkQ7Ozs7Ozs7Ozs7Ozs7QUNOQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7SUFFTSxPOzs7Ozs7Ozs7Ozs7QUFDTDs7MkJBRVM7QUFDUixVQUNDO0FBQUE7QUFBQSxNQUFLLElBQUcsU0FBUjtBQUNHLFNBQUssS0FBTCxDQUFXLFFBQVgsSUFDRDtBQUFBO0FBQUEsT0FBRyxNQUFLLEdBQVIsRUFBWSxJQUFHLGVBQWY7QUFBQTtBQUFBLEtBRkY7QUFLQztBQUFBO0FBQUEsT0FBSyxJQUFHLGlCQUFSO0FBQ0csVUFBSyxLQUFMLENBQVc7QUFEZDtBQUxELElBREQ7QUFXQTs7OztFQWZvQixNQUFNLFM7O0FBa0I1QixPQUFPLE9BQVAsR0FBaUIsT0FBakI7Ozs7Ozs7Ozs7Ozs7QUN4QkE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0lBRU0sTzs7O0FBQ0wsa0JBQWEsS0FBYixFQUFxQjtBQUFBOztBQUFBLGdIQUNiLEtBRGE7O0FBR3BCLFFBQUssT0FBTCxHQUFlLE1BQUssT0FBTCxDQUFhLElBQWIsT0FBZjtBQUhvQjtBQUlwQjs7OzswQkFFUSxLLEVBQVE7QUFDaEIsU0FBTSxPQUFOOztBQUVBLE9BQUksT0FBTyxNQUFNLGFBQU4sQ0FBb0IsT0FBcEIsQ0FBNEIsSUFBdkM7O0FBRUEsUUFBSyxLQUFMLENBQVcsVUFBWCxDQUF1QixJQUF2QjtBQUNBOzs7Z0NBRWE7QUFDYixPQUFJLFFBQVEsRUFBWjs7QUFFQSxRQUFNLElBQUksRUFBVixJQUFnQixLQUFLLEtBQUwsQ0FBVyxLQUEzQixFQUFtQztBQUNsQyxVQUFNLElBQU4sQ0FDQztBQUFBO0FBQUE7QUFDQyxXQUFNLEVBRFA7QUFFQyxtQkFBWSxFQUZiO0FBR0Msa0JBQVcsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFrQixFQUFsQixDQUhaO0FBSUMsaUJBQVksS0FBSyxLQUFMLENBQVcsTUFBWCxLQUFzQixFQUF0QixHQUEyQixRQUEzQixHQUFzQyxFQUpuRDtBQUtDLGVBQVUsS0FBSztBQUxoQjtBQU9DLG1DQUFNLFdBQVUsTUFBaEI7QUFQRCxLQUREO0FBV0E7O0FBRUQsVUFBTyxLQUFQO0FBQ0E7OzsyQkFFUTtBQUNSLFVBQ0M7QUFBQTtBQUFBLE1BQUssSUFBRyxTQUFSO0FBQ0M7QUFBQTtBQUFBLE9BQUksSUFBRyxNQUFQO0FBQ0csVUFBSyxXQUFMO0FBREg7QUFERCxJQUREO0FBT0E7Ozs7RUEzQ29CLE1BQU0sUzs7QUE4QzVCLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7Ozs7QUNwREE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsU0FBUyxLQUFULENBQWdCLEtBQWhCLEVBQXdCO0FBQ3ZCLEtBQUksWUFBWSxpQkFBaUIsTUFBTSxJQUF2QixHQUE4QixTQUE5QixJQUE0QyxNQUFNLFFBQU4sR0FBaUIsTUFBTSxRQUF2QixHQUFrQyxLQUE5RSxDQUFoQjs7QUFFQSxRQUNDO0FBQUE7QUFBQSxJQUFLLFdBQVksU0FBakI7QUFDRyxRQUFNLEtBQU4sSUFDRDtBQUFBO0FBQUEsS0FBUSxXQUFVLGFBQWxCO0FBQWtDLFNBQU07QUFBeEMsR0FGRjtBQUlDO0FBQUE7QUFBQSxLQUFLLFdBQVUsWUFBZjtBQUNHLFNBQU07QUFEVDtBQUpELEVBREQ7QUFVQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7Ozs7Ozs7Ozs7QUNyQkE7Ozs7SUFJUSxNLEdBQVcsUUFBUSxVQUFSLEVBQW9CLE0sQ0FBL0IsTTs7ZUFFOEMsUUFBUSx5QkFBUixDO0lBQTlDLEssWUFBQSxLO0lBQU8sZ0IsWUFBQSxnQjtJQUFrQixnQixZQUFBLGdCOztBQUVqQyxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsSUFBTSxZQUFZLFFBQVEsWUFBUixDQUFsQjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7O0lBRU0sYTs7O0FBQ0wsd0JBQWEsS0FBYixFQUFxQjtBQUFBOztBQUFBLDRIQUNiLEtBRGE7O0FBR3BCLFFBQUssS0FBTCxHQUFhO0FBQ1osU0FBTSxNQUFLLEtBQUwsQ0FBVztBQURMLEdBQWI7O0FBSUEsUUFBSyxPQUFMLEdBQWUsTUFBSyxPQUFMLENBQWEsSUFBYixPQUFmO0FBUG9CO0FBUXBCOzs7OzBCQVFRLEssRUFBUTtBQUNoQixTQUFNLE9BQU47QUFDQSxTQUFNLGNBQU47O0FBRUEsT0FBSSxrQkFBa0IsRUFBdEI7O0FBRUEsT0FBSyxLQUFLLEtBQUwsQ0FBVyxXQUFoQixFQUE4QjtBQUM3QixvQkFBZ0IsS0FBaEIsR0FBd0IsS0FBSyxLQUFMLENBQVcsV0FBbkM7QUFDQTs7QUFFRCxPQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsSUFBYixJQUFxQixLQUFLLEtBQUwsQ0FBVyxVQUFyQyxFQUFrRDtBQUNqRCxvQkFBZ0IsV0FBaEIsR0FBOEIsS0FBSyxLQUFMLENBQVcsVUFBWCxDQUFzQixJQUFwRDtBQUNBLElBRkQsTUFFTyxJQUFLLEtBQUssS0FBTCxDQUFXLElBQVgsSUFBbUIsS0FBSyxLQUFMLENBQVcsVUFBbkMsRUFBZ0Q7QUFDdEQsb0JBQWdCLFdBQWhCLEdBQThCLGlCQUFrQixLQUFLLEtBQUwsQ0FBVyxVQUE3QixFQUF5QyxLQUFLLEtBQUwsQ0FBVyxJQUFwRCxDQUE5QjtBQUNBOztBQUVELE9BQUssS0FBSyxLQUFMLENBQVcsYUFBaEIsRUFBZ0M7QUFDL0Isb0JBQWdCLE9BQWhCLEdBQTBCLEtBQUssS0FBTCxDQUFXLGFBQXJDO0FBQ0E7O0FBRUQsT0FBSSxXQUFXLE9BQU8sY0FBUCxDQUF1QixlQUF2QixDQUFmOztBQUVBLE9BQUssUUFBTCxFQUFnQjtBQUNmLFFBQUksV0FBVyxNQUFPLFFBQVAsQ0FBZjs7QUFFQSxRQUFLLEtBQUssS0FBTCxDQUFXLFVBQWhCLEVBQTZCO0FBQzVCLGdCQUFXLE1BQU8saUJBQWtCLEtBQUssS0FBTCxDQUFXLFVBQTdCLEVBQXlDLFFBQXpDLENBQVAsQ0FBWDtBQUNBOztBQUVELFNBQUssUUFBTCxDQUFjLEVBQUUsTUFBTSxRQUFSLEVBQWQsRUFBa0MsWUFBVztBQUM1QyxTQUFLLEtBQUssS0FBTCxDQUFXLFFBQWhCLEVBQTJCO0FBQzFCLFdBQUssS0FBTCxDQUFXLFFBQVgsQ0FBcUIsS0FBckIsRUFBNEIsUUFBNUI7QUFDQTtBQUNELEtBSkQ7QUFLQTtBQUNEOzs7MkJBRVE7QUFDUixVQUNDO0FBQUMsU0FBRDtBQUFBLE1BQU8sTUFBSyxXQUFaLEVBQXdCLE9BQVEsS0FBSyxLQUFMLENBQVcsS0FBM0MsRUFBbUQsVUFBVyxLQUFLLEtBQUwsQ0FBVyxRQUF6RTtBQUNDO0FBQ0MsV0FBSyxNQUROO0FBRUMsV0FBTyxLQUFLLEtBQUwsQ0FBVyxJQUZuQjtBQUdDLGNBQVUsS0FBSyxPQUhoQjtBQUlDLFNBQUssV0FBVyxLQUFLLEtBQUwsQ0FBVyxJQUo1QjtBQUtDLFlBQVEsS0FBSyxLQUFMLENBQVcsSUFMcEI7QUFNQyxlQUFTLE1BTlY7QUFPQyxlQUFXLEtBQUssS0FBTCxDQUFXO0FBUHZCO0FBREQsSUFERDtBQWFBOzs7MkNBekRnQyxTLEVBQVcsUyxFQUFZO0FBQ3ZELE9BQUksT0FBUyxVQUFVLEtBQVYsS0FBb0IsSUFBdEIsR0FBK0IsRUFBL0IsR0FBb0MsVUFBVSxLQUF6RDs7QUFFQSxVQUFPLEVBQUUsVUFBRixFQUFQO0FBQ0E7Ozs7RUFmMEIsTUFBTSxTOztBQXVFbEMsY0FBYyxTQUFkLEdBQTBCO0FBQ3pCLE9BQU0sVUFBVSxNQUFWLENBQWlCLFVBREU7QUFFekIsUUFBTyxVQUFVLE1BQVYsQ0FBaUIsVUFGQztBQUd6QixXQUFVLFVBQVUsTUFISztBQUl6QixXQUFVLFVBQVUsSUFKSztBQUt6QixRQUFPLFVBQVUsTUFMUTtBQU16QixhQUFZLFVBQVUsTUFORztBQU96QixjQUFhLFVBQVUsTUFQRTtBQVF6QixnQkFBZSxVQUFVLFNBQVYsQ0FBb0IsQ0FBRSxVQUFVLEtBQVosRUFBbUIsVUFBVSxNQUE3QixDQUFwQixDQVJVO0FBU3pCLFdBQVUsVUFBVTtBQVRLLENBQTFCOztBQVlBLE9BQU8sT0FBUCxHQUFpQixhQUFqQjs7Ozs7Ozs7Ozs7OztBQ2pHQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFlBQVksUUFBUSxZQUFSLENBQWxCOztBQUVBLElBQU0sUUFBUSxRQUFRLFNBQVIsQ0FBZDs7SUFFTSxXOzs7QUFDTCxzQkFBYSxLQUFiLEVBQXFCO0FBQUE7O0FBQUEsd0hBQ2IsS0FEYTs7QUFHcEIsUUFBSyxLQUFMLEdBQWE7QUFDWixhQUFVLE1BQUssS0FBTCxDQUFXO0FBRFQsR0FBYjs7QUFJQSxRQUFLLFFBQUwsR0FBZ0IsTUFBSyxRQUFMLENBQWMsSUFBZCxPQUFoQjtBQVBvQjtBQVFwQjs7OzsyQkFRUyxLLEVBQVE7QUFDakIsU0FBTSxPQUFOOztBQUVBLFFBQUssUUFBTCxDQUFlLFVBQVUsU0FBVixFQUFzQjtBQUNwQyxXQUFPLEVBQUUsVUFBVSxNQUFNLE1BQU4sQ0FBYSxLQUF6QixFQUFQO0FBQ0EsSUFGRCxFQUVHLFlBQVc7QUFDYixRQUFLLEtBQUssS0FBTCxDQUFXLFFBQWhCLEVBQTJCO0FBQzFCLFVBQUssS0FBTCxDQUFXLFFBQVgsQ0FBcUIsS0FBckIsRUFBNEIsS0FBSyxLQUFMLENBQVcsUUFBdkM7QUFDQTtBQUNELElBTkQ7QUFPQTs7OytCQUVZO0FBQ1osT0FBSSxVQUFVLEVBQWQ7O0FBRUEsUUFBTSxJQUFJLEtBQVYsSUFBbUIsS0FBSyxLQUFMLENBQVcsT0FBOUIsRUFBd0M7QUFDdkMsWUFBUSxJQUFSLENBQ0M7QUFBQTtBQUFBLE9BQVEsS0FBTSxLQUFkLEVBQXNCLE9BQVEsS0FBOUI7QUFDRyxVQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW9CLEtBQXBCO0FBREgsS0FERDtBQUtBOztBQUVELFVBQU8sT0FBUDtBQUNBOzs7MkJBRVE7QUFDUixVQUNDO0FBQUMsU0FBRDtBQUFBLE1BQU8sTUFBSyxRQUFaLEVBQXFCLE9BQVEsS0FBSyxLQUFMLENBQVcsS0FBeEMsRUFBZ0QsVUFBVyxLQUFLLEtBQUwsQ0FBVyxRQUF0RTtBQUNDO0FBQUE7QUFBQTtBQUNDLGVBQVUsV0FBVyxLQUFLLEtBQUwsQ0FBVztBQURqQztBQUdHLFVBQUssS0FBTCxDQUFXLFFBQVgsR0FBc0IsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFvQixLQUFLLEtBQUwsQ0FBVyxRQUEvQixDQUF0QixHQUFrRTtBQUhyRSxLQUREO0FBTUM7QUFBQTtBQUFBO0FBQ0MsWUFBTyxLQUFLLEtBQUwsQ0FBVyxJQURuQjtBQUVDLGdCQUFXLEtBQUssUUFGakI7QUFHQyxhQUFRLEtBQUssS0FBTCxDQUFXLFFBSHBCO0FBSUMsZ0JBQVcsS0FBSyxLQUFMLENBQVcsUUFKdkI7QUFLQyxVQUFLLFdBQVcsS0FBSyxLQUFMLENBQVc7QUFMNUI7QUFPRyxVQUFLLFVBQUw7QUFQSDtBQU5ELElBREQ7QUFrQkE7OzsyQ0FuRGdDLFMsRUFBVyxTLEVBQVk7QUFDdkQsT0FBSSxXQUFhLFVBQVUsS0FBVixLQUFvQixJQUF0QixHQUErQixLQUEvQixHQUF1QyxVQUFVLEtBQWhFOztBQUVBLFVBQU8sRUFBRSxrQkFBRixFQUFQO0FBQ0E7Ozs7RUFmd0IsTUFBTSxTOztBQWlFaEMsWUFBWSxTQUFaLEdBQXdCO0FBQ3ZCLE9BQU0sVUFBVSxNQUFWLENBQWlCLFVBREE7QUFFdkIsUUFBTyxVQUFVLE1BQVYsQ0FBaUIsVUFGRDtBQUd2QixXQUFVLFVBQVUsTUFIRztBQUl2QixXQUFVLFVBQVUsSUFKRztBQUt2QixRQUFPLFVBQVUsU0FBVixDQUFvQixDQUFFLFVBQVUsTUFBWixFQUFvQixVQUFVLE1BQTlCLENBQXBCLENBTGdCO0FBTXZCLFVBQVMsVUFBVSxNQUFWLENBQWlCLFVBTkg7QUFPdkIsV0FBVSxVQUFVO0FBUEcsQ0FBeEI7O0FBVUEsT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7Ozs7Ozs7Ozs7O0FDckZBOzs7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztBQUVBLElBQU0sWUFBWSxRQUFRLFlBQVIsQ0FBbEI7O0FBRUEsSUFBTSxRQUFRLFFBQVEsU0FBUixDQUFkOztJQUVNLFc7OztBQUNMLHNCQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSx3SEFDYixLQURhOztBQUdwQixRQUFLLEtBQUwsR0FBYTtBQUNaLFlBQVMsTUFBSyxLQUFMLENBQVc7QUFEUixHQUFiOztBQUlBLFFBQUssUUFBTCxHQUFnQixNQUFLLFFBQUwsQ0FBYyxJQUFkLE9BQWhCO0FBUG9CO0FBUXBCOzs7OzJCQVFTLEssRUFBUTtBQUNqQixTQUFNLE9BQU47O0FBRUEsUUFBSyxRQUFMLENBQWUsVUFBVSxTQUFWLEVBQXNCO0FBQ3BDLFdBQU8sRUFBRSxTQUFTLENBQUUsVUFBVSxPQUF2QixFQUFQO0FBQ0EsSUFGRCxFQUVHLFlBQVc7QUFDYixRQUFLLEtBQUssS0FBTCxDQUFXLFFBQWhCLEVBQTJCO0FBQzFCLFVBQUssS0FBTCxDQUFXLFFBQVgsQ0FBcUIsS0FBckIsRUFBNEIsS0FBSyxLQUFMLENBQVcsT0FBdkM7QUFDQTtBQUNELElBTkQ7QUFPQTs7OzJCQUVRO0FBQ1IsVUFDQztBQUFDLFNBQUQ7QUFBQSxNQUFPLE1BQUssUUFBWixFQUFxQixPQUFRLEtBQUssS0FBTCxDQUFXLEtBQXhDLEVBQWdELFVBQVcsS0FBSyxLQUFMLENBQVcsUUFBdEU7QUFDQztBQUNDLFdBQUssVUFETjtBQUVDLFdBQU8sS0FBSyxLQUFMLENBQVcsSUFGbkI7QUFHQyxlQUFXLEtBQUssUUFIakI7QUFJQyxjQUFVLEtBQUssS0FBTCxDQUFXLE9BSnRCO0FBS0MsZUFBVyxLQUFLLEtBQUwsQ0FBVyxRQUx2QjtBQU1DLFNBQUssV0FBVyxLQUFLLEtBQUwsQ0FBVztBQU41QixNQUREO0FBU0M7QUFBQTtBQUFBLE9BQU8sU0FBVSxXQUFXLEtBQUssS0FBTCxDQUFXLElBQXZDO0FBQWdELFVBQUssS0FBTCxDQUFXO0FBQTNEO0FBVEQsSUFERDtBQWFBOzs7MkNBaENnQyxTLEVBQVcsUyxFQUFZO0FBQ3ZELE9BQUksVUFBWSxVQUFVLEtBQVYsS0FBb0IsSUFBdEIsR0FBK0IsS0FBL0IsR0FBdUMsVUFBVSxLQUEvRDs7QUFFQSxVQUFPLEVBQUUsZ0JBQUYsRUFBUDtBQUNBOzs7O0VBZndCLE1BQU0sUzs7QUE4Q2hDLFlBQVksU0FBWixHQUF3QjtBQUN2QixPQUFNLFVBQVUsTUFBVixDQUFpQixVQURBO0FBRXZCLFFBQU8sVUFBVSxNQUFWLENBQWlCLFVBRkQ7QUFHdkIsV0FBVSxVQUFVLE1BSEc7QUFJdkIsV0FBVSxVQUFVLElBSkc7QUFLdkIsUUFBTyxVQUFVLElBTE07QUFNdkIsV0FBVSxVQUFVO0FBTkcsQ0FBeEI7O0FBU0EsT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7Ozs7Ozs7Ozs7O0FDakVBOzs7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztBQUVBLElBQU0sWUFBWSxRQUFRLGNBQVIsQ0FBbEI7O0lBRU0sSTs7O0FBQ0wsZUFBYSxLQUFiLEVBQXFCO0FBQUE7O0FBQUEsMEdBQ2IsS0FEYTs7QUFHcEIsTUFBSSxPQUFPLElBQVg7QUFDQSxNQUFJLE9BQVMsT0FBTyxNQUFULEdBQW9CLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBbUIsSUFBbkIsQ0FBcEIsR0FBZ0QsRUFBM0Q7O0FBRUEsUUFBSyxLQUFMLEdBQWE7QUFDWixhQURZO0FBRVo7QUFGWSxHQUFiOztBQUtBLFFBQUssT0FBTCxHQUFlLE1BQUssT0FBTCxDQUFhLElBQWIsT0FBZjs7QUFFQSxXQUFTLGdCQUFULENBQTJCLGlCQUEzQixFQUE4QyxNQUFLLE9BQW5EO0FBYm9CO0FBY3BCOzs7OzRCQUVTO0FBQ1QsUUFBSyxRQUFMLENBQWMsRUFBRSxNQUFNLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBbUIsS0FBSyxLQUFMLENBQVcsSUFBOUIsQ0FBUixFQUFkO0FBQ0E7OzttQ0FFZ0I7QUFDaEIsT0FBSSxXQUFXLENBQWY7QUFDQSxPQUFJLFVBQVUsRUFBZDs7QUFGZ0I7QUFBQTtBQUFBOztBQUFBO0FBSWhCLHlCQUFpQixLQUFLLEtBQUwsQ0FBVyxJQUE1Qiw4SEFBbUM7QUFBQSxTQUF6QixHQUF5Qjs7QUFDbEMsU0FBSSxZQUFZLEVBQUUsUUFBUSxJQUFJLEtBQWQsRUFBaEI7QUFDQSxTQUFJLFdBQWEsSUFBSSxJQUFOLEdBQWUsRUFBRSxRQUFRLElBQUksSUFBZCxFQUFmLEdBQXNDLElBQXJEOztBQUVBLGFBQVEsSUFBUixDQUNDO0FBQUE7QUFBQTtBQUNDLFlBQU0sUUFEUDtBQUVDLGtCQUFZLFVBQVUsSUFBSTtBQUYzQjtBQUlDO0FBQUE7QUFBQSxTQUFLLFdBQVUsT0FBZjtBQUNDO0FBQUE7QUFBQTtBQUFTLFlBQUk7QUFBYixRQUREO0FBRUMscUNBQU0sV0FBVSxZQUFoQixFQUE2Qix5QkFBMEIsU0FBdkQ7QUFGRCxPQUpEO0FBUUcsa0JBQ0QsNkJBQUssV0FBVSxTQUFmLEVBQXlCLHlCQUEwQixRQUFuRDtBQVRGLE1BREQ7QUFjQTtBQUNBO0FBdkJlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBeUJoQixVQUFPO0FBQUE7QUFBQTtBQUFNO0FBQU4sSUFBUDtBQUNBOzs7MkJBRVE7QUFDUixPQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixNQUF2QixFQUFnQztBQUMvQixXQUFPO0FBQUMsY0FBRDtBQUFBO0FBQUE7QUFBQSxLQUFQO0FBQ0E7O0FBRUQsVUFDQztBQUFBO0FBQUEsTUFBSyxJQUFHLE1BQVI7QUFDRyxTQUFLLGNBQUw7QUFESCxJQUREO0FBS0E7Ozs7RUEzRGlCLE1BQU0sUzs7QUE4RHpCLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7Ozs7OztBQ3RFQTs7OztJQUlRLE0sR0FBVyxRQUFRLFVBQVIsRUFBb0IsTSxDQUEvQixNOztBQUVSLElBQU0sU0FBUyxRQUFRLE1BQVIsQ0FBZjs7QUFFQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0lBRU0sYTs7O0FBQ0wsd0JBQWEsS0FBYixFQUFxQjtBQUFBOztBQUFBLDRIQUNiLEtBRGE7O0FBR3BCLFFBQUssS0FBTCxHQUFhO0FBQ1osV0FBUTtBQURJLEdBQWI7O0FBSUEsUUFBSyxVQUFMLEdBQWtCLE1BQUssVUFBTCxDQUFnQixJQUFoQixPQUFsQjtBQUNBLFFBQUssYUFBTCxHQUFxQixNQUFLLGFBQUwsQ0FBbUIsSUFBbkIsT0FBckI7QUFDQSxRQUFLLFlBQUwsR0FBb0IsTUFBSyxZQUFMLENBQWtCLElBQWxCLE9BQXBCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLE1BQUssYUFBTCxDQUFtQixJQUFuQixPQUFyQjtBQVZvQjtBQVdwQjs7OztpQ0FFYztBQUNkLFFBQUssUUFBTCxDQUFlLFVBQVUsU0FBVixFQUFzQjtBQUNwQyxXQUFPLEVBQVAsQ0FBVSxPQUFWLENBQW1CLENBQUUsVUFBVSxNQUEvQjs7QUFFQSxXQUFPLEVBQUUsUUFBUSxDQUFFLFVBQVUsTUFBdEIsRUFBUDtBQUNBLElBSkQ7QUFLQTs7O2dDQUVjLEssRUFBUTtBQUN0QixTQUFNLE9BQU47QUFDQSxPQUFJLFFBQVEsTUFBTSxhQUFOLENBQW9CLE9BQXBCLENBQTRCLE9BQXhDOztBQUVBLE9BQUssVUFBVSxLQUFmLEVBQXVCO0FBQ3RCLFNBQUssVUFBTDtBQUNBLElBRkQsTUFFTztBQUNOLFNBQUssYUFBTCxDQUFvQixLQUFwQjtBQUNBOztBQUVELFFBQUssWUFBTDtBQUNBOzs7Z0NBRWMsSyxFQUFRO0FBQ3RCLFFBQUssS0FBTCxDQUFXLGdCQUFYLENBQTZCLEtBQTdCO0FBQ0E7OzsrQkFFWTtBQUNaLE9BQUksT0FBTyxPQUFPLGNBQVAsQ0FBc0I7QUFDaEMsZ0JBQVksQ0FBRSxlQUFGO0FBRG9CLElBQXRCLENBQVg7O0FBSUEsT0FBSyxJQUFMLEVBQVk7QUFDWCxRQUFJLFdBQVcsS0FBSyxLQUFMLENBQVcsUUFBMUI7O0FBRUEsUUFBSSxhQUFhO0FBQ2hCLFdBQU0sT0FBTyxRQUFQLENBQWlCLEtBQUssQ0FBTCxDQUFqQixDQURVO0FBRWhCLFdBQU0sS0FBSyxDQUFMLENBRlU7QUFHaEIsYUFBUTtBQUhRLEtBQWpCOztBQU1BLFFBQUssU0FBUyxTQUFULENBQW9CO0FBQUEsWUFBVyxRQUFRLElBQVIsS0FBaUIsV0FBVyxJQUF2QztBQUFBLEtBQXBCLE1BQXNFLENBQUMsQ0FBNUUsRUFBZ0Y7QUFDL0U7QUFDQTtBQUNBOztBQUVELGFBQVMsSUFBVCxDQUFlLFVBQWY7O0FBRUEsU0FBSyxLQUFMLENBQVcsV0FBWCxDQUF3QixRQUF4Qjs7QUFFQSxRQUFJLGNBQWMsU0FBUyxNQUFULEdBQWtCLENBQXBDOztBQUVBLFFBQUssU0FBVSxXQUFWLENBQUwsRUFBK0I7QUFDOUIsVUFBSyxLQUFMLENBQVcsZ0JBQVgsQ0FBNkIsV0FBN0I7QUFDQSxLQUZELE1BRU87QUFDTixZQUFPLEtBQVAsQ0FBYyxrREFBZDtBQUNBO0FBQ0Q7QUFDRDs7O2dDQUVjLEssRUFBUTtBQUFBOztBQUN0QixTQUFNLGNBQU47O0FBRUEsT0FBSSxnQkFBZ0IsT0FBTyxPQUFQLENBQWdCLHFDQUFxQyxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQXZELEdBQThELEdBQTlFLENBQXBCOztBQUVBLE9BQUssYUFBTCxFQUFxQjtBQUNwQixRQUFJLFlBQVksS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixNQUFwQixDQUE0QjtBQUFBLFlBQVcsUUFBUSxJQUFSLEtBQWlCLE9BQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsSUFBOUM7QUFBQSxLQUE1QixDQUFoQjs7QUFFQSxTQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXdCLFNBQXhCO0FBQ0EsU0FBSyxLQUFMLENBQVcsZ0JBQVgsQ0FBNkIsSUFBN0I7QUFDQTtBQUNEOzs7a0NBRWU7QUFDZixPQUFJLFVBQVUsRUFBZDs7QUFFQSxRQUFNLElBQUksS0FBVixJQUFtQixLQUFLLEtBQUwsQ0FBVyxRQUE5QixFQUF5QztBQUN4QyxZQUFRLElBQVIsQ0FDQztBQUFBO0FBQUEsT0FBSyxLQUFNLEtBQVgsRUFBbUIsZ0JBQWUsS0FBbEMsRUFBMEMsU0FBVSxLQUFLLGFBQXpEO0FBQ0csVUFBSyxLQUFMLENBQVcsUUFBWCxDQUFxQixLQUFyQixFQUE2QjtBQURoQyxLQUREO0FBS0E7O0FBRUQsV0FBUSxJQUFSLENBQ0M7QUFBQTtBQUFBLE1BQUssS0FBSSxLQUFULEVBQWUsZ0JBQWEsS0FBNUIsRUFBa0MsU0FBVSxLQUFLLGFBQWpEO0FBQUE7QUFBQSxJQUREOztBQU1BLFVBQU8sT0FBUDtBQUNBOzs7MkJBRVE7QUFDUixPQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsUUFBYixJQUF5QixLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLEtBQStCLENBQTdELEVBQWlFO0FBQ2hFLFdBQ0M7QUFBQTtBQUFBLE9BQUssSUFBRyxnQkFBUjtBQUNDO0FBQUE7QUFBQSxRQUFLLElBQUcsZ0JBQVIsRUFBeUIsU0FBVSxLQUFLLFVBQXhDO0FBQ0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUREO0FBRUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUZEO0FBREQsS0FERDtBQVFBLElBVEQsTUFTTyxJQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixJQUFwQixJQUE0QixDQUFFLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsSUFBckQsRUFBNEQ7QUFDbEUsV0FDQztBQUFBO0FBQUEsT0FBSyxJQUFHLGdCQUFSO0FBQ0M7QUFBQTtBQUFBLFFBQUssSUFBRyxnQkFBUixFQUF5QixTQUFVLEtBQUssWUFBeEM7QUFDQztBQUFBO0FBQUE7QUFBQTtBQUFBLE9BREQ7QUFFQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRkQsTUFERDtBQUtDO0FBQUE7QUFBQSxRQUFLLElBQUcseUJBQVIsRUFBa0MsV0FBWSxLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLE1BQXBCLEdBQTZCLEVBQTNFO0FBQ0csV0FBSyxhQUFMO0FBREg7QUFMRCxLQUREO0FBV0E7O0FBRUQsVUFDQztBQUFBO0FBQUEsTUFBSyxJQUFHLGdCQUFSLEVBQXlCLFdBQVUsVUFBbkM7QUFDQztBQUFBO0FBQUEsT0FBSyxJQUFHLGdCQUFSLEVBQXlCLFNBQVUsS0FBSyxZQUF4QztBQUNDO0FBQUE7QUFBQTtBQUFNLFdBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0I7QUFBeEIsTUFERDtBQUVDO0FBQUE7QUFBQTtBQUFNLFdBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0I7QUFBeEI7QUFGRCxLQUREO0FBS0M7QUFBQTtBQUFBLE9BQUssSUFBRyxpQkFBUjtBQUNDLGdDQUFHLE1BQUssR0FBUixFQUFZLFdBQVksWUFBYSxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLE1BQWxCLEdBQTJCLFNBQTNCLEdBQXVDLFNBQXBELENBQXhCLEVBQTBGLFNBQVUsS0FBSyxLQUFMLENBQVcsYUFBL0csR0FERDtBQUVDLGdDQUFHLE1BQUssR0FBUixFQUFZLFdBQVUsU0FBdEIsRUFBZ0MsU0FBVSxLQUFLLEtBQUwsQ0FBVyxjQUFyRCxHQUZEO0FBR0MsZ0NBQUcsTUFBSyxHQUFSLEVBQVksV0FBVSxRQUF0QixFQUErQixTQUFVLEtBQUssYUFBOUM7QUFIRCxLQUxEO0FBVUM7QUFBQTtBQUFBLE9BQUssSUFBRyx5QkFBUixFQUFrQyxXQUFZLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsTUFBcEIsR0FBNkIsRUFBM0U7QUFDRyxVQUFLLGFBQUw7QUFESDtBQVZELElBREQ7QUFnQkE7Ozs7RUFqSjBCLE1BQU0sUzs7QUFvSmxDLE9BQU8sT0FBUCxHQUFpQixhQUFqQjs7Ozs7Ozs7Ozs7OztBQzlKQTs7OztBQUlBLElBQU0sWUFBWSxRQUFRLGlCQUFSLENBQWxCOztBQUVBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLFFBQVEsUUFBUSxnQkFBUixDQUFkOztBQUVBLElBQU0sZ0JBQWdCLFFBQVEsaUJBQVIsQ0FBdEI7O0FBRUEsSUFBTSxXQUFXLFFBQVEscUJBQVIsQ0FBakI7O0FBRUEsSUFBTSxnQkFBZ0IsUUFBUSwyQkFBUixDQUF0Qjs7QUFFQSxJQUFNLFNBQVMsUUFBUSxvQkFBUixDQUFmOztJQUVNLFE7OztBQUNMLG1CQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSxrSEFDYixLQURhOztBQUdwQixNQUFJLFdBQVcsRUFBZjtBQUNBLE1BQUksU0FBUztBQUNaLFNBQU0sRUFETTtBQUVaLFNBQU0sRUFGTTtBQUdaLFdBQVE7QUFISSxHQUFiOztBQU1BLE1BQUssT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixVQUFsQixDQUFMLEVBQXFDO0FBQ3BDLGNBQVcsT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixVQUFsQixDQUFYOztBQUVBLE9BQUksY0FBYyxPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLGdCQUFsQixDQUFsQjs7QUFFQSxPQUFLLE1BQU0sT0FBTixDQUFlLFFBQWYsS0FBNkIsU0FBVSxXQUFWLENBQWxDLEVBQTREO0FBQzNELGFBQVMsU0FBVSxXQUFWLENBQVQ7QUFDQTtBQUNEOztBQUVELFFBQUssS0FBTCxHQUFhO0FBQ1oscUJBRFk7QUFFWixpQkFGWTtBQUdaLFVBQU8sSUFISztBQUlaLFlBQVMsQ0FDUixNQURRLEVBRVIsY0FGUSxFQUdSLFdBSFEsRUFJUixxQkFKUSxDQUpHO0FBVVosWUFBUztBQVZHLEdBQWI7O0FBYUEsUUFBSyxXQUFMLEdBQW1CLE1BQUssV0FBTCxDQUFpQixJQUFqQixPQUFuQjtBQUNBLFFBQUssYUFBTCxHQUFxQixNQUFLLGFBQUwsQ0FBbUIsSUFBbkIsT0FBckI7QUFDQSxRQUFLLGNBQUwsR0FBc0IsTUFBSyxjQUFMLENBQW9CLElBQXBCLE9BQXRCO0FBQ0EsUUFBSyxnQkFBTCxHQUF3QixNQUFLLGdCQUFMLENBQXNCLElBQXRCLE9BQXhCOztBQUVBLFdBQVMsZ0JBQVQsQ0FBMkIsa0JBQTNCLEVBQStDLE1BQUssY0FBcEQ7QUF0Q29CO0FBdUNwQjs7OztzQ0FFbUI7QUFDbkIsT0FBSyxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQXZCLEVBQThCO0FBQzdCLFNBQUssY0FBTCxDQUFxQixLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQXZDO0FBQ0E7QUFDRDs7O2lDQUVjO0FBQ2QsV0FBUSxHQUFSLENBQWEsS0FBSyxLQUFMLENBQVcsTUFBeEI7O0FBRUEsT0FBSyxDQUFFLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsTUFBekIsRUFBa0M7QUFDakMsV0FBTyxRQUFQLENBQWdCLFdBQWhCO0FBQ0EsSUFGRCxNQUVPO0FBQ04sV0FBTyxRQUFQLENBQWdCLFNBQWhCO0FBQ0E7QUFDRDs7OzhCQUVZLFEsRUFBVztBQUN2QixRQUFLLFFBQUwsQ0FBYztBQUNiO0FBRGEsSUFBZDs7QUFJQSxVQUFPLE1BQVAsQ0FBYyxHQUFkLENBQW1CLFVBQW5CLEVBQStCLFFBQS9CO0FBQ0E7OztrQ0FFZTtBQUNmLFFBQUssUUFBTCxDQUFlLFVBQVUsU0FBVixFQUFzQjtBQUNwQyxRQUFJLFNBQVMsVUFBVSxNQUFWLENBQWlCLE1BQWpCLElBQTJCLEtBQXhDO0FBQ0EsUUFBSSxXQUFXLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBbUIsU0FBbkIsQ0FBZjs7QUFFQSxhQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBRSxNQUEzQjs7QUFFQSxXQUFPLFFBQVA7QUFDQSxJQVBELEVBT0csWUFBVztBQUNiLFNBQUssZ0JBQUwsQ0FBdUIsUUFBdkIsRUFBaUMsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixNQUFuRDtBQUNBLElBVEQ7QUFVQTs7O21DQUVnQjtBQUNoQixRQUFLLFFBQUwsQ0FBZSxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQWpDO0FBQ0E7OztxQ0FFZ0M7QUFBQSxPQUFmLEtBQWUsdUVBQVAsSUFBTzs7QUFDaEMsT0FBSyxVQUFVLElBQWYsRUFBc0I7QUFDckIsU0FBSyxRQUFMLENBQWM7QUFDYixhQUFRO0FBQ1AsWUFBTSxFQURDO0FBRVAsWUFBTSxFQUZDO0FBR1AsY0FBUTtBQUhEO0FBREssS0FBZDs7QUFRQTtBQUNBOztBQUVELE9BQUksU0FBUyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQXFCLEtBQXJCLENBQWI7O0FBRUEsT0FBSyxVQUFVLE9BQU8sSUFBUCxLQUFnQixLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLElBQWpELEVBQXdEO0FBQ3ZELFNBQUssUUFBTCxDQUFjO0FBQ2I7QUFEYSxLQUFkLEVBRUcsWUFBVztBQUNiLFVBQUssY0FBTCxDQUFxQixPQUFPLElBQTVCO0FBQ0EsS0FKRDs7QUFNQSxXQUFPLE1BQVAsQ0FBYyxHQUFkLENBQW1CLGdCQUFuQixFQUFxQyxLQUFyQztBQUNBO0FBQ0Q7OzttQ0FFaUIsUSxFQUFVLEssRUFBUTtBQUNuQyxPQUFJLFdBQVcsT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixVQUFsQixDQUFmO0FBQ0EsT0FBSSxjQUFjLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsZ0JBQWxCLENBQWxCOztBQUVBLE9BQUssTUFBTSxPQUFOLENBQWUsUUFBZixLQUE2QixTQUFVLFdBQVYsQ0FBbEMsRUFBNEQ7QUFDM0QsYUFBVSxXQUFWLEVBQXlCLFFBQXpCLElBQXNDLEtBQXRDOztBQUVBLFdBQU8sTUFBUCxDQUFjLEdBQWQsQ0FBbUIsVUFBbkIsRUFBK0IsUUFBL0I7QUFDQSxJQUpELE1BSU87QUFDTixXQUFPLEtBQVAsQ0FBYyxnREFBZDtBQUNBO0FBQ0Q7Ozt1Q0FFcUIsSSxFQUFPO0FBQzVCLFVBQU8sYUFBUCxHQUF1QixJQUFJLEtBQUosQ0FBVTtBQUNoQyxVQUFNLGdCQUQwQjtBQUVoQyxTQUFLO0FBRjJCLElBQVYsQ0FBdkI7O0FBS0EsVUFBTyxhQUFQLENBQXFCLFdBQXJCLENBQWtDLE9BQWxDLEVBQTJDLFVBQVcsS0FBSyxZQUFoQixFQUE4QixHQUE5QixDQUEzQztBQUNBOzs7MkJBRVMsSSxFQUFPO0FBQ2hCLFFBQUssUUFBTCxDQUFjLEVBQUUsU0FBUyxJQUFYLEVBQWQ7O0FBRUEsVUFBTyxFQUFQLENBQVUsT0FBVjs7QUFFQSxPQUFJLFVBQVUsSUFBSSxNQUFKLENBQVksS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixJQUFuQixDQUF3QixHQUF4QixDQUFaLEVBQTBDLEdBQTFDLENBQWQ7O0FBRUEsaUJBQWUsSUFBZixFQUFxQjtBQUNwQjtBQUNBO0FBRm9CLElBQXJCLEVBR0csSUFISCxDQUdTLFVBQVUsS0FBVixFQUFrQjtBQUMxQixTQUFLLFFBQUwsQ0FBYztBQUNiLGlCQURhO0FBRWIsY0FBUztBQUZJLEtBQWQ7O0FBS0EsV0FBTyxFQUFQLENBQVUsT0FBVixDQUFtQixLQUFuQjtBQUNBLElBUFEsQ0FPUCxJQVBPLENBT0QsSUFQQyxDQUhUO0FBV0E7OztpQ0FFZSxJLEVBQU87QUFDdEIsUUFBSyxRQUFMLENBQWUsSUFBZjs7QUFFQSxRQUFLLG9CQUFMLENBQTJCLElBQTNCOztBQUVBO0FBQ0EsV0FBUSxLQUFSLENBQWUsSUFBZjtBQUNBOztBQUVBLFVBQU8sTUFBUCxHQUFnQixJQUFJLE1BQUosRUFBaEI7O0FBRUEsUUFBSyxZQUFMO0FBQ0E7OztrQ0FFZTtBQUNmLE9BQUssS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixNQUF2QixFQUFnQztBQUMvQixXQUNDO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FERDtBQUdBOztBQUVELFVBQU8sRUFBUDtBQUNBOzs7MkJBRVE7QUFDUixVQUNDO0FBQUMsU0FBRCxDQUFPLFFBQVA7QUFBQTtBQUNDO0FBQUE7QUFBQSxPQUFLLElBQUcsUUFBUjtBQUNDLHlCQUFDLGFBQUQ7QUFDQyxjQUFTLEtBQUssS0FBTCxDQUFXLE1BRHJCO0FBRUMsZ0JBQVcsS0FBSyxLQUFMLENBQVcsUUFGdkI7QUFHQyxtQkFBYyxLQUFLLFdBSHBCO0FBSUMscUJBQWdCLEtBQUssYUFKdEI7QUFLQyxzQkFBaUIsS0FBSyxjQUx2QjtBQU1DLHdCQUFtQixLQUFLO0FBTnpCO0FBREQsS0FERDtBQVdDO0FBQUE7QUFBQSxPQUFLLElBQUcsU0FBUjtBQUNHLFVBQUssYUFBTCxFQURIO0FBR0MseUJBQUMsUUFBRDtBQUNDLFlBQU8sS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixJQUQxQjtBQUVDLGFBQVEsS0FBSyxLQUFMLENBQVcsS0FGcEI7QUFHQyxlQUFVLEtBQUssS0FBTCxDQUFXO0FBSHRCO0FBSEQ7QUFYRCxJQUREO0FBdUJBOzs7O0VBdk1xQixNQUFNLFM7O0FBME03QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7QUM1TkE7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O2VBRThDLFFBQVEsZ0JBQVIsQztJQUF0QyxZLFlBQUEsWTtJQUFjLG1CLFlBQUEsbUI7O0FBRXRCLElBQU0sb0JBQW9CLFFBQVEscUJBQVIsQ0FBMUI7O0lBRU0sUTs7O0FBQ0wsbUJBQWEsS0FBYixFQUFxQjtBQUFBOztBQUFBLGtIQUNiLEtBRGE7O0FBR3BCLFFBQUssS0FBTCxHQUFhO0FBQ1osZUFBWTtBQURBLEdBQWI7O0FBSUEsUUFBSyxhQUFMLEdBQXFCLE1BQUssYUFBTCxDQUFtQixJQUFuQixPQUFyQjtBQVBvQjtBQVFwQjs7OztzQ0FFbUI7QUFDbkIsWUFBUyxnQkFBVCxDQUEyQixpQkFBM0IsRUFBOEMsWUFBVztBQUN4RCxTQUFLLGFBQUwsQ0FBb0IsSUFBcEI7QUFDQSxJQUY2QyxDQUU1QyxJQUY0QyxDQUV0QyxJQUZzQyxDQUE5QztBQUdBOzs7OEJBRVksRyxFQUFNO0FBQ2xCLE9BQUksYUFBSjs7QUFFQSxXQUFTLEdBQVQ7QUFDQyxTQUFLLE1BQUw7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLE1BQUw7QUFDQyxZQUFPLE9BQVA7QUFDQTs7QUFFRCxTQUFLLE1BQUw7QUFDQSxTQUFLLE9BQUw7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLE9BQUw7QUFDQSxTQUFLLE9BQUw7QUFDQSxTQUFLLE9BQUw7QUFDQSxTQUFLLEtBQUw7QUFDQSxTQUFLLEtBQUw7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLE9BQUw7QUFDQyxZQUFPLE1BQVA7QUFDQTs7QUFFRCxTQUFLLE1BQUw7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLEtBQUw7QUFDQSxTQUFLLEtBQUw7QUFDQyxZQUFPLEtBQVA7QUFDQTs7QUFFRDtBQUNDLFlBQU8sTUFBUDtBQUNBO0FBOUJGOztBQWlDQSxVQUFPLElBQVA7QUFDQTs7O2dDQUVjLE8sRUFBVTtBQUN4QixPQUFLLEtBQUssS0FBTCxDQUFXLFVBQVgsSUFBeUIsS0FBSyxLQUFMLENBQVcsVUFBWCxLQUEwQixPQUF4RCxFQUFrRTtBQUNqRTtBQUNBOztBQUVELE9BQUssT0FBTCxFQUFlO0FBQ2QsWUFBUSxTQUFSLENBQWtCLEdBQWxCLENBQXNCLFFBQXRCO0FBQ0E7O0FBRUQsUUFBSyxRQUFMLENBQWUsVUFBVSxTQUFWLEVBQXNCO0FBQ3BDLFFBQUssVUFBVSxVQUFmLEVBQTRCO0FBQzNCLGVBQVUsVUFBVixDQUFxQixTQUFyQixDQUErQixNQUEvQixDQUFzQyxRQUF0QyxFQUFnRCxhQUFoRDtBQUNBOztBQUVELFdBQU8sRUFBRSxZQUFZLE9BQWQsRUFBUDtBQUNBLElBTkQ7QUFPQTs7OzRCQUVVLEksRUFBa0I7QUFBQSxPQUFaLEtBQVksdUVBQUosQ0FBSTs7QUFDNUIsT0FBSSxPQUFPLEtBQUssSUFBaEI7QUFDQSxPQUFJLE1BQU0sS0FBSyxTQUFMLElBQWtCLElBQTVCO0FBQ0EsT0FBSSxpQkFBSjs7QUFFQSxPQUFLLEtBQUssSUFBTCxLQUFjLFdBQW5CLEVBQWlDO0FBQ2hDLFFBQUssS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUE1QixFQUFnQztBQUMvQixTQUFJLGdCQUFnQixFQUFwQjs7QUFFQSxVQUFNLElBQUksS0FBVixJQUFtQixLQUFLLFFBQXhCLEVBQW1DO0FBQ2xDLG9CQUFjLElBQWQsQ0FBb0IsS0FBSyxTQUFMLENBQWdCLEtBQUssUUFBTCxDQUFlLEtBQWYsQ0FBaEIsRUFBd0MsUUFBUSxDQUFoRCxDQUFwQjtBQUNBOztBQUVELGdCQUFXO0FBQUE7QUFBQSxRQUFJLFdBQVUsVUFBZCxFQUF5QixLQUFNLEtBQUssSUFBTCxHQUFZLFdBQTNDO0FBQTJEO0FBQTNELE1BQVg7QUFDQTs7QUFFRCxXQUFPLG9CQUFDLGlCQUFEO0FBQ04sVUFBTSxLQUFLLElBREw7QUFFTixXQUFPLElBRkQ7QUFHTixZQUFRLEtBSEY7QUFJTixlQUFXO0FBSkwsTUFBUDtBQU1BLElBakJELE1BaUJPO0FBQ04sV0FBTyxLQUFLLFdBQUwsQ0FBa0IsR0FBbEIsQ0FBUDs7QUFFQSxXQUFPLG9CQUFDLFlBQUQ7QUFDTixVQUFNLEtBQUssSUFETDtBQUVOLFdBQU8sSUFGRDtBQUdOLFdBQU8sSUFIRDtBQUlOLFlBQVEsS0FKRjtBQUtOLFdBQU8sS0FBSyxLQUFMLENBQVcsSUFMWjtBQU1OLG9CQUFnQixLQUFLO0FBTmYsTUFBUDtBQVFBO0FBQ0Q7OzsrQkFFWTtBQUNaLE9BQUssS0FBSyxLQUFMLENBQVcsT0FBaEIsRUFBMEI7QUFDekIsV0FDQztBQUFDLHdCQUFEO0FBQUEsT0FBcUIsTUFBSyxTQUExQjtBQUFBO0FBQUEsS0FERDtBQUtBLElBTkQsTUFNTyxJQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsSUFBbEIsRUFBeUI7QUFDL0IsV0FDQztBQUFDLHdCQUFEO0FBQUEsT0FBcUIsTUFBSyxPQUExQjtBQUFBO0FBQUEsS0FERDtBQUtBLElBTk0sTUFNQSxJQUFLLENBQUUsS0FBSyxLQUFMLENBQVcsS0FBbEIsRUFBMEI7QUFDaEMsV0FDQztBQUFDLHdCQUFEO0FBQUEsT0FBcUIsTUFBSyxPQUExQjtBQUFBO0FBQUEsS0FERDtBQUtBOztBQUVELE9BQUksV0FBVyxFQUFmOztBQUVBLE9BQUssS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixRQUFqQixJQUE2QixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLFFBQWpCLENBQTBCLE1BQTFCLEdBQW1DLENBQXJFLEVBQXlFO0FBQ3hFO0FBQ0EsU0FBTSxJQUFJLEtBQVYsSUFBbUIsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixRQUFwQyxFQUErQztBQUM5QyxjQUFTLElBQVQsQ0FBZSxLQUFLLFNBQUwsQ0FBZ0IsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixRQUFqQixDQUEyQixLQUEzQixDQUFoQixDQUFmO0FBQ0E7QUFDRCxJQUxELE1BS087QUFDTixhQUFTLElBQVQsQ0FBZSxLQUFLLFNBQUwsQ0FBZ0IsS0FBSyxLQUFMLENBQVcsS0FBM0IsQ0FBZjtBQUNBOztBQUVELFVBQU8sUUFBUDtBQUNBOzs7MkJBRVE7QUFDUixVQUNDO0FBQUE7QUFBQSxNQUFJLElBQUcsT0FBUDtBQUNHLFNBQUssVUFBTDtBQURILElBREQ7QUFLQTs7OztFQXZKcUIsTUFBTSxTOztBQTBKN0IsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7Ozs7O0FDcEtBOzs7O0FBSUEsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztJQUVNLGlCOzs7QUFDTCw0QkFBYSxLQUFiLEVBQXFCO0FBQUE7O0FBQUEsb0lBQ2IsS0FEYTs7QUFHcEIsUUFBSyxLQUFMLEdBQWE7QUFDWixhQUFVO0FBREUsR0FBYjs7QUFJQSxRQUFLLE9BQUwsR0FBZSxNQUFLLE9BQUwsQ0FBYSxJQUFiLE9BQWY7QUFQb0I7QUFRcEI7Ozs7bUNBRWdCO0FBQ2hCLE9BQUssQ0FBRSxLQUFLLEtBQUwsQ0FBVyxRQUFsQixFQUE2QjtBQUM1QixXQUFPLElBQVA7QUFDQTs7QUFFRCxVQUFPLEtBQUssS0FBTCxDQUFXLFFBQWxCO0FBQ0E7OzswQkFFUSxLLEVBQVE7QUFDaEIsU0FBTSxlQUFOOztBQUVBLFVBQU8sRUFBUCxDQUFVLFNBQVYsQ0FBcUIsS0FBckI7O0FBRUEsUUFBSyxRQUFMLENBQWUsVUFBVSxTQUFWLEVBQXNCO0FBQ3BDLFdBQU8sRUFBRSxVQUFVLENBQUUsVUFBVSxRQUF4QixFQUFQO0FBQ0EsSUFGRDtBQUdBOzs7MkJBRVE7QUFDUixPQUFJLFlBQVksV0FBaEI7O0FBRUEsT0FBSyxLQUFLLEtBQUwsQ0FBVyxRQUFoQixFQUEyQjtBQUMxQixpQkFBYSxTQUFiO0FBQ0E7O0FBRUQsVUFDQztBQUFBO0FBQUEsTUFBSSxXQUFZLFNBQWhCLEVBQTRCLFNBQVUsS0FBSyxPQUEzQztBQUNDO0FBQUE7QUFBQSxPQUFLLFdBQVUsVUFBZjtBQUNHLFlBQU8sWUFBUCxDQUFvQixRQUFwQixFQUE4QixNQUE5QixDQUFzQyxLQUFLLEtBQUwsQ0FBVyxLQUFqRCxDQURIO0FBRUMsbUNBQU0sV0FBVSxNQUFoQixHQUZEO0FBR0M7QUFBQTtBQUFBO0FBQVUsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQjtBQUExQjtBQUhELEtBREQ7QUFNRyxTQUFLLGNBQUw7QUFOSCxJQUREO0FBVUE7Ozs7RUE5QzhCLE1BQU0sUzs7QUFpRHRDLE9BQU8sT0FBUCxHQUFpQixpQkFBakI7Ozs7Ozs7Ozs7Ozs7QUN2REE7Ozs7ZUFJMEIsUUFBUSxVQUFSLEM7SUFBbEIsTSxZQUFBLE07SUFBUSxLLFlBQUEsSzs7SUFFUixJLEdBQW1CLE0sQ0FBbkIsSTtJQUFNLFEsR0FBYSxNLENBQWIsUTs7O0FBRWQsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztBQUVBLElBQU0sV0FBVyxRQUFRLFdBQVIsQ0FBakI7O0FBRUEsSUFBTSxvQkFBb0IsUUFBUSxrQ0FBUixDQUExQjs7QUFFQSxJQUFNLG1CQUFtQixRQUFRLGlDQUFSLENBQXpCOztJQUVNLFk7OztBQUNMLHVCQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSwwSEFDYixLQURhOztBQUdwQixRQUFLLE9BQUwsR0FBZSxNQUFLLE9BQUwsQ0FBYSxJQUFiLE9BQWY7QUFDQSxRQUFLLGFBQUwsR0FBcUIsTUFBSyxhQUFMLENBQW1CLElBQW5CLE9BQXJCO0FBSm9CO0FBS3BCOzs7OzZCQUVXLEksRUFBTztBQUNsQixPQUFLLENBQUUsS0FBSyxTQUFaLEVBQXdCO0FBQ3ZCLFdBQU8sSUFBUDtBQUNBOztBQUVELFdBQVMsS0FBSyxTQUFkO0FBQ0MsU0FBSyxNQUFMO0FBQ0EsU0FBSyxPQUFMO0FBQ0EsU0FBSyxPQUFMO0FBQ0EsU0FBSyxPQUFMO0FBQ0MsWUFBTyxvQkFBQyxnQkFBRCxJQUFrQixNQUFPLEtBQUssS0FBTCxDQUFXLElBQXBDLEVBQTJDLE1BQU8sSUFBbEQsR0FBUDtBQUNELFNBQUssS0FBTDtBQUNBLFNBQUssS0FBTDtBQUNBLFNBQUssTUFBTDtBQUNDLFlBQU8sb0JBQUMsaUJBQUQsSUFBbUIsTUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFyQyxFQUE0QyxNQUFPLElBQW5ELEdBQVA7QUFDRDtBQUNDLFlBQU8sSUFBUDtBQVhGO0FBYUE7OzswQkFFUSxLLEVBQVE7QUFDaEIsU0FBTSxlQUFOOztBQUVBLFFBQUssS0FBTCxDQUFXLGFBQVgsQ0FBMEIsTUFBTSxhQUFoQzs7QUFFQSxPQUFJLGVBQWUsS0FBSyxVQUFMLENBQWlCLEtBQUssS0FBTCxDQUFXLElBQTVCLENBQW5COztBQUVBLE9BQUssQ0FBRSxZQUFQLEVBQXNCO0FBQ3JCLFdBQU8sRUFBUCxDQUFVLFNBQVYsQ0FBcUIsS0FBckI7QUFDQTtBQUNBOztBQUVELFNBQU0sYUFBTixDQUFvQixTQUFwQixDQUE4QixHQUE5QixDQUFrQyxhQUFsQzs7QUFFQSxZQUFTLE1BQVQsQ0FDQyxZQURELEVBRUMsU0FBUyxjQUFULENBQXdCLFlBQXhCLENBRkQ7O0FBS0EsVUFBTyxFQUFQLENBQVUsU0FBVixDQUFxQixJQUFyQixFQUEyQixTQUFTLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBM0I7QUFDQTs7O2dDQUVjLEssRUFBUTtBQUN0QixTQUFNLGNBQU47O0FBRUEsT0FBSSxXQUFXLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBL0I7O0FBRUEsT0FBSSxPQUFPLElBQUksSUFBSixFQUFYO0FBQ0EsUUFBSyxNQUFMLENBQWEsSUFBSSxRQUFKLENBQWE7QUFDekIsV0FBTyxNQURrQjtBQUV6QixXQUFPLGlCQUFXO0FBQUUsV0FBTSxRQUFOLENBQWdCLFFBQWhCO0FBQTRCO0FBRnZCLElBQWIsQ0FBYjtBQUlBLFFBQUssTUFBTCxDQUFhLElBQUksUUFBSixDQUFhO0FBQ3pCLFdBQU8sZ0JBRGtCO0FBRXpCLFdBQU8saUJBQVc7QUFBRSxXQUFNLGdCQUFOLENBQXdCLFFBQXhCO0FBQW9DO0FBRi9CLElBQWIsQ0FBYjtBQUlBLFFBQUssTUFBTCxDQUFhLElBQUksUUFBSixDQUFhO0FBQ3pCLFVBQU07QUFEbUIsSUFBYixDQUFiO0FBR0EsUUFBSyxNQUFMLENBQWEsSUFBSSxRQUFKLENBQWE7QUFDekIsV0FBTyxRQURrQjtBQUV6QixXQUFPLFlBQVc7QUFDakIsU0FBSyxPQUFPLE9BQVAsc0NBQW1ELEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBbkUsT0FBTCxFQUFvRjtBQUNuRixVQUFLLE1BQU0sZUFBTixDQUF1QixRQUF2QixDQUFMLEVBQXlDO0FBQ3hDO0FBQ0EsZ0JBQVMsYUFBVCxDQUF3QixJQUFJLEtBQUosQ0FBVSxrQkFBVixDQUF4QjtBQUNBLE9BSEQsTUFHTztBQUNOLGNBQU8sS0FBUCx1QkFBa0MsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFsRDtBQUNBO0FBQ0Q7QUFDRCxLQVRNLENBU0wsSUFUSyxDQVNDLElBVEQ7QUFGa0IsSUFBYixDQUFiOztBQWNBLFFBQUssS0FBTCxDQUFZLE9BQU8sZ0JBQVAsRUFBWjtBQUNBOzs7MkJBRVE7QUFDUixVQUNDO0FBQUE7QUFBQTtBQUNDLGdCQUFZLEtBQUssS0FBTCxDQUFXLElBRHhCO0FBRUMsY0FBVSxLQUFLLE9BRmhCO0FBR0Msb0JBQWdCLEtBQUs7QUFIdEI7QUFLQztBQUFBO0FBQUEsT0FBSyxXQUFVLFVBQWY7QUFDRyxZQUFPLFlBQVAsQ0FBb0IsUUFBcEIsRUFBOEIsTUFBOUIsQ0FBc0MsS0FBSyxLQUFMLENBQVcsS0FBakQsQ0FESDtBQUVDLG1DQUFNLFdBQVUsTUFBaEIsR0FGRDtBQUdDO0FBQUE7QUFBQTtBQUFVLFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFBMUI7QUFIRDtBQUxELElBREQ7QUFhQTs7OztFQWxHeUIsTUFBTSxTOztBQXFHakMsU0FBUyxtQkFBVCxDQUE4QixLQUE5QixFQUFzQztBQUNyQyxRQUNDO0FBQUE7QUFBQSxJQUFJLFdBQVksTUFBTSxJQUFOLEdBQWEsY0FBN0I7QUFDQztBQUFBO0FBQUEsS0FBSyxXQUFVLE9BQWY7QUFBeUIsU0FBTTtBQUEvQjtBQURELEVBREQ7QUFLQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsMkJBRGdCO0FBRWhCO0FBRmdCLENBQWpCOzs7Ozs7Ozs7Ozs7O0FDN0hBOzs7O2VBSXNFLFFBQVEsNEJBQVIsQztJQUE5RCxLLFlBQUEsSztJQUFPLGdCLFlBQUEsZ0I7SUFBa0IsZ0IsWUFBQSxnQjtJQUFrQixjLFlBQUEsYzs7QUFFbkQsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkOztJQUVNLFc7OztBQUNMLHNCQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSx3SEFDYixLQURhOztBQUdwQixRQUFLLEtBQUwsR0FBYTtBQUNaLFlBQVM7QUFERyxHQUFiOztBQUlBLFFBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7QUFDQSxRQUFLLGFBQUwsR0FBcUIsTUFBSyxhQUFMLENBQW1CLElBQW5CLE9BQXJCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLE1BQUssYUFBTCxDQUFtQixJQUFuQixPQUFyQjtBQVRvQjtBQVVwQjs7Ozs0QkFrQ1UsUSxFQUFnQztBQUFBLE9BQXRCLFlBQXNCLHVFQUFQLElBQU87O0FBQzFDLE9BQUksV0FBVztBQUNkLFVBQU0saUJBQWtCLEtBQUssS0FBTCxDQUFXLElBQTdCLEVBQW1DLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBbkQsQ0FEUTtBQUVkLFlBQVEsS0FBSyxpQkFBTCxFQUZNO0FBR2QsYUFBUztBQUhLLElBQWY7O0FBTUEsT0FBSSxTQUFTLFlBQVksaUJBQVosQ0FBK0IsS0FBSyxLQUFMLENBQVcsSUFBMUMsRUFBZ0QsS0FBSyxLQUFMLENBQVcsSUFBM0QsQ0FBYjs7QUFFQSxPQUFJLFNBQVcsV0FBVyxLQUFiLEdBQXVCLE1BQXZCLEdBQWdDLFFBQTdDOztBQUVBLE9BQUssUUFBTCxFQUFnQjtBQUNmLFdBQVMsT0FBUSxRQUFSLENBQUYsR0FBeUIsT0FBUSxRQUFSLENBQXpCLEdBQThDLFlBQXJEO0FBQ0EsSUFGRCxNQUVPO0FBQ04sV0FBTyxNQUFQO0FBQ0E7QUFDRDs7OzRCQUVVLFEsRUFBVSxLLEVBQVE7QUFDNUIsT0FBSyxDQUFFLE9BQU8sYUFBVCxJQUEwQixDQUFFLFFBQWpDLEVBQTRDO0FBQzNDLFdBQU8sS0FBUCxDQUFjLHVEQUFkO0FBQ0E7QUFDQTs7QUFFRCxPQUFJLFdBQVcsTUFBTyxpQkFBa0IsS0FBSyxLQUFMLENBQVcsSUFBN0IsRUFBbUMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFuRCxDQUFQLENBQWY7O0FBRUEsT0FBSSxRQUFRLE9BQU8sYUFBUCxDQUFxQixHQUFyQixDQUEwQixPQUExQixFQUFtQyxFQUFuQyxDQUFaO0FBQ0EsT0FBSSxZQUFZLE1BQU0sU0FBTixDQUFpQjtBQUFBLFdBQVEsS0FBSyxJQUFMLEtBQWMsUUFBdEI7QUFBQSxJQUFqQixDQUFoQjs7QUFFQSxPQUFLLGNBQWMsQ0FBQyxDQUFwQixFQUF3QjtBQUN2QixRQUFJLGFBQWE7QUFDaEIsV0FBTSxRQURVO0FBRWhCLFdBQU0sS0FBSyxLQUFMLENBQVcsUUFGRDtBQUdoQixhQUFRLEtBQUssaUJBQUw7QUFIUSxLQUFqQjs7QUFNQSxRQUFLLE9BQVEsS0FBUixLQUFvQixXQUFwQixJQUFtQyxVQUFVLElBQWxELEVBQXlEO0FBQ3hELGdCQUFZLFFBQVosSUFBeUIsS0FBekI7QUFDQTtBQUNELFVBQU0sSUFBTixDQUFZLFVBQVo7QUFDQSxJQVhELE1BV087QUFDTixRQUFLLE9BQVEsS0FBUixLQUFvQixXQUF6QixFQUF1QztBQUN0QyxXQUFPLFNBQVAsRUFBb0IsUUFBcEIsSUFBaUMsS0FBakM7QUFDQSxLQUZELE1BRU8sSUFBSyxVQUFVLElBQWYsRUFBc0I7QUFDNUIsWUFBTyxNQUFPLFNBQVAsRUFBb0IsUUFBcEIsQ0FBUDtBQUNBO0FBQ0Q7O0FBRUQsVUFBTyxhQUFQLENBQXFCLEdBQXJCLENBQTBCLE9BQTFCLEVBQW1DLEtBQW5DO0FBQ0E7Ozs0QkFFVSxNLEVBQThCO0FBQUEsT0FBdEIsWUFBc0IsdUVBQVAsSUFBTzs7QUFDeEMsT0FBSyxLQUFLLEtBQUwsQ0FBVyxPQUFYLElBQXNCLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBb0IsTUFBcEIsQ0FBM0IsRUFBMEQ7QUFDekQsV0FBTyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW9CLE1BQXBCLENBQVA7QUFDQTs7QUFFRCxVQUFPLFlBQVA7QUFDQTs7OzRCQUVVLE0sRUFBUSxLLEVBQVE7QUFDMUIsUUFBSyxRQUFMLENBQWUsVUFBVSxTQUFWLEVBQXNCO0FBQ3BDLFFBQUksVUFBVSxVQUFVLE9BQVYsSUFBcUIsRUFBbkM7QUFDQSxZQUFTLE1BQVQsSUFBb0IsS0FBcEI7O0FBRUEsV0FBTyxFQUFFLGdCQUFGLEVBQVA7QUFDQSxJQUxELEVBS0csWUFBVztBQUNiLFNBQUssU0FBTCxDQUFnQixTQUFoQixFQUEyQixLQUFLLEtBQUwsQ0FBVyxPQUF0QztBQUNBLElBUEQ7QUFRQTs7OytCQUVhLEssRUFBTyxLLEVBQVE7QUFDNUIsUUFBSyxTQUFMLENBQWdCLE1BQU0sTUFBTixDQUFhLElBQTdCLEVBQW1DLEtBQW5DO0FBQ0E7OztzQ0FFbUI7QUFDbkIsVUFBTyxlQUFnQixLQUFLLEtBQUwsQ0FBVyxJQUEzQixFQUFpQyxLQUFLLFlBQXRDLEVBQW9ELEtBQUssZUFBekQsQ0FBUDtBQUNBOzs7Z0NBRWMsSyxFQUFPLEksRUFBTztBQUM1QixRQUFLLFNBQUwsQ0FBZ0IsUUFBaEIsRUFBMEIsSUFBMUI7QUFDQTs7O2tDQUVrQztBQUFBLE9BQXBCLElBQW9CLHVFQUFiLFVBQWE7O0FBQ2xDLE9BQUksWUFBYyxTQUFTLFNBQTNCO0FBQ0EsT0FBSSxlQUFpQixTQUFTLFVBQVQsSUFBdUIsU0FBUyxTQUFyRDtBQUNBLE9BQUksY0FBYyxLQUFLLGlCQUFMLEVBQWxCO0FBQ0EsT0FBSSxhQUFhLEtBQUssU0FBTCxDQUFnQixRQUFoQixFQUEwQixXQUExQixDQUFqQjs7QUFFQSxPQUFLLFlBQUwsRUFBb0I7QUFDbkIsaUJBQWEsaUJBQWtCLEtBQUssS0FBTCxDQUFXLElBQTdCLEVBQW1DLFVBQW5DLENBQWI7QUFDQSxJQUZELE1BRU87QUFDTixpQkFBYSxpQkFBa0IsS0FBSyxLQUFMLENBQVcsSUFBN0IsRUFBbUMsVUFBbkMsQ0FBYjtBQUNBOztBQUVELE9BQUssU0FBTCxFQUFpQjtBQUNoQixpQkFBYSxNQUFPLFVBQVAsQ0FBYjtBQUNBOztBQUVELFVBQU8sVUFBUDtBQUNBOzs7a0NBRWU7QUFDZixVQUFPLEVBQVAsQ0FBVSxPQUFWLENBQW1CLElBQW5CO0FBQ0EsUUFBSyxRQUFMLENBQWMsRUFBRSxTQUFTLElBQVgsRUFBZDs7QUFFQSxVQUFPLFFBQVAsQ0FBZ0IsV0FBaEIsQ0FDQyxLQUFLLEtBQUwsQ0FBVyxJQURaLEVBRUMsS0FBSyxTQUFMLEVBRkQsRUFHQyxLQUFLLEtBQUwsQ0FBVyxhQUhaLEVBSUMsVUFBVSxJQUFWLEVBQWlCO0FBQ2hCLFdBQU8sRUFBUCxDQUFVLE9BQVYsQ0FBbUIsS0FBbkI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxFQUFFLFNBQVMsS0FBWCxFQUFkO0FBQ0EsSUFIRCxDQUdFLElBSEYsQ0FHUSxJQUhSLENBSkQ7QUFTQTs7O2lDQUVjO0FBQ2QsVUFDQztBQUFBO0FBQUE7QUFDQyxnQkFBVSxlQURYO0FBRUMsY0FBVSxLQUFLLGFBRmhCO0FBR0MsZUFBVyxLQUFLLEtBQUwsQ0FBVztBQUh2QjtBQUtHLFNBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsY0FBckIsR0FBc0M7QUFMekMsSUFERDtBQVNBOzs7MkJBRVE7QUFDUixVQUFPLElBQVA7QUFDQTs7OzJDQWxLZ0MsUyxFQUFZO0FBQzVDLE9BQUksaUJBQWlCLE9BQU8sUUFBUCxDQUFnQixjQUFoQixDQUFnQyxVQUFVLElBQTFDLENBQXJCOztBQUVBLFVBQU87QUFDTixVQUFNLGVBQWUsSUFEZjtBQUVOLGNBQVUsZUFBZSxRQUZuQjtBQUdOLG1CQUFlLGVBQWUsYUFIeEI7QUFJTixhQUFTLFlBQVksb0JBQVosQ0FBa0MsVUFBVSxJQUE1QyxFQUFrRCxVQUFVLElBQTVEO0FBSkgsSUFBUDtBQU1BOzs7dUNBRTRCLEksRUFBTSxJLEVBQU87QUFDekMsT0FBSSxRQUFRLFlBQVksaUJBQVosQ0FBK0IsSUFBL0IsRUFBcUMsSUFBckMsQ0FBWjs7QUFFQSxVQUFTLFNBQVMsTUFBTSxPQUFqQixHQUE2QixNQUFNLE9BQW5DLEdBQTZDLEVBQXBEO0FBQ0E7OztvQ0FFeUIsSSxFQUFNLEksRUFBTztBQUN0QyxPQUFLLFFBQVEsT0FBTyxhQUFwQixFQUFvQztBQUNuQyxRQUFJLFdBQVcsTUFBTyxpQkFBa0IsSUFBbEIsRUFBd0IsS0FBSyxJQUE3QixDQUFQLENBQWY7O0FBRUEsUUFBSSxRQUFRLE9BQU8sYUFBUCxDQUFxQixHQUFyQixDQUEwQixPQUExQixFQUFtQyxFQUFuQyxDQUFaO0FBQ0EsUUFBSSxRQUFRLE1BQU0sSUFBTixDQUFZO0FBQUEsWUFBUyxNQUFNLElBQU4sS0FBZSxRQUF4QjtBQUFBLEtBQVosQ0FBWjs7QUFFQSxRQUFLLEtBQUwsRUFBYTtBQUNaLFlBQU8sS0FBUDtBQUNBO0FBQ0Q7O0FBRUQsVUFBTyxLQUFQO0FBQ0E7Ozs7RUEzQ3dCLE1BQU0sUzs7QUFrTGhDLE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7Ozs7Ozs7Ozs7OztBQzFMQTs7OztBQUlBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNLGNBQWMsUUFBUSxlQUFSLENBQXBCOztBQUVBLElBQU0sY0FBYyxRQUFRLDBCQUFSLENBQXBCOztBQUVBLElBQU0sZ0JBQWdCLFFBQVEsNEJBQVIsQ0FBdEI7O0lBRU0saUI7OztBQUNMLDRCQUFhLEtBQWIsRUFBcUI7QUFBQTs7QUFBQSxvSUFDYixLQURhOztBQUdwQixRQUFLLFlBQUwsR0FBb0IsT0FBcEI7QUFDQSxRQUFLLGVBQUwsR0FBdUIsS0FBdkI7QUFDQSxRQUFLLGlCQUFMLEdBQXlCLENBQ3hCLEVBQUUsTUFBTSxZQUFSLEVBQXNCLFlBQVksQ0FBRSxJQUFGLENBQWxDLEVBRHdCLENBQXpCO0FBTG9CO0FBUXBCOzs7O3VDQUVvQjtBQUNwQixVQUFTLENBQUUsS0FBSyxLQUFMLENBQVcsT0FBYixJQUEwQixDQUFFLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsTUFBckIsSUFBK0IsQ0FBRSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLEtBQXZGO0FBQ0E7OzsyQkFFUTtBQUNSLFVBQ0M7QUFBQTtBQUFBLE1BQUssSUFBRyxjQUFSLEVBQXVCLFdBQVUscUJBQWpDO0FBQ0M7QUFBQTtBQUFBLE9BQUssV0FBVSxRQUFmO0FBQ0M7QUFBQTtBQUFBO0FBQVUsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQjtBQUExQjtBQURELEtBREQ7QUFLQztBQUFBO0FBQUEsT0FBSyxXQUFVLE1BQWY7QUFDQyx5QkFBQyxhQUFEO0FBQ0MsWUFBSyxRQUROO0FBRUMsYUFBTSxhQUZQO0FBR0MsZ0JBQVcsS0FBSyxhQUhqQjtBQUlDLGFBQVEsS0FBSyxhQUFMLENBQW9CLFNBQXBCLENBSlQ7QUFLQyxrQkFBYSxLQUFLLEtBQUwsQ0FBVyxJQUx6QjtBQU1DLGtCQUFhLEtBQUssS0FBTCxDQUFXLElBTnpCO0FBT0MscUJBQWdCLEtBQUs7QUFQdEIsT0FERDtBQVdDLG9DQVhEO0FBYUMseUJBQUMsV0FBRDtBQUNDLFlBQUssYUFETjtBQUVDLGFBQU0sY0FGUDtBQUdDLGdCQUFTLE1BSFY7QUFJQyxnQkFBVyxLQUFLLFlBSmpCO0FBS0MsYUFBUSxLQUFLLFNBQUwsQ0FBZ0IsYUFBaEIsRUFBK0IsS0FBL0I7QUFMVCxPQWJEO0FBcUJDLG9DQXJCRDtBQXVCQyx5QkFBQyxXQUFEO0FBQ0MsWUFBSyxRQUROO0FBRUMsYUFBTSxRQUZQO0FBR0MsZ0JBQVMsTUFIVjtBQUlDLGdCQUFXLEtBQUssWUFKakI7QUFLQyxhQUFRLEtBQUssU0FBTCxDQUFnQixRQUFoQixFQUEwQixLQUExQjtBQUxULE9BdkJEO0FBK0JDLHlCQUFDLFdBQUQ7QUFDQyxZQUFLLE9BRE47QUFFQyxhQUFNLE9BRlA7QUFHQyxnQkFBUyxNQUhWO0FBSUMsZ0JBQVcsS0FBSyxZQUpqQjtBQUtDLGFBQVEsS0FBSyxTQUFMLENBQWdCLE9BQWhCLEVBQXlCLEtBQXpCO0FBTFQsT0EvQkQ7QUF1Q0MseUJBQUMsV0FBRDtBQUNDLFlBQUssVUFETjtBQUVDLGFBQU0sVUFGUDtBQUdDLGdCQUFTLE1BSFY7QUFJQyxnQkFBVyxLQUFLLFlBSmpCO0FBS0MsYUFBUSxLQUFLLFNBQUwsQ0FBZ0IsVUFBaEIsRUFBNEIsS0FBNUI7QUFMVCxPQXZDRDtBQStDQyx5QkFBQyxXQUFEO0FBQ0MsWUFBSyxZQUROO0FBRUMsYUFBTSxZQUZQO0FBR0MsZ0JBQVMsTUFIVjtBQUlDLGdCQUFXLEtBQUssa0JBQUwsRUFKWjtBQUtDLGdCQUFXLEtBQUssWUFMakI7QUFNQyxhQUFRLEtBQUssU0FBTCxDQUFnQixZQUFoQixFQUE4QixLQUE5QjtBQU5UO0FBL0NELEtBTEQ7QUE4REM7QUFBQTtBQUFBLE9BQUssV0FBVSxRQUFmO0FBQ0csVUFBSyxZQUFMO0FBREg7QUE5REQsSUFERDtBQW9FQTs7OztFQXBGOEIsVzs7QUF1RmhDLE9BQU8sT0FBUCxHQUFpQixpQkFBakI7Ozs7Ozs7Ozs7Ozs7QUNuR0E7Ozs7QUFJQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUEsSUFBTSxjQUFjLFFBQVEsZUFBUixDQUFwQjs7QUFFQSxJQUFNLGNBQWMsUUFBUSwwQkFBUixDQUFwQjs7QUFFQSxJQUFNLGNBQWMsUUFBUSwwQkFBUixDQUFwQjs7QUFFQSxJQUFNLGdCQUFnQixRQUFRLDRCQUFSLENBQXRCOztJQUVNLGlCOzs7QUFDTCw0QkFBYSxLQUFiLEVBQXFCO0FBQUE7O0FBQUEsb0lBQ2IsS0FEYTs7QUFHcEIsUUFBSyxZQUFMLEdBQW9CLE9BQXBCO0FBQ0EsUUFBSyxlQUFMLEdBQXVCLE1BQXZCO0FBQ0EsUUFBSyxpQkFBTCxHQUF5QixDQUN4QixFQUFFLE1BQU0sS0FBUixFQUFlLFlBQVksQ0FBRSxLQUFGLENBQTNCLEVBRHdCLENBQXpCO0FBTG9CO0FBUXBCOzs7OzhCQUVXO0FBQ1gsVUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQWhCLENBQXFCLFVBQXJCLENBQWdDLEdBQWhDLENBQVA7QUFDQTs7OzJCQUVRO0FBQ1IsT0FBSyxLQUFLLFNBQUwsRUFBTCxFQUF3QjtBQUN2QixXQUNDO0FBQUE7QUFBQSxPQUFLLElBQUcsY0FBUixFQUF1QixXQUFVLG9CQUFqQztBQUNDO0FBQUE7QUFBQSxRQUFLLFdBQVUsUUFBZjtBQUNDO0FBQUE7QUFBQTtBQUFVLFlBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFBMUI7QUFERCxNQUREO0FBSUM7QUFBQTtBQUFBLFFBQUssV0FBVSxNQUFmO0FBQ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUREO0FBSkQsS0FERDtBQVVBOztBQUVELFVBQ0M7QUFBQTtBQUFBLE1BQUssSUFBRyxjQUFSLEVBQXVCLFdBQVUsb0JBQWpDO0FBQ0M7QUFBQTtBQUFBLE9BQUssV0FBVSxRQUFmO0FBQ0M7QUFBQTtBQUFBO0FBQVUsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQjtBQUExQjtBQURELEtBREQ7QUFLQztBQUFBO0FBQUEsT0FBSyxXQUFVLE1BQWY7QUFDQyx5QkFBQyxhQUFEO0FBQ0MsWUFBSyxRQUROO0FBRUMsYUFBTSxhQUZQO0FBR0MsZ0JBQVcsS0FBSyxhQUhqQjtBQUlDLGFBQVEsS0FBSyxhQUFMLENBQW9CLFNBQXBCLENBSlQ7QUFLQyxrQkFBYSxLQUFLLEtBQUwsQ0FBVyxJQUx6QjtBQU1DLGtCQUFhLEtBQUssS0FBTCxDQUFXLElBTnpCO0FBT0MscUJBQWdCLEtBQUs7QUFQdEIsT0FERDtBQVdDLG9DQVhEO0FBYUMseUJBQUMsV0FBRDtBQUNDLFlBQUssYUFETjtBQUVDLGFBQU0sY0FGUDtBQUdDLGdCQUFTLE1BSFY7QUFJQyxnQkFBVyxLQUFLLFlBSmpCO0FBS0MsYUFBUSxLQUFLLFNBQUwsQ0FBZ0IsYUFBaEIsRUFBK0IsS0FBL0I7QUFMVCxPQWJEO0FBcUJDLG9DQXJCRDtBQXVCRyxVQUFLLEtBQUwsQ0FBVyxJQUFYLEtBQW9CLE1BQXBCLElBQ0Qsb0JBQUMsV0FBRDtBQUNDLFlBQUssT0FETjtBQUVDLGFBQU0sY0FGUDtBQUdDLGdCQUFTLE1BSFY7QUFJQyxnQkFBVyxLQUFLLFlBSmpCO0FBS0MsYUFBUSxLQUFLLFNBQUwsQ0FBZ0IsT0FBaEIsRUFBeUIsUUFBekIsQ0FMVDtBQU1DLGVBQVU7QUFDVCxlQUFRLFFBREM7QUFFVCxnQkFBUyxTQUZBO0FBR1QsaUJBQVUsVUFIRDtBQUlULG1CQUFZO0FBSkg7QUFOWCxPQXhCRjtBQXVDQyx5QkFBQyxXQUFEO0FBQ0MsWUFBSyxZQUROO0FBRUMsYUFBTSxZQUZQO0FBR0MsZ0JBQVMsTUFIVjtBQUlDLGdCQUFXLEtBQUssWUFKakI7QUFLQyxhQUFRLEtBQUssU0FBTCxDQUFnQixZQUFoQixFQUE4QixLQUE5QjtBQUxULE9BdkNEO0FBK0NDLHlCQUFDLFdBQUQ7QUFDQyxZQUFLLGNBRE47QUFFQyxhQUFNLGNBRlA7QUFHQyxnQkFBUyxNQUhWO0FBSUMsZ0JBQVcsS0FBSyxZQUpqQjtBQUtDLGFBQVEsS0FBSyxTQUFMLENBQWdCLGNBQWhCLEVBQWdDLEtBQWhDO0FBTFQ7QUEvQ0QsS0FMRDtBQTZEQztBQUFBO0FBQUEsT0FBSyxXQUFVLFFBQWY7QUFDRyxVQUFLLFlBQUw7QUFESDtBQTdERCxJQUREO0FBbUVBOzs7O0VBaEc4QixXOztBQW1HaEMsT0FBTyxPQUFQLEdBQWlCLGlCQUFqQjs7Ozs7QUNqSEE7Ozs7QUFJQTs7SUFFUSxHLEdBQVEsUUFBUSxVQUFSLEVBQW9CLE0sQ0FBNUIsRzs7QUFFUixJQUFNLEtBQUssUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNLFFBQVEsUUFBUSxlQUFSLEVBQXlCLEtBQXZDO0FBQ0EsSUFBTSxTQUFTLFFBQVEsU0FBUixDQUFmOztBQUVBLElBQU0sY0FBYyxRQUFRLGNBQVIsQ0FBcEI7O0FBRUEsSUFBTSxRQUFRLFFBQVEsUUFBUixLQUFxQixPQUFyQixHQUErQixNQUEvQixHQUF3QyxFQUF0RDtBQUNBLElBQU0sV0FBVyxLQUFLLElBQUwsQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLGNBQTVCLEVBQTRDLE1BQTVDLEVBQW9ELFNBQVMsS0FBN0QsQ0FBakI7QUFDQSxJQUFNLGVBQWUsS0FBSyxJQUFMLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQyxJQUFuQyxFQUF5QyxNQUF6QyxFQUFpRCxhQUFqRCxDQUFyQjs7ZUFFc0QsUUFBUSxzQkFBUixDO0lBQTlDLEssWUFBQSxLO0lBQU8sZ0IsWUFBQSxnQjtJQUFrQixnQixZQUFBLGdCOztBQUVqQyxTQUFTLFNBQVQsR0FBcUI7QUFDcEIsS0FBSyxPQUFPLGFBQVAsQ0FBcUIsTUFBMUIsRUFBbUM7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbEMsd0JBQWtCLE9BQU8sYUFBekIsOEhBQXlDO0FBQUEsUUFBL0IsSUFBK0I7O0FBQ3hDLHFCQUFrQixJQUFsQjtBQUNBO0FBSGlDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS2xDLFNBQU8sSUFBUDtBQUNBOztBQUVEO0FBQ0EsUUFBTyxJQUFQO0FBQ0E7O0FBRUQsU0FBUyxnQkFBVCxDQUEyQixJQUEzQixFQUFrQztBQUNqQyxRQUFRLEtBQUssR0FBYixFQUFrQixVQUFVLEdBQVYsRUFBZSxRQUFmLEVBQTBCO0FBQzNDLE1BQUssR0FBTCxFQUFXO0FBQ1YsV0FBUSxLQUFSLENBQWUsR0FBZjtBQUNBOztBQUgwQztBQUFBO0FBQUE7O0FBQUE7QUFLM0MseUJBQWlCLENBQUUsS0FBSyxHQUFQLEVBQWEsTUFBYixDQUFxQixTQUFTLEdBQVQsQ0FBYztBQUFBLFdBQVMsTUFBTSxHQUFmO0FBQUEsSUFBZCxDQUFyQixDQUFqQixtSUFBNkU7QUFBQSxRQUFuRSxHQUFtRTs7QUFDNUUsUUFBSTtBQUNILGFBQVEsSUFBUixDQUFjLEdBQWQ7QUFDQSxLQUZELENBRUUsT0FBUSxHQUFSLEVBQWM7QUFDZjtBQUNBO0FBQ0E7QUFDRDtBQVowQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBYTNDLEVBYkQ7QUFjQTs7QUFFRCxTQUFTLFdBQVQsR0FBdUI7QUFDdEI7O0FBRUEsS0FBSyxDQUFFLE9BQU8sYUFBZCxFQUE4QjtBQUM3QjtBQUNBOztBQUVELEtBQUksZUFBZSxPQUFPLGFBQVAsQ0FBcUIsR0FBckIsQ0FBMEIsT0FBMUIsRUFBbUMsRUFBbkMsQ0FBbkI7O0FBRUEsS0FBSSxjQUFjLEtBQUssS0FBTCxDQUFZLE9BQU8sYUFBUCxDQUFxQixJQUFqQyxFQUF3QyxHQUExRDs7QUFUc0I7QUFBQTtBQUFBOztBQUFBO0FBV3RCLHdCQUF3QixZQUF4QixtSUFBdUM7QUFBQSxPQUE3QixVQUE2Qjs7QUFDdEMsZUFBYSxXQUFiLEVBQTBCLFVBQTFCO0FBQ0E7QUFicUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWN0Qjs7QUFFRCxTQUFTLFdBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsVUFBNUIsRUFBMkU7QUFBQSxLQUFuQyxRQUFtQyx1RUFBeEIsSUFBd0I7QUFBQSxLQUFsQixRQUFrQix1RUFBUCxJQUFPOztBQUMxRSxLQUFJLFVBQVUsY0FBZSxJQUFmLEVBQXFCLFVBQXJCLENBQWQ7O0FBRUEsS0FBSyxDQUFFLE9BQVAsRUFBaUI7QUFDaEIsTUFBSyxRQUFMLEVBQWdCO0FBQ2Y7QUFDQTs7QUFFRDtBQUNBOztBQUVELEtBQUssUUFBTCxFQUFnQjtBQUNmLFVBQVMsUUFBVCxFQUFtQixPQUFuQixFQUE0QixRQUE1QjtBQUNBLEVBRkQsTUFFTyxJQUFLLFFBQVEsV0FBYixFQUEyQjtBQUNqQyxNQUFLLFFBQVEsU0FBUixJQUFxQixRQUFRLFNBQVIsS0FBc0IsWUFBaEQsRUFBK0Q7QUFDOUQsV0FBUSxVQUFSLEdBQXFCLElBQXJCO0FBQ0E7O0FBRUQsVUFBUyxPQUFULEVBQWtCLE9BQWxCO0FBQ0E7QUFDRDs7QUFFRCxTQUFTLGNBQVQsQ0FBeUIsSUFBekIsRUFBZ0M7QUFDL0IsS0FBSSxVQUFVLEVBQWQ7O0FBRUEsU0FBUyxLQUFLLFNBQWQ7QUFDQyxPQUFLLE1BQUw7QUFDQyxXQUFRLElBQVIsR0FBZSxLQUFmO0FBQ0EsV0FBUSxRQUFSLEdBQW1CLFdBQVcsUUFBUSxJQUF0QztBQUNBO0FBQ0QsT0FBSyxPQUFMO0FBQ0EsT0FBSyxPQUFMO0FBQ0MsV0FBUSxJQUFSLEdBQWUsTUFBZjtBQUNBLFdBQVEsUUFBUixHQUFtQixXQUFXLFFBQVEsSUFBdEM7QUFDQTtBQUNELE9BQUssT0FBTDtBQUNDLFdBQVEsSUFBUixHQUFlLE1BQWY7QUFDQSxXQUFRLFFBQVIsR0FBbUIsV0FBVyxRQUFRLElBQXRDO0FBQ0E7QUFDRCxPQUFLLEtBQUw7QUFDQSxPQUFLLE1BQUw7QUFDQyxXQUFRLElBQVIsR0FBZSxJQUFmO0FBQ0EsV0FBUSxRQUFSLEdBQW1CLFFBQW5CO0FBakJGOztBQW9CQSxTQUFRLGFBQVIsR0FBd0IsV0FBVyxRQUFRLElBQTNDOztBQUVBLFFBQU8sT0FBUDtBQUNBOztBQUVELFNBQVMsYUFBVCxDQUF3QixJQUF4QixFQUE4QixVQUE5QixFQUEyQztBQUMxQyxLQUFLLENBQUUsV0FBVyxJQUFiLElBQXFCLENBQUUsV0FBVyxNQUF2QyxFQUFnRDtBQUMvQyxTQUFPLEtBQVA7QUFDQTs7QUFFRCxLQUFJLFdBQVcsaUJBQWtCLElBQWxCLEVBQXdCLFdBQVcsSUFBbkMsQ0FBZjtBQUNBLEtBQUksYUFBYSxpQkFBa0IsSUFBbEIsRUFBd0IsV0FBVyxNQUFuQyxDQUFqQjtBQUNBLEtBQUksaUJBQWlCLGVBQWUsRUFBRSxXQUFXLEtBQUssT0FBTCxDQUFjLFFBQWQsQ0FBYixFQUFmLENBQXJCO0FBQ0EsS0FBSSxVQUFVO0FBQ2IsU0FBTyxRQURNO0FBRWIsWUFBVSxLQUFLLFFBQUwsQ0FBZSxVQUFmLENBRkc7QUFHYixVQUFRLEtBQUssS0FBTCxDQUFZLFVBQVosRUFBeUIsR0FIcEI7QUFJYixlQUFhLElBSkE7QUFLYixpQkFBZSxPQUFPLGFBQVAsQ0FBcUI7QUFMdkIsRUFBZDs7QUFRQSxLQUFLLFdBQVcsT0FBaEIsRUFBMEI7QUFDekIsT0FBTSxJQUFJLE1BQVYsSUFBb0IsV0FBVyxPQUEvQixFQUF5QztBQUN4QyxPQUFLLENBQUUsV0FBVyxPQUFYLENBQW1CLGNBQW5CLENBQW1DLE1BQW5DLENBQVAsRUFBcUQ7QUFDcEQ7QUFDQTtBQUNELFdBQVMsTUFBVCxJQUFvQixXQUFXLE9BQVgsQ0FBb0IsTUFBcEIsQ0FBcEI7QUFDQTs7QUFFRCxNQUFLLFdBQVcsT0FBWCxDQUFtQixXQUF4QixFQUFzQztBQUNyQyxXQUFRLFNBQVIsR0FBb0IsZUFBZSxhQUFuQztBQUNBO0FBQ0Q7O0FBRUQsUUFBTyxPQUFQO0FBQ0E7O0FBRUQsU0FBUyxPQUFULENBQWtCLFFBQWxCLEVBQTREO0FBQUEsS0FBaEMsT0FBZ0MsdUVBQXRCLEVBQXNCO0FBQUEsS0FBbEIsUUFBa0IsdUVBQVAsSUFBTzs7QUFDM0QsS0FBSSxPQUFPLENBQ1YsUUFEVSxFQUVWLE9BRlUsRUFFRCxJQUFJLFVBQUosRUFGQyxFQUdWLFlBSFUsRUFHSSxZQUhKLEVBSVYsWUFKVSxDQUFYOztBQU9BLEtBQUksV0FBVyxRQUFRLFFBQVIsSUFBb0IsTUFBbkM7O0FBRUEsTUFBTSxJQUFJLE1BQVYsSUFBb0IsT0FBcEIsRUFBOEI7QUFDN0IsTUFBSyxDQUFFLFFBQVEsY0FBUixDQUF3QixNQUF4QixDQUFQLEVBQTBDO0FBQ3pDO0FBQ0E7O0FBRUQsTUFBSyxPQUFRLFFBQVMsTUFBVCxDQUFSLEtBQWdDLFNBQXJDLEVBQWlEO0FBQ2hELFFBQUssSUFBTCxDQUFXLE9BQU8sTUFBbEI7QUFDQSxRQUFLLElBQUwsQ0FBVyxRQUFTLE1BQVQsQ0FBWDtBQUNBLEdBSEQsTUFHTyxJQUFLLFFBQVMsTUFBVCxNQUFzQixJQUEzQixFQUFrQztBQUN4QyxRQUFLLElBQUwsQ0FBVyxPQUFPLE1BQWxCO0FBQ0E7QUFDRDs7QUFFRCxLQUFNLEtBQUssTUFBTyxRQUFQLEVBQWlCLElBQWpCLENBQVg7O0FBRUEsU0FBUSxHQUFSLENBQWEsd0JBQWIsRUFBdUMsUUFBdkMsRUFBaUQsR0FBRyxHQUFwRDs7QUFFQSxRQUFPLGFBQVAsQ0FBcUIsSUFBckIsQ0FBMkIsRUFBM0I7O0FBRUEsSUFBRyxNQUFILENBQVUsV0FBVixDQUFzQixNQUF0Qjs7QUFFQSxJQUFHLE1BQUgsQ0FBVSxFQUFWLENBQWMsTUFBZCxFQUFzQixnQkFBUTtBQUM3QixVQUFRLEdBQVIsQ0FBYSxJQUFiOztBQUVBLE1BQUssS0FBSyxLQUFMLENBQVcscUJBQVgsQ0FBTCxFQUF5QztBQUN4QztBQUNBLE9BQUkscUNBQW1DLFFBQW5DLE1BQUo7O0FBRUEsT0FBSSxTQUFTLElBQUksWUFBSixDQUFrQixRQUFsQixFQUE0QjtBQUN4QyxVQUFNLFVBRGtDO0FBRXhDLFlBQVE7QUFGZ0MsSUFBNUIsQ0FBYjs7QUFLQSxVQUFPLE1BQVAsQ0FBYyxHQUFkLENBQW1CLFNBQW5CLEVBQThCLFVBQTlCO0FBQ0EsR0FWRCxNQVVPLElBQUssS0FBSyxLQUFMLENBQVcscUJBQVgsQ0FBTCxFQUF5QztBQUMvQztBQUNBLFVBQU8sTUFBUCxDQUFjLEdBQWQsQ0FBbUIsTUFBbkIsaUJBQXdDLFFBQXhDO0FBQ0E7QUFDRCxFQWpCRDs7QUFtQkEsSUFBRyxNQUFILENBQVUsV0FBVixDQUFzQixNQUF0Qjs7QUFFQSxJQUFHLE1BQUgsQ0FBVSxFQUFWLENBQWMsTUFBZCxFQUFzQixZQUF0Qjs7QUFFQSxJQUFHLEVBQUgsQ0FBTyxNQUFQLEVBQWUsZ0JBQVE7QUFDdEI7QUFDQSxTQUFPLGFBQVAsR0FBdUIsT0FBTyxhQUFQLENBQXFCLE1BQXJCLENBQTZCLGdCQUFRO0FBQzNELFVBQVMsS0FBSyxHQUFMLEtBQWEsR0FBRyxHQUF6QjtBQUNBLEdBRnNCLENBQXZCOztBQUlBLE1BQUssU0FBUyxDQUFkLEVBQWtCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQU5ELE1BTU8sSUFBSyxTQUFTLENBQWQsRUFBa0I7QUFDeEI7QUFDQTtBQUNBLEdBSE0sTUFHQSxJQUFLLElBQUwsRUFBWTtBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFRLEtBQVIsNkJBQXdDLElBQXhDO0FBQ0E7O0FBRUQsTUFBSyxRQUFMLEVBQWdCO0FBQ2YsWUFBVSxJQUFWO0FBQ0E7QUFDRCxFQTNCRDtBQTRCQTs7QUFFRCxTQUFTLFlBQVQsQ0FBdUIsSUFBdkIsRUFBOEI7QUFDN0IsS0FBSSxTQUFTLEVBQWI7QUFDQSxLQUFJLGVBQWUsS0FBbkI7O0FBRUEsS0FBSSxRQUFRLEtBQUssS0FBTCxDQUFZLG1DQUFaLENBQVo7O0FBSjZCO0FBQUE7QUFBQTs7QUFBQTtBQU03Qix3QkFBa0IsS0FBbEIsbUlBQTBCO0FBQUEsT0FBaEIsSUFBZ0I7O0FBQ3pCLE9BQUksVUFBVSxLQUFLLElBQUwsRUFBZDs7QUFFQSxPQUFLLENBQUUsUUFBUSxNQUFmLEVBQXdCO0FBQ3ZCO0FBQ0E7O0FBRUQsT0FBSyxZQUFZLFVBQWpCLEVBQThCO0FBQzdCLG1CQUFlLElBQWY7QUFDQTtBQUNBOztBQUVELE9BQUssWUFBTCxFQUFvQjtBQUNuQixRQUFJLFNBQVMsUUFBUSxLQUFSLENBQWUsU0FBZixDQUFiO0FBQ0EsV0FBUSxPQUFPLENBQVAsQ0FBUixJQUFzQixPQUFPLENBQVAsQ0FBdEI7O0FBRUEsUUFBSyxPQUFPLENBQVAsTUFBYyxXQUFuQixFQUFpQztBQUNoQyxvQkFBZSxLQUFmO0FBQ0E7QUFDRDtBQUNEO0FBMUI0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTBCNUI7O0FBRUQsS0FBSyxPQUFPLElBQVAsQ0FBYSxNQUFiLEVBQXNCLE1BQTNCLEVBQW9DO0FBQ25DLFVBQVEsS0FBUixDQUFlLE1BQWY7O0FBRUEsY0FBYSxPQUFPLElBQXBCLEVBQTBCLE9BQU8sSUFBakMsRUFBdUMsVUFBVSxHQUFWLEVBQWUsS0FBZixFQUF1QjtBQUM3RCxPQUFLLEdBQUwsRUFBVztBQUNWLFlBQVEsS0FBUixDQUFlLEdBQWY7QUFDQTtBQUNBOztBQUVELE9BQUksUUFBUSxPQUFPLFNBQVAsQ0FBaUIsT0FBakIsQ0FBMEIsS0FBMUIsRUFBaUMsRUFBakMsSUFDWCxRQURXLEdBRVYsTUFGVSxHQUVELE1BQU8saUJBQWtCLFFBQVEsR0FBUixFQUFsQixFQUFpQyxPQUFPLElBQXhDLENBQVAsQ0FGQyxHQUdWLFdBSFUsR0FHSSxPQUFPLElBSFgsR0FJWCxTQUpEOztBQU1BLE9BQUksVUFBVSxVQUFVLEtBQVYsR0FBa0IsUUFBaEM7O0FBRUEsVUFBTyxNQUFQLENBQWMsR0FBZCxDQUFtQixPQUFuQixFQUE0QixLQUE1QixFQUFtQyxPQUFuQztBQUNBLEdBZkQ7QUFnQkE7O0FBRUQ7QUFDQTs7QUFFRCxTQUFTLFdBQVQsQ0FBc0IsUUFBdEIsRUFBZ0MsSUFBaEMsRUFBc0MsUUFBdEMsRUFBaUQ7QUFDaEQsUUFBTyxLQUFLLEdBQUwsQ0FBVSxTQUFVLElBQVYsRUFBZ0IsRUFBaEIsSUFBdUIsQ0FBdkIsSUFBNEIsQ0FBdEMsRUFBeUMsQ0FBekMsQ0FBUDs7QUFFQSxJQUFHLFFBQUgsQ0FBYSxRQUFiLEVBQXVCLFVBQVUsR0FBVixFQUFlLElBQWYsRUFBc0I7QUFDNUMsTUFBSyxHQUFMLEVBQVc7QUFDVixTQUFNLEdBQU47QUFDQTs7QUFFRCxNQUFJLFFBQVEsS0FBSyxRQUFMLENBQWMsT0FBZCxFQUF1QixLQUF2QixDQUE2QixJQUE3QixDQUFaOztBQUVBLE1BQUssQ0FBQyxJQUFELEdBQVEsTUFBTSxNQUFuQixFQUE0QjtBQUMzQixVQUFPLEVBQVA7QUFDQTs7QUFFRCxNQUFJLFVBQVUsRUFBZDtBQUNBLE1BQUksV0FBVyxFQUFmO0FBQ0EsTUFBSSxVQUFVLEtBQUssR0FBTCxDQUFVLE9BQU8sQ0FBakIsRUFBb0IsQ0FBcEIsQ0FBZDtBQUNBLE1BQUksVUFBVSxLQUFLLEdBQUwsQ0FBVSxPQUFPLENBQWpCLEVBQW9CLE1BQU0sTUFBMUIsQ0FBZDs7QUFFQSxPQUFNLElBQUksSUFBSSxPQUFkLEVBQXVCLEtBQUssT0FBNUIsRUFBcUMsR0FBckMsRUFBMkM7QUFDMUMsWUFBVSxDQUFWLElBQWdCLE1BQU8sQ0FBUCxDQUFoQjtBQUNBOztBQUVEO0FBQ0EsTUFBSSxnQkFBZ0IsWUFBYSxTQUFTLElBQVQsQ0FBYyxJQUFkLENBQWIsRUFBbUMsS0FBbkMsQ0FBeUMsSUFBekMsQ0FBcEI7O0FBRUEsT0FBTSxJQUFJLElBQUksT0FBZCxFQUF1QixLQUFLLE9BQTVCLEVBQXFDLEdBQXJDLEVBQTJDO0FBQzFDLFdBQVEsSUFBUixDQUNDLHNCQUF1QixTQUFTLENBQVQsR0FBYSxZQUFiLEdBQTRCLEVBQW5ELElBQTBELElBQTFELEdBQ0MsNEJBREQsSUFDa0MsSUFBSSxDQUR0QyxJQUM0QyxTQUQ1QyxHQUVDLDZCQUZELEdBRWlDLGNBQWUsQ0FBZixDQUZqQyxHQUVzRCxTQUZ0RCxHQUdBLFFBSkQ7QUFNQTs7QUFFRCxXQUFVLElBQVYsRUFBZ0IsUUFBUSxJQUFSLENBQWEsSUFBYixDQUFoQjtBQUNBLEVBakNEO0FBa0NBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQix5QkFEZ0I7QUFFaEIsaUJBRmdCO0FBR2hCLHFCQUhnQjtBQUloQix5QkFKZ0I7QUFLaEIsNkJBTGdCO0FBTWhCLCtCQU5nQjtBQU9oQjtBQVBnQixDQUFqQjs7Ozs7QUNwVUE7Ozs7ZUFJNEIsUUFBUSxPQUFSLEM7SUFBcEIsZSxZQUFBLGU7O0FBRVIsSUFBTSxXQUFXLFFBQVEsWUFBUixDQUFqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsZ0JBQWdCO0FBQ2hDO0FBRGdDLENBQWhCLENBQWpCOzs7Ozs7O0FDUkE7Ozs7QUFJQSxJQUFNLFdBQVcsU0FBWCxRQUFXLEdBQTBCO0FBQUEsS0FBeEIsS0FBd0IsdUVBQWhCLEVBQWdCO0FBQUEsS0FBWixNQUFZOztBQUMxQyxTQUFTLE9BQU8sSUFBaEI7QUFDQyxPQUFLLGFBQUw7QUFDQyx1Q0FDSSxLQURKLElBRUM7QUFDQyxRQUFJLE9BQU8sRUFEWjtBQUVDLFVBQU0sT0FBTyxJQUZkO0FBR0MsVUFBTSxPQUFPO0FBSGQsSUFGRDtBQVFEO0FBQ0MsVUFBTyxLQUFQO0FBWEY7QUFhQSxDQWREOztBQWdCQSxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7OztBQ3BCQTs7OztBQUlBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjs7SUFFTSxNO0FBQ0wsbUJBQWM7QUFBQTs7QUFDYixPQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0E7Ozs7c0JBRUksSSxFQUFNLEssRUFBbUI7QUFBQSxPQUFaLElBQVksdUVBQUwsRUFBSzs7QUFDN0IsUUFBSyxJQUFMLENBQVUsSUFBVixDQUFlO0FBQ2QsVUFBTSxJQURRO0FBRWQsV0FBTyxLQUZPO0FBR2QsVUFBTSxJQUhRO0FBSWQsVUFBTSxTQUFTLE1BQVQsQ0FBZ0IsY0FBaEI7QUFKUSxJQUFmO0FBTUE7QUFDQSxZQUFTLGFBQVQsQ0FBd0IsSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBeEI7QUFDQTs7O3dCQUVrQztBQUFBLE9BQTlCLElBQThCLHVFQUF2QixJQUF1QjtBQUFBLE9BQWpCLEtBQWlCLHVFQUFULE1BQVM7O0FBQ2xDLE9BQUksYUFBSjs7QUFFQSxPQUFLLENBQUUsSUFBUCxFQUFjO0FBQ2IsV0FBTyxLQUFLLElBQVo7QUFDQSxJQUZELE1BRU87QUFDTixXQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBa0IsZUFBTztBQUFFLFlBQU8sSUFBSSxJQUFKLEtBQWEsSUFBcEI7QUFBMEIsS0FBckQsQ0FBUDtBQUNBOztBQUVELE9BQUssVUFBVSxNQUFmLEVBQXdCO0FBQ3ZCLFdBQU8sS0FBSyxLQUFMLEdBQWEsT0FBYixFQUFQO0FBQ0E7O0FBRUQsVUFBTyxJQUFQO0FBQ0E7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUN2Q0E7Ozs7QUFJQSxJQUFNLFVBQVUsUUFBUSxVQUFSLENBQWhCOztBQUVBLElBQU0sS0FBSyxRQUFRLFlBQVIsQ0FBc0IsUUFBUSxJQUFSLENBQXRCLENBQVg7O0FBRUEsSUFBTSxTQUFTLFFBQVEsTUFBUixDQUFmOztBQUVBLFNBQVMsYUFBVCxDQUF3QixJQUF4QixFQUF3RDtBQUFBLEtBQTFCLE9BQTBCLHVFQUFoQixFQUFnQjtBQUFBLEtBQVosS0FBWSx1RUFBSixDQUFJOztBQUN2RCxRQUFPLElBQUksT0FBSixDQUFhLFVBQVUsT0FBVixFQUFtQixNQUFuQixFQUE0QjtBQUMvQztBQUNBLE1BQUssUUFBUSxLQUFSLElBQWlCLFFBQVEsUUFBUSxLQUF0QyxFQUE4QztBQUM3QyxXQUFTLElBQVQ7QUFDQTs7QUFFRCxNQUFNLE9BQU8sT0FBTyxRQUFQLENBQWlCLElBQWpCLENBQWI7QUFDQSxNQUFNLE9BQU8sRUFBRSxVQUFGLEVBQVEsVUFBUixFQUFiOztBQUVBLE1BQUksY0FBSjs7QUFFQSxNQUFJO0FBQ0gsV0FBUSxHQUFHLFFBQUgsQ0FBWSxJQUFaLENBQVI7QUFDQSxHQUZELENBRUUsT0FBUSxHQUFSLEVBQWM7QUFDZjtBQUNBLFdBQVMsSUFBVDtBQUNBOztBQUVEO0FBQ0EsTUFBSyxXQUFXLFFBQVEsT0FBbkIsS0FBZ0MsUUFBUSxPQUFSLENBQWdCLElBQWhCLENBQXNCLElBQXRCLEtBQWdDLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFzQixJQUF0QixDQUFoRSxDQUFMLEVBQXNHO0FBQ3JHLFdBQVMsSUFBVDtBQUNBOztBQUVELE1BQUssTUFBTSxNQUFOLEVBQUwsRUFBc0I7QUFDckIsUUFBSyxJQUFMLEdBQVksTUFBWjs7QUFFQSxPQUFNLE1BQU0sT0FBTyxPQUFQLENBQWdCLElBQWhCLEVBQXVCLFdBQXZCLEVBQVo7O0FBRUE7QUFDQSxPQUFLLFdBQVcsUUFBUSxVQUFuQixJQUFpQyxDQUFFLFFBQVEsVUFBUixDQUFtQixJQUFuQixDQUF5QixHQUF6QixDQUF4QyxFQUF5RTtBQUN4RSxZQUFTLElBQVQ7QUFDQTs7QUFFRDtBQUNBLFFBQUssU0FBTCxHQUFpQixHQUFqQjs7QUFFQSxXQUFTLElBQVQ7QUFDQSxHQWRELE1BY08sSUFBSyxNQUFNLFdBQU4sRUFBTCxFQUEyQjtBQUNqQyxRQUFLLElBQUwsR0FBWSxXQUFaOztBQUVBLE1BQUcsT0FBSCxDQUFZLElBQVosRUFBa0IsVUFBVSxHQUFWLEVBQWUsS0FBZixFQUF1QjtBQUN4QyxRQUFLLEdBQUwsRUFBVztBQUNWLFNBQUssSUFBSSxJQUFKLEtBQWEsUUFBbEIsRUFBNkI7QUFDNUI7QUFDQSxjQUFTLElBQVQ7QUFDQSxNQUhELE1BR087QUFDTixZQUFNLEdBQU47QUFDQTtBQUNEOztBQUVELFNBQUssUUFBTCxHQUFnQixFQUFoQjs7QUFFQSxZQUFRLEdBQVIsQ0FBYSxLQUFiLEVBQW9CLFVBQVUsSUFBVixFQUFpQjtBQUNwQyxZQUFPLGNBQWUsT0FBTyxJQUFQLENBQWEsSUFBYixFQUFtQixJQUFuQixDQUFmLEVBQTBDLE9BQTFDLEVBQW1ELFFBQVEsQ0FBM0QsQ0FBUDtBQUNBLEtBRkQsRUFFRyxJQUZILENBRVMsVUFBVSxRQUFWLEVBQXFCO0FBQzdCLFVBQUssUUFBTCxHQUFnQixTQUFTLE1BQVQsQ0FBaUIsVUFBQyxDQUFEO0FBQUEsYUFBTyxDQUFDLENBQUMsQ0FBVDtBQUFBLE1BQWpCLENBQWhCO0FBQ0EsYUFBUyxJQUFUO0FBQ0EsS0FMRDtBQU1BLElBbEJEOztBQW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBM0JNLE1BMkJBO0FBQ04sV0FBUyxJQUFULEVBRE0sQ0FDVztBQUNqQjtBQUNELEVBbkVNLENBQVA7QUFvRUE7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7OztBQ2pGQTs7OztBQUlBLFNBQVMsT0FBVCxHQUFrQztBQUFBLEtBQWhCLE1BQWdCLHVFQUFQLElBQU87O0FBQ2pDLFVBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBZ0MsU0FBaEMsRUFBMkMsTUFBM0M7QUFDQTs7QUFFRCxTQUFTLE9BQVQsR0FBNkM7QUFBQSxLQUEzQixNQUEyQix1RUFBbEIsSUFBa0I7QUFBQSxLQUFaLElBQVksdUVBQUwsRUFBSzs7QUFDNUMsVUFBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUFnQyxTQUFoQyxFQUEyQyxNQUEzQztBQUNBOztBQUVELFNBQVMsT0FBVCxHQUFrQztBQUFBLEtBQWhCLE1BQWdCLHVFQUFQLElBQU87O0FBQ2pDLFVBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBZ0MsU0FBaEMsRUFBMkMsTUFBM0M7QUFDQTs7QUFFRCxTQUFTLFNBQVQsR0FBb0Q7QUFBQSxLQUFoQyxNQUFnQyx1RUFBdkIsSUFBdUI7QUFBQSxLQUFqQixPQUFpQix1RUFBUCxJQUFPOztBQUNuRDtBQUNBLFVBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBZ0MsWUFBaEMsRUFBOEMsTUFBOUM7O0FBRUEsS0FBSyxNQUFMLEVBQWM7QUFDYixXQUFTLGFBQVQsQ0FBd0IsSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBeEI7O0FBRUEsY0FDQyxTQUFTLGNBQVQsQ0FBd0IsWUFBeEIsQ0FERCxFQUVDLFlBRkQsRUFHQyxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUhELEVBSUMsT0FKRDtBQU1BLEVBVEQsTUFTTztBQUNOLFdBQVMsYUFBVCxDQUF3QixJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUF4QjtBQUNBO0FBQ0Q7O0FBRUQsU0FBUyxXQUFULENBQXNCLE9BQXRCLEVBQStCLFNBQS9CLEVBQWdGO0FBQUEsS0FBdEMsWUFBc0MsdUVBQXZCLElBQXVCO0FBQUEsS0FBakIsT0FBaUIsdUVBQVAsSUFBTzs7QUFDL0UsS0FBTSx1QkFBdUIsU0FBdkIsb0JBQXVCLENBQVUsS0FBVixFQUFrQjtBQUM5QyxNQUFLLENBQUUsUUFBUSxRQUFSLENBQWtCLE1BQU0sTUFBeEIsQ0FBUCxFQUEwQztBQUN6Qzs7QUFFQSxPQUFLLENBQUUsT0FBRixJQUFhLENBQUUsUUFBUSxRQUFSLENBQWtCLE1BQU0sTUFBeEIsQ0FBcEIsRUFBdUQ7QUFDdEQsYUFBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUFnQyxTQUFoQzs7QUFFQSxRQUFLLFlBQUwsRUFBb0I7QUFDbkIsY0FBUyxhQUFULENBQXdCLFlBQXhCO0FBQ0E7QUFDRDtBQUNEO0FBQ0QsRUFaRDs7QUFjQSxLQUFNLHNCQUFzQixTQUF0QixtQkFBc0IsR0FBVztBQUN0QyxXQUFTLG1CQUFULENBQThCLE9BQTlCLEVBQXVDLG9CQUF2QztBQUNBLEVBRkQ7O0FBSUEsVUFBUyxnQkFBVCxDQUEyQixPQUEzQixFQUFvQyxvQkFBcEM7QUFDQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDaEIsaUJBRGdCO0FBRWhCLGlCQUZnQjtBQUdoQixpQkFIZ0I7QUFJaEIscUJBSmdCO0FBS2hCO0FBTGdCLENBQWpCOzs7OztBQ3hEQTs7OztBQUlBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQTtBQUNBLFNBQVMsS0FBVCxDQUFnQixLQUFoQixFQUF3QjtBQUN2QixLQUFNLHVCQUF1QixZQUFZLElBQVosQ0FBaUIsS0FBakIsQ0FBN0I7QUFDQSxLQUFNLGNBQWMsb0JBQW9CLElBQXBCLENBQXlCLEtBQXpCLENBQXBCLENBRnVCLENBRThCOztBQUVyRCxLQUFJLHdCQUF3QixXQUE1QixFQUF5QztBQUN4QyxTQUFPLEtBQVA7QUFDQTs7QUFFRCxRQUFPLE1BQU0sT0FBTixDQUFjLEtBQWQsRUFBcUIsR0FBckIsQ0FBUDtBQUNBOztBQUVELFNBQVMsY0FBVCxDQUF5QixJQUF6QixFQUF5RTtBQUFBLEtBQTFDLE1BQTBDLHVFQUFqQyxFQUFpQztBQUFBLEtBQTdCLFNBQTZCLHVFQUFqQixLQUFLLFNBQVk7O0FBQ3hFLEtBQUksVUFBVSxLQUFLLEtBQUwsQ0FBWSxLQUFLLElBQWpCLEVBQXdCLEdBQXRDO0FBQ0EsS0FBSSxXQUFXLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsV0FBbEIsRUFBK0IsRUFBL0IsSUFBcUMsTUFBckMsR0FBOEMsU0FBN0Q7O0FBRUEsUUFBTyxLQUFLLElBQUwsQ0FBVyxPQUFYLEVBQW9CLFFBQXBCLENBQVA7QUFDQTs7QUFFRCxTQUFTLGdCQUFULENBQTJCLElBQTNCLEVBQWlDLEVBQWpDLEVBQXNDO0FBQ3JDLFFBQU8sS0FBSyxRQUFMLENBQWUsSUFBZixFQUFxQixFQUFyQixDQUFQO0FBQ0E7O0FBRUQsU0FBUyxnQkFBVCxDQUEyQixJQUEzQixFQUFpQyxRQUFqQyxFQUE0QztBQUMzQyxRQUFTLEtBQUssVUFBTCxDQUFpQixRQUFqQixDQUFGLEdBQWtDLFFBQWxDLEdBQTZDLEtBQUssSUFBTCxDQUFXLElBQVgsRUFBaUIsUUFBakIsQ0FBcEQ7QUFDQTs7QUFFRCxTQUFTLGVBQVQsQ0FBMEIsSUFBMUIsRUFBZ0MsUUFBaEMsRUFBMkM7QUFDMUMsUUFBTyxLQUFLLEtBQUwsQ0FBWSxpQkFBa0IsSUFBbEIsRUFBd0IsUUFBeEIsQ0FBWixFQUFpRCxHQUF4RDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQiwrQkFGZ0I7QUFHaEIsbUNBSGdCO0FBSWhCLG1DQUpnQjtBQUtoQjtBQUxnQixDQUFqQjs7Ozs7QUNyQ0E7Ozs7QUFJQSxTQUFTLEtBQVQsQ0FBZSxZQUFmLEVBQTZCO0FBQzVCLEtBQUksUUFBUSxJQUFJLElBQUosR0FBVyxPQUFYLEVBQVo7QUFDQSxNQUFNLElBQUksSUFBSSxDQUFkLEVBQWlCLElBQUksR0FBckIsRUFBMEIsR0FBMUIsRUFBZ0M7QUFDL0IsTUFBTyxJQUFJLElBQUosR0FBVyxPQUFYLEtBQXVCLEtBQXpCLEdBQW1DLFlBQXhDLEVBQXVEO0FBQ3REO0FBQ0E7QUFDRDtBQUNEOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQjtBQURnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuL2d1bHAvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyICk7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9eyBzdG9yZSB9PlxuXHRcdDxBcHAgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7XG5cbmNvbnN0IHsgc2xlZXAgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcblxuLy8gQXBwIGNsb3NlL3Jlc3RhcnQgZXZlbnRzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID4gMCApIHtcblx0XHRjb25zb2xlLmxvZyggJ0tpbGxpbmcgJWQgcnVubmluZyB0YXNrcy4uLicsIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXG5cdFx0c2xlZXAoIDMwMCApO1xuXHR9XG59KTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgY29tcG9uZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNvbnN0IHsgb3ZlcmxheSB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvZ2xvYmFsVUknKTtcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHZpZXc6ICdmaWxlcydcblx0XHR9O1xuXG5cdFx0dGhpcy52aWV3cyA9IHtcblx0XHRcdGZpbGVzOiAnRmlsZXMnLFxuXHRcdFx0bG9nczogJ0xvZ3MnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXG5cdFx0dGhpcy5jaGFuZ2VWaWV3ID0gdGhpcy5jaGFuZ2VWaWV3LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IHZpZXcgfSk7XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdG92ZXJsYXkoIHRoaXMuc3RhdGUudmlldyAhPT0gJ2ZpbGVzJyApO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLnZpZXcgPT09ICdmaWxlcycgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMuc3RhdGUudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gKFxuXHRcdFx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0XHRcdDxoMj57IHRoaXMudmlld3NbIHRoaXMuc3RhdGUudmlldyBdIH08L2gyPlxuXHRcdFx0XHRcdFx0PHA+WW91IHNob3VsZG4ndCBiZSBoZXJlLCB5b3UgbmF1Z2h0eSBuYXVnaHR5IGJveS48L3A+XG5cdFx0XHRcdFx0PC9SZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhclxuXHRcdFx0XHRcdGl0ZW1zPXsgdGhpcy52aWV3cyB9XG5cdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS52aWV3IH1cblx0XHRcdFx0XHRjaGFuZ2VWaWV3PXsgdGhpcy5jaGFuZ2VWaWV3IH1cblx0XHRcdFx0Lz5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50LXdyYXAnPlxuXHRcdFx0XHRcdDxQcm9qZWN0cyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyT3ZlcmxheSgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT0nbm8tY29udGVudCc+XG5cdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaWRlYmFyO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwYXRoOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBwYXRoID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/ICcnIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgcGF0aCB9O1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5zdGF0ZS5wYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoeyBwYXRoOiBzYXZlUGF0aCB9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCBzYXZlUGF0aCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSd0ZXh0J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5wYXRoIH1cblx0XHRcdFx0XHRyZWFkT25seT0ndHJ1ZSdcblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHQvPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2F2ZUZpbGUucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRzb3VyY2VGaWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXHRkaWFsb2dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0ZGlhbG9nRmlsdGVyczogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLm9iamVjdCBdKSxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRzZWxlY3RlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBzZWxlY3RlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHNlbGVjdGVkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IHNlbGVjdGVkOiBldmVudC50YXJnZXQudmFsdWUgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuc2VsZWN0ZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnNlbGVjdGVkID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnN0YXRlLnNlbGVjdGVkIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5zZWxlY3RlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHRvZ2dsZSBzd2l0Y2guXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFN3aXRjaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRjaGVja2VkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IGNoZWNrZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBjaGVja2VkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGNoZWNrZWQ6ICEgcHJldlN0YXRlLmNoZWNrZWQgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuY2hlY2tlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5zdGF0ZS5jaGVja2VkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiA8Tm9Db250ZW50Pk5vIGxvZ3MgeWV0LiBHbyBmb3J0aCBhbmQgY29tcGlsZSE8L05vQ29udGVudD47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGdsb2JhbC51aS51bmZvY3VzKCAhIHByZXZTdGF0ZS5pc09wZW4gKTtcblxuXHRcdFx0cmV0dXJuIHsgaXNPcGVuOiAhIHByZXZTdGF0ZS5pc09wZW4gfTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucHJvamVjdDtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXHR9XG5cblx0Y2hhbmdlUHJvamVjdCggaW5kZXggKSB7XG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVQcm9qZWN0KCBpbmRleCApO1xuXHR9XG5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzO1xuXG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cblx0XHRcdGlmICggcHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gbmV3UHJvamVjdC5wYXRoICkgIT09IC0xICkge1xuXHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHByb2plY3RzLnB1c2goIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0dGhpcy5wcm9wcy5zZXRQcm9qZWN0cyggcHJvamVjdHMgKTtcblxuXHRcdFx0bGV0IGFjdGl2ZUluZGV4ID0gcHJvamVjdHMubGVuZ3RoIC0gMTtcblxuXHRcdFx0aWYgKCBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVQcm9qZWN0KCBhY3RpdmVJbmRleCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBjaGFuZ2luZyB0aGUgYWN0aXZlIHByb2plY3QuJyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlbW92ZVByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAnICsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSArICc/JyApO1xuXG5cdFx0aWYgKCBjb25maXJtUmVtb3ZlICkge1xuXHRcdFx0bGV0IHJlbWFpbmluZyA9IHRoaXMucHJvcHMucHJvamVjdHMuZmlsdGVyKCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCAhPT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXG5cdFx0XHR0aGlzLnByb3BzLnNldFByb2plY3RzKCByZW1haW5pbmcgKTtcblx0XHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggbnVsbCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnByb3BzLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCc+XG5cdFx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3RpdmUnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIGFkZCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy5wcm9wcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyB2aWV3LlxuICovXG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RpcmVjdG9yeVRyZWUnKTtcblxuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvTG9nZ2VyJyk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHByb2plY3RzID0gW107XG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdGlmICggZ2xvYmFsLmNvbmZpZy5oYXMoJ3Byb2plY3RzJykgKSB7XG5cdFx0XHRwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXG5cdFx0XHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0XHRhY3RpdmUgPSBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cHJvamVjdHMsXG5cdFx0XHRhY3RpdmUsXG5cdFx0XHRmaWxlczogbnVsbCxcblx0XHRcdGlnbm9yZWQ6IFtcblx0XHRcdFx0Jy5naXQnLFxuXHRcdFx0XHQnbm9kZV9tb2R1bGVzJyxcblx0XHRcdFx0Jy5EU19TdG9yZScsXG5cdFx0XHRcdCdidWlsZHItcHJvamVjdC5qc29uJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0UHJvamVjdHMgPSB0aGlzLnNldFByb2plY3RzLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVByb2plY3QgPSB0aGlzLnRvZ2dsZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldEFjdGl2ZVByb2plY3QgPSB0aGlzLnNldEFjdGl2ZVByb2plY3QuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFByb2plY3RQYXRoKCB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdENvbXBpbGVyKCkge1xuXHRcdGNvbnNvbGUubG9nKCB0aGlzLnN0YXRlLmFjdGl2ZSApO1xuXG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0c2V0UHJvamVjdHMoIHByb2plY3RzICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cHJvamVjdHNcblx0XHR9KTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0bGV0IHBhdXNlZCA9IHByZXZTdGF0ZS5hY3RpdmUucGF1c2VkIHx8IGZhbHNlO1xuXHRcdFx0bGV0IG5ld1N0YXRlID0gT2JqZWN0LmFzc2lnbigge30sIHByZXZTdGF0ZSApO1xuXG5cdFx0XHRuZXdTdGF0ZS5hY3RpdmUucGF1c2VkID0gISBwYXVzZWQ7XG5cblx0XHRcdHJldHVybiBuZXdTdGF0ZTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHRoaXMuc3RhdGUuYWN0aXZlLnBhdXNlZCApO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0c2V0QWN0aXZlUHJvamVjdCggaW5kZXggPSBudWxsICkge1xuXHRcdGlmICggaW5kZXggPT09IG51bGwgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0YWN0aXZlOiB7XG5cdFx0XHRcdFx0bmFtZTogJycsXG5cdFx0XHRcdFx0cGF0aDogJycsXG5cdFx0XHRcdFx0cGF1c2VkOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhY3RpdmUgPSB0aGlzLnN0YXRlLnByb2plY3RzWyBpbmRleCBdO1xuXG5cdFx0aWYgKCBhY3RpdmUgJiYgYWN0aXZlLnBhdGggIT09IHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0YWN0aXZlXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5zZXRQcm9qZWN0UGF0aCggYWN0aXZlLnBhdGggKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRzZXRQcm9qZWN0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0bGV0IHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRwcm9qZWN0c1sgYWN0aXZlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlnLicgKTtcblx0XHR9XG5cdH1cblxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5vbkRpZENoYW5nZSggJ2ZpbGVzJywgX2RlYm91bmNlKCB0aGlzLmluaXRDb21waWxlciwgMTAwICkgKTtcblx0fVxuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0ZmlsZXMsXG5cdFx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0c2V0UHJvamVjdFBhdGgoIHBhdGggKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApO1xuXG5cdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblx0XHQvLyBjb25zb2xlLmxvZyhgQ3VycmVudCBkaXJlY3Rvcnk6ICR7cHJvY2Vzcy5jd2QoKX1gKTtcblxuXHRcdGdsb2JhbC5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cblx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHR9XG5cblx0cmVuZGVyTm90aWNlcygpIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UmVhY3QuRnJhZ21lbnQ+XG5cdFx0XHRcdDxkaXYgaWQ9J2hlYWRlcic+XG5cdFx0XHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0XHRcdGFjdGl2ZT17IHRoaXMuc3RhdGUuYWN0aXZlIH1cblx0XHRcdFx0XHRcdHByb2plY3RzPXsgdGhpcy5zdGF0ZS5wcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzZXRQcm9qZWN0cz17IHRoaXMuc2V0UHJvamVjdHMgfVxuXHRcdFx0XHRcdFx0dG9nZ2xlUHJvamVjdD17IHRoaXMudG9nZ2xlUHJvamVjdCB9XG5cdFx0XHRcdFx0XHRyZWZyZXNoUHJvamVjdD17IHRoaXMucmVmcmVzaFByb2plY3QgfVxuXHRcdFx0XHRcdFx0c2V0QWN0aXZlUHJvamVjdD17IHRoaXMuc2V0QWN0aXZlUHJvamVjdCB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJOb3RpY2VzKCkgfVxuXG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMuc3RhdGUuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ29mZi1jYW52YXMtaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2VtcHR5Jz5cblx0XHRcdFx0XHROb3RoaW5nIHRvIHNlZSBoZXJlLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgeyByZW1vdGUsIHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5jb25zdCB7IE1lbnUsIE1lbnVJdGVtIH0gPSByZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZScpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCBmaWxlICkge1xuXHRcdGlmICggISBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH0gZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpXG5cdFx0KTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIHRydWUsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpICk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBGaWxlTGlzdFBsYWNlaG9sZGVyKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8bGkgY2xhc3NOYW1lPXsgcHJvcHMudHlwZSArICcgaW5mb3JtYXRpdmUnIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPnsgcHJvcHMuY2hpbGRyZW4gfTwvZGl2PlxuXHRcdDwvbGk+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRGaWxlTGlzdEZpbGUsXG5cdEZpbGVMaXN0UGxhY2Vob2xkZXJcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXRPdXRwdXRQYXRoID0gdGhpcy5zZXRPdXRwdXRQYXRoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBmYWxzZSApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgKSB7XG5cdFx0XHRcdGZpbGVDb25maWdbIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGZpbGVzLnB1c2goIGZpbGVDb25maWcgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRkZWxldGUgZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zICYmIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c2V0T3B0aW9uKCBvcHRpb24sIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRsZXQgb3B0aW9ucyA9IHByZXZTdGF0ZS5vcHRpb25zIHx8IHt9O1xuXHRcdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSB2YWx1ZTtcblxuXHRcdFx0cmV0dXJuIHsgb3B0aW9ucyB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRDb25maWcoICdvcHRpb25zJywgdGhpcy5zdGF0ZS5vcHRpb25zICk7XG5cdFx0fSk7XG5cdH1cblxuXHRoYW5kbGVDaGFuZ2UoIGV2ZW50LCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldE9wdGlvbiggZXZlbnQudGFyZ2V0Lm5hbWUsIHZhbHVlICk7XG5cdH1cblxuXHRkZWZhdWx0T3V0cHV0UGF0aCgpIHtcblx0XHRyZXR1cm4gZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgdGhpcy5vdXRwdXRTdWZmaXgsIHRoaXMub3V0cHV0RXh0ZW5zaW9uICk7XG5cdH1cblxuXHRzZXRPdXRwdXRQYXRoKCBldmVudCwgcGF0aCApIHtcblx0XHR0aGlzLnNldENvbmZpZyggJ291dHB1dCcsIHBhdGggKTtcblx0fVxuXG5cdGdldE91dHB1dFBhdGgoIHR5cGUgPSAncmVsYXRpdmUnICkge1xuXHRcdGxldCBzbGFzaFBhdGggPSAoIHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCByZWxhdGl2ZVBhdGggPSAoIHR5cGUgPT09ICdyZWxhdGl2ZScgfHwgdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IGRlZmF1bHRQYXRoID0gdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpO1xuXHRcdGxldCBvdXRwdXRQYXRoID0gdGhpcy5nZXRDb25maWcoICdvdXRwdXQnLCBkZWZhdWx0UGF0aCApO1xuXG5cdFx0aWYgKCByZWxhdGl2ZVBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHNsYXNoUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBzbGFzaCggb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRQYXRoO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHRnbG9iYWwudWkubG9hZGluZyggdHJ1ZSApO1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdGZ1bmN0aW9uKCBjb2RlICkge1xuXHRcdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyQnV0dG9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdD5cblx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHQ8L2J1dHRvbj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdjb21wcmVzcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQnV0dG9uKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlcyBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5jc3MnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdDU1MnLCBleHRlbnNpb25zOiBbICdjc3MnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRpc1BhcnRpYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSwgaXQgY2Fubm90IGJlIGNvbXBpbGVkIGJ5IGl0c2VsZi48L3A+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQnV0dG9uKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1N0eWxlcztcbiIsIi8qKlxuKiBAZmlsZSBHdWxwIHNjcmlwdHMgYW5kIHRhc2tzLlxuKi9cblxuLyogZ2xvYmFsIE5vdGlmaWNhdGlvbiAqL1xuXG5jb25zdCB7IGFwcCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bjtcbmNvbnN0IHBzVHJlZSA9IHJlcXVpcmUoJ3BzLXRyZWUnKTtcblxuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcblxuY29uc3QgT1NDbWQgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJy5jbWQnIDogJyc7XG5jb25zdCBndWxwUGF0aCA9IHBhdGguam9pbiggX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJy5iaW4nLCAnZ3VscCcgKyBPU0NtZCApO1xuY29uc3QgZ3VscEZpbGVQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdhcHAnLCAnanMnLCAnZ3VscCcsICdndWxwZmlsZS5qcycgKTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgcGlkIG9mIFsgcHJvYy5waWQgXS5jb25jYXQoIGNoaWxkcmVuLm1hcCggY2hpbGQgPT4gY2hpbGQuUElEICkgKSApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHByb2Nlc3Mua2lsbCggcGlkICk7XG5cdFx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5IGxvbCBZT0xPXG5cdFx0XHRcdC8vIGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayAmJiBvcHRpb25zLndhdGNoVGFzayA9PT0gJ2J1aWxkLXNhc3MnICkge1xuXHRcdFx0b3B0aW9ucy5nZXRJbXBvcnRzID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRydW5UYXNrKCAnd2F0Y2gnLCBvcHRpb25zICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU9wdGlvbnMoIGZpbGUgKSB7XG5cdGxldCBvcHRpb25zID0ge307XG5cblx0c3dpdGNoICggZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnY3NzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5zYXNzJzpcblx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnc2Fzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnbGVzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuanMnOlxuXHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2pzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc2NyaXB0Jztcblx0fVxuXG5cdG9wdGlvbnMuYnVpbGRUYXNrTmFtZSA9ICdidWlsZC0nICsgb3B0aW9ucy50eXBlO1xuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICkge1xuXHRpZiAoICEgZmlsZUNvbmZpZy5wYXRoIHx8ICEgZmlsZUNvbmZpZy5vdXRwdXQgKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0bGV0IGZpbGVQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5wYXRoICk7XG5cdGxldCBvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5vdXRwdXQgKTtcblx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2V0RmlsZU9wdGlvbnMoeyBleHRlbnNpb246IHBhdGguZXh0bmFtZSggZmlsZVBhdGggKSB9KTtcblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0aW5wdXQ6IGZpbGVQYXRoLFxuXHRcdGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKCBvdXRwdXRQYXRoICksXG5cdFx0b3V0cHV0OiBwYXRoLnBhcnNlKCBvdXRwdXRQYXRoICkuZGlyLFxuXHRcdHByb2plY3RCYXNlOiBiYXNlLFxuXHRcdHByb2plY3RDb25maWc6IGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGhcblx0fTtcblxuXHRpZiAoIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRmb3IgKCB2YXIgb3B0aW9uIGluIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRcdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgYXJncyA9IFtcblx0XHR0YXNrTmFtZSxcblx0XHQnLS1jd2QnLCBhcHAuZ2V0QXBwUGF0aCgpLFxuXHRcdCctLWd1bHBmaWxlJywgZ3VscEZpbGVQYXRoLFxuXHRcdCctLW5vLWNvbG9yJ1xuXHRdO1xuXG5cdGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWUgfHwgJ2ZpbGUnO1xuXG5cdGZvciAoIHZhciBvcHRpb24gaW4gb3B0aW9ucyApIHtcblx0XHRpZiAoICEgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiggb3B0aW9uc1sgb3B0aW9uIF0gKSAhPT0gJ2Jvb2xlYW4nICkge1xuXHRcdFx0YXJncy5wdXNoKCAnLS0nICsgb3B0aW9uICk7XG5cdFx0XHRhcmdzLnB1c2goIG9wdGlvbnNbIG9wdGlvbiBdICk7XG5cdFx0fSBlbHNlIGlmICggb3B0aW9uc1sgb3B0aW9uIF0gPT09IHRydWUgKSB7XG5cdFx0XHRhcmdzLnB1c2goICctLScgKyBvcHRpb24gKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBjcCA9IHNwYXduKCBndWxwUGF0aCwgYXJncyApO1xuXG5cdGNvbnNvbGUubG9nKCAnU3RhcnRlZCAlcyB3aXRoIFBJRCAlZCcsIHRhc2tOYW1lLCBjcC5waWQgKTtcblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCBjcCApO1xuXG5cdGNwLnN0ZG91dC5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcblx0XHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdFx0aWYgKCBkYXRhLm1hdGNoKC9GaW5pc2hlZCAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN1Y2Nlc3NmdWwuXG5cdFx0XHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRcdFx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblx0XHR9IGVsc2UgaWYgKCBkYXRhLm1hdGNoKC9TdGFydGluZyAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2ZpbGVuYW1lfS4uLmAgKTtcblx0XHR9XG5cdH0pO1xuXG5cdGNwLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZGVyci5vbiggJ2RhdGEnLCBoYW5kbGVTdGRlcnIgKTtcblxuXHRjcC5vbiggJ2V4aXQnLCBjb2RlID0+IHtcblx0XHQvLyBSZW1vdmUgdGhpcyB0YXNrIGZyb20gZ2xvYmFsIGFycmF5LlxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3MuZmlsdGVyKCBwcm9jID0+IHtcblx0XHRcdHJldHVybiAoIHByb2MucGlkICE9PSBjcC5waWQgKTtcblx0XHR9KTtcblxuXHRcdGlmICggY29kZSA9PT0gMCApIHtcblx0XHRcdC8vIFN1Y2Nlc3MuXG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHQvLyBcdHNpbGVudDogdHJ1ZVxuXHRcdFx0Ly8gfSk7XG5cdFx0fSBlbHNlIGlmICggY29kZSA9PT0gMSApIHtcblx0XHRcdC8vIFRlcm1pbmF0ZWQuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ1Byb2Nlc3MgJXMgdGVybWluYXRlZCcsIGNwLnBpZCApO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgKSB7XG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRXJyb3Igd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX0uYCxcblx0XHRcdC8vIFx0c291bmQ6ICdCYXNzbydcblx0XHRcdC8vIH0pO1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKGBFeGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7Y29kZX1gKTtcblx0XHR9XG5cblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soIGNvZGUgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggISB0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclswXSBdID0gZXJyQXJyWzFdO1xuXG5cdFx0XHRpZiAoIGVyckFyclswXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbignXFxuJykgKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCdcXG4nKSApO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHByb2plY3RzXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggc3RhdGUgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBhY3Rpb24uaWQsXG5cdFx0XHRcdFx0bmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdFx0cGF0aDogYWN0aW9uLnBhdGhcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gc3RhdGVcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3RzO1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gb2ZmQ2FudmFzKCB0b2dnbGUgPSB0cnVlLCBleGNsdWRlID0gbnVsbCApIHtcblx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ29mZi1jYW52YXMnLCB0b2dnbGUgKTtcblxuXHRpZiAoIHRvZ2dsZSApIHtcblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ29mZi1jYW52YXMtc2hvdycpICk7XG5cblx0XHRyZW1vdmVGb2N1cyhcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmYtY2FudmFzJyksXG5cdFx0XHQnb2ZmLWNhbnZhcycsXG5cdFx0XHRuZXcgRXZlbnQoJ29mZi1jYW52YXMtaGlkZScpLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdvZmYtY2FudmFzLWhpZGUnKSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRvZmZDYW52YXMsXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwXG59O1xuIl19
