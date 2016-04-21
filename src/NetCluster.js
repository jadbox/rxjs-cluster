import cluster from 'cluster';
import _ from 'lodash';

export default function ProcCluster() {
  this.clusterMapObs = _clusterMapObs.bind(this);
  this.setupChild = _setupChild.bind(this);
  this.startWorkers = _startWorkers.bind(this);
  this.killall = _killall.bind(this);
  this.isMasterCheck = _isMasterCheck.bind(this);
}

function _isMasterCheck(options, cb) {
  cb();
}

function _killall(self) {
  //_.forEach(self.workers, x => x.kill());
}

function _setupChild(self, work, options) {
  work.concatMap(self.childWork, (y, x) => ({
      data: x,
      id: y.id
  }))
      .subscribe(
          ({
              data, id
          }) => process.send({
              rdata: data,
              id
          }), (x) => console.log('Net Child ' + process.pid + ' err', x)
  )


  //work.onNext(x);
}

function _startWorkers(self, onReady, options) {
  const spread = options.spread;

}

function _clusterMapObs(self, obs, data, funcName, jobIndex, worker) {

}
