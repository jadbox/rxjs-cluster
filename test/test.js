var Rx = require('rx');
var rc = require('../dist/rxjs-cluster.js');

var Observable = Rx.Observable;

// Child function that returns raw value
function childTest(x) {
	return "hello " + x;
}

// Child function that returns an Observable
function childTest$(x) {
	return Rx.Observable.range(0,5).map("hello " + x).toArray();
}

function master() {
	Observable.just('Jonathan')
		.clusterMap('childTest')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { console.log('Completed'); }
		);

	Observable.just('Jonathan')
		.clusterMap('childTest$')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { 
				console.log('Completed'); 
				rc.killall(); // kill all workers, clusterMap will no longer work
			}
		);
}

// Define number of workers, master entry point, worker functions
rc.entry(3, master, { childTest: childTest, childTest$: childTest$ });

