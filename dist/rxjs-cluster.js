require("source-map-support").install();
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
	exports.entry = entry;
	var cluster = __webpack_require__(1);
	var Rx = __webpack_require__(2);
	var _ = __webpack_require__(3);
	
	var Observable = Rx.Observable;
	var observableProto = Observable.prototype;
	
	var workers = [];
	var childEntries = {};
	
	function startWorkers(numWorkers, onReady) {
		// cluster manager
		for (var i = 0; i < numWorkers; i++) {
			cluster.fork();
		}
		var n = 0;
		cluster.on('online', function (worker) {
			n++;
			if (n === numWorkers) onReady();
			console.log('Worker ' + worker.process.pid + ' is online');
			if (worker.setMaxListeners) worker.setMaxListeners(0);
			workers.push(worker);
	
			//worker.on('message', x => console.log('worker: ', x));
		});
	}
	
	// Children work
	var work = new Rx.Subject();
	function setupChild() {
		work.flatMap(childWork, function (y, x) {
			return { data: x, id: y.id };
		}).subscribe(function (_ref) {
			var data = _ref.data;
			var id = _ref.id;
			return process.send({ rdata: data, id: id });
		}, function (_ref2) {
			var data = _ref2.data;
			var id = _ref2.id;
			return console.log('child err', data, id);
		});
		process.on('message', function (x) {
			return work.onNext(x);
		}); // push work unto task stream
	}
	
	function childWork(_ref3) {
		var data = _ref3.data;
		var id = _ref3.id;
		var func = _ref3.func;
	
		var funcRef = childEntries[func];
		if (!funcRef) {
			console.log('Function not found in childMethod lookup:', func);
			return;
		}
	
		if (!funcRef.subscribe) {
			return Rx.Observable.just(funcRef(data));
		} else return funcRef(data).first();
	}
	
	/*
		@param numWorkers number of cpus
		@param entryFun the master entry function
	*/
	function entry(numWorkers, entryFun, childMethods) {
		if (typeof numWorkers === 'function') {
			childMethods = entryFun;
			entryFun = numWorkers;
			var cpus = __webpack_require__(4).cpus().length;
			numWorkers = cpus;
		}
	
		_.forEach(childMethods, function (v, k) {
			if (v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
		});
	
		// Child entry point
		if (!cluster.isMaster) {
			setupChild();
			return;
		}
	
		// Master entry point
		if (cluster.isMaster && typeof entryFun === 'function') {
			startWorkers(numWorkers, entryFun);
		}
	}
	
	var n = 0; // round-robin scheduling
	Observable.clusterMap = observableProto.clusterMap = function (funcName) {
		return this.flatMap(function (data) {
			return Rx.Observable.create(function (o) {
				var workerIndex = n % workers.length;
				n++;
				//if( n === Number.MAX_SAFE_INTEGER) x = Number.MIN_SAFE_INTEGER; // should be safe
				//console.log(workers.length, workerIndex, x);
				var worker = workers[workerIndex];
	
				worker.jobIndex = worker.jobIndex || 0;
				var jobIndex = worker.jobIndex;
				worker.jobIndex++;
	
				worker.send({ data: data, id: jobIndex, func: funcName });
				worker.on('message', function handler(_ref4) {
					var rdata = _ref4.rdata;
					var id = _ref4.id;
	
					if (id !== jobIndex) return; // ignore
					worker.removeListener('message', handler);
					o.onNext(rdata);
					o.onCompleted();
				});
			});
		});
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("cluster");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("rx");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ }
/******/ ])));
//# sourceMappingURL=rxjs-cluster.js.map