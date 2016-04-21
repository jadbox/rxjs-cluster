import Rx from 'rx';
import cluster from 'cluster';
import hash from 'string-hash';
import _ from 'lodash';

const Observable = Rx.Observable;
const observableProto = Observable.prototype;

export default function Cluster(options) {
  this.workers = [];
  this.childEntries = {};
  this._options = options || {};
  this.n = 0; // round-robin scheduling
  this.work = new Rx.Subject(); // Children work

  const that = this;
  this.startWorkers = _startWorkers.bind(this);
  this.clusterMap = function(x, y, z) {
    const ___clusterMap = _clusterMap.bind(this);
    return ___clusterMap(that, x, y, z)
  };
  this.setupChild = _setupChild.bind(this);
  this.childWork = _childWork.bind(this);
  this.entry = _entry.bind(this);
  this.getWorkers = _getWorkers.bind(this);
  this.killall = _killall.bind(this);
}



function _startWorkers(numWorkers, onReady, options) {
    // cluster manager
    var n = 0;
    const workers = this.workers;

    cluster.setupMaster({
      silent:false
    });

    cluster.on('listening', (worker, address) => {
      console.log(`A worker is now connected to ${address.address}:${address.port}`);
    });

    cluster.on('online', function(worker) {
        if (n === numWorkers) {
            console.log('cluster: All workers online');
            onReady();
            return;
        }
        console.log('cluster: Worker ' + worker.process.pid + ' is online');
        if (worker.setMaxListeners) worker.setMaxListeners(0);
        workers.push(worker);
        n++;
        //worker.on('message', x => console.log('worker: ', x));
    });

    cluster.on('error', function(x) {
      throw new Error(x)
    });

    /*cluster.on('disconnect', function(x) {
      console.log('disconnect');
      throw new Error(x)
    });

    cluster.on('exit', function(x) {
      console.log('exit');
      throw new Error(x)
    });*/

    for (var i = 0; i <= numWorkers; i++) {
        const f = cluster.fork();
        //console.log('f', f.process.pid)
        if(f.process.stdout) f.process.stdout.on('data', function(data) {
          // output from the child process
          console.log('>>> '+ data);
        });
    }
}

function _setupChild(options) {
    this.work.concatMap(this.childWork, (y, x) => ({
        data: x,
        id: y.id
    }))
        .subscribe(
            ({
                data, id
            }) => process.send({
                rdata: data,
                id
            }), (x) => console.log('Child ' + process.pid + ' err', x)
    )
    const that = this;
    process.on('message', function onChildMessage(x) {
      that.work.onNext(x);
    }); // push work unto task stream
}

function _childWork({
    data, id, func
}) {
    const funcRef = this.childEntries[func];

    if (!funcRef) {
        console.log('Function not found in childMethod lookup:', func)
        throw new Error('Function not found in childMethod lookup: '+ func);
        return;
    }

    const exec = funcRef(data);

    if (!exec.subscribe) {
        return Rx.Observable.just(exec);
    } else return exec.first();
}

/*
	@param numWorkers number of cpus
	@param entryFun the master entry function
	@param options options object
*/
function _entry(numWorkers, entryFun, childMethods, options) {
    options = options || {};
    if (typeof numWorkers === 'function') {
        childMethods = entryFun;
        entryFun = numWorkers;
        const cpus = require('os').cpus().length;
        numWorkers = cpus;

    }

    const childEntries = this.childEntries;
    _.forEach(childMethods, (v, k) => {
        if (v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
    });

    const isMaster = this._options.isMaster || cluster.isMaster;

    // Child entry point
    if (!isMaster) {
        this.setupChild(options);
        return;
    }

    // Master entry point
    if (isMaster && typeof entryFun === 'function') {
        this.startWorkers(numWorkers, entryFun, options);
    }
}


function _getWorkers() {
    return this.workers;
}


function _killall() {
    _.forEach(this.workers, x => x.kill());
}

/*
	@param funcName function to invoke
	@param nodeSelector (optional) (function | string | int) used to pick node. If function, the value is the stream object and the return is (string | int).
*/
function _clusterMap(that, funcName, nodeSelector) {
    	let key = null;
    	if(nodeSelector !== undefined && nodeSelector !== null && typeof nodeSelector !== 'function') {
    		key = Number.isInteger(nodeSelector) ? nodeSelector : hash(nodeSelector.toString());
    		nodeSelector = null;
    	}
      const workers = that.workers;
      //const that = this;
      return this.flatMap(data => Rx.Observable.create(o => {
            if (nodeSelector) {
            	const nodeKey = nodeSelector(data);
                key = Number.isInteger(nodeKey) ? nodeKey : hash(nodeKey.toString());
            }

            const workerIndex = key ? (key % workers.length) : (that.n++ % workers.length);
            //console.log(workerIndex, n, workers.length);
            //n++;
            //if( n === Number.MAX_SAFE_INTEGER) x = Number.MIN_SAFE_INTEGER; // should be safe
            //console.log(workers.length, workerIndex, x);
            const worker = workers[workerIndex];

            worker.jobIndex = worker.jobIndex || 0;
            const jobIndex = worker.jobIndex;
            worker.jobIndex++;

            worker.on('message', function handler({
                rdata, id
            }) {
                if (id !== jobIndex) return; // ignore
                o.onNext(rdata);
                o.onCompleted();
                worker.removeListener('message', handler);
            });
            worker.send({
                data, id: jobIndex,
                func: funcName
            });

    }))
};
