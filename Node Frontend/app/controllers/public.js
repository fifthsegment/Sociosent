var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
// var ShopifyModel = require(path.join(process.cwd(), 'app', 'models', path.basename(__filename)));
// comment
var shopifyAPI = require('shopify-node-api');

var MongoClient = require('mongodb').MongoClient;

var dburl = app.get('settings').database.connectionstring;


var generalFuncs = require(path.join(process.cwd(), 'app', 'models', path.basename('generalmodels')));



module.exports = {
  serve: function(req, res) {
  	console.log("Path : "+path.join(process.cwd(), 'public','clients', path.basename('notifier.js')));
  	filename = req.params.id;
  	if (filename.indexOf(".js")>-1){
  		shop_identifier = filename.substr(0, filename.indexOf(".js"));
  		generalFuncs.getdbData({"webhook_identifier":shop_identifier},"users", function(result){
  			if (result=="empty")
  				return res.send("No script found");
  			res.setHeader("Content-Type", "application/javascript");
			  	res.contentType("text/javascript");
			  	myurl = app.get('settings').url;
			  	console.log("database result is \n ===========\n");
			  	console.log(result);
			  	// TODO: clienthtml = result.widget_client_html;
			  	var minified = result.widget_client_html;
				minified = String(minified);
				minified = minified.replace("\n", "");
				minified = minified.replace(/\n/g, "");
				
			  	clienthtml = minified;
			  	// clienthtml = "<center><h2 style='position:relative; top:0.4em; color:white; font-weight: 900; line-height: 200%; text-shadow: 2px 2px 4px #000000;'>Notify me when this Product is availible <a href='{{product_url}}' onclick='' target='_blank' style='position:relative; top: -0.12em; border-radius:3px;-webkit-box-shadow:none;box-shadow:none;border:1px solid transparent;color:#fff;background-color:#384452;border-color:#384452;margin:4px;display:inline-block;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:normal;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent;border-radius:4px;border-radius: 3px;-webkit-box-shadow: none;box-shadow: none;border: 1px solid transparent;'>Notify Me</a></h2></center>";

			  	return res.render('notifier_public_js', { title: 'Notifier', shop: result.shop_url, appurl : myurl, scriptname : shop_identifier, clienthtml : clienthtml});
  		})
  	}else if (filename.indexOf(".html")>-1){
  		shop_identifier = filename.substr(0, filename.indexOf(".html"));
  		prd_url = req.query.product;
  		pbcallback_url = app.get('settings').url+"/pushconnect?"+shop_identifier+"&product="+prd_url;
  		pushbullet_clientid = 'aptEoTnsDxmBhgJ03EtwbMI7tQyhAO9X';
  		pblink =  'https://www.pushbullet.com/authorize?client_id='+pushbullet_clientid+'&redirect_uri='+pbcallback_url+'&response_type=code&scope=everything';

  		generalFuncs.getdbData({"webhook_identifier":shop_identifier},"users", function(result){
  			req.session.product = prd_url;
  			req.session.shop_identifier = shop_identifier
  			req.session.shop_url = result.shop_url;
  			req.session.store_name = result.store_name;
  			req.session.access_token = result.access_token;
  			return res.render('notifier_public_html', { title: 'Notifier', shop: result.shop_url, channel: result.pushbullet_channel, product: prd_url, pushbulletconnector: pblink, store_name: result.store_name});
  		});
  	}
  },

  pushconnect : function(req, res){
  	code = req.query.code;
  	shop_identifier = req.session.shop_identifier;
  	shop_url = req.session.shop_url;
  	product = req.session.product;
  	store_name_val = req.session.store_name;
  	if (!req.session.product){
  		return res.send("Unexpected input");
  	}
  	if (!req.query.code){
  		return res.send("Unexpected input");
  	}
  	var shopifyOptionstemp = {
        shop: shop_url, // MYSHOP.myshopify.com
        shopify_api_key: app.get('settings').shopify.api, // Your API key
        shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
        shopify_scope: app.get('settings').shopify.scope,
        redirect_uri : app.get('settings').shopify.redirect_uri,
	}

	shopifyOptionstemp.access_token = req.session.access_token;

	///if (app.get('settings').env == 'development') {
	//    shopifyOptionstemp.access_token = app.get('settings').development.access_token
	//    shopifyOptionstemp.shop=app.get('settings').development.shop+".myshopify.com"
	//}	

	//var simpleBarrier = require('simple-barrier');
	//var barrier = simpleBarrier();
    var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
 	//output = '';
  	Shopifytemp.get('/admin/products/'+product+'.json', function(err, data, headers){
  		var product_title = data.product.title;
  		var product_handle = data.product.handle;

	  	var request = require('request');
	  	pushbullet_clientid = 'aptEoTnsDxmBhgJ03EtwbMI7tQyhAO9X';
	  	pushbullet_secret = 'StpOzSoRSTDajE73ojqTSmTxVpTWyQba';
	  	request.post({url:'https://api.pushbullet.com/oauth2/token', form: {grant_type: 'authorization_code', client_id:pushbullet_clientid, client_secret: pushbullet_secret, code: req.query.code}}, function(err,httpResponse,body){
	  		// pbtoken=body.access_token;
	  		MongoClient.connect(dburl, function(err, db) {
	  			// if (!req.session.store){
	  			// 	return res.send("Please login to this app first, by visiting the main page.");
	  			// }
				if(!err){
					var collection = db.collection('storenotifiercustomers');
					var querystring = require('querystring');
				  	data = body;
				  	data = querystring.unescape(data);
				  	pushbulletObj = JSON.parse(data);
					req.session.pbtoken = pushbulletObj.access_token;
					generalFuncs.getPushbulletprofile(pushbulletObj.access_token, function(err, user){
						collection.find({"product":product
							// customers_subscribed{
							// 	$elemMatch: {
				   			//                   email: user.email
			    			//             	}
			    			//  }
						}).toArray(function(err, docs) {
							if (docs.length == 1){
								// docs[0].customers_subscribed.push(product);
								found = false;
								docs[0].customers_subscribed.forEach(function(customer, i){
									if (customer.email==user.email){
										found = true;
									}
								});
								pb = {
									"email" : user.email,
									"token" : pushbulletObj.access_token
								}

								if(!found){
									users = docs[0].customers_subscribed;
									users.push(pb);
									collection.update({"product":product}
									    , { $set: { "customers_subscribed" : users } }, function(err, result) {
									    console.log("Updated the document");
									    db.close();
									    return res.render('notifier_public_done_html', {store_name: store_name_val});
									    // return res.send("OK");
									});
									// collection.insert({"shop_url":shop_url, 
									// 	"webhook_identifier": shop_identifier,
									// 	"product": product,
									// 	"customers_subscribed" : users
									// }, function(err, result){
									// 	console.log("result ="+result);
									// 	db.close();
										
									// })

								}else{
									db.close();
									return res.render('notifier_public_done_html', {store_name: store_name_val});
								}

								// return res.send("OK");
								// console.log(docs[0].products);
								// collection.update({"pushbullet_token":pushbulletObj.access_token}
								//     , { $set: { "products" : product } }, function(err, result) {
								//     console.log("Updated the document");
								// });
								  
							}else{
								pb = {
									"email" : user.email,
									"token" : pushbulletObj.access_token
								}
								users = [];
								users.push(pb);
								collection.insert({"shop_url":shop_url, 
									"webhook_identifier": shop_identifier,
									"product": product,
									"customers_subscribed" : users,
									"product_title" : product_title,
									"product_handle" : product_handle,
								}, function(err, result){
									console.log("result ="+result);
									db.close();
									// return res.send("OK");
									return res.render('notifier_public_done_html', {store_name: store_name_val});
								})
								//db.close();
							}
						
						});
					});
				}
			});
		});
  	});



  	// res.send(product + " " + shop_identifier);
  	// res.send(product+" = "+shop_identifier);
  }
}