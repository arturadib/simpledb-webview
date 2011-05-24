//
// Generates a test data set in domain 'simpledb_webview'
//

var credentials = require(process.env.HOME + '/.aws-credentials.js'); // see included example aws-credentials.js
var simpledb = require('simpledb');
var sdb = new simpledb.SimpleDB(credentials);  

process.stdin.resume();
process.stdin.setEncoding('utf8');
console.log('');
console.log('Are you sure? This will erase and create a new domain called simpledb_webview with lots of new items in it');
console.log('[yes/NO]');
process.stdin.once('data', function (chunk) {
  var chunkMinusNewLine = chunk.substr(0,chunk.length-1);
  if (chunkMinusNewLine === 'yes') {
    console.log('... inserting data');  
    globalWrapper();
  }
  else {
    console.log('... nothing done');  
  }
  process.stdin.pause();
});

function globalWrapper(){
  function resetDB(callback){
    sdb.deleteDomain('simpledb_webview', function(err,res,meta){
      if (err) callback(err);
      sdb.createDomain('simpledb_webview', function(err,res,meta){
        callback(err);
      })
    });  
  }

  function genRandomWords(){
    var words = '';
    for (key in process) {
      if (Math.random() < 0.2) { // pick 20% of the words at random
        words += key+' ';
      }
    }
    return words;
  }


  resetDB(function(err){
    if (err) throw err;

    for (var i=0;i<10;i++) {
      (function(){ // new scope, to access current i
        var _i = i;

        var vector = [];
        for (var j=0;j<25;j++) {
          (function(){
            var seed = { a_column:Math.random().toString()*1000, b_column:genRandomWords(), c_column:Math.random().toString()*1000, d_column:genRandomWords() };
            seed['$ItemName'] = Math.random().toString();
            vector.push(seed);      
          })();
        }

        sdb.batchPutItem('simpledb_webview', vector, function(err,res,meta){
          if (err) throw err;
          console.log('... i='+_i+' done.');
        });    
      })();
    }
  });
}
