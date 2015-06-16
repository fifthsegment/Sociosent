var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var fs = require('fs');
var glob = require('glob');

var controllers = {};
var files = glob.sync(path.join(process.cwd(), 'app', 'controllers', '**', '*.js'));
files.forEach(function(file) {
  var temp = controllers;
  var parts = path.relative(path.join(process.cwd(), 'app', 'controllers'), file).slice(0, -3).split(path.sep);

  while (parts.length) {
    if (parts.length === 1) {
      temp[parts[0]] = require(file);
    } else {
      temp[parts[0]] = temp[parts[0]] || {};
    }
    temp = temp[parts.shift()];
  }
});

//CORS middleware
function allowCrossDomain (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


function isAuthenticated(req, res, next) {

    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up


    // if(typeof req.session.x_id === 'undefined'){
    //   return res.redirect('/login');
    // }else{
    //   if (req.url == '/'){
    //     return res.redirect('/client_home');
    //   }
    //   return next();
    // }


    if ( req.session.x_id){
        if (req.url == '/'){
          return res.redirect('/client_home');
        }
        return next();
    }
    res.redirect('/login');
}

module.exports = function() {
  if (app.get('settings').env == 'development') {
      app.route('/campaigns/:id').get(controllers.home.main);
      app.route('/api/tweet').get(controllers.api.tweet_get);
      app.route('/api/:id').get(controllers.api.portal_data);
      app.route('/api/:id/sentiment').get(controllers.api.sentiment_data);
      app.route('/dash/step1').get(controllers.html.step1);
      app.route('/dash/campaigns').get(controllers.html.campaigns);
      app.route('/').get(controllers.html.campaigns);
  }else{
      app.route('/campaigns/:id').get(controllers.home.main);
      app.route('/api/tweet').get(controllers.api.tweet_get);
      app.route('/api/:id').get(controllers.api.portal_data);
      app.route('/api/:id/sentiment').get(controllers.api.sentiment_data);
      app.route('/dash/step1').get(controllers.html.step1);
      app.route('/dash/campaigns').get(controllers.html.campaigns);
      app.route('/').get(controllers.html.campaigns);
  }
  // app.route('/pages').get(controllers.home.pages);
  app.route('/logout').get(controllers.home.logout);

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    return res.status(500).render('500');
  });

  app.use(function(req, res) {
    return res.status(404).render('404');
  });
}