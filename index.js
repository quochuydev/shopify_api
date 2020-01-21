const request = require('request');
const querystring = require('querystring');
let config = {};

class ShopifyApi {
  constructor({ client_id, client_secret, shopify_host }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.shopify_host = shopify_host;
  }

  buildLink({ app_host, callback_path }) {
    let options = {}
    options.scopes = ['read_customers', 'write_customers', 'read_products', 'write_products', 'read_orders', 'write_orders'];
    const { scopes = [], accessMode } = options;

    const redirectParams = {
      state: 'nonce',
      scope: scopes.join(', '),
      client_id: this.client_id,
      redirect_uri: `${app_host}${callback_path}`,
    };
    if (accessMode === 'online') { redirectParams['grant_options[]'] = 'per-user'; }
    let query = querystring.stringify(redirectParams);
    let url = `${this.shopify_host}/admin/oauth/authorize?${query}`;
    return url;
  }

  getToken() {

  }

  call(f, p) {
    return new Promise((resolve, reject) => {
      try {
        let { method, url } = f;
        let { query, params, body } = p;
        url = `${this.shopify_host}/admin/${url}`;
        let options = {
          method, url,
          headers: {
            'X-Shopify-Access-Token': p.access_token
          }
        }
        if (body) {

        }

        if (params) {

        }

        if (query) {

        }

        request(options, (err, res, body) => {
          console.log(`[CALL] [${String(method).toUpperCase()}] ${url} - ${res.statusCode}`)
          if (err) { return reject(err); }
          let data = JSON.parse(body);
          resolve(data);
        });
      } catch (error) {
        console.log(error)
        reject(error);
      }
    })
  }
}

module.exports = ShopifyApi;