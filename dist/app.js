require("source-map-support").install();
(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	eval("/* WEBPACK VAR INJECTION */(function(module) {\"use strict\";\n\nexports.handler = function (event, context) {\n\tvar f = function f(x) {\n\t\treturn \"hello \" + x;\n\t};\n\tconsole.log(f(\"world!\"));\n};\n\n// Local direct test case\nif (!module.parent) {\n\texports.handler({}, { done: function done(err, x) {\n\t\t\treturn console.log(err + \", \" + x);\n\t\t}\n\t});\n}\n/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanM/OTU1MiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQUUsT0FBTyxFQUFFO0FBQzFDLEtBQU0sQ0FBQyxHQUFHLFNBQUosQ0FBQyxDQUFHLENBQUM7U0FBSSxRQUFRLEdBQUcsQ0FBQztFQUFBLENBQUM7QUFDNUIsUUFBTyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUU7Q0FDMUI7OztBQUdELElBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ2xCLFFBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUNqQixFQUFFLElBQUksRUFBRSxjQUFDLEdBQUcsRUFBRSxDQUFDO1VBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBSSxHQUFHLFVBQUssQ0FBQyxDQUFHO0dBQUE7RUFDM0IsQ0FBRSxDQUFDIiwiZmlsZSI6IjAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnRzLmhhbmRsZXIgPSBmdW5jdGlvbihldmVudCwgY29udGV4dCkge1xuXHRjb25zdCBmID0geCA9PiBcImhlbGxvIFwiICsgeDtcblx0Y29uc29sZS5sb2coIGYoXCJ3b3JsZCFcIikgKVxufVxuXG4vLyBMb2NhbCBkaXJlY3QgdGVzdCBjYXNlXG5pZighbW9kdWxlLnBhcmVudCkge1xuXHRleHBvcnRzLmhhbmRsZXIoe30sIFxuXHRcdHsgZG9uZTogKGVyciwgeCkgPT4gXG5cdFx0XHRjb25zb2xlLmxvZyhgJHtlcnJ9LCAke3h9YCkgXG5cdFx0fSApO1xufVxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2luZGV4LmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==");

/***/ },
/* 1 */
/***/ function(module, exports) {

	eval("module.exports = function(module) {\r\n\tif(!module.webpackPolyfill) {\r\n\t\tmodule.deprecate = function() {};\r\n\t\tmodule.paths = [];\r\n\t\t// module.parent = undefined by default\r\n\t\tmodule.children = [];\r\n\t\tmodule.webpackPolyfill = 1;\r\n\t}\r\n\treturn module;\r\n}\r\n\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzP2MzYzIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiMS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XHJcblx0aWYoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcclxuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xyXG5cdFx0bW9kdWxlLnBhdGhzID0gW107XHJcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcclxuXHRcdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xyXG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XHJcblx0fVxyXG5cdHJldHVybiBtb2R1bGU7XHJcbn1cclxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9");

/***/ }
/******/ ])));