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

global.compiler = require('../js/gulp/interface');

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

},{"../js/gulp/interface":23,"./components/App":3,"./reducers":24,"./utils/globalUI":28,"./utils/utils":30,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],3:[function(require,module,exports){
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
					type: 'hidden',
					name: this.props.name,
					id: 'field_' + this.props.name,
					value: this.state.path,
					readOnly: 'true'
				}),
				React.createElement(
					'small',
					{ onClick: this.onClick },
					this.state.path
				)
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
					{ className: 'logs-screen empty' },
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    receiveFiles = _require2.receiveFiles,
    _setActiveFile = _require2.setActiveFile;

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
		_this.initProject = _this.initProject.bind(_this);
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
				this.initProject(this.props.active.path);
			}
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps, prevState) {
			if (prevProps.active.path === this.props.active.path && prevProps.active.paused !== this.props.active.paused) {
				// Project was paused/unpaused, trigger compiler tasks or terminate them.
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
				var newProjectIndex = this.props.projects.length;

				if (this.props.projects.findIndex(function (project) {
					return project.path === newProject.path;
				}) !== -1) {
					// Project already exists.
					return;
				}

				// Save new project to config.
				global.config.set('projects', [].concat(_toConsumableArray(this.props.projects), [newProject]));

				// Update state.
				this.props.addProject(newProject);

				// Set new project as active.
				this.changeProject(newProjectIndex, newProject);
			}
		}

		// Change the active project.

	}, {
		key: 'changeProject',
		value: function changeProject(id) {
			var project = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (id === this.props.active.id) {
				return;
			}

			var active = {
				name: '',
				path: '',
				paused: true
			};

			if (this.props.projects[id]) {
				active = this.props.projects[id];
			} else if (project) {
				active = project;
			}

			// Update config.
			global.config.set('active-project', id);

			// Update state.
			this.props.changeProject(_extends({}, active, {
				id: id
			}));
			this.props.setActiveFile(null);

			// Init.
			this.initProject(active.path);
		}

		// Remove the current project.

	}, {
		key: 'removeProject',
		value: function removeProject(event) {
			event.preventDefault();

			var confirmRemove = window.confirm('Are you sure you want to remove ' + this.props.active.name + '?');

			if (confirmRemove) {
				var removeIndex = parseInt(this.props.active.id, 10);

				var projects = this.props.projects.filter(function (project, index) {
					return index !== removeIndex;
				});

				// Remove project from config.
				global.config.set('projects', projects);

				// Update state.
				this.props.removeProject(removeIndex);

				// Unset active project.
				this.changeProject(null);
			}
		}

		// Start the background compiler tasks.

	}, {
		key: 'initCompiler',
		value: function initCompiler() {
			if (!this.props.active.paused) {
				global.compiler.initProject();
			} else {
				global.compiler.killTasks();
			}
		}

		// Refresh the project files.

	}, {
		key: 'refreshProject',
		value: function refreshProject() {
			this.getFiles(this.props.active.path);
		}

		// Create or fetch the project config file.

	}, {
		key: 'setProjectConfigFile',
		value: function setProjectConfigFile(path) {
			global.projectConfig = new Store({
				name: 'buildr-project',
				cwd: path
			});

			// Listen for changes to the project's file options and trigger the compiler init.
			global.projectConfig.onDidChange('files', _debounce(this.initCompiler, 100));
		}

		// Read the files in the project directory.

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

		// Initialize project.

	}, {
		key: 'initProject',
		value: function initProject(path) {
			fs.access(path, fs.constants.W_OK, function (err) {
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
				changeProject: this.changeProject,
				removeProject: this.removeProject,
				refreshProject: this.refreshProject
			});
		}
	}, {
		key: 'renderNotices',
		value: function renderNotices() {
			var notices = [];

			if (this.props.active.paused) {
				notices.push(React.createElement(
					Notice,
					{ key: 'paused', type: 'warning' },
					React.createElement(
						'p',
						null,
						'Project is paused. Files will not be watched and auto compiled.'
					)
				));
			}

			return notices;
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
		addProject: function addProject(project) {
			return dispatch(_addProject(project));
		},
		changeProject: function changeProject(id) {
			return dispatch(_changeProject(id));
		},
		removeProject: function removeProject(id) {
			return dispatch(_removeProject(id));
		},
		setActiveFile: function setActiveFile(file) {
			return dispatch(_setActiveFile(file));
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

var FileListFile = require('./FileListFile');

var FileListDirectory = require('./FileListDirectory');

var NoContent = require('../../NoContent');

var _require2 = require('../../../actions'),
    _setActiveFile = _require2.setActiveFile;

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
		key: 'render',
		value: function render() {
			if (this.props.loading) {
				return React.createElement(
					NoContent,
					{ className: 'loading' },
					React.createElement(
						'p',
						null,
						'Loading\u2026'
					)
				);
			} else if (!this.props.path) {
				return React.createElement(
					NoContent,
					{ className: 'empty' },
					React.createElement(
						'p',
						null,
						'No project folder selected.'
					)
				);
			} else if (!this.props.files || !Object.keys(this.props.files).length) {
				return React.createElement(
					NoContent,
					{ className: 'empty' },
					React.createElement(
						'p',
						null,
						'Nothing to see here.'
					)
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

			return React.createElement(
				'ul',
				{ id: 'files' },
				filelist
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

},{"../../../actions":1,"../../NoContent":4,"./FileListDirectory":17,"./FileListFile":18,"react":undefined,"react-redux":undefined}],17:[function(require,module,exports){
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

module.exports = FileListFile;

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

var webpack = require('webpack');

var stripIndent = require('strip-indent');

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

	console.log(options);

	var filename = options.filename || 'file';

	var config = {
		mode: 'development',
		entry: options.input,
		output: {
			path: options.output,
			filename: options.filename
		}
	};

	webpack(config, function (err, stats) {
		console.log(err);
		console.log(stats);
		if (err || stats.hasErrors()) {
			// Handle errors here
		}

		if (callback) {
			callback();
		}
	});

	return;

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

			return notify;
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
	console.log(data);

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

},{"../utils/pathHelpers":29,"child_process":undefined,"electron":undefined,"fs":undefined,"path":undefined,"ps-tree":undefined,"strip-indent":undefined,"webpack":undefined}],24:[function(require,module,exports){
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

	switch (action.type) {
		case 'ADD_PROJECT':
			return [].concat(_toConsumableArray(projects), [action.payload]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYWN0aW9ucy9pbmRleC5qcyIsImFwcC9qcy9hcHAuanMiLCJhcHAvanMvY29tcG9uZW50cy9BcHAuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvTm9Db250ZW50LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvU2lkZWJhci5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2VsZWN0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFN3aXRjaC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1BhbmVsLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL1Byb2plY3RTZWxlY3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvU2V0dGluZ3MuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3QuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3RGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsImFwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU3R5bGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvdWkvTm90aWNlLmpzeCIsImFwcC9qcy9ndWxwL2ludGVyZmFjZS5qcyIsImFwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsImFwcC9qcy9yZWR1Y2Vycy9wcm9qZWN0cy5qcyIsImFwcC9qcy91dGlscy9Mb2dnZXIuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGlscy9wYXRoSGVscGVycy5qcyIsImFwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFJQTs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsSUFBckIsRUFBNEI7QUFDM0IsUUFBTztBQUNOLFFBQU0sYUFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVEOztBQUVBLFNBQVMsVUFBVCxDQUFxQixPQUFyQixFQUErQjtBQUM5QixRQUFPO0FBQ04sUUFBTSxhQURBO0FBRU4sV0FBUztBQUZILEVBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsT0FBeEIsRUFBa0M7QUFDakMsUUFBTztBQUNOLFFBQU0sZ0JBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELFNBQVMsYUFBVCxDQUF3QixFQUF4QixFQUE2QjtBQUM1QixRQUFPO0FBQ04sUUFBTSxnQkFEQTtBQUVOO0FBRk0sRUFBUDtBQUlBOztBQUVELFNBQVMsZUFBVCxDQUEwQixLQUExQixFQUFrQztBQUNqQyxRQUFPO0FBQ04sUUFBTSxtQkFEQTtBQUVOLFdBQVM7QUFGSCxFQUFQO0FBSUE7O0FBRUQ7O0FBRUEsU0FBUyxZQUFULENBQXVCLEtBQXZCLEVBQStCO0FBQzlCLFFBQU87QUFDTixRQUFNLGVBREE7QUFFTixXQUFTO0FBRkgsRUFBUDtBQUlBOztBQUVELFNBQVMsYUFBVCxDQUF3QixJQUF4QixF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QWdCLFVBQWhCLENBQXBCLENBQXJCLENBQWY7QUFDQTtBQUNEOztBQUVELFFBQU8sWUFBUDtBQUNBOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNoQixhQURnQjtBQUVoQixtQ0FGZ0I7QUFHaEI7QUFIZ0IsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEBmaWxlIEFjdGlvbnMuXG4gKi9cblxuLy8gTWFpbi5cblxuZnVuY3Rpb24gY2hhbmdlVmlldyggdmlldyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1ZJRVcnLFxuXHRcdHZpZXdcblx0fTtcbn1cblxuLy8gUHJvamVjdHMuXG5cbmZ1bmN0aW9uIGFkZFByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0FERF9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIGNoYW5nZVByb2plY3QoIHByb2plY3QgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb2plY3QoIGlkICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRU1PVkVfUFJPSkVDVCcsXG5cdFx0aWRcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX1BST0pFQ1RfU1RBVEUnLFxuXHRcdHBheWxvYWQ6IHN0YXRlXG5cdH07XG59XG5cbi8vIEZpbGVzLlxuXG5mdW5jdGlvbiByZWNlaXZlRmlsZXMoIGZpbGVzICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUNFSVZFX0ZJTEVTJyxcblx0XHRwYXlsb2FkOiBmaWxlc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRBY3RpdmVGaWxlKCBmaWxlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfQUNUSVZFX0ZJTEUnLFxuXHRcdHBheWxvYWQ6IGZpbGVcblx0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNoYW5nZVZpZXcsXG5cdGFkZFByb2plY3QsXG5cdGNoYW5nZVByb2plY3QsXG5cdHJlbW92ZVByb2plY3QsXG5cdHNldFByb2plY3RTdGF0ZSxcblx0cmVjZWl2ZUZpbGVzLFxuXHRzZXRBY3RpdmVGaWxlXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2J1aWxkci1jb25maWcnXG59KTtcblxuZ2xvYmFsLnVpID0gcmVxdWlyZSgnLi91dGlscy9nbG9iYWxVSScpO1xuXG5nbG9iYWwuY29tcGlsZXIgPSByZXF1aXJlKCcuLi9qcy9ndWxwL2ludGVyZmFjZScpO1xuXG5nbG9iYWwuY29tcGlsZXJUYXNrcyA9IFtdO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbmNvbnN0IHsgUHJvdmlkZXIgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IHsgY3JlYXRlU3RvcmUgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHJvb3RSZWR1Y2VyID0gcmVxdWlyZSgnLi9yZWR1Y2VycycpO1xuXG4vLyBsZXQgaW5pdGlhbFN0YXRlID0ge1xuLy8gXHR2aWV3OiAnZmlsZXMnLFxuLy8gXHRwcm9qZWN0czoge30sXG4vLyBcdGFjdGl2ZVByb2plY3Q6IDAsXG4vLyBcdGFjdGl2ZVByb2plY3RGaWxlczoge30sXG4vLyBcdGFjdGl2ZUZpbGU6IG51bGxcbi8vIH07XG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoIHJvb3RSZWR1Y2VyICk7IC8vICwgaW5pdGlhbFN0YXRlICk7XG5cbmdsb2JhbC5zdG9yZSA9IHN0b3JlO1xuXG5jb25zdCBBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQXBwJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXsgc3RvcmUgfT5cblx0XHQ8QXBwIC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pO1xuXG5jb25zdCB7IHNsZWVwIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5cbi8vIEFwcCBjbG9zZS9yZXN0YXJ0IGV2ZW50cy5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA+IDAgKSB7XG5cdFx0Y29uc29sZS5sb2coICdLaWxsaW5nICVkIHJ1bm5pbmcgdGFza3MuLi4nLCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblxuXHRcdHNsZWVwKCAzMDAgKTtcblx0fVxufSk7XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIGNvbXBvbmVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL1NldHRpbmdzJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHRsb2dzOiAnTG9ncycsXG5cdFx0XHRzZXR0aW5nczogJ1NldHRpbmdzJ1xuXHRcdH07XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGdsb2JhbC51aS5vdmVybGF5KCB0aGlzLnByb3BzLnZpZXcgIT09ICdmaWxlcycgKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgY29udGVudDtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdsb2dzJyApIHtcblx0XHRcdFx0Y29udGVudCA9IDxMb2dzIC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGVudCA9IDxTZXR0aW5ncyAvPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50JyArICggcHJvcHMuY2xhc3NOYW1lID8gJyAnICsgcHJvcHMuY2xhc3NOYW1lIDogJycgKSB9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2lubmVyJz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY2hhbmdlVmlldyB9ID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZTogc3RhdGUudmlld1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRjaGFuZ2VWaWV3OiB2aWV3ID0+IGRpc3BhdGNoKCBjaGFuZ2VWaWV3KCB2aWV3ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggU2lkZWJhciApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwYXRoOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBwYXRoID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/ICcnIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgcGF0aCB9O1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5zdGF0ZS5wYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoeyBwYXRoOiBzYXZlUGF0aCB9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCBzYXZlUGF0aCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSdoaWRkZW4nXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0aWQ9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnN0YXRlLnBhdGggfVxuXHRcdFx0XHRcdHJlYWRPbmx5PSd0cnVlJ1xuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8c21hbGwgb25DbGljaz17IHRoaXMub25DbGljayB9PnsgdGhpcy5zdGF0ZS5wYXRoIH08L3NtYWxsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2F2ZUZpbGUucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRzb3VyY2VGaWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXHRkaWFsb2dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0ZGlhbG9nRmlsdGVyczogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLm9iamVjdCBdKSxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRzZWxlY3RlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBzZWxlY3RlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHNlbGVjdGVkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IHNlbGVjdGVkOiBldmVudC50YXJnZXQudmFsdWUgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuc2VsZWN0ZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnNlbGVjdGVkID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnN0YXRlLnNlbGVjdGVkIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5zZWxlY3RlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHRvZ2dsZSBzd2l0Y2guXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFN3aXRjaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRjaGVja2VkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IGNoZWNrZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBjaGVja2VkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGNoZWNrZWQ6ICEgcHJldlN0YXRlLmNoZWNrZWQgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuY2hlY2tlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5zdGF0ZS5jaGVja2VkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGxvZ3MgYW5kIGluZm9ybWF0aW9uLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIExvZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgdHlwZSA9IG51bGw7XG5cdFx0bGV0IGxvZ3MgPSAoIGdsb2JhbC5sb2dnZXIgKSA/IGdsb2JhbC5sb2dnZXIuZ2V0KCB0eXBlICkgOiBbXTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0bG9nc1xuXHRcdH07XG5cblx0XHR0aGlzLnJlZnJlc2ggPSB0aGlzLnJlZnJlc2guYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvbG9ncycsIHRoaXMucmVmcmVzaCApO1xuXHR9XG5cblx0cmVmcmVzaCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9nczogZ2xvYmFsLmxvZ2dlci5nZXQoIHRoaXMuc3RhdGUudHlwZSApIH0pO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0bGV0IGxvZ0luZGV4ID0gMDtcblx0XHRsZXQgbG9nTGlzdCA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGxvZyBvZiB0aGlzLnN0YXRlLmxvZ3MgKSB7XG5cdFx0XHRsZXQgdGl0bGVIVE1MID0geyBfX2h0bWw6IGxvZy50aXRsZSB9O1xuXHRcdFx0bGV0IGJvZHlIVE1MID0gKCBsb2cuYm9keSApID8geyBfX2h0bWw6IGxvZy5ib2R5IH0gOiBudWxsO1xuXG5cdFx0XHRsb2dMaXN0LnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGxvZ0luZGV4IH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyAndHlwZS0nICsgbG9nLnR5cGUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5cblx0XHRcdFx0XHRcdDxzbWFsbD57IGxvZy50aW1lIH08L3NtYWxsPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSd0aXRsZS10ZXh0JyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHRpdGxlSFRNTCB9IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0eyBib2R5SFRNTCAmJlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2RldGFpbHMnIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgYm9keUhUTUwgfSAvPlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0PC9saT5cblx0XHRcdCk7XG5cdFx0XHRsb2dJbmRleCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiA8dWw+eyBsb2dMaXN0IH08L3VsPjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5sb2dzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2dzLXNjcmVlbiBlbXB0eSc+XG5cdFx0XHRcdFx0PGgzPk5vIGxvZ3MgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+R28gZm9ydGggYW5kIGNvbXBpbGUhPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUgfSA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMnKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0Q29uZmlnIH0gPSByZXF1aXJlKCcuLi8uLi91dGlscy91dGlscycpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSB0aGlzLnRvZ2dsZVNlbGVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZWxlY3RQcm9qZWN0ID0gdGhpcy5zZWxlY3RQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVByb2plY3QgPSB0aGlzLnRvZ2dsZVByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdGdsb2JhbC51aS51bmZvY3VzKCAhIHRoaXMuc3RhdGUuaXNPcGVuICk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgaXNPcGVuOiAhIHRoaXMuc3RhdGUuaXNPcGVuIH0pO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gISB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgfHwgZmFsc2U7XG5cblx0XHR0aGlzLnByb3BzLnNldFByb2plY3RTdGF0ZSh7IHBhdXNlZDogcGF1c2VkIH0pO1xuXG5cdFx0c2V0UHJvamVjdENvbmZpZyggJ3BhdXNlZCcsIHBhdXNlZCApO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdCggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5wcm9qZWN0O1xuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblxuXHRcdGlmICggaW5kZXggPT09ICduZXcnICkge1xuXHRcdFx0dGhpcy5wcm9wcy5uZXdQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCggaW5kZXggKTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNob2ljZXMoKSB9XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyAndG9nZ2xlJyArICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkID8gJyBwYXVzZWQnIDogJyBhY3RpdmUnICkgfSBvbkNsaWNrPXsgdGhpcy50b2dnbGVQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlZnJlc2gnIG9uQ2xpY2s9eyB0aGlzLnByb3BzLnJlZnJlc2hQcm9qZWN0IH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17IHRoaXMucHJvcHMucmVtb3ZlUHJvamVjdCB9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LXNlbGVjdC1kcm9wZG93bicgY2xhc3NOYW1lPXsgdGhpcy5zdGF0ZS5pc09wZW4gPyAnb3BlbicgOiAnJyB9PlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJDaG9pY2VzKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldFByb2plY3RTdGF0ZTogc3RhdGUgPT4gZGlzcGF0Y2goIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCcuLi91aS9Ob3RpY2UnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL1BhbmVsJyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnYnVpbGRyLXByb2plY3QuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm5ld1Byb2plY3QgPSB0aGlzLm5ld1Byb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaW5pdFByb2plY3QgPSB0aGlzLmluaXRQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3QgPSB0aGlzLmNoYW5nZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVtb3ZlUHJvamVjdCA9IHRoaXMucmVtb3ZlUHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZWZyZXNoUHJvamVjdCA9IHRoaXMucmVmcmVzaFByb2plY3QuYmluZCggdGhpcyApO1xuXG5cdFx0dGhpcy5pbml0Q29tcGlsZXIgPSB0aGlzLmluaXRDb21waWxlci5iaW5kKCB0aGlzICk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnYmQvcmVmcmVzaC9maWxlcycsIHRoaXMucmVmcmVzaFByb2plY3QgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuaW5pdFByb2plY3QoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoIHByZXZQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGlmIChcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF0aCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCAmJlxuXHRcdFx0cHJldlByb3BzLmFjdGl2ZS5wYXVzZWQgIT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZFxuXHRcdCkge1xuXHRcdFx0Ly8gUHJvamVjdCB3YXMgcGF1c2VkL3VucGF1c2VkLCB0cmlnZ2VyIGNvbXBpbGVyIHRhc2tzIG9yIHRlcm1pbmF0ZSB0aGVtLlxuXHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgYSBuZXcgcHJvamVjdC5cblx0bmV3UHJvamVjdCgpIHtcblx0XHRsZXQgcGF0aCA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbICdvcGVuRGlyZWN0b3J5JyBdXG5cdFx0fSk7XG5cblx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0bmFtZTogZnNwYXRoLmJhc2VuYW1lKCBwYXRoWzBdICksXG5cdFx0XHRcdHBhdGg6IHBhdGhbMF0sXG5cdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHRsZXQgbmV3UHJvamVjdEluZGV4ID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGg7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3QgYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgW1xuXHRcdFx0XHQuLi50aGlzLnByb3BzLnByb2plY3RzLFxuXHRcdFx0XHRuZXdQcm9qZWN0XG5cdFx0XHRdICk7XG5cblx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdHRoaXMucHJvcHMuYWRkUHJvamVjdCggbmV3UHJvamVjdCApO1xuXG5cdFx0XHQvLyBTZXQgbmV3IHByb2plY3QgYXMgYWN0aXZlLlxuXHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBuZXdQcm9qZWN0SW5kZXgsIG5ld1Byb2plY3QgKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGFuZ2UgdGhlIGFjdGl2ZSBwcm9qZWN0LlxuXHRjaGFuZ2VQcm9qZWN0KCBpZCwgcHJvamVjdCA9IG51bGwgKSB7XG5cdFx0aWYgKCBpZCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUuaWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLnByb2plY3RzWyBpZCBdICkge1xuXHRcdFx0YWN0aXZlID0gdGhpcy5wcm9wcy5wcm9qZWN0c1sgaWQgXTtcblx0XHR9IGVsc2UgaWYgKCBwcm9qZWN0ICkge1xuXHRcdFx0YWN0aXZlID0gcHJvamVjdDtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgY29uZmlnLlxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpZCApO1xuXG5cdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdHRoaXMucHJvcHMuY2hhbmdlUHJvamVjdCh7XG5cdFx0XHQuLi5hY3RpdmUsXG5cdFx0XHRpZFxuXHRcdH0pO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHRoZSBjdXJyZW50IHByb2plY3QuXG5cdHJlbW92ZVByb2plY3QoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3RoaXMucHJvcHMuYWN0aXZlLm5hbWV9P2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdGxldCByZW1vdmVJbmRleCA9IHBhcnNlSW50KCB0aGlzLnByb3BzLmFjdGl2ZS5pZCwgMTAgKTtcblxuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gcmVtb3ZlSW5kZXggKTtcblxuXHRcdFx0Ly8gUmVtb3ZlIHByb2plY3QgZnJvbSBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHN0YXRlLlxuXHRcdFx0dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0KCByZW1vdmVJbmRleCApO1xuXG5cdFx0XHQvLyBVbnNldCBhY3RpdmUgcHJvamVjdC5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggbnVsbCApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHRpbml0Q29tcGlsZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVmcmVzaCB0aGUgcHJvamVjdCBmaWxlcy5cblx0cmVmcmVzaFByb2plY3QoKSB7XG5cdFx0dGhpcy5nZXRGaWxlcyggdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG9yIGZldGNoIHRoZSBwcm9qZWN0IGNvbmZpZyBmaWxlLlxuXHRzZXRQcm9qZWN0Q29uZmlnRmlsZSggcGF0aCApIHtcblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IG5ldyBTdG9yZSh7XG5cdFx0XHRuYW1lOiAnYnVpbGRyLXByb2plY3QnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHQvLyBDaG9zZW4gZGlyZWN0b3J5IG5vdCByZWFkYWJsZSBvciBubyBwYXRoIHByb3ZpZGVkLlxuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LmAgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbnVsbDtcblxuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcygge30gKSApO1xuXG5cdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERpcmVjdG9yeSBpcyByZWFkYWJsZSwgZ2V0IGZpbGVzIGFuZCBzZXR1cCBjb25maWcuXG5cdFx0XHRcdHRoaXMuZ2V0RmlsZXMoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLnNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICk7XG5cblx0XHRcdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdFx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHRcdH1cblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0IH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMz5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDM+XG5cdFx0XHRcdFx0PHA+V291bGQgeW91IGxpa2UgdG8gYWRkIG9uZSBub3c/PC9wPlxuXHRcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPSdsYXJnZSBmbGF0IGFkZC1uZXctcHJvamVjdCcgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PkFkZCBQcm9qZWN0PC9idXR0b24+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgISB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdCBzZWxlY3RlZCwgc2hvdyBzZWxlY3Rvci5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdwcm9qZWN0LXNlbGVjdC1zY3JlZW4nPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3RzJz5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpIH1cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlck5vdGljZXMoKSB9XG5cblx0XHRcdFx0XHQ8RmlsZUxpc3Rcblx0XHRcdFx0XHRcdHBhdGg9eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH1cblx0XHRcdFx0XHRcdGZpbGVzPXsgdGhpcy5wcm9wcy5maWxlcyB9XG5cdFx0XHRcdFx0XHRsb2FkaW5nPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8UGFuZWwgLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdGFkZFByb2plY3Q6IHByb2plY3QgPT4gZGlzcGF0Y2goIGFkZFByb2plY3QoIHByb2plY3QgKSApLFxuXHRjaGFuZ2VQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggY2hhbmdlUHJvamVjdCggaWQgKSApLFxuXHRyZW1vdmVQcm9qZWN0OiBpZCA9PiBkaXNwYXRjaCggcmVtb3ZlUHJvamVjdCggaWQgKSApLFxuXHRzZXRBY3RpdmVGaWxlOiBmaWxlID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBmaWxlICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMz5TZXR0aW5nczwvaDM+XG5cdFx0XHRcdDxwPkNvbWluZyBzb29uITwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgRmlsZUxpc3RGaWxlID0gcmVxdWlyZSgnLi9GaWxlTGlzdEZpbGUnKTtcblxuY29uc3QgRmlsZUxpc3REaXJlY3RvcnkgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RGlyZWN0b3J5Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jb25zdCB7IHNldEFjdGl2ZUZpbGUgfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FjdGlvbnMnKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSAmJiB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudCA9PT0gZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdGZpbGVQcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJywgJ2hhcy1vcHRpb25zJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKTtcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoXG5cdFx0XHR0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9hZGluZyc+XG5cdFx0XHRcdFx0PHA+TG9hZGluZyZoZWxsaXA7PC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vIHByb2plY3QgZm9sZGVyIHNlbGVjdGVkLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyB8fCAhIE9iamVjdC5rZXlzKCB0aGlzLnByb3BzLmZpbGVzICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5Ob3RoaW5nIHRvIHNlZSBoZXJlLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDx1bCBpZD0nZmlsZXMnPlxuXHRcdFx0XHR7IGZpbGVsaXN0IH1cblx0XHRcdDwvdWw+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0YWN0aXZlRmlsZTogc3RhdGUuYWN0aXZlRmlsZVxufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRzZXRBY3RpdmVGaWxlOiBwYXlsb2FkID0+IGRpc3BhdGNoKCBzZXRBY3RpdmVGaWxlKCBwYXlsb2FkICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggRmlsZUxpc3QgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGV4cGFuZGVkOiAhIHByZXZTdGF0ZS5leHBhbmRlZCB9O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjbGFzc05hbWUgPSAnZGlyZWN0b3J5JztcblxuXHRcdGlmICggdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnIGV4cGFuZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdERpcmVjdG9yeTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBmaWxlIGluIHRoZSBmaWxlbGlzdC5cbiAqL1xuXG5jb25zdCB7IHJlbW90ZSwgc2hlbGwgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmNvbnN0IHsgTWVudSwgTWVudUl0ZW0gfSA9IHJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHRcdHRoaXMub25Db250ZXh0TWVudSA9IHRoaXMub25Db250ZXh0TWVudS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSh7XG5cdFx0XHRmaWxlOiB0aGlzLnByb3BzLmZpbGUsXG5cdFx0XHRlbGVtZW50OiBldmVudC5jdXJyZW50VGFyZ2V0XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNvbnRleHRNZW51KCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGZpbGVQYXRoID0gdGhpcy5wcm9wcy5maWxlLnBhdGg7XG5cblx0XHRsZXQgbWVudSA9IG5ldyBNZW51KCk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ09wZW4nLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5vcGVuSXRlbSggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnU2hvdyBpbiBmb2xkZXInLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkgeyBzaGVsbC5zaG93SXRlbUluRm9sZGVyKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0dHlwZTogJ3NlcGFyYXRvcidcblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdEZWxldGUnLFxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfT9gICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goIGZpbGVQYXRoICkgKSB7XG5cdFx0XHRcdFx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnYmQvcmVmcmVzaC9maWxlcycpICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5hbGVydCggYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0uYCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSApO1xuXG5cdFx0bWVudS5wb3B1cCggcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGlcblx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy50eXBlIH1cblx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdG9uQ29udGV4dE1lbnU9eyB0aGlzLm9uQ29udGV4dE1lbnUgfVxuXHRcdFx0PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYnVpbGQgb3B0aW9ucyBmb3IgYSBmaWxlLlxuICovXG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGgsIGZpbGVPdXRwdXRQYXRoIH0gPSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9wYXRoSGVscGVycycpO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGxvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlQ2hhbmdlID0gdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZSA9IHRoaXMuaGFuZGxlQ29tcGlsZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXRPdXRwdXRQYXRoID0gdGhpcy5zZXRPdXRwdXRQYXRoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXRDb25maWcoIHByb3BlcnR5LCBkZWZhdWx0VmFsdWUgPSBudWxsICkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhdGg6IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSxcblx0XHRcdG91dHB1dDogdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpLFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXG5cdFx0bGV0IHN0b3JlZCA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZSApO1xuXG5cdFx0bGV0IGNvbmZpZyA9ICggc3RvcmVkICE9PSBmYWxzZSApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCkgKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICkge1xuXHRcdFx0XHRmaWxlQ29uZmlnWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRmaWxlcy5wdXNoKCBmaWxlQ29uZmlnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcblx0XHRcdFx0ZGVsZXRlIGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9ucyAmJiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXG5cdHNldE9wdGlvbiggb3B0aW9uLCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0bGV0IG9wdGlvbnMgPSBwcmV2U3RhdGUub3B0aW9ucyB8fCB7fTtcblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gdmFsdWU7XG5cblx0XHRcdHJldHVybiB7IG9wdGlvbnMgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0Q29uZmlnKCAnb3B0aW9ucycsIHRoaXMuc3RhdGUub3B0aW9ucyApO1xuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRPcHRpb24oIGV2ZW50LnRhcmdldC5uYW1lLCB2YWx1ZSApO1xuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0cmV0dXJuIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHRoaXMub3V0cHV0U3VmZml4LCB0aGlzLm91dHB1dEV4dGVuc2lvbiApO1xuXHR9XG5cblx0c2V0T3V0cHV0UGF0aCggZXZlbnQsIHBhdGggKSB7XG5cdFx0dGhpcy5zZXRDb25maWcoICdvdXRwdXQnLCBwYXRoICk7XG5cdH1cblxuXHRnZXRPdXRwdXRQYXRoKCB0eXBlID0gJ3JlbGF0aXZlJyApIHtcblx0XHRsZXQgc2xhc2hQYXRoID0gKCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgcmVsYXRpdmVQYXRoID0gKCB0eXBlID09PSAncmVsYXRpdmUnIHx8IHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKTtcblx0XHRsZXQgb3V0cHV0UGF0aCA9IHRoaXMuZ2V0Q29uZmlnKCAnb3V0cHV0JywgZGVmYXVsdFBhdGggKTtcblxuXHRcdGlmICggcmVsYXRpdmVQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzbGFzaFBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gc2xhc2goIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0UGF0aDtcblx0fVxuXG5cdGhhbmRsZUNvbXBpbGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIucHJvY2Vzc0ZpbGUoXG5cdFx0XHR0aGlzLnByb3BzLmJhc2UsXG5cdFx0XHR0aGlzLmdldENvbmZpZygpLFxuXHRcdFx0dGhpcy5zdGF0ZS5idWlsZFRhc2tOYW1lLFxuXHRcdFx0ZnVuY3Rpb24oIGNvZGUgKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5zZXRPdXRwdXRQYXRoIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYnVuZGxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQmFiZWwnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2JhYmVsJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nY29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQ29tcHJlc3MnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2NvbXByZXNzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc291cmNlTWFwc0Rpc2FibGVkKCkgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTY3JpcHQ7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc3R5bGVzaGVldC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNlbGVjdCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNlbGVjdCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSw8YnIgLz4gaXQgY2Fubm90IGJlIGNvbXBpbGVkIG9uIGl0cyBvd24uPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLnNldE91dHB1dFBhdGggfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHNob3dpbmcgbm90aWNlcyBhbmQgYWxlcnRzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgTm90aWNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdGxldCB0eXBlID0gdGhpcy5wcm9wcy50eXBlIHx8ICdpbmZvJztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17ICdub3RpY2UgdHlwZS0nICsgdHlwZSB9PlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGljZTtcbiIsIi8qKlxuKiBAZmlsZSBHdWxwIHNjcmlwdHMgYW5kIHRhc2tzLlxuKi9cblxuLyogZ2xvYmFsIE5vdGlmaWNhdGlvbiAqL1xuXG5jb25zdCB7IGFwcCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bjtcbmNvbnN0IHBzVHJlZSA9IHJlcXVpcmUoJ3BzLXRyZWUnKTtcblxuY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcblxuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcblxuY29uc3QgeyBzbGFzaCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnIgKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgcGlkIG9mIFsgcHJvYy5waWQgXS5jb25jYXQoIGNoaWxkcmVuLm1hcCggY2hpbGQgPT4gY2hpbGQuUElEICkgKSApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHByb2Nlc3Mua2lsbCggcGlkICk7XG5cdFx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0XHQvLyBGYWlsIHNpbGVudGx5IGxvbCBZT0xPXG5cdFx0XHRcdC8vIGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGxldCBvcHRpb25zID0gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApO1xuXG5cdGlmICggISBvcHRpb25zICkge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggdGFza05hbWUgKSB7XG5cdFx0cnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdH0gZWxzZSBpZiAoIG9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0aWYgKCBvcHRpb25zLndhdGNoVGFzayApIHtcblx0XHRcdG9wdGlvbnMuZ2V0SW1wb3J0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cnVuVGFzayggJ3dhdGNoJywgb3B0aW9ucyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVPcHRpb25zKCBmaWxlICkge1xuXHRsZXQgb3B0aW9ucyA9IHt9O1xuXG5cdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2Nzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ3Nhc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2xlc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLmpzJzpcblx0XHRjYXNlICcuanN4Jzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdqcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3NjcmlwdCc7XG5cdH1cblxuXHRvcHRpb25zLmJ1aWxkVGFza05hbWUgPSAnYnVpbGQtJyArIG9wdGlvbnMudHlwZTtcblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZUNvbmZpZyggYmFzZSwgZmlsZUNvbmZpZyApIHtcblx0aWYgKCAhIGZpbGVDb25maWcucGF0aCB8fCAhIGZpbGVDb25maWcub3V0cHV0ICkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGxldCBmaWxlUGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApO1xuXHRsZXQgb3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcub3V0cHV0ICk7XG5cdGxldCBjb21waWxlT3B0aW9ucyA9IGdldEZpbGVPcHRpb25zKHsgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoIGZpbGVQYXRoICkgfSk7XG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGlucHV0OiBmaWxlUGF0aCxcblx0XHRmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSggb3V0cHV0UGF0aCApLFxuXHRcdG91dHB1dDogcGF0aC5wYXJzZSggb3V0cHV0UGF0aCApLmRpcixcblx0XHRwcm9qZWN0QmFzZTogYmFzZSxcblx0XHRwcm9qZWN0Q29uZmlnOiBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IGZpbGVDb25maWcub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMuYXV0b2NvbXBpbGUgKSB7XG5cdFx0XHRvcHRpb25zLndhdGNoVGFzayA9IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zID0ge30sIGNhbGxiYWNrID0gbnVsbCApIHtcblx0Y29uc29sZS5sb2coIG9wdGlvbnMgKTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8ICdmaWxlJztcblxuXHRsZXQgY29uZmlnID0ge1xuXHRcdG1vZGU6ICdkZXZlbG9wbWVudCcsXG5cdFx0ZW50cnk6IG9wdGlvbnMuaW5wdXQsXG5cdFx0b3V0cHV0OiB7XG5cdFx0XHRwYXRoOiBvcHRpb25zLm91dHB1dCxcblx0XHRcdGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lXG5cdFx0fVxuXHR9O1xuXG5cdHdlYnBhY2soIGNvbmZpZywgKCBlcnIsIHN0YXRzICkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRjb25zb2xlLmxvZyggc3RhdHMgKTtcblx0XHRpZiAoIGVyciB8fCBzdGF0cy5oYXNFcnJvcnMoKSApIHtcblx0XHRcdC8vIEhhbmRsZSBlcnJvcnMgaGVyZVxuXHRcdH1cblxuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuO1xuXG5cdGdsb2JhbC5jb21waWxlclRhc2tzLnB1c2goIGNwICk7XG5cblx0Y3Auc3Rkb3V0LnNldEVuY29kaW5nKCd1dGY4Jyk7XG5cblx0Y3Auc3Rkb3V0Lm9uKCAnZGF0YScsIGRhdGEgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCBkYXRhICk7XG5cblx0XHRpZiAoIGRhdGEubWF0Y2goL0ZpbmlzaGVkICdidWlsZC0uKicvKSApIHtcblx0XHRcdC8vIEJ1aWxkIHRhc2sgc3VjY2Vzc2Z1bC5cblx0XHRcdGxldCBub3RpZnlUZXh0ID0gYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gO1xuXG5cdFx0XHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRcdFx0Ym9keTogbm90aWZ5VGV4dCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG5cdFx0XHR9KTtcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdzdWNjZXNzJywgbm90aWZ5VGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gbm90aWZ5O1xuXHRcdH0gZWxzZSBpZiAoIGRhdGEubWF0Y2goL1N0YXJ0aW5nICdidWlsZC0uKicvKSApIHtcblx0XHRcdC8vIEJ1aWxkIHRhc2sgc3RhcnRpbmcuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2luZm8nLCBgQ29tcGlsaW5nICR7ZmlsZW5hbWV9Li4uYCApO1xuXHRcdH1cblx0fSk7XG5cblx0Y3Auc3RkZXJyLnNldEVuY29kaW5nKCd1dGY4Jyk7XG5cblx0Y3Auc3RkZXJyLm9uKCAnZGF0YScsIGhhbmRsZVN0ZGVyciApO1xuXG5cdGNwLm9uKCAnZXhpdCcsIGNvZGUgPT4ge1xuXHRcdC8vIFJlbW92ZSB0aGlzIHRhc2sgZnJvbSBnbG9iYWwgYXJyYXkuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MgPSBnbG9iYWwuY29tcGlsZXJUYXNrcy5maWx0ZXIoIHByb2MgPT4ge1xuXHRcdFx0cmV0dXJuICggcHJvYy5waWQgIT09IGNwLnBpZCApO1xuXHRcdH0pO1xuXG5cdFx0aWYgKCBjb2RlID09PSAwICkge1xuXHRcdFx0Ly8gU3VjY2Vzcy5cblx0XHRcdC8vIG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHQvLyBcdGJvZHk6IGBGaW5pc2hlZCBjb21waWxpbmcgJHtmaWxlbmFtZX0uYCxcblx0XHRcdC8vIFx0c2lsZW50OiB0cnVlXG5cdFx0XHQvLyB9KTtcblx0XHR9IGVsc2UgaWYgKCBjb2RlID09PSAxICkge1xuXHRcdFx0Ly8gVGVybWluYXRlZC5cblx0XHRcdC8vIGNvbnNvbGUubG9nKCAnUHJvY2VzcyAlcyB0ZXJtaW5hdGVkJywgY3AucGlkICk7XG5cdFx0fSBlbHNlIGlmICggY29kZSApIHtcblx0XHRcdC8vIG5ldyBOb3RpZmljYXRpb24oICdCdWlsZHInLCB7XG5cdFx0XHQvLyBcdGJvZHk6IGBFcnJvciB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gLFxuXHRcdFx0Ly8gXHRzb3VuZDogJ0Jhc3NvJ1xuXHRcdFx0Ly8gfSk7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoYEV4aXRlZCB3aXRoIGVycm9yIGNvZGUgJHtjb2RlfWApO1xuXHRcdH1cblxuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjayggY29kZSApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN0ZGVyciggZGF0YSApIHtcblx0Y29uc29sZS5sb2coIGRhdGEgKTtcblxuXHRsZXQgZXJyT2JqID0ge307XG5cdGxldCBzdGFydENhcHR1cmUgPSBmYWxzZTtcblxuXHR2YXIgbGluZXMgPSBkYXRhLnNwbGl0KCAvKFxcclxcbnxbXFxuXFx2XFxmXFxyXFx4ODVcXHUyMDI4XFx1MjAyOV0pLyApO1xuXG5cdGZvciAoIHZhciBsaW5lIG9mIGxpbmVzICkge1xuXHRcdGxldCB0cmltbWVkID0gbGluZS50cmltKCk7XG5cblx0XHRpZiAoICEgdHJpbW1lZC5sZW5ndGggKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRyaW1tZWQgPT09ICdEZXRhaWxzOicgKSB7XG5cdFx0XHRzdGFydENhcHR1cmUgPSB0cnVlO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGFydENhcHR1cmUgKSB7XG5cdFx0XHRsZXQgZXJyQXJyID0gdHJpbW1lZC5zcGxpdCggLzpcXHMoLispLyApO1xuXHRcdFx0ZXJyT2JqWyBlcnJBcnJbMF0gXSA9IGVyckFyclsxXTtcblxuXHRcdFx0aWYgKCBlcnJBcnJbMF0gPT09ICdmb3JtYXR0ZWQnICkge1xuXHRcdFx0XHRzdGFydENhcHR1cmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0aWYgKCBPYmplY3Qua2V5cyggZXJyT2JqICkubGVuZ3RoICkge1xuXHRcdGNvbnNvbGUuZXJyb3IoIGVyck9iaiApO1xuXG5cdFx0Z2V0RXJyTGluZXMoIGVyck9iai5maWxlLCBlcnJPYmoubGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHRpdGxlID0gZXJyT2JqLmZvcm1hdHRlZC5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0XHQnPGNvZGU+JyArXG5cdFx0XHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGVyck9iai5maWxlICkgKSArXG5cdFx0XHRcdFx0JyBvbiBsaW5lICcgKyBlcnJPYmoubGluZSArXG5cdFx0XHRcdCc8L2NvZGU+JztcblxuXHRcdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyByZXR1cm4gZXJyT2JqO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJMaW5lcyggZmlsZW5hbWUsIGxpbmUsIGNhbGxiYWNrICkge1xuXHRsaW5lID0gTWF0aC5tYXgoIHBhcnNlSW50KCBsaW5lLCAxMCApIC0gMSB8fCAwLCAwICk7XG5cblx0ZnMucmVhZEZpbGUoIGZpbGVuYW1lLCBmdW5jdGlvbiggZXJyLCBkYXRhICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdHZhciBsaW5lcyA9IGRhdGEudG9TdHJpbmcoJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuXG5cdFx0aWYgKCArbGluZSA+IGxpbmVzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgbGluZUFyciA9IFtdO1xuXHRcdGxldCBfbGluZUFyciA9IFtdO1xuXHRcdGxldCBtaW5MaW5lID0gTWF0aC5tYXgoIGxpbmUgLSAyLCAwICk7XG5cdFx0bGV0IG1heExpbmUgPSBNYXRoLm1pbiggbGluZSArIDIsIGxpbmVzLmxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSBtaW5MaW5lOyBpIDw9IG1heExpbmU7IGkrKyApIHtcblx0XHRcdF9saW5lQXJyWyBpIF0gPSBsaW5lc1sgaSBdO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleHRyYW5lb3VzIGluZGVudGF0aW9uLlxuXHRcdGxldCBzdHJpcHBlZExpbmVzID0gc3RyaXBJbmRlbnQoIF9saW5lQXJyLmpvaW4oJ1xcbicpICkuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Zm9yICggdmFyIGogPSBtaW5MaW5lOyBqIDw9IG1heExpbmU7IGorKyApIHtcblx0XHRcdGxpbmVBcnIucHVzaChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJsaW5lJyArICggbGluZSA9PT0gaiA/ICcgaGlnaGxpZ2h0JyA6ICcnICkgKyAnXCI+JyArXG5cdFx0XHRcdFx0JzxzcGFuIGNsYXNzPVwibGluZS1udW1iZXJcIj4nICsgKCBqICsgMSApICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLWNvbnRlbnRcIj4nICsgc3RyaXBwZWRMaW5lc1sgaiBdICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2soIG51bGwsIGxpbmVBcnIuam9pbignXFxuJykgKTtcblx0fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0UHJvamVjdCxcblx0cnVuVGFzayxcblx0a2lsbFRhc2tzLFxuXHRwcm9jZXNzRmlsZSxcblx0Z2V0RmlsZUNvbmZpZyxcblx0Z2V0RmlsZU9wdGlvbnMsXG5cdHRlcm1pbmF0ZVByb2Nlc3Ncbn1cbiIsIi8qKlxuICogQGZpbGUgUm9vdCByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHsgY29tYmluZVJlZHVjZXJzIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCB2aWV3ID0gKCBjdXJyZW50ID0gJ2ZpbGVzJywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfVklFVyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnZpZXc7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBjdXJyZW50O1xuXHR9XG59O1xuXG5jb25zdCB7IHByb2plY3RzLCBhY3RpdmVQcm9qZWN0LCBhY3RpdmVQcm9qZWN0RmlsZXMgfSA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuY29uc3QgYWN0aXZlRmlsZSA9ICggZmlsZSA9IG51bGwsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnU0VUX0FDVElWRV9GSUxFJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuXHR2aWV3LFxuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzLFxuXHRhY3RpdmVGaWxlXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5sZXQgaW5pdGlhbFByb2plY3RzID0gW107XG5cbmlmICggZ2xvYmFsLmNvbmZpZy5oYXMoJ3Byb2plY3RzJykgKSB7XG5cdGluaXRpYWxQcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xufVxuXG5jb25zdCBwcm9qZWN0cyA9ICggcHJvamVjdHMgPSBpbml0aWFsUHJvamVjdHMsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQUREX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0Li4ucHJvamVjdHMsXG5cdFx0XHRcdGFjdGlvbi5wYXlsb2FkXG5cdFx0XHRdO1xuXHRcdGNhc2UgJ1JFTU9WRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5maWx0ZXIoICggcHJvamVjdCwgaW5kZXggKSA9PiBpbmRleCAhPT0gYWN0aW9uLmlkICk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9qZWN0cztcblx0fVxufTtcblxubGV0IGluaXRpYWxBY3RpdmUgPSB7XG5cdGlkOiBudWxsLFxuXHRuYW1lOiAnJyxcblx0cGF0aDogJycsXG5cdHBhdXNlZDogZmFsc2Vcbn07XG5cbmlmICggaW5pdGlhbFByb2plY3RzLmxlbmd0aCAmJiBnbG9iYWwuY29uZmlnLmhhcygnYWN0aXZlLXByb2plY3QnKSApIHtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBpbml0aWFsUHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0aW5pdGlhbEFjdGl2ZSA9IGluaXRpYWxQcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRpbml0aWFsQWN0aXZlLmlkID0gYWN0aXZlSW5kZXg7XG5cdH1cbn1cblxuY29uc3QgYWN0aXZlUHJvamVjdCA9ICggYWN0aXZlID0gaW5pdGlhbEFjdGl2ZSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0Y2FzZSAnU0VUX1BST0pFQ1RfU1RBVEUnOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uYWN0aXZlLFxuXHRcdFx0XHQuLi5hY3Rpb24ucGF5bG9hZFxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGFjdGl2ZTtcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdEZpbGVzID0gKCBmaWxlcyA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1JFQ0VJVkVfRklMRVMnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmlsZXM7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIExvZ2dlciB1dGlsaXR5LlxuICovXG5cbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5jbGFzcyBMb2dnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmxvZ3MgPSBbXTtcblx0fVxuXG5cdGxvZyggdHlwZSwgdGl0bGUsIGJvZHkgPSAnJyApIHtcblx0XHR0aGlzLmxvZ3MucHVzaCh7XG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0Ym9keTogYm9keSxcblx0XHRcdHRpbWU6IG1vbWVudCgpLmZvcm1hdCgnSEg6bW06c3MuU1NTJylcblx0XHR9KTtcblx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvbG9ncycpICk7XG5cdH1cblxuXHRnZXQoIHR5cGUgPSBudWxsLCBvcmRlciA9ICdkZXNjJyApIHtcblx0XHRsZXQgbG9ncztcblxuXHRcdGlmICggISB0eXBlICkge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncy5maWx0ZXIoIGxvZyA9PiB7IHJldHVybiBsb2cudHlwZSA9PT0gdHlwZSB9ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcmRlciA9PT0gJ2Rlc2MnICkge1xuXHRcdFx0bG9ncyA9IGxvZ3Muc2xpY2UoKS5yZXZlcnNlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxvZ3M7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XG4iLCIvKipcbiAqIEBmaWxlIFdhbGsgYSBkaXJlY3RvcnkgYW5kIHJldHVybiBhbiBvYmplY3Qgb2YgZmlsZXMgYW5kIHN1YmZvbGRlcnMuXG4gKi9cblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwoIHJlcXVpcmUoJ2ZzJykgKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBkaXJlY3RvcnlUcmVlKCBwYXRoLCBvcHRpb25zID0ge30sIGRlcHRoID0gMCApIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICkge1xuXHRcdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0XHRpZiAoIG9wdGlvbnMuZGVwdGggJiYgZGVwdGggPiBvcHRpb25zLmRlcHRoICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5hbWUgPSBmc3BhdGguYmFzZW5hbWUoIHBhdGggKTtcblx0XHRjb25zdCBpdGVtID0geyBwYXRoLCBuYW1lIH07XG5cblx0XHRsZXQgc3RhdHM7XG5cblx0XHR0cnkge1xuXHRcdFx0c3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKTtcblx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdC8vIFNraXAgaWYgaXQgbWF0Y2hlcyB0aGUgZXhjbHVkZSByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGF0cy5pc0ZpbGUoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblxuXHRcdFx0Y29uc3QgZXh0ID0gZnNwYXRoLmV4dG5hbWUoIHBhdGggKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXG5cdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0fSBlbHNlIGlmICggc3RhdHMuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0XHRmcy5yZWFkZGlyKCBwYXRoLCBmdW5jdGlvbiggZXJyLCBmaWxlcyApIHtcblx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIuY29kZSA9PT0gJ0VBQ0NFUycgKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gW107XG5cblx0XHRcdFx0UHJvbWlzZS5tYXAoIGZpbGVzLCBmdW5jdGlvbiggZmlsZSApIHtcblx0XHRcdFx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggZnNwYXRoLmpvaW4oIHBhdGgsIGZpbGUgKSwgb3B0aW9ucywgZGVwdGggKyAxICk7XG5cdFx0XHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBjaGlsZHJlbiApIHtcblx0XHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKCAoZSkgPT4gISFlICk7XG5cdFx0XHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0XHQvLyBcdGNvbnNvbGUubG9nKCBwcmV2LCBjdXIuc2l6ZSApO1xuXHRcdFx0Ly8gXHRyZXR1cm4gcHJldiArIGN1ci5zaXplO1xuXHRcdFx0Ly8gfSwgMCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7IC8vIE9yIHNldCBpdGVtLnNpemUgPSAwIGZvciBkZXZpY2VzLCBGSUZPIGFuZCBzb2NrZXRzID9cblx0XHR9XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yeVRyZWU7XG4iLCIvKipcbiAqIEBmaWxlIEdsb2JhbCBoZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgYXBwJ3MgVUkuXG4gKi9cblxuZnVuY3Rpb24gdW5mb2N1cyggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAndW5mb2N1cycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBsb2FkaW5nKCB0b2dnbGUgPSB0cnVlLCBhcmdzID0ge30gKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ2xvYWRpbmcnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gb3ZlcmxheSggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnb3ZlcmxheScsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCB0cmlnZ2VyRXZlbnQgPSBudWxsLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXG5cdFx0XHRcdGlmICggdHJpZ2dlckV2ZW50ICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIHRyaWdnZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVtb3ZlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG5cdH1cblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dW5mb2N1cyxcblx0bG9hZGluZyxcblx0b3ZlcmxheSxcblx0cmVtb3ZlRm9jdXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBmdW5jdGlvbnMgZm9yIHJlc29sdmluZywgdHJhbnNmb3JtaW5nLCBnZW5lcmF0aW5nIGFuZCBmb3JtYXR0aW5nIHBhdGhzLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvc2xhc2hcbmZ1bmN0aW9uIHNsYXNoKCBpbnB1dCApIHtcblx0Y29uc3QgaXNFeHRlbmRlZExlbmd0aFBhdGggPSAvXlxcXFxcXFxcXFw/XFxcXC8udGVzdChpbnB1dCk7XG5cdGNvbnN0IGhhc05vbkFzY2lpID0gL1teXFx1MDAwMC1cXHUwMDgwXSsvLnRlc3QoaW5wdXQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnRyb2wtcmVnZXhcblxuXHRpZiAoaXNFeHRlbmRlZExlbmd0aFBhdGggfHwgaGFzTm9uQXNjaWkpIHtcblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG5mdW5jdGlvbiBmaWxlT3V0cHV0UGF0aCggZmlsZSwgc3VmZml4ID0gJycsIGV4dGVuc2lvbiA9IGZpbGUuZXh0ZW5zaW9uICkge1xuXHRsZXQgYmFzZWRpciA9IHBhdGgucGFyc2UoIGZpbGUucGF0aCApLmRpcjtcblx0bGV0IGZpbGVuYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoL1xcLlteLy5dKyQvLCAnJykgKyBzdWZmaXggKyBleHRlbnNpb247XG5cblx0cmV0dXJuIHBhdGguam9pbiggYmFzZWRpciwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZmlsZVJlbGF0aXZlUGF0aCggZnJvbSwgdG8gKSB7XG5cdHJldHVybiBwYXRoLnJlbGF0aXZlKCBmcm9tLCB0byApO1xufVxuXG5mdW5jdGlvbiBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuICggcGF0aC5pc0Fic29sdXRlKCBmaWxlbmFtZSApICkgPyBmaWxlbmFtZSA6IHBhdGguam9pbiggYmFzZSwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZGlyQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuIHBhdGgucGFyc2UoIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkgKS5kaXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGFzaCxcblx0ZmlsZU91dHB1dFBhdGgsXG5cdGZpbGVSZWxhdGl2ZVBhdGgsXG5cdGZpbGVBYnNvbHV0ZVBhdGgsXG5cdGRpckFic29sdXRlUGF0aFxufTtcbiIsIi8qKlxuICogQGZpbGUgQ29sbGVjdGlvbiBvZiBoZWxwZXIgZnVuY3Rpb25zLlxuICovXG5cbmZ1bmN0aW9uIHNsZWVwKG1pbGxpc2Vjb25kcykge1xuXHR2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0Zm9yICggdmFyIGkgPSAwOyBpIDwgMWU3OyBpKysgKSB7XG5cdFx0aWYgKCAoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQgKSA+IG1pbGxpc2Vjb25kcyApIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdGxldCBwcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCdwcm9qZWN0cycpO1xuXHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCgnYWN0aXZlLXByb2plY3QnKTtcblxuXHRpZiAoIEFycmF5LmlzQXJyYXkoIHByb2plY3RzICkgJiYgcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0cHJvamVjdHNbIGFjdGl2ZUluZGV4IF1bIHByb3BlcnR5IF0gPSB2YWx1ZTtcblxuXHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBwcm9qZWN0cyApO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZy4nICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZSApIHtcblx0bGV0IGRlcGVuZGVuY2llcyA9IFtdO1xuXG5cdGZvciAoIHZhciBkZXBlbmRlbmN5IGluIGRlcGVuZGVuY3lUcmVlICkge1xuXHRcdGRlcGVuZGVuY2llcy5wdXNoKCBkZXBlbmRlbmN5ICk7XG5cblx0XHRpZiAoIE9iamVjdC5rZXlzKCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkubGVuZ3RoID4gMCApIHtcblx0XHRcdGRlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcy5jb25jYXQoIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApICk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRlcGVuZGVuY2llcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsZWVwLFxuXHRzZXRQcm9qZWN0Q29uZmlnLFxuXHRnZXREZXBlbmRlbmN5QXJyYXlcbn07XG4iXX0=
