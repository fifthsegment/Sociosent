// html.js
// TODO TODAY : CREATE CHANNEL USERS CAN SUBSCRIBE TO
// Make configure Pushbullet the first step before installing other pages
var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var shopifyAPI = require('shopify-node-api');
var MongoClient = require('mongodb').MongoClient;
var request = require('request');


var dburl = app.get('settings').database.connectionstring;




function save (data, coll, req, res, callback){
		MongoClient.connect(dburl, function(err, db) {
	    	if(!err){
	    		var collection = db.collection(coll);
				collection.find({"shop_url":req.query.shop}).toArray(function(err, docs) {
					console.log(docs);
					if (docs.length == 0){
			    		console.log("No data found");
			    		db.close();
			    		// return res.send("No data error");
			    	}else{
			    		collection.update({"shop_url":req.session.store}
						    , { $set: data }, function(err, result) {
						    console.log("Updated the document");
						}); 
			    		db.close();
			    		// return res.send("Updated");
			    	}
			    	callback();
				     // return res.redirect('/client_home');
	    		});
	    	}
	    });
  }

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : app.get('settings').database.mysql_host,
  user     : app.get('settings').database.mysql_user,
  password : app.get('settings').database.mysql_pass,
  database :app.get('settings').database.mysql_db,
});

connection.connect();

module.exports = {

		step1: function(req, res) {
			  res.header ('Access-Control-Allow-Origin', '*')
  res.header ('Access-Control-Allow-Credentials', true)
  res.header ('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header ('Access-Control-Allow-Headers', 'Content-Type')
			return res.render('step1', {title: 'Sociosent' });
		},

campaigns: function(req, res) {
			  res.header ('Access-Control-Allow-Origin', '*')
  res.header ('Access-Control-Allow-Credentials', true)
  res.header ('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header ('Access-Control-Allow-Headers', 'Content-Type')
  var data = [];
  connection.query('SELECT *  FROM campaigns', function(err, rows, fields) {
  	for (var i = rows.length - 1; i >= 0; i--) {
  		data.push(rows[i]);
  	};
  	return res.render('campaigns', {title: 'Sociosent', data:data });
  });
			
		},


  main: function(req, res) {
    var shopifyOptionstemp = {
	                shop: req.session.store, // MYSHOP.myshopify.com
	                shopify_api_key: app.get('settings').shopify.api, // Your API key
	                shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
	                shopify_scope: app.get('settings').shopify.scope,
	                redirect_uri : app.get('settings').shopify.redirect_uri,
	                access_token : req.session.x_id
    }
    if (app.get('settings').env == 'development') {
	    shopifyOptionstemp.access_token = app.get('settings').development.access_token
	    shopifyOptionstemp.shop=app.get('settings').development.shop
	}else{
		shopifyOptionstemp.shop = req.session.store;
	}

    // return res.json('{"a":"b"}');
    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	output = '';
  	Shopifytemp.get('/admin/webhooks.json', function(err, data, headers){
	    if (err){
	    	return res.send("Shopify API connection ERROR : "+err);
	    }
	    // output = data;
	    return res.render('main_html', { title: 'Notifier', shop: shopifyOptionstemp.shop});
	    console.log(data);
	    // res.send("a");
	    // return res.json(data);
	});

  },


 notifications: function(req, res) {
    var shopifyOptionstemp = {
	                shop: req.session.store, // MYSHOP.myshopify.com
	                shopify_api_key: app.get('settings').shopify.api, // Your API key
	                shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
	                shopify_scope: app.get('settings').shopify.scope,
	                redirect_uri : app.get('settings').shopify.redirect_uri,
	                access_token : req.session.x_id
    }
    if (app.get('settings').env == 'development') {
	    shopifyOptionstemp.access_token = app.get('settings').development.access_token
	    shopifyOptionstemp.shop=app.get('settings').development.shop
	}else{
		shopifyOptionstemp.shop = req.session.store;
	}

    // return res.json('{"a":"b"}');
    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	output = '';

	    // output = data;
	return res.render('notifications_html', { title: 'Notifier', shop: shopifyOptionstemp.shop});
	    // console.log(data);


  },

  install: function(req, res) {
    var shopifyOptionstemp = {
	                shop: req.session.store, // MYSHOP.myshopify.com
	                shopify_api_key: app.get('settings').shopify.api, // Your API key
	                shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
	                shopify_scope: app.get('settings').shopify.scope,
	                redirect_uri : app.get('settings').shopify.redirect_uri,
	                access_token : req.session.x_id
    }
    if (app.get('settings').env == 'development') {
	    shopifyOptionstemp.access_token = app.get('settings').development.access_token
	    shopifyOptionstemp.shop=app.get('settings').development.shop
	}else{
		shopifyOptionstemp.shop = req.session.store;
	}

    // return res.json('{"a":"b"}');
    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	output = '';

	    // output = data;
	return res.render('install_html', { title: 'Notifier', shop: shopifyOptionstemp.shop});
	    // console.log(data);


  }
}