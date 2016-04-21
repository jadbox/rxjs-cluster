import cluster from 'cluster';
import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'request-json';
import timeout from 'connect-timeout';

const app = express();
app.use(timeout('600s'));
app.use(bodyParser.json());

export default function ProcCluster(options) {
  console.log('--WIP--');
  this.options = options;
  this.options.url = this.options.url || 'http://localhost:8090/';
  this.options.port = this.options.port || 8090;


  this.clientSend = request.createClient(this.options.url + 'send');

  this.clusterMapObs = _clusterMapObs.bind(this);
  this.setupChild = _setupChild.bind(this);
  this.startWorkers = _startWorkers.bind(this);
  this.killall = _killall.bind(this);
  this.isMasterCheck = _isMasterCheck.bind(this);
}

function _isMasterCheck(options, cb) {
  console.log('listening');
  let picked = false;

  app.get('/be_master', function(req, res) {
    if(picked) return;
    picked = true;
    console.log('master elacted');
    res.send('master elacted');
    cb(true);
  });

  app.get('/be_slave', function(req, res) {
    if(picked) return;
    picked = true;
    console.log('slave elacted');
    res.send('slave elacted');
    cb(false);
  });

  app.listen(this.options.port);
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

  app.post('/work', function(req, res) {
    const x = req.body;
    work.onNext(x);
    res.send('slave elacted');
  });

}

function _startWorkers(self, workers, onReady, options) {
  const spread = options.spread;

}

function _clusterMapObs(self, obs, data, funcName, jobIndex, worker) {
  this.clientSend.post({method:funcName, data, jobIndex}, x => {
    obs.onNext(x);
    obs.onCompleted();
  })
}
