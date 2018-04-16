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

},{"./components/App":2,"./gulp/interface":16,"./reducers":17,"./utils/globalUI":20,"./utils/utils":22,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file Main app component.
 */

var React = require('react');

var Sidebar = require('./Sidebar');

var Projects = require('./projects/Projects');

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
		key: 'renderContent',
		value: function renderContent() {
			if (this.state.view === 'files') {
				return React.createElement(Projects, null);
			} else {
				return React.createElement(
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
					this.renderContent()
				)
			);
		}
	}]);

	return App;
}(React.Component);

module.exports = App;

},{"./Sidebar":3,"./projects/Projects":9,"react":undefined}],3:[function(require,module,exports){
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

},{"react":undefined}],4:[function(require,module,exports){
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

},{"react":undefined}],5:[function(require,module,exports){
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

},{"../../utils/pathHelpers":21,"./Field":4,"electron":undefined,"prop-types":undefined,"react":undefined}],6:[function(require,module,exports){
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

},{"./Field":4,"prop-types":undefined,"react":undefined}],7:[function(require,module,exports){
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

},{"./Field":4,"prop-types":undefined,"react":undefined}],8:[function(require,module,exports){
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

},{"electron":undefined,"path":undefined,"react":undefined}],9:[function(require,module,exports){
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

var FileList = require('./filelist/FileList');

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

			global.compiler.initProject();

			global.projectConfig.onDidChange('files', function () {
				global.compiler.initProject();
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

			// Change process cwd.
			process.chdir(path);
			// console.log(`Current directory: ${process.cwd()}`);
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

},{"../../utils/directoryTree":19,"./ProjectSelect":8,"./filelist/FileList":10,"electron-store":undefined,"react":undefined}],10:[function(require,module,exports){
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

},{"./FileListDirectory":11,"./FileListFile":12,"react":undefined}],11:[function(require,module,exports){
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

},{"react":undefined}],12:[function(require,module,exports){
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

var FileOptionsStyle = require('../fileoptions/FileOptionsStyle');

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

},{"../fileoptions/FileOptionsScript":14,"../fileoptions/FileOptionsStyle":15,"react":undefined,"react-dom":undefined}],13:[function(require,module,exports){
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

},{"../../../utils/pathHelpers":21,"react":undefined}],14:[function(require,module,exports){
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

},{"../../fields/FieldSaveFile":5,"../../fields/FieldSwitch":7,"./FileOptions":13,"react":undefined}],15:[function(require,module,exports){
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
			var imports = value ? this.getFileDependencies() : [];

			this.handleChange(event, value);

			this.setFileImports(imports);
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

},{"../../fields/FieldSaveFile":5,"../../fields/FieldSelect":6,"../../fields/FieldSwitch":7,"./FileOptions":13,"react":undefined,"sass-graph":undefined}],16:[function(require,module,exports){
'use strict';

/**
* @file Gulp scripts and tasks.
*/

/* global Notification */

var app = require('electron').remote.app;

var path = require('path');
var spawn = require('child_process').spawn;
var psTree = require('ps-tree');

var OSCmd = process.platform === 'win32' ? '.cmd' : '';
var gulpPath = path.join(__dirname, '..', 'node_modules', '.bin', 'gulp' + OSCmd);
var gulpFilePath = path.join(__dirname, '..', 'app', 'js', 'gulp', 'gulpfile.js');

var _require = require('../utils/pathHelpers'),
    fileAbsolutePath = _require.fileAbsolutePath;

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
			console.log(err);
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = [proc.pid].concat(children.map(function (child) {
				return child.PID;
			}))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var pid = _step2.value;

				process.kill(pid);
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

	if (!fileConfig.options) {
		return;
	}

	var options = getFileConfig(base, fileConfig);

	if (!options) {
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
	});

	// TODO: show progress in menubar menu
	// tray.menu = createTrayMenu(name, [], 'progress here');

	cp.stderr.setEncoding('utf8');

	cp.stderr.on('data', function (data) {
		console.error(data);
	});

	cp.on('exit', function (code) {
		var filename = options.filename || 'file';

		// Remove this task from global array.
		global.compilerTasks = global.compilerTasks.filter(function (proc) {
			return proc.pid !== cp.pid;
		});

		if (code === 0) {
			new Notification('Buildr', {
				body: 'Finished compiling ' + filename + '.',
				silent: true
			});
		} else if (code === 1) {
			console.log('Process %s terminated', cp.pid);
		} else {
			var _filename = options.filename || 'File';

			new Notification('Buildr', {
				body: 'Error when compiling ' + _filename + '.',
				sound: 'Basso'
			});

			console.error('Exited with error code ' + code);
		}

		if (callback) {
			callback(code);
		}
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

},{"../utils/pathHelpers":21,"child_process":undefined,"electron":undefined,"path":undefined,"ps-tree":undefined}],17:[function(require,module,exports){
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

},{"./projects":18,"redux":undefined}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"bluebird":undefined,"fs":undefined,"path":undefined}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"path":undefined}],22:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYXBwLmpzIiwiYXBwL2pzL2NvbXBvbmVudHMvQXBwLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL1NpZGViYXIuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNhdmVGaWxlLmpzeCIsImFwcC9qcy9jb21wb25lbnRzL2ZpZWxkcy9GaWVsZFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdFNlbGVjdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0cy5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlbGlzdC9GaWxlTGlzdC5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlbGlzdC9GaWxlTGlzdERpcmVjdG9yeS5qc3giLCJhcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlbGlzdC9GaWxlTGlzdEZpbGUuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnMuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTY3JpcHQuanN4IiwiYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZS5qc3giLCJhcHAvanMvZ3VscC9pbnRlcmZhY2UuanMiLCJhcHAvanMvcmVkdWNlcnMvaW5kZXguanMiLCJhcHAvanMvcmVkdWNlcnMvcHJvamVjdHMuanMiLCJhcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsImFwcC9qcy91dGlscy9nbG9iYWxVSS5qcyIsImFwcC9qcy91dGls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RWhCLCtCQUZnQjtBQUdoQixtQ0FIZ0I7QUFJaEIsbUNBSmdCO0FBS2hCO0FBTGdCLENBQWpCOzs7OztBQ3JDQTs7OztBQUlBLFNBQVMsS0FBVCxDQUFlLFlBQWYsRUFBNkI7QUFDNUIsS0FBSSxRQUFRLElBQUksSUFBSixHQUFXLE9BQVgsRUFBWjtBQUNBLE1BQU0sSUFBSSxJQUFJLENBQWQsRUFBaUIsSUFBSSxHQUFyQixFQUEwQixHQUExQixFQUFnQztBQUMvQixNQUFPLElBQUksSUFBSixHQUFXLE9BQVgsS0FBdUIsS0FBekIsR0FBbUMsWUFBeEMsRUFBdUQ7QUFDdEQ7QUFDQTtBQUNEO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2hCO0FBRGdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnYnVpbGRyLWNvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vZ3VscC9pbnRlcmZhY2UnKTtcblxuZ2xvYmFsLmNvbXBpbGVyVGFza3MgPSBbXTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCB7IFByb3ZpZGVyIH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IGNyZWF0ZVN0b3JlIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCByb290UmVkdWNlciA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIgKTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuLy8gQ29udGV4dCBtZW51LlxuY29uc3QgZmlsZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZXMnKTtcbi8vIGNvbnN0IGZpbGVuYW1lcyA9IGZpbGVMaXN0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xuXG5maWxlTGlzdC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdGxldCBmaWxlTmFtZUNvbnQgPSBldmVudC50YXJnZXQ7XG5cblx0aWYgKCBmaWxlTmFtZUNvbnQudGFnTmFtZSAhPT0gJ2xpJyApIHtcblx0XHRmaWxlTmFtZUNvbnQgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnbGknKTtcblx0fVxuXG5cdGlmICggZmlsZU5hbWVDb250LmRhdGFzZXQuZmlsZSApIHtcblx0XHRjb25zb2xlLmxvZyggSlNPTi5wYXJzZSggZGVjb2RlVVJJQ29tcG9uZW50KCBmaWxlTmFtZUNvbnQuZGF0YXNldC5maWxlICkgKSApO1xuXHR9XG59KTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBjb21wb25lbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dmlldzogJ2ZpbGVzJ1xuXHRcdH07XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHR0ZXJtOiAnVGVybWluYWwnLFxuXHRcdFx0c2V0dGluZ3M6ICdTZXR0aW5ncydcblx0XHR9O1xuXG5cdFx0dGhpcy5jaGFuZ2VWaWV3ID0gdGhpcy5jaGFuZ2VWaWV3LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IHZpZXcgfSk7XG5cdH1cblxuXHRyZW5kZXJDb250ZW50KCkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0cmV0dXJuIDxQcm9qZWN0cyAvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PFJlYWN0LkZyYWdtZW50PlxuXHRcdFx0XHRcdDxoMj57IHRoaXMudmlld3NbIHRoaXMuc3RhdGUudmlldyBdIH08L2gyPlxuXHRcdFx0XHRcdDxwPllvdSBzaG91bGRuJ3QgYmUgaGVyZSwgeW91IG5hdWdodHkgbmF1Z2h0eSBib3kuPC9wPlxuXHRcdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2FwcCc+XG5cdFx0XHRcdDxTaWRlYmFyXG5cdFx0XHRcdFx0aXRlbXM9eyB0aGlzLnZpZXdzIH1cblx0XHRcdFx0XHRhY3RpdmU9eyB0aGlzLnN0YXRlLnZpZXcgfVxuXHRcdFx0XHRcdGNoYW5nZVZpZXc9eyB0aGlzLmNoYW5nZVZpZXcgfVxuXHRcdFx0XHQvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsIi8qKlxuICogQGZpbGUgQXBwIHNpZGViYXIuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBTaWRlYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGxldCB2aWV3ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnZpZXc7XG5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVZpZXcoIHZpZXcgKTtcblx0fVxuXG5cdHJlbmRlckl0ZW1zKCkge1xuXHRcdGxldCBpdGVtcyA9IFtdO1xuXG5cdFx0Zm9yICggdmFyIGlkIGluIHRoaXMucHJvcHMuaXRlbXMgKSB7XG5cdFx0XHRpdGVtcy5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS12aWV3PXsgaWQgfVxuXHRcdFx0XHRcdGRhdGEtdGlwPXsgdGhpcy5wcm9wcy5pdGVtc1sgaWQgXSB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgdGhpcy5wcm9wcy5hY3RpdmUgPT09IGlkID8gJ2FjdGl2ZScgOiAnJyB9XG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMub25DbGljayB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8bmF2IGlkPSdzaWRlYmFyJz5cblx0XHRcdFx0PGRpdiBpZD0nbG9nbycgLz5cblxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaWRlYmFyO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRwYXRoOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBwYXRoID0gKCBuZXh0UHJvcHMudmFsdWUgPT09IG51bGwgKSA/ICcnIDogbmV4dFByb3BzLnZhbHVlO1xuXG5cdFx0cmV0dXJuIHsgcGF0aCB9O1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVNhdmVPcHRpb25zID0ge307XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nVGl0bGUgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMudGl0bGUgPSB0aGlzLnByb3BzLmRpYWxvZ1RpdGxlO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnN0YXRlLnBhdGggJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5zdGF0ZS5wYXRoICYmIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5kZWZhdWx0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuc291cmNlQmFzZSwgdGhpcy5zdGF0ZS5wYXRoICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmRpYWxvZ0ZpbHRlcnMgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZmlsdGVycyA9IHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBkaWFsb2cuc2hvd1NhdmVEaWFsb2coIGZpbGVTYXZlT3B0aW9ucyApO1xuXG5cdFx0aWYgKCBmaWxlbmFtZSApIHtcblx0XHRcdGxldCBzYXZlUGF0aCA9IHNsYXNoKCBmaWxlbmFtZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMuc291cmNlQmFzZSApIHtcblx0XHRcdFx0c2F2ZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5zb3VyY2VCYXNlLCBmaWxlbmFtZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoeyBwYXRoOiBzYXZlUGF0aCB9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIGV2ZW50LCBzYXZlUGF0aCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzYXZlLWZpbGUnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR0eXBlPSd0ZXh0J1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5wYXRoIH1cblx0XHRcdFx0XHRyZWFkT25seT0ndHJ1ZSdcblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHQvPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2F2ZUZpbGUucHJvcFR5cGVzID0ge1xuXHRuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGxhYmVsUG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cdHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRzb3VyY2VGaWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXHRkaWFsb2dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0ZGlhbG9nRmlsdGVyczogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLm9iamVjdCBdKSxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2F2ZUZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgYSBkcm9wZG93biBzZWxlY3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRzZWxlY3RlZDogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcywgcHJldlN0YXRlICkge1xuXHRcdGxldCBzZWxlY3RlZCA9ICggbmV4dFByb3BzLnZhbHVlID09PSBudWxsICkgPyBmYWxzZSA6IG5leHRQcm9wcy52YWx1ZTtcblxuXHRcdHJldHVybiB7IHNlbGVjdGVkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IHNlbGVjdGVkOiBldmVudC50YXJnZXQudmFsdWUgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuc2VsZWN0ZWQgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSBbXTtcblxuXHRcdGZvciAoIGxldCB2YWx1ZSBpbiB0aGlzLnByb3BzLm9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goXG5cdFx0XHRcdDxvcHRpb24ga2V5PXsgdmFsdWUgfSB2YWx1ZT17IHZhbHVlIH0+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLm9wdGlvbnNbIHZhbHVlIF0gfVxuXHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxGaWVsZCB0eXBlPSdzZWxlY3QnIGxhYmVsPXsgdGhpcy5wcm9wcy5sYWJlbCB9IGxhYmVsUG9zPXsgdGhpcy5wcm9wcy5sYWJlbFBvcyB9PlxuXHRcdFx0XHQ8bGFiZWxcblx0XHRcdFx0XHRodG1sRm9yPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnNlbGVjdGVkID8gdGhpcy5wcm9wcy5vcHRpb25zWyB0aGlzLnN0YXRlLnNlbGVjdGVkIF0gOiAnJyB9XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHRcdDxzZWxlY3Rcblx0XHRcdFx0XHRuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMub25DaGFuZ2UgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5zdGF0ZS5zZWxlY3RlZCB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHsgdGhpcy5nZXRPcHRpb25zKCkgfVxuXHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFNlbGVjdC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5vbmVPZlR5cGUoWyBQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyIF0pLFxuXHRvcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHRvZ2dsZSBzd2l0Y2guXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmNvbnN0IEZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG5jbGFzcyBGaWVsZFN3aXRjaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRjaGVja2VkOiB0aGlzLnByb3BzLnZhbHVlXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzLCBwcmV2U3RhdGUgKSB7XG5cdFx0bGV0IGNoZWNrZWQgPSAoIG5leHRQcm9wcy52YWx1ZSA9PT0gbnVsbCApID8gZmFsc2UgOiBuZXh0UHJvcHMudmFsdWU7XG5cblx0XHRyZXR1cm4geyBjaGVja2VkIH07XG5cdH1cblxuXHRvbkNoYW5nZSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdHJldHVybiB7IGNoZWNrZWQ6ICEgcHJldlN0YXRlLmNoZWNrZWQgfTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSggZXZlbnQsIHRoaXMuc3RhdGUuY2hlY2tlZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5zdGF0ZS5jaGVja2VkIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH0+eyB0aGlzLnByb3BzLmxhYmVsIH08L2xhYmVsPlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU3dpdGNoLnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLmJvb2wsXG5cdGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFN3aXRjaDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBQcm9qZWN0U2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IHRoaXMudG9nZ2xlU2VsZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNlbGVjdFByb2plY3QgPSB0aGlzLnNlbGVjdFByb2plY3QuYmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRnbG9iYWwudWkudW5mb2N1cyggISBwcmV2U3RhdGUuaXNPcGVuICk7XG5cblx0XHRcdHJldHVybiB7IGlzT3BlbjogISBwcmV2U3RhdGUuaXNPcGVuIH07XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHRpZiAoIGluZGV4ID09PSAnbmV3JyApIHtcblx0XHRcdHRoaXMubmV3UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoYW5nZVByb2plY3QoIGluZGV4ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QoKTtcblx0fVxuXG5cdGNoYW5nZVByb2plY3QoIGluZGV4ICkge1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggaW5kZXggKTtcblx0fVxuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuXHRcdFx0cHJvcGVydGllczogWyAnb3BlbkRpcmVjdG9yeScgXVxuXHRcdH0pO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cztcblxuXHRcdFx0bGV0IG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRwYXRoOiBwYXRoWzBdXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIHByb2plY3RzLmZpbmRJbmRleCggcHJvamVjdCA9PiBwcm9qZWN0LnBhdGggPT09IG5ld1Byb2plY3QucGF0aCApICE9PSAtMSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcm9qZWN0cy5wdXNoKCBuZXdQcm9qZWN0ICk7XG5cblx0XHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdHMoIHByb2plY3RzICk7XG5cblx0XHRcdGxldCBhY3RpdmVJbmRleCA9IHByb2plY3RzLmxlbmd0aCAtIDE7XG5cblx0XHRcdGlmICggcHJvamVjdHNbIGFjdGl2ZUluZGV4IF0gKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlUHJvamVjdCggYWN0aXZlSW5kZXggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gY2hhbmdpbmcgdGhlIGFjdGl2ZSBwcm9qZWN0LicgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW5kZXJDaG9pY2VzKCkge1xuXHRcdGxldCBjaG9pY2VzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaW5kZXggaW4gdGhpcy5wcm9wcy5wcm9qZWN0cyApIHtcblx0XHRcdGNob2ljZXMucHVzaChcblx0XHRcdFx0PGRpdiBrZXk9eyBpbmRleCB9IGRhdGEtcHJvamVjdD17IGluZGV4IH0gb25DbGljaz17IHRoaXMuc2VsZWN0UHJvamVjdCB9PlxuXHRcdFx0XHRcdHsgdGhpcy5wcm9wcy5wcm9qZWN0c1sgaW5kZXggXS5uYW1lIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNob2ljZXMucHVzaChcblx0XHRcdDxkaXYga2V5PSduZXcnIGRhdGEtcHJvamVjdD0nbmV3JyBvbkNsaWNrPXsgdGhpcy5zZWxlY3RQcm9qZWN0IH0+XG5cdFx0XHRcdEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblxuXHRcdHJldHVybiBjaG9pY2VzO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggISB0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICEgdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0Jz5cblx0XHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMubmV3UHJvamVjdCB9PlxuXHRcdFx0XHRcdFx0PGgxPk5vIFByb2plY3QgU2VsZWN0ZWQ8L2gxPlxuXHRcdFx0XHRcdFx0PGgyPkNsaWNrIGhlcmUgdG8gYWRkIG9uZS4uLjwvaDI+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17IHRoaXMudG9nZ2xlU2VsZWN0IH0+XG5cdFx0XHRcdFx0PGgxPnsgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB9PC9oMT5cblx0XHRcdFx0XHQ8aDI+eyB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoIH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QtZHJvcGRvd24nIGNsYXNzTmFtZT17IHRoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJycgfT5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hvaWNlcygpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdFNlbGVjdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgdmlldy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RpcmVjdG9yeVRyZWUnKTtcblxuY2xhc3MgUHJvamVjdHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSBbXTtcblx0XHRsZXQgYWN0aXZlID0ge1xuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRwYXRoOiAnJ1xuXHRcdH07XG5cblx0XHRpZiAoIGdsb2JhbC5jb25maWcuaGFzKCdwcm9qZWN0cycpICkge1xuXHRcdFx0cHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblxuXHRcdFx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0XHRcdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdFx0YWN0aXZlID0gcHJvamVjdHNbIGFjdGl2ZUluZGV4IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHByb2plY3RzLFxuXHRcdFx0YWN0aXZlLFxuXHRcdFx0ZmlsZXM6IG51bGwsXG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnYnVpbGRyLXByb2plY3QuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLnNldFByb2plY3RzID0gdGhpcy5zZXRQcm9qZWN0cy5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5zZXRBY3RpdmVQcm9qZWN0ID0gdGhpcy5zZXRBY3RpdmVQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICggdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCApIHtcblx0XHRcdHRoaXMuc2V0UHJvamVjdFBhdGgoIHRoaXMuc3RhdGUuYWN0aXZlLnBhdGggKTtcblx0XHR9XG5cdH1cblxuXHRzZXRQcm9qZWN0cyggcHJvamVjdHMgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRwcm9qZWN0c1xuXHRcdH0pO1xuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH1cblxuXHRzZXRBY3RpdmVQcm9qZWN0KCBpbmRleCApIHtcblx0XHRsZXQgYWN0aXZlID0gdGhpcy5zdGF0ZS5wcm9qZWN0c1sgaW5kZXggXTtcblxuXHRcdGlmICggYWN0aXZlICYmIGFjdGl2ZS5wYXRoICE9PSB0aGlzLnN0YXRlLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGFjdGl2ZVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc2V0UHJvamVjdFBhdGgoIGFjdGl2ZS5wYXRoICk7XG5cblx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAnYWN0aXZlLXByb2plY3QnLCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHNldFByb2plY3RDb25maWcoIHBhdGggKSB7XG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBuZXcgU3RvcmUoe1xuXHRcdFx0bmFtZTogJ2J1aWxkci1wcm9qZWN0Jyxcblx0XHRcdGN3ZDogcGF0aFxuXHRcdH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLmluaXRQcm9qZWN0KCk7XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5vbkRpZENoYW5nZSggJ2ZpbGVzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIuaW5pdFByb2plY3QoKTtcblx0XHR9KTtcblx0fVxuXG5cdHdhbGtEaXJlY3RvcnkoIHBhdGggKSB7XG5cdFx0bGV0IGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKCB0aGlzLnN0YXRlLmlnbm9yZWQuam9pbignfCcpLCAnaScgKTtcblxuXHRcdHJldHVybiBkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KTtcblx0fVxuXG5cdHNldFByb2plY3RQYXRoKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdHRoaXMud2Fsa0RpcmVjdG9yeSggcGF0aCApLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmaWxlcyxcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0pO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSk7XG5cblx0XHR0aGlzLnNldFByb2plY3RDb25maWcoIHBhdGggKTtcblxuXHRcdC8vIENoYW5nZSBwcm9jZXNzIGN3ZC5cblx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cdFx0Ly8gY29uc29sZS5sb2coYEN1cnJlbnQgZGlyZWN0b3J5OiAke3Byb2Nlc3MuY3dkKCl9YCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZWFjdC5GcmFnbWVudD5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHQ8UHJvamVjdFNlbGVjdFxuXHRcdFx0XHRcdFx0YWN0aXZlPXsgdGhpcy5zdGF0ZS5hY3RpdmUgfVxuXHRcdFx0XHRcdFx0cHJvamVjdHM9eyB0aGlzLnN0YXRlLnByb2plY3RzIH1cblx0XHRcdFx0XHRcdHNldFByb2plY3RzPXsgdGhpcy5zZXRQcm9qZWN0cyB9XG5cdFx0XHRcdFx0XHRzZXRBY3RpdmVQcm9qZWN0PXsgdGhpcy5zZXRBY3RpdmVQcm9qZWN0IH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0nY29udGVudCc+XG5cdFx0XHRcdFx0PEZpbGVMaXN0XG5cdFx0XHRcdFx0XHRwYXRoPXsgdGhpcy5zdGF0ZS5hY3RpdmUucGF0aCB9XG5cdFx0XHRcdFx0XHRmaWxlcz17IHRoaXMuc3RhdGUuZmlsZXMgfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L1JlYWN0LkZyYWdtZW50PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0cztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgRmlsZUxpc3RGaWxlLCBGaWxlTGlzdFBsYWNlaG9sZGVyIH0gPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0YWN0aXZlRmlsZTogbnVsbFxuXHRcdH07XG5cblx0XHR0aGlzLnNldEFjdGl2ZUZpbGUgPSB0aGlzLnNldEFjdGl2ZUZpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ29mZi1jYW52YXMtaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cdFx0fS5iaW5kKCB0aGlzICkpO1xuXHR9XG5cblx0Z2V0TWltZVR5cGUoIGV4dCApIHtcblx0XHRsZXQgdHlwZTtcblxuXHRcdHN3aXRjaCAoIGV4dCApIHtcblx0XHRcdGNhc2UgJy5zdmcnOlxuXHRcdFx0Y2FzZSAnLnBuZyc6XG5cdFx0XHRjYXNlICcuanBnJzpcblx0XHRcdFx0dHlwZSA9ICdtZWRpYSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcucGhwJzpcblx0XHRcdGNhc2UgJy5odG1sJzpcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0Y2FzZSAnLmpzJzpcblx0XHRcdGNhc2UgJy50cyc6XG5cdFx0XHRjYXNlICcuanN4Jzpcblx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0dHlwZSA9ICdjb2RlJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy56aXAnOlxuXHRcdFx0Y2FzZSAnLnJhcic6XG5cdFx0XHRjYXNlICcudGFyJzpcblx0XHRcdGNhc2UgJy43eic6XG5cdFx0XHRjYXNlICcuZ3onOlxuXHRcdFx0XHR0eXBlID0gJ3ppcCc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gJ3RleHQnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdHNldEFjdGl2ZUZpbGUoIGVsZW1lbnQgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLmFjdGl2ZUZpbGUgJiYgdGhpcy5zdGF0ZS5hY3RpdmVGaWxlID09PSBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGlmICggcHJldlN0YXRlLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHRcdHByZXZTdGF0ZS5hY3RpdmVGaWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBhY3RpdmVGaWxlOiBlbGVtZW50IH07XG5cdFx0fSlcblx0fVxuXG5cdGJ1aWxkVHJlZSggZmlsZSwgbGV2ZWwgPSAwICkge1xuXHRcdGxldCB0eXBlID0gZmlsZS50eXBlO1xuXHRcdGxldCBleHQgPSBmaWxlLmV4dGVuc2lvbiB8fCBudWxsO1xuXHRcdGxldCBjaGlsZHJlbjtcblxuXHRcdGlmICggZmlsZS50eXBlID09PSAnZGlyZWN0b3J5JyApIHtcblx0XHRcdGlmICggZmlsZS5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0XHRsZXQgY2hpbGRyZW5JdGVtcyA9IFtdO1xuXG5cdFx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiBmaWxlLmNoaWxkcmVuICkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSXRlbXMucHVzaCggdGhpcy5idWlsZFRyZWUoIGZpbGUuY2hpbGRyZW5bIGNoaWxkIF0sIGxldmVsICsgMSApICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaGlsZHJlbiA9IDx1bCBjbGFzc05hbWU9J2NoaWxkcmVuJyBrZXk9eyBmaWxlLnBhdGggKyAnLWNoaWxkcmVuJyB9PnsgY2hpbGRyZW5JdGVtcyB9PC91bD47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3REaXJlY3Rvcnlcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0Y2hpbGRyZW49eyBjaGlsZHJlbiB9XG5cdFx0XHQvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZSA9IHRoaXMuZ2V0TWltZVR5cGUoIGV4dCApO1xuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RmlsZVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdHR5cGU9eyB0eXBlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGJhc2U9eyB0aGlzLnByb3BzLnBhdGggfVxuXHRcdFx0XHRzZXRBY3RpdmVGaWxlPXsgdGhpcy5zZXRBY3RpdmVGaWxlIH1cblx0XHRcdC8+O1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlclRyZWUoKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmxvYWRpbmcgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdsb2FkaW5nJz5cblx0XHRcdFx0XHRMb2FkaW5nICZoZWxsaXA7XG5cdFx0XHRcdDwvRmlsZUxpc3RQbGFjZWhvbGRlcj5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLnBhdGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8RmlsZUxpc3RQbGFjZWhvbGRlciB0eXBlPSdlbXB0eSc+XG5cdFx0XHRcdFx0Tm8gZm9sZGVyIHNlbGVjdGVkLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5maWxlcyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxGaWxlTGlzdFBsYWNlaG9sZGVyIHR5cGU9J2VtcHR5Jz5cblx0XHRcdFx0XHROb3RoaW5nIHRvIHNlZSBoZXJlLlxuXHRcdFx0XHQ8L0ZpbGVMaXN0UGxhY2Vob2xkZXI+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbGlzdCA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICYmIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdC8vIFNob3cgb25seSB0aGUgY29udGVudHMgb2YgdGhlIHRvcC1sZXZlbCBkaXJlY3RvcnkuXG5cdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiApIHtcblx0XHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW5bIGNoaWxkIF0gKSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVsaXN0O1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlclRyZWUoKSB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciByZW5kZXJpbmcgYSBkaXJlY3RvcnkgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RGlyZWN0b3J5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGV4cGFuZGVkOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0cmVuZGVyQ2hpbGRyZW4oKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1NjcmlwdCA9IHJlcXVpcmUoJy4uL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU3R5bGUgPSByZXF1aXJlKCcuLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRPcHRpb25zKCBmaWxlICkge1xuXHRcdGlmICggISBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIGZpbGUuZXh0ZW5zaW9uICkge1xuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTdHlsZSBiYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH0gZmlsZT17IGZpbGUgfSAvPjtcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRcdHJldHVybiA8RmlsZU9wdGlvbnNTY3JpcHQgYmFzZT17IHRoaXMucHJvcHMuYmFzZSB9IGZpbGU9eyBmaWxlIH0gLz47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG5cdFx0bGV0IF9GaWxlT3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyggdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRpZiAoICEgX0ZpbGVPcHRpb25zICkge1xuXHRcdFx0Z2xvYmFsLnVpLm9mZkNhbnZhcyggZmFsc2UgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hhcy1vcHRpb25zJyk7XG5cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHRfRmlsZU9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpXG5cdFx0KTtcblxuXHRcdGdsb2JhbC51aS5vZmZDYW52YXMoIHRydWUsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlcycpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaSBjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfSBvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIEZpbGVMaXN0UGxhY2Vob2xkZXIoIHByb3BzICkge1xuXHRyZXR1cm4gKFxuXHRcdDxsaSBjbGFzc05hbWU9eyBwcm9wcy50eXBlICsgJyBpbmZvcm1hdGl2ZScgfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpbm5lcic+eyBwcm9wcy5jaGlsZHJlbiB9PC9kaXY+XG5cdFx0PC9saT5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdEZpbGVMaXN0RmlsZSxcblx0RmlsZUxpc3RQbGFjZWhvbGRlclxufVxuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlID0gdGhpcy5oYW5kbGVDb21waWxlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnNldE91dHB1dFBhdGggPSB0aGlzLnNldE91dHB1dFBhdGguYmluZCggdGhpcyApO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBjb21waWxlT3B0aW9ucyA9IGdsb2JhbC5jb21waWxlci5nZXRGaWxlT3B0aW9ucyggbmV4dFByb3BzLmZpbGUgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBjb21waWxlT3B0aW9ucy50eXBlLFxuXHRcdFx0ZmlsZVR5cGU6IGNvbXBpbGVPcHRpb25zLmZpbGVUeXBlLFxuXHRcdFx0YnVpbGRUYXNrTmFtZTogY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZSxcblx0XHRcdG9wdGlvbnM6IEZpbGVPcHRpb25zLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBuZXh0UHJvcHMuYmFzZSwgbmV4dFByb3BzLmZpbGUgKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0bGV0IGNmaWxlID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKTtcblxuXHRcdHJldHVybiAoIGNmaWxlICYmIGNmaWxlLm9wdGlvbnMgKSA/IGNmaWxlLm9wdGlvbnMgOiB7fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRpZiAoIGZpbGUgJiYgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICkgKTtcblxuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdFx0aWYgKCBjZmlsZSApIHtcblx0XHRcdFx0cmV0dXJuIGNmaWxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldENvbmZpZyggcHJvcGVydHksIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0bGV0IGRlZmF1bHRzID0ge1xuXHRcdFx0cGF0aDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApLFxuXHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCksXG5cdFx0XHRvcHRpb25zOiB7fVxuXHRcdH07XG5cblx0XHRsZXQgc3RvcmVkID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRsZXQgY29uZmlnID0gKCBzdG9yZWQgIT09IGZhbHNlICkgPyBzdG9yZWQgOiBkZWZhdWx0cztcblxuXHRcdGlmICggcHJvcGVydHkgKSB7XG5cdFx0XHRyZXR1cm4gKCBjb25maWdbIHByb3BlcnR5IF0gKSA/IGNvbmZpZ1sgcHJvcGVydHkgXSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9XG5cdH1cblxuXHRzZXRDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0XHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgfHwgISBwcm9wZXJ0eSApIHtcblx0XHRcdHdpbmRvdy5hbGVydCggJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2F2aW5nIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICkgKTtcblxuXHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRsZXQgZmlsZUluZGV4ID0gZmlsZXMuZmluZEluZGV4KCBmaWxlID0+IGZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdGlmICggZmlsZUluZGV4ID09PSAtMSApIHtcblx0XHRcdGxldCBmaWxlQ29uZmlnID0ge1xuXHRcdFx0XHRwYXRoOiBmaWxlUGF0aCxcblx0XHRcdFx0dHlwZTogdGhpcy5zdGF0ZS5maWxlVHlwZSxcblx0XHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKClcblx0XHRcdH07XG5cblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcblx0XHRcdFx0ZmlsZUNvbmZpZ1sgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0ZmlsZXMucHVzaCggZmlsZUNvbmZpZyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHRcdGRlbGV0ZSBmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcuc2V0KCAnZmlsZXMnLCBmaWxlcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9uKCBvcHRpb24sIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLm9wdGlvbnMgJiYgdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRzZXRPcHRpb24oIG9wdGlvbiwgdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSggZnVuY3Rpb24oIHByZXZTdGF0ZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gcHJldlN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0XHRvcHRpb25zWyBvcHRpb24gXSA9IHZhbHVlO1xuXG5cdFx0XHRyZXR1cm4geyBvcHRpb25zIH07XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnNldENvbmZpZyggJ29wdGlvbnMnLCB0aGlzLnN0YXRlLm9wdGlvbnMgKTtcblx0XHR9KTtcblx0fVxuXG5cdGhhbmRsZUNoYW5nZSggZXZlbnQsIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0T3B0aW9uKCBldmVudC50YXJnZXQubmFtZSwgdmFsdWUgKTtcblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlLCB0aGlzLm91dHB1dFN1ZmZpeCwgdGhpcy5vdXRwdXRFeHRlbnNpb24gKTtcblx0fVxuXG5cdHNldE91dHB1dFBhdGgoIGV2ZW50LCBwYXRoICkge1xuXHRcdHRoaXMuc2V0Q29uZmlnKCAnb3V0cHV0JywgcGF0aCApO1xuXHR9XG5cblx0Z2V0T3V0cHV0UGF0aCggdHlwZSA9ICdyZWxhdGl2ZScgKSB7XG5cdFx0bGV0IHNsYXNoUGF0aCA9ICggdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aCA9ICggdHlwZSA9PT0gJ3JlbGF0aXZlJyB8fCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCk7XG5cdFx0bGV0IG91dHB1dFBhdGggPSB0aGlzLmdldENvbmZpZyggJ291dHB1dCcsIGRlZmF1bHRQYXRoICk7XG5cblx0XHRpZiAoIHJlbGF0aXZlUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggc2xhc2hQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IHNsYXNoKCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFBhdGg7XG5cdH1cblxuXHRzZXRGaWxlSW1wb3J0cyggaW1wb3J0cyApIHtcblx0XHRsZXQgcmVsYXRpdmVJbXBvcnRzID0gaW1wb3J0cy5tYXAoIHBhdGggPT4gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgcGF0aCApICkgKTtcblxuXHRcdHRoaXMuc2V0Q29uZmlnKCAnaW1wb3J0cycsIHJlbGF0aXZlSW1wb3J0cyApO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHRnbG9iYWwudWkubG9hZGluZyggdHJ1ZSApO1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdGZ1bmN0aW9uKCBjb2RlICkge1xuXHRcdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyQnV0dG9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zdGF0ZS5sb2FkaW5nIH1cblx0XHRcdD5cblx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHQ8L2J1dHRvbj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0NvbXByZXNzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdjb21wcmVzcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyQnV0dG9uKCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBzYXNzR3JhcGggPSByZXF1aXJlKCdzYXNzLWdyYXBoJyk7XG5cbmNsYXNzIEZpbGVPcHRpb25zU3R5bGVzIGV4dGVuZHMgRmlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm91dHB1dFN1ZmZpeCA9ICctZGlzdCc7XG5cdFx0dGhpcy5vdXRwdXRFeHRlbnNpb24gPSAnLmNzcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0NTUycsIGV4dGVuc2lvbnM6IFsgJ2NzcycgXSB9XG5cdFx0XTtcblxuXHRcdHRoaXMuaGFuZGxlQXV0b0NvbXBpbGUgPSB0aGlzLmhhbmRsZUF1dG9Db21waWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGlzUGFydGlhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlLm5hbWUuc3RhcnRzV2l0aCgnXycpO1xuXHR9XG5cblx0Z2V0RmlsZURlcGVuZGVuY2llcygpIHtcblx0XHRsZXQgZ3JhcGggPSBzYXNzR3JhcGgucGFyc2VGaWxlKCB0aGlzLnByb3BzLmZpbGUucGF0aCApO1xuXG5cdFx0aWYgKCBncmFwaCAmJiBncmFwaC5pbmRleCAmJiBncmFwaC5pbmRleFsgdGhpcy5wcm9wcy5maWxlLnBhdGggXSApIHtcblx0XHRcdHJldHVybiBncmFwaC5pbmRleFsgdGhpcy5wcm9wcy5maWxlLnBhdGggXS5pbXBvcnRzO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXTtcblx0fVxuXG5cdGhhbmRsZUF1dG9Db21waWxlKCBldmVudCwgdmFsdWUgKSB7XG5cdFx0bGV0IGltcG9ydHMgPSAoIHZhbHVlICkgPyB0aGlzLmdldEZpbGVEZXBlbmRlbmNpZXMoKSA6IFtdO1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UoIGV2ZW50LCB2YWx1ZSApO1xuXG5cdFx0dGhpcy5zZXRGaWxlSW1wb3J0cyggaW1wb3J0cyApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0XHQ8cD5UaGlzIGlzIGEgcGFydGlhbCBmaWxlLCBpdCBjYW5ub3QgYmUgY29tcGlsZWQgYnkgaXRzZWxmLjwvcD5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuc2V0T3V0cHV0UGF0aCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUF1dG9Db21waWxlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsgdGhpcy5zdGF0ZS50eXBlID09PSAnc2FzcycgJiZcblx0XHRcdFx0XHRcdDxGaWVsZFNlbGVjdFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdzdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBTdHlsZSdcblx0XHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc3R5bGUnLCAnbmVzdGVkJyApIH1cblx0XHRcdFx0XHRcdFx0b3B0aW9ucz17IHtcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWQ6ICdOZXN0ZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXBhY3Q6ICdDb21wYWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogJ0V4cGFuZGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wcmVzc2VkOiAnQ29tcHJlc3NlZCdcblx0XHRcdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nc291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsPSdTb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b3ByZWZpeGVyJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2Zvb3Rlcic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlckJ1dHRvbigpIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTdHlsZXM7XG4iLCIvKipcbiogQGZpbGUgR3VscCBzY3JpcHRzIGFuZCB0YXNrcy5cbiovXG5cbi8qIGdsb2JhbCBOb3RpZmljYXRpb24gKi9cblxuY29uc3QgeyBhcHAgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgc3Bhd24gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd247XG5jb25zdCBwc1RyZWUgPSByZXF1aXJlKCdwcy10cmVlJyk7XG5cbmNvbnN0IE9TQ21kID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/ICcuY21kJyA6ICcnO1xuY29uc3QgZ3VscFBhdGggPSBwYXRoLmpvaW4oIF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICcuYmluJywgJ2d1bHAnICsgT1NDbWQgKTtcbmNvbnN0IGd1bHBGaWxlUGF0aCA9IHBhdGguam9pbiggX19kaXJuYW1lLCAnLi4nLCAnYXBwJywgJ2pzJywgJ2d1bHAnLCAnZ3VscGZpbGUuanMnICk7XG5cbmNvbnN0IHsgZmlsZUFic29sdXRlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuZnVuY3Rpb24ga2lsbFRhc2tzKCkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCApIHtcblx0XHRmb3IgKCB2YXIgdGFzayBvZiBnbG9iYWwuY29tcGlsZXJUYXNrcyApIHtcblx0XHRcdHRlcm1pbmF0ZVByb2Nlc3MoIHRhc2sgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRlUHJvY2VzcyggcHJvYyApIHtcblx0cHNUcmVlKCBwcm9jLnBpZCwgZnVuY3Rpb24oIGVyciwgY2hpbGRyZW4gKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggZXJyICk7XG5cdFx0fVxuXG5cdFx0Zm9yICggdmFyIHBpZCBvZiBbIHByb2MucGlkIF0uY29uY2F0KCBjaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLlBJRCApICkgKSB7XG5cdFx0XHRwcm9jZXNzLmtpbGwoIHBpZCApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRQcm9qZWN0KCkge1xuXHRraWxsVGFza3MoKTtcblxuXHRpZiAoICEgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblxuXHRsZXQgcHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKCBnbG9iYWwucHJvamVjdENvbmZpZy5wYXRoICkuZGlyO1xuXG5cdGZvciAoIHZhciBmaWxlQ29uZmlnIG9mIHByb2plY3RGaWxlcyApIHtcblx0XHRwcm9jZXNzRmlsZSggcHJvamVjdFBhdGgsIGZpbGVDb25maWcgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzRmlsZSggYmFzZSwgZmlsZUNvbmZpZywgdGFza05hbWUgPSBudWxsLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IG9wdGlvbnMgPSBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICk7XG5cblx0aWYgKCAhIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCB0YXNrTmFtZSApIHtcblx0XHRydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRsZXQgd2F0Y2hGaWxlcyA9IFtdO1xuXG5cdFx0aWYgKCBmaWxlQ29uZmlnLmltcG9ydHMgJiYgZmlsZUNvbmZpZy5pbXBvcnRzLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHR3YXRjaEZpbGVzID0gZmlsZUNvbmZpZy5pbXBvcnRzLm1hcCggaW1wb3J0UGF0aCA9PiBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBpbXBvcnRQYXRoICkgKTtcblx0XHR9XG5cblx0XHR3YXRjaEZpbGVzLnB1c2goIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVDb25maWcucGF0aCApICk7XG5cblx0XHRvcHRpb25zLndhdGNoRmlsZXMgPSB3YXRjaEZpbGVzLmpvaW4oJyAnKTtcblxuXHRcdHJ1blRhc2soICd3YXRjaCcsIG9wdGlvbnMgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3B0aW9ucyggZmlsZSApIHtcblx0bGV0IG9wdGlvbnMgPSB7fTtcblxuXHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRjYXNlICcuY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdjc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdzYXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdsZXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5qcyc6XG5cdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnanMnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzY3JpcHQnO1xuXHR9XG5cblx0b3B0aW9ucy5idWlsZFRhc2tOYW1lID0gJ2J1aWxkLScgKyBvcHRpb25zLnR5cGU7XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLnBhdGggfHwgISBmaWxlQ29uZmlnLm91dHB1dCApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgZmlsZVBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLnBhdGggKTtcblx0bGV0IG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLm91dHB1dCApO1xuXHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnZXRGaWxlT3B0aW9ucyh7IGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKCBmaWxlUGF0aCApIH0pO1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRpbnB1dDogZmlsZVBhdGgsXG5cdFx0ZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoIG91dHB1dFBhdGggKSxcblx0XHRvdXRwdXQ6IHBhdGgucGFyc2UoIG91dHB1dFBhdGggKS5kaXJcblx0fTtcblxuXHRpZiAoIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRmb3IgKCB2YXIgb3B0aW9uIGluIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRcdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgYXJncyA9IFtcblx0XHR0YXNrTmFtZSxcblx0XHQnLS1jd2QnLCBhcHAuZ2V0QXBwUGF0aCgpLFxuXHRcdCctLWd1bHBmaWxlJywgZ3VscEZpbGVQYXRoLFxuXHRcdCctLW5vLWNvbG9yJ1xuXHRdO1xuXG5cdGZvciAoIHZhciBvcHRpb24gaW4gb3B0aW9ucyApIHtcblx0XHRpZiAoICEgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggb3B0aW9uICkgKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiggb3B0aW9uc1sgb3B0aW9uIF0gKSAhPT0gJ2Jvb2xlYW4nICkge1xuXHRcdFx0YXJncy5wdXNoKCAnLS0nICsgb3B0aW9uICk7XG5cdFx0XHRhcmdzLnB1c2goIG9wdGlvbnNbIG9wdGlvbiBdICk7XG5cdFx0fSBlbHNlIGlmICggb3B0aW9uc1sgb3B0aW9uIF0gPT09IHRydWUgKSB7XG5cdFx0XHRhcmdzLnB1c2goICctLScgKyBvcHRpb24gKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBjcCA9IHNwYXduKCBndWxwUGF0aCwgYXJncyApO1xuXG5cdGNvbnNvbGUubG9nKCAnU3RhcnRlZCAlcyB3aXRoIFBJRCAlZCcsIHRhc2tOYW1lLCBjcC5waWQgKTtcblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcy5wdXNoKCBjcCApO1xuXG5cdGNwLnN0ZG91dC5zZXRFbmNvZGluZygndXRmOCcpO1xuXG5cdGNwLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcblx0XHRjb25zb2xlLmxvZyggZGF0YSApO1xuXHR9KTtcblxuXHQvLyBUT0RPOiBzaG93IHByb2dyZXNzIGluIG1lbnViYXIgbWVudVxuXHQvLyB0cmF5Lm1lbnUgPSBjcmVhdGVUcmF5TWVudShuYW1lLCBbXSwgJ3Byb2dyZXNzIGhlcmUnKTtcblxuXHRjcC5zdGRlcnIuc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcblxuXHRjcC5zdGRlcnIub24oICdkYXRhJywgZGF0YSA9PiB7XG5cdFx0Y29uc29sZS5lcnJvciggZGF0YSApO1xuXHR9KTtcblxuXHRjcC5vbiggJ2V4aXQnLCBjb2RlID0+IHtcblx0XHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8ICdmaWxlJztcblxuXHRcdC8vIFJlbW92ZSB0aGlzIHRhc2sgZnJvbSBnbG9iYWwgYXJyYXkuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MgPSBnbG9iYWwuY29tcGlsZXJUYXNrcy5maWx0ZXIoIHByb2MgPT4ge1xuXHRcdFx0cmV0dXJuICggcHJvYy5waWQgIT09IGNwLnBpZCApO1xuXHRcdH0pO1xuXG5cdFx0aWYgKCBjb2RlID09PSAwICkge1xuXHRcdFx0bmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRcdFx0Ym9keTogYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gLFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoIGNvZGUgPT09IDEgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggJ1Byb2Nlc3MgJXMgdGVybWluYXRlZCcsIGNwLnBpZCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8ICdGaWxlJztcblxuXHRcdFx0bmV3IE5vdGlmaWNhdGlvbiggJ0J1aWxkcicsIHtcblx0XHRcdFx0Ym9keTogYEVycm9yIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9LmAsXG5cdFx0XHRcdHNvdW5kOiAnQmFzc28nXG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc29sZS5lcnJvcihgRXhpdGVkIHdpdGggZXJyb3IgY29kZSAke2NvZGV9YCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCBjb2RlICk7XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9ucyxcblx0dGVybWluYXRlUHJvY2Vzc1xufVxuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHByb2plY3RzXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggc3RhdGUgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBhY3Rpb24uaWQsXG5cdFx0XHRcdFx0bmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdFx0cGF0aDogYWN0aW9uLnBhdGhcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gc3RhdGVcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3RzO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG9mZkNhbnZhcyggdG9nZ2xlID0gdHJ1ZSwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdvZmYtY2FudmFzJywgdG9nZ2xlICk7XG5cblx0aWYgKCB0b2dnbGUgKSB7XG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdvZmYtY2FudmFzLXNob3cnKSApO1xuXG5cdFx0cmVtb3ZlRm9jdXMoXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2ZmLWNhbnZhcycpLFxuXHRcdFx0J29mZi1jYW52YXMnLFxuXHRcdFx0bmV3IEV2ZW50KCdvZmYtY2FudmFzLWhpZGUnKSxcblx0XHRcdGV4Y2x1ZGVcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBFdmVudCgnb2ZmLWNhbnZhcy1oaWRlJykgKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCB0cmlnZ2VyRXZlbnQgPSBudWxsLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXG5cdFx0XHRcdGlmICggdHJpZ2dlckV2ZW50ICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIHRyaWdnZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVtb3ZlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG5cdH1cblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dW5mb2N1cyxcblx0bG9hZGluZyxcblx0b2ZmQ2FudmFzLFxuXHRyZW1vdmVGb2N1c1xufTtcbiIsIi8qKlxuICogQGZpbGUgSGVscGVyIGZ1bmN0aW9ucyBmb3IgcmVzb2x2aW5nLCB0cmFuc2Zvcm1pbmcsIGdlbmVyYXRpbmcgYW5kIGZvcm1hdHRpbmcgcGF0aHMuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9zbGFzaFxuZnVuY3Rpb24gc2xhc2goIGlucHV0ICkge1xuXHRjb25zdCBpc0V4dGVuZGVkTGVuZ3RoUGF0aCA9IC9eXFxcXFxcXFxcXD9cXFxcLy50ZXN0KGlucHV0KTtcblx0Y29uc3QgaGFzTm9uQXNjaWkgPSAvW15cXHUwMDAwLVxcdTAwODBdKy8udGVzdChpbnB1dCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5cdGlmIChpc0V4dGVuZGVkTGVuZ3RoUGF0aCB8fCBoYXNOb25Bc2NpaSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG5cbmZ1bmN0aW9uIGZpbGVPdXRwdXRQYXRoKCBmaWxlLCBzdWZmaXggPSAnJywgZXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb24gKSB7XG5cdGxldCBiYXNlZGlyID0gcGF0aC5wYXJzZSggZmlsZS5wYXRoICkuZGlyO1xuXHRsZXQgZmlsZW5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSArIHN1ZmZpeCArIGV4dGVuc2lvbjtcblxuXHRyZXR1cm4gcGF0aC5qb2luKCBiYXNlZGlyLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBmaWxlUmVsYXRpdmVQYXRoKCBmcm9tLCB0byApIHtcblx0cmV0dXJuIHBhdGgucmVsYXRpdmUoIGZyb20sIHRvICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gKCBwYXRoLmlzQWJzb2x1dGUoIGZpbGVuYW1lICkgKSA/IGZpbGVuYW1lIDogcGF0aC5qb2luKCBiYXNlLCBmaWxlbmFtZSApO1xufVxuXG5mdW5jdGlvbiBkaXJBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkge1xuXHRyZXR1cm4gcGF0aC5wYXJzZSggZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSApLmRpcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNsYXNoLFxuXHRmaWxlT3V0cHV0UGF0aCxcblx0ZmlsZVJlbGF0aXZlUGF0aCxcblx0ZmlsZUFic29sdXRlUGF0aCxcblx0ZGlyQWJzb2x1dGVQYXRoXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBDb2xsZWN0aW9uIG9mIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gc2xlZXAobWlsbGlzZWNvbmRzKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCAxZTc7IGkrKyApIHtcblx0XHRpZiAoICggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCApID4gbWlsbGlzZWNvbmRzICkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGVlcFxufTtcbiJdfQ==
