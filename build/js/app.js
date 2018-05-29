(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

function setActiveFile(file) {
	return {
		type: 'SET_ACTIVE_FILE',
		payload: file
	};
}

module.exports = {
	changeView: changeView,
	addProject: addProject,
	changeProject: changeProject,
	removeProject: removeProject,
	setProjectState: setProjectState,
	receiveFiles: receiveFiles,
	setActiveFile: setActiveFile
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
// 	activeFile: null
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

},{"./components/App":3,"./gulp/interface":23,"./reducers":24,"./utils/globalUI":28,"./utils/utils":30,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],3:[function(require,module,exports){
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

var Settings = require('./projects/Settings');

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
					content = React.createElement(Settings, null);
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

},{"./Overlay":5,"./Sidebar":6,"./projects/Logs":11,"./projects/Projects":14,"./projects/Settings":15,"react":undefined,"react-redux":undefined}],4:[function(require,module,exports){
'use strict';

/**
 * @file Component for empty screen/no content.
 */

var React = require('react');

module.exports = function (props) {
	return React.createElement(
		'div',
		{ className: 'no-content' + (props.className ? ' ' + props.className : '') },
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

},{"../../utils/pathHelpers":29,"./Field":7,"electron":undefined,"prop-types":undefined,"react":undefined}],9:[function(require,module,exports){
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
					{ className: 'logs-screen' },
					React.createElement(
						'h3',
						null,
						'No logs yet.'
					),
					React.createElement(
						'p',
						null,
						'Go forth and compile!'
					)
				);
			}

			return React.createElement(
				'div',
				{ id: 'logs', className: 'logs-screen' },
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

var FileOptionsScript = require('./fileoptions/FileOptionsScript');

var FileOptionsStyle = require('./fileoptions/FileOptionsStyle');

var NoContent = require('../NoContent');

var Panel = function (_React$Component) {
	_inherits(Panel, _React$Component);

	function Panel() {
		_classCallCheck(this, Panel);

		return _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
	}

	_createClass(Panel, [{
		key: 'getOptions',
		value: function getOptions() {
			if (!this.props.activeFile.file.extension) {
				return null;
			}

			switch (this.props.activeFile.file.extension) {
				case '.css':
				case '.scss':
				case '.sass':
				case '.less':
					return React.createElement(FileOptionsStyle, { base: this.props.project.path, file: this.props.activeFile.file });
				case '.js':
				case '.ts':
				case '.jsx':
					return React.createElement(FileOptionsScript, { base: this.props.project.path, file: this.props.activeFile.file });
				default:
					return null;
			}
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			if (this.props.activeFile) {
				var options = this.getOptions();

				if (options) {
					this.props.activeFile.element.classList.add('has-options');

					return options;
				}
			}

			return React.createElement(
				NoContent,
				null,
				React.createElement(
					'p',
					null,
					'Select a stylesheet or script file to view compiling options.'
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
		activeFile: state.activeFile,
		project: state.activeProject,
		files: state.activeProjectFiles
	};
};

module.exports = connect(mapStateToProps, null)(Panel);

},{"../NoContent":4,"./fileoptions/FileOptionsScript":20,"./fileoptions/FileOptionsStyle":21,"react":undefined,"react-redux":undefined}],13:[function(require,module,exports){
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
			global.ui.unfocus(!this.state.isOpen);

			this.setState({ isOpen: !this.state.isOpen });
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

			this.toggleSelect();

			if (index === 'new') {
				this.props.newProject();
			} else {
				this.props.changeProject(index);
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

},{"../../actions":1,"../../utils/utils":30,"react":undefined,"react-redux":undefined}],14:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for the projects view.
 */

var fs = require('fs');

var fspath = require('path');

var _debounce = require('lodash/debounce');

var dialog = require('electron').remote.dialog;

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
		_this.removeProject = _this.removeProject.bind(_this);
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
			var active = {
				name: '',
				path: '',
				paused: true
			};

			if (this.props.projects[id]) {
				active = this.props.projects[id];
			}

			this.props.changeProject(_extends({}, active, {
				id: id
			}));

			this.setupProject(active.path);
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
			fs.open(path, 'r+', 438, function (err, stats) {
				if (err) {
					// Chosen directory not readable or no path provided.
					if (path) {
						window.alert('Could not read the ' + path + ' directory.');
					}

					global.projectConfig = null;

					global.store.dispatch(receiveFiles({}));

					global.compiler.killTasks();
				} else {
					// Directory is readable, get files and setup config.
					this.getFiles(path);

					this.setProjectConfigFile(path);

					// Change process cwd.
					process.chdir(path);

					this.initCompiler();
				}
			}.bind(this));

			global.logger = new Logger();
		}
	}, {
		key: 'renderProjectSelect',
		value: function renderProjectSelect() {
			return React.createElement(ProjectSelect, {
				newProject: this.newProject,
				setupProject: this.setupProject,
				changeProject: this.changeProject,
				removeProject: this.removeProject,
				refreshProject: this.refreshProject
			});
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
						{ className: 'large flat add-new-project', onClick: this.newProject },
						'Add Project'
					)
				);
			} else if (!this.props.active.name || !this.props.active.path) {
				// No project selected, show selector.
				return React.createElement(
					NoContent,
					{ className: 'project-select-screen' },
					this.renderProjectSelect()
				);
			}

			return React.createElement(
				'div',
				{ id: 'projects' },
				React.createElement(
					'div',
					{ id: 'header' },
					this.renderProjectSelect()
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

},{"../../actions":1,"../../utils/Logger":26,"../../utils/directoryTree":27,"../NoContent":4,"../ui/Notice":22,"./Panel":12,"./ProjectSelect":13,"./filelist/FileList":16,"electron":undefined,"electron-store":undefined,"fs":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for displaying the settings.
 */

var React = require('react');

var NoContent = require('../NoContent');

var Settings = function (_React$Component) {
	_inherits(Settings, _React$Component);

	function Settings() {
		_classCallCheck(this, Settings);

		return _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).apply(this, arguments));
	}

	_createClass(Settings, [{
		key: 'render',
		value: function render() {
			return React.createElement(
				NoContent,
				{ className: 'settings-screen' },
				React.createElement(
					'h3',
					null,
					'Settings'
				),
				React.createElement(
					'p',
					null,
					'Coming soon!'
				)
			);
		}
	}]);

	return Settings;
}(React.Component);

module.exports = Settings;

},{"../NoContent":4,"react":undefined}],16:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Component for rendering a directory tree.
 */

var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var _require2 = require('./FileListFile'),
    FileListFile = _require2.FileListFile,
    FileListPlaceholder = _require2.FileListPlaceholder;

var FileListDirectory = require('./FileListDirectory');

var _require3 = require('../../../actions'),
    _setActiveFile = _require3.setActiveFile;

var FileList = function (_React$Component) {
	_inherits(FileList, _React$Component);

	function FileList(props) {
		_classCallCheck(this, FileList);

		var _this = _possibleConstructorReturn(this, (FileList.__proto__ || Object.getPrototypeOf(FileList)).call(this, props));

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
		value: function setActiveFile(fileProps) {
			if (this.props.activeFile && this.props.activeFile.element === fileProps.element) {
				return;
			}

			if (fileProps.element) {
				fileProps.element.classList.add('active');
			}

			if (this.props.activeFile) {
				this.props.activeFile.element.classList.remove('active', 'has-options');
			}

			this.props.setActiveFile(fileProps);
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

var mapStateToProps = function mapStateToProps(state) {
	return {
		activeFile: state.activeFile
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		setActiveFile: function setActiveFile(payload) {
			return dispatch(_setActiveFile(payload));
		}
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(FileList);

},{"../../../actions":1,"./FileListDirectory":17,"./FileListFile":18,"react":undefined,"react-redux":undefined}],17:[function(require,module,exports){
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

},{"react":undefined}],18:[function(require,module,exports){
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
		key: 'onClick',
		value: function onClick(event) {
			event.stopPropagation();

			this.props.setActiveFile({
				file: this.props.file,
				element: event.currentTarget
			});
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

},{"electron":undefined,"react":undefined}],19:[function(require,module,exports){
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
					output: fileRelativePath(this.props.base, this.defaultOutputPath())
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

},{"../../../utils/pathHelpers":29,"react":undefined}],20:[function(require,module,exports){
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

},{"../../fields/FieldSaveFile":8,"../../fields/FieldSwitch":10,"./FileOptions":19,"react":undefined}],21:[function(require,module,exports){
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

var NoContent = require('../../NoContent');

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
					NoContent,
					null,
					React.createElement(
						'p',
						null,
						'This is a partial file,',
						React.createElement('br', null),
						' it cannot be compiled on its own.'
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

},{"../../NoContent":4,"../../fields/FieldSaveFile":8,"../../fields/FieldSelect":9,"../../fields/FieldSwitch":10,"./FileOptions":19,"react":undefined}],22:[function(require,module,exports){
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

},{"react":undefined}],23:[function(require,module,exports){
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

},{"../utils/pathHelpers":29,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined}],24:[function(require,module,exports){
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

var activeFile = function activeFile() {
	var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	var action = arguments[1];

	switch (action.type) {
		case 'SET_ACTIVE_FILE':
			return action.payload;
		default:
			return file;
	}
};

module.exports = combineReducers({
	view: view,
	projects: projects,
	activeProject: activeProject,
	activeProjectFiles: activeProjectFiles,
	activeFile: activeFile
});

},{"./projects":25,"redux":undefined}],25:[function(require,module,exports){
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

	var newProjects = void 0;

	switch (action.type) {
		case 'ADD_PROJECT':
			newProjects = [].concat(_toConsumableArray(projects), [action.payload]);

			global.config.set('projects', newProjects);

			return newProjects;
		case 'REMOVE_PROJECT':
			newProjects = projects.filter(function (project, index) {
				return index !== action.id;
			});

			global.config.set('projects', newProjects);

			return newProjects;
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

},{}],26:[function(require,module,exports){
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

},{"moment":undefined}],27:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{"path":undefined}],30:[function(require,module,exports){
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

function getDependencyArray(dependencyTree) {
	var dependencies = [];

	for (var dependency in dependencyTree) {
		dependencies.push(dependency);

		if (Object.keys(dependencyTree[dependency]).length > 0) {
			dependencies = dependencies.concat(getDependencyArray(dependencyTree[dependency]));
		}
	}

	return dependencies;
}

module.exports = {
	sleep: sleep,
	setProjectConfig: setProjectConfig,
	getDependencyArray: getDependencyArray
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsImFwcC9qcy9hcHAuanMiLCJhcHAvanMvY29tcG9uZW50cy9BcHAuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvTm9Db250ZW50LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvU2lkZWJhci5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFN3aXRjaC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1BhbmVsLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RTZWxlY3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvU2V0dGluZ3MuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvdWkvTm90aWNlLmpzeCIsImFwcC9qcy9ndWxwL2ludGVyZmFjZS5qcyIsImFwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsImFwcC9qcy9yZWR1Y2Vycy9wcm9qZWN0cy5qcyIsImFwcC9qcy91dGlscy9Mb2dnZXIuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGlscy9wYXRoSGVscGVycy5qcyIsImFwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQTs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsSUFBckIsRUFBNEI7QUFDM0IsUUFBTztBQUNOLFFBQU0sYUFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVEOztBQUVBLFNBQVMsVUFBVCxDQUFxQixPQUFyQixFQUErQjtBQUM5QixRQUFPO0FBQ04sUUFBTSxhQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsT0FBeEIsRUFBa0M7QUFDakMsUUFBTztBQUNOLFFBQU0sZ0JBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELFNBQVMsYUFBVCxDQUF3QixFQUF4QixFQUE2QjtBQUM1QixRQUFPO0FBQ04sUUFBTSxnQkFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVELFNBQVMsZUFBVCxDQUEwQixLQUExQixFQUFrQztBQUNqQyxRQUFPO0FBQ04sUUFBTSxtQkFEQTtBQUVOLFdBQVM7QUFGSCxFQUFQO0FBSUE7O0FBRUQ7O0FBRUEsU0FBUyxZQUFULENBQXVCLEtBQXZCLEVBQStCO0FBQzlCLFFBQU87QUFDTixRQUFNLGVBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELFNBQVMsYUFBVCxDQUF3QixJQUF4QixF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QWY7QUFDQTtBQUNEOztBQUVELFFBQU8sWUFBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQixtQ0FGZ0I7QUFHaEI7QUFIZ0IsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEBmaWxlIEFjdGlvbnMuXG4gKi9cblxuLy8gTWFpbi5cblxuZnVuY3Rpb24gY2hhbmdlVmlldyggdmlldyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1ZJRVcnLFxuXHRcdHZpZXdcblx0fTtcbn1cblxuLy8gUHJvamVjdHMuXG5cbmZ1bmN0aW9uIGFkZFByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0FERF9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIGNoYW5nZVByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb2plY3QoIGlkICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRU1PVkVfUFJPSkVDVCcsXG5cdFx0aWRcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX1BST0pFQ1RfU1RBVEUnLFxuXHRcdHBheWxvYWQ6IHN0YXRlXG5cdH07XG59XG5cbi8vIEZpbGVzLlxuXG5mdW5jdGlvbiByZWNlaXZlRmlsZXMoIGZpbGVzICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUNFSVZFX0ZJTEVTJyxcblx0XHRwYXlsb2FkOiBmaWxlc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRBY3RpdmVGaWxlKCBmaWxlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfQUNUSVZFX0ZJTEUnLFxuXHRcdHBheWxvYWQ6IGZpbGVcblx0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNoYW5nZVZpZXcsXG5cdGFkZFByb2plY3QsXG5cdGNoYW5nZVByb2plY3QsXG5cdHJlbW92ZVByb2plY3QsXG5cdHNldFByb2plY3RTdGF0ZSxcblx0cmVjZWl2ZUZpbGVzLFxuXHRzZXRBY3RpdmVGaWxlXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuL2d1bHAvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbi8vIGxldCBpbml0aWFsU3RhdGUgPSB7XG4vLyBcdHZpZXc6ICdmaWxlcycsXG4vLyBcdHByb2plY3RzOiB7fSxcbi8vIFx0YWN0aXZlUHJvamVjdDogMCxcbi8vIFx0YWN0aXZlUHJvamVjdEZpbGVzOiB7fSxcbi8vIFx0YWN0aXZlRmlsZTogbnVsbFxuLy8gfTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIgKTsgLy8gLCBpbml0aWFsU3RhdGUgKTtcblxuZ2xvYmFsLnN0b3JlID0gc3RvcmU7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKTtcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9eyBzdG9yZSB9PlxuXHRcdDxBcHAgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7XG5cbmNvbnN0IHsgc2xlZXAgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcblxuLy8gQXBwIGNsb3NlL3Jlc3RhcnQgZXZlbnRzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID4gMCApIHtcblx0XHRjb25zb2xlLmxvZyggJ0tpbGxpbmcgJWQgcnVubmluZyB0YXNrcy4uLicsIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXG5cdFx0c2xlZXAoIDMwMCApO1xuXHR9XG59KTtcbiIsIi8qKlxuICogQGZpbGUgTWFpbiBhcHAgY29tcG9uZW50LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XG5cbmNvbnN0IFNpZGViYXIgPSByZXF1aXJlKCcuL1NpZGViYXInKTtcblxuY29uc3QgTG9ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvTG9ncycpO1xuXG5jb25zdCBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvU2V0dGluZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMudmlld3MgPSB7XG5cdFx0XHRmaWxlczogJ0ZpbGVzJyxcblx0XHRcdGxvZ3M6ICdMb2dzJyxcblx0XHRcdHNldHRpbmdzOiAnU2V0dGluZ3MnXG5cdFx0fTtcblx0fVxuXG5cdHJlbmRlck92ZXJsYXkoKSB7XG5cdFx0Z2xvYmFsLnVpLm92ZXJsYXkoIHRoaXMucHJvcHMudmlldyAhPT0gJ2ZpbGVzJyApO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdmaWxlcycgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gPFNldHRpbmdzIC8+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8T3ZlcmxheSBoYXNDbG9zZT17IGZhbHNlIH0+XG5cdFx0XHRcdFx0eyBjb250ZW50IH1cblx0XHRcdFx0PC9PdmVybGF5PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2FwcCc+XG5cdFx0XHRcdDxTaWRlYmFyIGl0ZW1zPXsgdGhpcy52aWV3cyB9IC8+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudC13cmFwJz5cblx0XHRcdFx0XHQ8UHJvamVjdHMgLz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlck92ZXJsYXkoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHR2aWV3OiBzdGF0ZS52aWV3LFxuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBBcHAgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBlbXB0eSBzY3JlZW4vbm8gY29udGVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vLWNvbnRlbnQnICsgKCBwcm9wcy5jbGFzc05hbWUgPyAnICcgKyBwcm9wcy5jbGFzc05hbWUgOiAnJyApIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGFuIG92ZXJsYXkuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBPdmVybGF5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Ly8gY29uc3RydWN0b3IoKSB7fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nb3ZlcmxheSc+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5oYXNDbG9zZSAmJlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGlkPSdjbG9zZS1vdmVybGF5Jz4mdGltZXM7PC9hPlxuXHRcdFx0XHR9XG5cblx0XHRcdFx0PGRpdiBpZD0nb3ZlcmxheS1jb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7XG4iLCIvKipcbiAqIEBmaWxlIEFwcCBzaWRlYmFyLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjaGFuZ2VWaWV3IH0gPSByZXF1aXJlKCcuLi9hY3Rpb25zJyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY2xhc3MgU2lkZWJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHRsZXQgdmlldyA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC52aWV3O1xuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VWaWV3KCB2aWV3ICk7XG5cdH1cblxuXHRyZW5kZXJJdGVtcygpIHtcblx0XHRsZXQgaXRlbXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpZCBpbiB0aGlzLnByb3BzLml0ZW1zICkge1xuXHRcdFx0aXRlbXMucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdmlldz17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXRpcD17IHRoaXMucHJvcHMuaXRlbXNbIGlkIF0gfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMuYWN0aXZlID09PSBpZCA/ICdhY3RpdmUnIDogJycgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdHJldHVybiBpdGVtcztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PG5hdiBpZD0nc2lkZWJhcic+XG5cdFx0XHRcdDx1bCBpZD0nbWVudSc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckl0ZW1zKCkgfVxuXHRcdFx0XHQ8L3VsPlxuXHRcdFx0PC9uYXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlOiBzdGF0ZS52aWV3XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGNoYW5nZVZpZXc6IHZpZXcgPT4gZGlzcGF0Y2goIGNoYW5nZVZpZXcoIHZpZXcgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBTaWRlYmFyICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igd3JhcHBpbmcgYSBmaWVsZC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIEZpZWxkKCBwcm9wcyApIHtcblx0bGV0IGNsYXNzTmFtZSA9ICdmaWVsZCBmaWVsZC0nICsgcHJvcHMudHlwZSArICcgbGFiZWwtJyArICggcHJvcHMubGFiZWxQb3MgPyBwcm9wcy5sYWJlbFBvcyA6ICd0b3AnICk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0eyBwcm9wcy5sYWJlbCAmJlxuXHRcdFx0XHQ8c3Ryb25nIGNsYXNzTmFtZT0nZmllbGQtbGFiZWwnPnsgcHJvcHMubGFiZWwgfTwvc3Ryb25nPlxuXHRcdFx0fVxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkLWNvbnQnPlxuXHRcdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgc2F2ZSBmaWxlIGZpZWxkLlxuICovXG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNhdmVGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHBhdGg6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHBhdGggPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gJycgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBwYXRoIH07XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUucGF0aCAmJiB0aGlzLnByb3BzLnNvdXJjZUZpbGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSB0aGlzLnByb3BzLnNvdXJjZUZpbGUucGF0aDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCB0aGlzLnN0YXRlLnBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycyApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5maWx0ZXJzID0gdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZyggZmlsZVNhdmVPcHRpb25zICk7XG5cblx0XHRpZiAoIGZpbGVuYW1lICkge1xuXHRcdFx0bGV0IHNhdmVQYXRoID0gc2xhc2goIGZpbGVuYW1lICk7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0XHRzYXZlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIGZpbGVuYW1lICkgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7IHBhdGg6IHNhdmVQYXRoIH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHRoaXMucHJvcHMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHNhdmVQYXRoICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NhdmUtZmlsZScgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdHR5cGU9J3RleHQnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnBhdGggfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdC8+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHNlbGVjdGVkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IHNlbGVjdGVkID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/IGZhbHNlIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgc2VsZWN0ZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgc2VsZWN0ZWQ6IGV2ZW50LnRhcmdldC52YWx1ZSB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5zZWxlY3RlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMuc3RhdGUuc2VsZWN0ZWQgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGVkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXIgXSksXG5cdG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGNoZWNrZWQ6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9XG5cblx0XHR0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKCBuZXh0UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRsZXQgY2hlY2tlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IGNoZWNrZWQgfTtcblx0fVxuXG5cdG9uQ2hhbmdlKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgY2hlY2tlZDogISBwcmV2U3RhdGUuY2hlY2tlZCB9O1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCBldmVudCwgdGhpcy5zdGF0ZS5jaGVja2VkICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzd2l0Y2gnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdGNoZWNrZWQ9eyB0aGlzLnN0YXRlLmNoZWNrZWQgfVxuXHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5wcm9wcy5kaXNhYmxlZCB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxsYWJlbCBodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfT57IHRoaXMucHJvcHMubGFiZWwgfTwvbGFiZWw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTd2l0Y2gucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuYm9vbCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU3dpdGNoO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgbG9ncyBhbmQgaW5mb3JtYXRpb24uXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgTG9ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdGxldCB0eXBlID0gbnVsbDtcblx0XHRsZXQgbG9ncyA9ICggZ2xvYmFsLmxvZ2dlciApID8gZ2xvYmFsLmxvZ2dlci5nZXQoIHR5cGUgKSA6IFtdO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHR5cGUsXG5cdFx0XHRsb2dzXG5cdFx0fTtcblxuXHRcdHRoaXMucmVmcmVzaCA9IHRoaXMucmVmcmVzaC5iaW5kKCB0aGlzICk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9sb2dzJywgdGhpcy5yZWZyZXNoICk7XG5cdH1cblxuXHRyZWZyZXNoKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2dzOiBnbG9iYWwubG9nZ2VyLmdldCggdGhpcy5zdGF0ZS50eXBlICkgfSk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRsZXQgbG9nSW5kZXggPSAwO1xuXHRcdGxldCBsb2dMaXN0ID0gW107XG5cblx0XHRmb3IgKCB2YXIgbG9nIG9mIHRoaXMuc3RhdGUubG9ncyApIHtcblx0XHRcdGxldCB0aXRsZUhUTUwgPSB7IF9faHRtbDogbG9nLnRpdGxlIH07XG5cdFx0XHRsZXQgYm9keUhUTUwgPSAoIGxvZy5ib2R5ICkgPyB7IF9faHRtbDogbG9nLmJvZHkgfSA6IG51bGw7XG5cblx0XHRcdGxvZ0xpc3QucHVzaChcblx0XHRcdFx0PGxpXG5cdFx0XHRcdFx0a2V5PXsgbG9nSW5kZXggfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17ICd0eXBlLScgKyBsb2cudHlwZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPlxuXHRcdFx0XHRcdFx0PHNtYWxsPnsgbG9nLnRpbWUgfTwvc21hbGw+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3RpdGxlLXRleHQnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgdGl0bGVIVE1MIH0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7IGJvZHlIVE1MICYmXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZGV0YWlscycgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyBib2R5SFRNTCB9IC8+XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0KTtcblx0XHRcdGxvZ0luZGV4Kys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDx1bD57IGxvZ0xpc3QgfTwvdWw+O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmxvZ3MubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2xvZ3Mtc2NyZWVuJz5cblx0XHRcdFx0XHQ8aDM+Tm8gbG9ncyB5ZXQuPC9oMz5cblx0XHRcdFx0XHQ8cD5HbyBmb3J0aCBhbmQgY29tcGlsZSE8L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0nbG9ncycgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbic+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0cyBwYW5lbC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZU9wdGlvbnNTY3JpcHQgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGUgPSByZXF1aXJlKCcuL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Z2V0T3B0aW9ucygpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5wcm9qZWN0LnBhdGggfSBmaWxlPXsgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDb250ZW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcblxuXHRcdFx0aWYgKCBvcHRpb25zICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoYXMtb3B0aW9ucycpO1xuXG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHQ8cD5TZWxlY3QgYSBzdHlsZXNoZWV0IG9yIHNjcmlwdCBmaWxlIHRvIHZpZXcgY29tcGlsaW5nIG9wdGlvbnMuPC9wPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncGFuZWwnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ29udGVudCgpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGUsXG5cdHByb2plY3Q6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbnVsbCApKCBQYW5lbCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHRoZSBwcm9qZWN0IHNlbGVjdG9yLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IHNldFByb2plY3RTdGF0ZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IHNldFByb2plY3RDb25maWcgfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3V0aWxzJyk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMudG9nZ2xlUHJvamVjdCA9IHRoaXMudG9nZ2xlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHR0b2dnbGVTZWxlY3QoKSB7XG5cdFx0Z2xvYmFsLnVpLnVuZm9jdXMoICEgdGhpcy5zdGF0ZS5pc09wZW4gKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBpc09wZW46ICEgdGhpcy5zdGF0ZS5pc09wZW4gfSk7XG5cdH1cblxuXHR0b2dnbGVQcm9qZWN0KCkge1xuXHRcdGxldCBwYXVzZWQgPSAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCB8fCBmYWxzZTtcblxuXHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdFN0YXRlKHsgcGF1c2VkOiBwYXVzZWQgfSk7XG5cblx0XHRzZXRQcm9qZWN0Q29uZmlnKCAncGF1c2VkJywgcGF1c2VkICk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlckNob2ljZXMoKSB7XG5cdFx0bGV0IGNob2ljZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpbmRleCBpbiB0aGlzLnByb3BzLnByb2plY3RzICkge1xuXHRcdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0XHQ8ZGl2IGtleT17IGluZGV4IH0gZGF0YS1wcm9qZWN0PXsgaW5kZXggfSBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLnByb2plY3RzWyBpbmRleCBdLm5hbWUgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2hvaWNlcy5wdXNoKFxuXHRcdFx0PGRpdiBrZXk9J25ldycgZGF0YS1wcm9qZWN0PSduZXcnIG9uQ2xpY2s9eyB0aGlzLnNlbGVjdFByb2plY3QgfT5cblx0XHRcdFx0QWRkIG5ldyBwcm9qZWN0XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIGNob2ljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHRcdDxoMT5ObyBQcm9qZWN0IFNlbGVjdGVkPC9oMT5cblx0XHRcdFx0XHRcdDxoMj5DbGljayBoZXJlIHRvIHNlbGVjdCBvbmUuLi48L2gyPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdCcgY2xhc3NOYW1lPSdzZWxlY3RlZCc+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXsgdGhpcy50b2dnbGVTZWxlY3QgfT5cblx0XHRcdFx0XHQ8aDE+eyB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIH08L2gxPlxuXHRcdFx0XHRcdDxoMj57IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfTwvaDI+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGlvbnMnPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT17ICd0b2dnbGUnICsgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgPyAnIHBhdXNlZCcgOiAnIGFjdGl2ZScgKSB9IG9uQ2xpY2s9eyB0aGlzLnRvZ2dsZVByb2plY3QgfSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVmcmVzaCcgb25DbGljaz17IHRoaXMucHJvcHMucmVmcmVzaFByb2plY3QgfSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVtb3ZlJyBvbkNsaWNrPXsgdGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0IH0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9eyB0aGlzLnN0YXRlLmlzT3BlbiA/ICdvcGVuJyA6ICcnIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3Rcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0c2V0UHJvamVjdFN0YXRlOiBzdGF0ZSA9PiBkaXNwYXRjaCggc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIFByb2plY3RTZWxlY3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgdmlldy5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgX2RlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoL2RlYm91bmNlJyk7XG5cbmNvbnN0IHsgZGlhbG9nIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNvbnN0IE5vdGljZSA9IHJlcXVpcmUoJy4uL3VpL05vdGljZScpO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSgnLi9Qcm9qZWN0U2VsZWN0Jyk7XG5cbmNvbnN0IEZpbGVMaXN0ID0gcmVxdWlyZSgnLi9maWxlbGlzdC9GaWxlTGlzdCcpO1xuXG5jb25zdCBQYW5lbCA9IHJlcXVpcmUoJy4vUGFuZWwnKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RpcmVjdG9yeVRyZWUnKTtcblxuY29uc3QgTG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvTG9nZ2VyJyk7XG5cbmNvbnN0IHsgYWRkUHJvamVjdCwgcmVtb3ZlUHJvamVjdCwgY2hhbmdlUHJvamVjdCwgcmVjZWl2ZUZpbGVzIH0gPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zJyk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlnbm9yZWQ6IFtcblx0XHRcdFx0Jy5naXQnLFxuXHRcdFx0XHQnbm9kZV9tb2R1bGVzJyxcblx0XHRcdFx0Jy5EU19TdG9yZScsXG5cdFx0XHRcdCdidWlsZHItcHJvamVjdC5qc29uJ1xuXHRcdFx0XSxcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMubmV3UHJvamVjdCA9IHRoaXMubmV3UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXR1cFByb2plY3QgPSB0aGlzLnNldHVwUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0ID0gdGhpcy5jaGFuZ2VQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLnNldHVwUHJvamVjdCggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSggcHJldlByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0aWYgKCBwcmV2UHJvcHMuYWN0aXZlLnBhdXNlZCAhPT0gdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgYSBuZXcgcHJvamVjdC5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3QgYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHRcdC4uLm5ld1Byb2plY3QsXG5cdFx0XHRcdGlkOiB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aFxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFByb2plY3Qgc2V0dXAuXG5cdFx0XHR0aGlzLnNldHVwUHJvamVjdCggbmV3UHJvamVjdC5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2huYWdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0Y2hhbmdlUHJvamVjdCggaWQgKSB7XG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnByb2plY3RzWyBpZCBdICkge1xuXHRcdFx0YWN0aXZlID0gdGhpcy5wcm9wcy5wcm9qZWN0c1sgaWQgXTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVByb2plY3Qoe1xuXHRcdFx0Li4uYWN0aXZlLFxuXHRcdFx0aWRcblx0XHR9KTtcblxuXHRcdHRoaXMuc2V0dXBQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3RoaXMucHJvcHMuYWN0aXZlLm5hbWV9P2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCggdGhpcy5wcm9wcy5hY3RpdmUuaWQgKTtcblxuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBudWxsICk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdENvbXBpbGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgKSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIuaW5pdFByb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmtpbGxUYXNrcygpO1xuXHRcdH1cblx0fVxuXG5cdHJlZnJlc2hQcm9qZWN0KCkge1xuXHRcdHRoaXMuZ2V0RmlsZXMoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblx0fVxuXG5cdHNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdidWlsZHItcHJvamVjdCcsXG5cdFx0XHRjd2Q6IHBhdGhcblx0XHR9KTtcblxuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnLm9uRGlkQ2hhbmdlKCAnZmlsZXMnLCBfZGVib3VuY2UoIHRoaXMuaW5pdENvbXBpbGVyLCAxMDAgKSApO1xuXHR9XG5cblx0Z2V0RmlsZXMoIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwudWkubG9hZGluZygpO1xuXG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdGRpcmVjdG9yeVRyZWUoIHBhdGgsIHtcblx0XHRcdC8vIGRlcHRoOiAyLFxuXHRcdFx0ZXhjbHVkZVxuXHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGdsb2JhbC5zdG9yZS5kaXNwYXRjaCggcmVjZWl2ZUZpbGVzKCBmaWxlcyApICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLnVpLmxvYWRpbmcoIGZhbHNlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0c2V0dXBQcm9qZWN0KCBwYXRoICkge1xuXHRcdGZzLm9wZW4oIHBhdGgsICdyKycsIDBvNjY2LCBmdW5jdGlvbiggZXJyLCBzdGF0cyApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHQvLyBDaG9zZW4gZGlyZWN0b3J5IG5vdCByZWFkYWJsZSBvciBubyBwYXRoIHByb3ZpZGVkLlxuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LmAgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbnVsbDtcblxuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcygge30gKSApO1xuXG5cdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERpcmVjdG9yeSBpcyByZWFkYWJsZSwgZ2V0IGZpbGVzIGFuZCBzZXR1cCBjb25maWcuXG5cdFx0XHRcdHRoaXMuZ2V0RmlsZXMoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLnNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICk7XG5cblx0XHRcdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdFx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHRcdH1cblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdHNldHVwUHJvamVjdD17IHRoaXMuc2V0dXBQcm9qZWN0IH1cblx0XHRcdFx0Y2hhbmdlUHJvamVjdD17IHRoaXMuY2hhbmdlUHJvamVjdCB9XG5cdFx0XHRcdHJlbW92ZVByb2plY3Q9eyB0aGlzLnJlbW92ZVByb2plY3QgfVxuXHRcdFx0XHRyZWZyZXNoUHJvamVjdD17IHRoaXMucmVmcmVzaFByb2plY3QgfVxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyTm90aWNlcygpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb3RpY2UgdHlwZT0nd2FybmluZyc+XG5cdFx0XHRcdFx0PHA+UHJvamVjdCBpcyBwYXVzZWQuIEZpbGVzIHdpbGwgbm90IGJlIHdhdGNoZWQgYW5kIGF1dG8gY29tcGlsZWQuPC9wPlxuXHRcdFx0XHQ8L05vdGljZT5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLnByb2plY3RzIHx8IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdHMgeWV0LCBzaG93IHdlbGNvbWUgc2NyZWVuLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3dlbGNvbWUtc2NyZWVuJz5cblx0XHRcdFx0XHQ8aDM+WW91IGRvbid0IGhhdmUgYW55IHByb2plY3RzIHlldC48L2gzPlxuXHRcdFx0XHRcdDxwPldvdWxkIHlvdSBsaWtlIHRvIGFkZCBvbmUgbm93PzwvcD5cblx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzTmFtZT0nbGFyZ2UgZmxhdCBhZGQtbmV3LXByb2plY3QnIG9uQ2xpY2s9eyB0aGlzLm5ld1Byb2plY3QgfT5BZGQgUHJvamVjdDwvYnV0dG9uPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdC8vIE5vIHByb2plY3Qgc2VsZWN0ZWQsIHNob3cgc2VsZWN0b3IuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0ncHJvamVjdC1zZWxlY3Qtc2NyZWVuJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0cyc+XG5cdFx0XHRcdDxkaXYgaWQ9J2hlYWRlcic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJOb3RpY2VzKCkgfVxuXG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMucHJvcHMuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PFBhbmVsIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRwcm9qZWN0czogc3RhdGUucHJvamVjdHMsXG5cdGFjdGl2ZTogc3RhdGUuYWN0aXZlUHJvamVjdCxcblx0ZmlsZXM6IHN0YXRlLmFjdGl2ZVByb2plY3RGaWxlc1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRhZGRQcm9qZWN0OiBwYXlsb2FkID0+IGRpc3BhdGNoKCBhZGRQcm9qZWN0KCBwYXlsb2FkICkgKSxcblx0Y2hhbmdlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIGNoYW5nZVByb2plY3QoIGlkICkgKSxcblx0cmVtb3ZlUHJvamVjdDogaWQgPT4gZGlzcGF0Y2goIHJlbW92ZVByb2plY3QoIGlkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMz5TZXR0aW5nczwvaDM+XG5cdFx0XHRcdDxwPkNvbWluZyBzb29uITwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBGaWxlTGlzdEZpbGUsIEZpbGVMaXN0UGxhY2Vob2xkZXIgfSA9IHJlcXVpcmUoJy4vRmlsZUxpc3RGaWxlJyk7XG5cbmNvbnN0IEZpbGVMaXN0RGlyZWN0b3J5ID0gcmVxdWlyZSgnLi9GaWxlTGlzdERpcmVjdG9yeScpO1xuXG5jb25zdCB7IHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSAmJiB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudCA9PT0gZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdGZpbGVQcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJywgJ2hhcy1vcHRpb25zJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZpbGVMaXN0UGxhY2Vob2xkZXIgdHlwZT0nZW1wdHknPlxuXHRcdFx0XHRcdE5vdGhpbmcgdG8gc2VlIGhlcmUuXG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZWxpc3Q7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyVHJlZSgpIH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZVxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRBY3RpdmVGaWxlOiBwYXlsb2FkID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBwYXlsb2FkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggRmlsZUxpc3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCB7IHJlbW90ZSwgc2hlbGwgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmNvbnN0IHsgTWVudSwgTWVudUl0ZW0gfSA9IHJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSh7XG5cdFx0XHRmaWxlOiB0aGlzLnByb3BzLmZpbGUsXG5cdFx0XHRlbGVtZW50OiBldmVudC5jdXJyZW50VGFyZ2V0XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBGaWxlTGlzdFBsYWNlaG9sZGVyKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8bGkgY2xhc3NOYW1lPXsgcHJvcHMudHlwZSArICcgaW5mb3JtYXRpdmUnIH0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naW5uZXInPnsgcHJvcHMuY2hpbGRyZW4gfTwvZGl2PlxuXHRcdDwvbGk+XG5cdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRGaWxlTGlzdEZpbGUsXG5cdEZpbGVMaXN0UGxhY2Vob2xkZXJcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXRPdXRwdXRQYXRoID0gdGhpcy5zZXRPdXRwdXRQYXRoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBmYWxzZSApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICkge1xuXHRcdFx0XHRmaWxlQ29uZmlnWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRmaWxlcy5wdXNoKCBmaWxlQ29uZmlnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcblx0XHRcdFx0ZGVsZXRlIGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9ucyAmJiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXG5cdHNldE9wdGlvbiggb3B0aW9uLCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSBwcmV2U3RhdGUub3B0aW9ucyB8fCB7fTtcblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHRcdHJldHVybiB7IG9wdGlvbnMgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3B0aW9ucycsIHRoaXMuc3RhdGUub3B0aW9ucyApO1xuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRPcHRpb24oIGV2ZW50LnRhcmdldC5uYW1lLCB2YWx1ZSApO1xuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0cmV0dXJuIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHRoaXMub3V0cHV0U3VmZml4LCB0aGlzLm91dHB1dEV4dGVuc2lvbiApO1xuXHR9XG5cblx0c2V0T3V0cHV0UGF0aCggZXZlbnQsIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRDb25maWcoICdvdXRwdXQnLCBwYXRoICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0ZnVuY3Rpb24oIGNvZGUgKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5zZXRPdXRwdXRQYXRoIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYnVuZGxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nY29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQ29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2NvbXByZXNzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc291cmNlTWFwc0Rpc2FibGVkKCkgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSw8YnIgLz4gaXQgY2Fubm90IGJlIGNvbXBpbGVkIG9uIGl0cyBvd24uPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHNob3dpbmcgbm90aWNlcyBhbmQgYWxlcnRzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgTm90aWNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdGxldCB0eXBlID0gdGhpcy5wcm9wcy50eXBlIHx8ICdpbmZvJztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17ICdub3RpY2UgdHlwZS0nICsgdHlwZSB9PlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGljZTtcbiIsIi8qKlxuKiBAZmlsZSBHdWxwIHNjcmlwdHMgYW5kIHRhc2tzLlxuKi9cblxuLyogZ2xvYmFsIE5vdGlmaWNhdGlvbiAqL1xuXG5jb25zdCB7IGFwcCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bjtcbmNvbnN0IHBzVHJlZSA9IHJlcXVpcmUoJ3BzLXRyZWUnKTtcblxuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcblxuY29uc3QgT1NDbWQgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJy5jbWQnIDogJyc7XG5jb25zdCBndWxwUGF0aCA9IHBhdGguam9pbiggX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJy5iaW4nLCAnZ3VscCcgKyBPU0NtZCApO1xuY29uc3QgZ3VscEZpbGVQYXRoID0gcGF0aC5qb2luKCBfX2Rpcm5hbWUsICcuLicsICdhcHAnLCAnanMnLCAnZ3VscCcsICdndWxwZmlsZS5qcycgKTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgcGlkIG9mIFsgcHJvYy5waWQgXS5jb25jYXQoIGNoaWxkcmVuLm1hcCggY2hpbGQgPT4gY2hpbGQuUElEICkgKSApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHByb2Nlc3Mua2lsbCggcGlkICk7XG5cdFx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5IGxvbCBZT0xPXG5cdFx0XHRcdC8vIGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZSxcblx0XHRwcm9qZWN0Q29uZmlnOiBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IGZpbGVDb25maWcub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0XHRvcHRpb25zLndhdGNoVGFzayA9IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zID0ge30sIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IGFyZ3MgPSBbXG5cdFx0dGFza05hbWUsXG5cdFx0Jy0tY3dkJywgYXBwLmdldEFwcFBhdGgoKSxcblx0XHQnLS1ndWxwZmlsZScsIGd1bHBGaWxlUGF0aCxcblx0XHQnLS1uby1jb2xvcidcblx0XTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8ICdmaWxlJztcblxuXHRmb3IgKCB2YXIgb3B0aW9uIGluIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCAhIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2YoIG9wdGlvbnNbIG9wdGlvbiBdICkgIT09ICdib29sZWFuJyApIHtcblx0XHRcdGFyZ3MucHVzaCggJy0tJyArIG9wdGlvbiApO1xuXHRcdFx0YXJncy5wdXNoKCBvcHRpb25zWyBvcHRpb24gXSApO1xuXHRcdH0gZWxzZSBpZiAoIG9wdGlvbnNbIG9wdGlvbiBdID09PSB0cnVlICkge1xuXHRcdFx0YXJncy5wdXNoKCAnLS0nICsgb3B0aW9uICk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgY3AgPSBzcGF3biggZ3VscFBhdGgsIGFyZ3MgKTtcblxuXHRjb25zb2xlLmxvZyggJ1N0YXJ0ZWQgJXMgd2l0aCBQSUQgJWQnLCB0YXNrTmFtZSwgY3AucGlkICk7XG5cblx0Z2xvYmFsLmNvbXBpbGVyVGFza3MucHVzaCggY3AgKTtcblxuXHRjcC5zdGRvdXQuc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcblxuXHRjcC5zdGRvdXQub24oICdkYXRhJywgZGF0YSA9PiB7XG5cdFx0Y29uc29sZS5sb2coIGRhdGEgKTtcblxuXHRcdGlmICggZGF0YS5tYXRjaCgvRmluaXNoZWQgJ2J1aWxkLS4qJy8pICkge1xuXHRcdFx0Ly8gQnVpbGQgdGFzayBzdWNjZXNzZnVsLlxuXHRcdFx0bGV0IG5vdGlmeVRleHQgPSBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmA7XG5cblx0XHRcdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQnVpbGRyJywge1xuXHRcdFx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ3N1Y2Nlc3MnLCBub3RpZnlUZXh0ICk7XG5cdFx0fSBlbHNlIGlmICggZGF0YS5tYXRjaCgvU3RhcnRpbmcgJ2J1aWxkLS4qJy8pICkge1xuXHRcdFx0Ly8gQnVpbGQgdGFzayBzdGFydGluZy5cblx0XHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnaW5mbycsIGBDb21waWxpbmcgJHtmaWxlbmFtZX0uLi5gICk7XG5cdFx0fVxuXHR9KTtcblxuXHRjcC5zdGRlcnIuc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcblxuXHRjcC5zdGRlcnIub24oICdkYXRhJywgaGFuZGxlU3RkZXJyICk7XG5cblx0Y3Aub24oICdleGl0JywgY29kZSA9PiB7XG5cdFx0Ly8gUmVtb3ZlIHRoaXMgdGFzayBmcm9tIGdsb2JhbCBhcnJheS5cblx0XHRnbG9iYWwuY29tcGlsZXJUYXNrcyA9IGdsb2JhbC5jb21waWxlclRhc2tzLmZpbHRlciggcHJvYyA9PiB7XG5cdFx0XHRyZXR1cm4gKCBwcm9jLnBpZCAhPT0gY3AucGlkICk7XG5cdFx0fSk7XG5cblx0XHRpZiAoIGNvZGUgPT09IDAgKSB7XG5cdFx0XHQvLyBTdWNjZXNzLlxuXHRcdFx0Ly8gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRcdC8vIFx0Ym9keTogYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gLFxuXHRcdFx0Ly8gXHRzaWxlbnQ6IHRydWVcblx0XHRcdC8vIH0pO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgPT09IDEgKSB7XG5cdFx0XHQvLyBUZXJtaW5hdGVkLlxuXHRcdFx0Ly8gY29uc29sZS5sb2coICdQcm9jZXNzICVzIHRlcm1pbmF0ZWQnLCBjcC5waWQgKTtcblx0XHR9IGVsc2UgaWYgKCBjb2RlICkge1xuXHRcdFx0Ly8gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRcdC8vIFx0Ym9keTogYEVycm9yIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHQvLyBcdHNvdW5kOiAnQmFzc28nXG5cdFx0XHQvLyB9KTtcblxuXHRcdFx0Y29uc29sZS5lcnJvcihgRXhpdGVkIHdpdGggZXJyb3IgY29kZSAke2NvZGV9YCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCBjb2RlICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU3RkZXJyKCBkYXRhICkge1xuXHRsZXQgZXJyT2JqID0ge307XG5cdGxldCBzdGFydENhcHR1cmUgPSBmYWxzZTtcblxuXHR2YXIgbGluZXMgPSBkYXRhLnNwbGl0KCAvKFxcclxcbnxbXFxuXFx2XFxmXFxyXFx4ODVcXHUyMDI4XFx1MjAyOV0pLyApO1xuXG5cdGZvciAoIHZhciBsaW5lIG9mIGxpbmVzICkge1xuXHRcdGxldCB0cmltbWVkID0gbGluZS50cmltKCk7XG5cblx0XHRpZiAoICEgdHJpbW1lZC5sZW5ndGggKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRyaW1tZWQgPT09ICdEZXRhaWxzOicgKSB7XG5cdFx0XHRzdGFydENhcHR1cmUgPSB0cnVlO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGFydENhcHR1cmUgKSB7XG5cdFx0XHRsZXQgZXJyQXJyID0gdHJpbW1lZC5zcGxpdCggLzpcXHMoLispLyApO1xuXHRcdFx0ZXJyT2JqWyBlcnJBcnJbMF0gXSA9IGVyckFyclsxXTtcblxuXHRcdFx0aWYgKCBlcnJBcnJbMF0gPT09ICdmb3JtYXR0ZWQnICkge1xuXHRcdFx0XHRzdGFydENhcHR1cmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0aWYgKCBPYmplY3Qua2V5cyggZXJyT2JqICkubGVuZ3RoICkge1xuXHRcdGNvbnNvbGUuZXJyb3IoIGVyck9iaiApO1xuXG5cdFx0Z2V0RXJyTGluZXMoIGVyck9iai5maWxlLCBlcnJPYmoubGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHRpdGxlID0gZXJyT2JqLmZvcm1hdHRlZC5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0XHQnPGNvZGU+JyArXG5cdFx0XHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGVyck9iai5maWxlICkgKSArXG5cdFx0XHRcdFx0JyBvbiBsaW5lICcgKyBlcnJPYmoubGluZSArXG5cdFx0XHRcdCc8L2NvZGU+JztcblxuXHRcdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyByZXR1cm4gZXJyT2JqO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJMaW5lcyggZmlsZW5hbWUsIGxpbmUsIGNhbGxiYWNrICkge1xuXHRsaW5lID0gTWF0aC5tYXgoIHBhcnNlSW50KCBsaW5lLCAxMCApIC0gMSB8fCAwLCAwICk7XG5cblx0ZnMucmVhZEZpbGUoIGZpbGVuYW1lLCBmdW5jdGlvbiggZXJyLCBkYXRhICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdHZhciBsaW5lcyA9IGRhdGEudG9TdHJpbmcoJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuXG5cdFx0aWYgKCArbGluZSA+IGxpbmVzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgbGluZUFyciA9IFtdO1xuXHRcdGxldCBfbGluZUFyciA9IFtdO1xuXHRcdGxldCBtaW5MaW5lID0gTWF0aC5tYXgoIGxpbmUgLSAyLCAwICk7XG5cdFx0bGV0IG1heExpbmUgPSBNYXRoLm1pbiggbGluZSArIDIsIGxpbmVzLmxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSBtaW5MaW5lOyBpIDw9IG1heExpbmU7IGkrKyApIHtcblx0XHRcdF9saW5lQXJyWyBpIF0gPSBsaW5lc1sgaSBdO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleHRyYW5lb3VzIGluZGVudGF0aW9uLlxuXHRcdGxldCBzdHJpcHBlZExpbmVzID0gc3RyaXBJbmRlbnQoIF9saW5lQXJyLmpvaW4oJ1xcbicpICkuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Zm9yICggdmFyIGogPSBtaW5MaW5lOyBqIDw9IG1heExpbmU7IGorKyApIHtcblx0XHRcdGxpbmVBcnIucHVzaChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJsaW5lJyArICggbGluZSA9PT0gaiA/ICcgaGlnaGxpZ2h0JyA6ICcnICkgKyAnXCI+JyArXG5cdFx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1udW1iZXJcIj4nICsgKCBqICsgMSApICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLWNvbnRlbnRcIj4nICsgc3RyaXBwZWRMaW5lc1sgaiBdICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2soIG51bGwsIGxpbmVBcnIuam9pbignXFxuJykgKTtcblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0UHJvamVjdCxcblx0cnVuVGFzayxcblx0a2lsbFRhc2tzLFxuXHRwcm9jZXNzRmlsZSxcblx0Z2V0RmlsZUNvbmZpZyxcblx0Z2V0RmlsZU9wdGlvbnMsXG5cdHRlcm1pbmF0ZVByb2Nlc3Ncbn1cbiIsIi8qKlxuICogQGZpbGUgUm9vdCByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHsgY29tYmluZVJlZHVjZXJzIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCB2aWV3ID0gKCBjdXJyZW50ID0gJ2ZpbGVzJywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfVklFVyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnZpZXc7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBjdXJyZW50O1xuXHR9XG59O1xuXG5jb25zdCB7IHByb2plY3RzLCBhY3RpdmVQcm9qZWN0LCBhY3RpdmVQcm9qZWN0RmlsZXMgfSA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuY29uc3QgYWN0aXZlRmlsZSA9ICggZmlsZSA9IG51bGwsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnU0VUX0FDVElWRV9GSUxFJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuXHR2aWV3LFxuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzLFxuXHRhY3RpdmVGaWxlXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5sZXQgaW5pdGlhbFByb2plY3RzID0gW107XG5cbmlmICggZ2xvYmFsLmNvbmZpZy5oYXMoJ3Byb2plY3RzJykgKSB7XG5cdGluaXRpYWxQcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xufVxuXG5jb25zdCBwcm9qZWN0cyA9ICggcHJvamVjdHMgPSBpbml0aWFsUHJvamVjdHMsIGFjdGlvbiApID0+IHtcblx0bGV0IG5ld1Byb2plY3RzO1xuXG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0FERF9QUk9KRUNUJzpcblx0XHRcdG5ld1Byb2plY3RzID0gW1xuXHRcdFx0XHQuLi5wcm9qZWN0cyxcblx0XHRcdFx0YWN0aW9uLnBheWxvYWRcblx0XHRcdF07XG5cblx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBuZXdQcm9qZWN0cyApO1xuXG5cdFx0XHRyZXR1cm4gbmV3UHJvamVjdHM7XG5cdFx0Y2FzZSAnUkVNT1ZFX1BST0pFQ1QnOlxuXHRcdFx0bmV3UHJvamVjdHMgPSBwcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gYWN0aW9uLmlkICk7XG5cblx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBuZXdQcm9qZWN0cyApO1xuXG5cdFx0XHRyZXR1cm4gbmV3UHJvamVjdHM7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9qZWN0cztcblx0fVxufTtcblxubGV0IGluaXRpYWxBY3RpdmUgPSB7XG5cdGlkOiBudWxsLFxuXHRuYW1lOiAnJyxcblx0cGF0aDogJycsXG5cdHBhdXNlZDogZmFsc2Vcbn07XG5cbmlmICggaW5pdGlhbFByb2plY3RzLmxlbmd0aCAmJiBnbG9iYWwuY29uZmlnLmhhcygnYWN0aXZlLXByb2plY3QnKSApIHtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBpbml0aWFsUHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0aW5pdGlhbEFjdGl2ZSA9IGluaXRpYWxQcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRpbml0aWFsQWN0aXZlLmlkID0gYWN0aXZlSW5kZXg7XG5cdH1cbn1cblxuY29uc3QgYWN0aXZlUHJvamVjdCA9ICggYWN0aXZlID0gaW5pdGlhbEFjdGl2ZSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfUFJPSkVDVCc6XG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgYWN0aW9uLnBheWxvYWQuaWQgKTtcblxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGNhc2UgJ1NFVF9QUk9KRUNUX1NUQVRFJzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0Li4uYWN0aW9uLnBheWxvYWRcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBhY3RpdmU7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3RGaWxlcyA9ICggZmlsZXMgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdSRUNFSVZFX0ZJTEVTJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGVzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG92ZXJsYXksXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRsZXQgcHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdHByb2plY3RzWyBhY3RpdmVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWcuJyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUgKSB7XG5cdGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcblxuXHRmb3IgKCB2YXIgZGVwZW5kZW5jeSBpbiBkZXBlbmRlbmN5VHJlZSApIHtcblx0XHRkZXBlbmRlbmNpZXMucHVzaCggZGVwZW5kZW5jeSApO1xuXG5cdFx0aWYgKCBPYmplY3Qua2V5cyggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMuY29uY2F0KCBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKSApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkZXBlbmRlbmNpZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGVlcCxcblx0c2V0UHJvamVjdENvbmZpZyxcblx0Z2V0RGVwZW5kZW5jeUFycmF5XG59O1xuIl19
