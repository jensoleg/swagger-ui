'use strict';

var path = require('path');
var express = require('express');
var cluster = require('cluster');

var WORKERS = process.env.WEB_CONCURRENCY || 1;

if (cluster.isMaster) {

  for (var i = 0; i < WORKERS; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(worker) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  var app = express();
  app.use(express.static(path.join(__dirname, '/dist')));
  app.listen(process.env.PORT || 8080);
}