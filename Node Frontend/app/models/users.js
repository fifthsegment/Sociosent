var path = require('path');
var app = require(path.join(process.cwd(), 'app'));
var mongoose = require('mongoose');
var dburl = app.get('settings').database.connectionstring;
mongoose.connect(dburl);

var User = mongoose.Schema({
  shop_url: { 
  	type: String, required: true, trim: true 
  },
  access_token: {
  	type: String
  },
  webhook_identifier: {
  	type: String
  },
  pushbullet_channel: {
  	type: String
  },
  enable_notifications: {
  	type: Boolean,
  	default: "false"
  },
  notify_low_quantity:{
  	type: Boolean,
  	default: false
  },
  message_low_quantity:{
  	type: String,
  	default: "Product : {{product.title}} in low quantity",
  },
  message_add_product:{
  	type: String,
  	default: "{{product.title}} added to the store",
  },
  notify_new_order:{
  	type: Boolean,
  	default: false
  },
  notify_add_product:{
  	type:Boolean,
  	default:false
  },
  notify_new_order : {
	type:Boolean,
  	default:false
  },
  item_alert_quantity: {
  	type: Number,
  	default: 3
  },
  pushbullet_token: {
  	type: String
  },
  first_install:{
  	type: Boolean,
  	default: true
  },
  widget_client_html:{
  	type: String,
  	default: "<center><h2 style='position:relative; top:0.4em; color:white; font-weight: 900; line-height: 200%; text-shadow: 2px 2px 4px #000000;'>Notify me when this Product is availible <a href='{{product_url}}' onclick='' target='_blank' style='position:relative; top: -0.12em; border-radius:3px;-webkit-box-shadow:none;box-shadow:none;border:1px solid transparent;color:#fff;background-color:#384452;border-color:#384452;margin:4px;display:inline-block;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:normal;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent;border-radius:4px;border-radius: 3px;-webkit-box-shadow: none;box-shadow: none;border: 1px solid transparent;'>Notify Me</a></h2></center>",
  },
  page_client_html:{
  	type: String,
  	default : "",
  },
  store_name:{
  	type: String,
  	default : "",
  },
  dummy_token:{
  	type: String
  },
  widget_client_default:{
  	type: String,
  	default: "<center><h2 style='position:relative; top:0.4em; color:white; font-weight: 900; line-height: 200%; text-shadow: 2px 2px 4px #000000;'>Notify me when this Product is availible <a href='{{product_url}}' onclick='' target='_blank' style='position:relative; top: -0.12em; border-radius:3px;-webkit-box-shadow:none;box-shadow:none;border:1px solid transparent;color:#fff;background-color:#384452;border-color:#384452;margin:4px;display:inline-block;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:normal;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent;border-radius:4px;border-radius: 3px;-webkit-box-shadow: none;box-shadow: none;border: 1px solid transparent;'>Notify Me</a></h2></center>",
  },
}, { collection: 'users' });

var model = mongoose.model('User', User);
// var model = 'a';

module.exports = model;