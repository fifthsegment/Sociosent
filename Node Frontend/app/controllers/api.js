// TODO TODAY : CREATE CHANNEL USERS CAN SUBSCRIBE TO
// Make configure Pushbullet the first step before installing other pages
var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var shopifyAPI = require('shopify-node-api');
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var UsersModel = require(path.join(process.cwd(), 'app', 'models', path.basename('users')));

var dburl = app.get('settings').database.connectionstring;


function getdbData(shop,coll, callback){
		MongoClient.connect(dburl, function(err, db) {
    	if(!err){
    		var collection = db.collection(coll);
			collection.find({"shop_url":shop}).toArray(function(err, docs) {
				console.log(docs);
				if (docs.length == 0){
		    		console.log("No data found");
		    		db.close();
		    		callback("empty");
		    		// return res.send("No data error");
		    	}else{
		   //  		collection.update({"shop_url":req.session.store}
					//     , { $set: data }, function(err, result) {
					//     console.log("Updated the document");
					// }); 
		    		db.close();
		    		// return res.send("Updated");
		    		callback(docs[0]);
		    	}
		    		
			     // return res.redirect('/client_home');
    		});
    	}
    });

}




function save (data, coll, shop, callback){
		MongoClient.connect(dburl, function(err, db) {
	    	if(!err){
	    		var collection = db.collection(coll);
				collection.find({"shop_url":shop}).toArray(function(err, docs) {
					console.log(docs);
					if (docs.length == 0){
			    		console.log("No data found");
			    		db.close();
			    		// return res.send("No data error");
			    	}else{
			    		collection.update({"shop_url":shop}
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

function mysqlEscape(stringToEscape){
    return stringToEscape
        .replace("\\", "\\\\")
        .replace("\'", "\\\'")
        .replace("\"", "\\\"")
        .replace("\n", "\\\n")
        .replace("\r", "\\\r")
        .replace("\x00", "\\\x00")
        .replace("\x1a", "\\\x1a");
}

module.exports = {
  sentiment_data : function (req, res){
  	var data = {
		 "name": "flare",
		 "children": [
		      {"name": "Enjoy", "size": 3938},
		      {"name": "abundant", "size": 3812},
		      {"name": "congratulations", "size": 6714},
		      {"name": "free", "size": 743}
		     ]
		}
  	return res.json(data);
  },
  portal_data: function (req, res){
  	var table_name = "tweets";
  	var data = {
  		tweets : "Not connected yet",
  		conversations:"Not connected yet",
  		mentions: "Not connected yet",
  		audience: "Not connected yet",
  		volumes: {
  			label: [],
  			data:[]
  		},
  		overallsentiment : {
  			positive: 0,
  			negative: 0,
  			neutral: 1,
  		},
  		sentiment : {},
  		countries : {},
  		totalLocationSentiment : {}
  	};

  	var campaign_id = req.params.id
  	var totalSample = 0;
// select count(distinct user_id) from `cleaned_data`
  	connection.query('SELECT count(*) as totaltweets FROM '+table_name+' WHERE campaign_id = "'+campaign_id+'"', function(err, rows, fields) {
		 
		  if (err) throw err;

		  data.tweets = rows[0].totaltweets;
		  totalSample = rows[0].totaltweets;
		  // res.json(data);
		connection.query('select count(distinct user_id) as totaltweets FROM '+table_name+' WHERE campaign_id = "'+campaign_id+'"', function(err, rows, fields) {
		 
		  if (err) throw err;

		  data.audience = rows[0].totaltweets;

			connection.query('SELECT created_at , COUNT(*) as tweets FROM '+table_name+' WHERE campaign_id = "'+campaign_id+'" GROUP BY DATE(created_at)', function(err, volumedata, fields) {
		 
				  if (err) throw err;
				  var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
					var month = new Array();
					month[0] = "Jan";
					month[1] = "Feb";
					month[2] = "Mar";
					month[3] = "Apr";
					month[4] = "May";
					month[5] = "Jun";
					month[6] = "Jul";
					month[7] = "Aug";
					month[8] = "Sep";
					month[9] = "Oct";
					month[10] = "Nov";
					month[11] = "Dec";

				  for (var i = volumedata.length - 1; i >= 0; i--) {
				  	// Split timestamp into [ Y, M, D, h, m, s ]
				 //  	var str = volumedata[i].created_at.toString();
					// var t = str.split(/[- :]/);
					var t = volumedata[i].created_at;
					
					var n = month[t.getMonth()]; 
					
					// console.log(volumedata[i].created_at)
					// // Apply each element to the Date function
					// var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
					// var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
				  	data.volumes.label.push(days[t.getDay()]+" "+t.getDate()+" "+n);
				 // data.volumes.label.push(i+1);
				  	data.volumes.data.push(volumedata[i].tweets);
				  };
				  var tomorrow = new Date();
				  var today = new Date();
					tomorrow.setDate(today.getDate()+1);
					data.volumes.label.push(days[tomorrow.getDay()]+" "+tomorrow.getDate()+" "+month[tomorrow.getMonth()]);
				 // data.volumes.label.push(i+1);
				  	data.volumes.data.push(0);

				 connection.query('select COUNT(*) as count, predicted_sentiment from tweets WHERE predicted_sentiment IS NOT NULL AND campaign_id="'+campaign_id+'" GROUP BY predicted_sentiment', function(err, overallsentiment, fields) {
				 		
				 		if (err) throw err;

				 		for (var i = overallsentiment.length - 1; i >= 0; i--) {
				 			var x = overallsentiment[i].predicted_sentiment;
				 			if (x=="positive")
					 			data.overallsentiment.positive= overallsentiment[i].count;
					 		if (x=="negative")
					 			data.overallsentiment.negative= overallsentiment[i].count;
					 		if (x=="neutral")
					 			data.overallsentiment.neutral= overallsentiment[i].count;
					  	}
					  	var randF = Math.floor((Math.random() * totalSample) + 1); 
					  	connection.query('SELECT * FROM `tweets`  WHERE campaign_id="'+campaign_id+ '" LIMIT 1 OFFSET '+randF, function(err, dbdata, fields) {
				 		// console.log("PREPARE stmt FROM 'SELECT * FRM tweets where campaign_id=\""+campaign_id+"\" LIMIT 1 OFFSET ?'; \n SET @COUNT = (SELECT FLOOR(RAND()*COUNT(*)) FROM tweets where campaign_id=\""+campaign_id+"\"); EXECUTE stmt USING @COUNT;");
				 			
					 		
				 				if (err) throw err;
				 				
				 				if (dbdata.length>0)
				 						data.mentions=dbdata[0].tweet_text

				 				connection.query('select * from campaigns where campaign_id = "'+campaign_id+'"', function(err, dbdat, fields) {
					 				
					 				// console.log("Psitive "+positive);
					 				var positive = dbdat[0].positive_topics;
						 				var negative = dbdat[0].negative_topics;
						 				var neutral = dbdat[0].neutral_topics;
					 				var proceed = true;
					 				data.sentiment.positive = {"name":"flare","children":[{"name":"Loading Data...","size":100}]}
						 			data.sentiment.negative = {"name":"flare","children":[{"name":"Loading Data...","size":100}]}
						 			data.sentiment.neutral = {"name":"flare","children":[{"name":"Loading Data...","size":100}]}
					 				if (positive && negative  && neutral ){
					 					
					 					var positiveArray = positive.split(",");
					 					var negativeArray = negative.split(",");
					 					var neutralArray = neutral.split(",");
					 										 				// data.sentiment.positive = {"name":"flare","children":[{"name":"Enjoy","size":3938},{"name":"abundant","size":3812},{"name":"congratulations","size":6714},{"name":"free","size":743}]}
						 				// data.sentiment.negative = {"name":"flare","children":[{"name":"aggressive","size":500},{"name":"beware","size":1000},{"name":"byzantine","size":783},{"name":"defame","size":743}]}
						 				// data.sentiment.neutral = {"name":"flare","children":[{"name":"absolute","size":278},{"name":"assess","size":540},{"name":"distinct","size":399},{"name":"evaluate","size":289}]}
						 				data.sentiment.positive = [];
						 				data.sentiment.negative = [];
						 				data.sentiment.neutral = [];

						 				var temp = [];

						 				for (var i = positiveArray.length - 1; i >= 0; i--) {
						 					var topic = positiveArray[i];
						 					if (topic.length > 3)
						 						temp.push({name: topic, size:3});
						 				};
						 				data.sentiment.positive = {name: "flare", children : temp};
						 				temp = [];
						 				for (var i = negativeArray.length - 1; i >= 0; i--) {
						 					var topic = negativeArray[i];
						 					if (topic.length > 3)
						 						temp.push({name: topic, size:3});
						 				};
						 				data.sentiment.negative = {name: "flare", children : temp};
						 				temp = [];
						 				for (var i = neutralArray.length - 1; i >= 0; i--) {
						 					var topic = neutralArray[i];
						 					if (topic.length > 3)
						 						temp.push({name: topic, size:3});
						 				};
						 				data.sentiment.neutral = {name: "flare", children : temp};
					 				}
					 				


					 				connection.query('SELECT count(*) as counts , country_iso FROM `tweets` where campaign_id="'+campaign_id+'" group by country_iso order by counts desc', function(err, locator, fields) {
					 					var locationapi = [];
					 					// var visitorsData = {
								   //        "US": 398, //USA
								         
								   //      };
								   	var obj={};
					 					for (var i = locator.length - 1; i >= 0; i--) {
						 						var location = locator[i];
						 					
						 					if (location.country_iso.length == 2){
						 						obj[location.country_iso]=location.counts;
						 						// locat
						 					}
						 				};
						 				console.log("Obj " + obj);

						 				data.countries = obj;

						 				connection.query('SELECT predicted_sentiment,country_iso, count(*) as count FROM tweets where campaign_id="'+campaign_id+'" and predicted_sentiment is not null group by country_iso, predicted_sentiment', function(err, country_sentiment, fields){
						 					var totalCntrysentiment = [];
						 					for (var i = country_sentiment.length - 1; i >= 0; i--) {
						 						// country_sentiment[i].country_iso
						 						// country_sentiment[i].count

						 						if (isNaN(country_sentiment[i].country_iso) && country_sentiment[i].country_iso.length==2 && country_sentiment[i].predicted_sentiment.length>4){
													totalCntrysentiment.push({country: country_sentiment[i].country_iso, sentiment: country_sentiment[i].predicted_sentiment, count: country_sentiment[i].count})
						 						}
						 						

						 						
						 					};
						 					// country_sentiment[]
						 					data.totalLocationSentiment = totalCntrysentiment;
						 					console.log(totalCntrysentiment);
						 					res.json(data);
						 				})
					 				
						  				
						  			});
						  		});
					  });

					
				 });
			});
		  
		});
		  
	});
  	
  	
  },

  tweet_get: function(req, res) {
 
		// var mysqlModel = require('mysql-model');
		// var MyAppModel = mysqlModel.createConnection({
		// 	  host     : app.get('settings').database.mysql_host,
		// 	  user     : app.get('settings').database.mysql_user,
		// 	  password : app.get('settings').database.mysql_pass,
		// 	  database :app.get('settings').database.mysql_db,
		// 	});
		// var tweet = MyAppModel.extend({
		// 	    tableName: "tweets",
		// 	});

		// tweet.find('all', {where: "trained_spam = 'NOTSPAM'"}, function(err, rows, fields) {
		//     // Do something... 
		//     console.log(rows);

		// });
		if (!req.session.tweets_done){
			req.session.tweets_done = 0;
		}
		var schema = {
		  "type": "object",
		  "title": "Comment",
		  "properties": {
		    "tweet_id":  {
		      "title": "tweet_id",
		      "type": "string"
		    },
		    "tweet_text":  {
		      "title": "tweet",
		      "type": "string",

		    }
		  }
		};


		var form = [
		  {
		    "key": "tweet_text",
		    "type": "textarea",
		    "placeholder": "Tweet"
		  },
		   {
		    "type": "actions",
		    "items": [
		      {
		        "type": "button",
		        "style": "btn-info",
		        "title": "NOT SPAMM!",
		        "onClick": "sayNo()"
		      },
		      {
		        "type": "button",
		        "style": "btn-danger",
		        "title": "SPAAAAAAAAM!!!",
		        "onClick": "sayYes()"
		      },
		      {
		        "type": "button",
		        "style": "btn-info",
		        "title": "Positive Sentiment",
		        "onClick": "sayPositivesentiment()"
		      },
		      {
		        "type": "button",
		        "style": "btn-info",
		        "title": "Negative Sentiment",
		        "onClick": "sayNegativesentiment()"
		      },
		      {
		        "type": "button",
		        "style": "btn-info",
		        "title": "Neutral Sentiment",
		        "onClick": "sayNeutralsentiment()"
		      }
		    ]}
		];

		var offset = Math.floor((Math.random() * 3656) + 1);
		 
		connection.query('SELECT * FROM training_data WHERE trained_spam IS NULL  LIMIT 1 OFFSET '+offset, function(err, rows, fields) {
		  if (err) throw err;
		  var model = {
		  	id : rows[0].tweet_id,
		  	tweet : rows[0].tweet_text,
		  }
		 var data = {};
		 data.schema = schema;
		 data.form = form;
		 data.model = rows[0];
		 console.log(rows[0]);
		  res.json(data);
		});
		

		//connection.end();

  },

  sentiment_positive: function(req, res){
  	tweet_id = req.body.data.id;
  	tweet_text = req.body.data.tweet_text;
  	console.log(req.body.data);
  	var connection = mysql.createConnection({
	  host     : app.get('settings').database.mysql_host,
	  user     : app.get('settings').database.mysql_user,
	  password : app.get('settings').database.mysql_pass,
	  database :app.get('settings').database.mysql_db,
	});
  	//connection.connect();
  	tweet_text= String(tweet_text);
  	//tweet_text = tweet_text.replace('"', '\"');
  	//tweet_text = tweet_text.replace(/"/g, "\'");
  	tweet_text=connection.escape(tweet_text);
  	console.log('UPDATE `training_data` SET `trained_sentiment`="positive" WHERE tweet_text= '+tweet_text+' AND screen_name = '+connection.escape(req.body.data.screen_name)+'');
  	connection.query('UPDATE `training_data` SET `trained_sentiment`="positive" WHERE tweet_text= '+tweet_text+'', function(err, rows, fields) {
  		if (!req.session.tweets_done){
  			req.session.tweets_done = 0;
  		}
		 	res.send("Contributions : " + req.session.tweets_done);
		 	console.log(tweet_id);
		 	console.log("ERRORS : "+err);
		});

  	req.session.tweets_done = req.session.tweets_done + 1;
		 
		//connection.end();

  },

  sentiment_negative: function(req, res){
  	  	tweet_id = req.body.data.id;
  	tweet_text = req.body.data.tweet_text;
  	console.log(req.body.data);
  	var connection = mysql.createConnection({
	  host     : app.get('settings').database.mysql_host,
	  user     : app.get('settings').database.mysql_user,
	  password : app.get('settings').database.mysql_pass,
	  database :app.get('settings').database.mysql_db,
	});
  	//connection.connect();
  	tweet_text= String(tweet_text);
  	//tweet_text = tweet_text.replace('"', '\"');
  	//tweet_text = tweet_text.replace(/"/g, "\'");
  	tweet_text=connection.escape(tweet_text);
  	console.log('UPDATE `training_data` SET `trained_sentiment`="negative" WHERE tweet_text= '+tweet_text+' AND screen_name = '+connection.escape(req.body.data.screen_name)+'');
  	connection.query('UPDATE `training_data` SET `trained_sentiment`="negative" WHERE tweet_text= '+tweet_text+'', function(err, rows, fields) {
  		if (!req.session.tweets_done){
  			req.session.tweets_done = 0;
  		}
		 	res.send("Contributions : " + req.session.tweets_done);
		 	console.log(tweet_id);
		 	console.log("ERRORS : "+err);
		});
  	req.session.tweets_done = req.session.tweets_done + 1;

  },

  sentiment_neutral: function (req, res){
  	  	tweet_id = req.body.data.id;
  	tweet_text = req.body.data.tweet_text;
  	console.log(req.body.data);
  	var connection = mysql.createConnection({
	  host     : app.get('settings').database.mysql_host,
	  user     : app.get('settings').database.mysql_user,
	  password : app.get('settings').database.mysql_pass,
	  database :app.get('settings').database.mysql_db,
	});
  	//connection.connect();
  	tweet_text= String(tweet_text);
  	//tweet_text = tweet_text.replace('"', '\"');
  	//tweet_text = tweet_text.replace(/"/g, "\'");
  	tweet_text=connection.escape(tweet_text);
  	console.log('UPDATE `training_data` SET `trained_sentiment`="neutral" WHERE tweet_text= '+tweet_text+' AND screen_name = '+connection.escape(req.body.data.screen_name)+'');
  	connection.query('UPDATE `training_data` SET `trained_sentiment`="neutral" WHERE tweet_text= '+tweet_text+'', function(err, rows, fields) {
  		if (!req.session.tweets_done){
  			req.session.tweets_done = 0;
  		}
		 	res.send("Contributions : " + req.session.tweets_done);
		 	console.log(tweet_id);
		 	console.log("ERRORS : "+err);
		});

  	req.session.tweets_done = req.session.tweets_done + 1;

  },

  tweet_post: function(req, res){
  	//tweet_id = req.body.data;
  	tweet_text = req.body.data.tweet_text;
  	console.log(req.body.data);
  	var connection = mysql.createConnection({
	  host     : app.get('settings').database.mysql_host,
	  user     : app.get('settings').database.mysql_user,
	  password : app.get('settings').database.mysql_pass,
	  database :app.get('settings').database.mysql_db,
	});
  	//connection.connect();
  	tweet_text=connection.escape(tweet_text);
  	console.log('UPDATE `training_data` SET `trained_spam`="SPAM" WHERE tweet_text = '+tweet_text+'');
  	connection.query('UPDATE `training_data` SET `trained_spam`="SPAM" WHERE tweet_text = '+tweet_text+'', function(err, rows, fields) {
  		if (!req.session.tweets_done){
  			req.session.tweets_done = 0;
  		}
		 	res.send("Contributions : " + req.session.tweets_done);
		 	console.log("ERRORS : "+err);
		});

  	req.session.tweets_done = req.session.tweets_done + 1;
		 
		//connection.end();
  	

  },
  tweet_post_notspam: function(req, res){
  	tweet_id = req.body.data.id;
  	tweet_text = req.body.data.tweet_text;
  	console.log(req.body.data);
  	var connection = mysql.createConnection({
	  host     : app.get('settings').database.mysql_host,
	  user     : app.get('settings').database.mysql_user,
	  password : app.get('settings').database.mysql_pass,
	  database :app.get('settings').database.mysql_db,
	});
  	//connection.connect();
  	tweet_text= String(tweet_text);
  	//tweet_text = tweet_text.replace('"', '\"');
  	//tweet_text = tweet_text.replace(/"/g, "\'");
  	tweet_text=connection.escape(tweet_text);
  	console.log('UPDATE `training_data` SET `trained_spam`="NOTSPAM" WHERE tweet_text= '+tweet_text+' AND screen_name = '+connection.escape(req.body.data.screen_name)+'');
  	connection.query('UPDATE `training_data` SET `trained_spam`="NOTSPAM" WHERE tweet_text= '+tweet_text+'', function(err, rows, fields) {
  		if (!req.session.tweets_done){
  			req.session.tweets_done = 0;
  		}
		 	res.send("Contributions : " + req.session.tweets_done);
		 	console.log(tweet_id);
		 	console.log("ERRORS : "+err);
		});
		 
		//connection.end();
  	
	req.session.tweets_done = req.session.tweets_done + 1;
  },


  settings_get: function (req, res){
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
		    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
		}
		var data = {
	    	  "type" : "object",
			  "properties": {
			  }
			}

		
		var hiddenelements = ["_id", "shop_url", "pushbullet_token", "first_install", "webhook_identifier", "access_token", "dummy_token"];
		var field_types = [{"enable_notifications":"boolean"},{"notify_new_order":"boolean"},{"notify_add_product":"boolean"},{"notify_low_quantity":"boolean"},{"notify_new_customer":"boolean"}, {"item_alert_quantity":"integer"}];
		var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
		getdbData(shopifyOptionstemp.shop, "users",function(result){

				for (i=0; i < hiddenelements.length; i++){
					current = hiddenelements[i];
					delete result[current];
				}

				for (x=0; x<field_types.length; x++){
					console.log("So "+field_types[x]);

				}

				for(key in result) {
					console.log("Key : "+key);
					data["properties"][key]={
				    	"type" : "string",
				    	"minLength" : "2",
				    	"title" : key
					}
					found = false;

					for (x=0; x<field_types.length; x++){
						fd = field_types[x];
						console.log("Outer Loop " + fd);
						for(key2 in fd) {
							// console.log("Inner Loop "+ key2);
							if (key2 == key){
								data["properties"][key].type=field_types[x][key2];
							}
						}
					}
					

					// if ((key in field_types[key])){
					// 	data["properties"][key].type=field_types[key];
					// }
				}
				var returnObject = {
					"schema" : "",
					"model": "",
					"form" : ""
				};
					
				var model = {};
				// var form = [
				// 	"*",
				// 	{
				// 		type: "submit",
				// 		title: "Save"

				// 	}
				// ]
				var form =   [
					{
				      type: "template",
				      name: 'Ninja',
				      restoreStuff: function() { console.log('oh noes!'); }
				    },

					{
				    "type": "fieldset",
				    "items": [
				      {
				        "type": "tabs",
				        "style" : "nav-tabs-custom",
				        "tabs": [
				           {
				            "title": "General Settings",
				            "items": [
				              
				              {
				              	"title": "Your Store's name",
				                "key": "store_name",
				               	"description": "This name will be displayed on the Subscription page of your site."


				              },
				              {
				              	"title" : "Low Item Quantity",
				              	"key" : "item_alert_quantity",
				               	"description": "You'll receive a notification when your items get in lower quantity than the one specified here."

				              }				              
				            ]
				          },
				          {
				            "title": "Enable/Disable Notifications",
				            "items": [
				              {
				              	"key" : "notify_new_order",
				              	"title" : "Notify me of new orders"
				              },
				              {
				              	"key" : "notify_new_customer",
				              	"title" : "Notify me of new customers"
				              },
				              {
				              	"key" : "notify_low_quantity",
				              	"title" : "Notify me when products are in low quantity"
				              },
				              {
				              	"key" : "notify_add_product",
				              	"title" : "Notify subscribed users when products are restocked"
				              }
				              
				            ]
				          },
				          {
				            "title": "Message Customization",
				            "items": [
				              {
				              	"key" : "message_low_quantity",
				              	"title" : "Message to be sent when products are in low quantity"
				              },
				              {
				              	"key" : "message_add_product",
				              	"title" : "Message to be sent to users when a product is added back to stock"
				              }
				            ]
				          },
				          {
				            "title": "UI Customization",
				            "items": [
				              {
				              	"key" : "widget_client_html",
				              	"title" : "Push Notification subscription Widget",
				              	"type" : "textarea",
				              	'fieldHtmlClass' : 'textarea-notifier',
				              	'htmlClass' : 'textarea-notifier-container',
				              	"description": "Make sure the changes you're making to the HTML do still keep it inline, otherwise the html won't work."
				              },
				              {
						        'type': 'button',
      							'style' : 'btn-info pull-right',
      							'title': 'Restore default',
      							"onClick" : 'restoreStuff()'
						       
						      }
				            ]
				          }
				        ]
				      }
				    ]
				  },
				  {
				    "type": "actions",
				    "items": [
				      {
				        "type": "submit",
				        "style": "btn-info",
				        "title": "Save Configuration"
				      }
				    ]
				  }
				  ]


				for(key in result) {
					model[key]=result[key];
				}


				returnObject.schema = data;
				returnObject.model = model;
				returnObject.form = form;
				console.log(returnObject);
				return res.json(returnObject);
			});


  },

 notifications_get : function (req, res){
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
		    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
		}
		var data = {
	    	  "type" : "object",
			  "properties": {
			  }
			}

		
		var hiddenelements = ["_id", "pushbullet_token"];
		var field_types = {"enable_notifications":"boolean"};
		var Shopifytemp = new shopifyAPI(shopifyOptionstemp);

		data["properties"]["title"]={
			    	"type" : "string",
			    	"minLength" : "2",
			    	"title" : "Title",
			    	"description": "The title of the Notification"
		}
		data["properties"]["content"]={
	    	"type" : "string",
	    	"minLength" : "2",
	    	"title" : "Content"
		}
			

			var returnObject = {
				"schema" : "",
				"model": ""
			};
			
			var model = {};

			// for(key in result) {
			// 	model[key]=result[key];
			// }

			returnObject.schema = data;
			returnObject.model = model;
			console.log(returnObject);
			return res.json(returnObject);


 },


 notifications_post: function (req, res){
 	var PushBullet = require('pushbullet');
 	pbtoken = req.session.pbtoken;

 	console.log("PB TOken : "+pbtoken);
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
	    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
	}
	

	if (app.get('settings').env == 'development') {
	    pbtoken= app.get('settings').development.pbtoken
	    
	}	

	var pusher = new PushBullet(pbtoken);

	getdbData(shopifyOptionstemp.shop,"users", function(result){
		pbchannel = result.pushbullet_channel;
		deviceParams = {"channel_tag ":""};

		// getdbData(shopifyOptionstemp.shop, )
		deviceParams.channel_tag=pbchannel;
		// deviceParams = "coolshopify";
		data = req.body.data;
		noteTitle = data.title;
		noteBody = data.content;

		pusher.note(deviceParams, noteTitle, noteBody, function(error, response) {
		    // response is the JSON response from the API
		    console.log(response);
		    res.send("OK");
		});
	})


	

 },


 settings_post: function (req, res){
 	console.log(req.body.data);
 	data = req.body.data;
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
	    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
	}
	// var minify = require('html-minifier').minify;
	// var result = minify(data.widget_client_html, {
	//   removeAttributeQuotes: false
	// });	
	// var result = data.widget_client_html;
	// result = String(result);
	// result = result.replace("\n", "");
	// result = result.replace(/\n/g, "");
	// data.widget_client_html = result;
	console.log("\n\n===============Log\n\n==============\n");
	// console.log(result);
 	save (data, "users", shopifyOptionstemp.shop,function(){
		return res.send("OK");
	// var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 // 		Shopifytemp.get('/admin/pages.json', function(err, data2, headers2){
	// 	    // console.log(data); // Data contains product json information
	// 	    // console.log(headers); // Headers returned from request
	// 	    pagesdata = JSON.parse(JSON.stringify(data2));
	// 	    console.log("\n\n====="+pagesdata.pages.length+"=====\n\n");
	// 	    for (i=0; i < pagesdata.pages.length; i++){
	// 	    	console.log("\n\n===========\n\n");
	// 	    	// console.log(page[0].id);
	// 	    	page = pagesdata.pages[i];
	// 	    	if (page.title=="Notification Subscription"){
	// 	    		console.log("^^^^^^^"+page.id+"^^^^^^^");
	// 	    		html = "Subscribe to our Pushbullet channel : <b>"+req.body.data.pushbullet_channel+"</b>";
	// 	    		var put_data = {
	// 				  "page": {
	// 				  	"id": page.id,
	// 				    "body_html": html
	// 				  }
	// 				}

	// 	    		Shopifytemp.put('/admin/pages/'+page.id+'.json', put_data ,function(err, data3, headers3){
	// 	    			console.log("\n\nPUT "+data+"Updated page "+page.id+"\n\n");
	// 	    			return res.send("OK");
	// 	    		});
	// 	    	}
	// 	    }

		    
	// 	});
 		
 	})
 	
 },


 install_post : function(req, res){
 	// Step 1 : Connect Shopify
 	// Step 2 : Connect Pushbullet
 	// Step 3 : Install Webhooks and Pages;
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
	    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
	}	
	var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	console.log(req.body);
 	
 	if (req.body.data=='step1'){
 		// app pushbullet_appA_link
 		link = app.get('settings').pushbullet.pushbullet_appA_link;
 		returndata={
 			"link":link
 		}
 		return res.json(returndata);
 	}
 	if (req.body.data=='step2'){
 		if (req.body.type=="get"){
 			var link = "a";
 			returndata={
	 			"link":link
	 		}
 			return res.json(returndata);
 		}else if (req.body.type=="submit"){
 			// UsersModel.update
 			UsersModel.findOneAndUpdate({shop_url:shopifyOptionstemp.shop}, {pushbullet_channel: req.body.channel}, {}, function(err, result){
 				if (err){
 					console.log("Error");
 				}
 				return res.send("OK");
 			});
 			
 		}
 		console.log("Step 2");
 		// UsersModel.update
 	}
 	if (req.body.data=='step3'){
 		var md5 = require('MD5');
		endpoint = md5(shopifyOptionstemp.shop);
 		var post_data = {
			  "webhook": {
			    "topic": "products\/update",
			    "address": "http:\/\/"+app.get('settings').domain+"/webhooks/products_update?store="+endpoint,
			    "format": "json"
			  }
			}
		Shopifytemp.post('/admin/webhooks.json', post_data, function(err, data, headers){
		  // console.log(data);
		  var post_data = {
			  "webhook": {
			    "topic": "products\/create",
			    "address": "http:\/\/"+app.get('settings').domain+"/webhooks/products_create?store="+endpoint,
			    "format": "json"
			  }
			}
		  Shopifytemp.post('/admin/webhooks.json', post_data, function(err, data, headers){
		  	var post_data = {
			  "webhook": {
			    "topic": "orders\/create",
			    "address": "http:\/\/"+app.get('settings').domain+"/webhooks/all?store="+endpoint+"&hook=orders_create",
			    "format": "json"
			  }
			}
		  		Shopifytemp.post('/admin/webhooks.json', post_data, function(err, data, headers){
  					script_name = endpoint;
					post_data_js = {
					  "script_tag": {
					    "event": "onload",
					    "src": "http:\/\/"+app.get('settings').domain+"\/public\/"+script_name+".js"
					  }
					}
				  	Shopifytemp.post('/admin/script_tags.json', post_data_js ,function(err, data, headers){
		  				// res.send("OK");
		  				var post_data = {
						  "webhook": {
						    "topic": "customers\/create",
						    "address": "http:\/\/"+app.get('settings').domain+"/webhooks/all?store="+endpoint+"&hook=customers_create",
						    "format": "json"
						  }
						}
		  				Shopifytemp.post('/admin/webhooks.json', post_data ,function(err, data, headers){
		  				// res.send("OK");
			  				 UsersModel.findOneAndUpdate({shop_url:shopifyOptionstemp.shop}, {first_install: false}, {}, function(erroruser, result){
				 				if (erroruser){
				 					console.log("Error");
				 				}
				 				return res.send("OK");
					 		 });
			  			});
		  				 
		  			});

		  		});

		  		
		  });
		  
		});
 	}
 	
 },

 install_get : function (req, res){


 	var data = {
	    	  "type" : "object",
			  "properties": {
			  }
	}

		
		// var hiddenelements = ["_id", "pushbullet_token"];
		// var field_types = {"enable_notifications":"boolean"};
		// var Shopifytemp = new shopifyAPI(shopifyOptionstemp);

		data["properties"]["title"]={
			    	"type" : "hidden",
			    	"minLength" : "2",
			    	"title" : "Title"
		}

	// var data2 = []; 
	// data2.push(data);

	// var data = {
	// 	  "type" : "action",
	// 	  "items": {
	// 	  }
	// }
	// data["type"]="action"

	// data["properties"]["actions"]

	


	// data["items"][0]={
	// 	"type" : "button",
	// 	"title" : "Cancel",
	// 	"onClick" : "Cancel()"
	// }

	// data2.push(data);

	var returnObject = {
			"schema" : "",
			"model": "",
			"form" : ""
	};
		
	var model = {};
	var form = [
		"*",
		{
			type: "submit",
			title: "Save"

		}
	]

	var form= ["*", {
			type: "actions",		 
			"items": [
		    		{ type: 'button', title: 'Step 1',onClick: "install('step1')" },
		    		{ type: 'button', title: 'Step 2', onClick: "install('step2')" },
		    		{ type: 'button', title: 'Step 3',onClick: "install('step3')" }
			]
	}]



		// for(key in result) {
		// 	model[key]=result[key];
		// }

	returnObject.schema = data;
	returnObject.model = model;
	returnObject.form = form;
	console.log(returnObject);
	return res.json(returnObject);
	// data["properties"]["content"]={
	// 	"type" : "string",
	// 	"minLength" : "2",
	// 	"title" : "Content"
	// }
 }
}