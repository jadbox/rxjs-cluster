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
	console.log('master');
	Observable.from(['Jonathan', 'James', 'Edwin'])
		.clusterMap('childTest')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { master2(); }
		);

	
}

function master2() {
	console.log('master2');
	Observable.from(['Jonathan', 'James', 'Edwin'])
		.clusterMap('childTest$')
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { 
				master3();
			}
		);
}

function master3() {
	console.log('master3');
	Observable.from(['Jonathan', 'James', 'Edwin'])
		.clusterMap('childTest', 199) // use node index of hash id 199
		.subscribe( 
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { console.log('Completed'); master4(); }
		);

	
}

function master4() {
	console.log('master4');
	Observable.from(['Jonathan', 'James', 'Edwin', 'Edwin', 'Edwin', 'Flipper'])
		.clusterMap('childTest$', x=>x) // use the name as the node index hash
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
