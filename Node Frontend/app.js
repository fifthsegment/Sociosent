var running = false;
function start(running){
	//if (!running){
		running=true;
		app.listen(app.get('port'));
		
	//}
}
	console.log("\n\n\n\n\n\n\n================\nStatus "+running);

if (running){
	console.log("\n\n\n\n\n\n\n=====\nNot running\n");
	app.close();
	running = false;
}

var express = require('express');
var session = require('express-session');
var path = require('path');


var app = express();


// var express = require('express');
// var app = express();

// require('express-debug')(app, {/* settings */});
// var raven = require('raven');

// app.use(raven.middleware.express('https://5c2549104cdf4a1ca58ef162762550e1:e93634f940384fc0b690c68bd617f9a0@app.getsentry.com/33936'));

app.set('settings', require(path.join(process.cwd(), 'app', 'config')));

// var mongoose = require('mongoose');
// // mongoose.connect('mongodb://' + app.get('settings').database.domain + '/' + app.get('settings').database.name);
// mongoose.connect('mongodb://heroku_app35262799:utpr2f967ffmum2odnpfoidla7@ds041841.mongolab.com:41841/heroku_app35262799')
// var MongoClient = require('mongodb').MongoClient
//   , assert = require('assert');

// Connection URL
// var url = 'mongodb://heroku_app35262799:utpr2f967ffmum2odnpfoidla7@ds041841.mongolab.com:41841/heroku_app35262799';


// Use connect method to connect to the Server


app.set('views', path.join(process.cwd(), 'app', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(require('serve-favicon')(path.join(process.cwd(), 'public', 'favicon.ico')));
app.use(require('morgan')('combined'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('method-override')());
app.use(require('cookie-parser')());
var RedisStore = require('connect-redis')(session);
app.use(session({
	store: new RedisStore({
		host: 'dab.redistogo.com',
		port: 9369,
		// db:2,
		pass: '548b4bc5829658f854e5c2f4d99bb974'
	}),
	secret: 'abdullahali'
}));


app.locals.settings = app.get('settings');

if (app.get('settings').env == 'development') {
  app.use(require('errorhandler')());
  app.locals.pretty = true;
}

module.exports = app;

require(path.join(process.cwd(), 'app', 'routes'))();


app.set('port', (process.env.PORT || 5000));




// app.on('close', function (parent) {
//   // console.log('Admin Mounted');
//   // console.log(parent); // refers to the parent app
//   running = 0;
//   console.log("Closing ...");
// });


console.log('\nApp starting up \n');
// while(true){
	// try{
	// 	app.close();
	// }
	// catch(e){

	// }

running = true;
		app.listen(app.get('port'));
		console.log("App started");

	
// }
