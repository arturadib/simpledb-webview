const port = 8989;
const ip = '192.168.1.101';

var express = require('express');
var simpledb = require('simpledb');

var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/list.domains', function(req, res){
  var sdb = new simpledb.SimpleDB({ keyid:req.query.keyid, secret: req.query.secret});  
  sdb.listDomains(function(_err, _res, _meta){
    res.send(JSON.stringify(_res));
  });
});

app.get('/get.items', function(req, res){
  var sdb = new simpledb.SimpleDB({ keyid:req.query.keyid, secret: req.query.secret});  
  sdb.select("select * from "+req.query.domain+" limit 200", function(_err, _res, _meta){
    res.send(JSON.stringify(_res));
  });
});

app.listen(port, ip);

console.log('Listening on http://'+ip+':'+port);
