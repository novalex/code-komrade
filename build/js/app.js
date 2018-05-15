(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

/**
 * @file Actions.
 */

// Main.

function changeView(view) {
	return {
		type: 'CHANGE_VIEW',
		view: view
	};
}

// Projects.

function addProject(project) {
	return {
		type: 'ADD_PROJECT',
		payload: project
	};
}

function changeProject(project) {
	return {
		type: 'CHANGE_PROJECT',
		payload: project
	};
}

function removeProject(id) {
	return {
		type: 'REMOVE_PROJECT',
		id: id
	};
}

function setProjectState(state) {
	return {
		type: 'SET_PROJECT_STATE',
		payload: state
	};
}

// Files.

function receiveFiles(files) {
	return {
		type: 'RECEIVE_FILES',
		payload: files
	};
}

module.exports = {
	changeView: changeView,
	addProject: addProject,
	changeProject: changeProject,
	removeProject: removeProject,
	setProjectState: setProjectState,
	receiveFiles: receiveFiles
};

},{}],2:[function(require,module,exports){
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

// let initialState = {
// 	view: 'files',
// 	projects: {},
// 	activeProject: 0,
// 	activeProjectFiles: {},
// 	selectedFile: null
// };

var store = createStore(rootReducer); // , initialState );

global.store = store;

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

},{"./components/App":3,"./gulp/interface":22,"./reducers":23,"./utils/globalUI":27,"./utils/utils":29,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Main app component.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var Overlay = require('./Overlay');

var Sidebar = require('./Sidebar');

var Logs = require('./projects/Logs');

var Projects = require('./projects/Projects');

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App(props) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.views = {
			files: 'Files',
			logs: 'Logs',
			settings: 'Settings'
		};
		return _this;
	}

	_createClass(App, [{
		key: 'renderOverlay',
		value: function renderOverlay() {
			global.ui.overlay(this.props.view !== 'files');

			if (this.props.view === 'files') {
				return '';
			} else {
				var content = void 0;

				if (this.props.view === 'logs') {
					content = React.createElement(Logs, null);
				} else {
					content = React.createElement(
						React.Fragment,
						null,
						React.createElement(
							'h2',
							null,
							this.views[this.props.view]
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
				React.createElement(Sidebar, { items: this.views }),
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

var mapStateToProps = function mapStateToProps(state) {
	return {
		view: state.view,
		projects: state.projects
	};
};

module.exports = connect(mapStateToProps, null)(App);

},{"./Overlay":5,"./Sidebar":6,"./projects/Logs":11,"./projects/Projects":14,"react":undefined,"react-redux":undefined}],4:[function(require,module,exports){
'use strict';

/**
 * @file Component for empty screen/no content.
 */

var React = require('react');

module.exports = function (props) {
	return React.createElement(
		'div',
		{ className: 'no-content ' + props.className },
		React.createElement(
			'div',
			{ className: 'inner' },
			props.children
		)
	);
};

},{"react":undefined}],5:[function(require,module,exports){
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

},{"react":undefined}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file App sidebar.
 */

var React = require('react');

var _require = require('../actions'),
    _changeView = _require.changeView;

var _require2 = require('react-redux'),
    connect = _require2.connect;

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

var mapStateToProps = function mapStateToProps(state) {
	return {
		active: state.view
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		changeView: function changeView(view) {
			return dispatch(_changeView(view));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(Sidebar);

},{"../actions":1,"react":undefined,"react-redux":undefined}],7:[function(require,module,exports){
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

},{"react":undefined}],8:[function(require,module,exports){
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

},{"../../utils/pathHelpers":28,"./Field":7,"electron":undefined,"prop-types":undefined,"react":undefined}],9:[function(require,module,exports){
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

},{"./Field":7,"prop-types":undefined,"react":undefined}],10:[function(require,module,exports){
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

},{"./Field":7,"prop-types":undefined,"react":undefined}],11:[function(require,module,exports){
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

},{"../NoContent":4,"react":undefined}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects panel.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var NoContent = require('../NoContent');

var Panel = function (_React$Component) {
	_inherits(Panel, _React$Component);

	function Panel() {
		_classCallCheck(this, Panel);

		return _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
	}

	_createClass(Panel, [{
		key: 'renderContent',
		value: function renderContent() {
			if (!this.props.project) {
				return React.createElement(
					NoContent,
					null,
					'No project currently selected.'
				);
			}

			return React.createElement(
				'div',
				{ id: 'project-info' },
				React.createElement(
					'h1',
					null,
					this.props.project.name
				),
				React.createElement(
					'h2',
					null,
					this.props.project.path
				),
				this.props.files && React.createElement(
					'p',
					null,
					'Number of files: ',
					Object.keys(this.props.files).length
				)
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				{ id: 'panel' },
				this.renderContent()
			);
		}
	}]);

	return Panel;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		project: state.activeProject,
		selectedFile: state.selectedFile
	};
};

module.exports = connect(mapStateToProps, null)(Panel);

},{"../NoContent":4,"react":undefined,"react-redux":undefined}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the project selector.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var _require2 = require('../../actions'),
    _setProjectState = _require2.setProjectState;

var _require3 = require('../../utils/utils'),
    setProjectConfig = _require3.setProjectConfig;

var ProjectSelect = function (_React$Component) {
	_inherits(ProjectSelect, _React$Component);

	function ProjectSelect(props) {
		_classCallCheck(this, ProjectSelect);

		var _this = _possibleConstructorReturn(this, (ProjectSelect.__proto__ || Object.getPrototypeOf(ProjectSelect)).call(this, props));

		_this.state = {
			isOpen: false
		};

		_this.toggleSelect = _this.toggleSelect.bind(_this);
		_this.selectProject = _this.selectProject.bind(_this);
		_this.toggleProject = _this.toggleProject.bind(_this);
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
		key: 'toggleProject',
		value: function toggleProject() {
			var paused = !this.props.active.paused || false;

			this.props.setProjectState({ paused: paused });

			setProjectConfig('paused', paused);
		}
	}, {
		key: 'selectProject',
		value: function selectProject(event) {
			event.persist();
			var index = event.currentTarget.dataset.project;

			if (index === 'new') {
				this.props.newProject();
			} else {
				this.props.changeProject(index);
			}

			this.toggleSelect();
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
					React.createElement('a', { href: '#', className: 'toggle' + (this.props.active.paused ? ' paused' : ' active'), onClick: this.toggleProject }),
					React.createElement('a', { href: '#', className: 'refresh', onClick: this.props.refreshProject }),
					React.createElement('a', { href: '#', className: 'remove', onClick: this.props.removeProject })
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

var mapStateToProps = function mapStateToProps(state) {
	return {
		projects: state.projects,
		active: state.activeProject
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		setProjectState: function setProjectState(state) {
			return dispatch(_setProjectState(state));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectSelect);

},{"../../actions":1,"../../utils/utils":29,"react":undefined,"react-redux":undefined}],14:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects view.
 */

var _debounce = require('lodash/debounce');

var dialog = require('electron').remote.dialog;

var fspath = require('path');

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var Store = require('electron-store');

var NoContent = require('../NoContent');

var Notice = require('../ui/Notice');

var ProjectSelect = require('./ProjectSelect');

var FileList = require('./filelist/FileList');

var Panel = require('./Panel');

var directoryTree = require('../../utils/directoryTree');

var Logger = require('../../utils/Logger');

var _require2 = require('../../actions'),
    _addProject = _require2.addProject,
    _removeProject = _require2.removeProject,
    _changeProject = _require2.changeProject,
    receiveFiles = _require2.receiveFiles;

var Projects = function (_React$Component) {
	_inherits(Projects, _React$Component);

	function Projects(props) {
		_classCallCheck(this, Projects);

		var _this = _possibleConstructorReturn(this, (Projects.__proto__ || Object.getPrototypeOf(Projects)).call(this, props));

		_this.state = {
			ignored: ['.git', 'node_modules', '.DS_Store', 'buildr-project.json'],
			loading: false
		};

		_this.newProject = _this.newProject.bind(_this);
		_this.setupProject = _this.setupProject.bind(_this);
		_this.changeProject = _this.changeProject.bind(_this);
		_this.refreshProject = _this.refreshProject.bind(_this);

		_this.initCompiler = _this.initCompiler.bind(_this);

		document.addEventListener('bd/refresh/files', _this.refreshProject);
		return _this;
	}

	_createClass(Projects, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (this.props.active.path) {
				this.setupProject(this.props.active.path);
			}
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps, prevState) {
			if (prevProps.active.paused !== this.props.active.paused) {
				this.initCompiler();
			}
		}

		// Add a new project.

	}, {
		key: 'newProject',
		value: function newProject() {
			var path = dialog.showOpenDialog({
				properties: ['openDirectory']
			});

			if (path) {
				var newProject = {
					name: fspath.basename(path[0]),
					path: path[0],
					paused: false
				};

				if (this.props.projects.findIndex(function (project) {
					return project.path === newProject.path;
				}) !== -1) {
					// Project already exists.
					return;
				}

				// Save new project to config.
				this.props.addProject(newProject);

				// Set new project as active.
				this.props.changeProject(_extends({}, newProject, {
					id: this.props.projects.length
				}));

				// Project setup.
				this.setupProject(newProject.path);
			}
		}

		// Chnage the active project.

	}, {
		key: 'changeProject',
		value: function changeProject(id) {
			if (this.props.projects[id]) {
				var active = this.props.projects[id];

				this.props.changeProject(_extends({}, active, {
					id: id
				}));

				this.setupProject(active.path);
			}
		}

		// Remove the current project.

	}, {
		key: 'removeProject',
		value: function removeProject(event) {
			event.preventDefault();

			var confirmRemove = window.confirm('Are you sure you want to remove ' + this.props.active.name + '?');

			if (confirmRemove) {
				this.props.removeProject(this.props.active.id);
				this.changeProject(null);
			}
		}
	}, {
		key: 'initCompiler',
		value: function initCompiler() {
			if (!this.props.active.paused) {
				global.compiler.initProject();
			} else {
				global.compiler.killTasks();
			}
		}
	}, {
		key: 'refreshProject',
		value: function refreshProject() {
			this.getFiles(this.props.active.path);
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
					loading: false
				}, function () {
					global.store.dispatch(receiveFiles(files));
				});

				global.ui.loading(false);
			}.bind(this));
		}
	}, {
		key: 'setupProject',
		value: function setupProject(path) {
			this.getFiles(path);

			this.setProjectConfigFile(path);

			// Change process cwd.
			process.chdir(path);

			global.logger = new Logger();

			this.initCompiler();
		}
	}, {
		key: 'renderNotices',
		value: function renderNotices() {
			if (this.props.active.paused) {
				return React.createElement(
					Notice,
					{ type: 'warning' },
					React.createElement(
						'p',
						null,
						'Project is paused. Files will not be watched and auto compiled.'
					)
				);
			}

			return '';
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.props.projects || this.props.projects.length === 0) {
				// No projects yet, show welcome screen.
				return React.createElement(
					NoContent,
					{ className: 'welcome-screen' },
					React.createElement(
						'h3',
						null,
						'You don\'t have any projects yet.'
					),
					React.createElement(
						'p',
						null,
						'Would you like to add one now?'
					),
					React.createElement(
						'button',
						{ className: 'add-new-project', onClick: this.newProject },
						'Add Project'
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'projects' },
				React.createElement(
					'div',
					{ id: 'header' },
					React.createElement(ProjectSelect, {
						newProject: this.newProject,
						setupProject: this.setupProject,
						changeProject: this.changeProject,
						refreshProject: this.refreshProject
					})
				),
				React.createElement(
					'div',
					{ id: 'content' },
					this.renderNotices(),
					React.createElement(FileList, {
						path: this.props.active.path,
						files: this.props.files,
						loading: this.state.loading
					})
				),
				React.createElement(Panel, null)
			);
		}
	}]);

	return Projects;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
	return {
		projects: state.projects,
		active: state.activeProject,
		files: state.activeProjectFiles
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		addProject: function addProject(payload) {
			return dispatch(_addProject(payload));
		},
		changeProject: function changeProject(id) {
			return dispatch(_changeProject(id));
		},
		removeProject: function removeProject(id) {
			return dispatch(_removeProject(id));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(Projects);

},{"../../actions":1,"../../utils/Logger":25,"../../utils/directoryTree":26,"../NoContent":4,"../ui/Notice":21,"./Panel":12,"./ProjectSelect":13,"./filelist/FileList":15,"electron":undefined,"electron-store":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],15:[function(require,module,exports){
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
			} else if (!this.props.files || !Object.keys(this.props.files).length) {
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

},{"./FileListDirectory":16,"./FileListFile":17,"react":undefined}],16:[function(require,module,exports){
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

},{"react":undefined}],17:[function(require,module,exports){
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
				// Todo: render original panel contents.
				return;
			}

			event.currentTarget.classList.add('has-options');

			ReactDOM.render(_FileOptions, document.getElementById('panel'));
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

},{"../fileoptions/FileOptionsScript":19,"../fileoptions/FileOptionsStyle":20,"electron":undefined,"react":undefined,"react-dom":undefined}],18:[function(require,module,exports){
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
			this.setState({ loading: true });

			global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, function (code) {
				this.setState({ loading: false });
			}.bind(this));
		}
	}, {
		key: 'renderHeader',
		value: function renderHeader() {
			return React.createElement(
				'div',
				{ className: 'header' },
				React.createElement(
					'strong',
					null,
					this.props.file.name
				)
			);
		}
	}, {
		key: 'renderFooter',
		value: function renderFooter() {
			return React.createElement(
				'div',
				{ className: 'footer' },
				React.createElement(
					'button',
					{
						className: 'compile green',
						onClick: this.handleCompile,
						disabled: this.state.loading
					},
					this.state.loading ? 'Compiling...' : 'Compile'
				)
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

},{"../../../utils/pathHelpers":28,"react":undefined}],19:[function(require,module,exports){
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
				this.renderHeader(),
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
				this.renderFooter()
			);
		}
	}]);

	return FileOptionsScript;
}(FileOptions);

module.exports = FileOptionsScript;

},{"../../fields/FieldSaveFile":8,"../../fields/FieldSwitch":10,"./FileOptions":18,"react":undefined}],20:[function(require,module,exports){
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
					this.renderHeader(),
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
				this.renderHeader(),
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
				this.renderFooter()
			);
		}
	}]);

	return FileOptionsStyles;
}(FileOptions);

module.exports = FileOptionsStyles;

},{"../../fields/FieldSaveFile":8,"../../fields/FieldSelect":9,"../../fields/FieldSwitch":10,"./FileOptions":18,"react":undefined}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for showing notices and alerts.
 */

var React = require('react');

var Notice = function (_React$Component) {
	_inherits(Notice, _React$Component);

	function Notice() {
		_classCallCheck(this, Notice);

		return _possibleConstructorReturn(this, (Notice.__proto__ || Object.getPrototypeOf(Notice)).apply(this, arguments));
	}

	_createClass(Notice, [{
		key: 'render',
		value: function render() {
			var type = this.props.type || 'info';

			return React.createElement(
				'div',
				{ className: 'notice type-' + type },
				this.props.children
			);
		}
	}]);

	return Notice;
}(React.Component);

module.exports = Notice;

},{"react":undefined}],22:[function(require,module,exports){
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
		if (options.watchTask) {
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

},{"../utils/pathHelpers":28,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined}],23:[function(require,module,exports){
'use strict';

/**
 * @file Root reducer.
 */

var _require = require('redux'),
    combineReducers = _require.combineReducers;

var view = function view() {
	var current = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'files';
	var action = arguments[1];

	switch (action.type) {
		case 'CHANGE_VIEW':
			return action.view;
		default:
			return current;
	}
};

var _require2 = require('./projects'),
    projects = _require2.projects,
    activeProject = _require2.activeProject,
    activeProjectFiles = _require2.activeProjectFiles;

module.exports = combineReducers({
	view: view,
	projects: projects,
	activeProject: activeProject,
	activeProjectFiles: activeProjectFiles
});

},{"./projects":24,"redux":undefined}],24:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @file Projects reducer.
 */

var initialProjects = [];

if (global.config.has('projects')) {
	initialProjects = global.config.get('projects');
}

var projects = function projects() {
	var projects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialProjects;
	var action = arguments[1];

	switch (action.type) {
		case 'ADD_PROJECT':
			var newProjects = [].concat(_toConsumableArray(projects), [action.payload]);

			global.config.set('projects', newProjects);

			return newProjects;
		case 'REMOVE_PROJECT':
			return projects.filter(function (project, index) {
				return index !== action.id;
			});
		default:
			return projects;
	}
};

var initialActive = {
	id: null,
	name: '',
	path: '',
	paused: false
};

if (initialProjects.length && global.config.has('active-project')) {
	var activeIndex = global.config.get('active-project');

	if (initialProjects[activeIndex]) {
		initialActive = initialProjects[activeIndex];
		initialActive.id = activeIndex;
	}
}

var activeProject = function activeProject() {
	var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialActive;
	var action = arguments[1];

	switch (action.type) {
		case 'CHANGE_PROJECT':
			global.config.set('active-project', action.payload.id);

			return action.payload;
		case 'SET_PROJECT_STATE':
			return _extends({}, active, action.payload);
		default:
			return active;
	}
};

var activeProjectFiles = function activeProjectFiles() {
	var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case 'RECEIVE_FILES':
			return action.payload;
		default:
			return files;
	}
};

module.exports = {
	projects: projects,
	activeProject: activeProject,
	activeProjectFiles: activeProjectFiles
};

},{}],25:[function(require,module,exports){
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

},{"moment":undefined}],26:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],27:[function(require,module,exports){
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
	removeFocus: removeFocus
};

},{}],28:[function(require,module,exports){
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

},{"path":undefined}],29:[function(require,module,exports){
'use strict';

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

function setProjectConfig(property, value) {
	var projects = global.config.get('projects');
	var activeIndex = global.config.get('active-project');

	if (Array.isArray(projects) && projects[activeIndex]) {
		projects[activeIndex][property] = value;

		global.config.set('projects', projects);
	} else {
		window.alert('There was a problem saving the project config.');
	}
}

module.exports = {
	sleep: sleep,
	setProjectConfig: setProjectConfig
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsImFwcC9qcy9hcHAuanMiLCJhcHAvanMvY29tcG9uZW50cy9BcHAuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvTm9Db250ZW50LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvU2lkZWJhci5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFN3aXRjaC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1BhbmVsLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RTZWxlY3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvdWkvTm90aWNlLmpzeCIsImFwcC9qcy9ndWxwL2ludGVyZmFjZS5qcyIsImFwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsImFwcC9qcy9yZWR1Y2Vycy9wcm9qZWN0cy5qcyIsImFwcC9qcy91dGlscy9Mb2dnZXIuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGlscy9wYXRoSGVscGVycy5qcyIsImFwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQTs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsSUFBckIsRUFBNEI7QUFDM0IsUUFBTztBQUNOLFFBQU0sYUFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVEOztBQUVBLFNBQVMsVUFBVCxDQUFxQixPQUFyQixFQUErQjtBQUM5QixRQUFPO0FBQ04sUUFBTSxhQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsT0FBeEIsRUFBa0M7QUFDakMsUUFBTztBQUNOLFFBQU0sZ0JBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELFNBQVMsYUFBVCxDQUF3QixFQUF4QixFQUE2QjtBQUM1QixRQUFPO0FBQ04sUUFBTSxnQkFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVELFNBQVMsZUFBVCxDQUEwQixLQUExQixFQUFrQztBQUNqQyxRQUFPO0FBQ04sUUFBTSxtQkFEQTtBQUVOLFdBQVM7QUFGSCxFQUFQO0FBSUE7O0FBRUQ7O0FBRUEsU0FBUyxZQUFULENBQXVCLEtBQXZCLEVBQStCO0FBQzlCLFFBQU87QUFDTixRQUFNLGVBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQix1QkFEZ0I7QUFFaEIsdUJBRmdCO0FBR2hCLDZCQUhnQjtBQUloQiw2QkFK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QixhQURnQjtBQUVoQjtBQUZnQixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb2plY3QoIGlkICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRU1PVkVfUFJPSkVDVCcsXG5cdFx0aWRcblx0fVxufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfUFJPSkVDVF9TVEFURScsXG5cdFx0cGF5bG9hZDogc3RhdGVcblx0fVxufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2hhbmdlVmlldyxcblx0YWRkUHJvamVjdCxcblx0Y2hhbmdlUHJvamVjdCxcblx0cmVtb3ZlUHJvamVjdCxcblx0c2V0UHJvamVjdFN0YXRlLFxuXHRyZWNlaXZlRmlsZXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vZ3VscC9pbnRlcmZhY2UnKTtcblxuZ2xvYmFsLmNvbXBpbGVyVGFza3MgPSBbXTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCB7IFByb3ZpZGVyIH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IGNyZWF0ZVN0b3JlIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCByb290UmVkdWNlciA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxuLy8gbGV0IGluaXRpYWxTdGF0ZSA9IHtcbi8vIFx0dmlldzogJ2ZpbGVzJyxcbi8vIFx0cHJvamVjdHM6IHt9LFxuLy8gXHRhY3RpdmVQcm9qZWN0OiAwLFxuLy8gXHRhY3RpdmVQcm9qZWN0RmlsZXM6IHt9LFxuLy8gXHRzZWxlY3RlZEZpbGU6IG51bGxcbi8vIH07XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyICk7IC8vICwgaW5pdGlhbFN0YXRlICk7XG5cbmdsb2JhbC5zdG9yZSA9IHN0b3JlO1xuXG5jb25zdCBBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQXBwJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXsgc3RvcmUgfT5cblx0XHQ8QXBwIC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pO1xuXG5jb25zdCB7IHNsZWVwIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5cbi8vIEFwcCBjbG9zZS9yZXN0YXJ0IGV2ZW50cy5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA+IDAgKSB7XG5cdFx0Y29uc29sZS5sb2coICdLaWxsaW5nICVkIHJ1bm5pbmcgdGFza3MuLi4nLCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblxuXHRcdHNsZWVwKCAzMDAgKTtcblx0fVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIGNvbXBvbmVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMudmlld3MgPSB7XG5cdFx0XHRmaWxlczogJ0ZpbGVzJyxcblx0XHRcdGxvZ3M6ICdMb2dzJyxcblx0XHRcdHNldHRpbmdzOiAnU2V0dGluZ3MnXG5cdFx0fTtcblx0fVxuXG5cdHJlbmRlck92ZXJsYXkoKSB7XG5cdFx0Z2xvYmFsLnVpLm92ZXJsYXkoIHRoaXMucHJvcHMudmlldyAhPT0gJ2ZpbGVzJyApO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdmaWxlcycgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gKFxuXHRcdFx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0XHRcdDxoMj57IHRoaXMudmlld3NbIHRoaXMucHJvcHMudmlldyBdIH08L2gyPlxuXHRcdFx0XHRcdFx0PHA+WW91IHNob3VsZG4ndCBiZSBoZXJlLCB5b3UgbmF1Z2h0eSBuYXVnaHR5IGJveS48L3A+XG5cdFx0XHRcdFx0PC9SZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50ICcgKyBwcm9wcy5jbGFzc05hbWUgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYW4gb3ZlcmxheS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHQvLyBjb25zdHJ1Y3RvcigpIHt9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdvdmVybGF5Jz5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmhhc0Nsb3NlICYmXG5cdFx0XHRcdFx0PGEgaHJlZj0nIycgaWQ9J2Nsb3NlLW92ZXJsYXknPiZ0aW1lczs8L2E+XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQ8ZGl2IGlkPSdvdmVybGF5LWNvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTtcbiIsIi8qKlxuICogQGZpbGUgQXBwIHNpZGViYXIuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNoYW5nZVZpZXcgfSA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jbGFzcyBTaWRlYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGxldCB2aWV3ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnZpZXc7XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVZpZXcoIHZpZXcgKTtcblx0fVxuXG5cdHJlbmRlckl0ZW1zKCkge1xuXHRcdGxldCBpdGVtcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGlkIGluIHRoaXMucHJvcHMuaXRlbXMgKSB7XG5cdFx0XHRpdGVtcy5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS12aWV3PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdGlwPXsgdGhpcy5wcm9wcy5pdGVtc1sgaWQgXSB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy5hY3RpdmUgPT09IGlkID8gJ2FjdGl2ZScgOiAnJyB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bmF2IGlkPSdzaWRlYmFyJz5cblx0XHRcdFx0PHVsIGlkPSdtZW51Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVySXRlbXMoKSB9XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L25hdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmU6IHN0YXRlLnZpZXdcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0Y2hhbmdlVmlldzogdmlldyA9PiBkaXNwYXRjaCggY2hhbmdlVmlldyggdmlldyApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFNpZGViYXIgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB3cmFwcGluZyBhIGZpZWxkLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuZnVuY3Rpb24gRmllbGQoIHByb3BzICkge1xuXHRsZXQgY2xhc3NOYW1lID0gJ2ZpZWxkIGZpZWxkLScgKyBwcm9wcy50eXBlICsgJyBsYWJlbC0nICsgKCBwcm9wcy5sYWJlbFBvcyA/IHByb3BzLmxhYmVsUG9zIDogJ3RvcCcgKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0+XG5cdFx0XHR7IHByb3BzLmxhYmVsICYmXG5cdFx0XHRcdDxzdHJvbmcgY2xhc3NOYW1lPSdmaWVsZC1sYWJlbCc+eyBwcm9wcy5sYWJlbCB9PC9zdHJvbmc+XG5cdFx0XHR9XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQtY29udCc+XG5cdFx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBzYXZlIGZpbGUgZmllbGQuXG4gKi9cblxuY29uc3QgeyBkaWFsb2cgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2F2ZUZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cGF0aDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgcGF0aCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyAnJyA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHBhdGggfTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVTYXZlT3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLnRpdGxlID0gdGhpcy5wcm9wcy5kaWFsb2dUaXRsZTtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlRmlsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucHJvcHMuc291cmNlRmlsZS5wYXRoO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMuc3RhdGUucGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmZpbHRlcnMgPSB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gZGlhbG9nLnNob3dTYXZlRGlhbG9nKCBmaWxlU2F2ZU9wdGlvbnMgKTtcblxuXHRcdGlmICggZmlsZW5hbWUgKSB7XG5cdFx0XHRsZXQgc2F2ZVBhdGggPSBzbGFzaCggZmlsZW5hbWUgKTtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRcdHNhdmVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgZmlsZW5hbWUgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHsgcGF0aDogc2F2ZVBhdGggfSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgc2F2ZVBhdGggKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0ndGV4dCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuc3RhdGUucGF0aCB9XG5cdFx0XHRcdFx0cmVhZE9ubHk9J3RydWUnXG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0Lz5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNhdmVGaWxlLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c291cmNlRmlsZTogUHJvcFR5cGVzLm9iamVjdCxcblx0ZGlhbG9nVGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdGRpYWxvZ0ZpbHRlcnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5vYmplY3QgXSksXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNhdmVGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgZHJvcGRvd24gc2VsZWN0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0c2VsZWN0ZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgc2VsZWN0ZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBzZWxlY3RlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBzZWxlY3RlZDogZXZlbnQudGFyZ2V0LnZhbHVlIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLnNlbGVjdGVkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCkge1xuXHRcdGxldCBvcHRpb25zID0gW107XG5cblx0XHRmb3IgKCBsZXQgdmFsdWUgaW4gdGhpcy5wcm9wcy5vcHRpb25zICkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKFxuXHRcdFx0XHQ8b3B0aW9uIGtleT17IHZhbHVlIH0gdmFsdWU9eyB2YWx1ZSB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5vcHRpb25zWyB2YWx1ZSBdIH1cblx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2VsZWN0JyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGxhYmVsXG5cdFx0XHRcdFx0aHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5zZWxlY3RlZCA/IHRoaXMucHJvcHMub3B0aW9uc1sgdGhpcy5zdGF0ZS5zZWxlY3RlZCBdIDogJycgfVxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHQ8c2VsZWN0XG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuc3RhdGUuc2VsZWN0ZWQgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuZ2V0T3B0aW9ucygpIH1cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTZWxlY3QucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm51bWJlciBdKSxcblx0b3B0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSB0b2dnbGUgc3dpdGNoLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTd2l0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Y2hlY2tlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBjaGVja2VkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgY2hlY2tlZCB9O1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBjaGVja2VkOiAhIHByZXZTdGF0ZS5jaGVja2VkIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCB0aGlzLnN0YXRlLmNoZWNrZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3N3aXRjaCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0Y2hlY2tlZD17IHRoaXMuc3RhdGUuY2hlY2tlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFN3aXRjaC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5ib29sLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBsb2dzIGFuZCBpbmZvcm1hdGlvbi5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGxldCBsb2dJbmRleCA9IDA7XG5cdFx0bGV0IGxvZ0xpc3QgPSBbXTtcblxuXHRcdGZvciAoIHZhciBsb2cgb2YgdGhpcy5zdGF0ZS5sb2dzICkge1xuXHRcdFx0bGV0IHRpdGxlSFRNTCA9IHsgX19odG1sOiBsb2cudGl0bGUgfTtcblx0XHRcdGxldCBib2R5SFRNTCA9ICggbG9nLmJvZHkgKSA/IHsgX19odG1sOiBsb2cuYm9keSB9IDogbnVsbDtcblxuXHRcdFx0bG9nTGlzdC5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBsb2dJbmRleCB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgJ3R5cGUtJyArIGxvZy50eXBlIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0XHQ8c21hbGw+eyBsb2cudGltZSB9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUtdGV4dCcgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyB0aXRsZUhUTUwgfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHsgYm9keUhUTUwgJiZcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXRhaWxzJyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IGJvZHlIVE1MIH0gLz5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpO1xuXHRcdFx0bG9nSW5kZXgrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gPHVsPnsgbG9nTGlzdCB9PC91bD47XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUubG9ncy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gPE5vQ29udGVudD5ObyBsb2dzIHlldC4gR28gZm9ydGggYW5kIGNvbXBpbGUhPC9Ob0NvbnRlbnQ+O1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdsb2dzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHBhbmVsLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXJDb250ZW50KCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLnByb2plY3QgKSB7XG5cdFx0XHRyZXR1cm4gPE5vQ29udGVudD5ObyBwcm9qZWN0IGN1cnJlbnRseSBzZWxlY3RlZC48L05vQ29udGVudD47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtaW5mbyc+XG5cdFx0XHRcdDxoMT57IHRoaXMucHJvcHMucHJvamVjdC5uYW1lIH08L2gxPlxuXHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9PC9oMj5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmZpbGVzICYmXG5cdFx0XHRcdFx0PHA+TnVtYmVyIG9mIGZpbGVzOiB7IE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoIH08L3A+XG5cdFx0XHRcdH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRzZWxlY3RlZEZpbGU6IHN0YXRlLnNlbGVjdGVkRmlsZVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBudWxsICkoIFBhbmVsICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3Qgc2VsZWN0b3IuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdFN0YXRlIH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgc2V0UHJvamVjdENvbmZpZyB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXRpbHMnKTtcblxuY2xhc3MgUHJvamVjdFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gdGhpcy50b2dnbGVTZWxlY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuc2VsZWN0UHJvamVjdCA9IHRoaXMuc2VsZWN0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy50b2dnbGVQcm9qZWN0ID0gdGhpcy50b2dnbGVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHRvZ2dsZVNlbGVjdCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0Z2xvYmFsLnVpLnVuZm9jdXMoICEgcHJldlN0YXRlLmlzT3BlbiApO1xuXG5cdFx0XHRyZXR1cm4geyBpc09wZW46ICEgcHJldlN0YXRlLmlzT3BlbiB9O1xuXHRcdH0pO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgfHwgZmFsc2U7XG5cblx0XHR0aGlzLnByb3BzLnNldFByb2plY3RTdGF0ZSh7IHBhdXNlZDogcGF1c2VkIH0pO1xuXG5cdFx0c2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHBhdXNlZCApO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0KCk7XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldFByb2plY3RTdGF0ZTogc3RhdGUgPT4gZGlzcGF0Y2goIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgX2RlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoL2RlYm91bmNlJyk7XG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgTm90aWNlID0gcmVxdWlyZSgnLi4vdWkvTm90aWNlJyk7XG5cbmNvbnN0IFByb2plY3RTZWxlY3QgPSByZXF1aXJlKCcuL1Byb2plY3RTZWxlY3QnKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCcuL2ZpbGVsaXN0L0ZpbGVMaXN0Jyk7XG5cbmNvbnN0IFBhbmVsID0gcmVxdWlyZSgnLi9QYW5lbCcpO1xuXG5jb25zdCBkaXJlY3RvcnlUcmVlID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZGlyZWN0b3J5VHJlZScpO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9Mb2dnZXInKTtcblxuY29uc3QgeyBhZGRQcm9qZWN0LCByZW1vdmVQcm9qZWN0LCBjaGFuZ2VQcm9qZWN0LCByZWNlaXZlRmlsZXMgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aWdub3JlZDogW1xuXHRcdFx0XHQnLmdpdCcsXG5cdFx0XHRcdCdub2RlX21vZHVsZXMnLFxuXHRcdFx0XHQnLkRTX1N0b3JlJyxcblx0XHRcdFx0J2J1aWxkci1wcm9qZWN0Lmpzb24nXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldHVwUHJvamVjdCA9IHRoaXMuc2V0dXBQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3QgPSB0aGlzLmNoYW5nZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldHVwUHJvamVjdCggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSggcHJldlByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0aWYgKCBwcmV2UHJvcHMuYWN0aXZlLnBhdXNlZCAhPT0gdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgYSBuZXcgcHJvamVjdC5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3QgYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHRcdC4uLm5ld1Byb2plY3QsXG5cdFx0XHRcdGlkOiB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aFxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFByb2plY3Qgc2V0dXAuXG5cdFx0XHR0aGlzLnNldHVwUHJvamVjdCggbmV3UHJvamVjdC5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2huYWdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQgKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLnByb2plY3RzWyBpZCBdICkge1xuXHRcdFx0bGV0IGFjdGl2ZSA9IHRoaXMucHJvcHMucHJvamVjdHNbIGlkIF07XG5cblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0aWRcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldHVwUHJvamVjdCggYWN0aXZlLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHQvLyBSZW1vdmUgdGhlIGN1cnJlbnQgcHJvamVjdC5cblx0cmVtb3ZlUHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBjb25maXJtUmVtb3ZlID0gd2luZG93LmNvbmZpcm0oICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlICcgKyB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lICsgJz8nICk7XG5cblx0XHRpZiAoIGNvbmZpcm1SZW1vdmUgKSB7XG5cdFx0XHR0aGlzLnByb3BzLnJlbW92ZVByb2plY3QoIHRoaXMucHJvcHMuYWN0aXZlLmlkICk7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIG51bGwgKTtcblx0XHR9XG5cdH1cblxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0c2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKSB7XG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBuZXcgU3RvcmUoe1xuXHRcdFx0bmFtZTogJ2J1aWxkci1wcm9qZWN0Jyxcblx0XHRcdGN3ZDogcGF0aFxuXHRcdH0pO1xuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHRnZXRGaWxlcyggcGF0aCApIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC51aS5sb2FkaW5nKCk7XG5cblx0XHRsZXQgZXhjbHVkZSA9IG5ldyBSZWdFeHAoIHRoaXMuc3RhdGUuaWdub3JlZC5qb2luKCd8JyksICdpJyApO1xuXG5cdFx0ZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSkudGhlbiggZnVuY3Rpb24oIGZpbGVzICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIGZpbGVzICkgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cdH1cblxuXHRzZXR1cFByb2plY3QoIHBhdGggKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0dGhpcy5zZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApO1xuXG5cdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdGdsb2JhbC5sb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cblx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHR9XG5cblx0cmVuZGVyTm90aWNlcygpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb3RpY2UgdHlwZT0nd2FybmluZyc+XG5cdFx0XHRcdFx0PHA+UHJvamVjdCBpcyBwYXVzZWQuIEZpbGVzIHdpbGwgbm90IGJlIHdhdGNoZWQgYW5kIGF1dG8gY29tcGlsZWQuPC9wPlxuXHRcdFx0XHQ8L05vdGljZT5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLnByb2plY3RzIHx8IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdHMgeWV0LCBzaG93IHdlbGNvbWUgc2NyZWVuLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3dlbGNvbWUtc2NyZWVuJz5cblx0XHRcdFx0XHQ8aDM+WW91IGRvbid0IGhhdmUgYW55IHByb2plY3RzIHlldC48L2gzPlxuXHRcdFx0XHRcdDxwPldvdWxkIHlvdSBsaWtlIHRvIGFkZCBvbmUgbm93PzwvcD5cblx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzTmFtZT0nYWRkLW5ldy1wcm9qZWN0JyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+QWRkIFByb2plY3Q8L2J1dHRvbj5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0cyc+XG5cdFx0XHRcdDxkaXYgaWQ9J2hlYWRlcic+XG5cdFx0XHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0XHRcdG5ld1Byb2plY3Q9eyB0aGlzLm5ld1Byb2plY3QgfVxuXHRcdFx0XHRcdFx0c2V0dXBQcm9qZWN0PXsgdGhpcy5zZXR1cFByb2plY3QgfVxuXHRcdFx0XHRcdFx0Y2hhbmdlUHJvamVjdD17IHRoaXMuY2hhbmdlUHJvamVjdCB9XG5cdFx0XHRcdFx0XHRyZWZyZXNoUHJvamVjdD17IHRoaXMucmVmcmVzaFByb2plY3QgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJOb3RpY2VzKCkgfVxuXG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMucHJvcHMuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PFBhbmVsIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdCxcblx0ZmlsZXM6IHN0YXRlLmFjdGl2ZVByb2plY3RGaWxlc1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRhZGRQcm9qZWN0OiBwYXlsb2FkID0+IGRpc3BhdGNoKCBhZGRQcm9qZWN0KCBwYXlsb2FkICkgKSxcblx0Y2hhbmdlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIGNoYW5nZVByb2plY3QoIGlkICkgKSxcblx0cmVtb3ZlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIHJlbW92ZVByb2plY3QoIGlkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nZW1wdHknPlxuXHRcdFx0XHRcdE5vdGhpbmcgdG8gc2VlIGhlcmUuXG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZWxpc3Q7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyVHJlZSgpIH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3REaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgZXhwYW5kZWQ6ICEgcHJldlN0YXRlLmV4cGFuZGVkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0Y2xhc3NOYW1lICs9ICcgZXhwYW5kJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9IG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RGlyZWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGZpbGUgaW4gdGhlIGZpbGVsaXN0LlxuICovXG5cbmNvbnN0IHsgcmVtb3RlLCBzaGVsbCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuY29uc3QgeyBNZW51LCBNZW51SXRlbSB9ID0gcmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi4vZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTY3JpcHQnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTdHlsZSA9IHJlcXVpcmUoJy4uL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUnKTtcblxuY2xhc3MgRmlsZUxpc3RGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLm9uQ29udGV4dE1lbnUgPSB0aGlzLm9uQ29udGV4dE1lbnUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9ucyggZmlsZSApIHtcblx0XHRpZiAoICEgZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfSBmaWxlPXsgZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKTtcblxuXHRcdGxldCBfRmlsZU9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0aWYgKCAhIF9GaWxlT3B0aW9ucyApIHtcblx0XHRcdC8vIFRvZG86IHJlbmRlciBvcmlnaW5hbCBwYW5lbCBjb250ZW50cy5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFuZWwnKVxuXHRcdCk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBGaWxlTGlzdFBsYWNlaG9sZGVyKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8bGkgY2xhc3NOYW1lPXsgcHJvcHMudHlwZSArICcgaW5mb3JtYXRpdmUnIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPnsgcHJvcHMuY2hpbGRyZW4gfTwvZGl2PlxuXHRcdDwvbGk+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRGaWxlTGlzdEZpbGUsXG5cdEZpbGVMaXN0UGxhY2Vob2xkZXJcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXRPdXRwdXRQYXRoID0gdGhpcy5zZXRPdXRwdXRQYXRoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBmYWxzZSApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgKSB7XG5cdFx0XHRcdGZpbGVDb25maWdbIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGZpbGVzLnB1c2goIGZpbGVDb25maWcgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRkZWxldGUgZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLnNldCggJ2ZpbGVzJywgZmlsZXMgKTtcblx0fVxuXG5cdGdldE9wdGlvbiggb3B0aW9uLCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5vcHRpb25zICYmIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHR9XG5cblx0c2V0T3B0aW9uKCBvcHRpb24sIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRsZXQgb3B0aW9ucyA9IHByZXZTdGF0ZS5vcHRpb25zIHx8IHt9O1xuXHRcdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSB2YWx1ZTtcblxuXHRcdFx0cmV0dXJuIHsgb3B0aW9ucyB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRDb25maWcoICdvcHRpb25zJywgdGhpcy5zdGF0ZS5vcHRpb25zICk7XG5cdFx0fSk7XG5cdH1cblxuXHRoYW5kbGVDaGFuZ2UoIGV2ZW50LCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldE9wdGlvbiggZXZlbnQudGFyZ2V0Lm5hbWUsIHZhbHVlICk7XG5cdH1cblxuXHRkZWZhdWx0T3V0cHV0UGF0aCgpIHtcblx0XHRyZXR1cm4gZmlsZU91dHB1dFBhdGgoIHRoaXMucHJvcHMuZmlsZSwgdGhpcy5vdXRwdXRTdWZmaXgsIHRoaXMub3V0cHV0RXh0ZW5zaW9uICk7XG5cdH1cblxuXHRzZXRPdXRwdXRQYXRoKCBldmVudCwgcGF0aCApIHtcblx0XHR0aGlzLnNldENvbmZpZyggJ291dHB1dCcsIHBhdGggKTtcblx0fVxuXG5cdGdldE91dHB1dFBhdGgoIHR5cGUgPSAncmVsYXRpdmUnICkge1xuXHRcdGxldCBzbGFzaFBhdGggPSAoIHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCByZWxhdGl2ZVBhdGggPSAoIHR5cGUgPT09ICdyZWxhdGl2ZScgfHwgdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IGRlZmF1bHRQYXRoID0gdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpO1xuXHRcdGxldCBvdXRwdXRQYXRoID0gdGhpcy5nZXRDb25maWcoICdvdXRwdXQnLCBkZWZhdWx0UGF0aCApO1xuXG5cdFx0aWYgKCByZWxhdGl2ZVBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHNsYXNoUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBzbGFzaCggb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRQYXRoO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5wcm9jZXNzRmlsZShcblx0XHRcdHRoaXMucHJvcHMuYmFzZSxcblx0XHRcdHRoaXMuZ2V0Q29uZmlnKCksXG5cdFx0XHR0aGlzLnN0YXRlLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRmdW5jdGlvbiggY29kZSApIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVySGVhZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naGVhZGVyJz5cblx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJGb290ZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmb290ZXInPlxuXHRcdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPSdjb21waWxlIGdyZWVuJ1xuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLmhhbmRsZUNvbXBpbGUgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS5sb2FkaW5nID8gJ0NvbXBpbGluZy4uLicgOiAnQ29tcGlsZScgfVxuXHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9ucztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzY3JpcHQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU2NyaXB0IGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmpzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnSmF2YVNjcmlwdCcsIGV4dGVuc2lvbnM6IFsgJ2pzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0c291cmNlTWFwc0Rpc2FibGVkKCkge1xuXHRcdHJldHVybiAoICEgdGhpcy5zdGF0ZS5vcHRpb25zIHx8ICggISB0aGlzLnN0YXRlLm9wdGlvbnMuYnVuZGxlICYmICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJhYmVsICkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zY3JpcHQnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdidW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdidW5kbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdjb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsPSdDb21wcmVzcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnY29tcHJlc3MnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zb3VyY2VNYXBzRGlzYWJsZWQoKSB9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlcyBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5jc3MnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdDU1MnLCBleHRlbnNpb25zOiBbICdjc3MnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRpc1BhcnRpYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSwgaXQgY2Fubm90IGJlIGNvbXBpbGVkIGJ5IGl0c2VsZi48L3A+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nZmlsZS1vcHRpb25zJyBjbGFzc05hbWU9J2ZpbGUtb3B0aW9ucy1zdHlsZSc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUudHlwZSA9PT0gJ3Nhc3MnICYmXG5cdFx0XHRcdFx0XHQ8RmllbGRTZWxlY3Rcblx0XHRcdFx0XHRcdFx0bmFtZT0nc3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgU3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJywgJ25lc3RlZCcgKSB9XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM9eyB7XG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkOiAnTmVzdGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wYWN0OiAnQ29tcGFjdCcsXG5cdFx0XHRcdFx0XHRcdFx0ZXhwYW5kZWQ6ICdFeHBhbmRlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcHJlc3NlZDogJ0NvbXByZXNzZWQnXG5cdFx0XHRcdFx0XHRcdH0gfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9wcmVmaXhlcicsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTdHlsZXM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igc2hvd2luZyBub3RpY2VzIGFuZCBhbGVydHMuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBOb3RpY2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHR5cGUgPSB0aGlzLnByb3BzLnR5cGUgfHwgJ2luZm8nO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vdGljZSB0eXBlLScgKyB0eXBlIH0+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWNlO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduO1xuY29uc3QgcHNUcmVlID0gcmVxdWlyZSgncHMtdHJlZScpO1xuXG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuXG5jb25zdCBPU0NtZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnLmNtZCcgOiAnJztcbmNvbnN0IGd1bHBQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnLmJpbicsICdndWxwJyArIE9TQ21kICk7XG5jb25zdCBndWxwRmlsZVBhdGggPSBwYXRoLmpvaW4oIF9fZGlybmFtZSwgJy4uJywgJ2FwcCcsICdqcycsICdndWxwJywgJ2d1bHBmaWxlLmpzJyApO1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlQWJzb2x1dGVQYXRoLCBmaWxlUmVsYXRpdmVQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5mdW5jdGlvbiBraWxsVGFza3MoKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICkge1xuXHRcdGZvciAoIHZhciB0YXNrIG9mIGdsb2JhbC5jb21waWxlclRhc2tzICkge1xuXHRcdFx0dGVybWluYXRlUHJvY2VzcyggdGFzayApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gTm90aGluZyB0byBraWxsIDooXG5cdHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB0ZXJtaW5hdGVQcm9jZXNzKCBwcm9jICkge1xuXHRwc1RyZWUoIHByb2MucGlkLCBmdW5jdGlvbiggZXJyLCBjaGlsZHJlbiApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdH1cblxuXHRcdGZvciAoIHZhciBwaWQgb2YgWyBwcm9jLnBpZCBdLmNvbmNhdCggY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBjaGlsZC5QSUQgKSApICkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cHJvY2Vzcy5raWxsKCBwaWQgKTtcblx0XHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHRcdC8vIEZhaWwgc2lsZW50bHkgbG9sIFlPTE9cblx0XHRcdFx0Ly8gY29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaW5pdFByb2plY3QoKSB7XG5cdGtpbGxUYXNrcygpO1xuXG5cdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgcHJvamVjdEZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXG5cdGxldCBwcm9qZWN0UGF0aCA9IHBhdGgucGFyc2UoIGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGggKS5kaXI7XG5cblx0Zm9yICggdmFyIGZpbGVDb25maWcgb2YgcHJvamVjdEZpbGVzICkge1xuXHRcdHByb2Nlc3NGaWxlKCBwcm9qZWN0UGF0aCwgZmlsZUNvbmZpZyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NGaWxlKCBiYXNlLCBmaWxlQ29uZmlnLCB0YXNrTmFtZSA9IG51bGwsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG9wdGlvbnMgPSBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICk7XG5cblx0aWYgKCAhIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCB0YXNrTmFtZSApIHtcblx0XHRydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRpZiAoIG9wdGlvbnMud2F0Y2hUYXNrICkge1xuXHRcdFx0b3B0aW9ucy5nZXRJbXBvcnRzID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRydW5UYXNrKCAnd2F0Y2gnLCBvcHRpb25zICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU9wdGlvbnMoIGZpbGUgKSB7XG5cdGxldCBvcHRpb25zID0ge307XG5cblx0c3dpdGNoICggZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnY3NzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5zYXNzJzpcblx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnc2Fzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnbGVzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuanMnOlxuXHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2pzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc2NyaXB0Jztcblx0fVxuXG5cdG9wdGlvbnMuYnVpbGRUYXNrTmFtZSA9ICdidWlsZC0nICsgb3B0aW9ucy50eXBlO1xuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICkge1xuXHRpZiAoICEgZmlsZUNvbmZpZy5wYXRoIHx8ICEgZmlsZUNvbmZpZy5vdXRwdXQgKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0bGV0IGZpbGVQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5wYXRoICk7XG5cdGxldCBvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5vdXRwdXQgKTtcblx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2V0RmlsZU9wdGlvbnMoeyBleHRlbnNpb246IHBhdGguZXh0bmFtZSggZmlsZVBhdGggKSB9KTtcblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0aW5wdXQ6IGZpbGVQYXRoLFxuXHRcdGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKCBvdXRwdXRQYXRoICksXG5cdFx0b3V0cHV0OiBwYXRoLnBhcnNlKCBvdXRwdXRQYXRoICkuZGlyLFxuXHRcdHByb2plY3RCYXNlOiBiYXNlLFxuXHRcdHByb2plY3RDb25maWc6IGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGhcblx0fTtcblxuXHRpZiAoIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRmb3IgKCB2YXIgb3B0aW9uIGluIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRcdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgYXJncyA9IFtcblx0XHR0YXNrTmFtZSxcblx0XHQnLS1jd2QnLCBhcHAuZ2V0QXBwUGF0aCgpLFxuXHRcdCctLWd1bHBmaWxlJywgZ3VscEZpbGVQYXRoLFxuXHRcdCctLW5vLWNvbG9yJ1xuXHRdO1xuXG5cdGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWUgfHwgJ2ZpbGUnO1xuXG5cdGZvciAoIHZhciBvcHRpb24gaW4gb3B0aW9ucyApIHtcblx0XHRpZiAoICEgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiggb3B0aW9uc1sgb3B0aW9uIF0gKSAhPT0gJ2Jvb2xlYW4nICkge1xuXHRcdFx0YXJncy5wdXNoKCAnLS0nICsgb3B0aW9uICk7XG5cdFx0XHRhcmdzLnB1c2goIG9wdGlvbnNbIG9wdGlvbiBdICk7XG5cdFx0fSBlbHNlIGlmICggb3B0aW9uc1sgb3B0aW9uIF0gPT09IHRydWUgKSB7XG5cdFx0XHRhcmdzLnB1c2goICctLScgKyBvcHRpb24gKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBjcCA9IHNwYXduKCBndWxwUGF0aCwgYXJncyApO1xuXG5cdGNvbnNvbGUubG9nKCAnU3RhcnRlZCAlcyB3aXRoIFBJRCAlZCcsIHRhc2tOYW1lLCBjcC5waWQgKTtcblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCBjcCApO1xuXG5cdGNwLnN0ZG91dC5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcblx0XHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdFx0aWYgKCBkYXRhLm1hdGNoKC9GaW5pc2hlZCAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN1Y2Nlc3NmdWwuXG5cdFx0XHRsZXQgbm90aWZ5VGV4dCA9IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYDtcblxuXHRcdFx0bGV0IG5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblx0XHR9IGVsc2UgaWYgKCBkYXRhLm1hdGNoKC9TdGFydGluZyAnYnVpbGQtLionLykgKSB7XG5cdFx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2ZpbGVuYW1lfS4uLmAgKTtcblx0XHR9XG5cdH0pO1xuXG5cdGNwLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZGVyci5vbiggJ2RhdGEnLCBoYW5kbGVTdGRlcnIgKTtcblxuXHRjcC5vbiggJ2V4aXQnLCBjb2RlID0+IHtcblx0XHQvLyBSZW1vdmUgdGhpcyB0YXNrIGZyb20gZ2xvYmFsIGFycmF5LlxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzID0gZ2xvYmFsLmNvbXBpbGVyVGFza3MuZmlsdGVyKCBwcm9jID0+IHtcblx0XHRcdHJldHVybiAoIHByb2MucGlkICE9PSBjcC5waWQgKTtcblx0XHR9KTtcblxuXHRcdGlmICggY29kZSA9PT0gMCApIHtcblx0XHRcdC8vIFN1Y2Nlc3MuXG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHQvLyBcdHNpbGVudDogdHJ1ZVxuXHRcdFx0Ly8gfSk7XG5cdFx0fSBlbHNlIGlmICggY29kZSA9PT0gMSApIHtcblx0XHRcdC8vIFRlcm1pbmF0ZWQuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ1Byb2Nlc3MgJXMgdGVybWluYXRlZCcsIGNwLnBpZCApO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgKSB7XG5cdFx0XHQvLyBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0Ly8gXHRib2R5OiBgRXJyb3Igd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX0uYCxcblx0XHRcdC8vIFx0c291bmQ6ICdCYXNzbydcblx0XHRcdC8vIH0pO1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKGBFeGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7Y29kZX1gKTtcblx0XHR9XG5cblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soIGNvZGUgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggISB0cmltbWVkLmxlbmd0aCApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggdHJpbW1lZCA9PT0gJ0RldGFpbHM6JyApIHtcblx0XHRcdHN0YXJ0Q2FwdHVyZSA9IHRydWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXJ0Q2FwdHVyZSApIHtcblx0XHRcdGxldCBlcnJBcnIgPSB0cmltbWVkLnNwbGl0KCAvOlxccyguKykvICk7XG5cdFx0XHRlcnJPYmpbIGVyckFyclswXSBdID0gZXJyQXJyWzFdO1xuXG5cdFx0XHRpZiAoIGVyckFyclswXSA9PT0gJ2Zvcm1hdHRlZCcgKSB7XG5cdFx0XHRcdHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRpZiAoIE9iamVjdC5rZXlzKCBlcnJPYmogKS5sZW5ndGggKSB7XG5cdFx0Y29uc29sZS5lcnJvciggZXJyT2JqICk7XG5cblx0XHRnZXRFcnJMaW5lcyggZXJyT2JqLmZpbGUsIGVyck9iai5saW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGl0bGUgPSBlcnJPYmouZm9ybWF0dGVkLnJlcGxhY2UoIC9cXC4kLywgJycgKSArXG5cdFx0XHRcdCc8Y29kZT4nICtcblx0XHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHJldHVybiBlcnJPYmo7XG59XG5cbmZ1bmN0aW9uIGdldEVyckxpbmVzKCBmaWxlbmFtZSwgbGluZSwgY2FsbGJhY2sgKSB7XG5cdGxpbmUgPSBNYXRoLm1heCggcGFyc2VJbnQoIGxpbmUsIDEwICkgLSAxIHx8IDAsIDAgKTtcblxuXHRmcy5yZWFkRmlsZSggZmlsZW5hbWUsIGZ1bmN0aW9uKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbignXFxuJykgKS5zcGxpdCgnXFxuJyk7XG5cblx0XHRmb3IgKCB2YXIgaiA9IG1pbkxpbmU7IGogPD0gbWF4TGluZTsgaisrICkge1xuXHRcdFx0bGluZUFyci5wdXNoKFxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImxpbmUnICsgKCBsaW5lID09PSBqID8gJyBoaWdobGlnaHQnIDogJycgKSArICdcIj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCdcXG4nKSApO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHZpZXcgPSAoIGN1cnJlbnQgPSAnZmlsZXMnLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9WSUVXJzpcblx0XHRcdHJldHVybiBhY3Rpb24udmlldztcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdH1cbn07XG5cbmNvbnN0IHsgcHJvamVjdHMsIGFjdGl2ZVByb2plY3QsIGFjdGl2ZVByb2plY3RGaWxlcyB9ID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHZpZXcsXG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBQcm9qZWN0cyByZWR1Y2VyLlxuICovXG5cbmxldCBpbml0aWFsUHJvamVjdHMgPSBbXTtcblxuaWYgKCBnbG9iYWwuY29uZmlnLmhhcygncHJvamVjdHMnKSApIHtcblx0aW5pdGlhbFByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG59XG5cbmNvbnN0IHByb2plY3RzID0gKCBwcm9qZWN0cyA9IGluaXRpYWxQcm9qZWN0cywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRsZXQgbmV3UHJvamVjdHMgPSBbXG5cdFx0XHRcdC4uLnByb2plY3RzLFxuXHRcdFx0XHRhY3Rpb24ucGF5bG9hZFxuXHRcdFx0XTtcblxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIG5ld1Byb2plY3RzICk7XG5cblx0XHRcdHJldHVybiBuZXdQcm9qZWN0cztcblx0XHRjYXNlICdSRU1PVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMuZmlsdGVyKCAoIHByb2plY3QsIGluZGV4ICkgPT4gaW5kZXggIT09IGFjdGlvbi5pZCApO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHM7XG5cdH1cbn07XG5cbmxldCBpbml0aWFsQWN0aXZlID0ge1xuXHRpZDogbnVsbCxcblx0bmFtZTogJycsXG5cdHBhdGg6ICcnLFxuXHRwYXVzZWQ6IGZhbHNlXG59O1xuXG5pZiAoIGluaXRpYWxQcm9qZWN0cy5sZW5ndGggJiYgZ2xvYmFsLmNvbmZpZy5oYXMoJ2FjdGl2ZS1wcm9qZWN0JykgKSB7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggaW5pdGlhbFByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdGluaXRpYWxBY3RpdmUgPSBpbml0aWFsUHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0aW5pdGlhbEFjdGl2ZS5pZCA9IGFjdGl2ZUluZGV4O1xuXHR9XG59XG5cbmNvbnN0IGFjdGl2ZVByb2plY3QgPSAoIGFjdGl2ZSA9IGluaXRpYWxBY3RpdmUsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1BST0pFQ1QnOlxuXHRcdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGFjdGlvbi5wYXlsb2FkLmlkICk7XG5cblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRjYXNlICdTRVRfUFJPSkVDVF9TVEFURSc6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRcdC4uLmFjdGlvbi5wYXlsb2FkXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gYWN0aXZlO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0RmlsZXMgPSAoIGZpbGVzID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnUkVDRUlWRV9GSUxFUyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmaWxlcztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJvamVjdHMsXG5cdGFjdGl2ZVByb2plY3QsXG5cdGFjdGl2ZVByb2plY3RGaWxlc1xufTtcbiIsIi8qKlxuICogQGZpbGUgTG9nZ2VyIHV0aWxpdHkuXG4gKi9cblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNsYXNzIExvZ2dlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubG9ncyA9IFtdO1xuXHR9XG5cblx0bG9nKCB0eXBlLCB0aXRsZSwgYm9keSA9ICcnICkge1xuXHRcdHRoaXMubG9ncy5wdXNoKHtcblx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRib2R5OiBib2R5LFxuXHRcdFx0dGltZTogbW9tZW50KCkuZm9ybWF0KCdISDptbTpzcy5TU1MnKVxuXHRcdH0pO1xuXHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9sb2dzJykgKTtcblx0fVxuXG5cdGdldCggdHlwZSA9IG51bGwsIG9yZGVyID0gJ2Rlc2MnICkge1xuXHRcdGxldCBsb2dzO1xuXG5cdFx0aWYgKCAhIHR5cGUgKSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dzID0gdGhpcy5sb2dzLmZpbHRlciggbG9nID0+IHsgcmV0dXJuIGxvZy50eXBlID09PSB0eXBlIH0gKTtcblx0XHR9XG5cblx0XHRpZiAoIG9yZGVyID09PSAnZGVzYycgKSB7XG5cdFx0XHRsb2dzID0gbG9ncy5zbGljZSgpLnJldmVyc2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbG9ncztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dlcjtcbiIsIi8qKlxuICogQGZpbGUgV2FsayBhIGRpcmVjdG9yeSBhbmQgcmV0dXJuIGFuIG9iamVjdCBvZiBmaWxlcyBhbmQgc3ViZm9sZGVycy5cbiAqL1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuY29uc3QgZnMgPSBQcm9taXNlLnByb21pc2lmeUFsbCggcmVxdWlyZSgnZnMnKSApO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIGRpcmVjdG9yeVRyZWUoIHBhdGgsIG9wdGlvbnMgPSB7fSwgZGVwdGggPSAwICkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKSB7XG5cdFx0Ly8gSWYgbWF4IGRlcHRoIHdhcyByZWFjaGVkLCBiYWlsLlxuXHRcdGlmICggb3B0aW9ucy5kZXB0aCAmJiBkZXB0aCA+IG9wdGlvbnMuZGVwdGggKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmFtZSA9IGZzcGF0aC5iYXNlbmFtZSggcGF0aCApO1xuXHRcdGNvbnN0IGl0ZW0gPSB7IHBhdGgsIG5hbWUgfTtcblxuXHRcdGxldCBzdGF0cztcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXHRcdH0gY2F0Y2ggKCBlcnIgKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2tpcCBpZiBpdCBtYXRjaGVzIHRoZSBleGNsdWRlIHJlZ2V4LlxuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4Y2x1ZGUgJiYgKCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggcGF0aCApIHx8IG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBuYW1lICkgKSApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRpZiAoIHN0YXRzLmlzRmlsZSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2ZpbGUnO1xuXG5cdFx0XHRjb25zdCBleHQgPSBmc3BhdGguZXh0bmFtZSggcGF0aCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdC8vIFNraXAgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGV4dGVuc2lvbiByZWdleC5cblx0XHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4dGVuc2lvbnMgJiYgISBvcHRpb25zLmV4dGVuc2lvbnMudGVzdCggZXh0ICkgKSB7XG5cdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gc3RhdHMuc2l6ZTsgLy8gRmlsZSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aXRlbS5leHRlbnNpb24gPSBleHQ7XG5cblx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHR9IGVsc2UgaWYgKCBzdGF0cy5pc0RpcmVjdG9yeSgpICkge1xuXHRcdFx0aXRlbS50eXBlID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRcdGZzLnJlYWRkaXIoIHBhdGgsIGZ1bmN0aW9uKCBlcnIsIGZpbGVzICkge1xuXHRcdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0XHRpZiAoIGVyci5jb2RlID09PSAnRUFDQ0VTJyApIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9ucywgaWdub3JlIGRpcmVjdG9yeS5cblx0XHRcdFx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBbXTtcblxuXHRcdFx0XHRQcm9taXNlLm1hcCggZmlsZXMsIGZ1bmN0aW9uKCBmaWxlICkge1xuXHRcdFx0XHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBmc3BhdGguam9pbiggcGF0aCwgZmlsZSApLCBvcHRpb25zLCBkZXB0aCArIDEgKTtcblx0XHRcdFx0fSkudGhlbiggZnVuY3Rpb24oIGNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGl0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoIChlKSA9PiAhIWUgKTtcblx0XHRcdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IGl0ZW0uY2hpbGRyZW4ucmVkdWNlKCAoIHByZXYsIGN1ciApID0+IHtcblx0XHRcdC8vIFx0Y29uc29sZS5sb2coIHByZXYsIGN1ci5zaXplICk7XG5cdFx0XHQvLyBcdHJldHVybiBwcmV2ICsgY3VyLnNpemU7XG5cdFx0XHQvLyB9LCAwICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTsgLy8gT3Igc2V0IGl0ZW0uc2l6ZSA9IDAgZm9yIGRldmljZXMsIEZJRk8gYW5kIHNvY2tldHMgP1xuXHRcdH1cblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3J5VHJlZTtcbiIsIi8qKlxuICogQGZpbGUgR2xvYmFsIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBhcHAncyBVSS5cbiAqL1xuXG5mdW5jdGlvbiB1bmZvY3VzKCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICd1bmZvY3VzJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIGxvYWRpbmcoIHRvZ2dsZSA9IHRydWUsIGFyZ3MgPSB7fSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbG9hZGluZycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBvdmVybGF5KCB0b2dnbGUgPSB0cnVlICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvdmVybGF5JywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZvY3VzKCBlbGVtZW50LCBjbGFzc05hbWUsIHRyaWdnZXJFdmVudCA9IG51bGwsIGV4Y2x1ZGUgPSBudWxsICkge1xuXHRjb25zdCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICEgZWxlbWVudC5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRyZW1vdmVDbGlja0xpc3RlbmVyKCk7XG5cblx0XHRcdGlmICggISBleGNsdWRlIHx8ICEgZXhjbHVkZS5jb250YWlucyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG5cblx0XHRcdFx0aWYgKCB0cmlnZ2VyRXZlbnQgKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggdHJpZ2dlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCByZW1vdmVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR1bmZvY3VzLFxuXHRsb2FkaW5nLFxuXHRvdmVybGF5LFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnJywgZXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb24gKSB7XG5cdGxldCBiYXNlZGlyID0gcGF0aC5wYXJzZSggZmlsZS5wYXRoICkuZGlyO1xuXHRsZXQgZmlsZW5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSArIHN1ZmZpeCArIGV4dGVuc2lvbjtcblxuXHRyZXR1cm4gcGF0aC5qb2luKCBiYXNlZGlyLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBmaWxlUmVsYXRpdmVQYXRoKCBmcm9tLCB0byApIHtcblx0cmV0dXJuIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gKCBwYXRoLmlzQWJzb2x1dGUoIGZpbGVuYW1lICkgKSA/IGZpbGVuYW1lIDogcGF0aC5qb2luKCBiYXNlLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBkaXJBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gcGF0aC5wYXJzZSggZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSApLmRpcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aCxcblx0ZmlsZUFic29sdXRlUGF0aCxcblx0ZGlyQWJzb2x1dGVQYXRoXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBDb2xsZWN0aW9uIG9mIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gc2xlZXAobWlsbGlzZWNvbmRzKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCAxZTc7IGkrKyApIHtcblx0XHRpZiAoICggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCApID4gbWlsbGlzZWNvbmRzICkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0bGV0IHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRwcm9qZWN0c1sgYWN0aXZlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlnLicgKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xlZXAsXG5cdHNldFByb2plY3RDb25maWdcbn07XG4iXX0=
