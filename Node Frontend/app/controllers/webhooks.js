var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
// var ShopifyModel = require(path.join(process.cwd(), 'app', 'models', path.basename(__filename)));
var shopifyAPI = require('shopify-node-api');

var MongoClient = require('mongodb').MongoClient;

var dburl = app.get('settings').database.connectionstring;
var generalFuncs = require(path.join(process.cwd(), 'app', 'models', path.basename('generalmodels')));
var UsersModel = require(path.join(process.cwd(), 'app', 'models', path.basename('users')));



module.exports = {
  product_created: function(req, res) {
    var store = req.query.store;
    console.log("Store : - "+store);
    dburl = app.get('settings').database.connectionstring;
    // console.log(req);
    MongoClient.connect(dburl, function(err, db) {
      // assert.equal(null, err);
      console.log("Connected correctly to server");
      var collection = db.collection('users');

      collection.find({"webhook_identifier":store}).toArray(function(err, docs) {
        if (docs.length != 0){
            var shop = docs[0];
            dbpbtoken = docs[0].pushbullet_token;
            var querystring = require('querystring');
            dbpbtoken = querystring.unescape(dbpbtoken);
            pushbulletObj = JSON.parse(dbpbtoken);
            pbtoken = pushbulletObj.access_token;
            var PushBullet = require('pushbullet');
            var pusher = new PushBullet(pbtoken);



            shopifydata = JSON.parse(JSON.stringify(req.body));
            // res.send(req.session.pbtoken);
            
            // console.log("\n\n======"+shopifydata.variants.length+"=======\n\n");
            // variants = shopifydata.variants
            // for (i=0; i < variants.length; i++){
           
            //   console.log("\n\n======Quantity : "+variants[i].inventory_quantity+"=======\n\n");
            // }

            pusher.me(function(err, response) {
                user = response;
                pusher.note(user.email, "Product Added", "Product added", function(error, response) {
                  console.log(response);
                  db.close();
                  return res.send("OK");
                });
            });
            
          }

      });

      // var fs = require('fs');
      // fs.writeFile("token.txt", req, function(err) {
      //     if(err) {
      //        return console.log(err);
      //     }
      //     // shopifyOptions.access_token = data["access_token"];
      //     console.log("The file was saved!");
      // });

      // console.log(req.body);

      console.log("Webhook called");

      // res.send("OK");



       // collection.insert({"response": req.body}, function(err, result) {
       //    // assert.equal(err, null);
       //    // assert.equal(3, result.result.n);
       //    // assert.equal(3, result.ops.length);
       //    console.log("Inserted req to webhookresponses");
       //    return res.send(req.toString());
       //    // callback(result);
       //  });




      

      // collection.find({}).toArray(function(err, docs) {
      //   // assert.equal(err, null);
      //   // assert.equal(2, docs.length);
      //   console.log("Found the following records");
      //   // console.dir(docs)
      //   console.log(docs);
      //   // callback(docs);
      // });



      // db.close();
    });

  },


  product_updated : function (req, res){
    generalFuncs.dbsave(req.body, "webhookresponses", function(){
      var store = req.query.store;
      variant_id = "1267063408";
      // if (docs[0].notify_add_product){
      MongoClient.connect(dburl, function(err, db) {
        var collection = db.collection('users');
        collection.find({"webhook_identifier":store}).toArray(function(err, docs) {
          if (docs.length != 0){
            shop_url = docs[0].shop_url;
            console.log ("Shop" + shop_url);
            console.log("Request Body Length : " +req.body.variants.length);
            variants = req.body.variants;
            var product_id = req.body.id;
            product_id = product_id.toString();
            var storenotifiercustomers_collection = db.collection('storenotifiercustomers');
            var goodvariants = [];
            variants.forEach(function(variant, i){
              variant_id = variant.id;
              variant_id = variant_id.toString();
              console.log("variant : "+variant_id);
              if (variant.inventory_quantity>0){
                var prep_variant = {"id":variant_id, "title": variant.title};
                goodvariants.push(prep_variant);
               }else{
                  // return res.send("OK");
               }
              // }
            });
            var bullet_message = "Updated Variant(s) \n";
            for(i=0; i<goodvariants.length;i++){
              bullet_message += req.body.title+" "+goodvariants[i].title + "\n"
            }
            if (goodvariants.length > 0){
              if (docs[0].notify_add_product){
                storenotifiercustomers_collection.find({"webhook_identifier":store, "product":product_id}).toArray(function(err, users) {
                  console.log("ERROR : "+err);
                  console.log("Variant found in DDBBBD!");
                  console.log(users);
                  if (users.length==1){
                    csubscribed = users[0].customers_subscribed;
                    console.log("csubscribed" + csubscribed);
                    csubscribed.forEach(function(user, j){
                      console.log("User "+user.token);
                      product = req.body;
                      // message = "{{product.title}} Added to the store";
                      message = String(docs[0].message_add_product);
                      message = message.replace("{{product.title}}", product.title)
                      console.log("Message "+message);
                      generalFuncs.push(req, res, user.token,message,  bullet_message, function(err, response){
                      });
                    })
                    db.close();
                    return res.send("OK");
                  }else{
                    db.close();
                    return res.send("OK");
                  }
                }); //End toArray()
              }
            }
          }else{
            db.close();
            res.send("No data found");
          }
        });
      });//End db connection
     // }
    });
  },

  handle_customer_create: function(req, res, shopifydata,currentuser ,pbtoken,callback){
      var message = "A new customer registered on your store";
      if (currentuser.notify_new_customer){
          generalFuncs.push(req, res, pbtoken,message,  message, function(err, response){
          console.log("WEBHOOK: CUSTOMER_CREATE | Sending Notification");
          callback();
        });
      }else{
        callback();
      }

  },

  general_handle: function (req, res){
    var loggly = require('loggly');
    var client = loggly.createClient({token: "15465918-bcd9-4654-b862-3824a7d2b652",subdomain: "abdullahi1",tags: ["NodeJS"],json:true});
    // client.log(req.body);
    var store = req.query.store;
    var current_webhook = req.query.hook;
    console.log("Store : - "+store);
    dburl = app.get('settings').database.connectionstring;
    MongoClient.connect(dburl, function(err, db) {
      console.log("Connected correctly to server");
      var collection = db.collection('users');
      collection.find({"webhook_identifier":store}).toArray(function(err, docs) {
        if (docs.length != 0){
          // if (docs[0].notify_low_quantity){

            console.log("\n\n\n\n================\n\n\n\n");
            // console.log(req.body);
            var shop = docs[0];
            dbpbtoken = docs[0].pushbullet_token;
            var querystring = require('querystring');
            dbpbtoken = querystring.unescape(dbpbtoken);
            pushbulletObj = JSON.parse(dbpbtoken);
            pbtoken = pushbulletObj.access_token;
            var PushBullet = require('pushbullet');


            shopifydata = JSON.parse(JSON.stringify(req.body));

            if (current_webhook=="customers_create"){
                module.exports.handle_customer_create(req, res, shopifydata, pbtoken,docs[0],function(){
                    return res.send("OK");
                });
            }
            else if (current_webhook=="orders_create"){
                //Get the current webhook
                hook = req.query.hook;

                if (docs[0].notify_new_order){
                  messageorder = "You have a new order on your store";
                  generalFuncs.push(req, res, pbtoken,messageorder,  messageorder, function(err, response){
                      console.log("sent message");
                  });
                }

                console.log("Data : "+shopifydata.line_items.length);
                items = shopifydata.line_items

                savethis = {"response":req.body, "hook": hook};
                var webhookresponses = db.collection("webhookresponses");
                webhookresponses.insert(savethis, function(err, result) {
                  if (err)
                      console.log("\n\n\n\n======ERROR: "+err+"==========\n\n\n\n");
                  console.log("\n\n\n\n=======RESULT"+result+"=========\n\n\n\n");

                  var shopifyOptionstemp = {
                    shop: docs[0].shop_url, // MYSHOP.myshopify.com
                    shopify_api_key: app.get('settings').shopify.api, // Your API key
                    shopify_shared_secret: app.get('settings').shopify.creds, // Your Shared Secret
                    shopify_scope: app.get('settings').shopify.scope,
                    redirect_uri : app.get('settings').shopify.redirect_uri,
                  }
                  lowquantity_indicator = docs[0].item_alert_quantity;
                  shopifyOptionstemp.access_token = docs[0].access_token;

                  var Shopifytemp = new shopifyAPI(shopifyOptionstemp);
                  items = shopifydata.line_items
                  console.log("Getting line items: total = "+items.length);

                  items.forEach(function(item, i){
                    // console.log(item);
                     Shopifytemp.get('/admin/products/'+item.product_id+'.json', function(err, data, headers){
                          productdata = JSON.parse(JSON.stringify(data));
                          for (j=0; j<productdata.product.variants.length; j++){
                            if (productdata.product.variants[j].id==item.variant_id){
                              if (productdata.product.variants[j].inventory_quantity < lowquantity_indicator){
                                console.log("Item in LOW QTY");
                                message = String(docs[0].message_low_quantity);
                                message = message.replace("{{product.title}}", item.title)

                                
                                if (docs[0].notify_low_quantity){
                                  generalFuncs.push(req, res, pbtoken,message,  message, function(err, response){
                                      console.log("sent message");
                                      return res.send("OK");
                                  });
                                }else{
                                  return res.send("OK");
                                }
                                // console.log("FOUND ! : "+productdata.product.variants[j].id+" = ");
                              }

                            }
                            res.send("OK");
                          }
                     });

                  });

                      // res.send("OK")
                });//End webhookresponse save

            }


           // }else{
           //    return res.send("OK");
           // }
            
          }  //End If docs
          else{
            res.send("OK");
          }
      });
  })
}
}