// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 80;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here
router.get('/start', function (req, res){
       var spawn = require('child_process').spawn,
       ps    = spawn('./run.sh', []),
       grep  = spawn('grep', ['ssh']);
       ps.stdout.on('data', function (data) {
               output = '';
               output += data;
               console.log('{"data":"'+output+'"}');
       });
return res.send('{"success":"true"}');
});



router.get('/spamFilter', function(req,res){
var url = require('url');
var output = '';
var url_parts = url.parse(req.url, true);
var query = url_parts.query;
  var spawn= require('child_process').spawn,
  ps = spawn("python", ["db_connect.py", query.server, query.user,query.password,query.db,query.portno,query.offset,query.count,query.cmp_id]);
  grep = spawn('grep', ['ssh']);
  ps.stdout.on('data', function(data){
    
    output+= data;
    console.log ('{"data":"'+output+'"}');
  });
return res.json({ messages : query });
});

router.get('/langDetect', function(req,res){
var url = require('url');
var output = '';
var url_parts = url.parse(req.url, true);
var query = url_parts.query;
  var spawn= require('child_process').spawn,
  ps = spawn("python", ["langtest.py", query.server, query.user,query.password,query.db,query.portno,query.offset,query.count]);
  grep = spawn('grep', ['ssh']);
  ps.stdout.on('data', function(data){
    
    output+= data;
    console.log ('{"data":"'+output+'"}');
  });
return res.json({ messages : query });
});

router.get('/cleanup', function(req,res){
var url = require('url');
console.log('Cleanup End Point');
var output = '';
var url_parts = url.parse(req.url, true);
var query = url_parts.query;
  var spawn= require('child_process').spawn,
  ps = spawn("java", ["-cp","javaClean/:mysql-connector-java-5.0.8.jar","cleanup", query.server, query.user,query.password,query.db,query.portno,query.offset,query.count,query.cmp_id]);
  grep = spawn('grep', ['ssh']);
  ps.stdout.on('data', function(data){
    
    output+= data;
    console.log ('{"data":"'+output+'"}');
  });
return res.json({ messages : query });
});






// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
