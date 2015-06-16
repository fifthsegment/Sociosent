var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var shopifyAPI = require('shopify-node-api');

var MongoClient = require('mongodb').MongoClient;

var dburl = app.get('settings').database.connectionstring;

module.exports = {
	push : function(req, res, pbtoken,title,  msg, callback){
		var PushBullet = require('pushbullet');
		var pusher = new PushBullet(pbtoken);
	    pusher.me(function(err, response) {
            user = response;
            pusher.note(user.email, msg, title, function(error, response) {
              // console.log(response);
              // db.close();
              // return res.send("OK");
              callback(error, response);
            });
        });
	},

	getdbData : function (search_json,coll, callback){
		MongoClient.connect(dburl, function(err, db) {
	    	if(!err){
	    		var collection = db.collection(coll);
				collection.find(search_json).toArray(function(err, docs) {
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
	},


	getPushbulletprofile : function (pbtoken, callback){
		var PushBullet = require('pushbullet');
		var pusher = new PushBullet(pbtoken);
	    pusher.me(function(err, response) {
            callback(err, response);            
        });
	},

	dbsave : function(object, collectionname, callback){
		MongoClient.connect(dburl, function(err, db) {
			var collection = db.collection(collectionname);
			collection.insert(object);
			db.close();
			callback();
		});
	}


}