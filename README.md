# rxjs-cluster

_[Moore's law ceiling](http://www.agner.org/optimize/blog/read.php?i=417): "The biggest potential for improved performance is now, as I see it, on the software side [...] with parallelism which has so far not been [broadly] implemented."_

_(WIP: Working Alpha)_

Using Rx, maximize CPU usage in Node by using the new clusterMap that uses cluster/forked processes

```
var Rx = require('rx');
var rc = require('rxjs-cluster'); // import

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
rc.entry(3, master, { 'childTest': childTest, 
                      'childTest$': childTest$ });

// Or define leave the default number of workers to # of cpu cores
// rc.entry(master, { 'childTest': childTest, 'childTest$': childTest$ });

```
