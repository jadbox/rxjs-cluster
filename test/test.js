import Rx from 'rx';
import RC from '../src';
import assert from 'assert';
import cluster from 'cluster';

const pc = new RC( {  } );
const clusterMap = pc.clusterMap;

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
	return Observable.from(['Jonathan', 'James', 'Edwin'])
		::clusterMap('childTest')
		.do( x => console.log('1', x))
		/*.subscribe(
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() { }
		);*/


}

function master2() {
	console.log('master2');
	return Observable.from(['Jonathan', 'James', 'Edwin'])
		::clusterMap('childTest$')
		.do( x => console.log('2', x))
		/*.subscribe(
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() {
				//master3();
			}
		);*/
}

function master3() {
	console.log('master3');
	return Observable.from(['Jonathan', 'James', 'Edwin'])
		::clusterMap('childTest', 199) // use node index of hash id 199
		.do( x => console.log('3', x))
		/*.subscribe(
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() {
				console.log('Completed 4');
				//master4();
			}
		);*/


}

function master4() {
	console.log('master4');
	return Observable.from(['Jonathan', 'James', 'Edwin', 'Edwin', 'Edwin', 'Flipper'])
		::clusterMap('childTest$', x=>x) // use the name as the node index hash
		.do( x => console.log('4', x))
		/*.subscribe(
			function(x) { console.log(x); },
			function(x) { console.log('Err ' + x); },
			function() {
				console.log('Completed');
				//rc.killall(); // kill all workers, clusterMap will no longer work
				//_done();
				//done();
			}
		);*/
}

function start() {
	_done();
	console.log('--', cluster.isMaster)
}

if(cluster.isMaster) {
	describe('## rx master', function() {
		this.timeout(9900);
		before(function(done) {
      //  setTimeout(done, 1000);
			_done = done;
    });

				it('master entry', function (done) {
					console.log('STARTING')
					master().concatMap(master2).toArray()
					.concatMap(master3).toArray()
					.concatMap(master4).toArray()
					.subscribe(
						x=>x
						,x=> { throw new Error(x) }
						,x => {
						console.log('completed')
						pc.killall(); // kill all workers, clusterMap will no longer work
						done();
					})
					//_done = done;
				})
	})
}
else {
	describe('## rx client', function() {
		this.timeout(9900);
		before(function(done) {
      //  setTimeout(done, 1000);

    });
		it('client entry', function (done) {
		});
	});
}

pc.entry(3, start, { childTest: childTest, childTest$: childTest$ });

// Define number of workers, master entry point, worker functions
var _done;

// Or define leave the default number of workers to # of cpu cores
// rc.entry(master, { childTest: childTest, childTest$: childTest$ });
