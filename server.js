//
// server.js for SimpleDB WebView
//

// We keep our own modules separate from npm modules (which go into node_modules)
require.paths.unshift(__dirname + "/custom_modules/");

var express = require('express');
var simpledb = require('simpledb');

// Heroku specifies a PORT environment variable
var port = process.env.PORT || 8989;

var app = express.createServer();
app.use(express.cookieParser());
app.use(app.router);

//
// Static server
//
app.use(express.static(__dirname + '/public'));


//
// API: api/select
//
app.get('/api/select', function(req, res){
  var cookie = JSON.parse( req.cookies['aws-credentials'] );
  var creds = { keyid:cookie.keyid, secret:cookie.secret };
  var sdb = new simpledb.SimpleDB(creds);  

  sdb.select(req.query.queryStr, function(_err, _res, _meta){
    res.send(_res);
  });
});


//
// API: api/domains
//
app.get('/api/domains', function(req, res){
  var cookie = JSON.parse( req.cookies['aws-credentials'] );
  var creds = { keyid:cookie.keyid, secret:cookie.secret };
  var sdb = new simpledb.SimpleDB(creds);  

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

app.listen(port);

console.log('Listening on port '+port);
