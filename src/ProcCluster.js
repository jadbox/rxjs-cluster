import cluster from 'cluster';
import _ from 'lodash';

export default function ProcCluster(options) {
  if(!options.workers) options.workers = require('os').cpus().length;

  this.options = Object.assign({

  }, options);


  this.clusterMapObs = _clusterMapObs.bind(this);
  this.setupChild = _setupChild.bind(this);
  this.startWorkers = _startWorkers.bind(this);
  this.killall = _killall.bind(this);
  this.isMasterCheck = (self, cb) => cb(cluster.isMaster);
}

function _killall(self) {
  _.forEach(self.workers, x => x.kill());
}

function _setupChild(self, work) {
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
          }), (x) => console.log('Child ' + process.pid + ' err', x)
  )

  process.on('message', function onChildMessage(x) {
    work.onNext(x);
  }); // push work unto task stream
}

function _startWorkers(self, workers, onReady) {
  const numWorkers = this.options.workers;
  // cluster manager
  var n = 0;
  //const workers = self.workers;

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

function _clusterMapObs(self, obs, data, funcName, jobIndex, worker) {
  worker.on('message', function handler({
      rdata, id
  }) {
      if (id !== jobIndex) return; // ignore
      obs.onNext(rdata);
      obs.onCompleted();
      worker.removeListener('message', handler);
  });
  worker.send({
      data, id: jobIndex,
      func: funcName
  });
}
