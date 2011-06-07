var port = 8989;

var express = require('express');
var simpledb = require('simpledb');

var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + '/public'));

//
// API : get.domains
//
app.get('/get.domains', function(req, res){
  var sdb = new simpledb.SimpleDB({ keyid:req.query.keyid, secret: req.query.secret});  
  sdb.listDomains(function(errDomains, resDomains, metaDomains){
    if (errDomains) throw errDomains.Message;
    
    // Gets all counts, in parallel
    var totalResponses = 0;
    var domainsObj = [];
    for (var i=0;i<resDomains.length;i++) {
      (function(){ // anonymous wrapper for keeping track of counter
        var j=i;
        sdb.select("select count(*) from `"+resDomains[j] + "`", function(errCount, resCount, metaCount){
          if (errCount) throw errCount.Message;

          if (resCount.length === 0) {
            throw "Got empty response for domain: "+resDomains[j];
          }
          
          var obj = {};
          obj.name = resDomains[j];
          obj.count = resCount[0].Count;
          domainsObj.push(obj);
        
          totalResponses++;
          if (totalResponses == resDomains.length) { // last one?
            res.send(domainsObj);
          }
        }); // sdb.select
      })(); // anonymous wrapper
    }    
  });
});

//
// API : get.items
//
app.get('/get.items', function(req, res){
  var sdb = new simpledb.SimpleDB({ keyid:req.query.keyid, secret: req.query.secret});  
  sdb.select("select * from `"+req.query.domain+"` limit 1000", function(_err, _res, _meta){
    res.send(_res);
  });
});

app.listen(port);

console.log('Listening on port '+port);
