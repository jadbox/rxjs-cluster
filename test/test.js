var Rx = require('rx');
var rc = require('../dist/rxjs-cluster.js');

var Observable = Rx.Observable;

function childTest(x) {
	return "hello " + x;
}

function master() {
	Observable.just('Jonathan')
		.clusterMap('childTest')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { console.log('Completed'); }
		);
}

rc.entry(3, master, { childTest: childTest });

