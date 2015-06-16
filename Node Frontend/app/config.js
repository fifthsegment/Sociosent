module.exports = {
  name: 'Example',
  description: 'This domain is established to be used for illustrative examples in documents.',
  domain: 'shopifyaaap.herokuapp.com',
  url: 'http://shopifyaaap.herokuapp.com',
  env: 'development',
  port: 80,

  database: {
    domain: 'ds061671.mongolab.com',
    name: 'heroku_app35618264',
    connectionstring: 'mongodb://heroku_app35618264:j5tejjh71l3b748j3ubmf93dbs@ds061671.mongolab.com:61671/heroku_app35618264',
    mysql_host: '52.7.167.156',
    mysql_user: 'root',
    mysql_pass: 'letmein1213',
    mysql_port: '',
    mysql_db: 'newscraper_db'

  },
  development: {
    access_token:"d831f0fe0501ae016a49f60460b8cc71",
    shop : "developmentstore-3",
    pbtoken : "o.eDQLa6CDRXSSN2FqWTZg751RKVRBmiEf"
  },
  shopify: {
      api : '459eb99ded12ab8606ba269dc57c932d',
      creds : 'ad1de674cdc603f280475118eae0ac2c',
      redirect_uri : 'http://shopifyaaap.herokuapp.com/finish_auth',
      scope : 'write_products, read_content, write_content, read_script_tags, write_script_tags, read_orders, read_customers'
  },
  pushbullet: {
    pushbullet_appA_link: 'https://www.pushbullet.com/authorize?client_id=L9o3SzkRDxTf7leZKUjmH1mBFytM2oUz&redirect_uri=http%3A%2F%2Fshopifyaaap.herokuapp.com%2Fpushbullet_callback&response_type=code&scope=everything'
  }


}