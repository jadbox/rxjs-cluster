'use strict'
var Rx = require('rx');
var rc = require('../dist/rxjs-cluster.js');
var assert = require('assert');

var Observable = Rx.Observable;

// Child function that returns raw value
function childTest(x) {
	return "hello " + x + " from " + process.pid
}

// Child function that returns an Observable
function childTest$(x) {
	return Observable.range(0,3).map("hello " + x + " from " + process.pid).toArray();
}

function master() {
	it('workers returns primitive value', done => {
		Observable.from(['Jonathan', 'James', 'Edwin'])
			.clusterMap('childTest')
			.toArray()
			.subscribe( 
				function(x) { 
					assert.equal(x.length, 3);
					console.log(x); 
				},
				function(x) { console.log('Err ' + x); },
				function() { console.log('Completed'); done(); }
			);
  	})
	
	it('set entry', done => {
		Observable.from(['Jonathan', 'James', 'Edwin'])
			.clusterMap('childTest$')
			.toArray()
			.subscribe( 
				function(x) { console.log(x); },
				function(x) { console.log('Err ' + x); },
				function() { 
					console.log('Completed'); 
					done();
					rc.killall(); // kill all workers, clusterMap will no longer work
				}
			);
		});
}

function tests() {
	console.log('tests started')
	describe('# local Cluster work', () => {
		master();
	});
}
//console.log('-', module.parent.id);
describe('## rxjs-cluster', () => {
	rc.entry(3, tests, { childTest: childTest, childTest$: childTest$ })
})

// Define number of workers, master entry point, worker functions$ });

// Or define leave the default number of workers to # of cpu cores
// rc.entry(master, { childTest: childTest, childTest$: childTest$ });
