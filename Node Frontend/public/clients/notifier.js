// Load jQuery library using plain JavaScript
(function(){
  var newscript = document.createElement('script');
     newscript.type = 'text/javascript';
     newscript.async = true;
     newscript.src = 'https://code.jquery.com/jquery-1.11.2.min.js';
  (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(newscript);
})();


var replTexthome = "<a href='/pages/notification-subscription'>Notify Me!</a>";
var replTextproduct = "<a href='/pages/notification-subscription'>Notify Me when Availible!</a>";

var products = document.getElementsByClassName("purchase");
for (i=0; i < products.length; i++) {
  console.log(products[i]);
  x =  products[i].innerHTML;
  if (x.toLowerCase().indexOf("sold out") >= 0){
  	products[i].innerHTML = replTextproduct;
  }
}

var products = document.getElementsByClassName("price");

for (i=0; i < products.length; i++) {
  console.log(products[i]);
  x =  products[i].innerHTML;
  if (x.toLowerCase().indexOf("sold out") >= 0){
  	f = x.toLowerCase().indexOf("sold out");
  	var res = x.substr(0, f);
  	products[i].innerHTML = res + replTextproduct;
  }
}

var jq = jQuery.noConflict();
console.log("Calling jquery");


jq(document).ready(function(){
	console.log("Jquery loaded");

		// v = jq( "link[itemprop='availability']" ).next("form").find("option[disabled]");

		c = jq( "link[itemprop='availability']" ).next("form").find(":contains('Sold Out')")
		// c.html('Yo Yo Yo');
		c.html(replTextproduct);


		d = jq( "div" ).find(":contains('Sold Out'):not(:has(*))");
		d.remove();


})



