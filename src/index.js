const cluster = require('cluster');
const Rx = require('rx');
const _ = require('lodash');

const Observable = Rx.Observable;
const observableProto = Observable.prototype;

const workers = [];
const childEntries = {};

function startWorkers(numWorkers, onReady) {
  // cluster manager
  for(var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  var n = 0;
  cluster.on('online', function(worker) {
    n++;
    if(n === numWorkers) onReady();
    console.log('Worker ' + worker.process.pid + ' is online');
    if(worker.setMaxListeners) worker.setMaxListeners(0);
    workers.push( worker );

    //worker.on('message', x => console.log('worker: ', x));
  });
}

// Children work
const work = new Rx.Subject();
function setupChild() {
	work.flatMap(childWork, (y,x) => ({ data: x, id: y.id }))
		.subscribe(
		    ({data, id}) => process.send({rdata: data, id}),
		    ({data, id}) => console.log('child err', data, id)
 	)
 	process.on('message', x => work.onNext(x)); // push work unto task stream
}

function childWork({data, id, func}) {
	const funcRef = childEntries[func];
	if(!funcRef) {
		console.log('Function not found in childMethod lookup:', func)
		return;
	}

	const exec = funcRef(data);

	if(!exec.subscribe) {
		return Rx.Observable.just( exec );
	}
	else return exec.first();
}

/*
	@param numWorkers number of cpus
	@param entryFun the master entry function
*/
export function entry(numWorkers, entryFun, childMethods) {
	if(typeof numWorkers === 'function') {
		childMethods = entryFun;
		entryFun = numWorkers;
		const cpus = require('os').cpus().length;
		numWorkers = cpus;

	}

	_.forEach(childMethods, (v,k) => {
		if(v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
	});

	// Child entry point
	if(!cluster.isMaster) {
		setupChild();
		return;
	}

	// Master entry point
	if(cluster.isMaster && typeof entryFun === 'function') {
		startWorkers(numWorkers, entryFun);
	}
}

export function getWorkers() {
	return workers;
}

export function killall() {
  _.forEach(workers, x => x.kill() );
}

var n = 0; // round-robin scheduling
Observable.clusterMap = observableProto.clusterMap = function(funcName) {
	return this.flatMap( data => Rx.Observable.create(function(o) {
      const workerIndex = n % workers.length;
      n++;
      //if( n === Number.MAX_SAFE_INTEGER) x = Number.MIN_SAFE_INTEGER; // should be safe
      //console.log(workers.length, workerIndex, x);
      const worker = workers[workerIndex];

      worker.jobIndex = worker.jobIndex || 0;
      const jobIndex = worker.jobIndex;
      worker.jobIndex++;

      worker.send({data, id: jobIndex, func: funcName });
      worker.on('message', function handler({rdata, id}) {
        if( id !== jobIndex ) return; // ignore
        worker.removeListener('message', handler);
        o.onNext(rdata);
        o.onCompleted();
      } )
    }))
}