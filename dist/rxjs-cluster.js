(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.NetSystem = exports.ProcSystem = undefined;
	exports.default = Cluster;
	
	var _rx = __webpack_require__(1);
	
	var _rx2 = _interopRequireDefault(_rx);
	
	var _stringHash = __webpack_require__(2);
	
	var _stringHash2 = _interopRequireDefault(_stringHash);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _ProcCluster = __webpack_require__(4);
	
	var _ProcCluster2 = _interopRequireDefault(_ProcCluster);
	
	var _NetCluster = __webpack_require__(7);
	
	var _NetCluster2 = _interopRequireDefault(_NetCluster);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Observable = _rx2.default.Observable;
	var observableProto = Observable.prototype;
	
	var ProcSystem = exports.ProcSystem = _ProcCluster2.default;
	var NetSystem = exports.NetSystem = _NetCluster2.default;
	function Cluster(options) {
	  var _this = this;
	
	  this.workers = [];
	  this.childEntries = {};
	  this._options = options = Object.assign({
	    debug: false
	  }, options || {});
	
	  var sys = this.sys = options.system = options.system || new _ProcCluster2.default({ workers: options.workers });
	
	  this.n = 0; // round-robin scheduling
	  this.work = new _rx2.default.Subject(); // Children work
	
	  var that = this;
	  this.startWorkers = sys.startWorkers;
	  this.clusterMap = function (x, y, z) {
	    var ___clusterMap = _clusterMap.bind(this);
	    return ___clusterMap(that, x, y, z);
	  };
	
	  this.setupChild = sys.setupChild;
	  this.childWork = _childWork.bind(this);
	  this.entry = _entry.bind(this);
	  this.getWorkers = _getWorkers.bind(this);
	  this.killall = function (x) {
	    return sys.killall(_this);
	  };
	}
	
	function _childWork(_ref) {
	  var data = _ref.data;
	  var id = _ref.id;
	  var func = _ref.func;
	
	  var funcRef = this.childEntries[func];
	
	  if (!funcRef) {
	    console.log('Function not found in childMethod lookup:', func);
	    throw new Error('Function not found in childMethod lookup: ' + func);
	    return;
	  }
	
	  var exec = funcRef(data);
	
	  if (!exec.subscribe) {
	    return _rx2.default.Observable.just(exec);
	  } else return exec.first();
	}
	
	/*
	@param numWorkers number of cpus
	@param entryFun the master entry function
	@param options options object
	*/
	function _entry(entryFun, childMethods) {
	  var _this2 = this;
	
	  var options = this._options;
	
	  var childEntries = this.childEntries;
	  _lodash2.default.forEach(childMethods, function (v, k) {
	    if (v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
	  });
	
	  var isMasterEnv = process.env.isMaster === 'true' || this._options.isMaster === true;
	  var isSlaveEnv = process.env.isSlave === 'true' || this._options.isSlave === true;
	  var isMasterCheck = isMasterEnv ? function (x) {
	    return true;
	  } : isSlaveEnv ? function (x) {
	    return false;
	  } : this.sys.isMasterCheck;
	
	  //const isMaster = this._options.isMaster || this.sys.isMaster;
	  isMasterCheck(options, function (isMaster) {
	
	    // Child entry point
	    if (!isMaster) {
	      console.log('cluster: slave elected');
	      _this2.setupChild(_this2, _this2.work);
	      return;
	    }
	
	    // Master entry point
	    if (isMaster && typeof entryFun === 'function') {
	      console.log('cluster: master elected');
	      _this2.startWorkers(_this2, _this2.workers, entryFun);
	    }
	  });
	}
	
	function _getWorkers() {
	  return this.workers;
	}
	
	/*
	@param funcName function to invoke
	@param nodeSelector (optional) (function | string | int) used to pick node. If function, the value is the stream object and the return is (string | int).
	*/
	function _clusterMap(that, funcName, nodeSelector) {
	  var key = null;
	  if (nodeSelector !== undefined && nodeSelector !== null && typeof nodeSelector !== 'function') {
	    key = Number.isInteger(nodeSelector) ? nodeSelector : (0, _stringHash2.default)(nodeSelector.toString());
	    nodeSelector = null;
	  }
	  var workers = that.workers;
	  //const that = this;
	  return this.flatMap(function (data) {
	    return _rx2.default.Observable.create(function (obs) {
	      if (nodeSelector) {
	        var nodeKey = nodeSelector(data);
	        key = Number.isInteger(nodeKey) ? nodeKey : (0, _stringHash2.default)(nodeKey.toString());
	      }
	
	      var workerIndex = key ? key % workers.length : that.n++ % workers.length;
	      //console.log(workerIndex, n, workers.length);
	      //n++;
	      //if( n === Number.MAX_SAFE_INTEGER) x = Number.MIN_SAFE_INTEGER; // should be safe
	      //console.log(workers.length, workerIndex, x);
	      var worker = workers[workerIndex];
	
	      worker.jobIndex = worker.jobIndex || 0;
	      var jobIndex = worker.jobIndex;
	      worker.jobIndex++;
	
	      that.sys.clusterMapObs(that, obs, data, funcName, jobIndex, worker);
	    });
	  });
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("rx");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("string-hash");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ProcCluster;
	
	var _cluster = __webpack_require__(5);
	
	var _cluster2 = _interopRequireDefault(_cluster);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function ProcCluster(options) {
	  if (!options.workers) options.workers = __webpack_require__(6).cpus().length;
	
	  this.options = Object.assign({}, options);
	
	  this.clusterMapObs = _clusterMapObs.bind(this);
	  this.setupChild = _setupChild.bind(this);
	  this.startWorkers = _startWorkers.bind(this);
	  this.killall = _killall.bind(this);
	  this.isMasterCheck = function (options, cb) {
	    return cb(_cluster2.default.isMaster);
	  };
	}
	
	function _killall(self) {
	  _lodash2.default.forEach(self.workers, function (x) {
	    return x.kill();
	  });
	}
	
	function _setupChild(self, work) {
	  work.concatMap(self.childWork, function (y, x) {
	    return {
	      data: x,
	      id: y.id
	    };
	  }).subscribe(function (_ref) {
	    var data = _ref.data;
	    var id = _ref.id;
	    return process.send({
	      rdata: data,
	      id: id
	    });
	  }, function (x) {
	    return console.log('Child ' + process.pid + ' err', x);
	  });
	
	  process.on('message', function onChildMessage(x) {
	    work.onNext(x);
	  }); // push work unto task stream
	}
	
	function _startWorkers(self, workers, onReady) {
	  var numWorkers = this.options.workers;
	  // cluster manager
	  var n = 0;
	  //const workers = self.workers;
	
	  _cluster2.default.setupMaster({
	    silent: false
	  });
	
	  _cluster2.default.on('listening', function (worker, address) {
	    console.log('A worker is now connected to ' + address.address + ':' + address.port);
	  });
	
	  _cluster2.default.on('online', function (worker) {
	    if (n === numWorkers) {
	      console.log('cluster: All workers online');
	      onReady();
	      return;
	    }
	    console.log('cluster: Worker ' + worker.process.pid + ' is online');
	    if (worker.setMaxListeners) worker.setMaxListeners(0);
	    workers.push(worker);
	    n++;
	    //worker.on('message', x => console.log('worker: ', x));
	  });
	
	  _cluster2.default.on('error', function (x) {
	    throw new Error(x);
	  });
	
	  /*cluster.on('disconnect', function(x) {
	    console.log('disconnect');
	    throw new Error(x)
	  });
	   cluster.on('exit', function(x) {
	    console.log('exit');
	    throw new Error(x)
	  });*/
	
	  for (var i = 0; i <= numWorkers; i++) {
	    var f = _cluster2.default.fork();
	    //console.log('f', f.process.pid)
	    if (f.process.stdout) f.process.stdout.on('data', function (data) {
	      // output from the child process
	      console.log('>>> ' + data);
	    });
	  }
	}
	
	function _clusterMapObs(self, obs, data, funcName, jobIndex, worker) {
	  worker.on('message', function handler(_ref2) {
	    var rdata = _ref2.rdata;
	    var id = _ref2.id;
	
	    if (id !== jobIndex) return; // ignore
	    obs.onNext(rdata);
	    obs.onCompleted();
	    worker.removeListener('message', handler);
	  });
	  worker.send({
	    data: data, id: jobIndex,
	    func: funcName
	  });
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("cluster");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ProcCluster;
	
	var _cluster = __webpack_require__(5);
	
	var _cluster2 = _interopRequireDefault(_cluster);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _express = __webpack_require__(8);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _bodyParser = __webpack_require__(9);
	
	var _bodyParser2 = _interopRequireDefault(_bodyParser);
	
	var _requestJson = __webpack_require__(10);
	
	var _requestJson2 = _interopRequireDefault(_requestJson);
	
	var _connectTimeout = __webpack_require__(11);
	
	var _connectTimeout2 = _interopRequireDefault(_connectTimeout);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var app = (0, _express2.default)();
	app.use((0, _connectTimeout2.default)('600s'));
	app.use(_bodyParser2.default.json());
	
	function ProcCluster(options) {
	  console.log('--WIP--', options);
	
	  this.options = Object.assign({
	    clients: ['http://localhost:8090/'],
	    port: 8090
	  }, options || {});
	  if (!Array.isArray(this.options.clients)) this.options.clients = [this.options.clients];
	
	  this.clusterMapObs = _clusterMapObs.bind(this);
	  this.setupChild = _setupChild.bind(this);
	  this.startWorkers = _startWorkers.bind(this);
	  this.killall = _killall.bind(this);
	  this.isMasterCheck = _isMasterCheck.bind(this);
	}
	
	function _isMasterCheck(options, cb) {
	  console.log('cluster: listening port:', this.options.port);
	  var picked = false;
	
	  app.get('/be/master/', function (req, res) {
	    if (picked) {
	      console.log('cluster: already picked as master');
	      return;
	    } else picked = true;
	    options.isMaster = true;
	    options.isSlave = false;
	
	    res.send('master elected');
	    cb(true);
	  });
	
	  app.get('/be/slave/', function (req, res) {
	    if (picked) {
	      console.log('cluster: already picked as master');
	      return;
	    } else picked = true;
	    options.isMaster = false;
	    options.isSlave = true;
	
	    res.send('slave elected');
	    cb(false);
	  });
	
	  app.listen(this.options.port);
	}
	
	function _killall(self) {
	  //_.forEach(self.workers, x => x.kill());
	}
	
	function _setupChild(self, work) {
	  console.log('_setupChild');
	  var requests = {};
	  work.concatMap(self.childWork, function (y, x) {
	    return {
	      data: x,
	      id: y.id
	    };
	  }).subscribe(function (_ref) {
	    var data = _ref.data;
	    var id = _ref.id;
	
	    if (requests[id] === undefined) throw new Error('request id not issued ' + id);
	    requests[id].send({ data: data, id: id });
	  }, function (x) {
	    return console.log('Net Child ' + process.pid + ' err', x);
	  });
	
	  app.post('/work', function (req, res) {
	    var _req$body = req.body;
	    var func = _req$body.func;
	    var data = _req$body.data;
	    var id = _req$body.id;
	
	    var workParams = { func: func, data: data, id: id };
	    console.log('work recieved', workParams);
	    requests[id] = res;
	    work.onNext(workParams);
	    //res.send('slave elacted'); // TODO
	  });
	}
	
	function _startWorkers(self, workers, onReady) {
	  console.log('_startWorkers');
	  //const spread = self.options.spread;
	
	  _lodash2.default.forEach(this.options.clients, function (c) {
	    var worker = { url: c };
	    worker.client = _requestJson2.default.createClient(worker.url);
	    workers.push(worker);
	  });
	  console.log('workers', workers);
	  setTimeout(onReady, 3000);
	}
	
	function _clusterMapObs(self, obs, data, func, id, worker) {
	  worker.client.post('work', { func: func, data: data, id: id }, function (err, res, body) {
	    if (self._options) console.log('cluster: master recieved:', err, res.statusCode, body);
	    obs.onNext(body.data);
	    obs.onCompleted();
	  });
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("request-json");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("connect-timeout");

/***/ }
/******/ ])));
//# sourceMappingURL=rxjs-cluster.js.map