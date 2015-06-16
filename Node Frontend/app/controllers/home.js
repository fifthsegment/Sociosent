// TODO TODAY : CREATE CHANNEL USERS CAN SUBSCRIBE TO
// Make configure Pushbullet the first step before installing other pages
var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var shopifyAPI = require('shopify-node-api');
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var UsersModel = require(path.join(process.cwd(), 'app', 'models', path.basename('users')));


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

// var awesome = module.exports;

module.exports = {


  main: function(req, res) {
  	var campaign_id = req.params.id
  	res.header ('Access-Control-Allow-Origin', '*')
  res.header ('Access-Control-Allow-Credentials', true)
  res.header ('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header ('Access-Control-Allow-Headers', 'Content-Type')
  	return res.render('main_home', { title: 'Sociosent', campaign_id: campaign_id});

  },




  finish_auth: function (req, res){
	  query_params = req.query;
	  var shopifyOptionstemp = {
	        shop: req.query.shop, // MYSHOP.myshopify.com
	        shopify_api_key: app.get('settings').shopify.api, // Your API key
	        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
	        shopify_scope: app.get('settings').shopify.scope,
	        redirect_uri : app.get('settings').shopify.redirect_uri,
	    }
       var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
	   Shopifytemp.exchange_temporary_token(query_params, function(err, data){
	    shopifyOptionstemp.access_token = data["access_token"];
	    if (err){
	    	return res.send("ERROR: "+err);
	    }
	    UsersModel.findOneAndUpdate({shop_url:req.query.shop}, {dummy_token: "NOW!"}, {}, function(err, result){
			if (!result){
				var newUsers = new UsersModel({shop_url: req.query.shop, access_token : data["access_token"], first_install: true});
				newUsers.save(function (err) {
		  		if (err) // ...
		  			console.log('Error creating a new User => Error = '+err);
				});
				return res.redirect('/html/install.html');
			}else{
			    req.session.x_id = data["access_token"];
			    req.session.store = req.query.shop;
			    if (result.pushbullet_token){
			     	 var querystring = require('querystring');
			  		 dbpbtoken = result.pushbullet_token;
			  		 dbpbtoken = querystring.unescape(dbpbtoken);
			  		 pushbulletObj = JSON.parse(dbpbtoken);
				     req.session.pbtoken = pushbulletObj.access_token;
			     }
			     if (result.first_install)
			     	return res.redirect('/html/install.html');
			     return res.redirect('/client_home');
			}
		});
	  });
   },




  client_home:function(req,res){
  	// if (!req.session.store ){
  	// 	return res.send("Not Connected to the Shopify API. Please go to the main page.");
  	// }


    var shopifyOptionstemp = {
        shop: req.session.store, // MYSHOP.myshopify.com
        shopify_api_key: app.get('settings').shopify.api, // Your API key
        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
        shopify_scope: app.get('settings').shopify.scope,
        redirect_uri : app.get('settings').shopify.redirect_uri,
	}

	shopifyOptionstemp.access_token = req.session.x_id;

	if (app.get('settings').env == 'development') {
	    shopifyOptionstemp.access_token = app.get('settings').development.access_token
	    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
	}	


    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	output = '';
  	Shopifytemp.get('/admin/webhooks.json', function(err, data, headers){
	    if (err){
	    	return res.redirect('/home');
	    }
	    output = data;

	    MongoClient.connect(dburl, function(err, db) {


	    	output+="3";
	  		coll = "storenotifiercustomers"
	  		var collection = db.collection(coll);
	  		var output = [];
	  		var subscribers = 0;
	    	var async = require('async');
	    	async.waterfall([
			    function(callback){ 
			    	//output += "1"; 
			    	console.log("Initiating ... "); 
			    	collection.aggregate(
						{ $match: { "shop_url":shopifyOptionstemp.shop } },
						{$project: {a: '$customers_subscribed.email'}}, 
					    {$unwind: '$a'},
					    {$group: {_id: 'a', items: {$addToSet: '$a'}} },
					    {$project: { count: {$size: '$items'} }},
					    function(err, data){
					    	callback(null, err,data)
					    }
				   	
					);
			    },
			    function(error, data, callback){ 
			    	//output += "2"; 
			    	subscribers = data[0].count;
			    	console.log("Second ... ");
			    	
					    	//console.log("e"+e+" = "+ " c "+c[0].count);
					    	//var output = "aaa";
					    	//var collfind = 'a';
			    	var collfind = collection.find({"shop_url":shopifyOptionstemp.shop}).toArray(function(err, docs_subscription) {
			    		callback(null, docs_subscription, collfind, callback);
			    	});
			    	

			    	
			    },
			    function(arg1, arg2, arg3, callback){ 
			    	//output += "3"; 
			    	console.log("Third ... "); 
			    	var something = "yo!";
			    	all_docs = [];
			    	console.log("\n\n===AwESsoMe" + arg1.length);
			    	//console.log("\n\n===AwESsoMe" + JSON.stringify(arg1));
			    	//output+=arg1[0].product_title;
			    	for (var i = arg1.length - 1; i >= 0; i--) {
			    		//output+=arg1[i].product_title + " | " + arg1[i].customers_subscribed.length;
			    		var output_obj={};
			    		output_obj.title =  arg1[i].product_title;
			    		output_obj.subscribers =  arg1[i].customers_subscribed.length;
			    		output.push(output_obj);
			    	};
			    	//toArray(function(err, docs_subscription) {
		// 			console.log(docs);;	
						//output= "a";
						//output+=docs_subscription.product_title + " | "
					//	console.log("\n\nSUBSCRIPTIONS\n");
						//console.log(docs_subscription)
					//	all_docs.push(docs_subscription);
					//	output+=docs_subscription[0].product_title;
					//	console.log("\n\n===AwESsoMe" + JSON.stringify(docs_subscription[0].product_title));
					
					//});
			    	callback(null, output);
			    },
			    function(arg1,callback){
				  	coll = "storenotifiercustomers"
				  	var collection = db.collection(coll);
					collection.aggregate(
						{ $match: { "shop_url":"developmentstore-3.myshopify.com" } },
						{$project: {a: '$customers_subscribed', b: '$product_title'}}, 
						{$project: { b: '$b', count: {$size: '$a'} }},
						{$group: 
							{
							  _id:"$b",
							  subscribers:{
							  	$max:'$count'
							  }
							}
						},
						{$sort: {subscribers:-1}},
						{$limit: 1},
						{$project: {subscribers:1}},

					     function(e,c){
					    	console.log("e"+e+" = "+ " c "+JSON.stringify(c));
					    	//return res.json(c);
					    	callback(null,arg1, c);
					    })
					//});

			    },
			    function(xsa, most_subscribed,callback){			
			    	console.log("Fourth ... "); 
			    	var md5 = require('MD5');
					endpoint = md5(shopifyOptionstemp.shop);
			    	script_url = "http:\/\/"+app.get('settings').domain+"\/public\/"+endpoint+".js";

			    	//return res.send(xsa);
			    	return res.render('home', { 
			    		title: 'Notifier', 
			    		shop: shopifyOptionstemp.shop, 
			    		'subscribers': subscribers, 
			    		'output' : output, 
			    		'most_subscribed': most_subscribed,
			    		'script_url' : script_url
			    	}

			    	);
			    	callback(arg1);
				}
			]);


		    collection.aggregate(
				{ $match: { "shop_url":shopifyOptionstemp.shop } },
				{$project: {a: '$customers_subscribed.email'}}, 
			    {$unwind: '$a'},
			    {$group: {_id: 'a', items: {$addToSet: '$a'}} },
			    {$project: { count: {$size: '$items'} }},
			    //{total:{$sum:'$a'}},
			     function(e,c){
			    	//console.log("e"+e+" = "+ " c "+c[0].count);
			    	//var output = "aaa";
			    	collection.find({"shop_url":shopifyOptionstemp.shop}).toArray(function(err, docs_subscription) {
		// 			console.log(docs);;	
						//output= "a";
						//output+=docs_subscription.product_title + " | "
						console.log("\n\nSUBSCRIPTIONS\n");
						console.log(docs_subscription)
					
					});

			    //return res.render('home', { title: 'Notifier', shop: shopifyOptionstemp.shop, 'subscribers': c[0].count, 'output' : output});

			    	
			});
		});
	    
	});
  },




  create_hook : function(req, res){
	var post_data = {
		  "webhook": {
		    "topic": "products\/create",
		    "address": "http:\/\/shopifyaaap.herokuapp.com/webhooks/products",
		    "format": "json"
		  }
		}
	Shopify.post('/admin/webhooks.json', post_data, function(err, data, headers){
	  console.log(data);
	});
  },



  pushbullet_test : function (req, res){
  	var PushBullet = require('pushbullet');
	var pusher = new PushBullet('vnjqqO1KyTAAvXnBhP9ldrhe84YrLNeO');
	pusher.me(function(err, response) {
		console.log(response);
	});
  },



  pushbullet_connect : function(req, res){
  	output =  '<a href="https://www.pushbullet.com/authorize?client_id=L9o3SzkRDxTf7leZKUjmH1mBFytM2oUz&redirect_uri=http%3A%2F%2Fshopifyaaap.herokuapp.com%2Fpushbullet_callback&response_type=code&scope=everything">Connect</a>';
  	return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
  },








  pushbullet_callback: function (req, res){
  	var pbtoken = '';
  	request.post({url:'https://api.pushbullet.com/oauth2/token', form: {grant_type: 'authorization_code', client_id:'L9o3SzkRDxTf7leZKUjmH1mBFytM2oUz', client_secret: 'y7Xh7bf5K8hKqvhzzq9zgci6EV6r22rR', code: req.query.code}}, function(err,httpResponse,body){
	if (!req.session.store){
		return res.send("Please login to this app first, by visiting the main page.");
	}
	UsersModel.findOneAndUpdate({shop_url:req.session.store}, {pushbullet_token: body, dummy_token: "PBUPDATED"}, {}, function(err, result){
		if (!result){
			return res.send("Your Shopify account hasn't been registered with us.");
		}
		var querystring = require('querystring');
		data = body;
		data = querystring.unescape(data);
		pushbulletObj = JSON.parse(data);
	    req.session.pbtoken = pushbulletObj.access_token;
	    return res.redirect('/pushbullet_home');
	});


  // 		MongoClient.connect(dburl, function(err, db) {
  // 			if (!req.session.store){
  // 				return res.send("Please login to this app first, by visiting the main page.");
  // 			}
		// 	if(!err){
		// 		var collection = db.collection('users');
		// 		collection.find({"shop_url":req.session.store}).toArray(function(err, docs) {
		// 			console.log(docs);
		// 			if (docs.length == 1){
		// 				collection.update({"shop_url":req.session.store}
		// 				    , { $set: { "pushbullet_token" : body } }, function(err, result) {
		// 				    console.log("Updated the document");
		// 				});  
		// 			}else{
		// 				return res.send("Your Shopify account hasn't been registered with us.");
		// 			}
		// 			 var sess=req.session;
		// 		     var querystring = require('querystring');
		// 	  		 data = body;
		// 	  		 data = querystring.unescape(data);
		// 	  		 pushbulletObj = JSON.parse(data);
		// 		     req.session.pbtoken = pushbulletObj.access_token;
		// 		     db.close();
		// 		     return res.redirect('/pushbullet_home');
					 
		// 		});
		// 	}
		// });
	});
  },



  settings_home: function (req, res){
  		output =  '<h1>Settings</h1>';
  		var forms = require('forms');
  		var fields = forms.fields;

		var validators = forms.validators;
  		var reg_form = forms.create({
		    enable_notifications: fields.boolean({ required: true })
		});

		reg_form.handle(req, {
	        success: function (form) {
	            output += "<p>" + form.data.enable_notifications + "</p>";
	            save({'enable_notifications': form.data.enable_notifications}, "users", req, res, function(){
	            	return res.send("Updated");
	            });
	        },
	        error: function (form) {
	            output += "<form action='settings' method='GET'>";
	            output+=form.toHTML();
	            output += "<input type='submit' value='submit'>";
		  		output += "</form>";
		  		return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
	        },
	        empty: function (form) {
				var shopifyOptionstemp = {
			        shop: req.session.store, // MYSHOP.myshopify.com
			        shopify_api_key: app.get('settings').shopify.api, // Your API key
			        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
			        shopify_scope: app.get('settings').shopify.scope,
			        redirect_uri : app.get('settings').shopify.redirect_uri,
				}
				if (app.get('settings').env == 'development') {
				    shopifyOptionstemp.access_token = app.get('settings').development.access_token
				    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
				}	

				// shopifyOptionstemp.access_token = req.session.x_id;

			    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);

			     Shopifytemp.get('/admin/variants/1267063408.json', function(err, data, headers){
			     	console.log(data);
			    // 	data.script_tags.forEach(function(tag, i){
			    // 		output+=tag.id+" : "+tag.src+"<br>";
			    // // 			Shopifytemp.delete('/admin/script_tags/'+tag.id+'.json', function(err, data, headers){
							// //     console.log(data);
							// // });

			    // 	});



			    // Shopifytemp.get('/admin/script_tags.json', function(err, data, headers){
			    // 	data.script_tags.forEach(function(tag, i){
			    // 		output+=tag.id+" : "+tag.src+"<br>";
			    // 			Shopifytemp.delete('/admin/script_tags/'+tag.id+'.json', function(err, data, headers){
							//     console.log(data);
							// });

			    // 	});




				  	// for (i=0; i <data.script_tags.length; i++){
				  	// 	output+=data.script_tags[i].id+" : "+data.script_tags[i].src+"<br>";
				  	// 	if (data.script_tags[i].id!=10180276){
				  	// 		// 		Shopifytemp.delete('/admin/webhooks/'+data.webhooks[i].id+'.json', function(err, data, headers){
							// //     console.log(data);
							// // });
				  	// 	}
				  		
				  	// }
				  	output += "<form action='settings' method='GET'>";
			  		output += reg_form.toHTML();
			  		output += "<input type='submit' value='submit'>";
			  		output += "</form>";
			  		return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
				  	// return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
				});
				// Shopifytemp.get('/admin/webhooks.json', function(err, data, headers){
				//   	for (i=0; i <data.webhooks.length; i++){
				//   		output+=data.webhooks[i].id+" : "+data.webhooks[i].address+"<br>";
				//   		if (data.webhooks[i].id!=10180276){
				//   			// 		Shopifytemp.delete('/admin/webhooks/'+data.webhooks[i].id+'.json', function(err, data, headers){
				// 			//     console.log(data);
				// 			// });
				//   		}
				  		
				//   	}
				//   	output += "<form action='settings' method='GET'>";
			 //  		output += reg_form.toHTML();
			 //  		output += "<input type='submit' value='submit'>";
			 //  		output += "</form>";
			 //  		return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
				//   	// return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
				// });

	        }
	    });


  		
  },



  settings_installapp : function (req, res){
  	output = '';
  	var md5 = require('MD5');
  	endpoint = md5(req.session.store);
	var forms = require('forms');
	var fields = forms.fields;
	var widgets = forms.widgets;
	var validators = forms.validators;
	var reg_form = forms.create({
		install: fields.string({ 
			required: false,
			value: "1",
			widget: widgets.hidden()
		})
	});
	var shopifyOptionstemp = {
        shop: req.session.store, // MYSHOP.myshopify.com
        shopify_api_key: app.get('settings').shopify.api, // Your API key
        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
        shopify_scope: app.get('settings').shopify.scope,
        redirect_uri : app.get('settings').shopify.redirect_uri,
	}
	shopifyOptionstemp.access_token = req.session.x_id;
    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
	reg_form.handle(req, {
		success: function (form) {
			output += "<p>Installing...</p>";
			var post_data = {
				  "webhook": {
				    "topic": "products\/create",
				    "address": "http:\/\/shopifyaaap.herokuapp.com/webhooks/products?store="+endpoint,
				    "format": "json"
				  }
				}

			save({'webhook_identifier': endpoint}, "users", req, res, function(){
				Shopifytemp.post('/admin/webhooks.json', post_data, function(err, data, headers){
				  	console.log(data);
					post_data_pages = {
					  "script_tag": {
					    "event": "onload",
					    "src": "http:\/\/shopifyaaap.herokuapp.com\/clients\/notifier.js"
					  }
					}
				  	Shopifytemp.post('/admin/script_tags.json', post_data_pages ,function(err, data, headers){
					  	// console.log(data);
					  	// output = data;
					  	// output += JSON.stringify(data);
					  	//Create a page here
					  	var post_data_page_insert = {
						  "page": {
						    "title": "Notification Subscription",
						    "body_html": "Subscribe to our Pushbullet channel here: "
						  }
						}

					    // var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
							Shopifytemp.post('/admin/pages.json', post_data_page_insert ,function(err, data, headers){
							  	console.log(data);
							  	output += "<h2>Final Stage</h2>";
							  	// output = data;
							  	output += JSON.stringify(data);
							  	return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
							});

					  	// return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
					});
				  	// return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
				});
				// return res.send("Updated");
			})




			// save({'enable_notifications': form.data.enable_notifications}, "users", req, res);
		},
		empty: function (form) {
		    output += "<form action='/install' method='GET'>";
	  		output += reg_form.toHTML();
	  		output += "<input type='submit' value='Install'>";
			output += "</form>";
			return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});

		},
		error: function (form) {
            // the data in the request didn't validate,
            // calling form.toHTML() again will render the error messages
            output += "Error";
            return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
        }

	});
  	//Install Webhooks here

  },



  pushbullet_home: function (req, res){
  	if (req.session.pbtoken){
  		var PushBullet = require('pushbullet');
		var pusher = new PushBullet(req.session.pbtoken);
		// res.send(req.session.pbtoken);
	  	pusher.me(function(err, response) {
			// res.send(response);
			// output = '<h5>Account Connected'
			return res.render('pushbullet_home', { title: 'Notifier', shop: req.session.store, body : response});
		});
  	}else{
  		// var querystring = require('querystring');
  		// var unescaped = querystring.unescape(escaped);

  		// res.send('You havent connected a Pushbullet account yet.');
  		return res.redirect('/pushbullet_connect');
  	}

  },



  logout : function (req, res){
  	req.session.destroy();
  	return res.redirect('/');
  },


   pages : function (req, res){
	var shopifyOptionstemp = {
        shop: req.session.store, // MYSHOP.myshopify.com
        shopify_api_key: app.get('settings').shopify.api, // Your API key
        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
        shopify_scope: app.get('settings').shopify.scope,
        redirect_uri : app.get('settings').shopify.redirect_uri,
	}

	shopifyOptionstemp.access_token = req.session.x_id;

	var post_data = {
	  "page": {
	    "title": "Notification Subscription",
	    "body_html": "Subscribe to our Pushbullet channel here: "
	  }
	}

    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
		Shopifytemp.post('/admin/pages.json', post_data ,function(err, data, headers){
		  	console.log(data);
		  	output = data;
		  	output += JSON.stringify(data);
		  	return res.render('default_loggedin', { title: 'Notifier', shop: req.session.store, body : output});
		});
  },

  testing2: function(x){
  	script = '<script src="http://localhost:5000/public/a7224de26cf2fcea60dbe42ad1bd541f.js?shop=developmentstore-3.myshopify.com"></script>'
  	// html = '<!DOCTYPE html><html class=no-js><!--<![endif]--><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge,chrome=1"><title>T-Shirt &ndash; DevelopmentStore</title><meta name=description content=Something><meta property=og:type content=product><meta property=og:title content=T-Shirt><meta property=og:price:amount content=100.00><meta property=og:price:currency content=PKR><meta property=og:description content=Something><meta property=og:url content=http://developmentstore-3.myshopify.com/products/t-shirt><meta property=og:site_name content=DevelopmentStore><meta name=twitter:site content=@><meta name=twitter:card content=product><meta name=twitter:title content=T-Shirt><meta name=twitter:description content=Something><meta name=twitter:image content=https://cdn.shopify.com/s/assets/admin/no-image-medium-b6c0118aa6d1b17d88109be11d4a7368.gif><meta name=twitter:image:width content=240><meta name=twitter:image:height content=240><meta name=twitter:label1 content=Price><meta name=twitter:data1 content="Rs.100.00 PKR"><meta name=twitter:label2 content=Brand><meta name=twitter:data2 content=DevelopmentStore><link rel=canonical href=http://developmentstore-3.myshopify.com/products/t-shirt><meta name=viewport content="width=device-width,initial-scale=1"><meta name=theme-color content=#ff893b><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/ajaxify.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/timber.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/theme.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href="//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700" rel=stylesheet type=text/css media="all"><link rel=alternate type=application/json+oembed href="http://developmentstore-3.myshopify.com/products/t-shirt.oembed"><script>var Shopify=Shopify||{};Shopify.shop="developmentstore-3.myshopify.com",Shopify.theme={name:"Classic",id:10585056,theme_store_id:721,role:"main"};</script><script src="http://localhost:5000/public/a7224de26cf2fcea60dbe42ad1bd541f.js?shop=developmentstore-3.myshopify.com"></script><script src=//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js type=text/javascript></script><script src=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/modernizr.min.js?2033227562211173045 type=text/javascript></script><script src="http://shopifyaaap.herokuapp.com/public/a7224de26cf2fcea60dbe42ad1bd541f.js?shop=developmentstore-3.myshopify.com"></script><body id=t-shirt class=template-product><div class=header-bar><div class="wrapper medium-down--hide"><div class=large--display-table><div class="header-bar__left large--display-table-cell"></div><div class="header-bar__right large--display-table-cell"><div class=header-bar__module><a href=/cart class=cart-toggle><span class="icon icon-cart header-bar__cart-icon" aria-hidden=true></span> Cart <span class="cart-count header-bar__cart-count hidden-count">0</span></a></div><div class="header-bar__module header-bar__search"><form action=/search role=search><input type=search name=q aria-label="Search our store" class=header-bar__search-input> <button type=submit class="btn icon-fallback-text header-bar__search-submit"><span class="icon icon-search" aria-hidden=true></span> <span class=fallback-text>Search</span></button></form></div></div></div></div><div class="wrapper large--hide"><button type=button class=mobile-nav-trigger id=MobileNavTrigger><span class="icon icon-hamburger" aria-hidden=true></span> Menu</button> <a href=/cart class="cart-toggle mobile-cart-toggle"><span class="icon icon-cart header-bar__cart-icon" aria-hidden=true></span> Cart <span class="cart-count hidden-count">0</span></a></div><ul id=MobileNav class="mobile-nav large--hide"><li class=mobile-nav__link><a href="/">Home</a></li><li class=mobile-nav__link><a href=/collections/all>Catalog</a></li><li class=mobile-nav__link><a href=/blogs/news>Blog</a></li><li class=mobile-nav__link><a href=/pages/about-us>About Us</a></li></ul></div><header class=site-header role=banner><div class=wrapper><div class="grid--full large--display-table"><div class="grid__item large--one-third large--display-table-cell"><div class="h1 site-header__logo large--left" itemscope itemtype=http://schema.org/Organization><a href="/" itemprop=url>DevelopmentStore</a></div></div><div class="grid__item large--two-thirds large--display-table-cell medium-down--hide"><ul class=site-nav id=AccessibleNav><li><a href="/" class=site-nav__link>Home</a></li><li><a href=/collections/all class=site-nav__link>Catalog</a></li><li><a href=/blogs/news class=site-nav__link>Blog</a></li><li><a href=/pages/about-us class=site-nav__link>About Us</a></li></ul></div></div></div></header><main class="wrapper main-content" role=main><div class=grid><div class="grid__item large--one-fifth medium-down--hide"><div class=section-header><p class="section-header__title h4">Shop by Collection</p></div><p>Link to your individual collections by creating a new linklist in the <strong>Navigation</strong> section of the admin.</p><p>You can then have it appear here by choosing your new linklist under <strong>Customize Theme / Sidebar</strong>.</p><nav class=sidebar-module><div class=section-header><p class="section-header__title h4">Shop by Type</p></div><ul class=sidebar-module__list><li><a href="/collections/types?q="></a></li></ul></nav></div><div class="grid__item large--four-fifths"><div itemscope itemtype=http://schema.org/Product><meta itemprop=url content=http://developmentstore-3.myshopify.com/products/t-shirt><meta itemprop=image content=//cdn.shopify.com/s/assets/admin/no-image-grande-dba4c5e9b90e66e8a8429a34ab6f5292.gif><div class="section-header section-header--breadcrumb"><nav class=breadcrumb role=navigation aria-label=breadcrumbs><a href="/" title="Back to the frontpage">Home</a> <span aria-hidden=true class=breadcrumb__sep>&rsaquo;</span> <span>T-Shirt</span></nav></div><div class=product-single><div class="grid product-single__hero"><div class="grid__item large--one-half"><div class=product-single__photos id=ProductPhoto><img src=//cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif alt="" id=ProductPhotoImg></div></div><div class="grid__item large--one-half"><h1 itemprop=name>T-Shirt</h1><div itemprop=offers itemscope itemtype=http://schema.org/Offer><meta itemprop=priceCurrency content=PKR><link itemprop=availability href=http://schema.org/OutOfStock><form action=/cart/add method=post enctype=multipart/form-data id=AddToCartForm><select name=id id=productSelect class=product-single__variants><option disabled>Default Title - Sold Out</select><div class=product-single__prices><span id=ProductPrice class=product-single__price itemprop=price>Rs.100.00</span></div><div class="product-single__quantity is-hidden"><label for=Quantity class=quantity-selector>Quantity</label><input type=number id=Quantity name=quantity value=1 min=1 class=quantity-selector></div><button type=submit name=add id=AddToCart class=btn><span id=AddToCartText>Add to Cart</span></button></form></div></div></div><div class=grid><div class="grid__item large--one-half"></div></div></div><hr class="hr--clear hr--small"><ul class="inline-list tab-switch__nav section-header"><li><a href=#desc data-link=desc class="tab-switch__trigger h4 section-header__title">Description</a></li></ul><div class=tab-switch__content data-content=desc><div class="product-description rte" itemprop=description>Something</div></div><hr class="hr--clear hr--small"><h4 class=small--text-center>Share this Product</h4><div class="social-sharing normal small--text-center" data-permalink=http://developmentstore-3.myshopify.com/products/t-shirt><a target=_blank href="//www.facebook.com/sharer.php?u=http://developmentstore-3.myshopify.com/products/t-shirt" class=share-facebook><span class="icon icon-facebook"></span> <span class=share-title>Share</span> <span class=share-count>0</span></a> <a target=_blank href="//twitter.com/share?url=http://developmentstore-3.myshopify.com/products/t-shirt&amp;text=T-Shirt" class=share-twitter><span class="icon icon-twitter"></span> <span class=share-title>Tweet</span> <span class=share-count>0</span></a> <a target=_blank href="//pinterest.com/pin/create/button/?url=http://developmentstore-3.myshopify.com/products/t-shirt&amp;media=http://cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif&amp;description=T-Shirt" class=share-pinterest><span class="icon icon-pinterest"></span> <span class=share-title>Pin it</span> <span class=share-count>0</span></a> <a target=_blank href="http://www.thefancy.com/fancyit?ItemURL=http://developmentstore-3.myshopify.com/products/t-shirt&amp;Title=T-Shirt&amp;Category=Other&amp;ImageURL=//cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif" class=share-fancy><span class="icon icon-fancy"></span> <span class=share-title>Fancy</span></a> <a target=_blank href="//plus.google.com/share?url=http://developmentstore-3.myshopify.com/products/t-shirt" class=share-google><span class="icon icon-google"></span> <span class=share-count>+1</span></a></div></div></div></div></main><footer class="site-footer small--text-center" role=contentinfo><div class=wrapper><div class=grid-uniform><div class="grid__item large--one-quarter medium--one-half"><h4>Quick Links</h4><ul class=site-footer__links><li><a href=/search>Search</a></li><li><a href=/pages/about-us>About Us</a></li></ul></div><div class="grid__item large--one-quarter medium--one-half"><h4>Get Connected</h4><ul class="inline-list social-icons"><li><a class=icon-fallback-text href=https://twitter.com/shopify title="DevelopmentStore on Twitter"><span class="icon icon-twitter" aria-hidden=true></span> <span class=fallback-text>Twitter</span></a></li><li><a class=icon-fallback-text href=https://www.facebook.com/shopify title="DevelopmentStore on Facebook"><span class="icon icon-facebook" aria-hidden=true></span> <span class=fallback-text>Facebook</span></a></li></ul></div><div class="grid__item large--one-quarter medium--one-half"><h4>Contact Us</h4><div class=rte></div></div><div class="grid__item large--one-quarter medium--one-half"><h4>Newsletter</h4><p>Sign up for promotions</p><form action=# method=post id=mc-embedded-subscribe-form name=mc-embedded-subscribe-form target=_blank class=small--hide><input type=email placeholder=your-email@example.com name=EMAIL id=mail aria-label=your-email@example.com autocorrect=off autocapitalize=off> <input type=submit class=btn name=subscribe id=subscribe value=Subscribe></form><form action=# method=post id=mc-embedded-subscribe-form name=mc-embedded-subscribe-form target=_blank class="large--hide medium--hide input-group"><input type=email placeholder=your-email@example.com name=EMAIL id=mail class=input-group-field aria-label=your-email@example.com autocorrect=off autocapitalize=off> <span class=input-group-btn><input type=submit class=btn name=subscribe id=subscribe value=Subscribe></span></form></div></div><hr><div class=grid><div class="grid__item large--one-half large--text-left medium-down--text-center"><p class=site-footer__links>Copyright &copy; 2015, DevelopmentStore. <a href=http://www.shopify.com rel=nofollow target=_blank>Powered by Shopify</a></p></div></div></div></footer>'
  	html = '<!DOCTYPE html><html class=no-js><!--<![endif]--><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge,chrome=1"><title>T-Shirt &ndash; DevelopmentStore</title><meta name=description content=Something><meta property=og:type content=product><meta property=og:title content=T-Shirt><meta property=og:price:amount content=100.00><meta property=og:price:currency content=PKR><meta property=og:description content=Something><meta property=og:url content=http://developmentstore-3.myshopify.com/products/t-shirt><meta property=og:site_name content=DevelopmentStore><meta name=twitter:site content=@><meta name=twitter:card content=product><meta name=twitter:title content=T-Shirt><meta name=twitter:description content=Something><meta name=twitter:image content=https://cdn.shopify.com/s/assets/admin/no-image-medium-b6c0118aa6d1b17d88109be11d4a7368.gif><meta name=twitter:image:width content=240><meta name=twitter:image:height content=240><meta name=twitter:label1 content=Price><meta name=twitter:data1 content="Rs.100.00 PKR"><meta name=twitter:label2 content=Brand><meta name=twitter:data2 content=DevelopmentStore><link rel=canonical href=http://developmentstore-3.myshopify.com/products/t-shirt><meta name=viewport content="width=device-width,initial-scale=1"><meta name=theme-color content=#ff893b><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/ajaxify.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/timber.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/theme.scss.css?2033227562211173045 rel=stylesheet type=text/css media="all"><link href="//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700" rel=stylesheet type=text/css media="all"><link rel=alternate type=application/json+oembed href="http://developmentstore-3.myshopify.com/products/t-shirt.oembed"><script>var Shopify=Shopify||{};Shopify.shop="developmentstore-3.myshopify.com",Shopify.theme={name:"Classic",id:10585056,theme_store_id:721,role:"main"};</script><script src="http://localhost:5000/public/a7224de26cf2fcea60dbe42ad1bd541f.js?shop=developmentstore-3.myshopify.com"></script><script src=//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js type=text/javascript></script><script src=//cdn.shopify.com/s/files/1/0744/0971/t/5/assets/modernizr.min.js?2033227562211173045 type=text/javascript></script><script src="http://localhost:5000/public/a7224de26cf2fcea60dbe42ad1bd541f.js?shop=developmentstore-3.myshopify.com"></script><body id=t-shirt class=template-product><div class=header-bar><div class="wrapper medium-down--hide"><div class=large--display-table><div class="header-bar__left large--display-table-cell"></div><div class="header-bar__right large--display-table-cell"><div class=header-bar__module><a href=/cart class=cart-toggle><span class="icon icon-cart header-bar__cart-icon" aria-hidden=true></span> Cart <span class="cart-count header-bar__cart-count hidden-count">0</span></a></div><div class="header-bar__module header-bar__search"><form action=/search role=search><input type=search name=q aria-label="Search our store" class=header-bar__search-input> <button type=submit class="btn icon-fallback-text header-bar__search-submit"><span class="icon icon-search" aria-hidden=true></span> <span class=fallback-text>Search</span></button></form></div></div></div></div><div class="wrapper large--hide"><button type=button class=mobile-nav-trigger id=MobileNavTrigger><span class="icon icon-hamburger" aria-hidden=true></span> Menu</button> <a href=/cart class="cart-toggle mobile-cart-toggle"><span class="icon icon-cart header-bar__cart-icon" aria-hidden=true></span> Cart <span class="cart-count hidden-count">0</span></a></div><ul id=MobileNav class="mobile-nav large--hide"><li class=mobile-nav__link><a href="/">Home</a></li><li class=mobile-nav__link><a href=/collections/all>Catalog</a></li><li class=mobile-nav__link><a href=/blogs/news>Blog</a></li><li class=mobile-nav__link><a href=/pages/about-us>About Us</a></li></ul></div><header class=site-header role=banner><div class=wrapper><div class="grid--full large--display-table"><div class="grid__item large--one-third large--display-table-cell"><div class="h1 site-header__logo large--left" itemscope itemtype=http://schema.org/Organization><a href="/" itemprop=url>DevelopmentStore</a></div></div><div class="grid__item large--two-thirds large--display-table-cell medium-down--hide"><ul class=site-nav id=AccessibleNav><li><a href="/" class=site-nav__link>Home</a></li><li><a href=/collections/all class=site-nav__link>Catalog</a></li><li><a href=/blogs/news class=site-nav__link>Blog</a></li><li><a href=/pages/about-us class=site-nav__link>About Us</a></li></ul></div></div></div></header><main class="wrapper main-content" role=main><div class=grid><div class="grid__item large--one-fifth medium-down--hide"><div class=section-header><p class="section-header__title h4">Shop by Collection</p></div><p>Link to your individual collections by creating a new linklist in the <strong>Navigation</strong> section of the admin.</p><p>You can then have it appear here by choosing your new linklist under <strong>Customize Theme / Sidebar</strong>.</p><nav class=sidebar-module><div class=section-header><p class="section-header__title h4">Shop by Type</p></div><ul class=sidebar-module__list><li><a href="/collections/types?q="></a></li></ul></nav></div><div class="grid__item large--four-fifths"><div itemscope itemtype=http://schema.org/Product><meta itemprop=url content=http://developmentstore-3.myshopify.com/products/t-shirt><meta itemprop=image content=//cdn.shopify.com/s/assets/admin/no-image-grande-dba4c5e9b90e66e8a8429a34ab6f5292.gif><div class="section-header section-header--breadcrumb"><nav class=breadcrumb role=navigation aria-label=breadcrumbs><a href="/" title="Back to the frontpage">Home</a> <span aria-hidden=true class=breadcrumb__sep>&rsaquo;</span> <span>T-Shirt</span></nav></div><div class=product-single><div class="grid product-single__hero"><div class="grid__item large--one-half"><div class=product-single__photos id=ProductPhoto><img src=//cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif alt="" id=ProductPhotoImg></div></div><div class="grid__item large--one-half"><h1 itemprop=name>T-Shirt</h1><div itemprop=offers itemscope itemtype=http://schema.org/Offer><meta itemprop=priceCurrency content=PKR><link itemprop=availability href=http://schema.org/OutOfStock><form action=/cart/add method=post enctype=multipart/form-data id=AddToCartForm><select name=id id=productSelect class=product-single__variants><option disabled>Default Title - Sold Out</select><div class=product-single__prices><span id=ProductPrice class=product-single__price itemprop=price>Rs.100.00</span></div><div class="product-single__quantity is-hidden"><label for=Quantity class=quantity-selector>Quantity</label><input type=number id=Quantity name=quantity value=1 min=1 class=quantity-selector></div><button type=submit name=add id=AddToCart class=btn><span id=AddToCartText>Add to Cart</span></button></form></div></div></div><div class=grid><div class="grid__item large--one-half"></div></div></div><hr class="hr--clear hr--small"><ul class="inline-list tab-switch__nav section-header"><li><a href=#desc data-link=desc class="tab-switch__trigger h4 section-header__title">Description</a></li></ul><div class=tab-switch__content data-content=desc><div class="product-description rte" itemprop=description>Something</div></div><hr class="hr--clear hr--small"><h4 class=small--text-center>Share this Product</h4><div class="social-sharing normal small--text-center" data-permalink=http://developmentstore-3.myshopify.com/products/t-shirt><a target=_blank href="//www.facebook.com/sharer.php?u=http://developmentstore-3.myshopify.com/products/t-shirt" class=share-facebook><span class="icon icon-facebook"></span> <span class=share-title>Share</span> <span class=share-count>0</span></a> <a target=_blank href="//twitter.com/share?url=http://developmentstore-3.myshopify.com/products/t-shirt&amp;text=T-Shirt" class=share-twitter><span class="icon icon-twitter"></span> <span class=share-title>Tweet</span> <span class=share-count>0</span></a> <a target=_blank href="//pinterest.com/pin/create/button/?url=http://developmentstore-3.myshopify.com/products/t-shirt&amp;media=http://cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif&amp;description=T-Shirt" class=share-pinterest><span class="icon icon-pinterest"></span> <span class=share-title>Pin it</span> <span class=share-count>0</span></a> <a target=_blank href="http://www.thefancy.com/fancyit?ItemURL=http://developmentstore-3.myshopify.com/products/t-shirt&amp;Title=T-Shirt&amp;Category=Other&amp;ImageURL=//cdn.shopify.com/s/assets/admin/no-image-1024x1024-a035ce3e003f9827e40d718e4a68fcf3.gif" class=share-fancy><span class="icon icon-fancy"></span> <span class=share-title>Fancy</span></a> <a target=_blank href="//plus.google.com/share?url=http://developmentstore-3.myshopify.com/products/t-shirt" class=share-google><span class="icon icon-google"></span> <span class=share-count>+1</span></a></div></div></div></div></main><footer class="site-footer small--text-center" role=contentinfo><div class=wrapper><div class=grid-uniform><div class="grid__item large--one-quarter medium--one-half"><h4>Quick Links</h4><ul class=site-footer__links><li><a href=/search>Search</a></li><li><a href=/pages/about-us>About Us</a></li></ul></div><div class="grid__item large--one-quarter medium--one-half"><h4>Get Connected</h4><ul class="inline-list social-icons"><li><a class=icon-fallback-text href=https://twitter.com/shopify title="DevelopmentStore on Twitter"><span class="icon icon-twitter" aria-hidden=true></span> <span class=fallback-text>Twitter</span></a></li><li><a class=icon-fallback-text href=https://www.facebook.com/shopify title="DevelopmentStore on Facebook"><span class="icon icon-facebook" aria-hidden=true></span> <span class=fallback-text>Facebook</span></a></li></ul></div><div class="grid__item large--one-quarter medium--one-half"><h4>Contact Us</h4><div class=rte></div></div><div class="grid__item large--one-quarter medium--one-half"><h4>Newsletter</h4><p>Sign up for promotions</p><form action=# method=post id=mc-embedded-subscribe-form name=mc-embedded-subscribe-form target=_blank class=small--hide><input type=email placeholder=your-email@example.com name=EMAIL id=mail aria-label=your-email@example.com autocorrect=off autocapitalize=off> <input type=submit class=btn name=subscribe id=subscribe value=Subscribe></form><form action=# method=post id=mc-embedded-subscribe-form name=mc-embedded-subscribe-form target=_blank class="large--hide medium--hide input-group"><input type=email placeholder=your-email@example.com name=EMAIL id=mail class=input-group-field aria-label=your-email@example.com autocorrect=off autocapitalize=off> <span class=input-group-btn><input type=submit class=btn name=subscribe id=subscribe value=Subscribe></span></form></div></div><hr><div class=grid><div class="grid__item large--one-half large--text-left medium-down--text-center"><p class=site-footer__links>Copyright &copy; 2015, DevelopmentStore. <a href=http://www.shopify.com rel=nofollow target=_blank>Powered by Shopify</a></p></div></div></div></footer>';
  	return (html+x);
  },	


  testing: function(req, res){
  	//res.send(module.exports.testing2('a'));
  	MongoClient.connect(dburl, function(err, db) {
	  	coll = "storenotifiercustomers"
	  	var collection = db.collection(coll);
		collection.aggregate(
			{ $match: { "shop_url":"developmentstore-3.myshopify.com" } },
			{$project: {a: '$customers_subscribed', b: '$product_title'}}, 
			{$project: { b: '$b', count: {$size: '$a'} }},
			{$group: 
				{
				  _id:"$b",
				  subscribers:{
				  	$max:'$count'
				  }
				}
			},
			{$sort: {subscribers:-1}},
			{$limit: 1},
			{$project: {subscribers:1}},

		     function(e,c){
		    	console.log("e"+e+" = "+ " c "+JSON.stringify(c));
		    	return res.json(c);
		    })
		});


				//collection.find({"shop_url":"developmentstore-3.myshopify.com"},function(err,data){//.count(function(err, count) {
					//collection.aggregate({$project: { count: { $size:"$customers_subscribed" }}}, function(e,c){
					//	console.log("e"+e+" = "+ " c "+JSON.stringify(c));
					//})
					//console.log("Count : "+count);
					/*
					{ $match: { "shop_url":"developmentstore-3.myshopify.com" } },
					{$project: {a: '$customers_subscribed.email'}}, 
					{$project: { count: {$size: '$items'} },
				    {$unwind: '$a'},
				    {$group: {_id: 'a', items: {$addToSet: '$a'}} },
				    {$project: { count: {$size: '$items'} }},
					*/
					/*
					{$group: {_id:'$b', 
						max: {$max:'$count'},
						//cond: {},

						reduce: function(obj,prev) { if(prev.maxValue< obj.count) prev.maxValue = obj.count; },
						
						//initial: { cmax: 1 }
					}},
					
			        {
			            $sort: {
			                $total: -1
			            }
			        },
			        */


				    //{total:{$sum:'$a'}},
  	// var MyModel = UsersModel;
	// MyModel.find({ shop_url: "Zildjian.myshopify.com" }, null, { }, function (err, docs) {
	// 	if (docs.length==0){
	// 		return res.send("No data found");
	// 	}
	// 	// console.log(docs.enable_notifications);
	// 	var x = docs[0];
	// 	x.update({}, function(){

	// 	})
	// 	return res.send(docs[0].access_token)
	// });
	// UsersModel.findOneAndUpdate({shop_url: "Ziljian001.myshopify.com"}, {access_token: "updated"}, {}, function(err, result){
	// 	// console.log("a : "+err);
	// 	// console.log("b : "+result);
	// 	if (!result){
	// 		var newUsers = new UsersModel({shop_url: "Ziljian001.myshopify.com"});
	// 		newUsers.save(function (err) {
	//   		if (err) // ...
	//   			console.log('meow');
	//   		else
	//   			console.log("Saved...");
	//   			res.send("Saved");
	// 		});
	// 	}
	// });

	// var Auser = new MyModel({ 
	// 	shop_url: 'Zildjian.myshopify.com', 
	// 	access_token : "asddsaads" 
	// // });
	// Auser.save(function (err) {
	//   		if (err) // ...
	//   			console.log('meow');
	// });

 //  	var query = UsersModel.find({ "access_token": "d831f0fe0501ae016a49f60460b8cc71" }, null, { });
	// var promise = query.exec();
	// promise.addBack(function (err, docs) {
	// 	if (err){
	// 		console.log("Error "+err)
	// 	}else{
	// 		console.log("No error in connection")
	// 		console.log(docs);
	// 		var me = docs[0];
	// 		res.send(me.access_token);
	// 		// return res.send(JSON.stringify(docs));
	// 	}
		
	// });
  	
  }






}