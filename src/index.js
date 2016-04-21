import Rx from 'rx';
import hash from 'string-hash';
import _ from 'lodash';
import ProcCluster from './ProcCluster'

const Observable = Rx.Observable;
const observableProto = Observable.prototype;

export default function Cluster(options) {
  this.workers = [];
  this.childEntries = {};
  this._options = options = options || {};
  if(!options.system) options.system = new ProcCluster();
  //if(!options.spread) options.spread = require('os').cpus().length;

  const sys = this.sys = options.system;

  this.n = 0; // round-robin scheduling
  this.work = new Rx.Subject(); // Children work

  const that = this;
  this.startWorkers = sys.startWorkers;
  this.clusterMap = function(x, y, z) {
    const ___clusterMap = _clusterMap.bind(this);
    return ___clusterMap(that, x, y, z)
  };

  this.setupChild = sys.setupChild;
  this.childWork = _childWork.bind(this);
  this.entry = _entry.bind(this);
  this.getWorkers = _getWorkers.bind(this);
  this.killall = x => sys.killall(this);
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
function _entry(entryFun, childMethods) {
  const options = this._options;

  const childEntries = this.childEntries;
  _.forEach(childMethods, (v, k) => {
    if (v && (v.subscribe || typeof v === 'function')) childEntries[k] = v;
  });

  const isMasterCheck = this._options.isMaster ? x => true : this.sys.isMasterCheck;
  //const isMaster = this._options.isMaster || this.sys.isMaster;
  isMasterCheck(options, isMaster => {

    // Child entry point
    if (!isMaster) {
      this.setupChild(this, this.work, options);
      return;
    }

    // Master entry point
    if (isMaster && typeof entryFun === 'function') {
      this.startWorkers(this, this.workers, entryFun, options);
    }
  });
}

function _getWorkers() {
  return this.workers;
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
  return this.flatMap(data => Rx.Observable.create(obs => {
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

    that.sys.clusterMapObs(that, obs, data, funcName, jobIndex, worker);
  }))
};
