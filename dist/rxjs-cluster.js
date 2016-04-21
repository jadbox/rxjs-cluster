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
	exports.default = Cluster;
	
	var _rx = __webpack_require__(1);
	
	var _rx2 = _interopRequireDefault(_rx);
	
	var _stringHash = __webpack_require__(3);
	
	var _stringHash2 = _interopRequireDefault(_stringHash);
	
	var _lodash = __webpack_require__(4);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _ProcCluster = __webpack_require__(6);
	
	var _ProcCluster2 = _interopRequireDefault(_ProcCluster);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Observable = _rx2.default.Observable;
	var observableProto = Observable.prototype;
	
	function Cluster(options) {
	    var _this = this;
	
	    this.workers = [];
	    this.childEntries = {};
	    this._options = options = options || {};
	    if (!options.system) options.system = new _ProcCluster2.default();
	    var sys = this.sys = options.system;
	
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
	function _entry(numWorkers, entryFun, childMethods, options) {
	    options = options || {};
	    if (typeof numWorkers === 'function') {
	        childMethods = entryFun;
	        entryFun = numWorkers;
	        var cpus = __webpack_require__(5).cpus().length;
	        numWorkers = cpus;
	    }
	
	    var childEntries = this.childEntries;
	    _lodash2.default.forEach(childMethods, function (v, k) {
	        if (v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
	    });
	
	    var isMaster = this._options.isMaster || this.sys.isMaster;
	
	    // Child entry point
	    if (!isMaster) {
	        this.setupChild(this, this.work, options);
	        return;
	    }
	
	    // Master entry point
	    if (isMaster && typeof entryFun === 'function') {
	        this.startWorkers(this, numWorkers, entryFun, options);
	    }
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

	module.exports = require("cluster");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("string-hash");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ProcCluster;
	
	var _cluster = __webpack_require__(2);
	
	var _cluster2 = _interopRequireDefault(_cluster);
	
	var _lodash = __webpack_require__(4);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function ProcCluster() {
	  this.clusterMapObs = _clusterMapObs.bind(this);
	  this.setupChild = _setupChild.bind(this);
	  this.startWorkers = _startWorkers.bind(this);
	  this.killall = _killall.bind(this);
	  this.isMaster = _cluster2.default.isMaster;
	}
	
	function _killall(self) {
	  _lodash2.default.forEach(self.workers, function (x) {
	    return x.kill();
	  });
	}
	
	function _setupChild(self, work, options) {
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
	
	function _startWorkers(self, numWorkers, onReady, options) {
	  // cluster manager
	  var n = 0;
	  var workers = self.workers;
	
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

/***/ }
/******/ ])));
//# sourceMappingURL=rxjs-cluster.js.map