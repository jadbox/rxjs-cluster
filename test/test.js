var Rx = require('rx');
var rc = require('../dist/rxjs-cluster.js');

var Observable = Rx.Observable;

// Child function that returns raw value
function childTest(x) {
	return "hello " + x + " from " + process.pid
}

// Child function that returns an Observable
function childTest$(x) {
	return Rx.Observable.range(0,3).map("hello " + x + " from " + process.pid).toArray();
}

function master() {
	Observable.from(['Jonathan', 'James', 'Edwin'])
		.clusterMap('childTest')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { console.log('Completed'); }
		);

	Observable.from(['Jonathan', 'James', 'Edwin'])
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

// Or define leave the default number of workers to # of cpu cores
// rc.entry(master, { childTest: childTest, childTest$: childTest$ });
