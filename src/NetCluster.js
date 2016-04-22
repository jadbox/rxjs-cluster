import cluster from 'cluster';
import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'request-json';
import timeout from 'connect-timeout';

export default function ProcCluster(options) {
  console.log('--WIP--', options);

  this.options = Object.assign({
    clients: ['http://localhost:8090/'],
    port: 8090
  }, options || {});
  if(!Array.isArray(this.options.clients)) this.options.clients = [ this.options.clients ];
  this.options.port = parseInt(this.options.port);

  this.clusterMapObs = _clusterMapObs.bind(this);
  this.setupChild = _setupChild.bind(this);
  this.startWorkers = _startWorkers.bind(this);
  this.killall = _killall.bind(this);
  this.isMasterCheck = _isMasterCheck.bind(this);

  const app = this.app = express();
  app.use(timeout('600s'));
  app.use(bodyParser.json())
  this.appServer = app.listen(this.options.port);
}

function _isMasterCheck(self, cb) {
  const options = self._options;
  console.log('cluster: listening port:', this.options.port);
  let picked = false;

  this.app.get('/be/master/', function(req, res) {
    if(picked) {
      console.log('cluster: already picked as master');
      return;
    }
    else picked = true;
    options.isMaster = true;
    options.isSlave = false;

    res.send('master elected');
    cb(true);
  });

  this.app.get('/be/slave/', function(req, res) {
    if(picked) {
      console.log('cluster: already picked as master');
      return;
    }
    else picked = true;
    options.isMaster = false;
    options.isSlave = true;

    res.send('slave elected');
    cb(false);
  });
}

function _killall(self) {
  //_.forEach(self.workers, x => x.kill());
}

function _setupChild(self, work) {
  console.log('_setupChild')
  const requests = {};
  work.concatMap(self.childWork, (y, x) => ({
      data: x,
      id: y.id
  }))
      .subscribe(
          ({
              data, id
          }) => {
            if(requests[id] === undefined) throw new Error('request id not issued '+id);
            console.log('cluster: client: responding');
            requests[id].send({data, id});
        }, (x) => console.log('Net Child ' + process.pid + ' err', x)
  )

  console.log('cluster: listening for /work/:', this.options.port);
  this.app.get('/ping/', function(req, res) {
    res.send('ping pong: client');
  });
  this.app.post('/work/', function(req, res) {
    if(!req.body || !req.body.func) {
      res.send('ping work');
      return;
    }
    const {func, data, id} = req.body;
    const workParams = req.body;
    console.log('cluster: work recieved', workParams);
    requests[id] = res;
    work.onNext(workParams);
    //res.send('slave elacted'); // TODO
  });
}

function _startWorkers(self, workers, onReady) {
  console.log('_startWorkers');
  //const spread = self.options.spread;

  _.forEach(this.options.clients, c => {
    const worker = { url: c };
    worker.client = request.createClient( worker.url );
    workers.push( worker );
  });

  this.app.get('/ping/', function(req, res) {
    res.send('ping pong: server');
  });
  //console.log('workers', workers);
  setTimeout(onReady, 3000);
}

function _clusterMapObs(self, obs, data, func, id, worker) {
  console.log('cluster: master sending post:'+worker.url+' rte:work func:' + func + ' id:' + id);
  worker.client.post('work', {func, data, id}, (err, res, body) => {
    if(res && parseInt(res.statusCode)!==200) {
      console.log(res.statusCode+' response from client.')
      return obs.onError(res.statusCode+' response from client.');
    }
    if(err) {
      console.log('err', err);
      return obs.onError(err);
    }
    //if(self._options)
    console.log('cluster: master recieved:', err, res ? res.statusCode : res, func, id);
    obs.onNext(body.data);
    obs.onCompleted();
  })
}
