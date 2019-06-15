(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/**
 * @file Actions.
 */
// Main.
function changeView(view) {
  return {
    type: 'CHANGE_VIEW',
    view: view
  };
} // Projects.


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

function refreshActiveProject(project) {
  return {
    type: 'REFRESH_ACTIVE_PROJECT',
    payload: project
  };
}

function setProjectState(state) {
  return {
    type: 'SET_PROJECT_STATE',
    payload: state
  };
} // Files.


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
  setActiveFile: setActiveFile,
  refreshActiveProject: refreshActiveProject
};

},{}],2:[function(require,module,exports){
"use strict";

/**
 * @file Main app script.
 */
var Store = require('electron-store');

global.config = new Store({
  name: 'config'
});
global.ui = require('./utils/globalUI');
global.compiler = require('./compiler/interface');
global.compilerTasks = [];

var React = require('react');

var ReactDOM = require('react-dom');

var _require = require('react-redux'),
    Provider = _require.Provider;

var _require2 = require('redux'),
    createStore = _require2.createStore;

var rootReducer = require('./reducers');

var _require3 = require('./utils/utils'),
    getInitialState = _require3.getInitialState;

var initialState = getInitialState();
var store = createStore(rootReducer, initialState);
global.store = store;

var App = require('./components/App');

ReactDOM.render(React.createElement(Provider, {
  store: store
}, React.createElement(App, null)), document.getElementById('root'));

var _require4 = require('./utils/utils'),
    sleep = _require4.sleep; // App close/restart events.


window.addEventListener('beforeunload', function (event) {
  if (global.compilerTasks.length > 0) {
    console.log('Killing %d running tasks...', global.compilerTasks.length);
    global.compiler.killTasks();
    sleep(300);
  }
});

},{"./compiler/interface":3,"./components/App":5,"./reducers":25,"./utils/globalUI":29,"./utils/utils":31,"electron-store":undefined,"react":undefined,"react-dom":undefined,"react-redux":undefined,"redux":undefined}],3:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
* @file Gulp scripts and tasks.
*/

/* global Notification */
var app = require('electron').remote.app;

var fs = require('fs');

var path = require('path'); // const dependencyTree = require( 'dependency-tree' );


var sass = require('node-sass');

var WatchSass = require('node-sass-watcher');

var autoprefixer = require('autoprefixer');

var precss = require('precss');

var postcss = require('postcss');

var webpack = require('webpack');

var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var formatMessages = require('./messages');

var _require = require('../utils/pathHelpers'),
    fileAbsolutePath = _require.fileAbsolutePath; // const { getDependencyArray } = require( '../utils/utils' );


function killTasks() {
  if (global.compilerTasks.length === 0) {
    // Nothing to kill :(
    return null;
  }

  var tasks = global.compilerTasks;

  for (var i = tasks.length - 1; i >= 0; i--) {
    var task = tasks[i];
    var filename = void 0;

    if (_typeof(task._events) === 'object' && typeof task._events.update === 'function') {
      filename = task.inputPath; // Close chokidar watch processes.

      task.inputPathWatcher.close();
      task.rootDirWatcher.close();
    } else {
      filename = task.compiler.options.entry; // Close webpack watch process.

      task.close();
    }

    console.warn("Stopped watching \"".concat(filename, "\".")); // Remove task from array.

    tasks.splice(i, 1);
  }

  global.compilerTasks = tasks;
  return true;
}

function initProject() {
  killTasks();

  if (!global.projectConfig) {
    return;
  }

  var projectFiles = global.projectConfig.get('files', []);
  var projectPath = path.parse(global.projectConfig.path).dir;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = projectFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var fileConfig = _step.value;
      processFile(projectPath, fileConfig);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
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
  var compileOptions = getFileOptions({
    extension: path.extname(filePath)
  });
  var options = {
    input: filePath,
    filename: path.basename(outputPath),
    output: path.parse(outputPath).dir,
    projectBase: base
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
  console.group('Running task');
  console.log("Running \"".concat(taskName, "\" with options:"), options);
  console.groupEnd();
  var inputFilename = path.basename(options.input);

  if (taskName === 'watch') {
    handleWatchTask(options, callback);
  } else {
    // Build task starting.
    global.logger.log('info', "Compiling ".concat(inputFilename, "..."));

    switch (taskName) {
      case 'build-sass':
        handleSassCompile(options, callback);
        break;

      case 'build-css':
        handleCssCompile(options, callback);
        break;

      case 'build-js':
        handleJsCompile(options, callback);
        break;

      default:
        console.error("Unhandled task: ".concat(taskName));
        break;
    }
  }
}

function handleSassCompile(options) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  options.outFile = path.resolve(options.output, options.filename);
  sass.render({
    file: options.input,
    outFile: options.outFile,
    outputStyle: options.style,
    sourceMap: options.sourcemaps,
    sourceMapEmbed: options.sourcemaps
  }, function (error, result) {
    if (error) {
      // Compilation error(s).
      handleCompileError(options, error);

      if (callback) {
        callback();
      }
    } else {
      if (options.autoprefixer) {
        var postCssOptions = {
          from: options.input,
          to: options.outFile,
          map: options.sourcemaps
        };
        handlePostCssCompile(options, result.css, postCssOptions, callback);
      } else {
        // No errors during the compilation, write this result on the disk
        fs.writeFile(options.outFile, result.css, function (error) {
          if (error) {
            // Compilation error(s).
            handleCompileError(options, error);
          } else {
            // Compilation successful.
            handleCompileSuccess(options);
          }

          if (callback) {
            callback();
          }
        });
      }
    }
  });
}

function handleCssCompile(options) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  options.outFile = path.resolve(options.output, options);
  var postCssOptions = {
    from: options.input,
    to: options.outFile,
    map: options.sourcemaps
  };
  fs.readFile(options.input, function (error, css) {
    if (error) {
      // Compilation error(s).
      handleCompileError(options, error);
    } else {
      handlePostCssCompile(options, css, postCssOptions, callback);
    }
  });
}

function handlePostCssCompile(options, css, postCssOptions) {
  var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  postcss([precss, autoprefixer({
    browsers: ['last 5 versions']
  })]).process(css, postCssOptions).then(function (postCssResult) {
    // No errors during the compilation, write this result on the disk
    fs.writeFile(options.outFile, postCssResult.css, function (error) {
      if (error) {
        // Compilation error(s).
        handleCompileError(options, error);
      } else {
        // Compilation successful.
        handleCompileSuccess(options);
      }

      if (callback) {
        callback();
      }
    });
  });
}

function handleJsCompile(options) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var modulesPath = path.resolve(app.getAppPath(), 'node_modules');

  if (!modulesPath.match('app')) {
    modulesPath = path.resolve(app.getAppPath(), 'app/node_modules');
  }

  var config = {
    mode: 'none',
    entry: options.input,
    cache: false,
    output: {
      path: options.output,
      filename: options.filename
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/
      }]
    },
    resolveLoader: {
      modules: [modulesPath]
    },
    devtool: options.sourcemaps ? 'inline-source-map' : false,
    plugins: [new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }), new webpack.optimize.ModuleConcatenationPlugin(), new webpack.NoEmitOnErrorsPlugin()]
  };

  if (options.babel) {
    config.module.rules[0].use = {
      loader: 'babel-loader',
      options: {
        presets: [require('babel-preset-env')],
        plugins: [require('babel-plugin-transform-object-rest-spread')]
      }
    };
  }

  if (options.uglify) {
    var uglifyOptions = {
      parallel: false,
      sourceMap: options.sourcemaps
    };
    config.plugins.push(new UglifyJsPlugin(uglifyOptions));
  }

  var compiler = webpack(config);

  if (options.getInstance) {
    return compiler;
  }

  compiler.run(function (error, stats) {
    if (callback) {
      callback();
    }

    if (error) {
      console.error(error);
    }

    console.group('Webpack');
    console.log(stats);
    console.groupEnd();
    var messages = formatMessages(stats);

    if (!messages.errors.length && !messages.warnings.length) {
      // Compilation successful.
      handleCompileSuccess(options);
    }

    if (messages.errors.length) {
      // Compilation error(s).
      handleCompileError(options, messages.errors);
    }

    if (messages.warnings.length) {
      // Compilation warning(s).
      handleCompileWarnings(options, messages.warnings);
    }
  });
}

function handleWatchTask(options) {
  if (options.watchTask === 'build-sass') {
    var watcherOptions = {
      verbosity: 1
    };
    var watcher = new WatchSass(options.input, watcherOptions); // watcher.on( 'init', function() { handleSassCompile( options ) });

    watcher.on('update', function () {
      handleSassCompile(options);
    });
    watcher.run();
    global.compilerTasks.push(watcher);
  } else if (options.watchTask === 'build-js') {
    console.warn("Start watching \"".concat(options.input, "\"..."));
    options.getInstance = true;
    var compiler = handleJsCompile(options);

    var _watcher = compiler.watch({
      aggregateTimeout: 300
    }, function (error, stats) {
      if (error) {
        console.error(error);
      }

      console.group('Webpack');
      console.log(stats);
      console.groupEnd();
      var messages = formatMessages(stats);

      if (!messages.errors.length && !messages.warnings.length) {
        // Compilation successful.
        handleCompileSuccess(options);
      }

      if (messages.errors.length) {
        // Compilation error(s).
        handleCompileError(options, messages.errors);
      }

      if (messages.warnings.length) {
        // Compilation warning(s).
        handleCompileWarnings(options, messages.warnings);
      }
    });

    _watcher.invalidate();

    global.compilerTasks.push(_watcher);
  }
}

function handleCompileSuccess(options) {
  var filename = path.basename(options.input);
  var notifyText = "Finished compiling ".concat(filename, ".");
  global.logger.log('success', notifyText);
  var notify = new Notification('Code Komrade', {
    body: notifyText,
    silent: true
  });
  return notify;
}

function handleCompileError(options, errors) {
  console.error(errors);

  if (!errors.length) {
    errors = [errors];
  }

  var filename = path.basename(options.input);
  var notifyText = (errors.length > 1 ? 'Errors' : 'Error') + " when compiling ".concat(filename);
  global.logger.log('error', notifyText + ':', '<pre>' + errors.join('\r\n') + '</pre>');
  var notify = new Notification('Code Komrade', {
    body: notifyText,
    sound: 'Basso'
  });
  return notify;
}

function handleCompileWarnings(options, warnings) {
  console.warn(warnings);

  if (!warnings.length) {
    warnings = [warnings];
  }

  var filename = path.basename(options.input);
  var notifyText = (warnings.length > 1 ? 'Warnings' : 'Warning') + " when compiling ".concat(filename);
  global.logger.log('warn', notifyText + ':', '<pre>' + warnings.join('\r\n') + '</pre>');
}

module.exports = {
  initProject: initProject,
  runTask: runTask,
  killTasks: killTasks,
  processFile: processFile,
  getFileConfig: getFileConfig,
  getFileOptions: getFileOptions
};

},{"../utils/pathHelpers":30,"./messages":4,"autoprefixer":undefined,"babel-plugin-transform-object-rest-spread":undefined,"babel-preset-env":undefined,"electron":undefined,"fs":undefined,"node-sass":undefined,"node-sass-watcher":undefined,"path":undefined,"postcss":undefined,"precss":undefined,"uglifyjs-webpack-plugin":undefined,"webpack":undefined}],4:[function(require,module,exports){
"use strict";

/**
 * This has been adapted from `create-react-app`, authored by Facebook, Inc.
 * see: https://github.com/facebookincubator/create-react-app/tree/master/packages/react-dev-utils
 */
var fs = require('fs');

var stripIndent = require('strip-indent');

var _require = require('../utils/pathHelpers'),
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath;

var errorLabel = 'Syntax error:';

var isLikelyASyntaxError = function isLikelyASyntaxError(str) {
  return str.includes(errorLabel);
};

var exportRegex = /\s*(.+?)\s*(")?export '(.+?)' was not found in '(.+?)'/;
var stackRegex = /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm;
var fileAndLineRegex = /in ([^(]*)\s\(line\s(\d*),\scolumn\s(\d*)\)/;

function formatMessage(message, isError) {
  var lines = message.split('\n');

  if (lines.length > 2 && lines[1] === '') {
    lines.splice(1, 1); // Remove extra newline.
  } // Remove loader notation from filenames:
  //   `./~/css-loader!./src/App.css` ~~> `./src/App.css`


  if (lines[0].lastIndexOf('!') !== -1) {
    lines[0] = lines[0].substr(lines[0].lastIndexOf('!') + 1);
  } // Remove useless `entry` filename stack details


  lines = lines.filter(function (line) {
    return line.indexOf(' @ ') !== 0;
  }); // 0 ~> filename; 1 ~> main err msg

  if (!lines[0] || !lines[1]) {
    return lines.join('\n');
  } // Cleans up verbose "module not found" messages for files and packages.


  if (lines[1].startsWith('Module not found: ')) {
    lines = [lines[0], lines[1] // "Module not found: " is enough detail
    .replace("Cannot resolve 'file' or 'directory' ", '').replace('Cannot resolve module ', '').replace('Error: ', '').replace('[CaseSensitivePathsPlugin] ', '')];
  } // Cleans up syntax error messages.


  if (lines[1].startsWith('Module build failed: ')) {
    lines[1] = lines[1].replace('Module build failed: SyntaxError:', errorLabel);
  }

  if (lines[1].match(exportRegex)) {
    lines[1] = lines[1].replace(exportRegex, "$1 '$4' does not contain an export named '$3'.");
  } // Reassemble & Strip internal tracing, except `webpack:` -- (create-react-app/pull/1050)


  return lines.join('\n').replace(stackRegex, '').trim();
}

function handleStderr(data) {
  console.log(data);
  var errObj = {};
  var startCapture = false;
  var lines = data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;
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
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
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
  } // return errObj;

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
    } // Remove extraneous indentation.


    var strippedLines = stripIndent(_lineArr.join('\n')).split('\n');

    for (var j = minLine; j <= maxLine; j++) {
      lineArr.push('<div class="line' + (line === j ? ' highlight' : '') + '">' + '<span class="line-number">' + (j + 1) + '</span>' + '<span class="line-content">' + strippedLines[j] + '</span>' + '</div>');
    }

    callback(null, lineArr.join('\n'));
  });
}

function handleFileAndLineErrors(message) {
  var fileAndLine = message.match(fileAndLineRegex);

  if (!fileAndLine) {
    return;
  }

  var file = fileAndLine[1];
  var line = fileAndLine[2];
  console.log(fileAndLine);
  getErrLines(file, line, function (err, lines) {
    if (err) {
      console.error(err);
      return;
    }

    var title = message.replace(/\.$/, '') + '<code>' + ' in ' + slash(fileRelativePath(process.cwd(), file)) + ' on line ' + line + '</code>';
    var details = '<pre>' + lines + '</pre>';
    global.logger.log('error', title, details);
  });
}

module.exports = function (stats) {
  var json = stats.toJson({}, true);
  json.errors.map(function (msg) {
    return handleFileAndLineErrors(msg);
  });
  var result = {
    errors: json.errors.map(function (msg) {
      return formatMessage(msg, true);
    }),
    warnings: json.warnings.map(function (msg) {
      return formatMessage(msg, false);
    })
  }; // Only show syntax errors if we have them

  if (result.errors.some(isLikelyASyntaxError)) {
    result.errors = result.errors.filter(isLikelyASyntaxError);
  } // First error is usually it; others usually the same


  if (result.errors.length > 1) {
    result.errors.length = 1;
  }

  return result;
};

module.exports.formatMessage = formatMessage;

},{"../utils/pathHelpers":30,"fs":undefined,"strip-indent":undefined}],5:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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

var App =
/*#__PURE__*/
function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    var _this;

    _classCallCheck(this, App);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(App).call(this, props));
    _this.views = {
      files: 'Files',
      logs: 'Logs',
      settings: 'Settings'
    };
    return _this;
  }

  _createClass(App, [{
    key: "renderOverlay",
    value: function renderOverlay() {
      global.ui.overlay(this.props.view !== 'files');

      if (this.props.view === 'files') {
        return '';
      } else {
        var content;

        if (this.props.view === 'logs') {
          content = React.createElement(Logs, null);
        } else {
          content = React.createElement(Settings, null);
        }

        return React.createElement(Overlay, {
          hasClose: false
        }, content);
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "app"
      }, React.createElement(Sidebar, {
        items: this.views
      }), React.createElement("div", {
        id: "content-wrap"
      }, React.createElement(Projects, null)), this.renderOverlay());
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

},{"./Overlay":7,"./Sidebar":8,"./projects/Logs":13,"./projects/Projects":16,"./projects/Settings":17,"react":undefined,"react-redux":undefined}],6:[function(require,module,exports){
"use strict";

/**
 * @file Component for empty screen/no content.
 */
var React = require('react');

module.exports = function (props) {
  return React.createElement("div", {
    className: 'no-content' + (props.className ? ' ' + props.className : '')
  }, React.createElement("div", {
    className: "inner"
  }, props.children));
};

},{"react":undefined}],7:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for an overlay.
 */
var React = require('react');

var Overlay =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Overlay, _React$Component);

  function Overlay() {
    _classCallCheck(this, Overlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(Overlay).apply(this, arguments));
  }

  _createClass(Overlay, [{
    key: "render",
    // constructor() {}
    value: function render() {
      return React.createElement("div", {
        id: "overlay"
      }, this.props.hasClose && React.createElement("a", {
        href: "#",
        id: "close-overlay"
      }, "\xD7"), React.createElement("div", {
        id: "overlay-content"
      }, this.props.children));
    }
  }]);

  return Overlay;
}(React.Component);

module.exports = Overlay;

},{"react":undefined}],8:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file App sidebar.
 */
var React = require('react');

var _require = require('../actions'),
    _changeView = _require.changeView;

var _require2 = require('react-redux'),
    connect = _require2.connect;

var Sidebar =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Sidebar, _React$Component);

  function Sidebar(props) {
    var _this;

    _classCallCheck(this, Sidebar);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Sidebar).call(this, props));
    _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Sidebar, [{
    key: "onClick",
    value: function onClick(event) {
      event.persist();
      var view = event.currentTarget.dataset.view;
      this.props.changeView(view);
    }
  }, {
    key: "renderItems",
    value: function renderItems() {
      var items = [];

      for (var id in this.props.items) {
        items.push(React.createElement("li", {
          key: id,
          "data-view": id,
          "data-tip": this.props.items[id],
          className: this.props.active === id ? 'active' : '',
          onClick: this.onClick
        }, React.createElement("span", {
          className: "icon"
        })));
      }

      return items;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("nav", {
        id: "sidebar"
      }, React.createElement("ul", {
        id: "menu"
      }, this.renderItems()));
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

},{"../actions":1,"react":undefined,"react-redux":undefined}],9:[function(require,module,exports){
"use strict";

/**
 * @file Component for wrapping a field.
 */
var React = require('react');

function Field(props) {
  var className = 'field field-' + props.type + ' label-' + (props.labelPos ? props.labelPos : 'top');
  return React.createElement("div", {
    className: className
  }, props.label && React.createElement("strong", {
    className: "field-label"
  }, props.label), React.createElement("div", {
    className: "field-cont"
  }, props.children));
}

module.exports = Field;

},{"react":undefined}],10:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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

var FieldSaveFile =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FieldSaveFile, _React$Component);

  function FieldSaveFile(props) {
    var _this;

    _classCallCheck(this, FieldSaveFile);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FieldSaveFile).call(this, props));
    _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FieldSaveFile, [{
    key: "onClick",
    value: function onClick(event) {
      event.persist();
      event.preventDefault();
      var fileSaveOptions = {};

      if (this.props.dialogTitle) {
        fileSaveOptions.title = this.props.dialogTitle;
      }

      if (!this.props.value && this.props.sourceFile) {
        fileSaveOptions.defaultPath = this.props.sourceFile.path;
      } else if (this.props.value && this.props.sourceBase) {
        fileSaveOptions.defaultPath = fileAbsolutePath(this.props.sourceBase, this.props.value);
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

        if (this.props.onChange) {
          this.props.onChange(this.props.name, savePath);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(Field, {
        type: "save-file",
        label: this.props.label,
        labelPos: this.props.labelPos
      }, React.createElement("input", {
        type: "hidden",
        name: this.props.name,
        id: 'field_' + this.props.name,
        value: this.props.value,
        readOnly: true
      }), React.createElement("small", {
        onClick: this.onClick
      }, this.props.value));
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

},{"../../utils/pathHelpers":30,"./Field":9,"electron":undefined,"prop-types":undefined,"react":undefined}],11:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for a dropdown select.
 */
var React = require('react');

var PropTypes = require('prop-types');

var Field = require('./Field');

var FieldSelect =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FieldSelect, _React$Component);

  function FieldSelect(props) {
    var _this;

    _classCallCheck(this, FieldSelect);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FieldSelect).call(this, props));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FieldSelect, [{
    key: "onChange",
    value: function onChange(event) {
      event.persist();

      if (this.props.onChange) {
        this.props.onChange(this.props.name, event.target.value);
      }
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      var options = [];

      for (var value in this.props.options) {
        options.push(React.createElement("option", {
          key: value,
          value: value
        }, this.props.options[value]));
      }

      return options;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(Field, {
        type: "select",
        label: this.props.label,
        labelPos: this.props.labelPos
      }, React.createElement("label", {
        htmlFor: 'field_' + this.props.name
      }, this.props.value ? this.props.options[this.props.value] : ''), React.createElement("select", {
        name: this.props.name,
        onChange: this.onChange,
        value: this.props.value,
        disabled: this.props.disabled,
        id: 'field_' + this.props.name
      }, this.getOptions()));
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

},{"./Field":9,"prop-types":undefined,"react":undefined}],12:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for a toggle switch.
 */
var React = require('react');

var PropTypes = require('prop-types');

var Field = require('./Field');

var FieldSwitch =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FieldSwitch, _React$Component);

  function FieldSwitch(props) {
    var _this;

    _classCallCheck(this, FieldSwitch);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FieldSwitch).call(this, props));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FieldSwitch, [{
    key: "onChange",
    value: function onChange(event) {
      event.persist();

      if (this.props.onChange) {
        this.props.onChange(this.props.name, !this.props.value);
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(Field, {
        type: "switch",
        label: this.props.label,
        labelPos: this.props.labelPos
      }, React.createElement("input", {
        type: "checkbox",
        name: this.props.name,
        onChange: this.onChange,
        checked: this.props.value,
        disabled: this.props.disabled,
        id: 'field_' + this.props.name
      }), React.createElement("label", {
        htmlFor: 'field_' + this.props.name
      }, this.props.label));
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

},{"./Field":9,"prop-types":undefined,"react":undefined}],13:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for displaying logs and information.
 */
var React = require('react');

var NoContent = require('../NoContent');

var Logs =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Logs, _React$Component);

  function Logs(props) {
    var _this;

    _classCallCheck(this, Logs);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Logs).call(this, props));
    var type = null;
    var logs = global.logger ? global.logger.get(type) : [];
    _this.state = {
      type: type,
      logs: logs
    };
    _this.refresh = _this.refresh.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Logs, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      document.addEventListener('bd/refresh/logs', this.refresh);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      document.removeEventListener('bd/refresh/logs', this.refresh);
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.setState({
        logs: global.logger.get(this.state.type)
      });
    }
  }, {
    key: "renderChildren",
    value: function renderChildren() {
      var logIndex = 0;
      var logList = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.state.logs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var log = _step.value;
          var titleHTML = {
            __html: log.title
          };
          var bodyHTML = log.body ? {
            __html: log.body
          } : null;
          logList.push(React.createElement("li", {
            key: logIndex,
            className: 'type-' + log.type
          }, React.createElement("div", {
            className: "title"
          }, React.createElement("small", null, log.time), React.createElement("span", {
            className: "title-text",
            dangerouslySetInnerHTML: titleHTML
          })), bodyHTML && React.createElement("div", {
            className: "details",
            dangerouslySetInnerHTML: bodyHTML
          })));
          logIndex++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return React.createElement("ul", null, logList);
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.state.logs.length) {
        return React.createElement(NoContent, {
          className: "logs-screen empty"
        }, React.createElement("h1", null, "No logs yet."), React.createElement("h2", null, "Go forth and compile!"));
      }

      return React.createElement("div", {
        id: "logs",
        className: "logs-screen"
      }, this.renderChildren());
    }
  }]);

  return Logs;
}(React.Component);

module.exports = Logs;

},{"../NoContent":6,"react":undefined}],14:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for the projects panel.
 */
var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var FileOptionsScript = require('./fileoptions/FileOptionsScript');

var FileOptionsStyle = require('./fileoptions/FileOptionsStyle');

var NoContent = require('../NoContent');

var Panel =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel() {
    _classCallCheck(this, Panel);

    return _possibleConstructorReturn(this, _getPrototypeOf(Panel).apply(this, arguments));
  }

  _createClass(Panel, [{
    key: "getOptions",
    value: function getOptions() {
      if (!this.props.activeFile.file.extension) {
        return null;
      }

      switch (this.props.activeFile.file.extension) {
        case '.css':
        case '.scss':
        case '.sass':
        case '.less':
          return React.createElement(FileOptionsStyle, {
            base: this.props.project.path,
            file: this.props.activeFile.file
          });

        case '.js':
        case '.ts':
        case '.jsx':
          return React.createElement(FileOptionsScript, {
            base: this.props.project.path,
            file: this.props.activeFile.file
          });

        default:
          return null;
      }
    }
  }, {
    key: "renderContent",
    value: function renderContent() {
      if (this.props.activeFile) {
        var options = this.getOptions();

        if (options) {
          this.props.activeFile.element.classList.add('has-options');
          return options;
        }
      }

      return React.createElement(NoContent, null, React.createElement("p", null, "Select a stylesheet or script file to view compiling options."));
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "panel"
      }, this.renderContent());
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

},{"../NoContent":6,"./fileoptions/FileOptionsScript":22,"./fileoptions/FileOptionsStyle":23,"react":undefined,"react-redux":undefined}],15:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for the project selector.
 */
var React = require('react');

var _require = require('react-redux'),
    connect = _require.connect;

var autoBind = require('auto-bind');

var _require2 = require('../../actions'),
    _setProjectState = _require2.setProjectState,
    _refreshActiveProject = _require2.refreshActiveProject;

var _require3 = require('../../utils/utils'),
    setProjectConfig = _require3.setProjectConfig;

var ProjectSelect =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ProjectSelect, _React$Component);

  /**
   * Constrcutor.
   *
   * @param {Object} props
   */
  function ProjectSelect(props) {
    var _this;

    _classCallCheck(this, ProjectSelect);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ProjectSelect).call(this, props));
    _this.state = {
      isOpen: false
    };
    autoBind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ProjectSelect, [{
    key: "toggleSelect",
    value: function toggleSelect() {
      global.ui.unfocus(!this.state.isOpen);
      this.setState({
        isOpen: !this.state.isOpen
      });
    }
  }, {
    key: "toggleProject",
    value: function toggleProject() {
      var paused = !this.props.active.paused || false;
      this.props.setProjectState({
        paused: paused
      });
      this.props.refreshActiveProject(_objectSpread({}, this.props.active, {
        paused: paused
      }));
      setProjectConfig('paused', paused);
    }
  }, {
    key: "selectProject",
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
    key: "render",
    value: function render() {
      var _this2 = this;

      var selectDropdown = React.createElement("div", {
        id: "project-select-dropdown",
        className: this.state.isOpen ? 'open' : ''
      }, this.props.projects.map(function (project, index) {
        return React.createElement("div", {
          key: index,
          "data-project": index,
          onClick: _this2.selectProject
        }, project.name);
      }), React.createElement("div", {
        key: "new",
        "data-project": "new",
        onClick: this.selectProject
      }, "+ Add new project"));

      if (!this.props.active.name || !this.props.active.path) {
        return React.createElement("div", {
          id: "project-select",
          className: "empty"
        }, React.createElement("div", {
          id: "project-active",
          onClick: this.toggleSelect
        }, React.createElement("h1", null, "No Project Selected"), React.createElement("h2", null, "Click here to select one...")), selectDropdown);
      }

      return React.createElement("div", {
        id: "project-select",
        className: "selected"
      }, React.createElement("div", {
        id: "project-active",
        onClick: this.toggleSelect
      }, React.createElement("h1", null, this.props.active.name), React.createElement("h2", null, this.props.active.path)), React.createElement("div", {
        id: "project-actions"
      }, React.createElement("a", {
        href: "#",
        className: 'toggle' + (this.props.active.paused ? ' paused' : ' active'),
        onClick: this.toggleProject
      }), React.createElement("a", {
        href: "#",
        className: "refresh",
        onClick: this.props.refreshProject
      }), React.createElement("a", {
        href: "#",
        className: "remove",
        onClick: this.props.removeProject
      })), selectDropdown);
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
    },
    refreshActiveProject: function refreshActiveProject(project) {
      return dispatch(_refreshActiveProject(project));
    }
  };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectSelect);

},{"../../actions":1,"../../utils/utils":31,"auto-bind":undefined,"react":undefined,"react-redux":undefined}],16:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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

var Projects =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Projects, _React$Component);

  function Projects(props) {
    var _this;

    _classCallCheck(this, Projects);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Projects).call(this, props));
    _this.state = {
      ignored: ['.git', 'node_modules', '.DS_Store', 'code-komrade.json'],
      loading: false
    };
    _this.newProject = _this.newProject.bind(_assertThisInitialized(_this));
    _this.initProject = _this.initProject.bind(_assertThisInitialized(_this));
    _this.changeProject = _this.changeProject.bind(_assertThisInitialized(_this));
    _this.removeProject = _this.removeProject.bind(_assertThisInitialized(_this));
    _this.refreshProject = _this.refreshProject.bind(_assertThisInitialized(_this));
    _this.changeProjectPath = _this.changeProjectPath.bind(_assertThisInitialized(_this));
    _this.removeProjectButton = _this.removeProjectButton.bind(_assertThisInitialized(_this));
    _this.initCompiler = _this.initCompiler.bind(_assertThisInitialized(_this));
    document.addEventListener('bd/refresh/files', _this.refreshProject);
    return _this;
  }

  _createClass(Projects, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.active.path) {
        this.initProject(this.props.active.path);
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.active.path === this.props.active.path && prevProps.active.paused !== this.props.active.paused) {
        // Project was paused/unpaused, trigger compiler tasks or terminate them.
        this.initCompiler();
      }
    } // Add a new project.

  }, {
    key: "newProject",
    value: function newProject() {
      var _this2 = this;

      dialog.showOpenDialog(global.mainWindow, {
        properties: ['openDirectory']
      }, function (path) {
        if (path) {
          var newProject = {
            name: fspath.basename(path[0]),
            path: path[0],
            paused: false
          };
          var newProjectIndex = _this2.props.projects.length;

          if (_this2.props.projects.findIndex(function (project) {
            return project.path === newProject.path;
          }) !== -1) {
            // Project already exists.
            return;
          } // Save new project to config.


          global.config.set('projects', [].concat(_toConsumableArray(_this2.props.projects), [newProject])); // Update state.

          _this2.props.addProject(newProject); // Set new project as active.


          _this2.changeProject(newProjectIndex, newProject);
        }
      });
    } // Change the active project.

  }, {
    key: "changeProject",
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

      if (project) {
        active = project;
      } else if (this.props.projects[id]) {
        active = this.props.projects[id];
      } // Update config.


      global.config.set('active-project', id); // Update state.

      this.props.changeProject(_objectSpread({}, active, {
        id: id
      }));
      this.props.setActiveFile(null); // Init.

      this.initProject(active.path);
    } // Remove the current project.

  }, {
    key: "removeProject",
    value: function removeProject() {
      var removeIndex = parseInt(this.props.active.id, 10);
      var projects = this.props.projects.filter(function (project, index) {
        return index !== removeIndex;
      }); // Remove project from config.

      global.config.set('projects', projects); // Update state.

      this.props.removeProject(removeIndex); // Unset active project.

      this.changeProject(null);
    } // Confirm project removal when clicking remove button.

  }, {
    key: "removeProjectButton",
    value: function removeProjectButton(event) {
      event.preventDefault();
      var confirmRemove = window.confirm("Are you sure you want to remove ".concat(this.props.active.name, "?"));

      if (confirmRemove) {
        this.removeProject();
      }
    } // Change active project's path.

  }, {
    key: "changeProjectPath",
    value: function changeProjectPath() {
      var _this3 = this;

      var path = dialog.showOpenDialog({
        properties: ['openDirectory']
      });

      if (path) {
        var projects = this.props.projects;
        var projectIndex = projects.findIndex(function (project) {
          return project.path === _this3.props.active.path;
        });

        if (projectIndex === -1) {
          // Project not found.
          return;
        }

        projects[projectIndex].path = path[0]; // Save new project to config.

        global.config.set('projects', projects); // Set new project as active.

        this.changeProject(projectIndex);
      }
    } // Start the background compiler tasks.

  }, {
    key: "initCompiler",
    value: function initCompiler() {
      if (!this.props.active.paused) {
        global.compiler.initProject();
      } else {
        global.compiler.killTasks();
      }
    } // Refresh the project files.

  }, {
    key: "refreshProject",
    value: function refreshProject() {
      this.getFiles(this.props.active.path);
    } // Create or fetch the project config file.

  }, {
    key: "setProjectConfigFile",
    value: function setProjectConfigFile(path) {
      global.projectConfig = new Store({
        name: 'code-komrade',
        cwd: path
      }); // Listen for changes to the project's file options and trigger the compiler init.

      global.projectConfig.onDidChange('files', _debounce(this.initCompiler, 100));
    } // Read the files in the project directory.

  }, {
    key: "getFiles",
    value: function getFiles(path) {
      this.setState({
        loading: true
      });
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
    } // Initialize project.

  }, {
    key: "initProject",
    value: function initProject(path) {
      fs.access(path, fs.constants.W_OK, function (err) {
        if (err) {
          if (path) {
            // Chosen directory not readable.
            var options = {
              type: 'warning',
              title: 'Project directory missing',
              message: "Could not read the ".concat(path, " directory. It may have been moved or renamed."),
              buttons: ['Change Directory', 'Remove Project']
            };
            dialog.showMessageBox(options, function (index) {
              if (index === 0) {
                this.changeProjectPath();
              } else if (index === 1) {
                this.removeProject();
              }
            }.bind(this));
          } else {
            // No project path provided.
            global.projectConfig = null;
            global.store.dispatch(receiveFiles({}));
            global.compiler.killTasks();
          }
        } else {
          // Directory is readable, get files and setup config.
          this.getFiles(path);
          this.setProjectConfigFile(path); // Change process cwd.

          process.chdir(path);
          this.initCompiler();
        }
      }.bind(this));
      global.logger = new Logger();
    }
  }, {
    key: "renderProjectSelect",
    value: function renderProjectSelect() {
      return React.createElement(ProjectSelect, {
        newProject: this.newProject,
        changeProject: this.changeProject,
        removeProject: this.removeProjectButton,
        refreshProject: this.refreshProject
      });
    }
  }, {
    key: "renderNotices",
    value: function renderNotices() {
      var notices = [];

      if (this.props.active.paused) {
        notices.push(React.createElement(Notice, {
          key: "paused",
          type: "warning"
        }, React.createElement("p", null, "Project is paused. Files will not be watched and auto compiled.")));
      }

      return notices;
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.props.projects || this.props.projects.length === 0) {
        // No projects yet, show welcome screen.
        return React.createElement(NoContent, {
          className: "welcome-screen"
        }, React.createElement("h1", null, "You don't have any projects yet."), React.createElement("h2", null, "Would you like to add one now?"), React.createElement("button", {
          className: "large flat add-new-project",
          onClick: this.newProject
        }, "Add Project"));
      } else if (!this.props.active.name || !this.props.active.path) {
        // No project selected, show selector.
        return React.createElement(NoContent, {
          className: "project-select-screen"
        }, this.renderProjectSelect());
      }

      return React.createElement("div", {
        id: "projects"
      }, React.createElement("div", {
        id: "header"
      }, this.renderProjectSelect()), React.createElement("div", {
        id: "content"
      }, this.renderNotices(), React.createElement(FileList, {
        path: this.props.active.path,
        files: this.props.files,
        loading: this.state.loading
      })), React.createElement(Panel, null));
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

},{"../../actions":1,"../../utils/Logger":27,"../../utils/directoryTree":28,"../NoContent":6,"../ui/Notice":24,"./Panel":14,"./ProjectSelect":15,"./filelist/FileList":18,"electron":undefined,"electron-store":undefined,"fs":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],17:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for displaying the settings.
 */
var React = require('react');

var NoContent = require('../NoContent');

var Settings =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Settings, _React$Component);

  function Settings() {
    _classCallCheck(this, Settings);

    return _possibleConstructorReturn(this, _getPrototypeOf(Settings).apply(this, arguments));
  }

  _createClass(Settings, [{
    key: "render",
    value: function render() {
      return React.createElement(NoContent, {
        className: "settings-screen"
      }, React.createElement("h1", null, "Settings"), React.createElement("h2", null, "Coming soon!"));
    }
  }]);

  return Settings;
}(React.Component);

module.exports = Settings;

},{"../NoContent":6,"react":undefined}],18:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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

var FileList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FileList, _React$Component);

  function FileList(props) {
    var _this;

    _classCallCheck(this, FileList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileList).call(this, props));
    _this.setActiveFile = _this.setActiveFile.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FileList, [{
    key: "getMimeType",
    value: function getMimeType(ext) {
      var type;

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
    key: "setActiveFile",
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
    key: "buildTree",
    value: function buildTree(file) {
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var type = file.type;
      var ext = file.extension || null;
      var children;

      if (file.type === 'directory') {
        if (file.children.length > 0) {
          var childrenItems = [];

          for (var child in file.children) {
            childrenItems.push(this.buildTree(file.children[child], level + 1));
          }

          children = React.createElement("ul", {
            className: "children",
            key: file.path + '-children'
          }, childrenItems);
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
    key: "render",
    value: function render() {
      if (this.props.loading) {
        return React.createElement(NoContent, {
          className: "loading"
        }, React.createElement("p", null, "Loading\u2026"));
      } else if (!this.props.path) {
        return React.createElement(NoContent, {
          className: "empty"
        }, React.createElement("p", null, "No project folder selected."));
      } else if (!this.props.files || !Object.keys(this.props.files).length) {
        return React.createElement(NoContent, {
          className: "empty"
        }, React.createElement("p", null, "Nothing to see here."));
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

      return React.createElement("ul", {
        id: "files"
      }, filelist);
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

},{"../../../actions":1,"../../NoContent":6,"./FileListDirectory":19,"./FileListFile":20,"react":undefined,"react-redux":undefined}],19:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for rendering a directory tree.
 */
var React = require('react');

var FileListDirectory =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FileListDirectory, _React$Component);

  function FileListDirectory(props) {
    var _this;

    _classCallCheck(this, FileListDirectory);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileListDirectory).call(this, props));
    _this.state = {
      expanded: false
    };
    _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FileListDirectory, [{
    key: "renderChildren",
    value: function renderChildren() {
      if (!this.state.expanded) {
        return null;
      }

      return this.props.children;
    }
  }, {
    key: "onClick",
    value: function onClick(event) {
      event.stopPropagation();
      this.setState(function (prevState) {
        return {
          expanded: !prevState.expanded
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      var className = 'directory';

      if (this.state.expanded) {
        className += ' expand';
      }

      return React.createElement("li", {
        className: className,
        onClick: this.onClick
      }, React.createElement("div", {
        className: "filename"
      }, String.fromCharCode('0x2003').repeat(this.props.level), React.createElement("span", {
        className: "icon"
      }), React.createElement("strong", null, this.props.file.name)), this.renderChildren());
    }
  }]);

  return FileListDirectory;
}(React.Component);

module.exports = FileListDirectory;

},{"react":undefined}],20:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for rendering a file in the filelist.
 */
var _require = require('electron'),
    remote = _require.remote,
    shell = _require.shell;

var Menu = remote.Menu,
    MenuItem = remote.MenuItem;

var React = require('react');

var FileListFile =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FileListFile, _React$Component);

  function FileListFile(props) {
    var _this;

    _classCallCheck(this, FileListFile);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileListFile).call(this, props));
    _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
    _this.onContextMenu = _this.onContextMenu.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FileListFile, [{
    key: "onClick",
    value: function onClick(event) {
      event.stopPropagation();
      this.props.setActiveFile({
        file: this.props.file,
        element: event.currentTarget
      });
    }
  }, {
    key: "onContextMenu",
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
          if (window.confirm("Are you sure you want to delete ".concat(this.props.file.name, "?"))) {
            if (shell.moveItemToTrash(filePath)) {
              /* global Event */
              document.dispatchEvent(new Event('bd/refresh/files'));
            } else {
              window.alert("Could not delete ".concat(this.props.file.name, "."));
            }
          }
        }.bind(this)
      }));
      menu.popup(remote.getCurrentWindow());
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("li", {
        className: this.props.type,
        onClick: this.onClick,
        onContextMenu: this.onContextMenu
      }, React.createElement("div", {
        className: "filename"
      }, String.fromCharCode('0x2003').repeat(this.props.level), React.createElement("span", {
        className: "icon"
      }), React.createElement("strong", null, this.props.file.name)));
    }
  }]);

  return FileListFile;
}(React.Component);

module.exports = FileListFile;

},{"electron":undefined,"react":undefined}],21:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for rendering build options for a file.
 */
var _require = require('../../../utils/pathHelpers'),
    slash = _require.slash,
    fileRelativePath = _require.fileRelativePath,
    fileAbsolutePath = _require.fileAbsolutePath,
    fileOutputPath = _require.fileOutputPath;

var React = require('react');

var FileOptions =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FileOptions, _React$Component);

  function FileOptions(props) {
    var _this;

    _classCallCheck(this, FileOptions);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileOptions).call(this, props));
    _this.state = {
      loading: false
    };
    _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
    _this.handleCompile = _this.handleCompile.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(FileOptions, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.handleCompileCallback = function () {
        this.setState({
          loading: false
        });
      }.bind(this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.handleCompileCallback = null;
    }
  }, {
    key: "getConfig",
    value: function getConfig(property) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var defaults = {
        path: fileRelativePath(this.props.base, this.props.file.path),
        output: this.defaultOutputPath(),
        options: {}
      };
      var stored = FileOptions.getFileFromConfig(this.props.base, this.props.file);
      var config = stored !== null ? stored : defaults;

      if (property) {
        return config[property] ? config[property] : defaultValue;
      } else {
        return config;
      }
    }
  }, {
    key: "setConfig",
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
          output: slash(fileRelativePath(this.props.base, this.defaultOutputPath()))
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
    key: "getOption",
    value: function getOption(option) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.state.options && this.state.options[option]) {
        return this.state.options[option];
      }

      return defaultValue;
    }
  }, {
    key: "setOption",
    value: function setOption(option, value) {
      var options = this.state.options || {};
      options[option] = value;
      this.setConfig('options', options);
      this.setState({
        options: options
      });
    }
  }, {
    key: "handleChange",
    value: function handleChange(name, value) {
      if (name === 'output') {
        this.setConfig('output', value);
        this.setState(this.state);
      } else {
        this.setOption(name, value);
      }
    }
  }, {
    key: "defaultOutputPath",
    value: function defaultOutputPath() {
      return fileOutputPath(this.props.file, this.outputSuffix, this.outputExtension);
    }
  }, {
    key: "getOutputPath",
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
    key: "handleCompile",
    value: function handleCompile() {
      this.setState({
        loading: true
      });
      global.compiler.processFile(this.props.base, this.getConfig(), this.state.buildTaskName, this.handleCompileCallback);
    }
  }, {
    key: "renderHeader",
    value: function renderHeader() {
      return React.createElement("div", {
        className: "header"
      }, React.createElement("strong", null, this.props.file.name));
    }
  }, {
    key: "renderFooter",
    value: function renderFooter() {
      return React.createElement("div", {
        className: "footer"
      }, React.createElement("button", {
        className: "compile green",
        onClick: this.handleCompile,
        disabled: this.state.loading
      }, this.state.loading ? 'Compiling...' : 'Compile'));
    }
  }, {
    key: "render",
    value: function render() {
      return null;
    }
  }], [{
    key: "getDerivedStateFromProps",
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
    key: "getOptionsFromConfig",
    value: function getOptionsFromConfig(base, file) {
      var cfile = FileOptions.getFileFromConfig(base, file);
      return cfile && cfile.options ? cfile.options : {};
    }
  }, {
    key: "getFileFromConfig",
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

      return null;
    }
  }]);

  return FileOptions;
}(React.Component);

module.exports = FileOptions;

},{"../../../utils/pathHelpers":30,"react":undefined}],22:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for displaying file options for a script.
 */
var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('../../fields/FieldSwitch');

var FieldSaveFile = require('../../fields/FieldSaveFile');

var FileOptionsScript =
/*#__PURE__*/
function (_FileOptions) {
  _inherits(FileOptionsScript, _FileOptions);

  function FileOptionsScript(props) {
    var _this;

    _classCallCheck(this, FileOptionsScript);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileOptionsScript).call(this, props));
    _this.outputSuffix = '-dist';
    _this.outputExtension = '.js';
    _this.saveDialogFilters = [{
      name: 'JavaScript',
      extensions: ['js']
    }];
    return _this;
  }

  _createClass(FileOptionsScript, [{
    key: "sourceMapsDisabled",
    value: function sourceMapsDisabled() {
      return !this.state.options || !this.state.options.bundle && !this.state.options.babel;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "file-options",
        className: "file-options-script"
      }, this.renderHeader(), React.createElement("div", {
        className: "body"
      }, React.createElement(FieldSaveFile, {
        name: "output",
        label: "Output Path",
        onChange: this.handleChange,
        value: this.getOutputPath('display'),
        sourceFile: this.props.file,
        sourceBase: this.props.base,
        dialogFilters: this.saveDialogFilters
      }), React.createElement("hr", null), React.createElement(FieldSwitch, {
        name: "autocompile",
        label: "Auto Compile",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('autocompile', false)
      }), React.createElement("hr", null), React.createElement(FieldSwitch, {
        name: "babel",
        label: "Babel",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('babel', false)
      }), React.createElement(FieldSwitch, {
        name: "uglify",
        label: "Uglify",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('uglify', false)
      }), React.createElement(FieldSwitch, {
        name: "sourcemaps",
        label: "Sourcemaps",
        labelPos: "left",
        disabled: this.sourceMapsDisabled(),
        onChange: this.handleChange,
        value: this.getOption('sourcemaps', false)
      })), this.renderFooter());
    }
  }]);

  return FileOptionsScript;
}(FileOptions);

module.exports = FileOptionsScript;

},{"../../fields/FieldSaveFile":10,"../../fields/FieldSwitch":12,"./FileOptions":21,"react":undefined}],23:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for displaying file options for a stylesheet.
 */
var React = require('react');

var FileOptions = require('./FileOptions');

var FieldSwitch = require('../../fields/FieldSwitch');

var FieldSelect = require('../../fields/FieldSelect');

var FieldSaveFile = require('../../fields/FieldSaveFile');

var NoContent = require('../../NoContent');

var FileOptionsStyles =
/*#__PURE__*/
function (_FileOptions) {
  _inherits(FileOptionsStyles, _FileOptions);

  function FileOptionsStyles(props) {
    var _this;

    _classCallCheck(this, FileOptionsStyles);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileOptionsStyles).call(this, props));
    _this.outputSuffix = '-dist';
    _this.outputExtension = '.css';
    _this.saveDialogFilters = [{
      name: 'CSS',
      extensions: ['css']
    }];
    return _this;
  }

  _createClass(FileOptionsStyles, [{
    key: "isPartial",
    value: function isPartial() {
      return this.props.file.name.startsWith('_');
    }
  }, {
    key: "render",
    value: function render() {
      if (this.isPartial()) {
        return React.createElement(NoContent, null, React.createElement("p", null, "This is a partial file,", React.createElement("br", null), " it cannot be compiled on its own."));
      }

      return React.createElement("div", {
        id: "file-options",
        className: "file-options-style"
      }, this.renderHeader(), React.createElement("div", {
        className: "body"
      }, React.createElement(FieldSaveFile, {
        name: "output",
        label: "Output Path",
        onChange: this.handleChange,
        value: this.getOutputPath('display'),
        sourceFile: this.props.file,
        sourceBase: this.props.base,
        dialogFilters: this.saveDialogFilters
      }), React.createElement("hr", null), React.createElement(FieldSwitch, {
        name: "autocompile",
        label: "Auto Compile",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('autocompile', false)
      }), React.createElement("hr", null), this.state.type === 'sass' && React.createElement(FieldSelect, {
        name: "style",
        label: "Output Style",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('style', 'nested'),
        options: {
          nested: 'Nested',
          compact: 'Compact',
          expanded: 'Expanded',
          compressed: 'Compressed'
        }
      }), React.createElement(FieldSwitch, {
        name: "sourcemaps",
        label: "Sourcemaps",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('sourcemaps', false)
      }), React.createElement(FieldSwitch, {
        name: "autoprefixer",
        label: "Autoprefixer",
        labelPos: "left",
        onChange: this.handleChange,
        value: this.getOption('autoprefixer', false)
      })), this.renderFooter());
    }
  }]);

  return FileOptionsStyles;
}(FileOptions);

module.exports = FileOptionsStyles;

},{"../../NoContent":6,"../../fields/FieldSaveFile":10,"../../fields/FieldSelect":11,"../../fields/FieldSwitch":12,"./FileOptions":21,"react":undefined}],24:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @file Component for showing notices and alerts.
 */
var React = require('react');

var Notice =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Notice, _React$Component);

  function Notice() {
    _classCallCheck(this, Notice);

    return _possibleConstructorReturn(this, _getPrototypeOf(Notice).apply(this, arguments));
  }

  _createClass(Notice, [{
    key: "render",
    value: function render() {
      var type = this.props.type || 'info';
      return React.createElement("div", {
        className: 'notice type-' + type
      }, this.props.children);
    }
  }]);

  return Notice;
}(React.Component);

module.exports = Notice;

},{"react":undefined}],25:[function(require,module,exports){
"use strict";

/**
 * @file Root reducer.
 */
var _require = require('redux'),
    combineReducers = _require.combineReducers;

var view = function view() {
  var current = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'files';
  var action = arguments.length > 1 ? arguments[1] : undefined;

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
  var action = arguments.length > 1 ? arguments[1] : undefined;

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

},{"./projects":26,"redux":undefined}],26:[function(require,module,exports){
"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/**
 * @file Projects reducer.
 */
var projects = function projects() {
  var projects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'ADD_PROJECT':
      return [].concat(_toConsumableArray(projects), [action.payload]);

    case 'REMOVE_PROJECT':
      return projects.filter(function (project, index) {
        return index !== action.id;
      });

    case 'REFRESH_ACTIVE_PROJECT':
      return projects.map(function (project, index) {
        if (index === parseInt(action.payload.id, 10)) {
          return action.payload;
        } else {
          return project;
        }
      });

    default:
      return projects;
  }
};

var activeProject = function activeProject() {
  var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'CHANGE_PROJECT':
      return action.payload;

    case 'SET_PROJECT_STATE':
      return _objectSpread({}, active, action.payload);

    default:
      return active;
  }
};

var activeProjectFiles = function activeProjectFiles() {
  var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

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

},{}],27:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @file Logger utility.
 */
var moment = require('moment');

var Logger =
/*#__PURE__*/
function () {
  function Logger() {
    _classCallCheck(this, Logger);

    this.logs = [];
  }

  _createClass(Logger, [{
    key: "log",
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
    key: "get",
    value: function get() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'desc';
      var logs;

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

},{"moment":undefined}],28:[function(require,module,exports){
"use strict";

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
    var item = {
      path: path,
      name: name
    };
    var stats;

    try {
      stats = fs.statSync(path);
    } catch (err) {
      // console.log( err );
      resolve(null);
    } // Skip if it matches the exclude regex.


    if (options && options.exclude && (options.exclude.test(path) || options.exclude.test(name))) {
      resolve(null);
    }

    if (stats.isFile()) {
      item.type = 'file';
      var ext = fspath.extname(path).toLowerCase(); // Skip if it does not match the extension regex.

      if (options && options.extensions && !options.extensions.test(ext)) {
        resolve(null);
      } // item.size = stats.size; // File size in bytes.


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
      }); // item.size = item.children.reduce( ( prev, cur ) => {
      // 	console.log( prev, cur.size );
      // 	return prev + cur.size;
      // }, 0 );
    } else {
      resolve(null); // Or set item.size = 0 for devices, FIFO and sockets ?
    }
  });
}

module.exports = directoryTree;

},{"bluebird":undefined,"fs":undefined,"path":undefined}],29:[function(require,module,exports){
"use strict";

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

},{}],30:[function(require,module,exports){
"use strict";

/**
 * @file Helper functions for resolving, transforming, generating and formatting paths.
 */
var path = require('path'); // https://github.com/sindresorhus/slash


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

},{"path":undefined}],31:[function(require,module,exports){
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

function getInitialState() {
  var state = {
    view: 'files',
    projects: [],
    activeProject: 0,
    activeProjectFiles: {},
    activeFile: null
  };

  if (global.config.has('projects')) {
    state.projects = global.config.get('projects');
  }

  if (state.projects.length && global.config.has('active-project')) {
    var activeIndex = global.config.get('active-project');

    if (state.projects[activeIndex]) {
      state.activeProject = state.projects[activeIndex];
      state.activeProject.id = activeIndex;
    }
  }

  return state;
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
  getInitialState: getInitialState,
  setProjectConfig: setProjectConfig,
  getDependencyArray: getDependencyArray
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9hY3Rpb25zL2luZGV4LmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvYXBwLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcGlsZXIvbWVzc2FnZXMuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL0FwcC5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9TaWRlYmFyLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTZWxlY3QuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUGFuZWwuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9TZXR0aW5ncy5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlbGlzdC9GaWxlTGlzdEZpbGUuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZS5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL3JlZHVjZXJzL3Byb2plY3RzLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL3V0aWxzL2dsb2JhbFVJLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUlBO0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFNBQU87QUFDTixJQUFBLElBQUksRUFBRSxhQURBO0FBRU4sSUFBQSxJQUFJLEVBQUo7QUFGTSxHQUFQO0FBSUEsQyxDQUVEOzs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsT0FBckIsRUFBK0I7QUFDOUIsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLGFBREE7QUFFTixJQUFBLE9BQU8sRUFBRTtBQUZILEdBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsT0FBeEIsRUFBa0M7QUFDakMsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLGdCQURBO0FBRU4sSUFBQSxPQUFPLEVBQUU7QUFGSCxHQUFQO0FBSUE7O0FBRUQsU0FBUyxhQUFULENBQXdCLEVBQXhCLEVBQTZCO0FBQzVCLFNBQU87QUFDTixJQUFBLElBQUksRUFBRSxnQkFEQTtBQUVOLElBQUEsRUFBRSxFQUFGO0FBRk0sR0FBUDtBQUlBOztBQUVELFNBQVMsb0JBQVQsQ0FBK0IsT0FBL0IsRUFBeUM7QUFDeEMsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLHdCQURBO0FBRU4sSUFBQSxP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bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQGZpbGUgQWN0aW9ucy5cbiAqL1xuXG4vLyBNYWluLlxuXG5mdW5jdGlvbiBjaGFuZ2VWaWV3KCB2aWV3ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfVklFVycsXG5cdFx0dmlld1xuXHR9O1xufVxuXG4vLyBQcm9qZWN0cy5cblxuZnVuY3Rpb24gYWRkUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQUREX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnQ0hBTkdFX1BST0pFQ1QnLFxuXHRcdHBheWxvYWQ6IHByb2plY3Rcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJvamVjdCggaWQgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFTU9WRV9QUk9KRUNUJyxcblx0XHRpZFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVGUkVTSF9BQ1RJVkVfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXRQcm9qZWN0U3RhdGUoIHN0YXRlICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdTRVRfUFJPSkVDVF9TVEFURScsXG5cdFx0cGF5bG9hZDogc3RhdGVcblx0fTtcbn1cblxuLy8gRmlsZXMuXG5cbmZ1bmN0aW9uIHJlY2VpdmVGaWxlcyggZmlsZXMgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1JFQ0VJVkVfRklMRVMnLFxuXHRcdHBheWxvYWQ6IGZpbGVzXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9BQ1RJVkVfRklMRScsXG5cdFx0cGF5bG9hZDogZmlsZVxuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2hhbmdlVmlldyxcblx0YWRkUHJvamVjdCxcblx0Y2hhbmdlUHJvamVjdCxcblx0cmVtb3ZlUHJvamVjdCxcblx0c2V0UHJvamVjdFN0YXRlLFxuXHRyZWNlaXZlRmlsZXMsXG5cdHNldEFjdGl2ZUZpbGUsXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0XG59O1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBzY3JpcHQuXG4gKi9cblxuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdlbGVjdHJvbi1zdG9yZScpO1xuXG5nbG9iYWwuY29uZmlnID0gbmV3IFN0b3JlKHtcblx0bmFtZTogJ2NvbmZpZydcbn0pO1xuXG5nbG9iYWwudWkgPSByZXF1aXJlKCcuL3V0aWxzL2dsb2JhbFVJJyk7XG5cbmdsb2JhbC5jb21waWxlciA9IHJlcXVpcmUoJy4vY29tcGlsZXIvaW50ZXJmYWNlJyk7XG5cbmdsb2JhbC5jb21waWxlclRhc2tzID0gW107XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxuY29uc3QgeyBQcm92aWRlciB9ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuY29uc3QgeyBjcmVhdGVTdG9yZSB9ID0gcmVxdWlyZSgncmVkdXgnKTtcblxuY29uc3Qgcm9vdFJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbmNvbnN0IHsgZ2V0SW5pdGlhbFN0YXRlIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5jb25zdCBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZSggcm9vdFJlZHVjZXIsIGluaXRpYWxTdGF0ZSApO1xuXG5nbG9iYWwuc3RvcmUgPSBzdG9yZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17IHN0b3JlIH0+XG5cdFx0PEFwcCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcblxuY29uc3QgeyBzbGVlcCB9ID0gcmVxdWlyZSgnLi91dGlscy91dGlscycpO1xuXG4vLyBBcHAgY2xvc2UvcmVzdGFydCBldmVudHMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPiAwICkge1xuXHRcdGNvbnNvbGUubG9nKCAnS2lsbGluZyAlZCBydW5uaW5nIHRhc2tzLi4uJywgZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoICk7XG5cblx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cblx0XHRzbGVlcCggMzAwICk7XG5cdH1cbn0pO1xuIiwiLyoqXG4qIEBmaWxlIEd1bHAgc2NyaXB0cyBhbmQgdGFza3MuXG4qL1xuXG4vKiBnbG9iYWwgTm90aWZpY2F0aW9uICovXG5cbmNvbnN0IHsgYXBwIH0gPSByZXF1aXJlKCAnZWxlY3Ryb24nICkucmVtb3RlO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcbi8vIGNvbnN0IGRlcGVuZGVuY3lUcmVlID0gcmVxdWlyZSggJ2RlcGVuZGVuY3ktdHJlZScgKTtcblxuY29uc3Qgc2FzcyA9IHJlcXVpcmUoICdub2RlLXNhc3MnICk7XG5jb25zdCBXYXRjaFNhc3MgPSByZXF1aXJlKCAnbm9kZS1zYXNzLXdhdGNoZXInICk7XG5jb25zdCBhdXRvcHJlZml4ZXIgPSByZXF1aXJlKCAnYXV0b3ByZWZpeGVyJyApO1xuY29uc3QgcHJlY3NzID0gcmVxdWlyZSggJ3ByZWNzcycgKTtcbmNvbnN0IHBvc3Rjc3MgPSByZXF1aXJlKCAncG9zdGNzcycgKTtcbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCAnd2VicGFjaycgKTtcbmNvbnN0IFVnbGlmeUpzUGx1Z2luID0gcmVxdWlyZSggJ3VnbGlmeWpzLXdlYnBhY2stcGx1Z2luJyApO1xuY29uc3QgZm9ybWF0TWVzc2FnZXMgPSByZXF1aXJlKCAnLi9tZXNzYWdlcycgKTtcblxuY29uc3QgeyBmaWxlQWJzb2x1dGVQYXRoIH0gPSByZXF1aXJlKCAnLi4vdXRpbHMvcGF0aEhlbHBlcnMnICk7XG4vLyBjb25zdCB7IGdldERlcGVuZGVuY3lBcnJheSB9ID0gcmVxdWlyZSggJy4uL3V0aWxzL3V0aWxzJyApO1xuXG5mdW5jdGlvbiBraWxsVGFza3MoKSB7XG5cdGlmICggZ2xvYmFsLmNvbXBpbGVyVGFza3MubGVuZ3RoID09PSAwICkge1xuXHRcdC8vIE5vdGhpbmcgdG8ga2lsbCA6KFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgdGFza3MgPSBnbG9iYWwuY29tcGlsZXJUYXNrcztcblxuXHRmb3IgKCBsZXQgaSA9IHRhc2tzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdGxldCB0YXNrID0gdGFza3NbIGkgXTtcblx0XHRsZXQgZmlsZW5hbWU7XG5cblx0XHRpZiAoIHR5cGVvZiB0YXNrLl9ldmVudHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXNrLl9ldmVudHMudXBkYXRlID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0ZmlsZW5hbWUgPSB0YXNrLmlucHV0UGF0aDtcblx0XHRcdC8vIENsb3NlIGNob2tpZGFyIHdhdGNoIHByb2Nlc3Nlcy5cblx0XHRcdHRhc2suaW5wdXRQYXRoV2F0Y2hlci5jbG9zZSgpO1xuXHRcdFx0dGFzay5yb290RGlyV2F0Y2hlci5jbG9zZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlbmFtZSA9IHRhc2suY29tcGlsZXIub3B0aW9ucy5lbnRyeTtcblx0XHRcdC8vIENsb3NlIHdlYnBhY2sgd2F0Y2ggcHJvY2Vzcy5cblx0XHRcdHRhc2suY2xvc2UoKTtcblx0XHR9XG5cblx0XHRjb25zb2xlLndhcm4oIGBTdG9wcGVkIHdhdGNoaW5nIFwiJHtmaWxlbmFtZX1cIi5gICk7XG5cblx0XHQvLyBSZW1vdmUgdGFzayBmcm9tIGFycmF5LlxuXHRcdHRhc2tzLnNwbGljZSggaSwgMSApO1xuXHR9XG5cblx0Z2xvYmFsLmNvbXBpbGVyVGFza3MgPSB0YXNrcztcblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaW5pdFByb2plY3QoKSB7XG5cdGtpbGxUYXNrcygpO1xuXG5cdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgcHJvamVjdEZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXG5cdGxldCBwcm9qZWN0UGF0aCA9IHBhdGgucGFyc2UoIGdsb2JhbC5wcm9qZWN0Q29uZmlnLnBhdGggKS5kaXI7XG5cblx0Zm9yICggdmFyIGZpbGVDb25maWcgb2YgcHJvamVjdEZpbGVzICkge1xuXHRcdHByb2Nlc3NGaWxlKCBwcm9qZWN0UGF0aCwgZmlsZUNvbmZpZyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NGaWxlKCBiYXNlLCBmaWxlQ29uZmlnLCB0YXNrTmFtZSA9IG51bGwsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG9wdGlvbnMgPSBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICk7XG5cblx0aWYgKCAhIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCB0YXNrTmFtZSApIHtcblx0XHRydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRpZiAoIG9wdGlvbnMud2F0Y2hUYXNrICkge1xuXHRcdFx0b3B0aW9ucy5nZXRJbXBvcnRzID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRydW5UYXNrKCAnd2F0Y2gnLCBvcHRpb25zICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU9wdGlvbnMoIGZpbGUgKSB7XG5cdGxldCBvcHRpb25zID0ge307XG5cblx0c3dpdGNoICggZmlsZS5leHRlbnNpb24gKSB7XG5cdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnY3NzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5zYXNzJzpcblx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnc2Fzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnbGVzcyc7XG5cdFx0XHRvcHRpb25zLmZpbGVUeXBlID0gJ3N0eWxlLScgKyBvcHRpb25zLnR5cGU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcuanMnOlxuXHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0b3B0aW9ucy50eXBlID0gJ2pzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc2NyaXB0Jztcblx0fVxuXG5cdG9wdGlvbnMuYnVpbGRUYXNrTmFtZSA9ICdidWlsZC0nICsgb3B0aW9ucy50eXBlO1xuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlQ29uZmlnKCBiYXNlLCBmaWxlQ29uZmlnICkge1xuXHRpZiAoICEgZmlsZUNvbmZpZy5wYXRoIHx8ICEgZmlsZUNvbmZpZy5vdXRwdXQgKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0bGV0IGZpbGVQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5wYXRoICk7XG5cdGxldCBvdXRwdXRQYXRoID0gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZUNvbmZpZy5vdXRwdXQgKTtcblx0bGV0IGNvbXBpbGVPcHRpb25zID0gZ2V0RmlsZU9wdGlvbnMoeyBleHRlbnNpb246IHBhdGguZXh0bmFtZSggZmlsZVBhdGggKSB9KTtcblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0aW5wdXQ6IGZpbGVQYXRoLFxuXHRcdGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKCBvdXRwdXRQYXRoICksXG5cdFx0b3V0cHV0OiBwYXRoLnBhcnNlKCBvdXRwdXRQYXRoICkuZGlyLFxuXHRcdHByb2plY3RCYXNlOiBiYXNlXG5cdH07XG5cblx0aWYgKCBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0Zm9yICggdmFyIG9wdGlvbiBpbiBmaWxlQ29uZmlnLm9wdGlvbnMgKSB7XG5cdFx0XHRpZiAoICEgZmlsZUNvbmZpZy5vcHRpb25zLmhhc093blByb3BlcnR5KCBvcHRpb24gKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNbIG9wdGlvbiBdID0gZmlsZUNvbmZpZy5vcHRpb25zWyBvcHRpb24gXTtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVDb25maWcub3B0aW9ucy5hdXRvY29tcGlsZSApIHtcblx0XHRcdG9wdGlvbnMud2F0Y2hUYXNrID0gY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gcnVuVGFzayggdGFza05hbWUsIG9wdGlvbnMgPSB7fSwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRjb25zb2xlLmdyb3VwKCAnUnVubmluZyB0YXNrJyApO1xuXHRjb25zb2xlLmxvZyggYFJ1bm5pbmcgXCIke3Rhc2tOYW1lfVwiIHdpdGggb3B0aW9uczpgLCBvcHRpb25zICk7XG5cdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblxuXHRsZXQgaW5wdXRGaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRpZiAoIHRhc2tOYW1lID09PSAnd2F0Y2gnICkge1xuXHRcdGhhbmRsZVdhdGNoVGFzayggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0fSBlbHNlIHtcblx0XHQvLyBCdWlsZCB0YXNrIHN0YXJ0aW5nLlxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnaW5mbycsIGBDb21waWxpbmcgJHtpbnB1dEZpbGVuYW1lfS4uLmAgKTtcblxuXHRcdHN3aXRjaCAoIHRhc2tOYW1lICkge1xuXHRcdFx0Y2FzZSAnYnVpbGQtc2Fzcyc6XG5cdFx0XHRcdGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2J1aWxkLWNzcyc6XG5cdFx0XHRcdGhhbmRsZUNzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYnVpbGQtanMnOlxuXHRcdFx0XHRoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc29sZS5lcnJvciggYFVuaGFuZGxlZCB0YXNrOiAke3Rhc2tOYW1lfWAgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdG9wdGlvbnMub3V0RmlsZSA9IHBhdGgucmVzb2x2ZSggb3B0aW9ucy5vdXRwdXQsIG9wdGlvbnMuZmlsZW5hbWUgKTtcblxuXHRzYXNzLnJlbmRlcigge1xuXHRcdGZpbGU6IG9wdGlvbnMuaW5wdXQsXG5cdFx0b3V0RmlsZTogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdG91dHB1dFN0eWxlOiBvcHRpb25zLnN0eWxlLFxuXHRcdHNvdXJjZU1hcDogb3B0aW9ucy5zb3VyY2VtYXBzLFxuXHRcdHNvdXJjZU1hcEVtYmVkOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0fSwgZnVuY3Rpb24oIGVycm9yLCByZXN1bHQgKSB7XG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXG5cdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIG9wdGlvbnMuYXV0b3ByZWZpeGVyICkge1xuXHRcdFx0XHRsZXQgcG9zdENzc09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0ZnJvbTogb3B0aW9ucy5pbnB1dCxcblx0XHRcdFx0XHR0bzogb3B0aW9ucy5vdXRGaWxlLFxuXHRcdFx0XHRcdG1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdFx0XHRcdH07XG5cdFx0XHRcdGhhbmRsZVBvc3RDc3NDb21waWxlKCBvcHRpb25zLCByZXN1bHQuY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGVycm9ycyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLCB3cml0ZSB0aGlzIHJlc3VsdCBvbiB0aGUgZGlza1xuXHRcdFx0XHRmcy53cml0ZUZpbGUoIG9wdGlvbnMub3V0RmlsZSwgcmVzdWx0LmNzcywgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0b3B0aW9ucy5vdXRGaWxlID0gcGF0aC5yZXNvbHZlKCBvcHRpb25zLm91dHB1dCwgb3B0aW9ucyApO1xuXG5cdGxldCBwb3N0Q3NzT3B0aW9ucyA9IHtcblx0XHRmcm9tOiBvcHRpb25zLmlucHV0LFxuXHRcdHRvOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0bWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0fTtcblxuXHRmcy5yZWFkRmlsZSggb3B0aW9ucy5pbnB1dCwgKCBlcnJvciwgY3NzICkgPT4ge1xuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIGNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIGNzcywgcG9zdENzc09wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0cG9zdGNzcyggWyBwcmVjc3MsIGF1dG9wcmVmaXhlciggeyBicm93c2VyczogWyAnbGFzdCA1IHZlcnNpb25zJyBdIH0gKSBdIClcblx0XHQucHJvY2VzcyggY3NzLCBwb3N0Q3NzT3B0aW9ucyApXG5cdFx0LnRoZW4oIHBvc3RDc3NSZXN1bHQgPT4ge1xuXHRcdFx0Ly8gTm8gZXJyb3JzIGR1cmluZyB0aGUgY29tcGlsYXRpb24sIHdyaXRlIHRoaXMgcmVzdWx0IG9uIHRoZSBkaXNrXG5cdFx0XHRmcy53cml0ZUZpbGUoIG9wdGlvbnMub3V0RmlsZSwgcG9zdENzc1Jlc3VsdC5jc3MsIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0XHRoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0bGV0IG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKCBhcHAuZ2V0QXBwUGF0aCgpLCAnbm9kZV9tb2R1bGVzJyApO1xuXHRpZiAoICEgbW9kdWxlc1BhdGgubWF0Y2goICdhcHAnICkgKSB7XG5cdFx0bW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdhcHAvbm9kZV9tb2R1bGVzJyApO1xuXHR9XG5cblx0bGV0IGNvbmZpZyA9IHtcblx0XHRtb2RlOiAnbm9uZScsXG5cdFx0ZW50cnk6IG9wdGlvbnMuaW5wdXQsXG5cdFx0Y2FjaGU6IGZhbHNlLFxuXHRcdG91dHB1dDoge1xuXHRcdFx0cGF0aDogb3B0aW9ucy5vdXRwdXQsXG5cdFx0XHRmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZVxuXHRcdH0sXG5cdFx0bW9kdWxlOiB7XG5cdFx0XHRydWxlczogWyB7XG5cdFx0XHRcdHRlc3Q6IC9cXC5qcyQvLFxuXHRcdFx0XHRleGNsdWRlOiAvKG5vZGVfbW9kdWxlc3xib3dlcl9jb21wb25lbnRzKS9cblx0XHRcdH0gXVxuXHRcdH0sXG5cdFx0cmVzb2x2ZUxvYWRlcjoge1xuXHRcdFx0bW9kdWxlczogWyBtb2R1bGVzUGF0aCBdXG5cdFx0fSxcblx0XHRkZXZ0b29sOiAoIG9wdGlvbnMuc291cmNlbWFwcyApID8gJ2lubGluZS1zb3VyY2UtbWFwJyA6IGZhbHNlLFxuXHRcdHBsdWdpbnM6IFtcblx0XHRcdG5ldyB3ZWJwYWNrLkRlZmluZVBsdWdpbigge1xuXHRcdFx0XHQncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeSggJ3Byb2R1Y3Rpb24nIClcblx0XHRcdH0gKSxcblx0XHRcdG5ldyB3ZWJwYWNrLm9wdGltaXplLk1vZHVsZUNvbmNhdGVuYXRpb25QbHVnaW4oKSxcblx0XHRcdG5ldyB3ZWJwYWNrLk5vRW1pdE9uRXJyb3JzUGx1Z2luKClcblx0XHRdXG5cdH07XG5cblx0aWYgKCBvcHRpb25zLmJhYmVsICkge1xuXHRcdGNvbmZpZy5tb2R1bGUucnVsZXNbIDAgXS51c2UgPSB7XG5cdFx0XHRsb2FkZXI6ICdiYWJlbC1sb2FkZXInLFxuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRwcmVzZXRzOiBbIHJlcXVpcmUoICdiYWJlbC1wcmVzZXQtZW52JyApIF0sXG5cdFx0XHRcdHBsdWdpbnM6IFsgcmVxdWlyZSggJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0tb2JqZWN0LXJlc3Qtc3ByZWFkJyApIF1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0aWYgKCBvcHRpb25zLnVnbGlmeSApIHtcblx0XHRsZXQgdWdsaWZ5T3B0aW9ucyA9IHtcblx0XHRcdHBhcmFsbGVsOiBmYWxzZSxcblx0XHRcdHNvdXJjZU1hcDogb3B0aW9ucy5zb3VyY2VtYXBzXG5cdFx0fTtcblxuXHRcdGNvbmZpZy5wbHVnaW5zLnB1c2goIG5ldyBVZ2xpZnlKc1BsdWdpbiggdWdsaWZ5T3B0aW9ucyApICk7XG5cdH1cblxuXHRjb25zdCBjb21waWxlciA9IHdlYnBhY2soIGNvbmZpZyApO1xuXG5cdGlmICggb3B0aW9ucy5nZXRJbnN0YW5jZSApIHtcblx0XHRyZXR1cm4gY29tcGlsZXI7XG5cdH1cblxuXHRjb21waWxlci5ydW4oICggZXJyb3IsIHN0YXRzICkgPT4ge1xuXHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCBlcnJvciApO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUuZ3JvdXAoICdXZWJwYWNrJyApO1xuXHRcdGNvbnNvbGUubG9nKCBzdGF0cyApO1xuXHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblxuXHRcdGNvbnN0IG1lc3NhZ2VzID0gZm9ybWF0TWVzc2FnZXMoIHN0YXRzICk7XG5cblx0XHRpZiAoICEgbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCAmJiAhbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIG1lc3NhZ2VzLmVycm9ycyApO1xuXHRcdH1cblxuXHRcdGlmICggbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gd2FybmluZyhzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggb3B0aW9ucywgbWVzc2FnZXMud2FybmluZ3MgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVXYXRjaFRhc2soIG9wdGlvbnMgKSB7XG5cdGlmICggb3B0aW9ucy53YXRjaFRhc2sgPT09ICdidWlsZC1zYXNzJyApIHtcblx0XHRsZXQgd2F0Y2hlck9wdGlvbnMgPSB7XG5cdFx0XHR2ZXJib3NpdHk6IDFcblx0XHR9O1xuXHRcdGxldCB3YXRjaGVyID0gbmV3IFdhdGNoU2Fzcyggb3B0aW9ucy5pbnB1dCwgd2F0Y2hlck9wdGlvbnMgKTtcblx0XHQvLyB3YXRjaGVyLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkgeyBoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucyApIH0pO1xuXHRcdHdhdGNoZXIub24oICd1cGRhdGUnLCBmdW5jdGlvbigpIHsgaGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMgKSB9ICk7XG5cdFx0d2F0Y2hlci5ydW4oKTtcblxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzLnB1c2goIHdhdGNoZXIgKTtcblx0fSBlbHNlIGlmICggb3B0aW9ucy53YXRjaFRhc2sgPT09ICdidWlsZC1qcycgKSB7XG5cdFx0Y29uc29sZS53YXJuKCBgU3RhcnQgd2F0Y2hpbmcgXCIke29wdGlvbnMuaW5wdXR9XCIuLi5gICk7XG5cdFx0b3B0aW9ucy5nZXRJbnN0YW5jZSA9IHRydWU7XG5cdFx0bGV0IGNvbXBpbGVyID0gaGFuZGxlSnNDb21waWxlKCBvcHRpb25zICk7XG5cdFx0bGV0IHdhdGNoZXIgPSBjb21waWxlci53YXRjaCh7XG5cdFx0XHRhZ2dyZWdhdGVUaW1lb3V0OiAzMDBcblx0XHR9LCAoIGVycm9yLCBzdGF0cyApID0+IHtcblx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVycm9yICk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnNvbGUuZ3JvdXAoICdXZWJwYWNrJyApO1xuXHRcdFx0Y29uc29sZS5sb2coIHN0YXRzICk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cblx0XHRcdGNvbnN0IG1lc3NhZ2VzID0gZm9ybWF0TWVzc2FnZXMoIHN0YXRzICk7XG5cblx0XHRcdGlmICggISBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICYmICFtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIHN1Y2Nlc3NmdWwuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMuZXJyb3JzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgbWVzc2FnZXMuZXJyb3JzICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzc2FnZXMud2FybmluZ3MubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0XHRoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIG1lc3NhZ2VzLndhcm5pbmdzICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR3YXRjaGVyLmludmFsaWRhdGUoKTtcblxuXHRcdGdsb2JhbC5jb21waWxlclRhc2tzLnB1c2goIHdhdGNoZXIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlU3VjY2Vzcyggb3B0aW9ucyApIHtcblx0bGV0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGxldCBub3RpZnlUZXh0ID0gYEZpbmlzaGVkIGNvbXBpbGluZyAke2ZpbGVuYW1lfS5gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnc3VjY2VzcycsIG5vdGlmeVRleHQgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0NvZGUgS29tcmFkZScsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNpbGVudDogdHJ1ZVxuXHR9ICk7XG5cblx0cmV0dXJuIG5vdGlmeTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvcnMgKSB7XG5cdGNvbnNvbGUuZXJyb3IoIGVycm9ycyApO1xuXG5cdGlmICggISBlcnJvcnMubGVuZ3RoICkge1xuXHRcdGVycm9ycyA9IFsgZXJyb3JzIF07XG5cdH1cblxuXHRsZXQgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0bGV0IG5vdGlmeVRleHQgPSAoIGVycm9ycy5sZW5ndGggPiAxID8gJ0Vycm9ycycgOiAnRXJyb3InICkgKyBgIHdoZW4gY29tcGlsaW5nICR7ZmlsZW5hbWV9YDtcblxuXHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIGVycm9ycy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcblxuXHRsZXQgbm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbiggJ0NvZGUgS29tcmFkZScsIHtcblx0XHRib2R5OiBub3RpZnlUZXh0LFxuXHRcdHNvdW5kOiAnQmFzc28nXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlV2FybmluZ3MoIG9wdGlvbnMsIHdhcm5pbmdzICkge1xuXHRjb25zb2xlLndhcm4oIHdhcm5pbmdzICk7XG5cblx0aWYgKCAhIHdhcm5pbmdzLmxlbmd0aCApIHtcblx0XHR3YXJuaW5ncyA9IFsgd2FybmluZ3MgXTtcblx0fVxuXG5cdGxldCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggd2FybmluZ3MubGVuZ3RoID4gMSA/ICdXYXJuaW5ncycgOiAnV2FybmluZycgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnd2FybicsIG5vdGlmeVRleHQgKyAnOicsICc8cHJlPicgKyB3YXJuaW5ncy5qb2luKCAnXFxyXFxuJyApICsgJzwvcHJlPicgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGluaXRQcm9qZWN0LFxuXHRydW5UYXNrLFxuXHRraWxsVGFza3MsXG5cdHByb2Nlc3NGaWxlLFxuXHRnZXRGaWxlQ29uZmlnLFxuXHRnZXRGaWxlT3B0aW9uc1xufVxuIiwiLyoqXG4gKiBUaGlzIGhhcyBiZWVuIGFkYXB0ZWQgZnJvbSBgY3JlYXRlLXJlYWN0LWFwcGAsIGF1dGhvcmVkIGJ5IEZhY2Vib29rLCBJbmMuXG4gKiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2luY3ViYXRvci9jcmVhdGUtcmVhY3QtYXBwL3RyZWUvbWFzdGVyL3BhY2thZ2VzL3JlYWN0LWRldi11dGlsc1xuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgc3RyaXBJbmRlbnQgPSByZXF1aXJlKCdzdHJpcC1pbmRlbnQnKTtcbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGggfSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IGVycm9yTGFiZWwgPSAnU3ludGF4IGVycm9yOic7XG5jb25zdCBpc0xpa2VseUFTeW50YXhFcnJvciA9IHN0ciA9PiBzdHIuaW5jbHVkZXMoIGVycm9yTGFiZWwgKTtcblxuY29uc3QgZXhwb3J0UmVnZXggPSAvXFxzKiguKz8pXFxzKihcIik/ZXhwb3J0ICcoLis/KScgd2FzIG5vdCBmb3VuZCBpbiAnKC4rPyknLztcbmNvbnN0IHN0YWNrUmVnZXggPSAvXlxccyphdFxccygoPyF3ZWJwYWNrOikuKSo6XFxkKzpcXGQrW1xccyldKihcXG58JCkvZ207XG5jb25zdCBmaWxlQW5kTGluZVJlZ2V4ID0gL2luIChbXihdKilcXHNcXChsaW5lXFxzKFxcZCopLFxcc2NvbHVtblxccyhcXGQqKVxcKS87XG5cbmZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UoIG1lc3NhZ2UsIGlzRXJyb3IgKSB7XG5cdGxldCBsaW5lcyA9IG1lc3NhZ2Uuc3BsaXQoICdcXG4nICk7XG5cblx0aWYgKCBsaW5lcy5sZW5ndGggPiAyICYmIGxpbmVzWyAxIF0gPT09ICcnICkge1xuXHRcdGxpbmVzLnNwbGljZSggMSwgMSApOyAvLyBSZW1vdmUgZXh0cmEgbmV3bGluZS5cblx0fVxuXG5cdC8vIFJlbW92ZSBsb2FkZXIgbm90YXRpb24gZnJvbSBmaWxlbmFtZXM6XG5cdC8vICAgYC4vfi9jc3MtbG9hZGVyIS4vc3JjL0FwcC5jc3NgIH5+PiBgLi9zcmMvQXBwLmNzc2Bcblx0aWYgKCBsaW5lc1swXS5sYXN0SW5kZXhPZiggJyEnICkgIT09IC0xICkge1xuXHRcdGxpbmVzWzBdID0gbGluZXNbMF0uc3Vic3RyKCBsaW5lc1sgMCBdLmxhc3RJbmRleE9mKCAnIScgKSArIDEgKTtcblx0fVxuXG5cdC8vIFJlbW92ZSB1c2VsZXNzIGBlbnRyeWAgZmlsZW5hbWUgc3RhY2sgZGV0YWlsc1xuXHRsaW5lcyA9IGxpbmVzLmZpbHRlciggbGluZSA9PiBsaW5lLmluZGV4T2YoICcgQCAnICkgIT09IDAgKTtcblxuXHQvLyAwIH4+IGZpbGVuYW1lOyAxIH4+IG1haW4gZXJyIG1zZ1xuXHRpZiAoICEgbGluZXNbMF0gfHwgISBsaW5lc1sxXSApIHtcblx0XHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCB2ZXJib3NlIFwibW9kdWxlIG5vdCBmb3VuZFwiIG1lc3NhZ2VzIGZvciBmaWxlcyBhbmQgcGFja2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBub3QgZm91bmQ6ICcgKSApIHtcblx0XHRsaW5lcyA9IFtcblx0XHRcdGxpbmVzWzBdLFxuXHRcdFx0bGluZXNbMV0gLy8gXCJNb2R1bGUgbm90IGZvdW5kOiBcIiBpcyBlbm91Z2ggZGV0YWlsXG5cdFx0XHRcdC5yZXBsYWNlKCBcIkNhbm5vdCByZXNvbHZlICdmaWxlJyBvciAnZGlyZWN0b3J5JyBcIiwgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ0Nhbm5vdCByZXNvbHZlIG1vZHVsZSAnLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnRXJyb3I6ICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdbQ2FzZVNlbnNpdGl2ZVBhdGhzUGx1Z2luXSAnLCAnJyApXG5cdFx0XTtcblx0fVxuXG5cdC8vIENsZWFucyB1cCBzeW50YXggZXJyb3IgbWVzc2FnZXMuXG5cdGlmICggbGluZXNbMV0uc3RhcnRzV2l0aCggJ01vZHVsZSBidWlsZCBmYWlsZWQ6ICcgKSApIHtcblx0XHRsaW5lc1sxXSA9IGxpbmVzWzFdLnJlcGxhY2UoICdNb2R1bGUgYnVpbGQgZmFpbGVkOiBTeW50YXhFcnJvcjonLCBlcnJvckxhYmVsICk7XG5cdH1cblxuXHRpZiAoIGxpbmVzWzFdLm1hdGNoKCBleHBvcnRSZWdleCApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggZXhwb3J0UmVnZXgsIFwiJDEgJyQ0JyBkb2VzIG5vdCBjb250YWluIGFuIGV4cG9ydCBuYW1lZCAnJDMnLlwiICk7XG5cdH1cblxuXHQvLyBSZWFzc2VtYmxlICYgU3RyaXAgaW50ZXJuYWwgdHJhY2luZywgZXhjZXB0IGB3ZWJwYWNrOmAgLS0gKGNyZWF0ZS1yZWFjdC1hcHAvcHVsbC8xMDUwKVxuXHRyZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKS5yZXBsYWNlKCBzdGFja1JlZ2V4LCAnJyApLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU3RkZXJyKCBkYXRhICkge1xuXHRjb25zb2xlLmxvZyggZGF0YSApO1xuXG5cdGxldCBlcnJPYmogPSB7fTtcblx0bGV0IHN0YXJ0Q2FwdHVyZSA9IGZhbHNlO1xuXG5cdHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoIC8oXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NVxcdTIwMjhcXHUyMDI5XSkvICk7XG5cblx0Zm9yICggdmFyIGxpbmUgb2YgbGluZXMgKSB7XG5cdFx0bGV0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcblxuXHRcdGlmICggIXRyaW1tZWQubGVuZ3RoICkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0cmltbWVkID09PSAnRGV0YWlsczonICkge1xuXHRcdFx0c3RhcnRDYXB0dXJlID0gdHJ1ZTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICggc3RhcnRDYXB0dXJlICkge1xuXHRcdFx0bGV0IGVyckFyciA9IHRyaW1tZWQuc3BsaXQoIC86XFxzKC4rKS8gKTtcblx0XHRcdGVyck9ialsgZXJyQXJyWyAwIF0gXSA9IGVyckFyclsgMSBdO1xuXG5cdFx0XHRpZiAoIGVyckFyclsgMCBdID09PSAnZm9ybWF0dGVkJyApIHtcblx0XHRcdFx0c3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGlmICggT2JqZWN0LmtleXMoIGVyck9iaiApLmxlbmd0aCApIHtcblx0XHRjb25zb2xlLmVycm9yKCBlcnJPYmogKTtcblxuXHRcdGdldEVyckxpbmVzKCBlcnJPYmouZmlsZSwgZXJyT2JqLmxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0aXRsZSA9IGVyck9iai5mb3JtYXR0ZWQucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0XHQnIGluICcgKyBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggcHJvY2Vzcy5jd2QoKSwgZXJyT2JqLmZpbGUgKSApICtcblx0XHRcdFx0JyBvbiBsaW5lICcgKyBlcnJPYmoubGluZSArXG5cdFx0XHRcdCc8L2NvZGU+JztcblxuXHRcdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdFx0fSApO1xuXHR9XG5cblx0Ly8gcmV0dXJuIGVyck9iajtcbn1cblxuZnVuY3Rpb24gZ2V0RXJyTGluZXMoIGZpbGVuYW1lLCBsaW5lLCBjYWxsYmFjayApIHtcblx0bGluZSA9IE1hdGgubWF4KCBwYXJzZUludCggbGluZSwgMTAgKSAtIDEgfHwgMCwgMCApO1xuXG5cdGZzLnJlYWRGaWxlKCBmaWxlbmFtZSwgZnVuY3Rpb24gKCBlcnIsIGRhdGEgKSB7XG5cdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gZGF0YS50b1N0cmluZyggJ3V0Zi04JyApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0aWYgKCArbGluZSA+IGxpbmVzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgbGluZUFyciA9IFtdO1xuXHRcdGxldCBfbGluZUFyciA9IFtdO1xuXHRcdGxldCBtaW5MaW5lID0gTWF0aC5tYXgoIGxpbmUgLSAyLCAwICk7XG5cdFx0bGV0IG1heExpbmUgPSBNYXRoLm1pbiggbGluZSArIDIsIGxpbmVzLmxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSBtaW5MaW5lOyBpIDw9IG1heExpbmU7IGkrKyApIHtcblx0XHRcdF9saW5lQXJyWyBpIF0gPSBsaW5lc1sgaSBdO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleHRyYW5lb3VzIGluZGVudGF0aW9uLlxuXHRcdGxldCBzdHJpcHBlZExpbmVzID0gc3RyaXBJbmRlbnQoIF9saW5lQXJyLmpvaW4oICdcXG4nICkgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdGZvciAoIHZhciBqID0gbWluTGluZTsgaiA8PSBtYXhMaW5lOyBqKysgKSB7XG5cdFx0XHRsaW5lQXJyLnB1c2goXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwibGluZScgKyAoIGxpbmUgPT09IGogPyAnIGhpZ2hsaWdodCcgOiAnJyApICsgJ1wiPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLW51bWJlclwiPicgKyAoIGogKyAxICkgKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJsaW5lLWNvbnRlbnRcIj4nICsgc3RyaXBwZWRMaW5lc1sgaiBdICsgJzwvc3Bhbj4nICtcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2soIG51bGwsIGxpbmVBcnIuam9pbiggJ1xcbicgKSApO1xuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtZXNzYWdlICkge1xuXHRsZXQgZmlsZUFuZExpbmUgPSBtZXNzYWdlLm1hdGNoKCBmaWxlQW5kTGluZVJlZ2V4ICk7XG5cblx0aWYgKCAhIGZpbGVBbmRMaW5lICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBmaWxlID0gZmlsZUFuZExpbmVbIDEgXTtcblx0bGV0IGxpbmUgPSBmaWxlQW5kTGluZVsgMiBdO1xuXG5cdGNvbnNvbGUubG9nKCBmaWxlQW5kTGluZSApO1xuXG5cdGdldEVyckxpbmVzKCBmaWxlLCBsaW5lLCBmdW5jdGlvbiggZXJyLCBsaW5lcyApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVyciApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCB0aXRsZSA9IG1lc3NhZ2UucmVwbGFjZSggL1xcLiQvLCAnJyApICtcblx0XHRcdCc8Y29kZT4nICtcblx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBmaWxlICkgKSArXG5cdFx0XHQnIG9uIGxpbmUgJyArIGxpbmUgK1xuXHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0bGV0IGRldGFpbHMgPSAnPHByZT4nICsgbGluZXMgKyAnPC9wcmU+JztcblxuXHRcdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCB0aXRsZSwgZGV0YWlscyApO1xuXHR9ICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHN0YXRzICkge1xuXHRjb25zdCBqc29uID0gc3RhdHMudG9Kc29uKCB7fSwgdHJ1ZSApO1xuXG5cdGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGhhbmRsZUZpbGVBbmRMaW5lRXJyb3JzKCBtc2cgKSApO1xuXG5cdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRlcnJvcnM6IGpzb24uZXJyb3JzLm1hcCggbXNnID0+IGZvcm1hdE1lc3NhZ2UoIG1zZywgdHJ1ZSApICksXG5cdFx0d2FybmluZ3M6IGpzb24ud2FybmluZ3MubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCBmYWxzZSApIClcblx0fTtcblxuXHQvLyBPbmx5IHNob3cgc3ludGF4IGVycm9ycyBpZiB3ZSBoYXZlIHRoZW1cblx0aWYgKCByZXN1bHQuZXJyb3JzLnNvbWUoIGlzTGlrZWx5QVN5bnRheEVycm9yICkgKSB7XG5cdFx0cmVzdWx0LmVycm9ycyA9IHJlc3VsdC5lcnJvcnMuZmlsdGVyKCBpc0xpa2VseUFTeW50YXhFcnJvciApO1xuXHR9XG5cblx0Ly8gRmlyc3QgZXJyb3IgaXMgdXN1YWxseSBpdDsgb3RoZXJzIHVzdWFsbHkgdGhlIHNhbWVcblx0aWYgKCByZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDEgKSB7XG5cdFx0cmVzdWx0LmVycm9ycy5sZW5ndGggPSAxO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlO1xuIiwiLyoqXG4gKiBAZmlsZSBNYWluIGFwcCBjb21wb25lbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoICdyZWFjdC1yZWR1eCcgKTtcblxuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xuXG5jb25zdCBTaWRlYmFyID0gcmVxdWlyZSgnLi9TaWRlYmFyJyk7XG5cbmNvbnN0IExvZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL0xvZ3MnKTtcblxuY29uc3QgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3Byb2plY3RzL1NldHRpbmdzJyk7XG5cbmNvbnN0IFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy9Qcm9qZWN0cycpO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnZpZXdzID0ge1xuXHRcdFx0ZmlsZXM6ICdGaWxlcycsXG5cdFx0XHRsb2dzOiAnTG9ncycsXG5cdFx0XHRzZXR0aW5nczogJ1NldHRpbmdzJ1xuXHRcdH07XG5cdH1cblxuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGdsb2JhbC51aS5vdmVybGF5KCB0aGlzLnByb3BzLnZpZXcgIT09ICdmaWxlcycgKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy52aWV3ID09PSAnZmlsZXMnICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgY29udGVudDtcblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLnZpZXcgPT09ICdsb2dzJyApIHtcblx0XHRcdFx0Y29udGVudCA9IDxMb2dzIC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGVudCA9IDxTZXR0aW5ncyAvPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE92ZXJsYXkgaGFzQ2xvc2U9eyBmYWxzZSB9PlxuXHRcdFx0XHRcdHsgY29udGVudCB9XG5cdFx0XHRcdDwvT3ZlcmxheT5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50JyArICggcHJvcHMuY2xhc3NOYW1lID8gJyAnICsgcHJvcHMuY2xhc3NOYW1lIDogJycgKSB9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2lubmVyJz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY2hhbmdlVmlldyB9ID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZTogc3RhdGUudmlld1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRjaGFuZ2VWaWV3OiB2aWV3ID0+IGRpc3BhdGNoKCBjaGFuZ2VWaWV3KCB2aWV3ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggU2lkZWJhciApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycyApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5maWx0ZXJzID0gdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZyggZmlsZVNhdmVPcHRpb25zICk7XG5cblx0XHRpZiAoIGZpbGVuYW1lICkge1xuXHRcdFx0bGV0IHNhdmVQYXRoID0gc2xhc2goIGZpbGVuYW1lICk7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0XHRzYXZlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIGZpbGVuYW1lICkgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCB0aGlzLnByb3BzLm5hbWUsIHNhdmVQYXRoICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0naGlkZGVuJ1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0cmVhZE9ubHlcblx0XHRcdFx0Lz5cblx0XHRcdFx0PHNtYWxsIG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT57IHRoaXMucHJvcHMudmFsdWUgfTwvc21hbGw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgZXZlbnQudGFyZ2V0LnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMucHJvcHMudmFsdWUgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXIgXSksXG5cdG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgISB0aGlzLnByb3BzLnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFN3aXRjaC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5ib29sLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBsb2dzIGFuZCBpbmZvcm1hdGlvbi5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGxldCBsb2dJbmRleCA9IDA7XG5cdFx0bGV0IGxvZ0xpc3QgPSBbXTtcblxuXHRcdGZvciAoIHZhciBsb2cgb2YgdGhpcy5zdGF0ZS5sb2dzICkge1xuXHRcdFx0bGV0IHRpdGxlSFRNTCA9IHsgX19odG1sOiBsb2cudGl0bGUgfTtcblx0XHRcdGxldCBib2R5SFRNTCA9ICggbG9nLmJvZHkgKSA/IHsgX19odG1sOiBsb2cuYm9keSB9IDogbnVsbDtcblxuXHRcdFx0bG9nTGlzdC5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBsb2dJbmRleCB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgJ3R5cGUtJyArIGxvZy50eXBlIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0XHQ8c21hbGw+eyBsb2cudGltZSB9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUtdGV4dCcgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyB0aXRsZUhUTUwgfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHsgYm9keUhUTUwgJiZcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXRhaWxzJyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IGJvZHlIVE1MIH0gLz5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpO1xuXHRcdFx0bG9nSW5kZXgrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gPHVsPnsgbG9nTGlzdCB9PC91bD47XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUubG9ncy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4gZW1wdHknPlxuXHRcdFx0XHRcdDxoMT5ObyBsb2dzIHlldC48L2gxPlxuXHRcdFx0XHRcdDxoMj5HbyBmb3J0aCBhbmQgY29tcGlsZSE8L2gyPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoICdyZWFjdCcgKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCAncmVhY3QtcmVkdXgnICk7XG5cbmNvbnN0IGF1dG9CaW5kID0gcmVxdWlyZSggJ2F1dG8tYmluZCcgKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUsIHJlZnJlc2hBY3RpdmVQcm9qZWN0IH0gPSByZXF1aXJlKCAnLi4vLi4vYWN0aW9ucycgKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0Q29uZmlnIH0gPSByZXF1aXJlKCAnLi4vLi4vdXRpbHMvdXRpbHMnICk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG5cdC8qKlxuXHQgKiBDb25zdHJjdXRvci5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH07XG5cblx0XHRhdXRvQmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdGdsb2JhbC51aS51bmZvY3VzKCAhdGhpcy5zdGF0ZS5pc09wZW4gKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIHsgaXNPcGVuOiAhdGhpcy5zdGF0ZS5pc09wZW4gfSApO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gIXRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCB8fCBmYWxzZTtcblxuXHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdFN0YXRlKCB7IHBhdXNlZDogcGF1c2VkIH0gKTtcblxuXHRcdHRoaXMucHJvcHMucmVmcmVzaEFjdGl2ZVByb2plY3QoIHtcblx0XHRcdC4uLnRoaXMucHJvcHMuYWN0aXZlLFxuXHRcdFx0cGF1c2VkOiBwYXVzZWRcblx0XHR9ICk7XG5cblx0XHRzZXRQcm9qZWN0Q29uZmlnKCAncGF1c2VkJywgcGF1c2VkICk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRjb25zdCBzZWxlY3REcm9wZG93biA9IChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9e3RoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJyd9PlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5wcm9qZWN0cy5tYXAoICggcHJvamVjdCwgaW5kZXggKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdDxkaXYga2V5PXtpbmRleH0gZGF0YS1wcm9qZWN0PXtpbmRleH0gb25DbGljaz17dGhpcy5zZWxlY3RQcm9qZWN0fT5cblx0XHRcdFx0XHRcdFx0e3Byb2plY3QubmFtZX1cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gKX1cblxuXHRcdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17dGhpcy5zZWxlY3RQcm9qZWN0fT5cblx0XHRcdFx0XHQrIEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRpZiAoICF0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICF0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVNlbGVjdH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7c2VsZWN0RHJvcGRvd259XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17dGhpcy50b2dnbGVTZWxlY3R9PlxuXHRcdFx0XHRcdDxoMT57dGhpcy5wcm9wcy5hY3RpdmUubmFtZX08L2gxPlxuXHRcdFx0XHRcdDxoMj57dGhpcy5wcm9wcy5hY3RpdmUucGF0aH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyd0b2dnbGUnICsgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgPyAnIHBhdXNlZCcgOiAnIGFjdGl2ZScgKX0gb25DbGljaz17dGhpcy50b2dnbGVQcm9qZWN0fSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVmcmVzaCcgb25DbGljaz17dGhpcy5wcm9wcy5yZWZyZXNoUHJvamVjdH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0fSAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0e3NlbGVjdERyb3Bkb3dufVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKCB7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59ICk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoIHtcblx0c2V0UHJvamVjdFN0YXRlOiBzdGF0ZSA9PiBkaXNwYXRjaCggc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApICksXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0OiBwcm9qZWN0ID0+IGRpc3BhdGNoKCByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIClcbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jb25zdCBmc3BhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IF9kZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC9kZWJvdW5jZScpO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCcuLi91aS9Ob3RpY2UnKTtcblxuY29uc3QgUHJvamVjdFNlbGVjdCA9IHJlcXVpcmUoJy4vUHJvamVjdFNlbGVjdCcpO1xuXG5jb25zdCBGaWxlTGlzdCA9IHJlcXVpcmUoJy4vZmlsZWxpc3QvRmlsZUxpc3QnKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL1BhbmVsJyk7XG5cbmNvbnN0IGRpcmVjdG9yeVRyZWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyk7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0xvZ2dlcicpO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBQcm9qZWN0cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpZ25vcmVkOiBbXG5cdFx0XHRcdCcuZ2l0Jyxcblx0XHRcdFx0J25vZGVfbW9kdWxlcycsXG5cdFx0XHRcdCcuRFNfU3RvcmUnLFxuXHRcdFx0XHQnY29kZS1rb21yYWRlLmpzb24nXG5cdFx0XHRdLFxuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5uZXdQcm9qZWN0ID0gdGhpcy5uZXdQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmluaXRQcm9qZWN0ID0gdGhpcy5pbml0UHJvamVjdC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0ID0gdGhpcy5jaGFuZ2VQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLnJlbW92ZVByb2plY3QgPSB0aGlzLnJlbW92ZVByb2plY3QuYmluZCggdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFByb2plY3QgPSB0aGlzLnJlZnJlc2hQcm9qZWN0LmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoID0gdGhpcy5jaGFuZ2VQcm9qZWN0UGF0aC5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uID0gdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uLmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMuaW5pdENvbXBpbGVyID0gdGhpcy5pbml0Q29tcGlsZXIuYmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGEgbmV3IHByb2plY3QuXG5cdG5ld1Byb2plY3QoKSB7XG5cdFx0ZGlhbG9nLnNob3dPcGVuRGlhbG9nKFxuXHRcdFx0Z2xvYmFsLm1haW5XaW5kb3csXG5cdFx0XHR7XG5cdFx0XHRcdHByb3BlcnRpZXM6IFsgJ29wZW5EaXJlY3RvcnknIF1cblx0XHRcdH0sXG5cdFx0XHQoIHBhdGggKSA9PiB7XG5cdFx0XHRcdGlmICggcGF0aCApIHtcblx0XHRcdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRcdFx0cGF0aDogcGF0aFswXSxcblx0XHRcdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGxldCBuZXdQcm9qZWN0SW5kZXggPSB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aDtcblxuXHRcdFx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBbXG5cdFx0XHRcdFx0XHQuLi50aGlzLnByb3BzLnByb2plY3RzLFxuXHRcdFx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XHRcdF0gKTtcblxuXHRcdFx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0XHRcdC8vIFNldCBuZXcgcHJvamVjdCBhcyBhY3RpdmUuXG5cdFx0XHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBuZXdQcm9qZWN0SW5kZXgsIG5ld1Byb2plY3QgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBDaGFuZ2UgdGhlIGFjdGl2ZSBwcm9qZWN0LlxuXHRjaGFuZ2VQcm9qZWN0KCBpZCwgcHJvamVjdCA9IG51bGwgKSB7XG5cdFx0aWYgKCBpZCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUuaWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGFjdGl2ZSA9IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0cGF0aDogJycsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0aWYgKCBwcm9qZWN0ICkge1xuXHRcdFx0YWN0aXZlID0gcHJvamVjdDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnByb3BzLnByb2plY3RzW2lkXSApIHtcblx0XHRcdGFjdGl2ZSA9IHRoaXMucHJvcHMucHJvamVjdHNbaWRdO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdhY3RpdmUtcHJvamVjdCcsIGlkICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KHtcblx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdGlkXG5cdFx0fSk7XG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKCBudWxsICk7XG5cblx0XHQvLyBJbml0LlxuXHRcdHRoaXMuaW5pdFByb2plY3QoIGFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBSZW1vdmUgdGhlIGN1cnJlbnQgcHJvamVjdC5cblx0cmVtb3ZlUHJvamVjdCgpIHtcblx0XHRsZXQgcmVtb3ZlSW5kZXggPSBwYXJzZUludCggdGhpcy5wcm9wcy5hY3RpdmUuaWQsIDEwICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gUmVtb3ZlIHByb2plY3QgZnJvbSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0KCByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gVW5zZXQgYWN0aXZlIHByb2plY3QuXG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBudWxsICk7XG5cdH1cblxuXHQvLyBDb25maXJtIHByb2plY3QgcmVtb3ZhbCB3aGVuIGNsaWNraW5nIHJlbW92ZSBidXR0b24uXG5cdHJlbW92ZVByb2plY3RCdXR0b24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3RoaXMucHJvcHMuYWN0aXZlLm5hbWV9P2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdHRoaXMucmVtb3ZlUHJvamVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoYW5nZSBhY3RpdmUgcHJvamVjdCdzIHBhdGguXG5cdGNoYW5nZVByb2plY3RQYXRoKCkge1xuXHRcdGxldCBwYXRoID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nKCB7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknXVxuXHRcdH0gKTtcblxuXHRcdGlmICggcGF0aCApIHtcblx0XHRcdGxldCBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHM7XG5cdFx0XHRsZXQgcHJvamVjdEluZGV4ID0gcHJvamVjdHMuZmluZEluZGV4KCBwcm9qZWN0ID0+IHByb2plY3QucGF0aCA9PT0gdGhpcy5wcm9wcy5hY3RpdmUucGF0aCApO1xuXG5cdFx0XHRpZiAoIHByb2plY3RJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRcdC8vIFByb2plY3Qgbm90IGZvdW5kLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHByb2plY3RzWyBwcm9qZWN0SW5kZXggXS5wYXRoID0gcGF0aFswXTtcblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggcHJvamVjdEluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gU3RhcnQgdGhlIGJhY2tncm91bmQgY29tcGlsZXIgdGFza3MuXG5cdGluaXRDb21waWxlcigpIHtcblx0XHRpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0Z2xvYmFsLmNvbXBpbGVyLmluaXRQcm9qZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBSZWZyZXNoIHRoZSBwcm9qZWN0IGZpbGVzLlxuXHRyZWZyZXNoUHJvamVjdCgpIHtcblx0XHR0aGlzLmdldEZpbGVzKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvLyBDcmVhdGUgb3IgZmV0Y2ggdGhlIHByb2plY3QgY29uZmlnIGZpbGUuXG5cdHNldFByb2plY3RDb25maWdGaWxlKCBwYXRoICkge1xuXHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbmV3IFN0b3JlKHtcblx0XHRcdG5hbWU6ICdjb2RlLWtvbXJhZGUnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHByb2plY3QncyBmaWxlIG9wdGlvbnMgYW5kIHRyaWdnZXIgdGhlIGNvbXBpbGVyIGluaXQuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcub25EaWRDaGFuZ2UoICdmaWxlcycsIF9kZWJvdW5jZSggdGhpcy5pbml0Q29tcGlsZXIsIDEwMCApICk7XG5cdH1cblxuXHQvLyBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdGdldEZpbGVzKCBwYXRoICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBleGNsdWRlID0gbmV3IFJlZ0V4cCggdGhpcy5zdGF0ZS5pZ25vcmVkLmpvaW4oJ3wnKSwgJ2knICk7XG5cblx0XHRkaXJlY3RvcnlUcmVlKCBwYXRoLCB7XG5cdFx0XHQvLyBkZXB0aDogMixcblx0XHRcdGV4Y2x1ZGVcblx0XHR9KS50aGVuKCBmdW5jdGlvbiggZmlsZXMgKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGdsb2JhbC51aS5sb2FkaW5nKCBmYWxzZSApO1xuXHRcdH0uYmluZCggdGhpcyApKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgcHJvamVjdC5cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUuXG5cdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICd3YXJuaW5nJyxcblx0XHRcdFx0XHRcdHRpdGxlOiAnUHJvamVjdCBkaXJlY3RvcnkgbWlzc2luZycsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LiBJdCBtYXkgaGF2ZSBiZWVuIG1vdmVkIG9yIHJlbmFtZWQuYCxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFsgJ0NoYW5nZSBEaXJlY3RvcnknLCAnUmVtb3ZlIFByb2plY3QnIF1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZGlhbG9nLnNob3dNZXNzYWdlQm94KCBvcHRpb25zLCBmdW5jdGlvbiggaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGluZGV4ID09PSAwICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZVByb2plY3RQYXRoKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gMSApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVQcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBObyBwcm9qZWN0IHBhdGggcHJvdmlkZWQuXG5cdFx0XHRcdFx0Z2xvYmFsLnByb2plY3RDb25maWcgPSBudWxsO1xuXG5cdFx0XHRcdFx0Z2xvYmFsLnN0b3JlLmRpc3BhdGNoKCByZWNlaXZlRmlsZXMoIHt9ICkgKTtcblxuXHRcdFx0XHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5IGlzIHJlYWRhYmxlLCBnZXQgZmlsZXMgYW5kIHNldHVwIGNvbmZpZy5cblx0XHRcdFx0dGhpcy5nZXRGaWxlcyggcGF0aCApO1xuXG5cdFx0XHRcdHRoaXMuc2V0UHJvamVjdENvbmZpZ0ZpbGUoIHBhdGggKTtcblxuXHRcdFx0XHQvLyBDaGFuZ2UgcHJvY2VzcyBjd2QuXG5cdFx0XHRcdHByb2Nlc3MuY2hkaXIoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRDb21waWxlcigpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHRnbG9iYWwubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17IHRoaXMubmV3UHJvamVjdCB9XG5cdFx0XHRcdGNoYW5nZVByb2plY3Q9eyB0aGlzLmNoYW5nZVByb2plY3QgfVxuXHRcdFx0XHRyZW1vdmVQcm9qZWN0PXsgdGhpcy5yZW1vdmVQcm9qZWN0QnV0dG9uIH1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9eyB0aGlzLnJlZnJlc2hQcm9qZWN0IH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlck5vdGljZXMoKSB7XG5cdFx0bGV0IG5vdGljZXMgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmUucGF1c2VkICkge1xuXHRcdFx0bm90aWNlcy5wdXNoKCAoXG5cdFx0XHRcdDxOb3RpY2Uga2V5PSdwYXVzZWQnIHR5cGU9J3dhcm5pbmcnPlxuXHRcdFx0XHRcdDxwPlByb2plY3QgaXMgcGF1c2VkLiBGaWxlcyB3aWxsIG5vdCBiZSB3YXRjaGVkIGFuZCBhdXRvIGNvbXBpbGVkLjwvcD5cblx0XHRcdFx0PC9Ob3RpY2U+XG5cdFx0XHQpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vdGljZXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMucHJvamVjdHMgfHwgdGhpcy5wcm9wcy5wcm9qZWN0cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0cyB5ZXQsIHNob3cgd2VsY29tZSBzY3JlZW4uXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nd2VsY29tZS1zY3JlZW4nPlxuXHRcdFx0XHRcdDxoMT5Zb3UgZG9uJ3QgaGF2ZSBhbnkgcHJvamVjdHMgeWV0LjwvaDE+XG5cdFx0XHRcdFx0PGgyPldvdWxkIHlvdSBsaWtlIHRvIGFkZCBvbmUgbm93PzwvaDI+XG5cdFx0XHRcdFx0PGJ1dHRvbiBjbGFzc05hbWU9J2xhcmdlIGZsYXQgYWRkLW5ldy1wcm9qZWN0JyBvbkNsaWNrPXsgdGhpcy5uZXdQcm9qZWN0IH0+QWRkIFByb2plY3Q8L2J1dHRvbj5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5hY3RpdmUubmFtZSB8fCAhIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0IHNlbGVjdGVkLCBzaG93IHNlbGVjdG9yLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3Byb2plY3Qtc2VsZWN0LXNjcmVlbic+XG5cdFx0XHRcdFx0eyB0aGlzLnJlbmRlclByb2plY3RTZWxlY3QoKSB9XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdHMnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdoZWFkZXInPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCkgfVxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHQ8ZGl2IGlkPSdjb250ZW50Jz5cblx0XHRcdFx0XHR7IHRoaXMucmVuZGVyTm90aWNlcygpIH1cblxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggfVxuXHRcdFx0XHRcdFx0ZmlsZXM9eyB0aGlzLnByb3BzLmZpbGVzIH1cblx0XHRcdFx0XHRcdGxvYWRpbmc9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxQYW5lbCAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzLFxuXHRhY3RpdmU6IHN0YXRlLmFjdGl2ZVByb2plY3QsXG5cdGZpbGVzOiBzdGF0ZS5hY3RpdmVQcm9qZWN0RmlsZXNcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0YWRkUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggYWRkUHJvamVjdCggcHJvamVjdCApICksXG5cdGNoYW5nZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCBjaGFuZ2VQcm9qZWN0KCBpZCApICksXG5cdHJlbW92ZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCByZW1vdmVQcm9qZWN0KCBpZCApICksXG5cdHNldEFjdGl2ZUZpbGU6IGZpbGUgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0cyApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIHNldHRpbmdzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vTm9Db250ZW50Jyk7XG5cbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nc2V0dGluZ3Mtc2NyZWVuJz5cblx0XHRcdFx0PGgxPlNldHRpbmdzPC9oMT5cblx0XHRcdFx0PGgyPkNvbWluZyBzb29uITwvaDI+XG5cdFx0XHQ8L05vQ29udGVudD5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3M7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVMaXN0RmlsZSA9IHJlcXVpcmUoJy4vRmlsZUxpc3RGaWxlJyk7XG5cbmNvbnN0IEZpbGVMaXN0RGlyZWN0b3J5ID0gcmVxdWlyZSgnLi9GaWxlTGlzdERpcmVjdG9yeScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY29uc3QgeyBzZXRBY3RpdmVGaWxlIH0gPSByZXF1aXJlKCcuLi8uLi8uLi9hY3Rpb25zJyk7XG5cbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zZXRBY3RpdmVGaWxlID0gdGhpcy5zZXRBY3RpdmVGaWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGdldE1pbWVUeXBlKCBleHQgKSB7XG5cdFx0bGV0IHR5cGU7XG5cblx0XHRzd2l0Y2ggKCBleHQgKSB7XG5cdFx0XHRjYXNlICcuc3ZnJzpcblx0XHRcdGNhc2UgJy5wbmcnOlxuXHRcdFx0Y2FzZSAnLmpwZyc6XG5cdFx0XHRcdHR5cGUgPSAnbWVkaWEnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnBocCc6XG5cdFx0XHRjYXNlICcuaHRtbCc6XG5cdFx0XHRjYXNlICcuY3NzJzpcblx0XHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdGNhc2UgJy5zYXNzJzpcblx0XHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRjYXNlICcudHMnOlxuXHRcdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdHR5cGUgPSAnY29kZSc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcuemlwJzpcblx0XHRcdGNhc2UgJy5yYXInOlxuXHRcdFx0Y2FzZSAnLnRhcic6XG5cdFx0XHRjYXNlICcuN3onOlxuXHRcdFx0Y2FzZSAnLmd6Jzpcblx0XHRcdFx0dHlwZSA9ICd6aXAnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRzZXRBY3RpdmVGaWxlKCBmaWxlUHJvcHMgKSB7XG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgJiYgdGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQgPT09IGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggZmlsZVByb3BzLmVsZW1lbnQgKSB7XG5cdFx0XHRmaWxlUHJvcHMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdoYXMtb3B0aW9ucycpO1xuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICk7XG5cdH1cblxuXHRidWlsZFRyZWUoIGZpbGUsIGxldmVsID0gMCApIHtcblx0XHRsZXQgdHlwZSA9IGZpbGUudHlwZTtcblx0XHRsZXQgZXh0ID0gZmlsZS5leHRlbnNpb24gfHwgbnVsbDtcblx0XHRsZXQgY2hpbGRyZW47XG5cblx0XHRpZiAoIGZpbGUudHlwZSA9PT0gJ2RpcmVjdG9yeScgKSB7XG5cdFx0XHRpZiAoIGZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0bGV0IGNoaWxkcmVuSXRlbXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCB2YXIgY2hpbGQgaW4gZmlsZS5jaGlsZHJlbiApIHtcblx0XHRcdFx0XHRjaGlsZHJlbkl0ZW1zLnB1c2goIHRoaXMuYnVpbGRUcmVlKCBmaWxlLmNoaWxkcmVuWyBjaGlsZCBdLCBsZXZlbCArIDEgKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2hpbGRyZW4gPSA8dWwgY2xhc3NOYW1lPSdjaGlsZHJlbicga2V5PXsgZmlsZS5wYXRoICsgJy1jaGlsZHJlbicgfT57IGNoaWxkcmVuSXRlbXMgfTwvdWw+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gPEZpbGVMaXN0RGlyZWN0b3J5XG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0bGV2ZWw9eyBsZXZlbCB9XG5cdFx0XHRcdGNoaWxkcmVuPXsgY2hpbGRyZW4gfVxuXHRcdFx0Lz47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSB0aGlzLmdldE1pbWVUeXBlKCBleHQgKTtcblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdEZpbGVcblx0XHRcdFx0a2V5PXsgZmlsZS5wYXRoIH1cblx0XHRcdFx0ZmlsZT17IGZpbGUgfVxuXHRcdFx0XHR0eXBlPXsgdHlwZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRiYXNlPXsgdGhpcy5wcm9wcy5wYXRoIH1cblx0XHRcdFx0c2V0QWN0aXZlRmlsZT17IHRoaXMuc2V0QWN0aXZlRmlsZSB9XG5cdFx0XHQvPjtcblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5wcm9wcy5sb2FkaW5nICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2xvYWRpbmcnPlxuXHRcdFx0XHRcdDxwPkxvYWRpbmcmaGVsbGlwOzwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5wcm9wcy5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J2VtcHR5Jz5cblx0XHRcdFx0XHQ8cD5ObyBwcm9qZWN0IGZvbGRlciBzZWxlY3RlZC48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMuZmlsZXMgfHwgISBPYmplY3Qua2V5cyggdGhpcy5wcm9wcy5maWxlcyApLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm90aGluZyB0byBzZWUgaGVyZS48L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRsZXQgZmlsZWxpc3QgPSBbXTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbiAmJiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaG93IG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5LlxuXHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuWyBjaGlsZCBdICkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZWxpc3QucHVzaCggdGhpcy5idWlsZFRyZWUoIHRoaXMucHJvcHMuZmlsZXMgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8dWwgaWQ9J2ZpbGVzJz5cblx0XHRcdFx0eyBmaWxlbGlzdCB9XG5cdFx0XHQ8L3VsPlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZUZpbGU6IHN0YXRlLmFjdGl2ZUZpbGVcbn0pO1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoIGRpc3BhdGNoICkgPT4gKHtcblx0c2V0QWN0aXZlRmlsZTogcGF5bG9hZCA9PiBkaXNwYXRjaCggc2V0QWN0aXZlRmlsZSggcGF5bG9hZCApIClcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3QoIG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzICkoIEZpbGVMaXN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZGlyZWN0b3J5IHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlTGlzdERpcmVjdG9yeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRleHBhbmRlZDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGlmICggISB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIGZ1bmN0aW9uKCBwcmV2U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4geyBleHBhbmRlZDogISBwcmV2U3RhdGUuZXhwYW5kZWQgfTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ2RpcmVjdG9yeSc7XG5cblx0XHRpZiAoIHRoaXMuc3RhdGUuZXhwYW5kZWQgKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyBleHBhbmQnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8bGkgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0gb25DbGljaz17IHRoaXMub25DbGljayB9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmlsZW5hbWUnPlxuXHRcdFx0XHRcdHsgU3RyaW5nLmZyb21DaGFyQ29kZSgnMHgyMDAzJykucmVwZWF0KCB0aGlzLnByb3BzLmxldmVsICkgfVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNoaWxkcmVuKCkgfVxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3REaXJlY3Rvcnk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGEgZmlsZSBpbiB0aGUgZmlsZWxpc3QuXG4gKi9cblxuY29uc3QgeyByZW1vdGUsIHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5jb25zdCB7IE1lbnUsIE1lbnVJdGVtIH0gPSByZW1vdGU7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3RGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLm9uQ29udGV4dE1lbnUgPSB0aGlzLm9uQ29udGV4dE1lbnUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoe1xuXHRcdFx0ZmlsZTogdGhpcy5wcm9wcy5maWxlLFxuXHRcdFx0ZWxlbWVudDogZXZlbnQuY3VycmVudFRhcmdldFxuXHRcdH0pO1xuXHR9XG5cblx0b25Db250ZXh0TWVudSggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlUGF0aCA9IHRoaXMucHJvcHMuZmlsZS5wYXRoO1xuXG5cdFx0bGV0IG1lbnUgPSBuZXcgTWVudSgpO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdPcGVuJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwub3Blbkl0ZW0oIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ1Nob3cgaW4gZm9sZGVyJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHsgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlciggZmlsZVBhdGggKSB9XG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdHR5cGU6ICdzZXBhcmF0b3InXG5cdFx0fSkgKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnRGVsZXRlJyxcblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCB3aW5kb3cuY29uZmlybSggYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgJHt0aGlzLnByb3BzLmZpbGUubmFtZX0/YCApICkge1xuXHRcdFx0XHRcdGlmICggc2hlbGwubW92ZUl0ZW1Ub1RyYXNoKCBmaWxlUGF0aCApICkge1xuXHRcdFx0XHRcdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvZmlsZXMnKSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuYWxlcnQoIGBDb3VsZCBub3QgZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9LmAgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSkgKTtcblxuXHRcdG1lbnUucG9wdXAoIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkgKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpXG5cdFx0XHRcdGNsYXNzTmFtZT17IHRoaXMucHJvcHMudHlwZSB9XG5cdFx0XHRcdG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfVxuXHRcdFx0XHRvbkNvbnRleHRNZW51PXsgdGhpcy5vbkNvbnRleHRNZW51IH1cblx0XHRcdD5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2xpPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdEZpbGU7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgcmVuZGVyaW5nIGJ1aWxkIG9wdGlvbnMgZm9yIGEgZmlsZS5cbiAqL1xuXG5jb25zdCB7IHNsYXNoLCBmaWxlUmVsYXRpdmVQYXRoLCBmaWxlQWJzb2x1dGVQYXRoLCBmaWxlT3V0cHV0UGF0aCB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZUNoYW5nZSA9IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0XHR0aGlzLmhhbmRsZUNvbXBpbGUgPSB0aGlzLmhhbmRsZUNvbXBpbGUuYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoIHsgbG9hZGluZzogZmFsc2UgfSApO1xuXHRcdH0uYmluZCggdGhpcyApO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlQ2FsbGJhY2sgPSBudWxsO1xuXHR9XG5cblx0c3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyggbmV4dFByb3BzICkge1xuXHRcdGxldCBjb21waWxlT3B0aW9ucyA9IGdsb2JhbC5jb21waWxlci5nZXRGaWxlT3B0aW9ucyggbmV4dFByb3BzLmZpbGUgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBjb21waWxlT3B0aW9ucy50eXBlLFxuXHRcdFx0ZmlsZVR5cGU6IGNvbXBpbGVPcHRpb25zLmZpbGVUeXBlLFxuXHRcdFx0YnVpbGRUYXNrTmFtZTogY29tcGlsZU9wdGlvbnMuYnVpbGRUYXNrTmFtZSxcblx0XHRcdG9wdGlvbnM6IEZpbGVPcHRpb25zLmdldE9wdGlvbnNGcm9tQ29uZmlnKCBuZXh0UHJvcHMuYmFzZSwgbmV4dFByb3BzLmZpbGUgKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgZ2V0T3B0aW9uc0Zyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0bGV0IGNmaWxlID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKTtcblxuXHRcdHJldHVybiAoIGNmaWxlICYmIGNmaWxlLm9wdGlvbnMgKSA/IGNmaWxlLm9wdGlvbnMgOiB7fTtcblx0fVxuXG5cdHN0YXRpYyBnZXRGaWxlRnJvbUNvbmZpZyggYmFzZSwgZmlsZSApIHtcblx0XHRpZiAoIGZpbGUgJiYgZ2xvYmFsLnByb2plY3RDb25maWcgKSB7XG5cdFx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggYmFzZSwgZmlsZS5wYXRoICkgKTtcblxuXHRcdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdFx0bGV0IGNmaWxlID0gZmlsZXMuZmluZCggY2ZpbGUgPT4gY2ZpbGUucGF0aCA9PT0gZmlsZVBhdGggKTtcblxuXHRcdFx0aWYgKCBjZmlsZSApIHtcblx0XHRcdFx0cmV0dXJuIGNmaWxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Z2V0Q29uZmlnKCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRsZXQgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXRoOiBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMucHJvcHMuZmlsZS5wYXRoICksXG5cdFx0XHRvdXRwdXQ6IHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSxcblx0XHRcdG9wdGlvbnM6IHt9XG5cdFx0fTtcblxuXHRcdGxldCBzdG9yZWQgPSBGaWxlT3B0aW9ucy5nZXRGaWxlRnJvbUNvbmZpZyggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUgKTtcblxuXHRcdGxldCBjb25maWcgPSAoIHN0b3JlZCAhPT0gbnVsbCApID8gc3RvcmVkIDogZGVmYXVsdHM7XG5cblx0XHRpZiAoIHByb3BlcnR5ICkge1xuXHRcdFx0cmV0dXJuICggY29uZmlnWyBwcm9wZXJ0eSBdICkgPyBjb25maWdbIHByb3BlcnR5IF0gOiBkZWZhdWx0VmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0fVxuXHR9XG5cblx0c2V0Q29uZmlnKCBwcm9wZXJ0eSwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnIHx8ICEgcHJvcGVydHkgKSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWd1cmF0aW9uLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgZmlsZVBhdGggPSBzbGFzaCggZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApICk7XG5cblx0XHRsZXQgZmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cdFx0bGV0IGZpbGVJbmRleCA9IGZpbGVzLmZpbmRJbmRleCggZmlsZSA9PiBmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRpZiAoIGZpbGVJbmRleCA9PT0gLTEgKSB7XG5cdFx0XHRsZXQgZmlsZUNvbmZpZyA9IHtcblx0XHRcdFx0cGF0aDogZmlsZVBhdGgsXG5cdFx0XHRcdHR5cGU6IHRoaXMuc3RhdGUuZmlsZVR5cGUsXG5cdFx0XHRcdG91dHB1dDogc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpICkgKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0eXBlb2YoIHZhbHVlICkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICkge1xuXHRcdFx0XHRmaWxlQ29uZmlnWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRmaWxlcy5wdXNoKCBmaWxlQ29uZmlnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0ZmlsZXNbIGZpbGVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcblx0XHRcdFx0ZGVsZXRlIGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZy5zZXQoICdmaWxlcycsIGZpbGVzICk7XG5cdH1cblxuXHRnZXRPcHRpb24oIG9wdGlvbiwgZGVmYXVsdFZhbHVlID0gbnVsbCApIHtcblx0XHRpZiAoIHRoaXMuc3RhdGUub3B0aW9ucyAmJiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUub3B0aW9uc1sgb3B0aW9uIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXG5cdHNldE9wdGlvbiggb3B0aW9uLCB2YWx1ZSApIHtcblx0XHRsZXQgb3B0aW9ucyA9IHRoaXMuc3RhdGUub3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zWyBvcHRpb24gXSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5zZXRDb25maWcoICdvcHRpb25zJywgb3B0aW9ucyApO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IG9wdGlvbnM6IG9wdGlvbnMgfSk7XG5cdH1cblxuXHRoYW5kbGVDaGFuZ2UoIG5hbWUsIHZhbHVlICkge1xuXHRcdGlmICggbmFtZSA9PT0gJ291dHB1dCcgKSB7XG5cdFx0XHR0aGlzLnNldENvbmZpZyggJ291dHB1dCcsIHZhbHVlICk7XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoIHRoaXMuc3RhdGUgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRPcHRpb24oIG5hbWUsIHZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0ZGVmYXVsdE91dHB1dFBhdGgoKSB7XG5cdFx0cmV0dXJuIGZpbGVPdXRwdXRQYXRoKCB0aGlzLnByb3BzLmZpbGUsIHRoaXMub3V0cHV0U3VmZml4LCB0aGlzLm91dHB1dEV4dGVuc2lvbiApO1xuXHR9XG5cblx0Z2V0T3V0cHV0UGF0aCggdHlwZSA9ICdyZWxhdGl2ZScgKSB7XG5cdFx0bGV0IHNsYXNoUGF0aCA9ICggdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aCA9ICggdHlwZSA9PT0gJ3JlbGF0aXZlJyB8fCB0eXBlID09PSAnZGlzcGxheScgKTtcblx0XHRsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCk7XG5cdFx0bGV0IG91dHB1dFBhdGggPSB0aGlzLmdldENvbmZpZyggJ291dHB1dCcsIGRlZmF1bHRQYXRoICk7XG5cblx0XHRpZiAoIHJlbGF0aXZlUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0UGF0aCA9IGZpbGVBYnNvbHV0ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdGlmICggc2xhc2hQYXRoICkge1xuXHRcdFx0b3V0cHV0UGF0aCA9IHNsYXNoKCBvdXRwdXRQYXRoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFBhdGg7XG5cdH1cblxuXHRoYW5kbGVDb21waWxlKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyLnByb2Nlc3NGaWxlKFxuXHRcdFx0dGhpcy5wcm9wcy5iYXNlLFxuXHRcdFx0dGhpcy5nZXRDb25maWcoKSxcblx0XHRcdHRoaXMuc3RhdGUuYnVpbGRUYXNrTmFtZSxcblx0XHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrXG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckhlYWRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG5cdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyRm9vdGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZm9vdGVyJz5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdGNsYXNzTmFtZT0nY29tcGlsZSBncmVlbidcblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5oYW5kbGVDb21waWxlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMuc3RhdGUubG9hZGluZyB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUubG9hZGluZyA/ICdDb21waWxpbmcuLi4nIDogJ0NvbXBpbGUnIH1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBmaWxlIG9wdGlvbnMgZm9yIGEgc2NyaXB0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1NjcmlwdCBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5qcyc7XG5cdFx0dGhpcy5zYXZlRGlhbG9nRmlsdGVycyA9IFtcblx0XHRcdHsgbmFtZTogJ0phdmFTY3JpcHQnLCBleHRlbnNpb25zOiBbICdqcycgXSB9XG5cdFx0XTtcblx0fVxuXG5cdHNvdXJjZU1hcHNEaXNhYmxlZCgpIHtcblx0XHRyZXR1cm4gKCAhIHRoaXMuc3RhdGUub3B0aW9ucyB8fCAoICEgdGhpcy5zdGF0ZS5vcHRpb25zLmJ1bmRsZSAmJiAhIHRoaXMuc3RhdGUub3B0aW9ucy5iYWJlbCApICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc2NyaXB0Jz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0ey8qIDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYnVuZGxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYnVuZGxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz4gKi99XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0JhYmVsJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdiYWJlbCcsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3VnbGlmeSdcblx0XHRcdFx0XHRcdGxhYmVsPSdVZ2xpZnknXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3VnbGlmeScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnNvdXJjZU1hcHNEaXNhYmxlZCgpIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU2NyaXB0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHN0eWxlc2hlZXQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9ucyA9IHJlcXVpcmUoJy4vRmlsZU9wdGlvbnMnKTtcblxuY29uc3QgRmllbGRTd2l0Y2ggPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTd2l0Y2gnKTtcblxuY29uc3QgRmllbGRTZWxlY3QgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTZWxlY3QnKTtcblxuY29uc3QgRmllbGRTYXZlRmlsZSA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFNhdmVGaWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uLy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBGaWxlT3B0aW9uc1N0eWxlcyBleHRlbmRzIEZpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vdXRwdXRTdWZmaXggPSAnLWRpc3QnO1xuXHRcdHRoaXMub3V0cHV0RXh0ZW5zaW9uID0gJy5jc3MnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdDU1MnLCBleHRlbnNpb25zOiBbICdjc3MnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRpc1BhcnRpYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ18nKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoIHRoaXMuaXNQYXJ0aWFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50PlxuXHRcdFx0XHRcdDxwPlRoaXMgaXMgYSBwYXJ0aWFsIGZpbGUsPGJyIC8+IGl0IGNhbm5vdCBiZSBjb21waWxlZCBvbiBpdHMgb3duLjwvcD5cblx0XHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXN0eWxlJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckhlYWRlcigpIH1cblxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm9keSc+XG5cdFx0XHRcdFx0PEZpZWxkU2F2ZUZpbGVcblx0XHRcdFx0XHRcdG5hbWU9J291dHB1dCdcblx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgUGF0aCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE91dHB1dFBhdGgoICdkaXNwbGF5JyApIH1cblx0XHRcdFx0XHRcdHNvdXJjZUZpbGU9eyB0aGlzLnByb3BzLmZpbGUgfVxuXHRcdFx0XHRcdFx0c291cmNlQmFzZT17IHRoaXMucHJvcHMuYmFzZSB9XG5cdFx0XHRcdFx0XHRkaWFsb2dGaWx0ZXJzPXsgdGhpcy5zYXZlRGlhbG9nRmlsdGVycyB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvY29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvIENvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9jb21waWxlJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblxuXHRcdFx0XHRcdDxociAvPlxuXG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLnR5cGUgPT09ICdzYXNzJyAmJlxuXHRcdFx0XHRcdFx0PEZpZWxkU2VsZWN0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J3N0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFN0eWxlJ1xuXHRcdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzdHlsZScsICduZXN0ZWQnICkgfVxuXHRcdFx0XHRcdFx0XHRvcHRpb25zPXsge1xuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZDogJ05lc3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFjdDogJ0NvbXBhY3QnLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiAnRXhwYW5kZWQnLFxuXHRcdFx0XHRcdFx0XHRcdGNvbXByZXNzZWQ6ICdDb21wcmVzc2VkJ1xuXHRcdFx0XHRcdFx0XHR9IH1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3NvdXJjZW1hcHMnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdhdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0b3ByZWZpeGVyJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvcHJlZml4ZXInLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHR7IHRoaXMucmVuZGVyRm9vdGVyKCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zU3R5bGVzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHNob3dpbmcgbm90aWNlcyBhbmQgYWxlcnRzLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgTm90aWNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKCkge1xuXHRcdGxldCB0eXBlID0gdGhpcy5wcm9wcy50eXBlIHx8ICdpbmZvJztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17ICdub3RpY2UgdHlwZS0nICsgdHlwZSB9PlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGljZTtcbiIsIi8qKlxuICogQGZpbGUgUm9vdCByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHsgY29tYmluZVJlZHVjZXJzIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCB2aWV3ID0gKCBjdXJyZW50ID0gJ2ZpbGVzJywgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfVklFVyc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnZpZXc7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBjdXJyZW50O1xuXHR9XG59O1xuXG5jb25zdCB7IHByb2plY3RzLCBhY3RpdmVQcm9qZWN0LCBhY3RpdmVQcm9qZWN0RmlsZXMgfSA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuY29uc3QgYWN0aXZlRmlsZSA9ICggZmlsZSA9IG51bGwsIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnU0VUX0FDVElWRV9GSUxFJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuXHR2aWV3LFxuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzLFxuXHRhY3RpdmVGaWxlXG59KTtcbiIsIi8qKlxuICogQGZpbGUgUHJvamVjdHMgcmVkdWNlci5cbiAqL1xuXG5jb25zdCBwcm9qZWN0cyA9ICggcHJvamVjdHMgPSBbXSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdBRERfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHQuLi5wcm9qZWN0cyxcblx0XHRcdFx0YWN0aW9uLnBheWxvYWRcblx0XHRcdF07XG5cdFx0Y2FzZSAnUkVNT1ZFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIHByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSBhY3Rpb24uaWQgKTtcblx0XHRjYXNlICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBwcm9qZWN0cy5tYXAoIGZ1bmN0aW9uKCBwcm9qZWN0LCBpbmRleCApIHtcblx0XHRcdFx0aWYgKCBpbmRleCA9PT0gcGFyc2VJbnQoIGFjdGlvbi5wYXlsb2FkLmlkLCAxMCApICkge1xuXHRcdFx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9qZWN0cztcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdCA9ICggYWN0aXZlID0ge30sIGFjdGlvbiApID0+IHtcblx0c3dpdGNoICggYWN0aW9uLnR5cGUgKSB7XG5cdFx0Y2FzZSAnQ0hBTkdFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGNhc2UgJ1NFVF9QUk9KRUNUX1NUQVRFJzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdFx0Li4uYWN0aW9uLnBheWxvYWRcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBhY3RpdmU7XG5cdH1cbn07XG5cbmNvbnN0IGFjdGl2ZVByb2plY3RGaWxlcyA9ICggZmlsZXMgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdSRUNFSVZFX0ZJTEVTJzpcblx0XHRcdHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZpbGVzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm9qZWN0cyxcblx0YWN0aXZlUHJvamVjdCxcblx0YWN0aXZlUHJvamVjdEZpbGVzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBMb2dnZXIgdXRpbGl0eS5cbiAqL1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY2xhc3MgTG9nZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5sb2dzID0gW107XG5cdH1cblxuXHRsb2coIHR5cGUsIHRpdGxlLCBib2R5ID0gJycgKSB7XG5cdFx0dGhpcy5sb2dzLnB1c2goe1xuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHR0aW1lOiBtb21lbnQoKS5mb3JtYXQoJ0hIOm1tOnNzLlNTUycpXG5cdFx0fSk7XG5cdFx0LyogZ2xvYmFsIEV2ZW50ICovXG5cdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2xvZ3MnKSApO1xuXHR9XG5cblx0Z2V0KCB0eXBlID0gbnVsbCwgb3JkZXIgPSAnZGVzYycgKSB7XG5cdFx0bGV0IGxvZ3M7XG5cblx0XHRpZiAoICEgdHlwZSApIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ3MgPSB0aGlzLmxvZ3MuZmlsdGVyKCBsb2cgPT4geyByZXR1cm4gbG9nLnR5cGUgPT09IHR5cGUgfSApO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXIgPT09ICdkZXNjJyApIHtcblx0XHRcdGxvZ3MgPSBsb2dzLnNsaWNlKCkucmV2ZXJzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBsb2dzO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiLyoqXG4gKiBAZmlsZSBXYWxrIGEgZGlyZWN0b3J5IGFuZCByZXR1cm4gYW4gb2JqZWN0IG9mIGZpbGVzIGFuZCBzdWJmb2xkZXJzLlxuICovXG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5jb25zdCBmcyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKCByZXF1aXJlKCdmcycpICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gZGlyZWN0b3J5VHJlZSggcGF0aCwgb3B0aW9ucyA9IHt9LCBkZXB0aCA9IDAgKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApIHtcblx0XHQvLyBJZiBtYXggZGVwdGggd2FzIHJlYWNoZWQsIGJhaWwuXG5cdFx0aWYgKCBvcHRpb25zLmRlcHRoICYmIGRlcHRoID4gb3B0aW9ucy5kZXB0aCApIHtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHRjb25zdCBuYW1lID0gZnNwYXRoLmJhc2VuYW1lKCBwYXRoICk7XG5cdFx0Y29uc3QgaXRlbSA9IHsgcGF0aCwgbmFtZSB9O1xuXG5cdFx0bGV0IHN0YXRzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cdFx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCBlcnIgKTtcblx0XHRcdHJlc29sdmUoIG51bGwgKTtcblx0XHR9XG5cblx0XHQvLyBTa2lwIGlmIGl0IG1hdGNoZXMgdGhlIGV4Y2x1ZGUgcmVnZXguXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZSAmJiAoIG9wdGlvbnMuZXhjbHVkZS50ZXN0KCBwYXRoICkgfHwgb3B0aW9ucy5leGNsdWRlLnRlc3QoIG5hbWUgKSApICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGlmICggc3RhdHMuaXNGaWxlKCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZmlsZSc7XG5cblx0XHRcdGNvbnN0IGV4dCA9IGZzcGF0aC5leHRuYW1lKCBwYXRoICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0Ly8gU2tpcCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGUgZXh0ZW5zaW9uIHJlZ2V4LlxuXHRcdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhIG9wdGlvbnMuZXh0ZW5zaW9ucy50ZXN0KCBleHQgKSApIHtcblx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBzdGF0cy5zaXplOyAvLyBGaWxlIHNpemUgaW4gYnl0ZXMuXG5cdFx0XHRpdGVtLmV4dGVuc2lvbiA9IGV4dDtcblxuXHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdH0gZWxzZSBpZiAoIHN0YXRzLmlzRGlyZWN0b3J5KCkgKSB7XG5cdFx0XHRpdGVtLnR5cGUgPSAnZGlyZWN0b3J5JztcblxuXHRcdFx0ZnMucmVhZGRpciggcGF0aCwgZnVuY3Rpb24oIGVyciwgZmlsZXMgKSB7XG5cdFx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRcdGlmICggZXJyLmNvZGUgPT09ICdFQUNDRVMnICkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlciBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb25zLCBpZ25vcmUgZGlyZWN0b3J5LlxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0XHRcdFByb21pc2UubWFwKCBmaWxlcywgZnVuY3Rpb24oIGZpbGUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRpcmVjdG9yeVRyZWUoIGZzcGF0aC5qb2luKCBwYXRoLCBmaWxlICksIG9wdGlvbnMsIGRlcHRoICsgMSApO1xuXHRcdFx0XHR9KS50aGVuKCBmdW5jdGlvbiggY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0aXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlciggKGUpID0+ICEhZSApO1xuXHRcdFx0XHRcdHJlc29sdmUoIGl0ZW0gKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gaXRlbS5zaXplID0gaXRlbS5jaGlsZHJlbi5yZWR1Y2UoICggcHJldiwgY3VyICkgPT4ge1xuXHRcdFx0Ly8gXHRjb25zb2xlLmxvZyggcHJldiwgY3VyLnNpemUgKTtcblx0XHRcdC8vIFx0cmV0dXJuIHByZXYgKyBjdXIuc2l6ZTtcblx0XHRcdC8vIH0sIDAgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApOyAvLyBPciBzZXQgaXRlbS5zaXplID0gMCBmb3IgZGV2aWNlcywgRklGTyBhbmQgc29ja2V0cyA/XG5cdFx0fVxuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcnlUcmVlO1xuIiwiLyoqXG4gKiBAZmlsZSBHbG9iYWwgaGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIGFwcCdzIFVJLlxuICovXG5cbmZ1bmN0aW9uIHVuZm9jdXMoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ3VuZm9jdXMnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZyggdG9nZ2xlID0gdHJ1ZSwgYXJncyA9IHt9ICkge1xuXHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsb2FkaW5nJywgdG9nZ2xlICk7XG59XG5cbmZ1bmN0aW9uIG92ZXJsYXkoIHRvZ2dsZSA9IHRydWUgKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ292ZXJsYXknLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRm9jdXMoIGVsZW1lbnQsIGNsYXNzTmFtZSwgdHJpZ2dlckV2ZW50ID0gbnVsbCwgZXhjbHVkZSA9IG51bGwgKSB7XG5cdGNvbnN0IG91dHNpZGVDbGlja0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggISBlbGVtZW50LmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdHJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKCAhIGV4Y2x1ZGUgfHwgISBleGNsdWRlLmNvbnRhaW5zKCBldmVudC50YXJnZXQgKSApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcblxuXHRcdFx0XHRpZiAoIHRyaWdnZXJFdmVudCApIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCB0cmlnZ2VyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlbW92ZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xuXHR9XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3V0c2lkZUNsaWNrTGlzdGVuZXIgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVuZm9jdXMsXG5cdGxvYWRpbmcsXG5cdG92ZXJsYXksXG5cdHJlbW92ZUZvY3VzXG59O1xuIiwiLyoqXG4gKiBAZmlsZSBIZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZpbmcsIHRyYW5zZm9ybWluZywgZ2VuZXJhdGluZyBhbmQgZm9ybWF0dGluZyBwYXRocy5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3NsYXNoXG5mdW5jdGlvbiBzbGFzaCggaW5wdXQgKSB7XG5cdGNvbnN0IGlzRXh0ZW5kZWRMZW5ndGhQYXRoID0gL15cXFxcXFxcXFxcP1xcXFwvLnRlc3QoaW5wdXQpO1xuXHRjb25zdCBoYXNOb25Bc2NpaSA9IC9bXlxcdTAwMDAtXFx1MDA4MF0rLy50ZXN0KGlucHV0KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb250cm9sLXJlZ2V4XG5cblx0aWYgKGlzRXh0ZW5kZWRMZW5ndGhQYXRoIHx8IGhhc05vbkFzY2lpKSB7XG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuZnVuY3Rpb24gZmlsZU91dHB1dFBhdGgoIGZpbGUsIHN1ZmZpeCA9ICcnLCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbiApIHtcblx0bGV0IGJhc2VkaXIgPSBwYXRoLnBhcnNlKCBmaWxlLnBhdGggKS5kaXI7XG5cdGxldCBmaWxlbmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpICsgc3VmZml4ICsgZXh0ZW5zaW9uO1xuXG5cdHJldHVybiBwYXRoLmpvaW4oIGJhc2VkaXIsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGZpbGVSZWxhdGl2ZVBhdGgoIGZyb20sIHRvICkge1xuXHRyZXR1cm4gcGF0aC5yZWxhdGl2ZSggZnJvbSwgdG8gKTtcbn1cblxuZnVuY3Rpb24gZmlsZUFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiAoIHBhdGguaXNBYnNvbHV0ZSggZmlsZW5hbWUgKSApID8gZmlsZW5hbWUgOiBwYXRoLmpvaW4oIGJhc2UsIGZpbGVuYW1lICk7XG59XG5cbmZ1bmN0aW9uIGRpckFic29sdXRlUGF0aCggYmFzZSwgZmlsZW5hbWUgKSB7XG5cdHJldHVybiBwYXRoLnBhcnNlKCBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApICkuZGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xhc2gsXG5cdGZpbGVPdXRwdXRQYXRoLFxuXHRmaWxlUmVsYXRpdmVQYXRoLFxuXHRmaWxlQWJzb2x1dGVQYXRoLFxuXHRkaXJBYnNvbHV0ZVBhdGhcbn07XG4iLCIvKipcbiAqIEBmaWxlIENvbGxlY3Rpb24gb2YgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDFlNzsgaSsrICkge1xuXHRcdGlmICggKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0ICkgPiBtaWxsaXNlY29uZHMgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRsZXQgc3RhdGUgPSB7XG5cdFx0dmlldzogJ2ZpbGVzJyxcblx0XHRwcm9qZWN0czogW10sXG5cdFx0YWN0aXZlUHJvamVjdDogMCxcblx0XHRhY3RpdmVQcm9qZWN0RmlsZXM6IHt9LFxuXHRcdGFjdGl2ZUZpbGU6IG51bGxcblx0fTtcblxuXHRpZiAoIGdsb2JhbC5jb25maWcuaGFzKCAncHJvamVjdHMnICkgKSB7XG5cdFx0c3RhdGUucHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCggJ3Byb2plY3RzJyApO1xuXHR9XG5cblx0aWYgKCBzdGF0ZS5wcm9qZWN0cy5sZW5ndGggJiYgZ2xvYmFsLmNvbmZpZy5oYXMoICdhY3RpdmUtcHJvamVjdCcgKSApIHtcblx0XHRsZXQgYWN0aXZlSW5kZXggPSBnbG9iYWwuY29uZmlnLmdldCggJ2FjdGl2ZS1wcm9qZWN0JyApO1xuXG5cdFx0aWYgKCBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QgPSBzdGF0ZS5wcm9qZWN0c1sgYWN0aXZlSW5kZXggXTtcblx0XHRcdHN0YXRlLmFjdGl2ZVByb2plY3QuaWQgPSBhY3RpdmVJbmRleDtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RDb25maWcoIHByb3BlcnR5LCB2YWx1ZSApIHtcblx0bGV0IHByb2plY3RzID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ3Byb2plY3RzJyk7XG5cdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCdhY3RpdmUtcHJvamVjdCcpO1xuXG5cdGlmICggQXJyYXkuaXNBcnJheSggcHJvamVjdHMgKSAmJiBwcm9qZWN0c1sgYWN0aXZlSW5kZXggXSApIHtcblx0XHRwcm9qZWN0c1sgYWN0aXZlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlnLicgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlICkge1xuXHRsZXQgZGVwZW5kZW5jaWVzID0gW107XG5cblx0Zm9yICggdmFyIGRlcGVuZGVuY3kgaW4gZGVwZW5kZW5jeVRyZWUgKSB7XG5cdFx0ZGVwZW5kZW5jaWVzLnB1c2goIGRlcGVuZGVuY3kgKTtcblxuXHRcdGlmICggT2JqZWN0LmtleXMoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKS5sZW5ndGggPiAwICkge1xuXHRcdFx0ZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzLmNvbmNhdCggZ2V0RGVwZW5kZW5jeUFycmF5KCBkZXBlbmRlbmN5VHJlZVsgZGVwZW5kZW5jeSBdICkgKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZGVwZW5kZW5jaWVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2xlZXAsXG5cdGdldEluaXRpYWxTdGF0ZSxcblx0c2V0UHJvamVjdENvbmZpZyxcblx0Z2V0RGVwZW5kZW5jeUFycmF5XG59O1xuIl19
