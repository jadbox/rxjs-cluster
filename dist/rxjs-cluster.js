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
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.entry = entry;
	exports.getWorkers = getWorkers;
	exports.killall = killall;
	// Rx global hunting
	// Todo: remove in favor of bind?
	var objectTypes = { 'function': true, 'object': true };
	
	var root = objectTypes[typeof window === 'undefined' ? 'undefined' : _typeof(window)] && window || undefined,
	    freeGlobal = objectTypes[typeof global === 'undefined' ? 'undefined' : _typeof(global)] && global;
	
	if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) root = freeGlobal;
	
	root = root || global || window || undefined;
	var Rx = root.Rx || __webpack_require__(1);
	
	// Main
	var cluster = __webpack_require__(2);
	
	var _ = __webpack_require__(3);
	
	var Observable = Rx.Observable;
	var observableProto = Observable.prototype;
	
	var workers = [];
	var childEntries = {};
	
	function startWorkers(numWorkers, onReady) {
		// cluster manager
		var n = 0;
		cluster.on('online', function (worker) {
			if (n === numWorkers) {
				onReady();return;
			}
			console.log('Worker ' + worker.process.pid + ' is online');
			if (worker.setMaxListeners) worker.setMaxListeners(0);
			workers.push(worker);
			n++;
			//worker.on('message', x => console.log('worker: ', x));
		});
	
		for (var i = 0; i <= numWorkers; i++) {
			cluster.fork();
		}
	}
	
	// Children work
	var work = new Rx.Subject();
	function setupChild() {
		work.concatMap(childWork, function (y, x) {
			return { data: x, id: y.id };
		}).subscribe(function (_ref) {
			var data = _ref.data;
			var id = _ref.id;
			return process.send({ rdata: data, id: id });
		}, function (x) {
			return console.log('Child ' + process.pid + ' err', x);
		});
		process.on('message', function (x) {
			return work.onNext(x);
		}); // push work unto task stream
	}
	
	function childWork(_ref2) {
		var data = _ref2.data;
		var id = _ref2.id;
		var func = _ref2.func;
	
		var funcRef = childEntries[func];
	
		if (!funcRef) {
			console.log('Function not found in childMethod lookup:', func);
			return;
		}
	
		var exec = funcRef(data);
	
		if (!exec.subscribe) {
			return Rx.Observable.just(exec);
		} else return exec.first();
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
	
	function getWorkers() {
		return workers;
	}
	
	function killall() {
		_.forEach(workers, function (x) {
			return x.kill();
		});
	}
	
	var n = 0; // round-robin scheduling
	Observable.clusterMap = observableProto.clusterMap = function (funcName) {
		return this.flatMap(function (data) {
			return Rx.Observable.create(function (o) {
				var workerIndex = n % workers.length;
				//console.log(workerIndex, n, workers.length);
				n++;
				//if( n === Number.MAX_SAFE_INTEGER) x = Number.MIN_SAFE_INTEGER; // should be safe
				//console.log(workers.length, workerIndex, x);
				var worker = workers[workerIndex];
	
				worker.jobIndex = worker.jobIndex || 0;
				var jobIndex = worker.jobIndex;
				worker.jobIndex++;
	
				worker.send({ data: data, id: jobIndex, func: funcName });
				worker.on('message', function handler(_ref3) {
					var rdata = _ref3.rdata;
					var id = _ref3.id;
	
					if (id !== jobIndex) return; // ignore
					worker.removeListener('message', handler);
					o.onNext(rdata);
					o.onCompleted();
				});
			});
		});
	};
	
	var clusterMap = exports.clusterMap = observableProto.clusterMap;

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

	module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ }
/******/ ])));
//# sourceMappingURL=rxjs-cluster.js.map