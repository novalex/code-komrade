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

  /**
   * Constrcutor.
   *
   * @param {Object} props
   */
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
  /**
   * Render overlay for logs and settings.
   */


  _createClass(App, [{
    key: "renderOverlay",
    value: function renderOverlay() {
      var show = this.props.view !== 'files';
      global.ui.overlay(show);

      if (!show) {
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
    /**
     * Render.
     */

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

var autoBind = require('auto-bind');

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

  /**
   * Constrcutor.
   *
   * @param {Object} props
   */
  function Projects(props) {
    var _this;

    _classCallCheck(this, Projects);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Projects).call(this, props));
    _this.state = {
      ignored: ['.git', 'node_modules', '.DS_Store', 'code-komrade.json'],
      loading: false
    };
    autoBind(_assertThisInitialized(_this));
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
    }
    /**
     * Add a new project.
     */

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
    }
    /**
     * Change the active project.
     *
     * @param {number} id The ID of the project to switch to.
     * @param {null | Object}
     */

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
    }
    /**
     * Remove the current project.
     */

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
    }
    /**
     * Confirm project removal when clicking remove button.
     *
     * @param {Object} event
     */

  }, {
    key: "removeProjectButton",
    value: function removeProjectButton(event) {
      event.preventDefault();
      var confirmRemove = window.confirm("Are you sure you want to remove \"".concat(this.props.active.name, "\" from your active projects?"));

      if (confirmRemove) {
        this.removeProject();
      }
    }
    /**
     * Change active project's path.
     */

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
    }
    /**
     * Start the background compiler tasks.
     */

  }, {
    key: "initCompiler",
    value: function initCompiler() {
      if (!this.props.active.paused) {
        global.compiler.initProject();
      } else {
        global.compiler.killTasks();
      }
    }
    /**
     * Refresh the project files.
     */

  }, {
    key: "refreshProject",
    value: function refreshProject() {
      this.getFiles(this.props.active.path);
    }
    /**
     * Initialize the project config file.
     * Ands change listeners to trigger compilers when config changes.
     *
     * @param {string} path The project path.
     */

  }, {
    key: "initProjectConfig",
    value: function initProjectConfig(path) {
      // Read or create config file for project.
      var config = new Store({
        name: 'code-komrade',
        cwd: path
      }); // Listen for changes to the project's file options and trigger the compiler init.

      config.onDidChange('files', _debounce(this.initCompiler, 100)); // Assign the config to global scope.

      global.projectConfig = config;
    }
    /**
     * Read the files in the project directory.
     *
     * @param {string} path The project path.
     */

  }, {
    key: "getFiles",
    value: function getFiles(path) {
      this.setState({
        loading: true
      });
      global.ui.loading();
      var ignored = this.state.ignored.slice(0); // Add compiled files to ignore list.

      if (global.projectConfig) {
        var projectFiles = global.projectConfig.get('files');

        if (projectFiles) {
          projectFiles.forEach(function (file) {
            var path = file.output;
            ignored.push(path);
          });
        }
      } // Escape Regex characters.


      ignored.map(function (string) {
        return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      });
      var exclude = new RegExp(ignored.join('|'), 'i');
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
    /**
     * Initialize a project.
     *
     * @param {string} path The project path.
     */

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
          this.initProjectConfig(path); // Change process cwd.

          process.chdir(path);
          this.initCompiler();
        }
      }.bind(this));
      global.logger = new Logger();
    }
    /**
     * Render project select and action buttons.
     */

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
    /**
     * Render notices for project.
     */

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
    /**
     * Render.
     */

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

},{"../../actions":1,"../../utils/Logger":27,"../../utils/directoryTree":28,"../NoContent":6,"../ui/Notice":24,"./Panel":14,"./ProjectSelect":15,"./filelist/FileList":18,"auto-bind":undefined,"electron":undefined,"electron-store":undefined,"fs":undefined,"lodash/debounce":undefined,"path":undefined,"react":undefined,"react-redux":undefined}],17:[function(require,module,exports){
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

  /**
   * Constrcutor.
   *
   * @param {Object} props
   */
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
  /**
   * Returns true if the current file is a partial.
   * Currently, it simply checks if the filename begins with an underscore.
   */


  _createClass(FileOptionsStyles, [{
    key: "isPartial",
    value: function isPartial() {
      return this.props.file.name.startsWith('_');
    }
    /**
     * Render.
     */

  }, {
    key: "render",
    value: function render() {
      if (this.isPartial()) {
        return React.createElement(NoContent, null, React.createElement("p", null, "This is a partial file,", React.createElement("br", null), " it cannot be compiled", React.createElement("br", null), " on its own."));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9hY3Rpb25zL2luZGV4LmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvYXBwLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcGlsZXIvaW50ZXJmYWNlLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcGlsZXIvbWVzc2FnZXMuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL0FwcC5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL05vQ29udGVudC5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL092ZXJsYXkuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9TaWRlYmFyLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvZmllbGRzL0ZpZWxkU2F2ZUZpbGUuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTZWxlY3QuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9maWVsZHMvRmllbGRTd2l0Y2guanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Mb2dzLmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUGFuZWwuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9Qcm9qZWN0U2VsZWN0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvUHJvamVjdHMuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9TZXR0aW5ncy5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVsaXN0L0ZpbGVMaXN0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZWxpc3QvRmlsZUxpc3REaXJlY3RvcnkuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlbGlzdC9GaWxlTGlzdEZpbGUuanN4IiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvY29tcG9uZW50cy9wcm9qZWN0cy9maWxlb3B0aW9ucy9GaWxlT3B0aW9ucy5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3Byb2plY3RzL2ZpbGVvcHRpb25zL0ZpbGVPcHRpb25zU2NyaXB0LmpzeCIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL2NvbXBvbmVudHMvcHJvamVjdHMvZmlsZW9wdGlvbnMvRmlsZU9wdGlvbnNTdHlsZS5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9jb21wb25lbnRzL3VpL05vdGljZS5qc3giLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy9yZWR1Y2Vycy9pbmRleC5qcyIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL3JlZHVjZXJzL3Byb2plY3RzLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvTG9nZ2VyLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvZGlyZWN0b3J5VHJlZS5qcyIsIi9ob21lL2FsZXgvQXBwcy9Db2RlIEtvbXJhZGUvYXBwL2pzL3V0aWxzL2dsb2JhbFVJLmpzIiwiL2hvbWUvYWxleC9BcHBzL0NvZGUgS29tcmFkZS9hcHAvanMvdXRpbHMvcGF0aEhlbHBlcnMuanMiLCIvaG9tZS9hbGV4L0FwcHMvQ29kZSBLb21yYWRlL2FwcC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUlBO0FBRUEsU0FBUyxVQUFULENBQXFCLElBQXJCLEVBQTRCO0FBQzNCLFNBQU87QUFDTixJQUFBLElBQUksRUFBRSxhQURBO0FBRU4sSUFBQSxJQUFJLEVBQUo7QUFGTSxHQUFQO0FBSUEsQyxDQUVEOzs7QUFFQSxTQUFTLFVBQVQsQ0FBcUIsT0FBckIsRUFBK0I7QUFDOUIsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLGFBREE7QUFFTixJQUFBLE9BQU8sRUFBRTtBQUZILEdBQVA7QUFJQTs7QUFFRCxTQUFTLGFBQVQsQ0FBd0IsT0FBeEIsRUFBa0M7QUFDakMsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLGdCQURBO0FBRU4sSUFBQSxPQUFPLEVBQUU7QUFGSCxHQUFQO0FBSUE7O0FBRUQsU0FBUyxhQUFULENBQXdCLEVBQXhCLEVBQTZCO0FBQzVCLFNBQU87QUFDTixJQUFBLElBQUksRUFBRSxnQkFEQTtBQUVOLElBQUEsRUFBRSxFQUFGO0FBRk0sR0FBUDtBQUlBOztBQUVELFNBQVMsb0JBQVQsQ0FBK0IsT0FBL0IsRUFBeUM7QUFDeEMsU0FBTztBQUNOLElBQUEsSUFBSSxFQUFFLHdCQURBO0FBRU4sSUFBQSxP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aEIsQ0FBdkMsQ0FBZjtBQUNBO0FBQ0Q7O0FBRUQsU0FBTyxZQUFQO0FBQ0E7O0FBRUQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFDaEIsRUFBQSxLQUFLLEVBQUwsS0FEZ0I7QUFFaEIsRUFBQSxlQUFlLEVBQWYsZUFGZ0I7QUFHaEIsRUFBQSxnQkFBZ0IsRUFBaEIsZ0JBSGdCO0FBSWhCLEVBQUEsa0JBQWtCLEVBQWxCO0FBSmdCLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAZmlsZSBBY3Rpb25zLlxuICovXG5cbi8vIE1haW4uXG5cbmZ1bmN0aW9uIGNoYW5nZVZpZXcoIHZpZXcgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ0NIQU5HRV9WSUVXJyxcblx0XHR2aWV3XG5cdH07XG59XG5cbi8vIFByb2plY3RzLlxuXG5mdW5jdGlvbiBhZGRQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdBRERfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdDSEFOR0VfUFJPSkVDVCcsXG5cdFx0cGF5bG9hZDogcHJvamVjdFxuXHR9O1xufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9qZWN0KCBpZCApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVNT1ZFX1BST0pFQ1QnLFxuXHRcdGlkXG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hBY3RpdmVQcm9qZWN0KCBwcm9qZWN0ICkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdSRUZSRVNIX0FDVElWRV9QUk9KRUNUJyxcblx0XHRwYXlsb2FkOiBwcm9qZWN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFByb2plY3RTdGF0ZSggc3RhdGUgKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ1NFVF9QUk9KRUNUX1NUQVRFJyxcblx0XHRwYXlsb2FkOiBzdGF0ZVxuXHR9O1xufVxuXG4vLyBGaWxlcy5cblxuZnVuY3Rpb24gcmVjZWl2ZUZpbGVzKCBmaWxlcyApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnUkVDRUlWRV9GSUxFUycsXG5cdFx0cGF5bG9hZDogZmlsZXNcblx0fTtcbn1cblxuZnVuY3Rpb24gc2V0QWN0aXZlRmlsZSggZmlsZSApIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnU0VUX0FDVElWRV9GSUxFJyxcblx0XHRwYXlsb2FkOiBmaWxlXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjaGFuZ2VWaWV3LFxuXHRhZGRQcm9qZWN0LFxuXHRjaGFuZ2VQcm9qZWN0LFxuXHRyZW1vdmVQcm9qZWN0LFxuXHRzZXRQcm9qZWN0U3RhdGUsXG5cdHJlY2VpdmVGaWxlcyxcblx0c2V0QWN0aXZlRmlsZSxcblx0cmVmcmVzaEFjdGl2ZVByb2plY3Rcbn07XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2VsZWN0cm9uLXN0b3JlJyk7XG5cbmdsb2JhbC5jb25maWcgPSBuZXcgU3RvcmUoe1xuXHRuYW1lOiAnY29uZmlnJ1xufSk7XG5cbmdsb2JhbC51aSA9IHJlcXVpcmUoJy4vdXRpbHMvZ2xvYmFsVUknKTtcblxuZ2xvYmFsLmNvbXBpbGVyID0gcmVxdWlyZSgnLi9jb21waWxlci9pbnRlcmZhY2UnKTtcblxuZ2xvYmFsLmNvbXBpbGVyVGFza3MgPSBbXTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG5jb25zdCB7IFByb3ZpZGVyIH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCB7IGNyZWF0ZVN0b3JlIH0gPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5jb25zdCByb290UmVkdWNlciA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxuY29uc3QgeyBnZXRJbml0aWFsU3RhdGUgfSA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbHMnKTtcbmNvbnN0IGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpO1xuXG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKCByb290UmVkdWNlciwgaW5pdGlhbFN0YXRlICk7XG5cbmdsb2JhbC5zdG9yZSA9IHN0b3JlO1xuXG5jb25zdCBBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQXBwJyk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXsgc3RvcmUgfT5cblx0XHQ8QXBwIC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pO1xuXG5jb25zdCB7IHNsZWVwIH0gPSByZXF1aXJlKCcuL3V0aWxzL3V0aWxzJyk7XG5cbi8vIEFwcCBjbG9zZS9yZXN0YXJ0IGV2ZW50cy5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRpZiAoIGdsb2JhbC5jb21waWxlclRhc2tzLmxlbmd0aCA+IDAgKSB7XG5cdFx0Y29uc29sZS5sb2coICdLaWxsaW5nICVkIHJ1bm5pbmcgdGFza3MuLi4nLCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggKTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5raWxsVGFza3MoKTtcblxuXHRcdHNsZWVwKCAzMDAgKTtcblx0fVxufSk7XG4iLCIvKipcbiogQGZpbGUgR3VscCBzY3JpcHRzIGFuZCB0YXNrcy5cbiovXG5cbi8qIGdsb2JhbCBOb3RpZmljYXRpb24gKi9cblxuY29uc3QgeyBhcHAgfSA9IHJlcXVpcmUoICdlbGVjdHJvbicgKS5yZW1vdGU7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xuLy8gY29uc3QgZGVwZW5kZW5jeVRyZWUgPSByZXF1aXJlKCAnZGVwZW5kZW5jeS10cmVlJyApO1xuXG5jb25zdCBzYXNzID0gcmVxdWlyZSggJ25vZGUtc2FzcycgKTtcbmNvbnN0IFdhdGNoU2FzcyA9IHJlcXVpcmUoICdub2RlLXNhc3Mtd2F0Y2hlcicgKTtcbmNvbnN0IGF1dG9wcmVmaXhlciA9IHJlcXVpcmUoICdhdXRvcHJlZml4ZXInICk7XG5jb25zdCBwcmVjc3MgPSByZXF1aXJlKCAncHJlY3NzJyApO1xuY29uc3QgcG9zdGNzcyA9IHJlcXVpcmUoICdwb3N0Y3NzJyApO1xuY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoICd3ZWJwYWNrJyApO1xuY29uc3QgVWdsaWZ5SnNQbHVnaW4gPSByZXF1aXJlKCAndWdsaWZ5anMtd2VicGFjay1wbHVnaW4nICk7XG5jb25zdCBmb3JtYXRNZXNzYWdlcyA9IHJlcXVpcmUoICcuL21lc3NhZ2VzJyApO1xuXG5jb25zdCB7IGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoICcuLi91dGlscy9wYXRoSGVscGVycycgKTtcbi8vIGNvbnN0IHsgZ2V0RGVwZW5kZW5jeUFycmF5IH0gPSByZXF1aXJlKCAnLi4vdXRpbHMvdXRpbHMnICk7XG5cbmZ1bmN0aW9uIGtpbGxUYXNrcygpIHtcblx0aWYgKCBnbG9iYWwuY29tcGlsZXJUYXNrcy5sZW5ndGggPT09IDAgKSB7XG5cdFx0Ly8gTm90aGluZyB0byBraWxsIDooXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCB0YXNrcyA9IGdsb2JhbC5jb21waWxlclRhc2tzO1xuXG5cdGZvciAoIGxldCBpID0gdGFza3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG5cdFx0bGV0IHRhc2sgPSB0YXNrc1sgaSBdO1xuXHRcdGxldCBmaWxlbmFtZTtcblxuXHRcdGlmICggdHlwZW9mIHRhc2suX2V2ZW50cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhc2suX2V2ZW50cy51cGRhdGUgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRmaWxlbmFtZSA9IHRhc2suaW5wdXRQYXRoO1xuXHRcdFx0Ly8gQ2xvc2UgY2hva2lkYXIgd2F0Y2ggcHJvY2Vzc2VzLlxuXHRcdFx0dGFzay5pbnB1dFBhdGhXYXRjaGVyLmNsb3NlKCk7XG5cdFx0XHR0YXNrLnJvb3REaXJXYXRjaGVyLmNsb3NlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVuYW1lID0gdGFzay5jb21waWxlci5vcHRpb25zLmVudHJ5O1xuXHRcdFx0Ly8gQ2xvc2Ugd2VicGFjayB3YXRjaCBwcm9jZXNzLlxuXHRcdFx0dGFzay5jbG9zZSgpO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUud2FybiggYFN0b3BwZWQgd2F0Y2hpbmcgXCIke2ZpbGVuYW1lfVwiLmAgKTtcblxuXHRcdC8vIFJlbW92ZSB0YXNrIGZyb20gYXJyYXkuXG5cdFx0dGFza3Muc3BsaWNlKCBpLCAxICk7XG5cdH1cblxuXHRnbG9iYWwuY29tcGlsZXJUYXNrcyA9IHRhc2tzO1xuXG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpbml0UHJvamVjdCgpIHtcblx0a2lsbFRhc2tzKCk7XG5cblx0aWYgKCAhIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBwcm9qZWN0RmlsZXMgPSBnbG9iYWwucHJvamVjdENvbmZpZy5nZXQoICdmaWxlcycsIFtdICk7XG5cblx0bGV0IHByb2plY3RQYXRoID0gcGF0aC5wYXJzZSggZ2xvYmFsLnByb2plY3RDb25maWcucGF0aCApLmRpcjtcblxuXHRmb3IgKCB2YXIgZmlsZUNvbmZpZyBvZiBwcm9qZWN0RmlsZXMgKSB7XG5cdFx0cHJvY2Vzc0ZpbGUoIHByb2plY3RQYXRoLCBmaWxlQ29uZmlnICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0ZpbGUoIGJhc2UsIGZpbGVDb25maWcsIHRhc2tOYW1lID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgb3B0aW9ucyA9IGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKTtcblxuXHRpZiAoICEgb3B0aW9ucyApIHtcblx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoIHRhc2tOYW1lICkge1xuXHRcdHJ1blRhc2soIHRhc2tOYW1lLCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHR9IGVsc2UgaWYgKCBvcHRpb25zLmF1dG9jb21waWxlICkge1xuXHRcdGlmICggb3B0aW9ucy53YXRjaFRhc2sgKSB7XG5cdFx0XHRvcHRpb25zLmdldEltcG9ydHMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHJ1blRhc2soICd3YXRjaCcsIG9wdGlvbnMgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3B0aW9ucyggZmlsZSApIHtcblx0bGV0IG9wdGlvbnMgPSB7fTtcblxuXHRzd2l0Y2ggKCBmaWxlLmV4dGVuc2lvbiApIHtcblx0XHRjYXNlICcuY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdjc3MnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzdHlsZS0nICsgb3B0aW9ucy50eXBlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdGNhc2UgJy5zY3NzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdzYXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5sZXNzJzpcblx0XHRcdG9wdGlvbnMudHlwZSA9ICdsZXNzJztcblx0XHRcdG9wdGlvbnMuZmlsZVR5cGUgPSAnc3R5bGUtJyArIG9wdGlvbnMudHlwZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJy5qcyc6XG5cdFx0Y2FzZSAnLmpzeCc6XG5cdFx0XHRvcHRpb25zLnR5cGUgPSAnanMnO1xuXHRcdFx0b3B0aW9ucy5maWxlVHlwZSA9ICdzY3JpcHQnO1xuXHR9XG5cblx0b3B0aW9ucy5idWlsZFRhc2tOYW1lID0gJ2J1aWxkLScgKyBvcHRpb25zLnR5cGU7XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb25maWcoIGJhc2UsIGZpbGVDb25maWcgKSB7XG5cdGlmICggISBmaWxlQ29uZmlnLnBhdGggfHwgISBmaWxlQ29uZmlnLm91dHB1dCApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgZmlsZVBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLnBhdGggKTtcblx0bGV0IG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlQ29uZmlnLm91dHB1dCApO1xuXHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnZXRGaWxlT3B0aW9ucyh7IGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKCBmaWxlUGF0aCApIH0pO1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRpbnB1dDogZmlsZVBhdGgsXG5cdFx0ZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoIG91dHB1dFBhdGggKSxcblx0XHRvdXRwdXQ6IHBhdGgucGFyc2UoIG91dHB1dFBhdGggKS5kaXIsXG5cdFx0cHJvamVjdEJhc2U6IGJhc2Vcblx0fTtcblxuXHRpZiAoIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRmb3IgKCB2YXIgb3B0aW9uIGluIGZpbGVDb25maWcub3B0aW9ucyApIHtcblx0XHRcdGlmICggISBmaWxlQ29uZmlnLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoIG9wdGlvbiApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSBmaWxlQ29uZmlnLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdGlmICggZmlsZUNvbmZpZy5vcHRpb25zLmF1dG9jb21waWxlICkge1xuXHRcdFx0b3B0aW9ucy53YXRjaFRhc2sgPSBjb21waWxlT3B0aW9ucy5idWlsZFRhc2tOYW1lO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBydW5UYXNrKCB0YXNrTmFtZSwgb3B0aW9ucyA9IHt9LCBjYWxsYmFjayA9IG51bGwgKSB7XG5cdGNvbnNvbGUuZ3JvdXAoICdSdW5uaW5nIHRhc2snICk7XG5cdGNvbnNvbGUubG9nKCBgUnVubmluZyBcIiR7dGFza05hbWV9XCIgd2l0aCBvcHRpb25zOmAsIG9wdGlvbnMgKTtcblx0Y29uc29sZS5ncm91cEVuZCgpO1xuXG5cdGxldCBpbnB1dEZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGlmICggdGFza05hbWUgPT09ICd3YXRjaCcgKSB7XG5cdFx0aGFuZGxlV2F0Y2hUYXNrKCBvcHRpb25zLCBjYWxsYmFjayApO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEJ1aWxkIHRhc2sgc3RhcnRpbmcuXG5cdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdpbmZvJywgYENvbXBpbGluZyAke2lucHV0RmlsZW5hbWV9Li4uYCApO1xuXG5cdFx0c3dpdGNoICggdGFza05hbWUgKSB7XG5cdFx0XHRjYXNlICdidWlsZC1zYXNzJzpcblx0XHRcdFx0aGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYnVpbGQtY3NzJzpcblx0XHRcdFx0aGFuZGxlQ3NzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdidWlsZC1qcyc6XG5cdFx0XHRcdGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zb2xlLmVycm9yKCBgVW5oYW5kbGVkIHRhc2s6ICR7dGFza05hbWV9YCApO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlU2Fzc0NvbXBpbGUoIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCApIHtcblx0b3B0aW9ucy5vdXRGaWxlID0gcGF0aC5yZXNvbHZlKCBvcHRpb25zLm91dHB1dCwgb3B0aW9ucy5maWxlbmFtZSApO1xuXG5cdHNhc3MucmVuZGVyKCB7XG5cdFx0ZmlsZTogb3B0aW9ucy5pbnB1dCxcblx0XHRvdXRGaWxlOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0b3V0cHV0U3R5bGU6IG9wdGlvbnMuc3R5bGUsXG5cdFx0c291cmNlTWFwOiBvcHRpb25zLnNvdXJjZW1hcHMsXG5cdFx0c291cmNlTWFwRW1iZWQ6IG9wdGlvbnMuc291cmNlbWFwc1xuXHR9LCBmdW5jdGlvbiggZXJyb3IsIHJlc3VsdCApIHtcblx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0Ly8gQ29tcGlsYXRpb24gZXJyb3IocykuXG5cdFx0XHRoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9yICk7XG5cblx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggb3B0aW9ucy5hdXRvcHJlZml4ZXIgKSB7XG5cdFx0XHRcdGxldCBwb3N0Q3NzT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRmcm9tOiBvcHRpb25zLmlucHV0LFxuXHRcdFx0XHRcdHRvOiBvcHRpb25zLm91dEZpbGUsXG5cdFx0XHRcdFx0bWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0XHRcdFx0fTtcblx0XHRcdFx0aGFuZGxlUG9zdENzc0NvbXBpbGUoIG9wdGlvbnMsIHJlc3VsdC5jc3MsIHBvc3RDc3NPcHRpb25zLCBjYWxsYmFjayApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gZXJyb3JzIGR1cmluZyB0aGUgY29tcGlsYXRpb24sIHdyaXRlIHRoaXMgcmVzdWx0IG9uIHRoZSBkaXNrXG5cdFx0XHRcdGZzLndyaXRlRmlsZSggb3B0aW9ucy5vdXRGaWxlLCByZXN1bHQuY3NzLCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ3NzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRvcHRpb25zLm91dEZpbGUgPSBwYXRoLnJlc29sdmUoIG9wdGlvbnMub3V0cHV0LCBvcHRpb25zICk7XG5cblx0bGV0IHBvc3RDc3NPcHRpb25zID0ge1xuXHRcdGZyb206IG9wdGlvbnMuaW5wdXQsXG5cdFx0dG86IG9wdGlvbnMub3V0RmlsZSxcblx0XHRtYXA6IG9wdGlvbnMuc291cmNlbWFwc1xuXHR9O1xuXG5cdGZzLnJlYWRGaWxlKCBvcHRpb25zLmlucHV0LCAoIGVycm9yLCBjc3MgKSA9PiB7XG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBlcnJvciApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQb3N0Q3NzQ29tcGlsZSggb3B0aW9ucywgY3NzLCBwb3N0Q3NzT3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRwb3N0Y3NzKCBbIHByZWNzcywgYXV0b3ByZWZpeGVyKCB7IGJyb3dzZXJzOiBbICdsYXN0IDUgdmVyc2lvbnMnIF0gfSApIF0gKVxuXHRcdC5wcm9jZXNzKCBjc3MsIHBvc3RDc3NPcHRpb25zIClcblx0XHQudGhlbiggcG9zdENzc1Jlc3VsdCA9PiB7XG5cdFx0XHQvLyBObyBlcnJvcnMgZHVyaW5nIHRoZSBjb21waWxhdGlvbiwgd3JpdGUgdGhpcyByZXN1bHQgb24gdGhlIGRpc2tcblx0XHRcdGZzLndyaXRlRmlsZSggb3B0aW9ucy5vdXRGaWxlLCBwb3N0Q3NzUmVzdWx0LmNzcywgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRpZiAoIGVycm9yICkge1xuXHRcdFx0XHRcdC8vIENvbXBpbGF0aW9uIGVycm9yKHMpLlxuXHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgZXJyb3IgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0XHRcdGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9ICk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUpzQ29tcGlsZSggb3B0aW9ucywgY2FsbGJhY2sgPSBudWxsICkge1xuXHRsZXQgbW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoIGFwcC5nZXRBcHBQYXRoKCksICdub2RlX21vZHVsZXMnICk7XG5cdGlmICggISBtb2R1bGVzUGF0aC5tYXRjaCggJ2FwcCcgKSApIHtcblx0XHRtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZSggYXBwLmdldEFwcFBhdGgoKSwgJ2FwcC9ub2RlX21vZHVsZXMnICk7XG5cdH1cblxuXHRsZXQgY29uZmlnID0ge1xuXHRcdG1vZGU6ICdub25lJyxcblx0XHRlbnRyeTogb3B0aW9ucy5pbnB1dCxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0b3V0cHV0OiB7XG5cdFx0XHRwYXRoOiBvcHRpb25zLm91dHB1dCxcblx0XHRcdGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lXG5cdFx0fSxcblx0XHRtb2R1bGU6IHtcblx0XHRcdHJ1bGVzOiBbIHtcblx0XHRcdFx0dGVzdDogL1xcLmpzJC8sXG5cdFx0XHRcdGV4Y2x1ZGU6IC8obm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMpL1xuXHRcdFx0fSBdXG5cdFx0fSxcblx0XHRyZXNvbHZlTG9hZGVyOiB7XG5cdFx0XHRtb2R1bGVzOiBbIG1vZHVsZXNQYXRoIF1cblx0XHR9LFxuXHRcdGRldnRvb2w6ICggb3B0aW9ucy5zb3VyY2VtYXBzICkgPyAnaW5saW5lLXNvdXJjZS1tYXAnIDogZmFsc2UsXG5cdFx0cGx1Z2luczogW1xuXHRcdFx0bmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKCB7XG5cdFx0XHRcdCdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KCAncHJvZHVjdGlvbicgKVxuXHRcdFx0fSApLFxuXHRcdFx0bmV3IHdlYnBhY2sub3B0aW1pemUuTW9kdWxlQ29uY2F0ZW5hdGlvblBsdWdpbigpLFxuXHRcdFx0bmV3IHdlYnBhY2suTm9FbWl0T25FcnJvcnNQbHVnaW4oKVxuXHRcdF1cblx0fTtcblxuXHRpZiAoIG9wdGlvbnMuYmFiZWwgKSB7XG5cdFx0Y29uZmlnLm1vZHVsZS5ydWxlc1sgMCBdLnVzZSA9IHtcblx0XHRcdGxvYWRlcjogJ2JhYmVsLWxvYWRlcicsXG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHByZXNldHM6IFsgcmVxdWlyZSggJ2JhYmVsLXByZXNldC1lbnYnICkgXSxcblx0XHRcdFx0cGx1Z2luczogWyByZXF1aXJlKCAnYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1vYmplY3QtcmVzdC1zcHJlYWQnICkgXVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRpZiAoIG9wdGlvbnMudWdsaWZ5ICkge1xuXHRcdGxldCB1Z2xpZnlPcHRpb25zID0ge1xuXHRcdFx0cGFyYWxsZWw6IGZhbHNlLFxuXHRcdFx0c291cmNlTWFwOiBvcHRpb25zLnNvdXJjZW1hcHNcblx0XHR9O1xuXG5cdFx0Y29uZmlnLnBsdWdpbnMucHVzaCggbmV3IFVnbGlmeUpzUGx1Z2luKCB1Z2xpZnlPcHRpb25zICkgKTtcblx0fVxuXG5cdGNvbnN0IGNvbXBpbGVyID0gd2VicGFjayggY29uZmlnICk7XG5cblx0aWYgKCBvcHRpb25zLmdldEluc3RhbmNlICkge1xuXHRcdHJldHVybiBjb21waWxlcjtcblx0fVxuXG5cdGNvbXBpbGVyLnJ1biggKCBlcnJvciwgc3RhdHMgKSA9PiB7XG5cdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoIGVycm9yICk7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5ncm91cCggJ1dlYnBhY2snICk7XG5cdFx0Y29uc29sZS5sb2coIHN0YXRzICk7XG5cdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXG5cdFx0Y29uc3QgbWVzc2FnZXMgPSBmb3JtYXRNZXNzYWdlcyggc3RhdHMgKTtcblxuXHRcdGlmICggISBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICYmICFtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBzdWNjZXNzZnVsLlxuXHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdGhhbmRsZUNvbXBpbGVFcnJvciggb3B0aW9ucywgbWVzc2FnZXMuZXJyb3JzICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHQvLyBDb21waWxhdGlvbiB3YXJuaW5nKHMpLlxuXHRcdFx0aGFuZGxlQ29tcGlsZVdhcm5pbmdzKCBvcHRpb25zLCBtZXNzYWdlcy53YXJuaW5ncyApO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVdhdGNoVGFzayggb3B0aW9ucyApIHtcblx0aWYgKCBvcHRpb25zLndhdGNoVGFzayA9PT0gJ2J1aWxkLXNhc3MnICkge1xuXHRcdGxldCB3YXRjaGVyT3B0aW9ucyA9IHtcblx0XHRcdHZlcmJvc2l0eTogMVxuXHRcdH07XG5cdFx0bGV0IHdhdGNoZXIgPSBuZXcgV2F0Y2hTYXNzKCBvcHRpb25zLmlucHV0LCB3YXRjaGVyT3B0aW9ucyApO1xuXHRcdC8vIHdhdGNoZXIub24oICdpbml0JywgZnVuY3Rpb24oKSB7IGhhbmRsZVNhc3NDb21waWxlKCBvcHRpb25zICkgfSk7XG5cdFx0d2F0Y2hlci5vbiggJ3VwZGF0ZScsIGZ1bmN0aW9uKCkgeyBoYW5kbGVTYXNzQ29tcGlsZSggb3B0aW9ucyApIH0gKTtcblx0XHR3YXRjaGVyLnJ1bigpO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MucHVzaCggd2F0Y2hlciApO1xuXHR9IGVsc2UgaWYgKCBvcHRpb25zLndhdGNoVGFzayA9PT0gJ2J1aWxkLWpzJyApIHtcblx0XHRjb25zb2xlLndhcm4oIGBTdGFydCB3YXRjaGluZyBcIiR7b3B0aW9ucy5pbnB1dH1cIi4uLmAgKTtcblx0XHRvcHRpb25zLmdldEluc3RhbmNlID0gdHJ1ZTtcblx0XHRsZXQgY29tcGlsZXIgPSBoYW5kbGVKc0NvbXBpbGUoIG9wdGlvbnMgKTtcblx0XHRsZXQgd2F0Y2hlciA9IGNvbXBpbGVyLndhdGNoKHtcblx0XHRcdGFnZ3JlZ2F0ZVRpbWVvdXQ6IDMwMFxuXHRcdH0sICggZXJyb3IsIHN0YXRzICkgPT4ge1xuXHRcdFx0aWYgKCBlcnJvciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyb3IgKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc29sZS5ncm91cCggJ1dlYnBhY2snICk7XG5cdFx0XHRjb25zb2xlLmxvZyggc3RhdHMgKTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblxuXHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBmb3JtYXRNZXNzYWdlcyggc3RhdHMgKTtcblxuXHRcdFx0aWYgKCAhIG1lc3NhZ2VzLmVycm9ycy5sZW5ndGggJiYgIW1lc3NhZ2VzLndhcm5pbmdzLmxlbmd0aCApIHtcblx0XHRcdFx0Ly8gQ29tcGlsYXRpb24gc3VjY2Vzc2Z1bC5cblx0XHRcdFx0aGFuZGxlQ29tcGlsZVN1Y2Nlc3MoIG9wdGlvbnMgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtZXNzYWdlcy5lcnJvcnMubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBDb21waWxhdGlvbiBlcnJvcihzKS5cblx0XHRcdFx0aGFuZGxlQ29tcGlsZUVycm9yKCBvcHRpb25zLCBtZXNzYWdlcy5lcnJvcnMgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtZXNzYWdlcy53YXJuaW5ncy5sZW5ndGggKSB7XG5cdFx0XHRcdC8vIENvbXBpbGF0aW9uIHdhcm5pbmcocykuXG5cdFx0XHRcdGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggb3B0aW9ucywgbWVzc2FnZXMud2FybmluZ3MgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHdhdGNoZXIuaW52YWxpZGF0ZSgpO1xuXG5cdFx0Z2xvYmFsLmNvbXBpbGVyVGFza3MucHVzaCggd2F0Y2hlciApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVTdWNjZXNzKCBvcHRpb25zICkge1xuXHRsZXQgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBvcHRpb25zLmlucHV0ICk7XG5cblx0bGV0IG5vdGlmeVRleHQgPSBgRmluaXNoZWQgY29tcGlsaW5nICR7ZmlsZW5hbWV9LmA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICdzdWNjZXNzJywgbm90aWZ5VGV4dCApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQ29kZSBLb21yYWRlJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c2lsZW50OiB0cnVlXG5cdH0gKTtcblxuXHRyZXR1cm4gbm90aWZ5O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDb21waWxlRXJyb3IoIG9wdGlvbnMsIGVycm9ycyApIHtcblx0Y29uc29sZS5lcnJvciggZXJyb3JzICk7XG5cblx0aWYgKCAhIGVycm9ycy5sZW5ndGggKSB7XG5cdFx0ZXJyb3JzID0gWyBlcnJvcnMgXTtcblx0fVxuXG5cdGxldCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoIG9wdGlvbnMuaW5wdXQgKTtcblxuXHRsZXQgbm90aWZ5VGV4dCA9ICggZXJyb3JzLmxlbmd0aCA+IDEgPyAnRXJyb3JzJyA6ICdFcnJvcicgKSArIGAgd2hlbiBjb21waWxpbmcgJHtmaWxlbmFtZX1gO1xuXG5cdGdsb2JhbC5sb2dnZXIubG9nKCAnZXJyb3InLCBub3RpZnlUZXh0ICsgJzonLCAnPHByZT4nICsgZXJyb3JzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xuXG5cdGxldCBub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKCAnQ29kZSBLb21yYWRlJywge1xuXHRcdGJvZHk6IG5vdGlmeVRleHQsXG5cdFx0c291bmQ6ICdCYXNzbydcblx0fSApO1xuXG5cdHJldHVybiBub3RpZnk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbXBpbGVXYXJuaW5ncyggb3B0aW9ucywgd2FybmluZ3MgKSB7XG5cdGNvbnNvbGUud2Fybiggd2FybmluZ3MgKTtcblxuXHRpZiAoICEgd2FybmluZ3MubGVuZ3RoICkge1xuXHRcdHdhcm5pbmdzID0gWyB3YXJuaW5ncyBdO1xuXHR9XG5cblx0bGV0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZSggb3B0aW9ucy5pbnB1dCApO1xuXG5cdGxldCBub3RpZnlUZXh0ID0gKCB3YXJuaW5ncy5sZW5ndGggPiAxID8gJ1dhcm5pbmdzJyA6ICdXYXJuaW5nJyApICsgYCB3aGVuIGNvbXBpbGluZyAke2ZpbGVuYW1lfWA7XG5cblx0Z2xvYmFsLmxvZ2dlci5sb2coICd3YXJuJywgbm90aWZ5VGV4dCArICc6JywgJzxwcmU+JyArIHdhcm5pbmdzLmpvaW4oICdcXHJcXG4nICkgKyAnPC9wcmU+JyApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdFByb2plY3QsXG5cdHJ1blRhc2ssXG5cdGtpbGxUYXNrcyxcblx0cHJvY2Vzc0ZpbGUsXG5cdGdldEZpbGVDb25maWcsXG5cdGdldEZpbGVPcHRpb25zXG59XG4iLCIvKipcbiAqIFRoaXMgaGFzIGJlZW4gYWRhcHRlZCBmcm9tIGBjcmVhdGUtcmVhY3QtYXBwYCwgYXV0aG9yZWQgYnkgRmFjZWJvb2ssIEluYy5cbiAqIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29raW5jdWJhdG9yL2NyZWF0ZS1yZWFjdC1hcHAvdHJlZS9tYXN0ZXIvcGFja2FnZXMvcmVhY3QtZGV2LXV0aWxzXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBzdHJpcEluZGVudCA9IHJlcXVpcmUoJ3N0cmlwLWluZGVudCcpO1xuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvcGF0aEhlbHBlcnMnKTtcblxuY29uc3QgZXJyb3JMYWJlbCA9ICdTeW50YXggZXJyb3I6JztcbmNvbnN0IGlzTGlrZWx5QVN5bnRheEVycm9yID0gc3RyID0+IHN0ci5pbmNsdWRlcyggZXJyb3JMYWJlbCApO1xuXG5jb25zdCBleHBvcnRSZWdleCA9IC9cXHMqKC4rPylcXHMqKFwiKT9leHBvcnQgJyguKz8pJyB3YXMgbm90IGZvdW5kIGluICcoLis/KScvO1xuY29uc3Qgc3RhY2tSZWdleCA9IC9eXFxzKmF0XFxzKCg/IXdlYnBhY2s6KS4pKjpcXGQrOlxcZCtbXFxzKV0qKFxcbnwkKS9nbTtcbmNvbnN0IGZpbGVBbmRMaW5lUmVnZXggPSAvaW4gKFteKF0qKVxcc1xcKGxpbmVcXHMoXFxkKiksXFxzY29sdW1uXFxzKFxcZCopXFwpLztcblxuZnVuY3Rpb24gZm9ybWF0TWVzc2FnZSggbWVzc2FnZSwgaXNFcnJvciApIHtcblx0bGV0IGxpbmVzID0gbWVzc2FnZS5zcGxpdCggJ1xcbicgKTtcblxuXHRpZiAoIGxpbmVzLmxlbmd0aCA+IDIgJiYgbGluZXNbIDEgXSA9PT0gJycgKSB7XG5cdFx0bGluZXMuc3BsaWNlKCAxLCAxICk7IC8vIFJlbW92ZSBleHRyYSBuZXdsaW5lLlxuXHR9XG5cblx0Ly8gUmVtb3ZlIGxvYWRlciBub3RhdGlvbiBmcm9tIGZpbGVuYW1lczpcblx0Ly8gICBgLi9+L2Nzcy1sb2FkZXIhLi9zcmMvQXBwLmNzc2Agfn4+IGAuL3NyYy9BcHAuY3NzYFxuXHRpZiAoIGxpbmVzWzBdLmxhc3RJbmRleE9mKCAnIScgKSAhPT0gLTEgKSB7XG5cdFx0bGluZXNbMF0gPSBsaW5lc1swXS5zdWJzdHIoIGxpbmVzWyAwIF0ubGFzdEluZGV4T2YoICchJyApICsgMSApO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIHVzZWxlc3MgYGVudHJ5YCBmaWxlbmFtZSBzdGFjayBkZXRhaWxzXG5cdGxpbmVzID0gbGluZXMuZmlsdGVyKCBsaW5lID0+IGxpbmUuaW5kZXhPZiggJyBAICcgKSAhPT0gMCApO1xuXG5cdC8vIDAgfj4gZmlsZW5hbWU7IDEgfj4gbWFpbiBlcnIgbXNnXG5cdGlmICggISBsaW5lc1swXSB8fCAhIGxpbmVzWzFdICkge1xuXHRcdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHZlcmJvc2UgXCJtb2R1bGUgbm90IGZvdW5kXCIgbWVzc2FnZXMgZm9yIGZpbGVzIGFuZCBwYWNrYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIG5vdCBmb3VuZDogJyApICkge1xuXHRcdGxpbmVzID0gW1xuXHRcdFx0bGluZXNbMF0sXG5cdFx0XHRsaW5lc1sxXSAvLyBcIk1vZHVsZSBub3QgZm91bmQ6IFwiIGlzIGVub3VnaCBkZXRhaWxcblx0XHRcdFx0LnJlcGxhY2UoIFwiQ2Fubm90IHJlc29sdmUgJ2ZpbGUnIG9yICdkaXJlY3RvcnknIFwiLCAnJyApXG5cdFx0XHRcdC5yZXBsYWNlKCAnQ2Fubm90IHJlc29sdmUgbW9kdWxlICcsICcnIClcblx0XHRcdFx0LnJlcGxhY2UoICdFcnJvcjogJywgJycgKVxuXHRcdFx0XHQucmVwbGFjZSggJ1tDYXNlU2Vuc2l0aXZlUGF0aHNQbHVnaW5dICcsICcnIClcblx0XHRdO1xuXHR9XG5cblx0Ly8gQ2xlYW5zIHVwIHN5bnRheCBlcnJvciBtZXNzYWdlcy5cblx0aWYgKCBsaW5lc1sxXS5zdGFydHNXaXRoKCAnTW9kdWxlIGJ1aWxkIGZhaWxlZDogJyApICkge1xuXHRcdGxpbmVzWzFdID0gbGluZXNbMV0ucmVwbGFjZSggJ01vZHVsZSBidWlsZCBmYWlsZWQ6IFN5bnRheEVycm9yOicsIGVycm9yTGFiZWwgKTtcblx0fVxuXG5cdGlmICggbGluZXNbMV0ubWF0Y2goIGV4cG9ydFJlZ2V4ICkgKSB7XG5cdFx0bGluZXNbMV0gPSBsaW5lc1sxXS5yZXBsYWNlKCBleHBvcnRSZWdleCwgXCIkMSAnJDQnIGRvZXMgbm90IGNvbnRhaW4gYW4gZXhwb3J0IG5hbWVkICckMycuXCIgKTtcblx0fVxuXG5cdC8vIFJlYXNzZW1ibGUgJiBTdHJpcCBpbnRlcm5hbCB0cmFjaW5nLCBleGNlcHQgYHdlYnBhY2s6YCAtLSAoY3JlYXRlLXJlYWN0LWFwcC9wdWxsLzEwNTApXG5cdHJldHVybiBsaW5lcy5qb2luKCAnXFxuJyApLnJlcGxhY2UoIHN0YWNrUmVnZXgsICcnICkudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVTdGRlcnIoIGRhdGEgKSB7XG5cdGNvbnNvbGUubG9nKCBkYXRhICk7XG5cblx0bGV0IGVyck9iaiA9IHt9O1xuXHRsZXQgc3RhcnRDYXB0dXJlID0gZmFsc2U7XG5cblx0dmFyIGxpbmVzID0gZGF0YS5zcGxpdCggLyhcXHJcXG58W1xcblxcdlxcZlxcclxceDg1XFx1MjAyOFxcdTIwMjldKS8gKTtcblxuXHRmb3IgKCB2YXIgbGluZSBvZiBsaW5lcyApIHtcblx0XHRsZXQgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuXG5cdFx0aWYgKCAhdHJpbW1lZC5sZW5ndGggKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRyaW1tZWQgPT09ICdEZXRhaWxzOicgKSB7XG5cdFx0XHRzdGFydENhcHR1cmUgPSB0cnVlO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGFydENhcHR1cmUgKSB7XG5cdFx0XHRsZXQgZXJyQXJyID0gdHJpbW1lZC5zcGxpdCggLzpcXHMoLispLyApO1xuXHRcdFx0ZXJyT2JqWyBlcnJBcnJbIDAgXSBdID0gZXJyQXJyWyAxIF07XG5cblx0XHRcdGlmICggZXJyQXJyWyAwIF0gPT09ICdmb3JtYXR0ZWQnICkge1xuXHRcdFx0XHRzdGFydENhcHR1cmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0aWYgKCBPYmplY3Qua2V5cyggZXJyT2JqICkubGVuZ3RoICkge1xuXHRcdGNvbnNvbGUuZXJyb3IoIGVyck9iaiApO1xuXG5cdFx0Z2V0RXJyTGluZXMoIGVyck9iai5maWxlLCBlcnJPYmoubGluZSwgZnVuY3Rpb24oIGVyciwgbGluZXMgKSB7XG5cdFx0XHRpZiAoIGVyciApIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHRpdGxlID0gZXJyT2JqLmZvcm1hdHRlZC5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0XHQnPGNvZGU+JyArXG5cdFx0XHRcdCcgaW4gJyArIHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCBwcm9jZXNzLmN3ZCgpLCBlcnJPYmouZmlsZSApICkgK1xuXHRcdFx0XHQnIG9uIGxpbmUgJyArIGVyck9iai5saW5lICtcblx0XHRcdFx0JzwvY29kZT4nO1xuXG5cdFx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0XHRnbG9iYWwubG9nZ2VyLmxvZyggJ2Vycm9yJywgdGl0bGUsIGRldGFpbHMgKTtcblx0XHR9ICk7XG5cdH1cblxuXHQvLyByZXR1cm4gZXJyT2JqO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJMaW5lcyggZmlsZW5hbWUsIGxpbmUsIGNhbGxiYWNrICkge1xuXHRsaW5lID0gTWF0aC5tYXgoIHBhcnNlSW50KCBsaW5lLCAxMCApIC0gMSB8fCAwLCAwICk7XG5cblx0ZnMucmVhZEZpbGUoIGZpbGVuYW1lLCBmdW5jdGlvbiAoIGVyciwgZGF0YSApIHtcblx0XHRpZiAoIGVyciApIHtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cblx0XHR2YXIgbGluZXMgPSBkYXRhLnRvU3RyaW5nKCAndXRmLTgnICkuc3BsaXQoICdcXG4nICk7XG5cblx0XHRpZiAoICtsaW5lID4gbGluZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBsaW5lQXJyID0gW107XG5cdFx0bGV0IF9saW5lQXJyID0gW107XG5cdFx0bGV0IG1pbkxpbmUgPSBNYXRoLm1heCggbGluZSAtIDIsIDAgKTtcblx0XHRsZXQgbWF4TGluZSA9IE1hdGgubWluKCBsaW5lICsgMiwgbGluZXMubGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IG1pbkxpbmU7IGkgPD0gbWF4TGluZTsgaSsrICkge1xuXHRcdFx0X2xpbmVBcnJbIGkgXSA9IGxpbmVzWyBpIF07XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGV4dHJhbmVvdXMgaW5kZW50YXRpb24uXG5cdFx0bGV0IHN0cmlwcGVkTGluZXMgPSBzdHJpcEluZGVudCggX2xpbmVBcnIuam9pbiggJ1xcbicgKSApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0Zm9yICggdmFyIGogPSBtaW5MaW5lOyBqIDw9IG1heExpbmU7IGorKyApIHtcblx0XHRcdGxpbmVBcnIucHVzaChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJsaW5lJyArICggbGluZSA9PT0gaiA/ICcgaGlnaGxpZ2h0JyA6ICcnICkgKyAnXCI+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtbnVtYmVyXCI+JyArICggaiArIDEgKSArICc8L3NwYW4+JyArXG5cdFx0XHRcdCc8c3BhbiBjbGFzcz1cImxpbmUtY29udGVudFwiPicgKyBzdHJpcHBlZExpbmVzWyBqIF0gKyAnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjYWxsYmFjayggbnVsbCwgbGluZUFyci5qb2luKCAnXFxuJyApICk7XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1lc3NhZ2UgKSB7XG5cdGxldCBmaWxlQW5kTGluZSA9IG1lc3NhZ2UubWF0Y2goIGZpbGVBbmRMaW5lUmVnZXggKTtcblxuXHRpZiAoICEgZmlsZUFuZExpbmUgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGZpbGUgPSBmaWxlQW5kTGluZVsgMSBdO1xuXHRsZXQgbGluZSA9IGZpbGVBbmRMaW5lWyAyIF07XG5cblx0Y29uc29sZS5sb2coIGZpbGVBbmRMaW5lICk7XG5cblx0Z2V0RXJyTGluZXMoIGZpbGUsIGxpbmUsIGZ1bmN0aW9uKCBlcnIsIGxpbmVzICkge1xuXHRcdGlmICggZXJyICkge1xuXHRcdFx0Y29uc29sZS5lcnJvciggZXJyICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHRpdGxlID0gbWVzc2FnZS5yZXBsYWNlKCAvXFwuJC8sICcnICkgK1xuXHRcdFx0Jzxjb2RlPicgK1xuXHRcdFx0JyBpbiAnICsgc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHByb2Nlc3MuY3dkKCksIGZpbGUgKSApICtcblx0XHRcdCcgb24gbGluZSAnICsgbGluZSArXG5cdFx0XHQnPC9jb2RlPic7XG5cblx0XHRsZXQgZGV0YWlscyA9ICc8cHJlPicgKyBsaW5lcyArICc8L3ByZT4nO1xuXG5cdFx0Z2xvYmFsLmxvZ2dlci5sb2coICdlcnJvcicsIHRpdGxlLCBkZXRhaWxzICk7XG5cdH0gKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggc3RhdHMgKSB7XG5cdGNvbnN0IGpzb24gPSBzdGF0cy50b0pzb24oIHt9LCB0cnVlICk7XG5cblx0anNvbi5lcnJvcnMubWFwKCBtc2cgPT4gaGFuZGxlRmlsZUFuZExpbmVFcnJvcnMoIG1zZyApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdGVycm9yczoganNvbi5lcnJvcnMubWFwKCBtc2cgPT4gZm9ybWF0TWVzc2FnZSggbXNnLCB0cnVlICkgKSxcblx0XHR3YXJuaW5nczoganNvbi53YXJuaW5ncy5tYXAoIG1zZyA9PiBmb3JtYXRNZXNzYWdlKCBtc2csIGZhbHNlICkgKVxuXHR9O1xuXG5cdC8vIE9ubHkgc2hvdyBzeW50YXggZXJyb3JzIGlmIHdlIGhhdmUgdGhlbVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMuc29tZSggaXNMaWtlbHlBU3ludGF4RXJyb3IgKSApIHtcblx0XHRyZXN1bHQuZXJyb3JzID0gcmVzdWx0LmVycm9ycy5maWx0ZXIoIGlzTGlrZWx5QVN5bnRheEVycm9yICk7XG5cdH1cblxuXHQvLyBGaXJzdCBlcnJvciBpcyB1c3VhbGx5IGl0OyBvdGhlcnMgdXN1YWxseSB0aGUgc2FtZVxuXHRpZiAoIHJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMSApIHtcblx0XHRyZXN1bHQuZXJyb3JzLmxlbmd0aCA9IDE7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0TWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2U7XG4iLCIvKipcbiAqIEBmaWxlIE1haW4gYXBwIGNvbXBvbmVudC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSggJ3JlYWN0LXJlZHV4JyApO1xuXG5jb25zdCBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XG5cbmNvbnN0IFNpZGViYXIgPSByZXF1aXJlKCcuL1NpZGViYXInKTtcblxuY29uc3QgTG9ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvTG9ncycpO1xuXG5jb25zdCBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vcHJvamVjdHMvU2V0dGluZ3MnKTtcblxuY29uc3QgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzL1Byb2plY3RzJyk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cblx0LyoqXG5cdCAqIENvbnN0cmN1dG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcblx0ICovXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMudmlld3MgPSB7XG5cdFx0XHRmaWxlczogJ0ZpbGVzJyxcblx0XHRcdGxvZ3M6ICdMb2dzJyxcblx0XHRcdHNldHRpbmdzOiAnU2V0dGluZ3MnXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgb3ZlcmxheSBmb3IgbG9ncyBhbmQgc2V0dGluZ3MuXG5cdCAqL1xuXHRyZW5kZXJPdmVybGF5KCkge1xuXHRcdGNvbnN0IHNob3cgPSB0aGlzLnByb3BzLnZpZXcgIT09ICdmaWxlcyc7XG5cblx0XHRnbG9iYWwudWkub3ZlcmxheSggc2hvdyApO1xuXG5cdFx0aWYgKCAhIHNob3cgKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBjb250ZW50O1xuXG5cdFx0XHRpZiAoIHRoaXMucHJvcHMudmlldyA9PT0gJ2xvZ3MnICkge1xuXHRcdFx0XHRjb250ZW50ID0gPExvZ3MgLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50ID0gPFNldHRpbmdzIC8+O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8T3ZlcmxheSBoYXNDbG9zZT17IGZhbHNlIH0+XG5cdFx0XHRcdFx0eyBjb250ZW50IH1cblx0XHRcdFx0PC9PdmVybGF5PlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVyLlxuXHQgKi9cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdhcHAnPlxuXHRcdFx0XHQ8U2lkZWJhciBpdGVtcz17IHRoaXMudmlld3MgfSAvPlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQtd3JhcCc+XG5cdFx0XHRcdFx0PFByb2plY3RzIC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJPdmVybGF5KCkgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKHtcblx0dmlldzogc3RhdGUudmlldyxcblx0cHJvamVjdHM6IHN0YXRlLnByb2plY3RzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggQXBwICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZW1wdHkgc2NyZWVuL25vIGNvbnRlbnQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9wcyApIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17ICduby1jb250ZW50JyArICggcHJvcHMuY2xhc3NOYW1lID8gJyAnICsgcHJvcHMuY2xhc3NOYW1lIDogJycgKSB9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2lubmVyJz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhbiBvdmVybGF5LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdC8vIGNvbnN0cnVjdG9yKCkge31cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J292ZXJsYXknPlxuXHRcdFx0XHR7IHRoaXMucHJvcHMuaGFzQ2xvc2UgJiZcblx0XHRcdFx0XHQ8YSBocmVmPScjJyBpZD0nY2xvc2Utb3ZlcmxheSc+JnRpbWVzOzwvYT5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdDxkaXYgaWQ9J292ZXJsYXktY29udGVudCc+XG5cdFx0XHRcdFx0eyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5O1xuIiwiLyoqXG4gKiBAZmlsZSBBcHAgc2lkZWJhci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IHsgY2hhbmdlVmlldyB9ID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNsYXNzIFNpZGViYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLm9uQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucGVyc2lzdCgpO1xuXG5cdFx0bGV0IHZpZXcgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudmlldztcblxuXHRcdHRoaXMucHJvcHMuY2hhbmdlVmlldyggdmlldyApO1xuXHR9XG5cblx0cmVuZGVySXRlbXMoKSB7XG5cdFx0bGV0IGl0ZW1zID0gW107XG5cblx0XHRmb3IgKCB2YXIgaWQgaW4gdGhpcy5wcm9wcy5pdGVtcyApIHtcblx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdDxsaVxuXHRcdFx0XHRcdGtleT17IGlkIH1cblx0XHRcdFx0XHRkYXRhLXZpZXc9eyBpZCB9XG5cdFx0XHRcdFx0ZGF0YS10aXA9eyB0aGlzLnByb3BzLml0ZW1zWyBpZCBdIH1cblx0XHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLmFjdGl2ZSA9PT0gaWQgPyAnYWN0aXZlJyA6ICcnIH1cblx0XHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0naWNvbicgLz5cblx0XHRcdFx0PC9saT5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxuYXYgaWQ9J3NpZGViYXInPlxuXHRcdFx0XHQ8dWwgaWQ9J21lbnUnPlxuXHRcdFx0XHRcdHsgdGhpcy5yZW5kZXJJdGVtcygpIH1cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvbmF2PlxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKCBzdGF0ZSApID0+ICh7XG5cdGFjdGl2ZTogc3RhdGUudmlld1xufSk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoe1xuXHRjaGFuZ2VWaWV3OiB2aWV3ID0+IGRpc3BhdGNoKCBjaGFuZ2VWaWV3KCB2aWV3ICkgKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggU2lkZWJhciApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHdyYXBwaW5nIGEgZmllbGQuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBGaWVsZCggcHJvcHMgKSB7XG5cdGxldCBjbGFzc05hbWUgPSAnZmllbGQgZmllbGQtJyArIHByb3BzLnR5cGUgKyAnIGxhYmVsLScgKyAoIHByb3BzLmxhYmVsUG9zID8gcHJvcHMubGFiZWxQb3MgOiAndG9wJyApO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfT5cblx0XHRcdHsgcHJvcHMubGFiZWwgJiZcblx0XHRcdFx0PHN0cm9uZyBjbGFzc05hbWU9J2ZpZWxkLWxhYmVsJz57IHByb3BzLmxhYmVsIH08L3N0cm9uZz5cblx0XHRcdH1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZC1jb250Jz5cblx0XHRcdFx0eyBwcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIHNhdmUgZmlsZSBmaWVsZC5cbiAqL1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGU7XG5cbmNvbnN0IHsgc2xhc2gsIGZpbGVSZWxhdGl2ZVBhdGgsIGZpbGVBYnNvbHV0ZVBhdGggfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5jb25zdCBGaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxuY2xhc3MgRmllbGRTYXZlRmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRvbkNsaWNrKCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGxldCBmaWxlU2F2ZU9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5kaWFsb2dUaXRsZSApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy50aXRsZSA9IHRoaXMucHJvcHMuZGlhbG9nVGl0bGU7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy5zb3VyY2VGaWxlICkge1xuXHRcdFx0ZmlsZVNhdmVPcHRpb25zLmRlZmF1bHRQYXRoID0gdGhpcy5wcm9wcy5zb3VyY2VGaWxlLnBhdGg7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnNvdXJjZUJhc2UgKSB7XG5cdFx0XHRmaWxlU2F2ZU9wdGlvbnMuZGVmYXVsdFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIHRoaXMucHJvcHMudmFsdWUgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZGlhbG9nRmlsdGVycyApIHtcblx0XHRcdGZpbGVTYXZlT3B0aW9ucy5maWx0ZXJzID0gdGhpcy5wcm9wcy5kaWFsb2dGaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZyggZmlsZVNhdmVPcHRpb25zICk7XG5cblx0XHRpZiAoIGZpbGVuYW1lICkge1xuXHRcdFx0bGV0IHNhdmVQYXRoID0gc2xhc2goIGZpbGVuYW1lICk7XG5cblx0XHRcdGlmICggdGhpcy5wcm9wcy5zb3VyY2VCYXNlICkge1xuXHRcdFx0XHRzYXZlUGF0aCA9IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLnNvdXJjZUJhc2UsIGZpbGVuYW1lICkgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCB0aGlzLnByb3BzLm5hbWUsIHNhdmVQYXRoICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc2F2ZS1maWxlJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0naGlkZGVuJ1xuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0cmVhZE9ubHlcblx0XHRcdFx0Lz5cblx0XHRcdFx0PHNtYWxsIG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT57IHRoaXMucHJvcHMudmFsdWUgfTwvc21hbGw+XG5cdFx0XHQ8L0ZpZWxkPlxuXHRcdCk7XG5cdH1cbn1cblxuRmllbGRTYXZlRmlsZS5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHNvdXJjZUZpbGU6IFByb3BUeXBlcy5vYmplY3QsXG5cdGRpYWxvZ1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRkaWFsb2dGaWx0ZXJzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFsgUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMub2JqZWN0IF0pLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTYXZlRmlsZTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBhIGRyb3Bkb3duIHNlbGVjdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU2VsZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgZXZlbnQudGFyZ2V0LnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3B0aW9ucygpIHtcblx0XHRsZXQgb3B0aW9ucyA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IHZhbHVlIGluIHRoaXMucHJvcHMub3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMucHVzaChcblx0XHRcdFx0PG9wdGlvbiBrZXk9eyB2YWx1ZSB9IHZhbHVlPXsgdmFsdWUgfT5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMub3B0aW9uc1sgdmFsdWUgXSB9XG5cdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEZpZWxkIHR5cGU9J3NlbGVjdCcgbGFiZWw9eyB0aGlzLnByb3BzLmxhYmVsIH0gbGFiZWxQb3M9eyB0aGlzLnByb3BzLmxhYmVsUG9zIH0+XG5cdFx0XHRcdDxsYWJlbFxuXHRcdFx0XHRcdGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLm9wdGlvbnNbIHRoaXMucHJvcHMudmFsdWUgXSA6ICcnIH1cblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PHNlbGVjdFxuXHRcdFx0XHRcdG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5vbkNoYW5nZSB9XG5cdFx0XHRcdFx0dmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIH1cblx0XHRcdFx0XHRkaXNhYmxlZD17IHRoaXMucHJvcHMuZGlzYWJsZWQgfVxuXHRcdFx0XHRcdGlkPXsgJ2ZpZWxkXycgKyB0aGlzLnByb3BzLm5hbWUgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLmdldE9wdGlvbnMoKSB9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9GaWVsZD5cblx0XHQpO1xuXHR9XG59XG5cbkZpZWxkU2VsZWN0LnByb3BUeXBlcyA9IHtcblx0bmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRsYWJlbFBvczogUHJvcFR5cGVzLnN0cmluZyxcblx0b25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHR2YWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbIFByb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXIgXSksXG5cdG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0ZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkU2VsZWN0O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGEgdG9nZ2xlIHN3aXRjaC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuY29uc3QgRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbmNsYXNzIEZpZWxkU3dpdGNoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCggdGhpcyApO1xuXHR9XG5cblx0b25DaGFuZ2UoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnBlcnNpc3QoKTtcblxuXHRcdGlmICggdGhpcy5wcm9wcy5vbkNoYW5nZSApIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoIHRoaXMucHJvcHMubmFtZSwgISB0aGlzLnByb3BzLnZhbHVlICk7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8RmllbGQgdHlwZT0nc3dpdGNoJyBsYWJlbD17IHRoaXMucHJvcHMubGFiZWwgfSBsYWJlbFBvcz17IHRoaXMucHJvcHMubGFiZWxQb3MgfT5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT0nY2hlY2tib3gnXG5cdFx0XHRcdFx0bmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cblx0XHRcdFx0XHRjaGVja2VkPXsgdGhpcy5wcm9wcy52YWx1ZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnByb3BzLmRpc2FibGVkIH1cblx0XHRcdFx0XHRpZD17ICdmaWVsZF8nICsgdGhpcy5wcm9wcy5uYW1lIH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eyAnZmllbGRfJyArIHRoaXMucHJvcHMubmFtZSB9PnsgdGhpcy5wcm9wcy5sYWJlbCB9PC9sYWJlbD5cblx0XHRcdDwvRmllbGQ+XG5cdFx0KTtcblx0fVxufVxuXG5GaWVsZFN3aXRjaC5wcm9wVHlwZXMgPSB7XG5cdG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0bGFiZWxQb3M6IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblx0dmFsdWU6IFByb3BUeXBlcy5ib29sLFxuXHRkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2xcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTd2l0Y2g7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgZGlzcGxheWluZyBsb2dzIGFuZCBpbmZvcm1hdGlvbi5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBMb2dzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0bGV0IHR5cGUgPSBudWxsO1xuXHRcdGxldCBsb2dzID0gKCBnbG9iYWwubG9nZ2VyICkgPyBnbG9iYWwubG9nZ2VyLmdldCggdHlwZSApIDogW107XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdGxvZ3Ncblx0XHR9O1xuXG5cdFx0dGhpcy5yZWZyZXNoID0gdGhpcy5yZWZyZXNoLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdiZC9yZWZyZXNoL2xvZ3MnLCB0aGlzLnJlZnJlc2ggKTtcblx0fVxuXG5cdHJlZnJlc2goKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGxvZ3M6IGdsb2JhbC5sb2dnZXIuZ2V0KCB0aGlzLnN0YXRlLnR5cGUgKSB9KTtcblx0fVxuXG5cdHJlbmRlckNoaWxkcmVuKCkge1xuXHRcdGxldCBsb2dJbmRleCA9IDA7XG5cdFx0bGV0IGxvZ0xpc3QgPSBbXTtcblxuXHRcdGZvciAoIHZhciBsb2cgb2YgdGhpcy5zdGF0ZS5sb2dzICkge1xuXHRcdFx0bGV0IHRpdGxlSFRNTCA9IHsgX19odG1sOiBsb2cudGl0bGUgfTtcblx0XHRcdGxldCBib2R5SFRNTCA9ICggbG9nLmJvZHkgKSA/IHsgX19odG1sOiBsb2cuYm9keSB9IDogbnVsbDtcblxuXHRcdFx0bG9nTGlzdC5wdXNoKFxuXHRcdFx0XHQ8bGlcblx0XHRcdFx0XHRrZXk9eyBsb2dJbmRleCB9XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXsgJ3R5cGUtJyArIGxvZy50eXBlIH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0XHQ8c21hbGw+eyBsb2cudGltZSB9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUtdGV4dCcgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyB0aXRsZUhUTUwgfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHsgYm9keUhUTUwgJiZcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXRhaWxzJyBkYW5nZXJvdXNseVNldElubmVySFRNTD17IGJvZHlIVE1MIH0gLz5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdDwvbGk+XG5cdFx0XHQpO1xuXHRcdFx0bG9nSW5kZXgrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gPHVsPnsgbG9nTGlzdCB9PC91bD47XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKCAhIHRoaXMuc3RhdGUubG9ncy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4gZW1wdHknPlxuXHRcdFx0XHRcdDxoMT5ObyBsb2dzIHlldC48L2gxPlxuXHRcdFx0XHRcdDxoMj5HbyBmb3J0aCBhbmQgY29tcGlsZSE8L2gyPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2xvZ3MnIGNsYXNzTmFtZT0nbG9ncy1zY3JlZW4nPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVyQ2hpbGRyZW4oKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9ncztcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdHMgcGFuZWwuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCB7IGNvbm5lY3QgfSA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zU2NyaXB0ID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1NjcmlwdCcpO1xuXG5jb25zdCBGaWxlT3B0aW9uc1N0eWxlID0gcmVxdWlyZSgnLi9maWxlb3B0aW9ucy9GaWxlT3B0aW9uc1N0eWxlJyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGdldE9wdGlvbnMoKSB7XG5cdFx0aWYgKCAhIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlLmV4dGVuc2lvbiApIHtcblx0XHRcdGNhc2UgJy5jc3MnOlxuXHRcdFx0Y2FzZSAnLnNjc3MnOlxuXHRcdFx0Y2FzZSAnLnNhc3MnOlxuXHRcdFx0Y2FzZSAnLmxlc3MnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU3R5bGUgYmFzZT17IHRoaXMucHJvcHMucHJvamVjdC5wYXRoIH0gZmlsZT17IHRoaXMucHJvcHMuYWN0aXZlRmlsZS5maWxlIH0gLz47XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0XHRyZXR1cm4gPEZpbGVPcHRpb25zU2NyaXB0IGJhc2U9eyB0aGlzLnByb3BzLnByb2plY3QucGF0aCB9IGZpbGU9eyB0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZmlsZSB9IC8+O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyQ29udGVudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlRmlsZSApIHtcblx0XHRcdGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5hY3RpdmVGaWxlLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGFzLW9wdGlvbnMnKTtcblxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudD5cblx0XHRcdFx0PHA+U2VsZWN0IGEgc3R5bGVzaGVldCBvciBzY3JpcHQgZmlsZSB0byB2aWV3IGNvbXBpbGluZyBvcHRpb25zLjwvcD5cblx0XHRcdDwvTm9Db250ZW50PlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3BhbmVsJz5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlLFxuXHRwcm9qZWN0OiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG51bGwgKSggUGFuZWwgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciB0aGUgcHJvamVjdCBzZWxlY3Rvci5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoICdyZWFjdCcgKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCAncmVhY3QtcmVkdXgnICk7XG5cbmNvbnN0IGF1dG9CaW5kID0gcmVxdWlyZSggJ2F1dG8tYmluZCcgKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0U3RhdGUsIHJlZnJlc2hBY3RpdmVQcm9qZWN0IH0gPSByZXF1aXJlKCAnLi4vLi4vYWN0aW9ucycgKTtcblxuY29uc3QgeyBzZXRQcm9qZWN0Q29uZmlnIH0gPSByZXF1aXJlKCAnLi4vLi4vdXRpbHMvdXRpbHMnICk7XG5cbmNsYXNzIFByb2plY3RTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG5cdC8qKlxuXHQgKiBDb25zdHJjdXRvci5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH07XG5cblx0XHRhdXRvQmluZCggdGhpcyApO1xuXHR9XG5cblx0dG9nZ2xlU2VsZWN0KCkge1xuXHRcdGdsb2JhbC51aS51bmZvY3VzKCAhdGhpcy5zdGF0ZS5pc09wZW4gKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoIHsgaXNPcGVuOiAhdGhpcy5zdGF0ZS5pc09wZW4gfSApO1xuXHR9XG5cblx0dG9nZ2xlUHJvamVjdCgpIHtcblx0XHRsZXQgcGF1c2VkID0gIXRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCB8fCBmYWxzZTtcblxuXHRcdHRoaXMucHJvcHMuc2V0UHJvamVjdFN0YXRlKCB7IHBhdXNlZDogcGF1c2VkIH0gKTtcblxuXHRcdHRoaXMucHJvcHMucmVmcmVzaEFjdGl2ZVByb2plY3QoIHtcblx0XHRcdC4uLnRoaXMucHJvcHMuYWN0aXZlLFxuXHRcdFx0cGF1c2VkOiBwYXVzZWRcblx0XHR9ICk7XG5cblx0XHRzZXRQcm9qZWN0Q29uZmlnKCAncGF1c2VkJywgcGF1c2VkICk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0KCBldmVudCApIHtcblx0XHRldmVudC5wZXJzaXN0KCk7XG5cdFx0bGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnByb2plY3Q7XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCgpO1xuXG5cdFx0aWYgKCBpbmRleCA9PT0gJ25ldycgKSB7XG5cdFx0XHR0aGlzLnByb3BzLm5ld1Byb2plY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5jaGFuZ2VQcm9qZWN0KCBpbmRleCApO1xuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRjb25zdCBzZWxlY3REcm9wZG93biA9IChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3Qtc2VsZWN0LWRyb3Bkb3duJyBjbGFzc05hbWU9e3RoaXMuc3RhdGUuaXNPcGVuID8gJ29wZW4nIDogJyd9PlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5wcm9qZWN0cy5tYXAoICggcHJvamVjdCwgaW5kZXggKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdDxkaXYga2V5PXtpbmRleH0gZGF0YS1wcm9qZWN0PXtpbmRleH0gb25DbGljaz17dGhpcy5zZWxlY3RQcm9qZWN0fT5cblx0XHRcdFx0XHRcdFx0e3Byb2plY3QubmFtZX1cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gKX1cblxuXHRcdFx0XHQ8ZGl2IGtleT0nbmV3JyBkYXRhLXByb2plY3Q9J25ldycgb25DbGljaz17dGhpcy5zZWxlY3RQcm9qZWN0fT5cblx0XHRcdFx0XHQrIEFkZCBuZXcgcHJvamVjdFxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRpZiAoICF0aGlzLnByb3BzLmFjdGl2ZS5uYW1lIHx8ICF0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxkaXYgaWQ9J3Byb2plY3QtYWN0aXZlJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVNlbGVjdH0+XG5cdFx0XHRcdFx0XHQ8aDE+Tm8gUHJvamVjdCBTZWxlY3RlZDwvaDE+XG5cdFx0XHRcdFx0XHQ8aDI+Q2xpY2sgaGVyZSB0byBzZWxlY3Qgb25lLi4uPC9oMj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7c2VsZWN0RHJvcGRvd259XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBpZD0ncHJvamVjdC1zZWxlY3QnIGNsYXNzTmFtZT0nc2VsZWN0ZWQnPlxuXHRcdFx0XHQ8ZGl2IGlkPSdwcm9qZWN0LWFjdGl2ZScgb25DbGljaz17dGhpcy50b2dnbGVTZWxlY3R9PlxuXHRcdFx0XHRcdDxoMT57dGhpcy5wcm9wcy5hY3RpdmUubmFtZX08L2gxPlxuXHRcdFx0XHRcdDxoMj57dGhpcy5wcm9wcy5hY3RpdmUucGF0aH08L2gyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBpZD0ncHJvamVjdC1hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9eyd0b2dnbGUnICsgKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWQgPyAnIHBhdXNlZCcgOiAnIGFjdGl2ZScgKX0gb25DbGljaz17dGhpcy50b2dnbGVQcm9qZWN0fSAvPlxuXHRcdFx0XHRcdDxhIGhyZWY9JyMnIGNsYXNzTmFtZT0ncmVmcmVzaCcgb25DbGljaz17dGhpcy5wcm9wcy5yZWZyZXNoUHJvamVjdH0gLz5cblx0XHRcdFx0XHQ8YSBocmVmPScjJyBjbGFzc05hbWU9J3JlbW92ZScgb25DbGljaz17dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0fSAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0e3NlbGVjdERyb3Bkb3dufVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKCB7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0XG59ICk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoIHtcblx0c2V0UHJvamVjdFN0YXRlOiBzdGF0ZSA9PiBkaXNwYXRjaCggc2V0UHJvamVjdFN0YXRlKCBzdGF0ZSApICksXG5cdHJlZnJlc2hBY3RpdmVQcm9qZWN0OiBwcm9qZWN0ID0+IGRpc3BhdGNoKCByZWZyZXNoQWN0aXZlUHJvamVjdCggcHJvamVjdCApIClcbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBQcm9qZWN0U2VsZWN0ICk7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3IgdGhlIHByb2plY3RzIHZpZXcuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbmNvbnN0IGZzcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xuXG5jb25zdCBfZGVib3VuY2UgPSByZXF1aXJlKCAnbG9kYXNoL2RlYm91bmNlJyApO1xuXG5jb25zdCB7IGRpYWxvZyB9ID0gcmVxdWlyZSggJ2VsZWN0cm9uJyApLnJlbW90ZTtcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCAncmVhY3QnICk7XG5cbmNvbnN0IHsgY29ubmVjdCB9ID0gcmVxdWlyZSggJ3JlYWN0LXJlZHV4JyApO1xuXG5jb25zdCBhdXRvQmluZCA9IHJlcXVpcmUoICdhdXRvLWJpbmQnICk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSggJ2VsZWN0cm9uLXN0b3JlJyApO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCAnLi4vTm9Db250ZW50JyApO1xuXG5jb25zdCBOb3RpY2UgPSByZXF1aXJlKCAnLi4vdWkvTm90aWNlJyApO1xuXG5jb25zdCBQcm9qZWN0U2VsZWN0ID0gcmVxdWlyZSggJy4vUHJvamVjdFNlbGVjdCcgKTtcblxuY29uc3QgRmlsZUxpc3QgPSByZXF1aXJlKCAnLi9maWxlbGlzdC9GaWxlTGlzdCcgKTtcblxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCAnLi9QYW5lbCcgKTtcblxuY29uc3QgZGlyZWN0b3J5VHJlZSA9IHJlcXVpcmUoICcuLi8uLi91dGlscy9kaXJlY3RvcnlUcmVlJyApO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCAnLi4vLi4vdXRpbHMvTG9nZ2VyJyApO1xuXG5jb25zdCB7IGFkZFByb2plY3QsIHJlbW92ZVByb2plY3QsIGNoYW5nZVByb2plY3QsIHJlY2VpdmVGaWxlcywgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSggJy4uLy4uL2FjdGlvbnMnICk7XG5cbmNsYXNzIFByb2plY3RzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuXHQvKipcblx0ICogQ29uc3RyY3V0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuXHQgKi9cblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdGlnbm9yZWQ6IFtcblx0XHRcdFx0Jy5naXQnLFxuXHRcdFx0XHQnbm9kZV9tb2R1bGVzJyxcblx0XHRcdFx0Jy5EU19TdG9yZScsXG5cdFx0XHRcdCdjb2RlLWtvbXJhZGUuanNvbidcblx0XHRcdF0sXG5cdFx0XHRsb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHRhdXRvQmluZCggdGhpcyApO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2JkL3JlZnJlc2gvZmlsZXMnLCB0aGlzLnJlZnJlc2hQcm9qZWN0ICk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHR0aGlzLmluaXRQcm9qZWN0KCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCBwcmV2UHJvcHMsIHByZXZTdGF0ZSApIHtcblx0XHRpZiAoXG5cdFx0XHRwcmV2UHJvcHMuYWN0aXZlLnBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlLnBhdGggJiZcblx0XHRcdHByZXZQcm9wcy5hY3RpdmUucGF1c2VkICE9PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXVzZWRcblx0XHQpIHtcblx0XHRcdC8vIFByb2plY3Qgd2FzIHBhdXNlZC91bnBhdXNlZCwgdHJpZ2dlciBjb21waWxlciB0YXNrcyBvciB0ZXJtaW5hdGUgdGhlbS5cblx0XHRcdHRoaXMuaW5pdENvbXBpbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIG5ldyBwcm9qZWN0LlxuXHQgKi9cblx0bmV3UHJvamVjdCgpIHtcblx0XHRkaWFsb2cuc2hvd09wZW5EaWFsb2coXG5cdFx0XHRnbG9iYWwubWFpbldpbmRvdyxcblx0XHRcdHtcblx0XHRcdFx0cHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5J11cblx0XHRcdH0sXG5cdFx0XHQoIHBhdGggKSA9PiB7XG5cdFx0XHRcdGlmICggcGF0aCApIHtcblx0XHRcdFx0XHRsZXQgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0XHRcdG5hbWU6IGZzcGF0aC5iYXNlbmFtZSggcGF0aFswXSApLFxuXHRcdFx0XHRcdFx0cGF0aDogcGF0aFswXSxcblx0XHRcdFx0XHRcdHBhdXNlZDogZmFsc2Vcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGxldCBuZXdQcm9qZWN0SW5kZXggPSB0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aDtcblxuXHRcdFx0XHRcdGlmICggdGhpcy5wcm9wcy5wcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSBuZXdQcm9qZWN0LnBhdGggKSAhPT0gLTEgKSB7XG5cdFx0XHRcdFx0XHQvLyBQcm9qZWN0IGFscmVhZHkgZXhpc3RzLlxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFNhdmUgbmV3IHByb2plY3QgdG8gY29uZmlnLlxuXHRcdFx0XHRcdGdsb2JhbC5jb25maWcuc2V0KCAncHJvamVjdHMnLCBbXG5cdFx0XHRcdFx0XHQuLi50aGlzLnByb3BzLnByb2plY3RzLFxuXHRcdFx0XHRcdFx0bmV3UHJvamVjdFxuXHRcdFx0XHRcdF0gKTtcblxuXHRcdFx0XHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHRcdFx0XHR0aGlzLnByb3BzLmFkZFByb2plY3QoIG5ld1Byb2plY3QgKTtcblxuXHRcdFx0XHRcdC8vIFNldCBuZXcgcHJvamVjdCBhcyBhY3RpdmUuXG5cdFx0XHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBuZXdQcm9qZWN0SW5kZXgsIG5ld1Byb2plY3QgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlIHRoZSBhY3RpdmUgcHJvamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGlkIFRoZSBJRCBvZiB0aGUgcHJvamVjdCB0byBzd2l0Y2ggdG8uXG5cdCAqIEBwYXJhbSB7bnVsbCB8IE9iamVjdH1cblx0ICovXG5cdGNoYW5nZVByb2plY3QoIGlkLCBwcm9qZWN0ID0gbnVsbCApIHtcblx0XHRpZiAoIGlkID09PSB0aGlzLnByb3BzLmFjdGl2ZS5pZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgYWN0aXZlID0ge1xuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRwYXRoOiAnJyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdH07XG5cblx0XHRpZiAoIHByb2plY3QgKSB7XG5cdFx0XHRhY3RpdmUgPSBwcm9qZWN0O1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMucHJvcHMucHJvamVjdHNbaWRdICkge1xuXHRcdFx0YWN0aXZlID0gdGhpcy5wcm9wcy5wcm9qZWN0c1tpZF07XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGNvbmZpZy5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ2FjdGl2ZS1wcm9qZWN0JywgaWQgKTtcblxuXHRcdC8vIFVwZGF0ZSBzdGF0ZS5cblx0XHR0aGlzLnByb3BzLmNoYW5nZVByb2plY3QoIHtcblx0XHRcdC4uLmFjdGl2ZSxcblx0XHRcdGlkXG5cdFx0fSApO1xuXHRcdHRoaXMucHJvcHMuc2V0QWN0aXZlRmlsZSggbnVsbCApO1xuXG5cdFx0Ly8gSW5pdC5cblx0XHR0aGlzLmluaXRQcm9qZWN0KCBhY3RpdmUucGF0aCApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSB0aGUgY3VycmVudCBwcm9qZWN0LlxuXHQgKi9cblx0cmVtb3ZlUHJvamVjdCgpIHtcblx0XHRsZXQgcmVtb3ZlSW5kZXggPSBwYXJzZUludCggdGhpcy5wcm9wcy5hY3RpdmUuaWQsIDEwICk7XG5cblx0XHRsZXQgcHJvamVjdHMgPSB0aGlzLnByb3BzLnByb2plY3RzLmZpbHRlciggKCBwcm9qZWN0LCBpbmRleCApID0+IGluZGV4ICE9PSByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gUmVtb3ZlIHByb2plY3QgZnJvbSBjb25maWcuXG5cdFx0Z2xvYmFsLmNvbmZpZy5zZXQoICdwcm9qZWN0cycsIHByb2plY3RzICk7XG5cblx0XHQvLyBVcGRhdGUgc3RhdGUuXG5cdFx0dGhpcy5wcm9wcy5yZW1vdmVQcm9qZWN0KCByZW1vdmVJbmRleCApO1xuXG5cdFx0Ly8gVW5zZXQgYWN0aXZlIHByb2plY3QuXG5cdFx0dGhpcy5jaGFuZ2VQcm9qZWN0KCBudWxsICk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uZmlybSBwcm9qZWN0IHJlbW92YWwgd2hlbiBjbGlja2luZyByZW1vdmUgYnV0dG9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHJlbW92ZVByb2plY3RCdXR0b24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY29uZmlybVJlbW92ZSA9IHdpbmRvdy5jb25maXJtKCBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSBcIiR7dGhpcy5wcm9wcy5hY3RpdmUubmFtZX1cIiBmcm9tIHlvdXIgYWN0aXZlIHByb2plY3RzP2AgKTtcblxuXHRcdGlmICggY29uZmlybVJlbW92ZSApIHtcblx0XHRcdHRoaXMucmVtb3ZlUHJvamVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgYWN0aXZlIHByb2plY3QncyBwYXRoLlxuXHQgKi9cblx0Y2hhbmdlUHJvamVjdFBhdGgoKSB7XG5cdFx0bGV0IHBhdGggPSBkaWFsb2cuc2hvd09wZW5EaWFsb2coIHtcblx0XHRcdHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeSddXG5cdFx0fSApO1xuXG5cdFx0aWYgKCBwYXRoICkge1xuXHRcdFx0bGV0IHByb2plY3RzID0gdGhpcy5wcm9wcy5wcm9qZWN0cztcblx0XHRcdGxldCBwcm9qZWN0SW5kZXggPSBwcm9qZWN0cy5maW5kSW5kZXgoIHByb2plY3QgPT4gcHJvamVjdC5wYXRoID09PSB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cblx0XHRcdGlmICggcHJvamVjdEluZGV4ID09PSAtMSApIHtcblx0XHRcdFx0Ly8gUHJvamVjdCBub3QgZm91bmQuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cHJvamVjdHNbcHJvamVjdEluZGV4XS5wYXRoID0gcGF0aFswXTtcblxuXHRcdFx0Ly8gU2F2ZSBuZXcgcHJvamVjdCB0byBjb25maWcuXG5cdFx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBwcm9qZWN0IGFzIGFjdGl2ZS5cblx0XHRcdHRoaXMuY2hhbmdlUHJvamVjdCggcHJvamVjdEluZGV4ICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0IHRoZSBiYWNrZ3JvdW5kIGNvbXBpbGVyIHRhc2tzLlxuXHQgKi9cblx0aW5pdENvbXBpbGVyKCkge1xuXHRcdGlmICggIXRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdGdsb2JhbC5jb21waWxlci5pbml0UHJvamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdGhlIHByb2plY3QgZmlsZXMuXG5cdCAqL1xuXHRyZWZyZXNoUHJvamVjdCgpIHtcblx0XHR0aGlzLmdldEZpbGVzKCB0aGlzLnByb3BzLmFjdGl2ZS5wYXRoICk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgcHJvamVjdCBjb25maWcgZmlsZS5cblx0ICogQW5kcyBjaGFuZ2UgbGlzdGVuZXJzIHRvIHRyaWdnZXIgY29tcGlsZXJzIHdoZW4gY29uZmlnIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwcm9qZWN0IHBhdGguXG5cdCAqL1xuXHRpbml0UHJvamVjdENvbmZpZyggcGF0aCApIHtcblx0XHQvLyBSZWFkIG9yIGNyZWF0ZSBjb25maWcgZmlsZSBmb3IgcHJvamVjdC5cblx0XHRjb25zdCBjb25maWcgPSBuZXcgU3RvcmUoIHtcblx0XHRcdG5hbWU6ICdjb2RlLWtvbXJhZGUnLFxuXHRcdFx0Y3dkOiBwYXRoXG5cdFx0fSApO1xuXG5cdFx0Ly8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBwcm9qZWN0J3MgZmlsZSBvcHRpb25zIGFuZCB0cmlnZ2VyIHRoZSBjb21waWxlciBpbml0LlxuXHRcdGNvbmZpZy5vbkRpZENoYW5nZSggJ2ZpbGVzJywgX2RlYm91bmNlKCB0aGlzLmluaXRDb21waWxlciwgMTAwICkgKTtcblxuXHRcdC8vIEFzc2lnbiB0aGUgY29uZmlnIHRvIGdsb2JhbCBzY29wZS5cblx0XHRnbG9iYWwucHJvamVjdENvbmZpZyA9IGNvbmZpZztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkIHRoZSBmaWxlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwcm9qZWN0IHBhdGguXG5cdCAqL1xuXHRnZXRGaWxlcyggcGF0aCApIHtcblx0XHR0aGlzLnNldFN0YXRlKCB7IGxvYWRpbmc6IHRydWUgfSApO1xuXG5cdFx0Z2xvYmFsLnVpLmxvYWRpbmcoKTtcblxuXHRcdGxldCBpZ25vcmVkID0gdGhpcy5zdGF0ZS5pZ25vcmVkLnNsaWNlKCAwICk7XG5cblx0XHQvLyBBZGQgY29tcGlsZWQgZmlsZXMgdG8gaWdub3JlIGxpc3QuXG5cdFx0aWYgKCBnbG9iYWwucHJvamVjdENvbmZpZyApIHtcblx0XHRcdGNvbnN0IHByb2plY3RGaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJyApO1xuXG5cdFx0XHRpZiAoIHByb2plY3RGaWxlcyApIHtcblx0XHRcdFx0cHJvamVjdEZpbGVzLmZvckVhY2goIGZpbGUgPT4ge1xuXHRcdFx0XHRcdGxldCBwYXRoID0gZmlsZS5vdXRwdXQ7XG5cblx0XHRcdFx0XHRpZ25vcmVkLnB1c2goIHBhdGggKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEVzY2FwZSBSZWdleCBjaGFyYWN0ZXJzLlxuXHRcdGlnbm9yZWQubWFwKCBmdW5jdGlvbiggc3RyaW5nICkge1xuXHRcdFx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKCAvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnICk7XG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgZXhjbHVkZSA9IG5ldyBSZWdFeHAoIGlnbm9yZWQuam9pbiggJ3wnICksICdpJyApO1xuXG5cdFx0ZGlyZWN0b3J5VHJlZSggcGF0aCwge1xuXHRcdFx0Ly8gZGVwdGg6IDIsXG5cdFx0XHRleGNsdWRlXG5cdFx0fSApLnRoZW4oIGZ1bmN0aW9uKCBmaWxlcyApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoIHtcblx0XHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRnbG9iYWwuc3RvcmUuZGlzcGF0Y2goIHJlY2VpdmVGaWxlcyggZmlsZXMgKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRnbG9iYWwudWkubG9hZGluZyggZmFsc2UgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgYSBwcm9qZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcHJvamVjdCBwYXRoLlxuXHQgKi9cblx0aW5pdFByb2plY3QoIHBhdGggKSB7XG5cdFx0ZnMuYWNjZXNzKCBwYXRoLCBmcy5jb25zdGFudHMuV19PSywgZnVuY3Rpb24oIGVyciApIHtcblx0XHRcdGlmICggZXJyICkge1xuXHRcdFx0XHRpZiAoIHBhdGggKSB7XG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGRpcmVjdG9yeSBub3QgcmVhZGFibGUuXG5cdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICd3YXJuaW5nJyxcblx0XHRcdFx0XHRcdHRpdGxlOiAnUHJvamVjdCBkaXJlY3RvcnkgbWlzc2luZycsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBgQ291bGQgbm90IHJlYWQgdGhlICR7cGF0aH0gZGlyZWN0b3J5LiBJdCBtYXkgaGF2ZSBiZWVuIG1vdmVkIG9yIHJlbmFtZWQuYCxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFsnQ2hhbmdlIERpcmVjdG9yeScsICdSZW1vdmUgUHJvamVjdCddXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGRpYWxvZy5zaG93TWVzc2FnZUJveCggb3B0aW9ucywgZnVuY3Rpb24oIGluZGV4ICkge1xuXHRcdFx0XHRcdFx0aWYgKCBpbmRleCA9PT0gMCApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5jaGFuZ2VQcm9qZWN0UGF0aCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICggaW5kZXggPT09IDEgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlUHJvamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gTm8gcHJvamVjdCBwYXRoIHByb3ZpZGVkLlxuXHRcdFx0XHRcdGdsb2JhbC5wcm9qZWN0Q29uZmlnID0gbnVsbDtcblxuXHRcdFx0XHRcdGdsb2JhbC5zdG9yZS5kaXNwYXRjaCggcmVjZWl2ZUZpbGVzKCB7fSApICk7XG5cblx0XHRcdFx0XHRnbG9iYWwuY29tcGlsZXIua2lsbFRhc2tzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERpcmVjdG9yeSBpcyByZWFkYWJsZSwgZ2V0IGZpbGVzIGFuZCBzZXR1cCBjb25maWcuXG5cdFx0XHRcdHRoaXMuZ2V0RmlsZXMoIHBhdGggKTtcblxuXHRcdFx0XHR0aGlzLmluaXRQcm9qZWN0Q29uZmlnKCBwYXRoICk7XG5cblx0XHRcdFx0Ly8gQ2hhbmdlIHByb2Nlc3MgY3dkLlxuXHRcdFx0XHRwcm9jZXNzLmNoZGlyKCBwYXRoICk7XG5cblx0XHRcdFx0dGhpcy5pbml0Q29tcGlsZXIoKTtcblx0XHRcdH1cblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0Z2xvYmFsLmxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgcHJvamVjdCBzZWxlY3QgYW5kIGFjdGlvbiBidXR0b25zLlxuXHQgKi9cblx0cmVuZGVyUHJvamVjdFNlbGVjdCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFByb2plY3RTZWxlY3Rcblx0XHRcdFx0bmV3UHJvamVjdD17dGhpcy5uZXdQcm9qZWN0fVxuXHRcdFx0XHRjaGFuZ2VQcm9qZWN0PXt0aGlzLmNoYW5nZVByb2plY3R9XG5cdFx0XHRcdHJlbW92ZVByb2plY3Q9e3RoaXMucmVtb3ZlUHJvamVjdEJ1dHRvbn1cblx0XHRcdFx0cmVmcmVzaFByb2plY3Q9e3RoaXMucmVmcmVzaFByb2plY3R9XG5cdFx0XHQvPlxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVyIG5vdGljZXMgZm9yIHByb2plY3QuXG5cdCAqL1xuXHRyZW5kZXJOb3RpY2VzKCkge1xuXHRcdGxldCBub3RpY2VzID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuYWN0aXZlLnBhdXNlZCApIHtcblx0XHRcdG5vdGljZXMucHVzaCggKFxuXHRcdFx0XHQ8Tm90aWNlIGtleT0ncGF1c2VkJyB0eXBlPSd3YXJuaW5nJz5cblx0XHRcdFx0XHQ8cD5Qcm9qZWN0IGlzIHBhdXNlZC4gRmlsZXMgd2lsbCBub3QgYmUgd2F0Y2hlZCBhbmQgYXV0byBjb21waWxlZC48L3A+XG5cdFx0XHRcdDwvTm90aWNlPlxuXHRcdFx0KSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBub3RpY2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlci5cblx0ICovXG5cdHJlbmRlcigpIHtcblx0XHRpZiAoICF0aGlzLnByb3BzLnByb2plY3RzIHx8IHRoaXMucHJvcHMucHJvamVjdHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0Ly8gTm8gcHJvamVjdHMgeWV0LCBzaG93IHdlbGNvbWUgc2NyZWVuLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3dlbGNvbWUtc2NyZWVuJz5cblx0XHRcdFx0XHQ8aDE+WW91IGRvbid0IGhhdmUgYW55IHByb2plY3RzIHlldC48L2gxPlxuXHRcdFx0XHRcdDxoMj5Xb3VsZCB5b3UgbGlrZSB0byBhZGQgb25lIG5vdz88L2gyPlxuXHRcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPSdsYXJnZSBmbGF0IGFkZC1uZXctcHJvamVjdCcgb25DbGljaz17dGhpcy5uZXdQcm9qZWN0fT5BZGQgUHJvamVjdDwvYnV0dG9uPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggIXRoaXMucHJvcHMuYWN0aXZlLm5hbWUgfHwgIXRoaXMucHJvcHMuYWN0aXZlLnBhdGggKSB7XG5cdFx0XHQvLyBObyBwcm9qZWN0IHNlbGVjdGVkLCBzaG93IHNlbGVjdG9yLlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3Byb2plY3Qtc2VsZWN0LXNjcmVlbic+XG5cdFx0XHRcdFx0e3RoaXMucmVuZGVyUHJvamVjdFNlbGVjdCgpfVxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J3Byb2plY3RzJz5cblx0XHRcdFx0PGRpdiBpZD0naGVhZGVyJz5cblx0XHRcdFx0XHR7dGhpcy5yZW5kZXJQcm9qZWN0U2VsZWN0KCl9XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxkaXYgaWQ9J2NvbnRlbnQnPlxuXHRcdFx0XHRcdHt0aGlzLnJlbmRlck5vdGljZXMoKX1cblxuXHRcdFx0XHRcdDxGaWxlTGlzdFxuXHRcdFx0XHRcdFx0cGF0aD17dGhpcy5wcm9wcy5hY3RpdmUucGF0aH1cblx0XHRcdFx0XHRcdGZpbGVzPXt0aGlzLnByb3BzLmZpbGVzfVxuXHRcdFx0XHRcdFx0bG9hZGluZz17dGhpcy5zdGF0ZS5sb2FkaW5nfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdDxQYW5lbCAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoIHN0YXRlICkgPT4gKCB7XG5cdHByb2plY3RzOiBzdGF0ZS5wcm9qZWN0cyxcblx0YWN0aXZlOiBzdGF0ZS5hY3RpdmVQcm9qZWN0LFxuXHRmaWxlczogc3RhdGUuYWN0aXZlUHJvamVjdEZpbGVzXG59ICk7XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9ICggZGlzcGF0Y2ggKSA9PiAoIHtcblx0YWRkUHJvamVjdDogcHJvamVjdCA9PiBkaXNwYXRjaCggYWRkUHJvamVjdCggcHJvamVjdCApICksXG5cdGNoYW5nZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCBjaGFuZ2VQcm9qZWN0KCBpZCApICksXG5cdHJlbW92ZVByb2plY3Q6IGlkID0+IGRpc3BhdGNoKCByZW1vdmVQcm9qZWN0KCBpZCApICksXG5cdHNldEFjdGl2ZUZpbGU6IGZpbGUgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIGZpbGUgKSApXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdCggbWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMgKSggUHJvamVjdHMgKTtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHRoZSBzZXR0aW5ncy5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vQ29udGVudCA9IHJlcXVpcmUoJy4uL05vQ29udGVudCcpO1xuXG5jbGFzcyBTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE5vQ29udGVudCBjbGFzc05hbWU9J3NldHRpbmdzLXNjcmVlbic+XG5cdFx0XHRcdDxoMT5TZXR0aW5nczwvaDE+XG5cdFx0XHRcdDxoMj5Db21pbmcgc29vbiE8L2gyPlxuXHRcdFx0PC9Ob0NvbnRlbnQ+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgeyBjb25uZWN0IH0gPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG5jb25zdCBGaWxlTGlzdEZpbGUgPSByZXF1aXJlKCcuL0ZpbGVMaXN0RmlsZScpO1xuXG5jb25zdCBGaWxlTGlzdERpcmVjdG9yeSA9IHJlcXVpcmUoJy4vRmlsZUxpc3REaXJlY3RvcnknKTtcblxuY29uc3QgTm9Db250ZW50ID0gcmVxdWlyZSgnLi4vLi4vTm9Db250ZW50Jyk7XG5cbmNvbnN0IHsgc2V0QWN0aXZlRmlsZSB9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYWN0aW9ucycpO1xuXG5jbGFzcyBGaWxlTGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMuc2V0QWN0aXZlRmlsZSA9IHRoaXMuc2V0QWN0aXZlRmlsZS5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRnZXRNaW1lVHlwZSggZXh0ICkge1xuXHRcdGxldCB0eXBlO1xuXG5cdFx0c3dpdGNoICggZXh0ICkge1xuXHRcdFx0Y2FzZSAnLnN2Zyc6XG5cdFx0XHRjYXNlICcucG5nJzpcblx0XHRcdGNhc2UgJy5qcGcnOlxuXHRcdFx0XHR0eXBlID0gJ21lZGlhJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy5waHAnOlxuXHRcdFx0Y2FzZSAnLmh0bWwnOlxuXHRcdFx0Y2FzZSAnLmNzcyc6XG5cdFx0XHRjYXNlICcuc2Nzcyc6XG5cdFx0XHRjYXNlICcuc2Fzcyc6XG5cdFx0XHRjYXNlICcubGVzcyc6XG5cdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0Y2FzZSAnLnRzJzpcblx0XHRcdGNhc2UgJy5qc3gnOlxuXHRcdFx0Y2FzZSAnLmpzb24nOlxuXHRcdFx0XHR0eXBlID0gJ2NvZGUnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnLnppcCc6XG5cdFx0XHRjYXNlICcucmFyJzpcblx0XHRcdGNhc2UgJy50YXInOlxuXHRcdFx0Y2FzZSAnLjd6Jzpcblx0XHRcdGNhc2UgJy5neic6XG5cdFx0XHRcdHR5cGUgPSAnemlwJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSAndGV4dCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0c2V0QWN0aXZlRmlsZSggZmlsZVByb3BzICkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5hY3RpdmVGaWxlICYmIHRoaXMucHJvcHMuYWN0aXZlRmlsZS5lbGVtZW50ID09PSBmaWxlUHJvcHMuZWxlbWVudCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGZpbGVQcm9wcy5lbGVtZW50ICkge1xuXHRcdFx0ZmlsZVByb3BzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmFjdGl2ZUZpbGUgKSB7XG5cdFx0XHR0aGlzLnByb3BzLmFjdGl2ZUZpbGUuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnLCAnaGFzLW9wdGlvbnMnKTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLnNldEFjdGl2ZUZpbGUoIGZpbGVQcm9wcyApO1xuXHR9XG5cblx0YnVpbGRUcmVlKCBmaWxlLCBsZXZlbCA9IDAgKSB7XG5cdFx0bGV0IHR5cGUgPSBmaWxlLnR5cGU7XG5cdFx0bGV0IGV4dCA9IGZpbGUuZXh0ZW5zaW9uIHx8IG51bGw7XG5cdFx0bGV0IGNoaWxkcmVuO1xuXG5cdFx0aWYgKCBmaWxlLnR5cGUgPT09ICdkaXJlY3RvcnknICkge1xuXHRcdFx0aWYgKCBmaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdGxldCBjaGlsZHJlbkl0ZW1zID0gW107XG5cblx0XHRcdFx0Zm9yICggdmFyIGNoaWxkIGluIGZpbGUuY2hpbGRyZW4gKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JdGVtcy5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggZmlsZS5jaGlsZHJlblsgY2hpbGQgXSwgbGV2ZWwgKyAxICkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNoaWxkcmVuID0gPHVsIGNsYXNzTmFtZT0nY2hpbGRyZW4nIGtleT17IGZpbGUucGF0aCArICctY2hpbGRyZW4nIH0+eyBjaGlsZHJlbkl0ZW1zIH08L3VsPjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDxGaWxlTGlzdERpcmVjdG9yeVxuXHRcdFx0XHRrZXk9eyBmaWxlLnBhdGggfVxuXHRcdFx0XHRmaWxlPXsgZmlsZSB9XG5cdFx0XHRcdGxldmVsPXsgbGV2ZWwgfVxuXHRcdFx0XHRjaGlsZHJlbj17IGNoaWxkcmVuIH1cblx0XHRcdC8+O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gdGhpcy5nZXRNaW1lVHlwZSggZXh0ICk7XG5cblx0XHRcdHJldHVybiA8RmlsZUxpc3RGaWxlXG5cdFx0XHRcdGtleT17IGZpbGUucGF0aCB9XG5cdFx0XHRcdGZpbGU9eyBmaWxlIH1cblx0XHRcdFx0dHlwZT17IHR5cGUgfVxuXHRcdFx0XHRsZXZlbD17IGxldmVsIH1cblx0XHRcdFx0YmFzZT17IHRoaXMucHJvcHMucGF0aCB9XG5cdFx0XHRcdHNldEFjdGl2ZUZpbGU9eyB0aGlzLnNldEFjdGl2ZUZpbGUgfVxuXHRcdFx0Lz47XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGlmIChcblx0XHRcdHRoaXMucHJvcHMubG9hZGluZyApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdsb2FkaW5nJz5cblx0XHRcdFx0XHQ8cD5Mb2FkaW5nJmhlbGxpcDs8L3A+XG5cdFx0XHRcdDwvTm9Db250ZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMucHJvcHMucGF0aCApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQgY2xhc3NOYW1lPSdlbXB0eSc+XG5cdFx0XHRcdFx0PHA+Tm8gcHJvamVjdCBmb2xkZXIgc2VsZWN0ZWQuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLnByb3BzLmZpbGVzIHx8ICEgT2JqZWN0LmtleXMoIHRoaXMucHJvcHMuZmlsZXMgKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8Tm9Db250ZW50IGNsYXNzTmFtZT0nZW1wdHknPlxuXHRcdFx0XHRcdDxwPk5vdGhpbmcgdG8gc2VlIGhlcmUuPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVsaXN0ID0gW107XG5cblx0XHRpZiAoIHRoaXMucHJvcHMuZmlsZXMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuXHRcdFx0Ly8gU2hvdyBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGUgdG9wLWxldmVsIGRpcmVjdG9yeS5cblx0XHRcdGZvciAoIHZhciBjaGlsZCBpbiB0aGlzLnByb3BzLmZpbGVzLmNoaWxkcmVuICkge1xuXHRcdFx0XHRmaWxlbGlzdC5wdXNoKCB0aGlzLmJ1aWxkVHJlZSggdGhpcy5wcm9wcy5maWxlcy5jaGlsZHJlblsgY2hpbGQgXSApICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbGVsaXN0LnB1c2goIHRoaXMuYnVpbGRUcmVlKCB0aGlzLnByb3BzLmZpbGVzICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PHVsIGlkPSdmaWxlcyc+XG5cdFx0XHRcdHsgZmlsZWxpc3QgfVxuXHRcdFx0PC91bD5cblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9ICggc3RhdGUgKSA9PiAoe1xuXHRhY3RpdmVGaWxlOiBzdGF0ZS5hY3RpdmVGaWxlXG59KTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKCBkaXNwYXRjaCApID0+ICh7XG5cdHNldEFjdGl2ZUZpbGU6IHBheWxvYWQgPT4gZGlzcGF0Y2goIHNldEFjdGl2ZUZpbGUoIHBheWxvYWQgKSApXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0KCBtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcyApKCBGaWxlTGlzdCApO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGRpcmVjdG9yeSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZUxpc3REaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlXG5cdFx0fTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRyZW5kZXJDaGlsZHJlbigpIHtcblx0XHRpZiAoICEgdGhpcy5zdGF0ZS5leHBhbmRlZCApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHR9XG5cblx0b25DbGljayggZXZlbnQgKSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKCBmdW5jdGlvbiggcHJldlN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHsgZXhwYW5kZWQ6ICEgcHJldlN0YXRlLmV4cGFuZGVkIH07XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLmV4cGFuZGVkICkge1xuXHRcdFx0Y2xhc3NOYW1lICs9ICcgZXhwYW5kJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGxpIGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9IG9uQ2xpY2s9eyB0aGlzLm9uQ2xpY2sgfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpbGVuYW1lJz5cblx0XHRcdFx0XHR7IFN0cmluZy5mcm9tQ2hhckNvZGUoJzB4MjAwMycpLnJlcGVhdCggdGhpcy5wcm9wcy5sZXZlbCApIH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J2ljb24nIC8+XG5cdFx0XHRcdFx0PHN0cm9uZz57IHRoaXMucHJvcHMuZmlsZS5uYW1lIH08L3N0cm9uZz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJDaGlsZHJlbigpIH1cblx0XHRcdDwvbGk+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0RGlyZWN0b3J5O1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBhIGZpbGUgaW4gdGhlIGZpbGVsaXN0LlxuICovXG5cbmNvbnN0IHsgcmVtb3RlLCBzaGVsbCB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuY29uc3QgeyBNZW51LCBNZW51SXRlbSB9ID0gcmVtb3RlO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNsYXNzIEZpbGVMaXN0RmlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5vbkNvbnRleHRNZW51ID0gdGhpcy5vbkNvbnRleHRNZW51LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdG9uQ2xpY2soIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5wcm9wcy5zZXRBY3RpdmVGaWxlKHtcblx0XHRcdGZpbGU6IHRoaXMucHJvcHMuZmlsZSxcblx0XHRcdGVsZW1lbnQ6IGV2ZW50LmN1cnJlbnRUYXJnZXRcblx0XHR9KTtcblx0fVxuXG5cdG9uQ29udGV4dE1lbnUoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgZmlsZVBhdGggPSB0aGlzLnByb3BzLmZpbGUucGF0aDtcblxuXHRcdGxldCBtZW51ID0gbmV3IE1lbnUoKTtcblx0XHRtZW51LmFwcGVuZCggbmV3IE1lbnVJdGVtKHtcblx0XHRcdGxhYmVsOiAnT3BlbicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLm9wZW5JdGVtKCBmaWxlUGF0aCApIH1cblx0XHR9KSApO1xuXHRcdG1lbnUuYXBwZW5kKCBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0bGFiZWw6ICdTaG93IGluIGZvbGRlcicsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7IHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIoIGZpbGVQYXRoICkgfVxuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHR0eXBlOiAnc2VwYXJhdG9yJ1xuXHRcdH0pICk7XG5cdFx0bWVudS5hcHBlbmQoIG5ldyBNZW51SXRlbSh7XG5cdFx0XHRsYWJlbDogJ0RlbGV0ZScsXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggd2luZG93LmNvbmZpcm0oIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlICR7dGhpcy5wcm9wcy5maWxlLm5hbWV9P2AgKSApIHtcblx0XHRcdFx0XHRpZiAoIHNoZWxsLm1vdmVJdGVtVG9UcmFzaCggZmlsZVBhdGggKSApIHtcblx0XHRcdFx0XHRcdC8qIGdsb2JhbCBFdmVudCAqL1xuXHRcdFx0XHRcdFx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IEV2ZW50KCdiZC9yZWZyZXNoL2ZpbGVzJykgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0d2luZG93LmFsZXJ0KCBgQ291bGQgbm90IGRlbGV0ZSAke3RoaXMucHJvcHMuZmlsZS5uYW1lfS5gICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdH0pICk7XG5cblx0XHRtZW51LnBvcHVwKCByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpICk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxsaVxuXHRcdFx0XHRjbGFzc05hbWU9eyB0aGlzLnByb3BzLnR5cGUgfVxuXHRcdFx0XHRvbkNsaWNrPXsgdGhpcy5vbkNsaWNrIH1cblx0XHRcdFx0b25Db250ZXh0TWVudT17IHRoaXMub25Db250ZXh0TWVudSB9XG5cdFx0XHQ+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWxlbmFtZSc+XG5cdFx0XHRcdFx0eyBTdHJpbmcuZnJvbUNoYXJDb2RlKCcweDIwMDMnKS5yZXBlYXQoIHRoaXMucHJvcHMubGV2ZWwgKSB9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdpY29uJyAvPlxuXHRcdFx0XHRcdDxzdHJvbmc+eyB0aGlzLnByb3BzLmZpbGUubmFtZSB9PC9zdHJvbmc+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9saT5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUxpc3RGaWxlO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBidWlsZCBvcHRpb25zIGZvciBhIGZpbGUuXG4gKi9cblxuY29uc3QgeyBzbGFzaCwgZmlsZVJlbGF0aXZlUGF0aCwgZmlsZUFic29sdXRlUGF0aCwgZmlsZU91dHB1dFBhdGggfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzL3BhdGhIZWxwZXJzJyk7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0bG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0dGhpcy5oYW5kbGVDb21waWxlID0gdGhpcy5oYW5kbGVDb21waWxlLmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKCB7IGxvYWRpbmc6IGZhbHNlIH0gKTtcblx0XHR9LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMuaGFuZGxlQ29tcGlsZUNhbGxiYWNrID0gbnVsbDtcblx0fVxuXG5cdHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoIG5leHRQcm9wcyApIHtcblx0XHRsZXQgY29tcGlsZU9wdGlvbnMgPSBnbG9iYWwuY29tcGlsZXIuZ2V0RmlsZU9wdGlvbnMoIG5leHRQcm9wcy5maWxlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogY29tcGlsZU9wdGlvbnMudHlwZSxcblx0XHRcdGZpbGVUeXBlOiBjb21waWxlT3B0aW9ucy5maWxlVHlwZSxcblx0XHRcdGJ1aWxkVGFza05hbWU6IGNvbXBpbGVPcHRpb25zLmJ1aWxkVGFza05hbWUsXG5cdFx0XHRvcHRpb25zOiBGaWxlT3B0aW9ucy5nZXRPcHRpb25zRnJvbUNvbmZpZyggbmV4dFByb3BzLmJhc2UsIG5leHRQcm9wcy5maWxlIClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIGdldE9wdGlvbnNGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICkge1xuXHRcdGxldCBjZmlsZSA9IEZpbGVPcHRpb25zLmdldEZpbGVGcm9tQ29uZmlnKCBiYXNlLCBmaWxlICk7XG5cblx0XHRyZXR1cm4gKCBjZmlsZSAmJiBjZmlsZS5vcHRpb25zICkgPyBjZmlsZS5vcHRpb25zIDoge307XG5cdH1cblxuXHRzdGF0aWMgZ2V0RmlsZUZyb21Db25maWcoIGJhc2UsIGZpbGUgKSB7XG5cdFx0aWYgKCBmaWxlICYmIGdsb2JhbC5wcm9qZWN0Q29uZmlnICkge1xuXHRcdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIGJhc2UsIGZpbGUucGF0aCApICk7XG5cblx0XHRcdGxldCBmaWxlcyA9IGdsb2JhbC5wcm9qZWN0Q29uZmlnLmdldCggJ2ZpbGVzJywgW10gKTtcblx0XHRcdGxldCBjZmlsZSA9IGZpbGVzLmZpbmQoIGNmaWxlID0+IGNmaWxlLnBhdGggPT09IGZpbGVQYXRoICk7XG5cblx0XHRcdGlmICggY2ZpbGUgKSB7XG5cdFx0XHRcdHJldHVybiBjZmlsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGdldENvbmZpZyggcHJvcGVydHksIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0bGV0IGRlZmF1bHRzID0ge1xuXHRcdFx0cGF0aDogZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCB0aGlzLnByb3BzLmZpbGUucGF0aCApLFxuXHRcdFx0b3V0cHV0OiB0aGlzLmRlZmF1bHRPdXRwdXRQYXRoKCksXG5cdFx0XHRvcHRpb25zOiB7fVxuXHRcdH07XG5cblx0XHRsZXQgc3RvcmVkID0gRmlsZU9wdGlvbnMuZ2V0RmlsZUZyb21Db25maWcoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlICk7XG5cblx0XHRsZXQgY29uZmlnID0gKCBzdG9yZWQgIT09IG51bGwgKSA/IHN0b3JlZCA6IGRlZmF1bHRzO1xuXG5cdFx0aWYgKCBwcm9wZXJ0eSApIHtcblx0XHRcdHJldHVybiAoIGNvbmZpZ1sgcHJvcGVydHkgXSApID8gY29uZmlnWyBwcm9wZXJ0eSBdIDogZGVmYXVsdFZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY29uZmlnO1xuXHRcdH1cblx0fVxuXG5cdHNldENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRcdGlmICggISBnbG9iYWwucHJvamVjdENvbmZpZyB8fCAhIHByb3BlcnR5ICkge1xuXHRcdFx0d2luZG93LmFsZXJ0KCAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHByb2plY3QgY29uZmlndXJhdGlvbi4nICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVQYXRoID0gc2xhc2goIGZpbGVSZWxhdGl2ZVBhdGgoIHRoaXMucHJvcHMuYmFzZSwgdGhpcy5wcm9wcy5maWxlLnBhdGggKSApO1xuXG5cdFx0bGV0IGZpbGVzID0gZ2xvYmFsLnByb2plY3RDb25maWcuZ2V0KCAnZmlsZXMnLCBbXSApO1xuXHRcdGxldCBmaWxlSW5kZXggPSBmaWxlcy5maW5kSW5kZXgoIGZpbGUgPT4gZmlsZS5wYXRoID09PSBmaWxlUGF0aCApO1xuXG5cdFx0aWYgKCBmaWxlSW5kZXggPT09IC0xICkge1xuXHRcdFx0bGV0IGZpbGVDb25maWcgPSB7XG5cdFx0XHRcdHBhdGg6IGZpbGVQYXRoLFxuXHRcdFx0XHR0eXBlOiB0aGlzLnN0YXRlLmZpbGVUeXBlLFxuXHRcdFx0XHRvdXRwdXQ6IHNsYXNoKCBmaWxlUmVsYXRpdmVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIHRoaXMuZGVmYXVsdE91dHB1dFBhdGgoKSApIClcblx0XHRcdH07XG5cblx0XHRcdGlmICggdHlwZW9mKCB2YWx1ZSApICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcblx0XHRcdFx0ZmlsZUNvbmZpZ1sgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0ZmlsZXMucHVzaCggZmlsZUNvbmZpZyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHR5cGVvZiggdmFsdWUgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRcdGZpbGVzWyBmaWxlSW5kZXggXVsgcHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHRcdGRlbGV0ZSBmaWxlc1sgZmlsZUluZGV4IF1bIHByb3BlcnR5IF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2xvYmFsLnByb2plY3RDb25maWcuc2V0KCAnZmlsZXMnLCBmaWxlcyApO1xuXHR9XG5cblx0Z2V0T3B0aW9uKCBvcHRpb24sIGRlZmF1bHRWYWx1ZSA9IG51bGwgKSB7XG5cdFx0aWYgKCB0aGlzLnN0YXRlLm9wdGlvbnMgJiYgdGhpcy5zdGF0ZS5vcHRpb25zWyBvcHRpb24gXSApIHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlLm9wdGlvbnNbIG9wdGlvbiBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblxuXHRzZXRPcHRpb24oIG9wdGlvbiwgdmFsdWUgKSB7XG5cdFx0bGV0IG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc1sgb3B0aW9uIF0gPSB2YWx1ZTtcblxuXHRcdHRoaXMuc2V0Q29uZmlnKCAnb3B0aW9ucycsIG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBvcHRpb25zOiBvcHRpb25zIH0pO1xuXHR9XG5cblx0aGFuZGxlQ2hhbmdlKCBuYW1lLCB2YWx1ZSApIHtcblx0XHRpZiAoIG5hbWUgPT09ICdvdXRwdXQnICkge1xuXHRcdFx0dGhpcy5zZXRDb25maWcoICdvdXRwdXQnLCB2YWx1ZSApO1xuXG5cdFx0XHR0aGlzLnNldFN0YXRlKCB0aGlzLnN0YXRlICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0T3B0aW9uKCBuYW1lLCB2YWx1ZSApO1xuXHRcdH1cblx0fVxuXG5cdGRlZmF1bHRPdXRwdXRQYXRoKCkge1xuXHRcdHJldHVybiBmaWxlT3V0cHV0UGF0aCggdGhpcy5wcm9wcy5maWxlLCB0aGlzLm91dHB1dFN1ZmZpeCwgdGhpcy5vdXRwdXRFeHRlbnNpb24gKTtcblx0fVxuXG5cdGdldE91dHB1dFBhdGgoIHR5cGUgPSAncmVsYXRpdmUnICkge1xuXHRcdGxldCBzbGFzaFBhdGggPSAoIHR5cGUgPT09ICdkaXNwbGF5JyApO1xuXHRcdGxldCByZWxhdGl2ZVBhdGggPSAoIHR5cGUgPT09ICdyZWxhdGl2ZScgfHwgdHlwZSA9PT0gJ2Rpc3BsYXknICk7XG5cdFx0bGV0IGRlZmF1bHRQYXRoID0gdGhpcy5kZWZhdWx0T3V0cHV0UGF0aCgpO1xuXHRcdGxldCBvdXRwdXRQYXRoID0gdGhpcy5nZXRDb25maWcoICdvdXRwdXQnLCBkZWZhdWx0UGF0aCApO1xuXG5cdFx0aWYgKCByZWxhdGl2ZVBhdGggKSB7XG5cdFx0XHRvdXRwdXRQYXRoID0gZmlsZVJlbGF0aXZlUGF0aCggdGhpcy5wcm9wcy5iYXNlLCBvdXRwdXRQYXRoICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dHB1dFBhdGggPSBmaWxlQWJzb2x1dGVQYXRoKCB0aGlzLnByb3BzLmJhc2UsIG91dHB1dFBhdGggKTtcblx0XHR9XG5cblx0XHRpZiAoIHNsYXNoUGF0aCApIHtcblx0XHRcdG91dHB1dFBhdGggPSBzbGFzaCggb3V0cHV0UGF0aCApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRQYXRoO1xuXHR9XG5cblx0aGFuZGxlQ29tcGlsZSgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcblxuXHRcdGdsb2JhbC5jb21waWxlci5wcm9jZXNzRmlsZShcblx0XHRcdHRoaXMucHJvcHMuYmFzZSxcblx0XHRcdHRoaXMuZ2V0Q29uZmlnKCksXG5cdFx0XHR0aGlzLnN0YXRlLmJ1aWxkVGFza05hbWUsXG5cdFx0XHR0aGlzLmhhbmRsZUNvbXBpbGVDYWxsYmFja1xuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXJIZWFkZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdoZWFkZXInPlxuXHRcdFx0XHQ8c3Ryb25nPnsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfTwvc3Ryb25nPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlckZvb3RlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2Zvb3Rlcic+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRjbGFzc05hbWU9J2NvbXBpbGUgZ3JlZW4nXG5cdFx0XHRcdFx0b25DbGljaz17IHRoaXMuaGFuZGxlQ29tcGlsZSB9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9eyB0aGlzLnN0YXRlLmxvYWRpbmcgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyB0aGlzLnN0YXRlLmxvYWRpbmcgPyAnQ29tcGlsaW5nLi4uJyA6ICdDb21waWxlJyB9XG5cdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHRpb25zO1xuIiwiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgZmlsZSBvcHRpb25zIGZvciBhIHNjcmlwdC5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IEZpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9GaWxlT3B0aW9ucycpO1xuXG5jb25zdCBGaWVsZFN3aXRjaCA9IHJlcXVpcmUoJy4uLy4uL2ZpZWxkcy9GaWVsZFN3aXRjaCcpO1xuXG5jb25zdCBGaWVsZFNhdmVGaWxlID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2F2ZUZpbGUnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTY3JpcHQgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuanMnO1xuXHRcdHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgPSBbXG5cdFx0XHR7IG5hbWU6ICdKYXZhU2NyaXB0JywgZXh0ZW5zaW9uczogWyAnanMnIF0gfVxuXHRcdF07XG5cdH1cblxuXHRzb3VyY2VNYXBzRGlzYWJsZWQoKSB7XG5cdFx0cmV0dXJuICggISB0aGlzLnN0YXRlLm9wdGlvbnMgfHwgKCAhIHRoaXMuc3RhdGUub3B0aW9ucy5idW5kbGUgJiYgISB0aGlzLnN0YXRlLm9wdGlvbnMuYmFiZWwgKSApO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGlkPSdmaWxlLW9wdGlvbnMnIGNsYXNzTmFtZT0nZmlsZS1vcHRpb25zLXNjcmlwdCc+XG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvZHknPlxuXHRcdFx0XHRcdDxGaWVsZFNhdmVGaWxlXG5cdFx0XHRcdFx0XHRuYW1lPSdvdXRwdXQnXG5cdFx0XHRcdFx0XHRsYWJlbD0nT3V0cHV0IFBhdGgnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPdXRwdXRQYXRoKCAnZGlzcGxheScgKSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VGaWxlPXsgdGhpcy5wcm9wcy5maWxlIH1cblx0XHRcdFx0XHRcdHNvdXJjZUJhc2U9eyB0aGlzLnByb3BzLmJhc2UgfVxuXHRcdFx0XHRcdFx0ZGlhbG9nRmlsdGVycz17IHRoaXMuc2F2ZURpYWxvZ0ZpbHRlcnMgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdDxGaWVsZFN3aXRjaFxuXHRcdFx0XHRcdFx0bmFtZT0nYXV0b2NvbXBpbGUnXG5cdFx0XHRcdFx0XHRsYWJlbD0nQXV0byBDb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdhdXRvY29tcGlsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8aHIgLz5cblxuXHRcdFx0XHRcdHsvKiA8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2J1bmRsZSdcblx0XHRcdFx0XHRcdGxhYmVsPSdCdW5kbGUnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2J1bmRsZScsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+ICovfVxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdiYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsPSdCYWJlbCdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYmFiZWwnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSd1Z2xpZnknXG5cdFx0XHRcdFx0XHRsYWJlbD0nVWdsaWZ5J1xuXHRcdFx0XHRcdFx0bGFiZWxQb3M9J2xlZnQnXG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICd1Z2xpZnknLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PEZpZWxkU3dpdGNoXG5cdFx0XHRcdFx0XHRuYW1lPSdzb3VyY2VtYXBzJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J1NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdGRpc2FibGVkPXsgdGhpcy5zb3VyY2VNYXBzRGlzYWJsZWQoKSB9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdHZhbHVlPXsgdGhpcy5nZXRPcHRpb24oICdzb3VyY2VtYXBzJywgZmFsc2UgKSB9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9kaXY+XG5cblx0XHRcdFx0eyB0aGlzLnJlbmRlckZvb3RlcigpIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3B0aW9uc1NjcmlwdDtcbiIsIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IGZvciBkaXNwbGF5aW5nIGZpbGUgb3B0aW9ucyBmb3IgYSBzdHlsZXNoZWV0LlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuY29uc3QgRmlsZU9wdGlvbnMgPSByZXF1aXJlKCcuL0ZpbGVPcHRpb25zJyk7XG5cbmNvbnN0IEZpZWxkU3dpdGNoID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU3dpdGNoJyk7XG5cbmNvbnN0IEZpZWxkU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vZmllbGRzL0ZpZWxkU2VsZWN0Jyk7XG5cbmNvbnN0IEZpZWxkU2F2ZUZpbGUgPSByZXF1aXJlKCcuLi8uLi9maWVsZHMvRmllbGRTYXZlRmlsZScpO1xuXG5jb25zdCBOb0NvbnRlbnQgPSByZXF1aXJlKCcuLi8uLi9Ob0NvbnRlbnQnKTtcblxuY2xhc3MgRmlsZU9wdGlvbnNTdHlsZXMgZXh0ZW5kcyBGaWxlT3B0aW9ucyB7XG5cblx0LyoqXG5cdCAqIENvbnN0cmN1dG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcblx0ICovXG5cdGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcblx0XHRzdXBlciggcHJvcHMgKTtcblxuXHRcdHRoaXMub3V0cHV0U3VmZml4ID0gJy1kaXN0Jztcblx0XHR0aGlzLm91dHB1dEV4dGVuc2lvbiA9ICcuY3NzJztcblx0XHR0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzID0gW1xuXHRcdFx0eyBuYW1lOiAnQ1NTJywgZXh0ZW5zaW9uczogWyAnY3NzJyBdIH1cblx0XHRdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBmaWxlIGlzIGEgcGFydGlhbC5cblx0ICogQ3VycmVudGx5LCBpdCBzaW1wbHkgY2hlY2tzIGlmIHRoZSBmaWxlbmFtZSBiZWdpbnMgd2l0aCBhbiB1bmRlcnNjb3JlLlxuXHQgKi9cblx0aXNQYXJ0aWFsKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGUubmFtZS5zdGFydHNXaXRoKCdfJyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVyLlxuXHQgKi9cblx0cmVuZGVyKCkge1xuXHRcdGlmICggdGhpcy5pc1BhcnRpYWwoKSApIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxOb0NvbnRlbnQ+XG5cdFx0XHRcdFx0PHA+VGhpcyBpcyBhIHBhcnRpYWwgZmlsZSw8YnIgLz4gaXQgY2Fubm90IGJlIGNvbXBpbGVkPGJyIC8+IG9uIGl0cyBvd24uPC9wPlxuXHRcdFx0XHQ8L05vQ29udGVudD5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgaWQ9J2ZpbGUtb3B0aW9ucycgY2xhc3NOYW1lPSdmaWxlLW9wdGlvbnMtc3R5bGUnPlxuXHRcdFx0XHR7IHRoaXMucmVuZGVySGVhZGVyKCkgfVxuXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib2R5Jz5cblx0XHRcdFx0XHQ8RmllbGRTYXZlRmlsZVxuXHRcdFx0XHRcdFx0bmFtZT0nb3V0cHV0J1xuXHRcdFx0XHRcdFx0bGFiZWw9J091dHB1dCBQYXRoJ1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3V0cHV0UGF0aCggJ2Rpc3BsYXknICkgfVxuXHRcdFx0XHRcdFx0c291cmNlRmlsZT17IHRoaXMucHJvcHMuZmlsZSB9XG5cdFx0XHRcdFx0XHRzb3VyY2VCYXNlPXsgdGhpcy5wcm9wcy5iYXNlIH1cblx0XHRcdFx0XHRcdGRpYWxvZ0ZpbHRlcnM9eyB0aGlzLnNhdmVEaWFsb2dGaWx0ZXJzIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9jb21waWxlJ1xuXHRcdFx0XHRcdFx0bGFiZWw9J0F1dG8gQ29tcGlsZSdcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnYXV0b2NvbXBpbGUnLCBmYWxzZSApIH1cblx0XHRcdFx0XHQvPlxuXG5cdFx0XHRcdFx0PGhyIC8+XG5cblx0XHRcdFx0XHR7IHRoaXMuc3RhdGUudHlwZSA9PT0gJ3Nhc3MnICYmXG5cdFx0XHRcdFx0XHQ8RmllbGRTZWxlY3Rcblx0XHRcdFx0XHRcdFx0bmFtZT0nc3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsPSdPdXRwdXQgU3R5bGUnXG5cdFx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17IHRoaXMuaGFuZGxlQ2hhbmdlIH1cblx0XHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ3N0eWxlJywgJ25lc3RlZCcgKSB9XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM9eyB7XG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkOiAnTmVzdGVkJyxcblx0XHRcdFx0XHRcdFx0XHRjb21wYWN0OiAnQ29tcGFjdCcsXG5cdFx0XHRcdFx0XHRcdFx0ZXhwYW5kZWQ6ICdFeHBhbmRlZCcsXG5cdFx0XHRcdFx0XHRcdFx0Y29tcHJlc3NlZDogJ0NvbXByZXNzZWQnXG5cdFx0XHRcdFx0XHRcdH0gfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J3NvdXJjZW1hcHMnXG5cdFx0XHRcdFx0XHRsYWJlbD0nU291cmNlbWFwcydcblx0XHRcdFx0XHRcdGxhYmVsUG9zPSdsZWZ0J1xuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0aGlzLmhhbmRsZUNoYW5nZSB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IHRoaXMuZ2V0T3B0aW9uKCAnc291cmNlbWFwcycsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cblx0XHRcdFx0XHQ8RmllbGRTd2l0Y2hcblx0XHRcdFx0XHRcdG5hbWU9J2F1dG9wcmVmaXhlcidcblx0XHRcdFx0XHRcdGxhYmVsPSdBdXRvcHJlZml4ZXInXG5cdFx0XHRcdFx0XHRsYWJlbFBvcz0nbGVmdCdcblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdGhpcy5oYW5kbGVDaGFuZ2UgfVxuXHRcdFx0XHRcdFx0dmFsdWU9eyB0aGlzLmdldE9wdGlvbiggJ2F1dG9wcmVmaXhlcicsIGZhbHNlICkgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvZGl2PlxuXG5cdFx0XHRcdHsgdGhpcy5yZW5kZXJGb290ZXIoKSB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wdGlvbnNTdHlsZXM7XG4iLCIvKipcbiAqIEBmaWxlIENvbXBvbmVudCBmb3Igc2hvd2luZyBub3RpY2VzIGFuZCBhbGVydHMuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jbGFzcyBOb3RpY2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHR5cGUgPSB0aGlzLnByb3BzLnR5cGUgfHwgJ2luZm8nO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXsgJ25vdGljZSB0eXBlLScgKyB0eXBlIH0+XG5cdFx0XHRcdHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWNlO1xuIiwiLyoqXG4gKiBAZmlsZSBSb290IHJlZHVjZXIuXG4gKi9cblxuY29uc3QgeyBjb21iaW5lUmVkdWNlcnMgfSA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbmNvbnN0IHZpZXcgPSAoIGN1cnJlbnQgPSAnZmlsZXMnLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0NIQU5HRV9WSUVXJzpcblx0XHRcdHJldHVybiBhY3Rpb24udmlldztcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdH1cbn07XG5cbmNvbnN0IHsgcHJvamVjdHMsIGFjdGl2ZVByb2plY3QsIGFjdGl2ZVByb2plY3RGaWxlcyB9ID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuXG5jb25zdCBhY3RpdmVGaWxlID0gKCBmaWxlID0gbnVsbCwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdTRVRfQUNUSVZFX0ZJTEUnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmlsZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG5cdHZpZXcsXG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXMsXG5cdGFjdGl2ZUZpbGVcbn0pO1xuIiwiLyoqXG4gKiBAZmlsZSBQcm9qZWN0cyByZWR1Y2VyLlxuICovXG5cbmNvbnN0IHByb2plY3RzID0gKCBwcm9qZWN0cyA9IFtdLCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ0FERF9QUk9KRUNUJzpcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdC4uLnByb2plY3RzLFxuXHRcdFx0XHRhY3Rpb24ucGF5bG9hZFxuXHRcdFx0XTtcblx0XHRjYXNlICdSRU1PVkVfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gcHJvamVjdHMuZmlsdGVyKCAoIHByb2plY3QsIGluZGV4ICkgPT4gaW5kZXggIT09IGFjdGlvbi5pZCApO1xuXHRcdGNhc2UgJ1JFRlJFU0hfQUNUSVZFX1BST0pFQ1QnOlxuXHRcdFx0cmV0dXJuIHByb2plY3RzLm1hcCggZnVuY3Rpb24oIHByb2plY3QsIGluZGV4ICkge1xuXHRcdFx0XHRpZiAoIGluZGV4ID09PSBwYXJzZUludCggYWN0aW9uLnBheWxvYWQuaWQsIDEwICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBwcm9qZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHByb2plY3RzO1xuXHR9XG59O1xuXG5jb25zdCBhY3RpdmVQcm9qZWN0ID0gKCBhY3RpdmUgPSB7fSwgYWN0aW9uICkgPT4ge1xuXHRzd2l0Y2ggKCBhY3Rpb24udHlwZSApIHtcblx0XHRjYXNlICdDSEFOR0VfUFJPSkVDVCc6XG5cdFx0XHRyZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cdFx0Y2FzZSAnU0VUX1BST0pFQ1RfU1RBVEUnOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uYWN0aXZlLFxuXHRcdFx0XHQuLi5hY3Rpb24ucGF5bG9hZFxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGFjdGl2ZTtcblx0fVxufTtcblxuY29uc3QgYWN0aXZlUHJvamVjdEZpbGVzID0gKCBmaWxlcyA9IHt9LCBhY3Rpb24gKSA9PiB7XG5cdHN3aXRjaCAoIGFjdGlvbi50eXBlICkge1xuXHRcdGNhc2UgJ1JFQ0VJVkVfRklMRVMnOlxuXHRcdFx0cmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmlsZXM7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByb2plY3RzLFxuXHRhY3RpdmVQcm9qZWN0LFxuXHRhY3RpdmVQcm9qZWN0RmlsZXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIExvZ2dlciB1dGlsaXR5LlxuICovXG5cbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5jbGFzcyBMb2dnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmxvZ3MgPSBbXTtcblx0fVxuXG5cdGxvZyggdHlwZSwgdGl0bGUsIGJvZHkgPSAnJyApIHtcblx0XHR0aGlzLmxvZ3MucHVzaCh7XG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0Ym9keTogYm9keSxcblx0XHRcdHRpbWU6IG1vbWVudCgpLmZvcm1hdCgnSEg6bW06c3MuU1NTJylcblx0XHR9KTtcblx0XHQvKiBnbG9iYWwgRXZlbnQgKi9cblx0XHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoJ2JkL3JlZnJlc2gvbG9ncycpICk7XG5cdH1cblxuXHRnZXQoIHR5cGUgPSBudWxsLCBvcmRlciA9ICdkZXNjJyApIHtcblx0XHRsZXQgbG9ncztcblxuXHRcdGlmICggISB0eXBlICkge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9ncyA9IHRoaXMubG9ncy5maWx0ZXIoIGxvZyA9PiB7IHJldHVybiBsb2cudHlwZSA9PT0gdHlwZSB9ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcmRlciA9PT0gJ2Rlc2MnICkge1xuXHRcdFx0bG9ncyA9IGxvZ3Muc2xpY2UoKS5yZXZlcnNlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxvZ3M7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XG4iLCIvKipcbiAqIEBmaWxlIFdhbGsgYSBkaXJlY3RvcnkgYW5kIHJldHVybiBhbiBvYmplY3Qgb2YgZmlsZXMgYW5kIHN1YmZvbGRlcnMuXG4gKi9cblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwoIHJlcXVpcmUoJ2ZzJykgKTtcblxuY29uc3QgZnNwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBkaXJlY3RvcnlUcmVlKCBwYXRoLCBvcHRpb25zID0ge30sIGRlcHRoID0gMCApIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICkge1xuXHRcdC8vIElmIG1heCBkZXB0aCB3YXMgcmVhY2hlZCwgYmFpbC5cblx0XHRpZiAoIG9wdGlvbnMuZGVwdGggJiYgZGVwdGggPiBvcHRpb25zLmRlcHRoICkge1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5hbWUgPSBmc3BhdGguYmFzZW5hbWUoIHBhdGggKTtcblx0XHRjb25zdCBpdGVtID0geyBwYXRoLCBuYW1lIH07XG5cblx0XHRsZXQgc3RhdHM7XG5cblx0XHR0cnkge1xuXHRcdFx0c3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKTtcblx0XHR9IGNhdGNoICggZXJyICkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coIGVyciApO1xuXHRcdFx0cmVzb2x2ZSggbnVsbCApO1xuXHRcdH1cblxuXHRcdC8vIFNraXAgaWYgaXQgbWF0Y2hlcyB0aGUgZXhjbHVkZSByZWdleC5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leGNsdWRlICYmICggb3B0aW9ucy5leGNsdWRlLnRlc3QoIHBhdGggKSB8fCBvcHRpb25zLmV4Y2x1ZGUudGVzdCggbmFtZSApICkgKSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzdGF0cy5pc0ZpbGUoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdmaWxlJztcblxuXHRcdFx0Y29uc3QgZXh0ID0gZnNwYXRoLmV4dG5hbWUoIHBhdGggKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHQvLyBTa2lwIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBleHRlbnNpb24gcmVnZXguXG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5leHRlbnNpb25zICYmICEgb3B0aW9ucy5leHRlbnNpb25zLnRlc3QoIGV4dCApICkge1xuXHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGl0ZW0uc2l6ZSA9IHN0YXRzLnNpemU7IC8vIEZpbGUgc2l6ZSBpbiBieXRlcy5cblx0XHRcdGl0ZW0uZXh0ZW5zaW9uID0gZXh0O1xuXG5cdFx0XHRyZXNvbHZlKCBpdGVtICk7XG5cdFx0fSBlbHNlIGlmICggc3RhdHMuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRcdGl0ZW0udHlwZSA9ICdkaXJlY3RvcnknO1xuXG5cdFx0XHRmcy5yZWFkZGlyKCBwYXRoLCBmdW5jdGlvbiggZXJyLCBmaWxlcyApIHtcblx0XHRcdFx0aWYgKCBlcnIgKSB7XG5cdFx0XHRcdFx0aWYgKCBlcnIuY29kZSA9PT0gJ0VBQ0NFUycgKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbnMsIGlnbm9yZSBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCBudWxsICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gW107XG5cblx0XHRcdFx0UHJvbWlzZS5tYXAoIGZpbGVzLCBmdW5jdGlvbiggZmlsZSApIHtcblx0XHRcdFx0XHRyZXR1cm4gZGlyZWN0b3J5VHJlZSggZnNwYXRoLmpvaW4oIHBhdGgsIGZpbGUgKSwgb3B0aW9ucywgZGVwdGggKyAxICk7XG5cdFx0XHRcdH0pLnRoZW4oIGZ1bmN0aW9uKCBjaGlsZHJlbiApIHtcblx0XHRcdFx0XHRpdGVtLmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKCAoZSkgPT4gISFlICk7XG5cdFx0XHRcdFx0cmVzb2x2ZSggaXRlbSApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBpdGVtLnNpemUgPSBpdGVtLmNoaWxkcmVuLnJlZHVjZSggKCBwcmV2LCBjdXIgKSA9PiB7XG5cdFx0XHQvLyBcdGNvbnNvbGUubG9nKCBwcmV2LCBjdXIuc2l6ZSApO1xuXHRcdFx0Ly8gXHRyZXR1cm4gcHJldiArIGN1ci5zaXplO1xuXHRcdFx0Ly8gfSwgMCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXNvbHZlKCBudWxsICk7IC8vIE9yIHNldCBpdGVtLnNpemUgPSAwIGZvciBkZXZpY2VzLCBGSUZPIGFuZCBzb2NrZXRzID9cblx0XHR9XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yeVRyZWU7XG4iLCIvKipcbiAqIEBmaWxlIEdsb2JhbCBoZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgYXBwJ3MgVUkuXG4gKi9cblxuZnVuY3Rpb24gdW5mb2N1cyggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAndW5mb2N1cycsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiBsb2FkaW5nKCB0b2dnbGUgPSB0cnVlLCBhcmdzID0ge30gKSB7XG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ2xvYWRpbmcnLCB0b2dnbGUgKTtcbn1cblxuZnVuY3Rpb24gb3ZlcmxheSggdG9nZ2xlID0gdHJ1ZSApIHtcblx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnb3ZlcmxheScsIHRvZ2dsZSApO1xufVxuXG5mdW5jdGlvbiByZW1vdmVGb2N1cyggZWxlbWVudCwgY2xhc3NOYW1lLCB0cmlnZ2VyRXZlbnQgPSBudWxsLCBleGNsdWRlID0gbnVsbCApIHtcblx0Y29uc3Qgb3V0c2lkZUNsaWNrTGlzdGVuZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnQuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0cmVtb3ZlQ2xpY2tMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAoICEgZXhjbHVkZSB8fCAhIGV4Y2x1ZGUuY29udGFpbnMoIGV2ZW50LnRhcmdldCApICkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIGNsYXNzTmFtZSApO1xuXG5cdFx0XHRcdGlmICggdHJpZ2dlckV2ZW50ICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoIHRyaWdnZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVtb3ZlQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIG91dHNpZGVDbGlja0xpc3RlbmVyICk7XG5cdH1cblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvdXRzaWRlQ2xpY2tMaXN0ZW5lciApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dW5mb2N1cyxcblx0bG9hZGluZyxcblx0b3ZlcmxheSxcblx0cmVtb3ZlRm9jdXNcbn07XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBmdW5jdGlvbnMgZm9yIHJlc29sdmluZywgdHJhbnNmb3JtaW5nLCBnZW5lcmF0aW5nIGFuZCBmb3JtYXR0aW5nIHBhdGhzLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvc2xhc2hcbmZ1bmN0aW9uIHNsYXNoKCBpbnB1dCApIHtcblx0Y29uc3QgaXNFeHRlbmRlZExlbmd0aFBhdGggPSAvXlxcXFxcXFxcXFw/XFxcXC8udGVzdChpbnB1dCk7XG5cdGNvbnN0IGhhc05vbkFzY2lpID0gL1teXFx1MDAwMC1cXHUwMDgwXSsvLnRlc3QoaW5wdXQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnRyb2wtcmVnZXhcblxuXHRpZiAoaXNFeHRlbmRlZExlbmd0aFBhdGggfHwgaGFzTm9uQXNjaWkpIHtcblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG5mdW5jdGlvbiBmaWxlT3V0cHV0UGF0aCggZmlsZSwgc3VmZml4ID0gJycsIGV4dGVuc2lvbiA9IGZpbGUuZXh0ZW5zaW9uICkge1xuXHRsZXQgYmFzZWRpciA9IHBhdGgucGFyc2UoIGZpbGUucGF0aCApLmRpcjtcblx0bGV0IGZpbGVuYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoL1xcLlteLy5dKyQvLCAnJykgKyBzdWZmaXggKyBleHRlbnNpb247XG5cblx0cmV0dXJuIHBhdGguam9pbiggYmFzZWRpciwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZmlsZVJlbGF0aXZlUGF0aCggZnJvbSwgdG8gKSB7XG5cdHJldHVybiBwYXRoLnJlbGF0aXZlKCBmcm9tLCB0byApO1xufVxuXG5mdW5jdGlvbiBmaWxlQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuICggcGF0aC5pc0Fic29sdXRlKCBmaWxlbmFtZSApICkgPyBmaWxlbmFtZSA6IHBhdGguam9pbiggYmFzZSwgZmlsZW5hbWUgKTtcbn1cblxuZnVuY3Rpb24gZGlyQWJzb2x1dGVQYXRoKCBiYXNlLCBmaWxlbmFtZSApIHtcblx0cmV0dXJuIHBhdGgucGFyc2UoIGZpbGVBYnNvbHV0ZVBhdGgoIGJhc2UsIGZpbGVuYW1lICkgKS5kaXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGFzaCxcblx0ZmlsZU91dHB1dFBhdGgsXG5cdGZpbGVSZWxhdGl2ZVBhdGgsXG5cdGZpbGVBYnNvbHV0ZVBhdGgsXG5cdGRpckFic29sdXRlUGF0aFxufTtcbiIsIi8qKlxuICogQGZpbGUgQ29sbGVjdGlvbiBvZiBoZWxwZXIgZnVuY3Rpb25zLlxuICovXG5cbmZ1bmN0aW9uIHNsZWVwKG1pbGxpc2Vjb25kcykge1xuXHR2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0Zm9yICggdmFyIGkgPSAwOyBpIDwgMWU3OyBpKysgKSB7XG5cdFx0aWYgKCAoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQgKSA+IG1pbGxpc2Vjb25kcyApIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdGxldCBzdGF0ZSA9IHtcblx0XHR2aWV3OiAnZmlsZXMnLFxuXHRcdHByb2plY3RzOiBbXSxcblx0XHRhY3RpdmVQcm9qZWN0OiAwLFxuXHRcdGFjdGl2ZVByb2plY3RGaWxlczoge30sXG5cdFx0YWN0aXZlRmlsZTogbnVsbFxuXHR9O1xuXG5cdGlmICggZ2xvYmFsLmNvbmZpZy5oYXMoICdwcm9qZWN0cycgKSApIHtcblx0XHRzdGF0ZS5wcm9qZWN0cyA9IGdsb2JhbC5jb25maWcuZ2V0KCAncHJvamVjdHMnICk7XG5cdH1cblxuXHRpZiAoIHN0YXRlLnByb2plY3RzLmxlbmd0aCAmJiBnbG9iYWwuY29uZmlnLmhhcyggJ2FjdGl2ZS1wcm9qZWN0JyApICkge1xuXHRcdGxldCBhY3RpdmVJbmRleCA9IGdsb2JhbC5jb25maWcuZ2V0KCAnYWN0aXZlLXByb2plY3QnICk7XG5cblx0XHRpZiAoIHN0YXRlLnByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdFx0c3RhdGUuYWN0aXZlUHJvamVjdCA9IHN0YXRlLnByb2plY3RzWyBhY3RpdmVJbmRleCBdO1xuXHRcdFx0c3RhdGUuYWN0aXZlUHJvamVjdC5pZCA9IGFjdGl2ZUluZGV4O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvamVjdENvbmZpZyggcHJvcGVydHksIHZhbHVlICkge1xuXHRsZXQgcHJvamVjdHMgPSBnbG9iYWwuY29uZmlnLmdldCgncHJvamVjdHMnKTtcblx0bGV0IGFjdGl2ZUluZGV4ID0gZ2xvYmFsLmNvbmZpZy5nZXQoJ2FjdGl2ZS1wcm9qZWN0Jyk7XG5cblx0aWYgKCBBcnJheS5pc0FycmF5KCBwcm9qZWN0cyApICYmIHByb2plY3RzWyBhY3RpdmVJbmRleCBdICkge1xuXHRcdHByb2plY3RzWyBhY3RpdmVJbmRleCBdWyBwcm9wZXJ0eSBdID0gdmFsdWU7XG5cblx0XHRnbG9iYWwuY29uZmlnLnNldCggJ3Byb2plY3RzJywgcHJvamVjdHMgKTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuYWxlcnQoICdUaGVyZSB3YXMgYSBwcm9ibGVtIHNhdmluZyB0aGUgcHJvamVjdCBjb25maWcuJyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lBcnJheSggZGVwZW5kZW5jeVRyZWUgKSB7XG5cdGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcblxuXHRmb3IgKCB2YXIgZGVwZW5kZW5jeSBpbiBkZXBlbmRlbmN5VHJlZSApIHtcblx0XHRkZXBlbmRlbmNpZXMucHVzaCggZGVwZW5kZW5jeSApO1xuXG5cdFx0aWYgKCBPYmplY3Qua2V5cyggZGVwZW5kZW5jeVRyZWVbIGRlcGVuZGVuY3kgXSApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMuY29uY2F0KCBnZXREZXBlbmRlbmN5QXJyYXkoIGRlcGVuZGVuY3lUcmVlWyBkZXBlbmRlbmN5IF0gKSApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkZXBlbmRlbmNpZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzbGVlcCxcblx0Z2V0SW5pdGlhbFN0YXRlLFxuXHRzZXRQcm9qZWN0Q29uZmlnLFxuXHRnZXREZXBlbmRlbmN5QXJyYXlcbn07XG4iXX0=
